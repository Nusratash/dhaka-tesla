import { Controller, Get, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UsersService } from './users.service';

@Controller('users')
@UseGuards(JwtAuthGuard)
export class UsersController {
  constructor(private usersService: UsersService) {}

  // Returns only the caller's own profile - never accepts an :id param -
  // so a user can never fetch someone else's wallet/profile by guessing a UUID.
  @Get('me')
  me(@CurrentUser() user: { userId: string }) {
    return this.usersService.findById(user.userId);
  }
}
