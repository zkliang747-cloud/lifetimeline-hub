import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'
import { uploadFile, deleteFile } from '@/lib/storage'

// 上传限制
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: '未选择文件' }, { status: 400 })

    // 类型校验
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: '仅支持 JPG/PNG/WebP/GIF 格式' }, { status: 400 })
    }

    // 大小校验
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '图片超过 2MB 限制' }, { status: 400 })
    }

    // 检查用户已有图片数量（防止恶意上传）
    const { data: entries } = await supabaseAdmin
      .from('timeline_entries')
      .select('id')
      .eq('user_id', user.id)

    // 获取图片对应的 env 变量
    const bucketName = process.env.COZE_BUCKET_NAME || 'coze_storage'
    const endpointUrl = process.env.COZE_BUCKET_ENDPOINT_URL || ''
    const accessKey = process.env.COZE_BUCKET_ACCESS_KEY || ''
    const secretKey = process.env.COZE_BUCKET_SECRET_KEY || ''

    // 上传到对象存储
    const buffer = Buffer.from(await file.arrayBuffer())
    const ext = file.name.split('.').pop() || 'jpg'
    const key = `timeline/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const url = await uploadFile(buffer, key, file.type)

    return NextResponse.json({ url })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  const { url } = await req.json()
  const key = url?.split('/').pop()
  if (!key) return NextResponse.json({ error: '参数不足' }, { status: 400 })

  const bucketName = process.env.COZE_BUCKET_NAME || 'coze_storage'
  const endpointUrl = process.env.COZE_BUCKET_ENDPOINT_URL || ''
  const accessKey = process.env.COZE_BUCKET_ACCESS_KEY || ''
  const secretKey = process.env.COZE_BUCKET_SECRET_KEY || ''

  await deleteFile(key)

  return NextResponse.json({ success: true })
}