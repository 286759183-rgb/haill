import { Body, Controller, Inject, Get, Post } from '@nestjs/common';
import { CreateTeacherApplicationDto } from './dto';
import { StoreService } from './store.service';

@Controller('teacher-applications')
export class TeacherApplicationsController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  @Get()
  list() { return this.store.teacherApplications; }

  @Post()
  create(@Body() dto: CreateTeacherApplicationDto) { return this.store.createTeacherApplication(dto); }
}
