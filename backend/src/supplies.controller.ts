import { Body, Controller, Inject, Get, Post } from '@nestjs/common';
import { CreateSupplyDto } from './dto';
import { StoreService } from './store.service';

@Controller('supplies')
export class SuppliesController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  @Get()
  list() { return this.store.listSupplies('approved'); }

  @Get('pending')
  pending() { return this.store.listSupplies('pending'); }

  @Post()
  create(@Body() dto: CreateSupplyDto) { return this.store.createSupply(dto); }
}
