'use client'

import { useAuth } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import MediaGallery from '@/components/MediaGallery'
import { Button } from '@/components/ui/button'
import { Camera, Plus } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function GalleryPage() {
  const { user, loading } = useAuth()
  const router = useRouter()

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!user) {
    router.push('/')
    return null
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              メディアギャラリー
            </h1>
            <p className="text-gray-600">
              撮影したファイルを管理・Google Driveに保存
            </p>
          </div>
          
          <Link href="/camera">
            <Button className="flex items-center">
              <Plus className="w-4 h-4 mr-2" />
              <span className="hidden sm:inline">新しく撮影</span>
              <span className="sm:hidden">撮影</span>
            </Button>
          </Link>
        </div>

        <MediaGallery />
      </div>
    </div>
  )
}