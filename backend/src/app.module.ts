import { Module } from '@nestjs/common';
import { HealthController } from './health.controller';
import { StoreService } from './store.service';
import { DatabaseService } from './database.service';
import { UsersController } from './users.controller';
import { TutorialsController } from './tutorials.controller';
import { QuestionsController } from './questions.controller';
import { TeacherApplicationsController } from './teacher-applications.controller';
import { SuppliesController } from './supplies.controller';
import { PurchaseDemandsController } from './purchase-demands.controller';
import { AdminController } from './admin.controller';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthGuard } from './auth.guard';

@Module({
  imports: [],
  controllers: [
    HealthController,
    UsersController,
    TutorialsController,
    QuestionsController,
    TeacherApplicationsController,
    SuppliesController,
    PurchaseDemandsController,
    AdminController,
    AuthController,
  ],
  providers: [DatabaseService, StoreService, AuthService, AuthGuard],
})
export class AppModule {}
