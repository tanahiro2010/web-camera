'use client'

import { supabase } from './supabase'
import { Database } from './supabase'

type MediaFile = Database['public']['Tables']['media_files']['Row']
type MediaFileInsert = Database['public']['Tables']['media_files']['Insert']

export const uploadFile = async (file: File, userId: string): Promise<MediaFile | null> => {
  try {
    console.log('Uploading file with userId:', userId)
    
    // FormDataを作成してAPI Routeに送信
    const formData = new FormData()
    formData.append('file', file)
    formData.append('userId', userId)

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData
    })

    if (!response.ok) {
      throw new Error(`Upload failed: ${response.statusText}`)
    }

    const result = await response.json()
    
    if (result.error) {
      throw new Error(result.error)
    }

    return result.data
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