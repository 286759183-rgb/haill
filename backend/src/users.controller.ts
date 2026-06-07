import { Body, Controller, Inject, Get, Post } from '@nestjs/common';
import { CreateUserDto } from './dto';
import { StoreService } from './store.service';

@Controller('users')
export class UsersController {
  constructor(@Inject(StoreService) private readonly store: StoreService) {}

  @Get()
  list() { return this.store.listUsers(); }

  @Post()
  create(@Body() dto: CreateUserDto) { return this.store.createUser(dto); }
}
