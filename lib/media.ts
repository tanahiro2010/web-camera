'use client'

import { supabase } from './supabase'
import { Database } from './supabase'

type MediaFile = Database['public']['Tables']['media_files']['Row']
type MediaFileInsert = Database['public']['Tables']['media_files']['Insert']

export const uploadFile = async (file: File, userId: string): Promise<MediaFile | null> => {
  try {
    console.log('Uploading file with userId:', userId)
    
    // 認証状態を確認
    const { data: { session } } = await supabase.auth.getSession()
    console.log('Current session:', session)
    
    const fileExt = file.name.split('.').pop()
    const fileName = `${Math.random()}.${fileExt}`
    const filePath = `${userId}/${fileName}`

    // Upload file to storage
    const { error: uploadError } = await supabase.storage
      .from('media')
      .upload(filePath, file)

    if (uploadError) {
      throw uploadError
    }

    // Save metadata to database
    const mediaFile: MediaFileInsert = {
      user_id: userId,
      filename: file.name,
      file_path: filePath,
      file_type: file.type.startsWith('image/') ? 'image' : 'video',
      size: file.size
    }

    const { data, error } = await supabase
      .from('media_files')
      .insert(mediaFile)
      .select()
      .single()

    if (error) {
      throw error
    }

    return data
  } catch (error) {
    console.error('Error uploading file:', error)
    return null
  }
}

export const getMediaFiles = async (userId: string): Promise<MediaFile[]> => {
  try {
    const { data, error } = await supabase
      .from('media_files')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false })

    if (error) {
      throw error
    }

    return data || []
  } catch (error) {
    console.error('Error fetching media files:', error)
    return []
  }
}

export const getFileUrl = (filePath: string): string => {
  const { data } = supabase.storage
    .from('media')
    .getPublicUrl(filePath)
  
  return data.publicUrl
}

export const deleteMediaFile = async (id: string, filePath: string): Promise<boolean> => {
  try {
    // Delete from storage
    const { error: storageError } = await supabase.storage
      .from('media')
      .remove([filePath])

    if (storageError) {
      throw storageError
    }

    // Delete from database
    const { error: dbError } = await supabase
      .from('media_files')
      .delete()
      .eq('id', id)

    if (dbError) {
      throw dbError
    }

    return true
  } catch (error) {
    console.error('Error deleting media file:', error)
    return false
  }
}