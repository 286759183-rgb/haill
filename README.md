# haill 农业服务平台

面向老百姓的农业服务 MVP：技术教程、问题求助、老师入驻、农户货源、收购需求、视频验货和后台审核。

## 项目结构

```text
haill/
├── backend/      NestJS 后端接口
├── web/          Vue3 用户端 H5
├── admin/        Vue3 管理后台
├── database/     MySQL 初始化脚本
├── docs/         产品与开发文档
└── docker-compose.yml
```

## 第一版 MVP

- 农户：看教程、提问题、发布货源、上传图片/视频链接
- 老师：申请入驻、发布教程、回答问题
- 收购商：发布收购需求、浏览货源、区分自送价/上门收购价
- 管理员：审核老师、教程、问题、货源、收购需求，处理举报

## 本地启动

```bash
npm install
npm run build
npm test
```

开发模式：

```bash
npm run dev:backend
npm run dev:web
npm run dev:admin
```

默认端口：

- backend: http://localhost:3001
- web: http://localhost:5173
- admin: http://localhost:5174

## Docker 数据库

```bash
docker compose up -d mysql
```

MySQL 默认：

- database: `haill`
- user: `haill`
- password: `haill123456`

> 当前代码先跑通 MVP API 和页面骨架，后续再接 Prisma/TypeORM 持久化、对象存储和登录鉴权。
