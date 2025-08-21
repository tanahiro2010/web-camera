'use client'

import { useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { useAuth } from '@/components/AuthProvider'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Camera, Grid3X3, Upload, Shield } from 'lucide-react'

export default function Home() {
  const { user, loading, signInWithGoogle } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!loading && user) {
      router.push('/camera')
    }
  }, [user, loading, router])

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (user) {
    return null // Will redirect to /camera
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-600 rounded-full mb-4">
              <Camera className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-4">
              MediaCapture
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Webカメラで写真・動画を撮影し、Supabase Storageに保存。Google Driveとの連携で、メディアファイルを安全にバックアップできます。
            </p>
          </div>

          <Card className="max-w-md mx-auto mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-center">
                <Shield className="w-5 h-5 mr-2" />
                Googleアカウントでログイン
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Button 
                onClick={signInWithGoogle}
                className="w-full"
                size="lg"
              >
                Googleでサインイン
              </Button>
              <p className="text-xs text-gray-500 mt-3">
                ログインすることで、カメラ機能とGoogle Drive連携が利用できるようになります
              </p>
            </CardContent>
          </Card>

          <div className="grid md:grid-cols-3 gap-6 max-w-3xl mx-auto">
            <Card className="text-center">
              <CardContent className="pt-6">
                <Camera className="w-8 h-8 text-blue-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">カメラ撮影</h3>
                <p className="text-sm text-gray-600">
                  Webカメラで写真・動画を撮影
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Grid3X3 className="w-8 h-8 text-green-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">ギャラリー</h3>
                <p className="text-sm text-gray-600">
                  保存したメディアを一覧表示
                </p>
              </CardContent>
            </Card>

            <Card className="text-center">
              <CardContent className="pt-6">
                <Upload className="w-8 h-8 text-purple-600 mx-auto mb-3" />
                <h3 className="font-semibold mb-2">Drive連携</h3>
                <p className="text-sm text-gray-600">
                  Google Driveに自動バックアップ
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}