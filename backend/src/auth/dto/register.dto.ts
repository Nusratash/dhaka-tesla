import { IsEmail, IsEnum, IsPhoneNumber, MinLength } from 'class-validator';
import { UserRole } from '../../common/enums/ride-status.enum';

export class RegisterDto {
  @IsEmail()
  email: string;

  @MinLength(8)
  password: string;

  @MinLength(2)
  fullName: string;

  @IsPhoneNumber('BD')
  phone: string;

  @IsEnum(UserRole)
  role: UserRole;
}
