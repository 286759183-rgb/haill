import { Controller, Get, Inject } from '@nestjs/common';
import { StoreService } from './store.service';

@Controller('health')
export class HealthController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  @Get()
  check() {
    return {
      ok: true,
      service: 'haill-backend',
      time: new Date().toISOString(),
      database: this.store.databaseStatus(),
    };
  }
}
