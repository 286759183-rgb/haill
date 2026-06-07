import { Body, Controller, Inject, Get, Param, ParseIntPipe, Post } from '@nestjs/common';
import { CreateAnswerDto, CreateQuestionDto } from './dto';
import { StoreService } from './store.service';

@Controller('questions')
export class QuestionsController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  @Get()
  list() { return this.store.questions.filter(item => item.status !== 'offline'); }

  @Post()
  create(@Body() dto: CreateQuestionDto) { return this.store.createQuestion(dto); }

  @Post(':id/answers')
  answer(@Param('id', ParseIntPipe) id: number, @Body() dto: CreateAnswerDto) {
    return this.store.answerQuestion(id, dto);
  }
}
