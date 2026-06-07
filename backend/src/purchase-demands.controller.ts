import { Body, Controller, Inject, Get, Post } from '@nestjs/common';
import { CreatePurchaseDemandDto } from './dto';
import { StoreService } from './store.service';

@Controller('purchase-demands')
export class PurchaseDemandsController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  @Get()
  list() { return this.store.listPurchaseDemands('approved'); }

  @Get('pending')
  pending() { return this.store.listPurchaseDemands('pending'); }

  @Post()
  create(@Body() dto: CreatePurchaseDemandDto) { return this.store.createPurchaseDemand(dto); }
}
