<template>
  <main class="layout">
    <aside>
      <h1>haill 管理后台</h1>
      <p>农业平台 MVP 审核中心</p>
    </aside>
    <section class="content">
      <h2>待办审核</h2>
      <div class="stats">
        <article v-for="item in stats" :key="item.name">
          <span>{{ item.count }}</span>
          <p>{{ item.name }}</p>
        </article>
      </div>
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
const stats = [
  { name: '老师审核', count: 0 },
  { name: '教程审核', count: 0 },
  { name: '货源审核', count: 0 },
  { name: '收购需求审核', count: 0 },
];
</script>
