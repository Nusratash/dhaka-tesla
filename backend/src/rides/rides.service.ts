import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectDataSource, InjectRepository } from '@nestjs/typeorm';
import { DataSource, In, Repository } from 'typeorm';
import { Pool } from './entities/pool.entity';
import { RideRequest } from './entities/ride-request.entity';
import { StatusHistory } from './entities/status-history.entity';
import { Tesla } from '../teslas/entities/tesla.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { User } from '../users/entities/user.entity';
import { Fare } from '../fares/entities/fare.entity';
import { CreateRideRequestDto } from './dto/create-ride-request.dto';
import { PoolingService } from './pooling.service';
import { FaresService } from '../fares/fares.service';
import { findZone, Zone } from '../zones/zones.data';
import { ALLOWED_TRANSITIONS, RideStatus } from '../common/enums/ride-status.enum';
import {
  CancellationNotAllowedException,
  InvalidStateTransitionException,
  SeatCapacityExceededException,
  UnauthorizedRideAccessException,
} from '../common/exceptions/domain-exceptions';
import { NotificationsService } from '../notifications/notifications.service';

@Injectable()
export class RidesService {
  constructor(
    @InjectDataSource() private dataSource: DataSource,
    @InjectRepository(Pool) private poolsRepo: Repository<Pool>,
    @InjectRepository(RideRequest) private requestsRepo: Repository<RideRequest>,
    @InjectRepository(Tesla) private teslasRepo: Repository<Tesla>,
    @InjectRepository(Driver) private driversRepo: Repository<Driver>,
    private poolingService: PoolingService,
    private faresService: FaresService,
    private notifications: NotificationsService,
  ) {}

  // --- Passenger: create a request, try to pool it, or open a new pool ---
  async createRequest(passengerId: string, dto: CreateRideRequestDto) {
    const pickup = findZone(dto.pickupZone);
    const destination = findZone(dto.destinationZone);
    if (!pickup || !destination) throw new BadRequestException('Unknown zone');

    // 1) Look for a joinable existing pool: not yet STARTED, same pickup
    //    zone corridor-compatible route, and enough free seats.
    const candidatePools = await this.poolsRepo.find({
      where: [{ status: RideStatus.REQUESTED }, { status: RideStatus.MATCHED }],
      relations: ['tesla', 'requests', 'requests.passenger'],
    });

    for (const pool of candidatePools) {
      const activeRequests = pool.requests.filter((r) => r.status !== RideStatus.CANCELLED);
      if (activeRequests.length === 0) continue;
      const compatible = this.poolingService.isCompatibleWithPool(
        { pickupZone: dto.pickupZone, destinationZone: dto.destinationZone },
        activeRequests,
      );
      if (!compatible) continue;

      const freeSeats = pool.tesla.seatCapacity - pool.seatsTaken;
      if (freeSeats < dto.seatsRequested) continue;

      // Found a compatible, spacious-enough pool: attempt the concurrency-safe join.
      return this.joinPool(pool.id, passengerId, dto, pickup, destination);
    }

    // 2) No joinable pool: open a brand new one on the first available
    //    online driver whose Tesla has enough capacity.
    const drivers = await this.driversRepo.find({ where: { isOnline: true }, relations: ['tesla'] });
    const availableDriver = drivers.find((d) => d.tesla && d.tesla.seatCapacity >= dto.seatsRequested);
    if (!availableDriver) {
      throw new BadRequestException('No available Tesla with enough seats right now. Try again shortly.');
    }

    return this.joinPool(null, passengerId, dto, pickup, destination, availableDriver.tesla.id);
  }

  // Core concurrency-safe seat claim. Everything that touches seatsTaken
  // happens inside one transaction with a pessimistic row lock on the Pool,
  // so two simultaneous claims (Nusrat + Shirin on the last seat) can never
  // both succeed past capacity - the second one re-reads the locked row
  // after the first commits and correctly sees it's full.
  private async joinPool(
    existingPoolId: string | null,
    passengerId: string,
    dto: CreateRideRequestDto,
    pickup: Zone,
    destination: Zone,
    newPoolTeslaId?: string,
  ) {
    return this.dataSource.transaction(async (manager) => {
      let pool: Pool;

      if (existingPoolId) {
        const existingPool = await manager.findOne(Pool, {
          where: { id: existingPoolId },
          relations: ['tesla', 'requests'],
          lock: { mode: 'pessimistic_write' },
        });
        if (!existingPool) throw new NotFoundException('Pool no longer exists');
        pool = existingPool;
      } else {
        const tesla = await manager.findOneOrFail(Tesla, { where: { id: newPoolTeslaId } });
        pool = manager.create(Pool, { tesla, status: RideStatus.REQUESTED, seatsTaken: 0 });
        pool = await manager.save(pool);
      }

      // Re-check capacity under the lock - this is the actual race guard.
      if (pool.seatsTaken + dto.seatsRequested > pool.tesla.seatCapacity) {
        throw new SeatCapacityExceededException(pool.tesla.id);
      }

      const passenger = await manager.findOneOrFail(User, { where: { id: passengerId } });

      const hasOthers = pool.seatsTaken > 0; // someone already aboard => this is a real pool
      const request = manager.create(RideRequest, {
        passenger,
        pickupZone: dto.pickupZone,
        destinationZone: dto.destinationZone,
        seatsRequested: dto.seatsRequested,
        pool,
        status: pool.status,
      });

      pool.seatsTaken += dto.seatsRequested;

      const breakdown = this.faresService.calculate(pickup, destination, hasOthers);
      const fare = manager.create(Fare, {
        baseFarePoysha: breakdown.baseFarePoysha,
        distanceChargePoysha: breakdown.distanceChargePoysha,
        poolDiscountPoysha: breakdown.poolDiscountPoysha,
        totalFarePoysha: breakdown.totalFarePoysha,
      });
      request.fare = fare;

      await manager.save(pool);
      const savedRequest = await manager.save(request);

      // Fairness: when a second rider joins, the first rider also gets the
      // pool discount (everyone in a shared Tesla is priced as pooled).
      if (hasOthers) {
        const others = (pool.requests ?? []).filter((r) => r.status !== RideStatus.CANCELLED);
        const fares = others.length
          ? await manager.find(Fare, { where: { rideRequest: { id: In(others.map((o) => o.id)) } }, relations: ['rideRequest'] })
          : [];
        for (const f of fares) {
          const o = others.find((x) => x.id === f.rideRequest.id)!;
          const b = this.faresService.calculate(findZone(o.pickupZone)!, findZone(o.destinationZone)!, true);
          Object.assign(f, b);
          await manager.save(f);
        }
      }

      await manager.save(
        manager.create(StatusHistory, {
          pool,
          fromStatus: null,
          toStatus: savedRequest.status,
          changedByUserId: passengerId,
        }),
      );

      this.notifications.notifyPoolUpdate(pool.id, 'seat-claimed');
      return savedRequest;
    });
  }

  async myRequests(passengerId: string) {
    return this.requestsRepo.find({
      where: { passenger: { id: passengerId } },
      relations: ['pool', 'pool.tesla', 'fare'],
      order: { createdAt: 'DESC' },
    });
  }

  async getRequestForPassenger(passengerId: string, requestId: string) {
    const request = await this.requestsRepo.findOne({
      where: { id: requestId },
      relations: ['pool', 'pool.tesla', 'fare', 'passenger'],
    });
    if (!request) throw new NotFoundException('Ride request not found');
    if (request.passenger.id !== passengerId) throw new UnauthorizedRideAccessException();
    return request;
  }

  // --- Driver: pools relevant to their Tesla ---
  async myPools(userId: string) {
    const driver = await this.driversRepo.findOne({ where: { user: { id: userId } }, relations: ['tesla'] });
    if (!driver?.tesla) throw new NotFoundException('No Tesla registered for this driver');

    return this.poolsRepo.find({
      where: { tesla: { id: driver.tesla.id } },
      relations: ['requests', 'requests.passenger', 'requests.fare', 'tesla'],
      order: { createdAt: 'DESC' },
    });
  }

  private async assertPoolBelongsToDriver(poolId: string, userId: string): Promise<Pool> {
    const driver = await this.driversRepo.findOne({ where: { user: { id: userId } }, relations: ['tesla'] });
    const pool = await this.poolsRepo.findOne({ where: { id: poolId }, relations: ['tesla', 'requests', 'requests.passenger'] });
    if (!pool) throw new NotFoundException('Pool not found');
    if (!driver?.tesla || pool.tesla.id !== driver.tesla.id) throw new UnauthorizedRideAccessException();
    return pool;
  }

  // --- Shared lifecycle transition, enforced server-side against the
  //     explicit ALLOWED_TRANSITIONS map. Applies to the whole pool and
  //     cascades to every non-cancelled request in it. ---
  async transitionPool(poolId: string, userId: string, next: RideStatus) {
    const pool = await this.assertPoolBelongsToDriver(poolId, userId);

    const allowed = ALLOWED_TRANSITIONS[pool.status];
    if (!allowed.includes(next)) {
      throw new InvalidStateTransitionException(pool.status, next);
    }

    const previous = pool.status;
    pool.status = next;
    await this.poolsRepo.save(pool);

    for (const request of pool.requests) {
      if (request.status !== RideStatus.CANCELLED) {
        request.status = next;
        await this.requestsRepo.save(request);
      }
    }

    await this.dataSource.getRepository(StatusHistory).save({
      pool,
      fromStatus: previous,
      toStatus: next,
      changedByUserId: userId,
    });

    this.notifications.notifyPoolUpdate(pool.id, next);
    if (next === RideStatus.COMPLETED) {
      for (const request of pool.requests) {
        if (request.status === RideStatus.COMPLETED) {
          this.notifications.sendRideCompletedEmail(request.passenger.email, pool.id).catch(() => undefined);
        }
      }
    }
    return pool;
  }

  // --- Passenger: cancel their own request only, while it's still valid ---
  async cancelRequest(passengerId: string, requestId: string) {
    return this.dataSource.transaction(async (manager) => {
      const request = await manager.findOne(RideRequest, {
        where: { id: requestId },
        relations: ['pool', 'pool.tesla', 'passenger'],
        lock: { mode: 'pessimistic_write' },
      });
      if (!request) throw new NotFoundException('Ride request not found');
      if (request.passenger.id !== passengerId) throw new UnauthorizedRideAccessException();

      const cancellableFrom: RideStatus[] = [RideStatus.REQUESTED, RideStatus.MATCHED, RideStatus.DRIVER_ARRIVED];
      if (!cancellableFrom.includes(request.status)) {
        throw new CancellationNotAllowedException(request.status);
      }

      const previousStatus = request.status;
      request.status = RideStatus.CANCELLED;
      await manager.save(request);

      const pool = await manager.findOne(Pool, {
        where: { id: request.pool!.id },
        lock: { mode: 'pessimistic_write' },
      });
      if (!pool) throw new NotFoundException('Pool not found');
      pool.seatsTaken = Math.max(0, pool.seatsTaken - request.seatsRequested);
      await manager.save(pool);

      await manager.save(StatusHistory, {
        pool,
        fromStatus: previousStatus,
        toStatus: RideStatus.CANCELLED,
        changedByUserId: passengerId,
      });

      this.notifications.notifyPoolUpdate(pool.id, 'seat-released');
      return request;
    });
  }
}
