'use client'

import { useState } from 'react'
import { useAuth } from '@/components/AuthProvider'
import Navigation from '@/components/Navigation'
import CameraComponent from '@/components/Camera'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function CameraPage() {
  const { user, loading } = useAuth()
  const router = useRouter()
  const [captureCount, setCaptureCount] = useState(0)

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

  const handleCapture = () => {
    setCaptureCount(prev => prev + 1)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navigation />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              カメラ撮影
            </h1>
            <p className="text-gray-600">
              写真や動画を撮影してSupabase Storageに保存しましょう
            </p>
          </div>

          <div className="space-y-6">
            <CameraComponent onCapture={handleCapture} />

            {captureCount > 0 && (
              <Card className="border-green-200 bg-green-50">
                <CardContent className="pt-6">
                  <div className="text-center">
                    <p className="text-green-800 font-medium mb-3">
                      ファイルが正常に保存されました！
                    </p>
                    <Link href="/gallery">
                      <Button className="bg-green-600 hover:bg-green-700">
                        ギャラリーで確認
                        <ArrowRight className="w-4 h-4 ml-2" />
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            )}

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">使い方</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">1</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    「カメラを開始」ボタンでWebカメラを起動
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">2</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    円ボタンで写真撮影、四角ボタンで動画録画
                  </p>
                </div>
                <div className="flex items-start space-x-3">
                  <div className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-xs font-bold text-blue-600">3</span>
                  </div>
                  <p className="text-sm text-gray-600">
                    プレビューを確認して「保存」ボタンでアップロード
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}