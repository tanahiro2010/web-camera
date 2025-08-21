'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  Play, 
  Download, 
  Trash2, 
  Upload,
  Calendar,
  File
} from 'lucide-react'
import { getMediaFiles, getFileUrl, deleteMediaFile } from '@/lib/media'
import { uploadToGoogleDrive, getGoogleAccessToken } from '@/lib/google-drive'
import { useAuth } from '@/components/AuthProvider'
import { Database } from '@/lib/supabase'
import { toast } from 'sonner'

type MediaFile = Database['public']['Tables']['media_files']['Row']

export default function MediaGallery() {
  const { user, session } = useAuth()
  const [mediaFiles, setMediaFiles] = useState<MediaFile[]>([])
  const [loading, setLoading] = useState(true)
  const [uploadingToDrive, setUploadingToDrive] = useState<string | null>(null)

  const fetchMediaFiles = async () => {
    if (!user) return

    setLoading(true)
    try {
      const files = await getMediaFiles(user.id)
      setMediaFiles(files)
    } catch (error) {
      console.error('Error fetching media files:', error)
      toast.error('ファイルの取得に失敗しました')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchMediaFiles()
  }, [user])

  const handleDelete = async (file: MediaFile) => {
    if (!confirm('このファイルを削除しますか？')) return

    const success = await deleteMediaFile(file.id, file.file_path)
    if (success) {
      toast.success('ファイルを削除しました')
      fetchMediaFiles()
    } else {
      toast.error('削除に失敗しました')
    }
  }

  const handleUploadToDrive = async (file: MediaFile) => {
    if (!session) {
      toast.error('Google認証が必要です')
      return
    }

    setUploadingToDrive(file.id)
    try {
      const accessToken = await getGoogleAccessToken(session)
      if (!accessToken) {
        toast.error('Google Drive アクセストークンが取得できません')
        return
      }

      // Download file from Supabase Storage
      const fileUrl = getFileUrl(file.file_path)
      const response = await fetch(fileUrl)
      const blob = await response.blob()
      const fileObj = new File([blob], file.filename, { type: blob.type })

      const result = await uploadToGoogleDrive(fileObj, accessToken)
      if (result) {
        toast.success('Google Driveにアップロードしました')
        // Optionally update the database with drive_file_id
      } else {
        toast.error('Google Driveアップロードに失敗しました')
      }
    } catch (error) {
      console.error('Error uploading to Drive:', error)
      toast.error('Google Driveアップロードに失敗しました')
    } finally {
      setUploadingToDrive(null)
    }
  }

  const formatFileSize = (bytes: number) => {
    const sizes = ['Bytes', 'KB', 'MB', 'GB']
    if (bytes === 0) return '0 Bytes'
    const i = Math.floor(Math.log(bytes) / Math.log(1024))
    return Math.round(bytes / Math.pow(1024, i) * 100) / 100 + ' ' + sizes[i]
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[...Array(6)].map((_, i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-0">
              <div className="aspect-square bg-gray-200 rounded-t-lg"></div>
              <div className="p-4 space-y-2">
                <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (mediaFiles.length === 0) {
    return (
      <Card className="text-center py-12">
        <CardContent>
          <File className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            まだファイルがありません
          </h3>
          <p className="text-gray-500">
            カメラで写真や動画を撮影してみましょう
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {mediaFiles.map((file) => (
        <Card key={file.id} className="group hover:shadow-lg transition-shadow">
          <CardContent className="p-0">
            <div className="relative aspect-square bg-black rounded-t-lg overflow-hidden">
              {file.file_type === 'image' ? (
                <img
                  src={getFileUrl(file.file_path)}
                  alt={file.filename}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="relative w-full h-full">
                  <video
                    src={getFileUrl(file.file_path)}
                    className="w-full h-full object-cover"
                    preload="metadata"
                  />
                  <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 group-hover:bg-opacity-20 transition-all">
                    <Play className="w-12 h-12 text-white" />
                  </div>
                </div>
              )}
              
              <div className="absolute top-2 left-2">
                <Badge variant={file.file_type === 'image' ? 'default' : 'secondary'}>
                  {file.file_type === 'image' ? '画像' : '動画'}
                </Badge>
              </div>
            </div>

            <div className="p-4 space-y-3">
              <div>
                <h3 className="font-medium text-sm truncate" title={file.filename}>
                  {file.filename}
                </h3>
                <div className="flex items-center text-xs text-gray-500 mt-1">
                  <Calendar className="w-3 h-3 mr-1" />
                  {formatDate(file.created_at)}
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  {formatFileSize(file.size)}
                </p>
              </div>

              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => {
                    const url = getFileUrl(file.file_path)
                    window.open(url, '_blank')
                  }}
                >
                  <Download className="w-3 h-3 mr-1" />
                  DL
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  className="flex-1"
                  onClick={() => handleUploadToDrive(file)}
                  disabled={uploadingToDrive === file.id}
                >
                  {uploadingToDrive === file.id ? (
                    'Drive中...'
                  ) : (
                    <>
                      <Upload className="w-3 h-3 mr-1" />
                      Drive
                    </>
                  )}
                </Button>

                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleDelete(file)}
                  className="text-red-600 hover:text-red-700"
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}