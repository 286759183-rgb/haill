import { Body, Controller, Inject, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { ReviewDto } from './dto';
import { StoreService } from './store.service';

@Controller('admin')
export class AdminController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  @Get('dashboard')
  dashboard() {
    return {
      pendingTutorials: this.store.tutorials.filter(x => x.status === 'pending').length,
      pendingTeacherApplications: this.store.teacherApplications.filter(x => x.status === 'pending').length,
      pendingSupplies: this.store.supplies.filter(x => x.status === 'pending').length,
      pendingPurchaseDemands: this.store.purchaseDemands.filter(x => x.status === 'pending').length,
      fraudWarning: '请勿提前支付保证金、押金、运费；高价收购、先打款、加微信等信息需重点审核。',
    };
  }

  @Post('review/:targetType/:id')
  review(@Param('targetType') targetType: string, @Param('id', ParseIntPipe) id: number, @Body() dto: ReviewDto) {
    return this.store.review(targetType, id, dto.action);
  }
}
