import { Body, Controller, Inject, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CreateTutorialDto } from './dto';
import { StoreService } from './store.service';

@Controller('tutorials')
export class TutorialsController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  @Get()
  list() { return this.store.tutorials.filter(item => item.status === 'approved'); }

  @Get('pending')
  pending() { return this.store.tutorials.filter(item => item.status === 'pending'); }

  @Get(':id')
  detail(@Param('id', ParseIntPipe) id: number) { return this.store.tutorials.find(item => item.id === id); }

  @Post()
  create(@Body() dto: CreateTutorialDto) { return this.store.createTutorial(dto); }
}
