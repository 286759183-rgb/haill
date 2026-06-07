import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import type { Answer, PurchaseDemand, Question, ReviewStatus, Supply, TeacherApplication, Tutorial, User } from './domain';

@Injectable()
export class StoreService {
  private nextId = 1;
  users: User[] = [];
  tutorials: Tutorial[] = [];
  questions: Question[] = [];
  teacherApplications: TeacherApplication[] = [];
  supplies: Supply[] = [];
  purchaseDemands: PurchaseDemand[] = [];

  constructor() {
    this.seed();
  }

  private id() { return this.nextId++; }
  private now() { return new Date().toISOString(); }

  private seed() {
    const admin = this.createUser({ phone: '13800000000', nickname: '平台管理员', role: 'admin', region: '本地' });
    const farmer = this.createUser({ phone: '13800000001', nickname: '示例农户', role: 'farmer', region: '河南周口' });
    const teacher = this.createUser({ phone: '13800000002', nickname: '王老师', role: 'teacher', region: '河南' });
    const buyer = this.createUser({ phone: '13800000003', nickname: '本地收购商', role: 'buyer', region: '河南' });
    this.tutorials.push({ id: this.id(), title: '番茄常见黄叶处理办法', category: '种植', cropOrBreed: '番茄', content: '先观察叶片位置，再排查缺肥、积水和病害。严重时建议请本地老师现场确认。', mediaUrl: '', authorId: teacher.id, status: 'approved', createdAt: this.now() });
    this.supplies.push({ id: this.id(), farmerId: farmer.id, productName: '散养土鸡', category: '养殖', quantity: 300, unit: '只', region: '河南周口', availableAt: '2026-07-01', description: '约3斤以上，可视频验货。', imageUrl: '', videoUrl: '', selfDeliveryPrice: 18, pickupPrice: 16, priceUnit: '元/斤', contactPhone: farmer.phone, status: 'approved', createdAt: this.now() });
    this.purchaseDemands.push({ id: this.id(), buyerId: buyer.id, productName: '西瓜', category: '水果', quantity: 20000, unit: '斤', region: '周边50公里', purchaseAt: '2026-06-30', qualityRequirement: '8斤以上，成熟度好', selfDeliveryPrice: 1.2, pickupPrice: 1.0, priceUnit: '元/斤', contactPhone: buyer.phone, status: 'approved', createdAt: this.now() });
    void admin;
  }

  createUser(input: Omit<User, 'id' | 'status' | 'createdAt'>): User {
    if (this.users.some(u => u.phone === input.phone)) throw new BadRequestException('手机号已存在');
    const user: User = { id: this.id(), status: 'active', createdAt: this.now(), ...input };
    this.users.push(user);
    return user;
  }

  createTutorial(input: Omit<Tutorial, 'id' | 'status' | 'createdAt'>): Tutorial {
    const item: Tutorial = { id: this.id(), status: 'pending', createdAt: this.now(), ...input };
    this.tutorials.push(item);
    return item;
  }

  createQuestion(input: Omit<Question, 'id' | 'status' | 'answers' | 'createdAt'>): Question {
    const item: Question = { id: this.id(), status: 'pending', answers: [], createdAt: this.now(), ...input };
    this.questions.push(item);
    return item;
  }

  answerQuestion(questionId: number, input: Omit<Answer, 'id' | 'questionId' | 'createdAt'>): Answer {
    const question = this.questions.find(q => q.id === questionId);
    if (!question) throw new NotFoundException('问题不存在');
    const answer: Answer = { id: this.id(), questionId, createdAt: this.now(), ...input };
    question.answers.push(answer);
    question.status = 'answered';
    return answer;
  }

  createTeacherApplication(input: Omit<TeacherApplication, 'id' | 'status' | 'createdAt'>): TeacherApplication {
    const item: TeacherApplication = { id: this.id(), status: 'pending', createdAt: this.now(), ...input };
    this.teacherApplications.push(item);
    return item;
  }

  createSupply(input: Omit<Supply, 'id' | 'status' | 'createdAt' | 'priceUnit'> & { priceUnit?: string }): Supply {
    const item: Supply = { id: this.id(), status: 'pending', priceUnit: input.priceUnit ?? '元/斤', createdAt: this.now(), ...input };
    this.supplies.push(item);
    return item;
  }

  createPurchaseDemand(input: Omit<PurchaseDemand, 'id' | 'status' | 'createdAt' | 'priceUnit'> & { priceUnit?: string }): PurchaseDemand {
    const item: PurchaseDemand = { id: this.id(), status: 'pending', priceUnit: input.priceUnit ?? '元/斤', createdAt: this.now(), ...input };
    this.purchaseDemands.push(item);
    return item;
  }

  review(targetType: string, targetId: number, status: ReviewStatus) {
    const collections: Record<string, Array<{ id: number; status: string }>> = {
      tutorial: this.tutorials,
      teacherApplication: this.teacherApplications,
      supply: this.supplies,
      purchaseDemand: this.purchaseDemands,
      question: this.questions,
    };
    const list = collections[targetType];
    if (!list) throw new BadRequestException('不支持的审核对象');
    const item = list.find(x => x.id === targetId);
    if (!item) throw new NotFoundException('审核对象不存在');
    item.status = status;
    return item;
  }
}
