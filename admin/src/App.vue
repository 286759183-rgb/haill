<template>
  <main class="layout">
    <aside>
      <h1>haill 管理后台</h1>
      <p>农业平台 MVP 审核中心</p>
      <div class="api-state">
        <span :class="['dot', apiOnline ? 'ok' : 'bad']"></span>
        <strong>{{ apiOnline ? '接口正常' : '接口未连接' }}</strong>
        <small>{{ apiMessage }}</small>
      </div>
      <section class="login-card">
        <h2>管理员登录</h2>
        <form class="stack" @submit.prevent="login">
          <input v-model="loginForm.phone" placeholder="管理员手机号" />
          <input v-model="loginForm.password" type="password" placeholder="密码" />
          <button :disabled="loading">{{ currentUser ? '重新登录' : '登录后台' }}</button>
          <button v-if="currentUser" type="button" class="ghost" @click="logout">退出</button>
        </form>
        <p v-if="currentUser" class="small">当前：{{ currentUser.nickname }} · {{ currentUser.role }}</p>
      </section>
    </aside>

    <section class="content">
      <div class="topbar">
        <div>
          <h2>待办审核</h2>
          <p>重点拦截虚假老师、夸大教程、假货源、高价诱导和押金骗局。</p>
        </div>
        <button @click="loadAll" :disabled="!token || loading">刷新数据</button>
      </div>

      <p v-if="notice" class="notice">{{ notice }}</p>
      <p v-if="error" class="error">{{ error }}</p>

      <div class="stats">
        <article v-for="item in stats" :key="item.name">
          <span>{{ item.count }}</span>
          <p>{{ item.name }}</p>
        </article>
      </div>

      <section class="warning">
        {{ dashboard?.fraudWarning || '请勿提前支付保证金、押金、运费；高价收购、先打款、加微信等信息需重点审核。' }}
      </section>

      <section class="review-grid">
        <article class="panel">
          <div class="panel-head"><h2>待审教程</h2><small>{{ pendingTutorials.length }} 条</small></div>
          <EmptyList v-if="pendingTutorials.length === 0" />
          <div v-for="item in pendingTutorials" :key="item.id" class="review-item">
            <strong>{{ item.title }}</strong>
            <p>{{ item.category }} · {{ item.cropOrBreed || '通用' }}</p>
            <small>{{ item.content }}</small>
            <ReviewActions @approve="review('tutorial', item.id, 'approved')" @reject="review('tutorial', item.id, 'rejected')" />
          </div>
        </article>

        <article class="panel">
          <div class="panel-head"><h2>老师入驻</h2><small>{{ pendingTeachers.length }} 条</small></div>
          <EmptyList v-if="pendingTeachers.length === 0" />
          <div v-for="item in pendingTeachers" :key="item.id" class="review-item">
            <strong>{{ item.realName }} · {{ item.expertise }}</strong>
            <p>{{ item.region || '未填地区' }}</p>
            <small>{{ item.intro || '未填写简介' }}</small>
            <ReviewActions @approve="review('teacherApplication', item.id, 'approved')" @reject="review('teacherApplication', item.id, 'rejected')" />
          </div>
        </article>

        <article class="panel">
          <div class="panel-head"><h2>待审货源</h2><small>{{ pendingSupplies.length }} 条</small></div>
          <EmptyList v-if="pendingSupplies.length === 0" />
          <div v-for="item in pendingSupplies" :key="item.id" class="review-item">
            <strong>{{ item.productName }} · {{ item.quantity }}{{ item.unit }}</strong>
            <p>{{ item.region }} · 自送 {{ item.selfDeliveryPrice ?? '-' }} / 上门 {{ item.pickupPrice ?? '-' }} {{ item.priceUnit }}</p>
            <small>{{ item.description || '无补充说明' }}</small>
            <ReviewActions @approve="review('supply', item.id, 'approved')" @reject="review('supply', item.id, 'rejected')" />
          </div>
        </article>

        <article class="panel">
          <div class="panel-head"><h2>收购需求</h2><small>{{ pendingDemands.length }} 条</small></div>
          <EmptyList v-if="pendingDemands.length === 0" />
          <div v-for="item in pendingDemands" :key="item.id" class="review-item">
            <strong>{{ item.productName }} · {{ item.quantity }}{{ item.unit }}</strong>
            <p>{{ item.region }} · 自送 {{ item.selfDeliveryPrice ?? '-' }} / 上门 {{ item.pickupPrice ?? '-' }} {{ item.priceUnit }}</p>
            <small>{{ item.qualityRequirement || '未写质量要求' }}</small>
            <ReviewActions @approve="review('purchaseDemand', item.id, 'approved')" @reject="review('purchaseDemand', item.id, 'rejected')" />
          </div>
        </article>
      </section>

      <h2>审核重点</h2>
      <ul class="checklist">
        <li>老师入驻资料是否真实，是否有资质或从业经历。</li>
        <li>教程是否存在神药、稳赚、诱导购买等夸大内容。</li>
        <li>货源是否包含真实数量、地区、视频验货和两类价格。</li>
        <li>收购需求是否存在高价诱导、保证金、押金、先打款。</li>
      </ul>
    </section>
  </main>
</template>

<script setup lang="ts">
import { computed, defineComponent, h, onMounted, reactive, ref } from 'vue';

type ReviewAction = 'approved' | 'rejected' | 'offline';
interface User { id: number; phone: string; nickname: string; role: string }
interface Dashboard { pendingTutorials: number; pendingTeacherApplications: number; pendingSupplies: number; pendingPurchaseDemands: number; fraudWarning: string }
interface Tutorial { id: number; title: string; category: string; cropOrBreed?: string; content: string }
interface TeacherApplication { id: number; realName: string; expertise: string; region?: string; intro?: string }
interface Supply { id: number; productName: string; quantity: number; unit: string; region: string; description?: string; selfDeliveryPrice?: number; pickupPrice?: number; priceUnit: string }
interface Demand { id: number; productName: string; quantity: number; unit: string; region: string; qualityRequirement?: string; selfDeliveryPrice?: number; pickupPrice?: number; priceUnit: string }

const EmptyList = defineComponent({ setup: () => () => h('p', { class: 'empty' }, '暂无待审核内容') });
const ReviewActions = defineComponent({
  emits: ['approve', 'reject'],
  setup(_, { emit }) {
    return () => h('div', { class: 'actions' }, [
      h('button', { onClick: () => emit('approve') }, '通过'),
      h('button', { class: 'danger', onClick: () => emit('reject') }, '拒绝'),
    ]);
  },
});

const API_BASE = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001/api';
const loading = ref(false);
const apiOnline = ref(false);
const apiMessage = ref('正在检查后端接口');
const notice = ref('');
const error = ref('');
const token = ref(localStorage.getItem('haill_admin_token') || '');
const currentUser = ref<User | null>(JSON.parse(localStorage.getItem('haill_admin_user') || 'null') as User | null);
const loginForm = reactive({ phone: '13800000000', password: 'admin123456' });

const dashboard = ref<Dashboard | null>(null);
const pendingTutorials = ref<Tutorial[]>([]);
const pendingTeachers = ref<TeacherApplication[]>([]);
const pendingSupplies = ref<Supply[]>([]);
const pendingDemands = ref<Demand[]>([]);

const stats = computed(() => [
  { name: '老师审核', count: dashboard.value?.pendingTeacherApplications ?? pendingTeachers.value.length },
  { name: '教程审核', count: dashboard.value?.pendingTutorials ?? pendingTutorials.value.length },
  { name: '货源审核', count: dashboard.value?.pendingSupplies ?? pendingSupplies.value.length },
  { name: '收购需求审核', count: dashboard.value?.pendingPurchaseDemands ?? pendingDemands.value.length },
]);

async function requestJson<T>(path: string, options: RequestInit = {}): Promise<T> {
  const headers: Record<string, string> = { 'Content-Type': 'application/json', ...(token.value ? { Authorization: `Bearer ${token.value}` } : {}) };
  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: { ...headers, ...(options.headers as Record<string, string> | undefined) },
  });
  const data = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(data.message || `请求失败：${response.status}`);
  return data as T;
}

async function login() {
  await run(async () => {
    const data = await requestJson<{ user: User; accessToken: string }>('/auth/login', { method: 'POST', body: JSON.stringify(loginForm) });
    if (data.user.role !== 'admin') throw new Error('当前账号不是管理员');
    currentUser.value = data.user;
    token.value = data.accessToken;
    localStorage.setItem('haill_admin_user', JSON.stringify(data.user));
    localStorage.setItem('haill_admin_token', data.accessToken);
    notice.value = '管理员登录成功';
    await loadAll();
  });
}

function logout() {
  currentUser.value = null;
  token.value = '';
  dashboard.value = null;
  localStorage.removeItem('haill_admin_user');
  localStorage.removeItem('haill_admin_token');
  notice.value = '已退出后台';
}

async function loadAll() {
  const [health, dash, tutorials, teachers, supplies, demands] = await Promise.all([
    requestJson<{ ok: boolean; database?: { mode: string } }>('/health'),
    requestJson<Dashboard>('/admin/dashboard'),
    requestJson<Tutorial[]>('/tutorials/pending'),
    requestJson<TeacherApplication[]>('/teacher-applications'),
    requestJson<Supply[]>('/supplies/pending'),
    requestJson<Demand[]>('/purchase-demands/pending'),
  ]);
  apiOnline.value = health.ok;
  apiMessage.value = `后端已连接 · ${health.database?.mode || 'unknown'} 模式`;
  dashboard.value = dash;
  pendingTutorials.value = tutorials;
  pendingTeachers.value = teachers.filter(item => !('status' in item) || item.status === 'pending');
  pendingSupplies.value = supplies;
  pendingDemands.value = demands;
}

async function review(targetType: string, id: number, action: ReviewAction) {
  await run(async () => {
    await requestJson(`/admin/review/${targetType}/${id}`, { method: 'POST', body: JSON.stringify({ action }) });
    notice.value = action === 'approved' ? '已审核通过' : '已拒绝';
    await loadAll();
  });
}

async function run(task: () => Promise<void>) {
  loading.value = true;
  error.value = '';
  notice.value = '';
  try {
    await task();
  } catch (err) {
    error.value = err instanceof Error ? err.message : '操作失败';
    if (String(error.value).includes('401')) logout();
  } finally {
    loading.value = false;
  }
}

onMounted(() => {
  requestJson<{ ok: boolean; database?: { mode: string } }>('/health')
    .then(health => {
      apiOnline.value = health.ok;
      apiMessage.value = `后端已连接 · ${health.database?.mode || 'unknown'} 模式`;
    })
    .catch(err => {
      apiOnline.value = false;
      apiMessage.value = err instanceof Error ? err.message : '后端接口未连接';
    });
  if (token.value) run(loadAll).catch(() => undefined);
});
</script>
