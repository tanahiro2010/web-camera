'use client'

import { useState, useRef, useCallback, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Camera, Square, Circle, RotateCcw, Upload } from 'lucide-react'
import { uploadFile } from '@/lib/media'
import { useAuth } from '@/components/AuthProvider'
import { toast } from 'sonner'

interface CameraProps {
  onCapture?: () => void
}

export default function CameraComponent({ onCapture }: CameraProps) {
  const { user } = useAuth()
  const videoRef = useRef<HTMLVideoElement>(null)
  const mediaRecorderRef = useRef<MediaRecorder | null>(null)
  const [stream, setStream] = useState<MediaStream | null>(null)
  const [isRecording, setIsRecording] = useState(false)
  const [capturedMedia, setCapturedMedia] = useState<{ blob: Blob, type: 'image' | 'video' } | null>(null)
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('user')
  const [uploading, setUploading] = useState(false)

  const startCamera = useCallback(async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode },
        audio: true
      })
      setStream(mediaStream)
    } catch (error) {
      console.error('Error accessing camera:', error)
      toast.error('カメラへのアクセスに失敗しました')
    }
  }, [facingMode])

  // streamがセットされたらvideoRefに割り当て
  useEffect(() => {
    if (videoRef.current && stream) {
      console.log('Setting stream to video element')
      videoRef.current.srcObject = stream
      videoRef.current.play()
    }
  }, [stream])

  const stopCamera = useCallback(() => {
    console.log('Stopping camera')
    if (stream) {
      stream.getTracks().forEach(track => track.stop())
      setStream(null)
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null
    }
  }, [stream])

  const capturePhoto = useCallback(async () => {
    if (!videoRef.current) return

    const canvas = document.createElement('canvas')
    const context = canvas.getContext('2d')
    
    canvas.width = videoRef.current.videoWidth
    canvas.height = videoRef.current.videoHeight
    
    context?.drawImage(videoRef.current, 0, 0)
    
    canvas.toBlob((blob) => {
      if (blob) {
        setCapturedMedia({ blob, type: 'image' })
        stopCamera()
      }
    }, 'image/jpeg', 0.8)
  }, [stopCamera])

  const startRecording = useCallback(() => {
    if (!stream) return

    const mediaRecorder = new MediaRecorder(stream)
    const chunks: Blob[] = []

    mediaRecorder.ondataavailable = (event) => {
      if (event.data.size > 0) {
        chunks.push(event.data)
      }
    }

    mediaRecorder.onstop = () => {
      const blob = new Blob(chunks, { type: 'video/webm' })
      setCapturedMedia({ blob, type: 'video' })
      stopCamera()
    }

    mediaRecorderRef.current = mediaRecorder
    mediaRecorder.start()
    setIsRecording(true)
  }, [stream, stopCamera])

  const stopRecording = useCallback(() => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop()
      setIsRecording(false)
    }
  }, [isRecording])

  const switchCamera = useCallback(() => {
    setFacingMode(prev => prev === 'user' ? 'environment' : 'user')
    stopCamera()
  }, [stopCamera])

  const uploadMedia = useCallback(async () => {
    if (!capturedMedia || !user) return

    setUploading(true)
    try {
      const file = new File(
        [capturedMedia.blob],
        `capture-${Date.now()}.${capturedMedia.type === 'image' ? 'jpg' : 'webm'}`,
        { type: capturedMedia.type === 'image' ? 'image/jpeg' : 'video/webm' }
      )

      const result = await uploadFile(file, user.id)
      if (result) {
        toast.success('ファイルをアップロードしました')
        setCapturedMedia(null)
        onCapture?.()
      } else {
        toast.error('アップロードに失敗しました')
      }
    } catch (error) {
      console.error('Upload error:', error)
      /** @ts-ignore */
      toast.error(`アップロードに失敗しました: ${error.message}`)
    } finally {
      setUploading(false)
    }
  }, [capturedMedia, user, onCapture])

  const retake = useCallback(() => {
    setCapturedMedia(null)
    startCamera()
  }, [startCamera])

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardContent className="p-6">
        <div className="space-y-4">
          {!capturedMedia ? (
            <>
              <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                {stream ? (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <Camera className="w-12 h-12 text-gray-400" />
                  </div>
                )}
              </div>

              <div className="flex justify-center space-x-4">
                {!stream ? (
                  <Button onClick={startCamera} className="flex-1">
                    <Camera className="w-4 h-4 mr-2" />
                    カメラを開始
                  </Button>
                ) : (
                  <>
                    <Button
                      onClick={capturePhoto}
                      variant="outline"
                      size="lg"
                      className="rounded-full w-16 h-16 p-0"
                    >
                      <Circle className="w-8 h-8" />
                    </Button>
                    
                    <Button
                      onClick={isRecording ? stopRecording : startRecording}
                      variant={isRecording ? "destructive" : "outline"}
                      size="lg"
                      className="rounded-full w-16 h-16 p-0"
                    >
                      <Square className="w-8 h-8" />
                    </Button>

                    <Button
                      onClick={switchCamera}
                      variant="outline"
                      size="lg"
                      className="rounded-full w-16 h-16 p-0"
                    >
                      <RotateCcw className="w-6 h-6" />
                    </Button>
                  </>
                )}
              </div>

              {isRecording && (
                <div className="text-center">
                  <div className="inline-flex items-center space-x-2 bg-red-100 text-red-800 px-3 py-1 rounded-full">
                    <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse"></div>
                    <span className="text-sm font-medium">録画中</span>
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="relative aspect-square bg-black rounded-lg overflow-hidden">
                {capturedMedia.type === 'image' ? (
                  <img
                    src={URL.createObjectURL(capturedMedia.blob)}
                    alt="Captured"
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <video
                    src={URL.createObjectURL(capturedMedia.blob)}
                    controls
                    className="w-full h-full object-cover"
                  />
                )}
              </div>

              <div className="flex space-x-2">
                <Button
                  onClick={retake}
                  variant="outline"
                  className="flex-1"
                >
                  撮り直し
                </Button>
                <Button
                  onClick={uploadMedia}
                  disabled={uploading}
                  className="flex-1"
                >
                  {uploading ? (
                    'アップロード中...'
                  ) : (
                    <>
                      <Upload className="w-4 h-4 mr-2" />
                      保存
                    </>
                  )}
                </Button>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}