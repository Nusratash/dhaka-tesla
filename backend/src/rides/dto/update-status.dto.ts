import { IsEnum } from 'class-validator';
import { RideStatus } from '../../common/enums/ride-status.enum';

export class UpdateStatusDto {
  @IsEnum(RideStatus)
  status: RideStatus;
}
