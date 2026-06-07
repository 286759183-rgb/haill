<template>
  <main class="page">
    <section class="hero">
      <div>
        <p class="eyebrow">haill 农业服务平台</p>
        <h1>学技术、问老师、卖货源、找收购</h1>
        <p class="summary">第一版已经接入真实后端接口：用户可注册登录、发布问题、发布货源，并浏览教程、货源和收购需求。</p>
      </div>
      <div class="status-card">
        <span :class="['dot', apiOnline ? 'ok' : 'bad']"></span>
        <strong>{{ apiOnline ? '接口正常' : '接口未连接' }}</strong>
        <small>{{ apiMessage }}</small>
      </div>
    </section>

    <section class="warning">
      防诈骗提醒：不要提前支付保证金、押金、运费；不要脱离平台私下转账；高价收购、先打款、加微信等信息要谨慎。
    </section>

    <section class="panel auth-panel">
      <div>
        <h2>{{ currentUser ? '当前登录' : '农户快速注册/登录' }}</h2>
        <p v-if="currentUser" class="muted">{{ currentUser.nickname }} · {{ roleText[currentUser.role] }} · {{ currentUser.region || '未填写地区' }}</p>
        <p v-else class="muted">先注册或登录，后续发布问题和货源会自动带上用户身份。</p>
      </div>
      <form class="form-grid" @submit.prevent="currentUser ? logout() : login()">
        <label>手机号<input v-model="authForm.phone" placeholder="13900000001" /></label>
        <label>密码<input v-model="authForm.password" type="password" placeholder="至少6位" /></label>
        <label>昵称<input v-model="authForm.nickname" placeholder="李农户" /></label>
        <label>角色
          <select v-model="authForm.role">
            <option value="farmer">农户</option>
            <option value="teacher">老师</option>
            <option value="buyer">收购商</option>
          </select>
        </label>
        <label>地区<input v-model="authForm.region" placeholder="山东寿光" /></label>
        <div class="form-actions">
          <button type="button" @click="register" :disabled="loading">注册</button>
          <button type="submit" :disabled="loading">{{ currentUser ? '退出登录' : '登录' }}</button>
        </div>
      </form>
    </section>

    <section class="two-columns">
      <article class="panel">
        <h2>发布问题求助</h2>
        <form class="stack" @submit.prevent="submitQuestion">
          <input v-model="questionForm.title" placeholder="例如：辣椒叶子卷起来" />
          <textarea v-model="questionForm.description" placeholder="把症状、出现时间、用药/施肥情况写清楚"></textarea>
          <div class="inline">
            <input v-model="questionForm.category" placeholder="种植/养殖" />
            <input v-model="questionForm.cropOrBreed" placeholder="作物/品种" />
          </div>
          <input v-model="questionForm.mediaUrl" placeholder="图片或视频链接，可选" />
          <button :disabled="!currentUser || loading">提交问题</button>
          <small v-if="!currentUser" class="hint">请先登录农户账号。</small>
        </form>
      </article>

      <article class="panel">
        <h2>发布农户货源</h2>
        <form class="stack" @submit.prevent="submitSupply">
          <input v-model="supplyForm.productName" placeholder="产品名，例如：黄桃" />
          <div class="inline">
            <input v-model.number="supplyForm.quantity" type="number" min="0" step="0.01" placeholder="数量" />
            <input v-model="supplyForm.unit" placeholder="单位：斤/只/吨" />
          </div>
          <input v-model="supplyForm.region" placeholder="地区，例如：安徽砀山" />
          <div class="inline">
            <input v-model.number="supplyForm.selfDeliveryPrice" type="number" min="0" step="0.01" placeholder="自送价" />
            <input v-model.number="supplyForm.pickupPrice" type="number" min="0" step="0.01" placeholder="上门收购价" />
          </div>
          <input v-model="supplyForm.videoUrl" placeholder="视频验货链接，可选" />
          <textarea v-model="supplyForm.description" placeholder="补充说明：规格、成熟度、可发货时间等"></textarea>
          <button :disabled="!currentUser || loading">提交货源审核</button>
          <small v-if="!currentUser" class="hint">请先登录农户账号。</small>
        </form>
      </article>
    </section>

    <p v-if="notice" class="notice">{{ notice }}</p>
    <p v-if="error" class="error">{{ error }}</p>

    <section class="grid">
      <article class="card">
        <div class="section-title"><h2>技术教程</h2><button @click="loadData">刷新</button></div>
        <div v-if="tutorials.length === 0" class="empty">暂无已审核教程</div>
        <div v-for="item in tutorials" :key="item.id" class="list-item">
          <strong>{{ item.title }}</strong>
          <p>{{ item.category }} · {{ item.cropOrBreed || '通用' }}</p>
          <small>{{ item.content }}</small>
        </div>
      </article>

      <article class="card">
        <div class="section-title"><h2>最新求助</h2><button @click="loadData">刷新</button></div>
        <div v-if="questions.length === 0" class="empty">暂无问题</div>
        <div v-for="item in questions" :key="item.id" class="list-item">
          <strong>{{ item.title }}</strong>
          <p>{{ item.region || '未知地区' }} · {{ item.cropOrBreed || item.category || '未分类' }}</p>
          <small>{{ item.description }}</small>
        </div>
      </article>

      <article class="card">
        <div class="section-title"><h2>农户货源</h2><button @click="loadData">刷新</button></div>
        <div v-if="supplies.length === 0" class="empty">暂无已审核货源</div>
        <div v-for="item in supplies" :key="item.id" class="list-item">
          <strong>{{ item.productName }} · {{ item.quantity }}{{ item.unit }}</strong>
          <p>{{ item.region }} · 自送 {{ item.selfDeliveryPrice ?? '-' }} / 上门 {{ item.pickupPrice ?? '-' }} {{ item.priceUnit }}</p>
          <small>{{ item.description || '可联系农户视频验货' }}</small>
        </div>
      </article>

      <article class="card">
        <div class="section-title"><h2>收购需求</h2><button @click="loadData">刷新</button></div>
        <div v-if="demands.length === 0" class="empty">暂无已审核收购需求</div>
        <div v-for="item in demands" :key="item.id" class="list-item">
          <strong>{{ item.productName }} · {{ item.quantity }}{{ item.unit }}</strong>
          <p>{{ item.region }} · 自送 {{ item.selfDeliveryPrice ?? '-' }} / 上门 {{ item.pickupPrice ?? '-' }} {{ item.priceUnit }}</p>
          <small>{{ item.qualityRequirement || '联系收购方确认规格' }}</small>
        </div>
      </article>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, onMounted, reactive, ref } from 'vue';

type Role = 'farmer' | 'teacher' | 'buyer' | 'admin';
interface User { id: number; phone: string; nickname: string; role: Role; region?: string }
interface Tutorial { id: number; title: string; category: string; cropOrBreed?: string; content: string }
interface Question { id: number; title: string; description: string; category?: string; cropOrBreed?: string; region?: string }
interface Supply { id: number; productName: string; quantity: number; unit: string; region: string; description?: string; selfDeliveryPrice?: number; pickupPrice?: number; priceUnit: string }
interface Demand { id: number; productName: string; quantity: number; unit: string; region: string; qualityRequirement?: string; selfDeliveryPrice?: number; pickupPrice?: number; priceUnit: string }

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const roleText: Record<Role, string> = { farmer: '农户', teacher: '老师', buyer: '收购商', admin: '管理员' };

const loading = ref(false);
const apiOnline = ref(false);
const apiMessage = ref('正在检查后端接口');
const notice = ref('');
const error = ref('');
const token = ref(localStorage.getItem('haill_web_token') || '');
const currentUser = ref<User | null>(JSON.parse(localStorage.getItem('haill_web_user') || 'null') as User | null);

const authForm = reactive({ phone: '13900000001', password: 'abc123456', nickname: '李农户', role: 'farmer' as Role, region: '山东寿光' });
const questionForm = reactive({ title: '', description: '', category: '种植', cropOrBreed: '', mediaUrl: '' });
const supplyForm = reactive({ productName: '', quantity: undefined as number | undefined, unit: '斤', region: '', selfDeliveryPrice: undefined as number | undefined, pickupPrice: undefined as number | undefined, videoUrl: '', description: '' });

const tutorials = ref<Tutorial[]>([]);
const questions = ref<Question[]>([]);
const supplies = ref<Supply[]>([]);
const demands = ref<Demand[]>([]);

const authHeaders = computed<Record<string, string>>(() => {
  const headers: Record<string, string> = {};
  if (token.value) headers.Authorization = `Bearer ${token.value}`;
  return headers;
});

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...authHeaders.value };
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> | undefined) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `请求失败：${response.status}`);
  return data as T;
}

function saveSession(data: { user: User; accessToken: string }) {
  currentUser.value = data.user;
  token.value = data.accessToken;
  localStorage.setItem('haill_web_user', JSON.stringify(data.user));
  localStorage.setItem('haill_web_token', data.accessToken);
}

function logout() {
  currentUser.value = null;
  token.value = '';
  localStorage.removeItem('haill_web_user');
  localStorage.removeItem('haill_web_token');
  notice.value = '已退出登录';
}

async function register() {
  await run(async () => {
    const data = await requestJson<{ user: User; accessToken: string }>('/auth/register', { method: 'POST', body: JSON.stringify(authForm) });
    saveSession(data);
    notice.value = '注册成功，可以发布问题和货源';
  });
}

async function login() {
  await run(async () => {
    const data = await requestJson<{ user: User; accessToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify({ phone: authForm.phone, password: authForm.password }) });
    saveSession(data);
    notice.value = '登录成功';
  });
}

async function submitQuestion() {
  if (!currentUser.value) return;
  await run(async () => {
    await requestJson<Question>('/questions', {
      method: 'POST',
      body: JSON.stringify({ ...questionForm, farmerId: currentUser.value!.id, region: currentUser.value!.region }),
    });
    Object.assign(questionForm, { title: '', description: '', category: '种植', cropOrBreed: '', mediaUrl: '' });
    notice.value = '问题已提交，等待老师回答';
    await loadData();
  });
}

async function submitSupply() {
  if (!currentUser.value) return;
  await run(async () => {
    await requestJson<Supply>('/supplies', {
      method: 'POST',
      body: JSON.stringify({ ...supplyForm, farmerId: currentUser.value!.id, contactPhone: currentUser.value!.phone, priceUnit: '元/斤' }),
    });
    Object.assign(supplyForm, { productName: '', quantity: undefined, unit: '斤', region: '', selfDeliveryPrice: undefined, pickupPrice: undefined, videoUrl: '', description: '' });
    notice.value = '货源已提交后台审核，审核通过后会展示';
    await loadData();
  });
}

async function loadData() {
  const [health, tutorialList, questionList, supplyList, demandList] = await Promise.all([
    requestJson<{ ok: boolean; database?: { mode: string } }>('/health'),
    requestJson<Tutorial[]>('/tutorials'),
    requestJson<Question[]>('/questions'),
    requestJson<Supply[]>('/supplies'),
    requestJson<Demand[]>('/purchase-demands'),
  ]);
  apiOnline.value = health.ok;
  apiMessage.value = `后端已连接 · ${health.database?.mode || 'unknown'} 模式`;
  tutorials.value = tutorialList;
  questions.value = questionList;
  supplies.value = supplyList;
  demands.value = demandList;
}

async function run(task: () => Promise<void>) {
  loading.value = true;
  error.value = '';
  notice.value = '';
  try {
    await task();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '操作失败';
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  run(loadData).catch(() => undefined);
});
</script>
