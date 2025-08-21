'use client'

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Camera, Grid3X3, LogOut, User } from 'lucide-react'
import { useAuth } from '@/components/AuthProvider'
import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Navigation() {
  const { user, signOut } = useAuth()
  const pathname = usePathname()

  if (!user) return null

  return (
    <nav className="border-b bg-white sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center space-x-8">
            <Link href="/" className="text-xl font-bold text-gray-900">
              MediaCapture
            </Link>
            
            <div className="hidden sm:flex space-x-4">
              <Link href="/camera">
                <Button 
                  variant={pathname === '/camera' ? 'default' : 'ghost'}
                  className="flex items-center"
                >
                  <Camera className="w-4 h-4 mr-2" />
                  撮影
                </Button>
              </Link>
              
              <Link href="/gallery">
                <Button 
                  variant={pathname === '/gallery' ? 'default' : 'ghost'}
                  className="flex items-center"
                >
                  <Grid3X3 className="w-4 h-4 mr-2" />
                  ギャラリー
                </Button>
              </Link>
            </div>
          </div>

          <div className="flex items-center">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" className="relative h-8 w-8 rounded-full">
                  <Avatar className="h-8 w-8">
                    <AvatarImage 
                      src={user.user_metadata?.avatar_url} 
                      alt={user.user_metadata?.full_name || user.email || 'User'}
                    />
                    <AvatarFallback>
                      <User className="h-4 w-4" />
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent className="w-56" align="end" forceMount>
                <div className="flex flex-col space-y-1 p-2">
                  <p className="text-sm font-medium leading-none">
                    {user.user_metadata?.full_name || 'ユーザー'}
                  </p>
                  <p className="text-xs leading-none text-muted-foreground">
                    {user.email}
                  </p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={signOut}>
                  <LogOut className="mr-2 h-4 w-4" />
                  <span>ログアウト</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>

      {/* Mobile Navigation */}
      <div className="sm:hidden border-t bg-white">
        <div className="flex">
          <Link href="/camera" className="flex-1">
            <Button 
              variant={pathname === '/camera' ? 'default' : 'ghost'}
              className="w-full rounded-none"
            >
              <Camera className="w-4 h-4 mr-2" />
              撮影
            </Button>
          </Link>
          
          <Link href="/gallery" className="flex-1">
            <Button 
              variant={pathname === '/gallery' ? 'default' : 'ghost'}
              className="w-full rounded-none"
            >
              <Grid3X3 className="w-4 h-4 mr-2" />
              ギャラリー
            </Button>
          </Link>
        </div>
      </div>
    </nav>
  )
}