import { IsIn, IsInt, IsNotEmpty, IsNumber, IsOptional, IsString, Min, MinLength } from 'class-validator';
import type { UserRole } from './domain';

export class CreateUserDto {
  @IsString() @IsNotEmpty() phone!: string;
  @IsString() @IsNotEmpty() nickname!: string;
  @IsIn(['farmer', 'teacher', 'buyer', 'admin']) role!: UserRole;
  @IsOptional() @IsString() region?: string;
}

export class CreateTutorialDto {
  @IsString() @IsNotEmpty() title!: string;
  @IsString() @IsNotEmpty() category!: string;
  @IsOptional() @IsString() cropOrBreed?: string;
  @IsString() @IsNotEmpty() content!: string;
  @IsOptional() @IsString() mediaUrl?: string;
  @IsOptional() @IsInt() authorId?: number;
}

export class CreateQuestionDto {
  @IsInt() farmerId!: number;
  @IsString() @IsNotEmpty() title!: string;
  @IsString() @IsNotEmpty() description!: string;
  @IsOptional() @IsString() category?: string;
  @IsOptional() @IsString() cropOrBreed?: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() mediaUrl?: string;
}

export class CreateAnswerDto {
  @IsInt() teacherId!: number;
  @IsString() @IsNotEmpty() content!: string;
  @IsOptional() @IsString() mediaUrl?: string;
}

export class CreateTeacherApplicationDto {
  @IsInt() userId!: number;
  @IsString() @IsNotEmpty() realName!: string;
  @IsString() @IsNotEmpty() expertise!: string;
  @IsOptional() @IsString() region?: string;
  @IsOptional() @IsString() credentialUrl?: string;
  @IsOptional() @IsString() intro?: string;
}

export class CreateSupplyDto {
  @IsInt() farmerId!: number;
  @IsString() @IsNotEmpty() productName!: string;
  @IsOptional() @IsString() category?: string;
  @IsNumber() @Min(0.01) quantity!: number;
  @IsString() @IsNotEmpty() unit!: string;
  @IsString() @IsNotEmpty() region!: string;
  @IsOptional() @IsString() availableAt?: string;
  @IsOptional() @IsString() description?: string;
  @IsOptional() @IsString() imageUrl?: string;
  @IsOptional() @IsString() videoUrl?: string;
  @IsOptional() @IsNumber() @Min(0) selfDeliveryPrice?: number;
  @IsOptional() @IsNumber() @Min(0) pickupPrice?: number;
  @IsOptional() @IsString() priceUnit?: string;
  @IsOptional() @IsString() contactPhone?: string;
}

export class CreatePurchaseDemandDto {
  @IsInt() buyerId!: number;
  @IsString() @IsNotEmpty() productName!: string;
  @IsOptional() @IsString() category?: string;
  @IsNumber() @Min(0.01) quantity!: number;
  @IsString() @IsNotEmpty() unit!: string;
  @IsString() @IsNotEmpty() region!: string;
  @IsOptional() @IsString() purchaseAt?: string;
  @IsOptional() @IsString() qualityRequirement?: string;
  @IsOptional() @IsNumber() @Min(0) selfDeliveryPrice?: number;
  @IsOptional() @IsNumber() @Min(0) pickupPrice?: number;
  @IsOptional() @IsString() priceUnit?: string;
  @IsOptional() @IsString() contactPhone?: string;
}

export class RegisterDto {
  @IsString() @IsNotEmpty() phone!: string;
  @IsString() @MinLength(6) password!: string;
  @IsString() @IsNotEmpty() nickname!: string;
  @IsIn(['farmer', 'teacher', 'buyer', 'admin']) role!: UserRole;
  @IsOptional() @IsString() region?: string;
}

export class LoginDto {
  @IsString() @IsNotEmpty() phone!: string;
  @IsString() @IsNotEmpty() password!: string;
}

export class ReviewDto {
  @IsIn(['approved', 'rejected', 'offline']) action!: 'approved' | 'rejected' | 'offline';
  @IsOptional() @IsString() reason?: string;
}
