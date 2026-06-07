import { Body, Controller, Inject, Get, NotFoundException, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CreateTutorialDto } from './dto';
import { StoreService } from './store.service';

@Controller('tutorials')
export class TutorialsController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  @Get()
  list() { return this.store.listTutorials('approved'); }

  @Get('pending')
  pending() { return this.store.listTutorials('pending'); }

  @Get(':id')
  async detail(@Param('id', ParseIntPipe) id: number) {
    const item = await this.store.findTutorial(id);
    if (!item) throw new NotFoundException('教程不存在');
    return item;
  }

  @Post()
  create(@Body() dto: CreateTutorialDto) { return this.store.createTutorial(dto); }
}
