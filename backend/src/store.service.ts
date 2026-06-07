import { BadRequestException, Inject, Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import type { ResultSetHeader, RowDataPacket } from 'mysql2/promise';
import type { Answer, PurchaseDemand, Question, ReviewStatus, Supply, TeacherApplication, Tutorial, User } from './domain';
import { DatabaseService } from './database.service';

type IdRow = RowDataPacket & { id: number };
type CountRow = RowDataPacket & { total: number };

@Injectable()
export class StoreService implements OnModuleInit {
  private nextId = 1;
  users: User[] = [];
  tutorials: Tutorial[] = [];
  questions: Question[] = [];
  teacherApplications: TeacherApplication[] = [];
  supplies: Supply[] = [];
  purchaseDemands: PurchaseDemand[] = [];

  constructor(@Inject(DatabaseService) private readonly database: DatabaseService) {
    if (this.database.mode === 'memory') this.seedMemory();
  }

  async onModuleInit() {
    if (this.database.mode === 'mysql') await this.seedMysql();
  }

  databaseStatus() {
    return { mode: this.database.mode, ready: this.database.ready };
  }

  async dashboard() {
    if (this.database.mode === 'mysql') {
      const [tutorials, teacherApplications, supplies, purchaseDemands] = await Promise.all([
        this.database.query<CountRow[]>('SELECT COUNT(*) AS total FROM tutorials WHERE status = ?', ['pending']),
        this.database.query<CountRow[]>('SELECT COUNT(*) AS total FROM teacher_applications WHERE status = ?', ['pending']),
        this.database.query<CountRow[]>('SELECT COUNT(*) AS total FROM supplies WHERE status = ?', ['pending']),
        this.database.query<CountRow[]>('SELECT COUNT(*) AS total FROM purchase_demands WHERE status = ?', ['pending']),
      ]);
      return {
        pendingTutorials: Number(tutorials[0]?.total ?? 0),
        pendingTeacherApplications: Number(teacherApplications[0]?.total ?? 0),
        pendingSupplies: Number(supplies[0]?.total ?? 0),
        pendingPurchaseDemands: Number(purchaseDemands[0]?.total ?? 0),
        fraudWarning: '请勿提前支付保证金、押金、运费；高价收购、先打款、加微信等信息需重点审核。',
      };
    }
    return {
      pendingTutorials: this.tutorials.filter(x => x.status === 'pending').length,
      pendingTeacherApplications: this.teacherApplications.filter(x => x.status === 'pending').length,
      pendingSupplies: this.supplies.filter(x => x.status === 'pending').length,
      pendingPurchaseDemands: this.purchaseDemands.filter(x => x.status === 'pending').length,
      fraudWarning: '请勿提前支付保证金、押金、运费；高价收购、先打款、加微信等信息需重点审核。',
    };
  }

  private id() { return this.nextId++; }
  private now() { return new Date().toISOString(); }

  private seedMemory() {
    const admin = this.createUserMemory({ phone: '13800000000', nickname: '平台管理员', role: 'admin', region: '本地' });
    const farmer = this.createUserMemory({ phone: '13800000001', nickname: '示例农户', role: 'farmer', region: '河南周口' });
    const teacher = this.createUserMemory({ phone: '13800000002', nickname: '王老师', role: 'teacher', region: '河南' });
    const buyer = this.createUserMemory({ phone: '13800000003', nickname: '本地收购商', role: 'buyer', region: '河南' });
    this.tutorials.push({ id: this.id(), title: '番茄常见黄叶处理办法', category: '种植', cropOrBreed: '番茄', content: '先观察叶片位置，再排查缺肥、积水和病害。严重时建议请本地老师现场确认。', mediaUrl: '', authorId: teacher.id, status: 'approved', createdAt: this.now() });
    this.supplies.push({ id: this.id(), farmerId: farmer.id, productName: '散养土鸡', category: '养殖', quantity: 300, unit: '只', region: '河南周口', availableAt: '2026-07-01', description: '约3斤以上，可视频验货。', imageUrl: '', videoUrl: '', selfDeliveryPrice: 18, pickupPrice: 16, priceUnit: '元/斤', contactPhone: farmer.phone, status: 'approved', createdAt: this.now() });
    this.purchaseDemands.push({ id: this.id(), buyerId: buyer.id, productName: '西瓜', category: '水果', quantity: 20000, unit: '斤', region: '周边50公里', purchaseAt: '2026-06-30', qualityRequirement: '8斤以上，成熟度好', selfDeliveryPrice: 1.2, pickupPrice: 1.0, priceUnit: '元/斤', contactPhone: buyer.phone, status: 'approved', createdAt: this.now() });
    void admin;
  }

  private async seedMysql() {
    const rows = await this.database.query<CountRow[]>('SELECT COUNT(*) AS total FROM users');
    if (Number(rows[0]?.total ?? 0) > 0) return;
    const admin = await this.createUser({ phone: '13800000000', nickname: '平台管理员', role: 'admin', region: '本地' });
    const farmer = await this.createUser({ phone: '13800000001', nickname: '示例农户', role: 'farmer', region: '河南周口' });
    const teacher = await this.createUser({ phone: '13800000002', nickname: '王老师', role: 'teacher', region: '河南' });
    const buyer = await this.createUser({ phone: '13800000003', nickname: '本地收购商', role: 'buyer', region: '河南' });
    await this.createTutorial({ title: '番茄常见黄叶处理办法', category: '种植', cropOrBreed: '番茄', content: '先观察叶片位置，再排查缺肥、积水和病害。严重时建议请本地老师现场确认。', mediaUrl: '', authorId: teacher.id });
    await this.createSupply({ farmerId: farmer.id, productName: '散养土鸡', category: '养殖', quantity: 300, unit: '只', region: '河南周口', availableAt: '2026-07-01', description: '约3斤以上，可视频验货。', imageUrl: '', videoUrl: '', selfDeliveryPrice: 18, pickupPrice: 16, priceUnit: '元/斤', contactPhone: farmer.phone });
    await this.createPurchaseDemand({ buyerId: buyer.id, productName: '西瓜', category: '水果', quantity: 20000, unit: '斤', region: '周边50公里', purchaseAt: '2026-06-30', qualityRequirement: '8斤以上，成熟度好', selfDeliveryPrice: 1.2, pickupPrice: 1.0, priceUnit: '元/斤', contactPhone: buyer.phone });
    await this.review('tutorial', 1, 'approved');
    await this.review('supply', 1, 'approved');
    await this.review('purchaseDemand', 1, 'approved');
    void admin;
  }

  private toIso(value: unknown) {
    if (value instanceof Date) return value.toISOString();
    return String(value ?? this.now());
  }

  private mapUser(row: any): User {
    return { id: Number(row.id), phone: row.phone, nickname: row.nickname, role: row.role, region: row.region ?? undefined, status: row.status, createdAt: this.toIso(row.created_at) };
  }
  private mapTutorial(row: any): Tutorial {
    return { id: Number(row.id), title: row.title, category: row.category, cropOrBreed: row.crop_or_breed ?? undefined, content: row.content, mediaUrl: row.media_url ?? undefined, authorId: row.author_id ? Number(row.author_id) : undefined, status: row.status, createdAt: this.toIso(row.created_at) };
  }
  private mapSupply(row: any): Supply {
    return { id: Number(row.id), farmerId: Number(row.farmer_id), productName: row.product_name, category: row.category ?? undefined, quantity: Number(row.quantity), unit: row.unit, region: row.region, availableAt: row.available_at ? String(row.available_at).slice(0, 10) : undefined, description: row.description ?? undefined, imageUrl: row.image_url ?? undefined, videoUrl: row.video_url ?? undefined, selfDeliveryPrice: row.self_delivery_price == null ? undefined : Number(row.self_delivery_price), pickupPrice: row.pickup_price == null ? undefined : Number(row.pickup_price), priceUnit: row.price_unit ?? '元/斤', contactPhone: row.contact_phone ?? undefined, status: row.status, createdAt: this.toIso(row.created_at) };
  }
  private mapPurchaseDemand(row: any): PurchaseDemand {
    return { id: Number(row.id), buyerId: Number(row.buyer_id), productName: row.product_name, category: row.category ?? undefined, quantity: Number(row.quantity), unit: row.unit, region: row.region, purchaseAt: row.purchase_at ? String(row.purchase_at).slice(0, 10) : undefined, qualityRequirement: row.quality_requirement ?? undefined, selfDeliveryPrice: row.self_delivery_price == null ? undefined : Number(row.self_delivery_price), pickupPrice: row.pickup_price == null ? undefined : Number(row.pickup_price), priceUnit: row.price_unit ?? '元/斤', contactPhone: row.contact_phone ?? undefined, status: row.status, createdAt: this.toIso(row.created_at) };
  }
  private mapQuestion(row: any, answers: Answer[] = []): Question {
    return { id: Number(row.id), farmerId: Number(row.farmer_id), title: row.title, description: row.description, category: row.category ?? undefined, cropOrBreed: row.crop_or_breed ?? undefined, region: row.region ?? undefined, mediaUrl: row.media_url ?? undefined, status: row.status, answers, createdAt: this.toIso(row.created_at) };
  }
  private mapAnswer(row: any): Answer {
    return { id: Number(row.id), questionId: Number(row.question_id), teacherId: Number(row.teacher_id), content: row.content, mediaUrl: row.media_url ?? undefined, createdAt: this.toIso(row.created_at) };
  }
  private mapTeacherApplication(row: any): TeacherApplication {
    return { id: Number(row.id), userId: Number(row.user_id), realName: row.real_name, expertise: row.expertise, region: row.region ?? undefined, credentialUrl: row.credential_url ?? undefined, intro: row.intro ?? undefined, status: row.status, rejectReason: row.reject_reason ?? undefined, createdAt: this.toIso(row.created_at) };
  }

  private createUserMemory(input: Omit<User, 'id' | 'status' | 'createdAt'>): User {
    if (this.users.some(u => u.phone === input.phone)) throw new BadRequestException('手机号已存在');
    const user: User = { id: this.id(), status: 'active', createdAt: this.now(), ...input };
    this.users.push(user);
    return user;
  }

  async listUsers() {
    if (this.database.mode === 'mysql') {
      const rows = await this.database.query<RowDataPacket[]>('SELECT * FROM users ORDER BY id DESC');
      return rows.map((row: RowDataPacket) => this.mapUser(row));
    }
    return this.users;
  }

  async listTutorials(status: ReviewStatus = 'approved') {
    if (this.database.mode === 'mysql') {
      const rows = await this.database.query<RowDataPacket[]>('SELECT * FROM tutorials WHERE status = ? ORDER BY id DESC', [status]);
      return rows.map((row: RowDataPacket) => this.mapTutorial(row));
    }
    return this.tutorials.filter(item => item.status === status);
  }

  async findTutorial(id: number) {
    if (this.database.mode === 'mysql') {
      const rows = await this.database.query<RowDataPacket[]>('SELECT * FROM tutorials WHERE id = ?', [id]);
      return rows[0] ? this.mapTutorial(rows[0]) : undefined;
    }
    return this.tutorials.find(item => item.id === id);
  }

  async listQuestions() {
    if (this.database.mode === 'mysql') {
      const rows = await this.database.query<RowDataPacket[]>('SELECT * FROM questions ORDER BY id DESC');
      const answers = await this.database.query<RowDataPacket[]>('SELECT * FROM answers ORDER BY id ASC');
      const grouped = new Map<number, Answer[]>();
      for (const row of answers) {
        const answer = this.mapAnswer(row);
        grouped.set(answer.questionId, [...(grouped.get(answer.questionId) ?? []), answer]);
      }
      return rows.map((row: RowDataPacket) => this.mapQuestion(row, grouped.get(Number(row.id)) ?? []));
    }
    return this.questions;
  }

  async listTeacherApplications(status?: 'pending' | 'approved' | 'rejected') {
    if (this.database.mode === 'mysql') {
      const rows = await this.database.query<RowDataPacket[]>(status ? 'SELECT * FROM teacher_applications WHERE status = ? ORDER BY id DESC' : 'SELECT * FROM teacher_applications ORDER BY id DESC', status ? [status] : []);
      return rows.map((row: RowDataPacket) => this.mapTeacherApplication(row));
    }
    return status ? this.teacherApplications.filter(item => item.status === status) : this.teacherApplications;
  }

  async listSupplies(status: ReviewStatus = 'approved') {
    if (this.database.mode === 'mysql') {
      const rows = await this.database.query<RowDataPacket[]>('SELECT * FROM supplies WHERE status = ? ORDER BY id DESC', [status]);
      return rows.map((row: RowDataPacket) => this.mapSupply(row));
    }
    return this.supplies.filter(item => item.status === status);
  }

  async listPurchaseDemands(status: ReviewStatus | 'closed' = 'approved') {
    if (this.database.mode === 'mysql') {
      const rows = await this.database.query<RowDataPacket[]>('SELECT * FROM purchase_demands WHERE status = ? ORDER BY id DESC', [status]);
      return rows.map((row: RowDataPacket) => this.mapPurchaseDemand(row));
    }
    return this.purchaseDemands.filter(item => item.status === status);
  }

  async createUser(input: Omit<User, 'id' | 'status' | 'createdAt'>): Promise<User> {
    if (this.database.mode === 'memory') return this.createUserMemory(input);
    try {
      const result = await this.database.query<ResultSetHeader>('INSERT INTO users (phone, nickname, role, region) VALUES (?, ?, ?, ?)', [input.phone, input.nickname, input.role, input.region ?? null]);
      const rows = await this.database.query<RowDataPacket[]>('SELECT * FROM users WHERE id = ?', [result.insertId]);
      return this.mapUser(rows[0]);
    } catch (error: any) {
      if (error?.code === 'ER_DUP_ENTRY') throw new BadRequestException('手机号已存在');
      throw error;
    }
  }

  async createTutorial(input: Omit<Tutorial, 'id' | 'status' | 'createdAt'>): Promise<Tutorial> {
    if (this.database.mode === 'memory') {
      const item: Tutorial = { id: this.id(), status: 'pending', createdAt: this.now(), ...input };
      this.tutorials.push(item);
      return item;
    }
    const result = await this.database.query<ResultSetHeader>('INSERT INTO tutorials (title, category, crop_or_breed, content, media_url, author_id) VALUES (?, ?, ?, ?, ?, ?)', [input.title, input.category, input.cropOrBreed ?? null, input.content, input.mediaUrl ?? null, input.authorId ?? null]);
    const rows = await this.database.query<RowDataPacket[]>('SELECT * FROM tutorials WHERE id = ?', [result.insertId]);
    return this.mapTutorial(rows[0]);
  }

  async createQuestion(input: Omit<Question, 'id' | 'status' | 'answers' | 'createdAt'>): Promise<Question> {
    if (this.database.mode === 'memory') {
      const item: Question = { id: this.id(), status: 'pending', answers: [], createdAt: this.now(), ...input };
      this.questions.push(item);
      return item;
    }
    const result = await this.database.query<ResultSetHeader>('INSERT INTO questions (farmer_id, title, description, category, crop_or_breed, region, media_url) VALUES (?, ?, ?, ?, ?, ?, ?)', [input.farmerId, input.title, input.description, input.category ?? null, input.cropOrBreed ?? null, input.region ?? null, input.mediaUrl ?? null]);
    const rows = await this.database.query<RowDataPacket[]>('SELECT * FROM questions WHERE id = ?', [result.insertId]);
    return this.mapQuestion(rows[0], []);
  }

  async answerQuestion(questionId: number, input: Omit<Answer, 'id' | 'questionId' | 'createdAt'>): Promise<Answer> {
    if (this.database.mode === 'memory') {
      const question = this.questions.find(q => q.id === questionId);
      if (!question) throw new NotFoundException('问题不存在');
      const answer: Answer = { id: this.id(), questionId, createdAt: this.now(), ...input };
      question.answers.push(answer);
      question.status = 'answered';
      return answer;
    }
    const existing = await this.database.query<IdRow[]>('SELECT id FROM questions WHERE id = ?', [questionId]);
    if (!existing.length) throw new NotFoundException('问题不存在');
    const result = await this.database.query<ResultSetHeader>('INSERT INTO answers (question_id, teacher_id, content, media_url) VALUES (?, ?, ?, ?)', [questionId, input.teacherId, input.content, input.mediaUrl ?? null]);
    await this.database.query<ResultSetHeader>('UPDATE questions SET status = ? WHERE id = ?', ['answered', questionId]);
    const rows = await this.database.query<RowDataPacket[]>('SELECT * FROM answers WHERE id = ?', [result.insertId]);
    return this.mapAnswer(rows[0]);
  }

  async createTeacherApplication(input: Omit<TeacherApplication, 'id' | 'status' | 'createdAt'>): Promise<TeacherApplication> {
    if (this.database.mode === 'memory') {
      const item: TeacherApplication = { id: this.id(), status: 'pending', createdAt: this.now(), ...input };
      this.teacherApplications.push(item);
      return item;
    }
    const result = await this.database.query<ResultSetHeader>('INSERT INTO teacher_applications (user_id, real_name, expertise, region, credential_url, intro) VALUES (?, ?, ?, ?, ?, ?)', [input.userId, input.realName, input.expertise, input.region ?? null, input.credentialUrl ?? null, input.intro ?? null]);
    const rows = await this.database.query<RowDataPacket[]>('SELECT * FROM teacher_applications WHERE id = ?', [result.insertId]);
    return this.mapTeacherApplication(rows[0]);
  }

  async createSupply(input: Omit<Supply, 'id' | 'status' | 'createdAt' | 'priceUnit'> & { priceUnit?: string }): Promise<Supply> {
    if (this.database.mode === 'memory') {
      const item: Supply = { id: this.id(), status: 'pending', priceUnit: input.priceUnit ?? '元/斤', createdAt: this.now(), ...input };
      this.supplies.push(item);
      return item;
    }
    const result = await this.database.query<ResultSetHeader>('INSERT INTO supplies (farmer_id, product_name, category, quantity, unit, region, available_at, description, image_url, video_url, self_delivery_price, pickup_price, price_unit, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [input.farmerId, input.productName, input.category ?? null, input.quantity, input.unit, input.region, input.availableAt ?? null, input.description ?? null, input.imageUrl ?? null, input.videoUrl ?? null, input.selfDeliveryPrice ?? null, input.pickupPrice ?? null, input.priceUnit ?? '元/斤', input.contactPhone ?? null]);
    const rows = await this.database.query<RowDataPacket[]>('SELECT * FROM supplies WHERE id = ?', [result.insertId]);
    return this.mapSupply(rows[0]);
  }

  async createPurchaseDemand(input: Omit<PurchaseDemand, 'id' | 'status' | 'createdAt' | 'priceUnit'> & { priceUnit?: string }): Promise<PurchaseDemand> {
    if (this.database.mode === 'memory') {
      const item: PurchaseDemand = { id: this.id(), status: 'pending', priceUnit: input.priceUnit ?? '元/斤', createdAt: this.now(), ...input };
      this.purchaseDemands.push(item);
      return item;
    }
    const result = await this.database.query<ResultSetHeader>('INSERT INTO purchase_demands (buyer_id, product_name, category, quantity, unit, region, purchase_at, quality_requirement, self_delivery_price, pickup_price, price_unit, contact_phone) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)', [input.buyerId, input.productName, input.category ?? null, input.quantity, input.unit, input.region, input.purchaseAt ?? null, input.qualityRequirement ?? null, input.selfDeliveryPrice ?? null, input.pickupPrice ?? null, input.priceUnit ?? '元/斤', input.contactPhone ?? null]);
    const rows = await this.database.query<RowDataPacket[]>('SELECT * FROM purchase_demands WHERE id = ?', [result.insertId]);
    return this.mapPurchaseDemand(rows[0]);
  }

  async review(targetType: string, targetId: number, status: ReviewStatus) {
    if (this.database.mode === 'memory') {
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

    const tableMap: Record<string, { table: string; mapper: (row: any) => unknown }> = {
      tutorial: { table: 'tutorials', mapper: row => this.mapTutorial(row) },
      teacherApplication: { table: 'teacher_applications', mapper: row => this.mapTeacherApplication(row) },
      supply: { table: 'supplies', mapper: row => this.mapSupply(row) },
      purchaseDemand: { table: 'purchase_demands', mapper: row => this.mapPurchaseDemand(row) },
      question: { table: 'questions', mapper: row => this.mapQuestion(row, []) },
    };
    const target = tableMap[targetType];
    if (!target) throw new BadRequestException('不支持的审核对象');
    const result = await this.database.query<ResultSetHeader>(`UPDATE ${target.table} SET status = ? WHERE id = ?`, [status, targetId]);
    if (result.affectedRows === 0) throw new NotFoundException('审核对象不存在');
    await this.database.query<ResultSetHeader>('INSERT INTO review_logs (target_type, target_id, action) VALUES (?, ?, ?)', [targetType, targetId, status]);
    const rows = await this.database.query<RowDataPacket[]>(`SELECT * FROM ${target.table} WHERE id = ?`, [targetId]);
    return target.mapper(rows[0]);
  }
}
