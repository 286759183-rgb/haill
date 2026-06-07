import { Body, Controller, Inject, Get, Param, ParseIntPipe, Post, UseGuards } from '@nestjs/common';
import { ReviewDto } from './dto';
import { StoreService } from './store.service';
import { AuthGuard } from './auth.guard';
import { Roles } from './roles.decorator';

@Controller('admin')
@UseGuards(AuthGuard)
@Roles('admin')
export class AdminController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  @Get('dashboard')
  dashboard() {
    return this.store.dashboard();
  }

  @Post('review/:targetType/:id')
  review(@Param('targetType') targetType: string, @Param('id', ParseIntPipe) id: number, @Body() dto: ReviewDto) {
    return this.store.review(targetType, id, dto.action);
  }
}
