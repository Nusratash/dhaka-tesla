import { Body, Controller, Get, Patch, Post, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../common/decorators/roles.decorator';
import { CurrentUser } from '../common/decorators/current-user.decorator';
import { UserRole } from '../common/enums/ride-status.enum';
import { TeslasService } from './teslas.service';
import { CreateTeslaDto } from './dto/create-tesla.dto';

@Controller('teslas')
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles(UserRole.DRIVER)
export class TeslasController {
  constructor(private teslasService: TeslasService) {}

  @Post()
  register(@CurrentUser() user: { userId: string }, @Body() dto: CreateTeslaDto) {
    return this.teslasService.registerTesla(user.userId, dto);
  }

  @Get('mine')
  mine(@CurrentUser() user: { userId: string }) {
    return this.teslasService.myTesla(user.userId);
  }

  @Patch('online')
  setOnline(@CurrentUser() user: { userId: string }, @Body('online') online: boolean) {
    return this.teslasService.goOnline(user.userId, online);
  }
}
