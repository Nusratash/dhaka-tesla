import { Body, Controller, Get, Param, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/ride-status.enum';
import { RidesService } from './rides.service';
import { CreateRideRequestDto } from './dto/create-ride-request.dto';
import { UpdateStatusDto } from './dto/update-status.dto';

@Controller()
@UseGuards(JwtAuthGuard, RolesGuard)
export class RidesController {
  constructor(private ridesService: RidesService) {}

  // --- Passenger endpoints ---
  @Post('rides')
  @Roles(UserRole.PASSENGER)
  request(@CurrentUser() user: { userId: string }, @Body() dto: CreateRideRequestDto) {
    return this.ridesService.createRequest(user.userId, dto);
  }

  @Get('rides/mine')
  @Roles(UserRole.PASSENGER)
  mine(@CurrentUser() user: { userId: string }) {
    return this.ridesService.myRequests(user.userId);
  }

  @Get('rides/:id')
  @Roles(UserRole.PASSENGER)
  one(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.ridesService.getRequestForPassenger(user.userId, id);
  }

  @Patch('rides/:id/cancel')
  @Roles(UserRole.PASSENGER)
  cancel(@CurrentUser() user: { userId: string }, @Param('id') id: string) {
    return this.ridesService.cancelRequest(user.userId, id);
  }

  // --- Driver endpoints (operate on the Pool, which cascades to requests) ---
  @Get('pools/mine')
  @Roles(UserRole.DRIVER)
  myPools(@CurrentUser() user: { userId: string }) {
    return this.ridesService.myPools(user.userId);
  }

  @Patch('pools/:id/status')
  @Roles(UserRole.DRIVER)
  updateStatus(
    @CurrentUser() user: { userId: string },
    @Param('id') id: string,
    @Body() dto: UpdateStatusDto,
  ) {
    return this.ridesService.transitionPool(id, user.userId, dto.status);
  }
}
