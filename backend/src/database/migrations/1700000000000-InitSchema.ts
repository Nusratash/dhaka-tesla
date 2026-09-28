import { MigrationInterface, QueryRunner } from 'typeorm';

// Hand-written initial migration (synchronize is always false - see
// typeorm.config.ts) covering every entity in the app: users/wallets,
// drivers/teslas, pools/ride_requests/status_history, fares.
export class InitSchema1700000000000 implements MigrationInterface {
  name = 'InitSchema1700000000000';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`CREATE EXTENSION IF NOT EXISTS pgcrypto;`);

    await queryRunner.query(`CREATE TYPE "user_role_enum" AS ENUM ('passenger', 'driver');`);
    await queryRunner.query(
      `CREATE TYPE "ride_status_enum" AS ENUM ('REQUESTED','MATCHED','DRIVER_ARRIVED','STARTED','COMPLETED','CANCELLED');`,
    );

    await queryRunner.query(`
      CREATE TABLE "users" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "email" varchar NOT NULL UNIQUE,
        "passwordHash" varchar NOT NULL,
        "fullName" varchar NOT NULL,
        "phone" varchar NOT NULL,
        "role" user_role_enum NOT NULL,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "wallets" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "balancePoysha" bigint NOT NULL DEFAULT 0,
        "userId" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "teslas" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "nickname" varchar NOT NULL,
        "vehicleType" varchar NOT NULL DEFAULT 'three-wheeler',
        "plateNumber" varchar NOT NULL,
        "seatCapacity" int NOT NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "drivers" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "userId" uuid NOT NULL UNIQUE REFERENCES "users"("id") ON DELETE CASCADE,
        "isOnline" boolean NOT NULL DEFAULT false,
        "teslaId" uuid UNIQUE REFERENCES "teslas"("id") ON DELETE SET NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "pools" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "teslaId" uuid NOT NULL REFERENCES "teslas"("id"),
        "status" ride_status_enum NOT NULL DEFAULT 'REQUESTED',
        "seatsTaken" int NOT NULL DEFAULT 0,
        "version" int NOT NULL DEFAULT 1,
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_pools_status" ON "pools" ("status");`);
    await queryRunner.query(`CREATE INDEX "idx_pools_tesla" ON "pools" ("teslaId");`);

    await queryRunner.query(`
      CREATE TABLE "ride_requests" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "passengerId" uuid NOT NULL REFERENCES "users"("id"),
        "pickupZone" varchar NOT NULL,
        "destinationZone" varchar NOT NULL,
        "seatsRequested" int NOT NULL DEFAULT 1,
        "status" ride_status_enum NOT NULL DEFAULT 'REQUESTED',
        "poolId" uuid REFERENCES "pools"("id"),
        "createdAt" timestamptz NOT NULL DEFAULT now(),
        "updatedAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_requests_status" ON "ride_requests" ("status");`);
    await queryRunner.query(`CREATE INDEX "idx_requests_passenger" ON "ride_requests" ("passengerId");`);
    await queryRunner.query(`CREATE INDEX "idx_requests_pickup_zone" ON "ride_requests" ("pickupZone");`);

    await queryRunner.query(`
      CREATE TABLE "fares" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "rideRequestId" uuid NOT NULL UNIQUE REFERENCES "ride_requests"("id") ON DELETE CASCADE,
        "baseFarePoysha" bigint NOT NULL,
        "distanceChargePoysha" bigint NOT NULL,
        "poolDiscountPoysha" bigint NOT NULL DEFAULT 0,
        "totalFarePoysha" bigint NOT NULL
      );
    `);

    await queryRunner.query(`
      CREATE TABLE "status_history" (
        "id" uuid PRIMARY KEY DEFAULT gen_random_uuid(),
        "poolId" uuid NOT NULL REFERENCES "pools"("id") ON DELETE CASCADE,
        "fromStatus" ride_status_enum,
        "toStatus" ride_status_enum NOT NULL,
        "changedByUserId" uuid,
        "createdAt" timestamptz NOT NULL DEFAULT now()
      );
    `);
    await queryRunner.query(`CREATE INDEX "idx_status_history_pool" ON "status_history" ("poolId");`);
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`DROP TABLE IF EXISTS "status_history";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "fares";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "ride_requests";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "pools";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "drivers";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "teslas";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "wallets";`);
    await queryRunner.query(`DROP TABLE IF EXISTS "users";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "ride_status_enum";`);
    await queryRunner.query(`DROP TYPE IF EXISTS "user_role_enum";`);
  }
}
