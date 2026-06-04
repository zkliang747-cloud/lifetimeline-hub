# AGENTS.md — 人生时间轴 (LifeTimeline Hub)

## 项目概览
「人生时间轴」是一个记录人生重要时刻的 Web 应用。用户可以创建按年份组织的时间轴节点，支持图文、标签、公开/私密设置，并集成 DeepSeek AI 文字润色功能。

### 技术栈
- **Framework**: Next.js 16 (App Router)
- **Core**: React 19
- **Language**: TypeScript 5
- **UI 组件**: shadcn/ui (基于 Radix UI)
- **Styling**: Tailwind CSS 4
- **存储**: Supabase (PostgreSQL) + JSON 文件回退 (`/tmp/timeline-data/`)
- **对象存储**: Coze S3 兼容存储 (图片上传)
- **AI 能力**: DeepSeek API (文字润色)
- **认证**: HttpOnly Cookie + PBKDF2 密码哈希 (文件模式) / Supabase Auth (Supabase模式)

## 双模式架构
代码支持两种运行模式，通过环境变量自动切换：

### Supabase 模式（生产推荐）
当 `SUPABASE_URL` 和 `SUPABASE_SERVICE_ROLE_KEY` 环境变量均存在时启用。
- 所有数据存储在 Supabase PostgreSQL
- 认证使用 Supabase Admin API
- 表: `profiles`, `timeline_entries`, `ai_usage`

### 文件回退模式（开发/演示）
当 Supabase 环境变量缺失或 Supabase 不可达时自动回退。
- 数据存储在 `/tmp/timeline-data/` JSON 文件
- 认证使用 PBKDF2 密码哈希 + HttpOnly Cookie

## 目录结构
```
src/
├── app/
│   ├── layout.tsx              # 全局布局与 SEO metadata
│   ├── page.tsx                # 首页 (Hero + 功能 + 发现用户 + 定价 + 法律页脚)
│   ├── globals.css             # 全局样式（含深色模式）
│   ├── [username]/
│   │   ├── page.tsx            # 服务端元数据 (generateMetadata + OpenGraph)
│   │   └── timeline-view.tsx   # 客户端时间轴渲染 + 分享 + 海报生成
│   ├── dashboard/page.tsx      # 用户仪表盘 (时间轴 CRUD 管理)
│   ├── settings/page.tsx       # 个人设置 (头像上传 + 资料编辑 + 导出)
│   ├── privacy/page.tsx        # 隐私政策
│   ├── terms/page.tsx          # 服务条款
│   ├── admin/sponsor/page.tsx  # 赞助管理后台
│   └── api/
│       ├── auth/
│       │   ├── login/route.ts      # 登录
│       │   ├── register/route.ts   # 注册
│       │   └── logout/route.ts     # 注销
│       ├── entries/route.ts        # 列表/创建
│       ├── entries/[id]/route.ts   # 更新/删除
│       ├── profile/route.ts        # 用户资料 GET/PUT
│       ├── upload/route.ts         # 图片上传到 S3
│       ├── ai/polish/route.ts      # DeepSeek AI 润色
│       ├── export/route.ts         # JSON 数据导出 (SSRF-safe)
│       ├── public/[username]/route.ts  # 公开时间轴数据
│       ├── public/users/route.ts       # 有公开内容的用户列表
│       └── admin/sponsor/route.ts      # 赞助管理 (受 ADMIN_KEY 保护)
├── components/
│   ├── Navbar.tsx              # 导航栏
│   ├── TimelineForm.tsx        # 时间轴表单 (含 AI 润色按钮)
│   ├── ImageUploader.tsx       # 图片上传组件 (压缩 + 格式限制 + 大小限制)
│   └── AIPolishButton.tsx      # AI 润色触发按钮
└── lib/
    ├── utils.ts                # 通用工具 (cn, 日期, 分组, 验证)
    ├── auth.ts                 # 认证 (Supabase + 文件回退, Cookie 会话)
    ├── store.ts                # 数据持久化 (Supabase + 文件回退 CRUD)
    ├── storage.ts              # S3 对象存储封装
    ├── supabase.ts             # Supabase 管理客户端 + 可用性检测
    └── poster.ts               # Canvas 海报生成
```

## 构建与命令
- **开发**: `pnpm dev` (热更新端口5000)
- **构建**: `pnpm build`
- **类型检查**: `pnpm ts-check`
- **lint**: `pnpm lint:build`

## 环境变量（.env.local）
```
# Supabase 配置（生产环境替换真实值）
SUPABASE_URL=https://wposvwiqnpypevhwbzmue.supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# DeepSeek API
DEEPSEEK_API_KEY=sk-...

# 管理员密钥（保护 /api/admin/sponsor）
ADMIN_KEY=your-secret-admin-key
```

## 认证机制
- **Supabase 模式**: Supabase Auth signInWithPassword + 服务端验证
- **文件模式**: PBKDF2 + salt 哈希密码 + UUID会话 token
- Cookie: HttpOnly, SameSite=Lax, path=/, 30天有效期
- API 鉴权: 从 Cookie 读取 session token，服务端 `getSessionUser()` 验证
- 前端请求: `credentials: 'include'` (自动携带 Cookie)

## 关键接口
| 接口 | 方法 | 说明 |
|------|------|------|
| `/api/auth/register` | POST | 注册 (username/email/password) |
| `/api/auth/login` | POST | 登录 (email/password) |
| `/api/auth/logout` | POST | 注销 |
| `/api/entries` | GET/POST | 获取/创建时间轴条目 |
| `/api/entries/[id]` | PUT/DELETE | 更新/删除条目 |
| `/api/profile` | GET/PUT | 获取/更新用户资料 |
| `/api/upload` | POST | 上传图片到 S3 (2MB限制) |
| `/api/ai/polish` | POST | DeepSeek AI 润色 (每日3次) |
| `/api/export` | POST | JSON 数据导出 |
| `/api/public/[username]` | GET | 公开用户资料+条目 |
| `/api/public/users` | GET | 有公开内容的用户列表 |
| `/api/admin/sponsor` | POST | 赞助管理 (ADMIN_KEY) |

## 设计规范
详见 `DESIGN.md` — 暖白/琥珀棕配色、Noto Serif SC 衬线字体、时间轴竖线布局

## 部署注意事项
1. **沙箱 DNS 限制**: 当前沙箱无法解析 `wposvwiqnpypevhwbzmue.supabase.co` (ENOTFOUND)，代码有文件回退机制，在沙箱中可正常演示
2. **Vercel 部署**: 推送到 GitHub → Vercel 导入 → 设置环境变量 → 自动部署
3. **环境变量设置 (Vercel)**: 必须设置 `SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DEEPSEEK_API_KEY`, `ADMIN_KEY`
4. **Supabase 数据库建表**: 部署前在 Supabase SQL Editor 执行 `supabase-schema.sql`
5. **数据持久化**: 生产环境用 Supabase，数据不会丢失
6. **图片存储**: 沙箱用 Coze S3，生产环境建议用 Supabase Storage 替代