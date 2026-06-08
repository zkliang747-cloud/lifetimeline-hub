import { NextRequest, NextResponse } from 'next/server'
import { supabaseAdmin } from '@/lib/supabase'
import { getSessionUser } from '@/lib/auth'
import { uploadFile, deleteFile } from '@/lib/storage'
import { z } from 'zod'

// 上传限制
const MAX_FILE_SIZE = 2 * 1024 * 1024 // 2MB
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

// Magic Number 验证
const MAGIC_NUMBERS: Record<string, string> = {
  'FFD8FF': 'image/jpeg',      // JPEG
  '89504E47': 'image/png',     // PNG
  '52494646': 'image/webp',    // WebP
  '47494638': 'image/gif',     // GIF
}

/**
 * 验证文件的 Magic Number（文件头）
 * 防止攻击者伪造 MIME Type
 */
function verifyMagicNumber(buffer: Buffer, mimeType: string): boolean {
  const hex = buffer.slice(0, 4).toString('hex').toUpperCase()
  
  if (mimeType === 'image/jpeg') {
    return hex.startsWith('FFD8FF')
  }
  if (mimeType === 'image/png') {
    return hex.startsWith('89504E47')
  }
  if (mimeType === 'image/webp') {
    return hex.startsWith('52494646')
  }
  if (mimeType === 'image/gif') {
    return hex.startsWith('47494638')
  }
  
  return false
}

export async function POST(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  try {
    const formData = await req.formData()
    const file = formData.get('file') as File | null
    if (!file) return NextResponse.json({ error: '未选择文件' }, { status: 400 })

    // 【P1 修复】类型校验
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json({ error: '仅支持 JPG/PNG/WebP/GIF 格式' }, { status: 400 })
    }

    // 【P1 修复】大小校验
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json({ error: '图片超过 2MB 限制' }, { status: 400 })
    }

    // 【P1 修复】Magic Number 验证，防止文件伪造
    const buffer = Buffer.from(await file.arrayBuffer())
    if (!verifyMagicNumber(buffer, file.type)) {
      return NextResponse.json(
        { error: '文件内容与类型不匹配，可能是恶意文件' },
        { status: 400 }
      )
    }

    // 上传到对象存储
    const ext = file.name.split('.').pop() || 'jpg'
    const key = `timeline/${user.id}/${Date.now()}_${Math.random().toString(36).slice(2)}.${ext}`

    const url = await uploadFile(buffer, key, file.type)

    // 【P0 修复】记录文件所有权到数据库
    if (supabaseAdmin) {
      await supabaseAdmin
        .from('user_files')
        .insert([{
          user_id: user.id,
          file_key: key,
          file_url: url,
          file_type: file.type,
          file_size: file.size,
          created_at: new Date().toISOString(),
        }])
        .catch(err => console.error('Failed to record file ownership:', err))
    }

    return NextResponse.json({ url })
  } catch (err) {
    console.error('Upload error:', err)
    return NextResponse.json({ error: '上传失败' }, { status: 500 })
  }
}

export async function DELETE(req: NextRequest) {
  const user = await getSessionUser()
  if (!user) return NextResponse.json({ error: '未登录' }, { status: 401 })

  try {
    const { url } = await req.json()
    if (!url) return NextResponse.json({ error: '参数不足' }, { status: 400 })

    const key = url.split('/').pop()
    if (!key) return NextResponse.json({ error: '参数不足' }, { status: 400 })

    // 【P0 修复】验证图片所有权，防止越权删除
    if (supabaseAdmin) {
      const { data: file, error } = await supabaseAdmin
        .from('user_files')
        .select('id, user_id')
        .eq('file_key', key)
        .single()

      if (error || !file) {
        return NextResponse.json({ error: '文件不存在' }, { status: 404 })
      }

      // 核心安全检查：验证文件属于当前用户
      if (file.user_id !== user.id) {
        return NextResponse.json(
          { error: '无权删除此文件' },
          { status: 403 }
        )
      }

      // 删除数据库记录
      await supabaseAdmin
        .from('user_files')
        .delete()
        .eq('id', file.id)
    }

    // 删除存储中的文件
    await deleteFile(key)

    return NextResponse.json({ success: true })
  } catch (err) {
    console.error('Delete error:', err)
    return NextResponse.json({ error: '删除失败' }, { status: 500 })
  }
}
