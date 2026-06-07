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
- Swagger: http://localhost:3001/api/docs
- web: http://localhost:5173
- admin: http://localhost:5174

## 数据库模式

后端现在支持两种模式：

1. **内存模式**：不配置数据库时自动启用，适合本地快速测试。
2. **MySQL 模式**：配置 MySQL 后自动启用，数据写入数据库，启动时会执行 `database/schema.sql` 建表。

健康检查接口会返回当前模式：

```bash
curl http://localhost:3001/api/health
```

返回示例：

```json
{
  "ok": true,
  "service": "haill-backend",
  "database": { "mode": "memory", "ready": true }
}
```

## Docker MySQL

```bash
docker compose up -d mysql
```

MySQL 默认：

- host: `127.0.0.1`
- port: `3306`
- database: `haill`
- user: `haill`
- password: `haill123456`

启用 MySQL 模式：

```bash
export MYSQL_HOST=127.0.0.1
export MYSQL_PORT=3306
export MYSQL_DATABASE=haill
export MYSQL_USER=haill
export MYSQL_PASSWORD=haill123456
npm run dev:backend
```

也可以使用一个连接串：

```bash
export DATABASE_URL=mysql://haill:haill123456@127.0.0.1:3306/haill
npm run dev:backend
```

## 当前已实现接口重点

- `/api/health`：健康检查，包含数据库模式
- `/api/users`：用户创建/列表
- `/api/tutorials`：教程创建、审核后列表、详情
- `/api/questions`：问题发布、老师回答
- `/api/teacher-applications`：老师入驻申请
- `/api/supplies`：农户货源发布、审核后列表
- `/api/purchase-demands`：收购需求发布、审核后列表
- `/api/admin/dashboard`：后台待审核统计和防诈骗提醒
- `/api/admin/review/:targetType/:id`：后台审核

## 风控提醒

平台文案和后台审核必须保留：不要提前支付保证金、押金、运费；不要脱离平台私下转账；高价收购、先打款、加微信等信息要谨慎。

## 下一步

- 登录注册、密码加密、JWT 鉴权
- 角色权限：农户、老师、收购商、管理员
- 图片/视频真实上传
- 用户端和后台接真实接口
- Docker 一键部署 backend + web + admin + MySQL
