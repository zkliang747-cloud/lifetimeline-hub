# 安全审计报告 & 修复方案

## 综合评分

修复前：**6.5/10**  
修复后：**8.5/10** ✅

---

## 修复清单

### P0 严重问题

#### ❌ 图片删除越权漏洞

**问题**：`DELETE /api/upload` 接口允许任意用户删除他人的图片

```ts
// 【危险代码】
const key = url?.split('/').pop()
await deleteFile(key)  // 没��验证所有权！
```

**风险**：
- 恶意用户可删除他人时间轴中的所有图片
- 造成数据损失和用户体验破坏

**修复方案** ✅

```ts
// 1. 创建 user_files 表记录文件所有权
CREATE TABLE user_files (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES profiles(id),
  file_key TEXT NOT NULL,
  file_url TEXT NOT NULL,
  file_type TEXT,
  file_size INTEGER,
  created_at TIMESTAMP DEFAULT NOW()
);

// 2. DELETE 前验证所有权
const file = await supabaseAdmin
  .from('user_files')
  .select('id, user_id')
  .eq('file_key', key)
  .single()

if (file.user_id !== user.id) {
  return NextResponse.json({ error: '无权删除此文件' }, { status: 403 })
}
```

---

### P1 高危问题

#### ❌ 文件上传仅检查 MIME Type

**问题**：依赖 `Content-Type` 头进行类型校验，易被伪造

```ts
// 【危险代码】
if (!ALLOWED_TYPES.includes(file.type)) {  // 可伪造！
  return error
}
```

**风险**：
- 攻击者伪造 `Content-Type: image/jpeg`
- 上传恶意脚本（HTML、PHP、JS）
- 导致 XSS 或代码执行

**修复方案** ✅

```ts
// Magic Number 验证
const MAGIC_NUMBERS: Record<string, string> = {
  'FFD8FF': 'image/jpeg',      // JPEG: FFD8FF...
  '89504E47': 'image/png',     // PNG:  89 50 4E 47
  '52494646': 'image/webp',    // WebP: RIFF...
  '47494638': 'image/gif',     // GIF:  GIF8...
}

function verifyMagicNumber(buffer: Buffer, mimeType: string): boolean {
  const hex = buffer.slice(0, 4).toString('hex').toUpperCase()
  if (mimeType === 'image/jpeg') return hex.startsWith('FFD8FF')
  // ... 其他类型
  return false
}

// 上传前检查
if (!verifyMagicNumber(buffer, file.type)) {
  return error('文件内容与类型不匹配')
}
```

---

#### ❌ 密码哈希强度不足

**问题**：使用 PBKDF2 1000 次迭代

```ts
// 【危险代码】
crypto.pbkdf2Sync(password, salt, 1000, 64, 'sha512')
// 2026 年标准：至少 310000+ 迭代
```

**风险**：
- 密码容易被彩虹表攻击
- 暴力破解成本极低
- 不符合 OWASP 2026 标准

**修复方案** ✅

```ts
// 使用 Argon2（OWASP 推荐）
import argon2 from 'argon2'

export async function hashPassword(password: string): Promise<string> {
  return await argon2.hash(password, {
    type: argon2.argon2id,
    memoryCost: 65540,   // 64 MB
    timeCost: 3,         // 3 iterations
    parallelism: 4,      // 4 threads
  })
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await argon2.verify(hash, password)
}
```

或者升级 PBKDF2 迭代次数：

```ts
crypto.pbkdf2Sync(password, salt, 310000, 64, 'sha512')
```

---

#### ❌ AI 接口可被恶意刷额度

**问题**：`POST /api/ai/polish` 仅检查每日次数，无速率限制

```ts
// 【危险代码】
const limit = isPro ? 999 : 3
if (currentCount >= limit) return error
// 没有防止短时间内大量请求！
```

**风险**：
- 攻击者注册大量账号，瞬间消耗 DeepSeek Token
- AI 服务成本失控
- 导致正常用户服务中断

**修复方案** ✅

```ts
// 【P1 修复】实现多层速率限制

// 1. 用户级限制：每分钟 10 次
const userRateLimit = `user:${user.id}`
if (!checkRateLimit(userRateLimit, 10, 60000)) {
  return error('请求过于频繁，每分钟最多 10 次', 429)
}

// 2. IP 级限制：每分钟 100 次（防止 DDoS）
const clientIp = req.headers.get('x-forwarded-for')
const ipRateLimit = `ip:${clientIp}`
if (!checkRateLimit(ipRateLimit, 100, 60000)) {
  return error('服务暂时不可用', 429)
}

// 3. 每日限制：仍然保留
const today = new Date().toISOString().slice(0, 10)
if (currentCount >= limit) {
  return error(`今日次数已达上限（${limit}次）`, 429)
}
```

生产环境建议使用 Redis：

```ts
const redis = new Redis(process.env.REDIS_URL)
await redis.incr(`rate:${identifier}`)
await redis.expire(`rate:${identifier}`, windowMs / 1000)
```

---

### P2 中风险问题

#### ❌ 用户资料缺少字段限制

**问题**：`PUT /api/profile` 直接写库，无字段长度限制

```ts
// 【危险代码】
const { display_name, bio, avatar_url } = body
await supabaseAdmin
  .from('profiles')
  .update({ display_name, bio, avatar_url })  // 可以是任意长度！
```

**风险**：
- 用户可提交 20MB 字符串导致数据库膨胀
- 前端渲染崩溃
- 存储成本增加

**修复方案** ✅

```ts
// 使用 Zod 验证
const UpdateProfileSchema = z.object({
  display_name: z.string().min(1).max(50),   // 1-50 字符
  bio: z.string().max(1000).optional(),      // 0-1000 字符
  avatar_url: z.string().url().optional(),   // 有效 URL
})

const validated = UpdateProfileSchema.parse(body)
```

SQL 约束：

```sql
ALTER TABLE profiles 
ADD CONSTRAINT display_name_length CHECK (char_length(display_name) <= 50),
ADD CONSTRAINT bio_length CHECK (char_length(bio) <= 1000);
```

---

#### ❌ Entry 创建缺少字段校验

**问题**：`POST /api/entries` 直接从请求体读取字段，无校验

```ts
// 【危险代码】
const { year, title, content } = body
await insert({ year, title, content })  // 任何值都可以！
```

**风险**：
- `year` 可以是 -9999 或 99999
- `title` 可以是空字符串或 100KB 文本
- `content` 可以是任意数据

**修复方案** ✅

```ts
const CreateEntrySchema = z.object({
  year: z.coerce.number().int().min(1900).max(2100),
  title: z.string().min(1).max(200),
  content: z.string().max(10000).optional().default(''),
  tags: z.array(z.string().max(50)).max(10).optional(),
  is_public: z.boolean().optional().default(true),
  image_url: z.string().url().optional().nullable(),
})

const validated = CreateEntrySchema.parse(body)
await insert(validated)
```

---

## 性能优化

### ❌ 公开主页查询所有字段

```ts
// 【浪费】
const { data } = await supabaseAdmin
  .from('timeline_entries')
  .select('*')  // 所有字段，包括重的 BLOB
```

### ✅ 只查询必要字段

```ts
const { data } = await supabaseAdmin
  .from('timeline_entries')
  .select('id,year,title,content,tags,image_url,created_at')  // 精确字段
  .eq('is_public', true)
```

---

## 代码质量优化

### ✅ 提取通用中间件

```ts
// lib/middleware.ts
export async function requireAuth() {
  const user = await getSessionUser()
  if (!user) {
    return {
      error: true,
      response: NextResponse.json({ error: '未登录' }, { status: 401 }),
    }
  }
  return { error: false, user }
}

// 在 API 中使用
const auth = await requireAuth()
if (auth.error) return auth.response
const user = auth.user
```

### ✅ 删除死代码

```ts
// 【删除】
const bucketName = process.env.COZE_BUCKET_NAME  // 未使用
const endpointUrl = process.env.COZE_BUCKET_ENDPOINT_URL  // 未使用
```

---

## 部署清单

- [ ] 创建 `user_files` 表
- [ ] 安装 `argon2` 库
- [ ] 安装 `zod` 库
- [ ] 迁移旧密码（使用 Argon2 重新哈希）
- [ ] 测试速率限制
- [ ] 配置 CSP 头
- [ ] 启用 HTTPS
- [ ] 配置 CORS
- [ ] 监控 DeepSeek API 成本
- [ ] 设置 WAF 规则

---

## 下阶段建议

1. **数据库 Schema 审计**
   - RLS 策略检查
   - 索引优化
   - 触发器安全性

2. **前端安全加固**
   - CSP 配置
   - XSS 防护
   - CSRF Token

3. **监控告警**
   - 异常登录检测
   - API 性能告警
   - 成本超支告警

4. **成本优化**
   - DeepSeek 用量分析
   - S3 存储优化
   - 数据库查询优化
