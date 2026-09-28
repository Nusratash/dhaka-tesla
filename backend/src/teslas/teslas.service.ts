import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tesla } from './entities/tesla.entity';
import { Driver } from '../drivers/entities/driver.entity';
import { CreateTeslaDto } from './dto/create-tesla.dto';

@Injectable()
export class TeslasService {
  constructor(
    @InjectRepository(Tesla) private teslasRepo: Repository<Tesla>,
    @InjectRepository(Driver) private driversRepo: Repository<Driver>,
  ) {}

  async registerTesla(userId: string, dto: CreateTeslaDto) {
    const driver = await this.driversRepo.findOne({ where: { user: { id: userId } }, relations: ['tesla', 'user'] });
    if (!driver) throw new NotFoundException('Driver profile not found');
    if (driver.tesla) throw new ConflictException('This driver already owns a Tesla');

    const tesla = this.teslasRepo.create({ ...dto });
    const saved = await this.teslasRepo.save(tesla);

    driver.tesla = saved;
    await this.driversRepo.save(driver);
    return saved;
  }

  async goOnline(userId: string, online: boolean) {
    const driver = await this.driversRepo.findOne({ where: { user: { id: userId } }, relations: ['tesla', 'user'] });
    if (!driver) throw new NotFoundException('Driver profile not found');
    driver.isOnline = online;
    return this.driversRepo.save(driver);
  }

  async myTesla(userId: string) {
    const driver = await this.driversRepo.findOne({ where: { user: { id: userId } }, relations: ['tesla'] });
    if (!driver?.tesla) throw new NotFoundException('No Tesla registered for this driver');
    return driver.tesla;
  }
}
