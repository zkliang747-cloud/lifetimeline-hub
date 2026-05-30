# AGENTS.md — 人生时间轴 (LifeTimeline Hub)

## 项目概览
「人生时间轴」是一个记录人生重要时刻的 Web 应用。用户可以创建按年份组织的时间轴节点，支持图文、标签、公开/私密设置，并集成 AI 文字润色功能。

### 技术栈
- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **存储**: JSON 文件存储 (`/tmp/timeline-data/`)
- **对象存储**: Coze S3 兼容存储 (图片上传)
- **AI 能力**: coze-coding-dev-sdk (LLM 润色)

## 目录结构
```
src/
├── app/
│   ├── layout.tsx              # 全局布局与 SEO metadata
│   ├── page.tsx                # 首页/登录注册
│   ├── globals.css             # 全局样式（含深色模式）
│   ├── [username]/page.tsx     # 用户公开时间轴页面
│   ├── dashboard/page.tsx      # 用户仪表盘 (时间轴管理)
│   ├── settings/page.tsx       # 个人设置
│   ├── admin/sponsor/page.tsx  # 赞助管理后台
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts      # 登录
│       │   ├── register/route.ts   # 注册
│       │   └── logout/route.ts     # 注销
│       ├── entries/route.ts        # 列表/创建
│       ├── entries/[id]/route.ts   # 更新/删除
│       ├── upload/route.ts         # 图片上传
│       ├── ai/polish/route.ts      # AI 润色
│       ├── export/route.ts         # 数据导出
│       ├── public/[username]/route.ts  # 公开数据
│       └── admin/sponsor/route.ts      # 赞助管理
├── components/
│   ├── Navbar.tsx              # 导航栏
│   ├── TimelineForm.tsx        # 时间轴表单
│   ├── ImageUploader.tsx       # 图片上传组件
│   └── AIPolishButton.tsx      # AI 润色按钮
└── lib/
    ├── utils.ts                # 通用工具 (cn, 日期, 分组)
    ├── auth.ts                 # 认证 (用户/会话/密码哈希)
    ├── store.ts                # 数据持久化 (JSON 文件 CRUD)
    └── storage.ts              # S3 对象存储封装
```

## 构建与命令
- **开发**: `pnpm dev` (热更新端口5000)
- **构建**: `pnpm build`
- **类型检查**: `pnpm ts-check`
- **lint**: `pnpm lint:build`

## 数据存储
- 所有数据存储在 `/tmp/timeline-data/` 目录（开发环境）
- `users.json` — 用户数据
- `sessions.json` — 会话令牌
- `entries.json` — 时间轴条目
- `ai_usage.json` — AI 使用次数

## 认证机制
- 基于会话令牌 (UUID token)
- 密码使用 PBKDF2 + salt 哈希
- Cookie 存储 (HttpOnly, SameSite=Lax, 30天有效期)
- 免费用户 AI 润色每日限 3 次

## 关键接口
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 注册 (username/email/password) |
| `/api/auth/login` | POST | 登录 (email/password) |
| `/api/auth/logout` | POST | 注销 |
| `/api/entries` | GET/POST | 获取/创建时间轴条目 |
| `/api/entries/[id]` | PUT/DELETE | 更新/删除条目 |
| `/api/upload` | POST | 上传图片到 S3 |
| `/api/ai/polish` | POST | AI 润色正文 |
| `/api/export` | GET | 导出 JSON |
| `/api/public/[username]` | GET | 公开时间轴数据 |
| `/api/admin/sponsor` | POST | 赞助管理 |

## 部署注意事项
1. **生产环境**：数据存储在 `/tmp/` 是临时的，部署到 Vercel/Render 等平台需替换为持久化存储（Supabase/PostgreSQL）
2. **环境变量**：需设置 `ADMIN_KEY` 保护管理后台
3. **S3 存储**：使用 Coze 平台自动注入的 `COZE_BUCKET_*` 环境变量
4. **AI 功能**：依赖 `coze-coding-dev-sdk` 的 LLM 能力

## 设计规范
详见 `DESIGN.md` — 暖白/琥珀棕配色、衬线字体叙事感、时间轴布局