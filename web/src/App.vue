<template>
  <main class="page">
    <section class="hero">
      <p class="eyebrow">haill 农业服务平台</p>
      <h1>学技术、问老师、卖货源、找收购</h1>
      <p class="summary">第一版先跑通农业技术、问题求助、老师入驻、农户货源和收购需求。</p>
      <div class="actions">
        <button>发布问题</button><button>发布货源</button><button>找收购</button>
      </div>
    </section>

    <section class="grid">
      <article v-for="item in entries" :key="item.title" class="card">
        <h2>{{ item.title }}</h2>
        <p>{{ item.desc }}</p>
      </article>
    </section>

    <section class="warning">
      防诈骗提醒：不要提前支付保证金、押金、运费；遇到先打款、加微信、扫码等情况请立即举报。
    </section>
  </main>
</template>

<script setup lang="ts">
const entries = [
  { title: '技术教程', desc: '种植、养殖、病虫害、施肥用药教程。' },
  { title: '问题求助', desc: '农户上传图片或视频，老师给出处理建议。' },
  { title: '老师入驻', desc: '有经验的老师发布教程、回答问题。' },
  { title: '农户货源', desc: '展示数量、地区、视频验货、自送价和上门收购价。' },
  { title: '收购需求', desc: '收购商发布收购数量、规格、价格和地区。' },
  { title: '视频验货', desc: '先支持视频链接和播放，后续加时间定位水印。' },
];
</script>
