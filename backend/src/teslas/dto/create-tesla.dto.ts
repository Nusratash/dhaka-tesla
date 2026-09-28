import { IsInt, IsString, Max, Min } from 'class-validator';

export class CreateTeslaDto {
  @IsString()
  nickname: string;

  @IsString()
  plateNumber: string;

  @IsInt()
  @Min(1)
  @Max(6)
  seatCapacity: number;
}
