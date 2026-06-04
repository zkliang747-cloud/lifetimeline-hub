import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

/** 服务端使用的 Supabase Admin 客户端（有全部权限）
 *  注意：环境变量缺失时客户端仍然创建，但请求会失败。
 *  调用方应自行处理 fail gracefully。 */
export const supabaseAdmin = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  serviceRoleKey || 'placeholder-key',
  { auth: { autoRefreshToken: false, persistSession: false } },
)