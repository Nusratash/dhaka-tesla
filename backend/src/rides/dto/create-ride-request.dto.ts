import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateRideRequestDto {
  @IsString()
  pickupZone: string;

  @IsString()
  destinationZone: string;

  @IsInt()
  @Min(1)
  @Max(3)
  seatsRequested: number;
}
