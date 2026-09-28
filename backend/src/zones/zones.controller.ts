import { Controller, Get } from '@nestjs/common';
import { DHAKA_ZONES } from './zones.data';

@Controller('zones')
export class ZonesController {
  @Get()
  list() {
    return DHAKA_ZONES;
  }
}
