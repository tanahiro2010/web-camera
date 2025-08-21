import { NextRequest, NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

// SERVICE_ROLE_KEYを使った管理者クライアント（サーバーサイドのみ）
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const userId = formData.get('userId') as string

    if (!file || !userId) {
      return NextResponse.json({ error: 'File and userId are required' }, { status: 400 })
    }

    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Upload file to storage
    const { error: uploadError } = await supabaseAdmin.storage
      .from('media')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    // Save metadata to database
    const mediaFile = {
      user_id: userId,
      filename: file.name,
      file_path: filePath,
      file_type: file.type.startsWith('image/') ? 'image' : 'video',
      size: file.size
    }

    const { data, error } = await supabaseAdmin
      .from('media_files')
      .insert(mediaFile)
      .select()
      .single()

    if (error) {
      throw error
    }

    return NextResponse.json({ data })
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 })
  }
}
