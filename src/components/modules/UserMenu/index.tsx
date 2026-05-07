'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import { Button } from '@/components/ui/button'
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import { LogOut, User, Users, Shield, Building2 } from 'lucide-react'
import { toast } from 'sonner'

export function UserMenu() {
  const { currentUser, logout, setActiveModule } = useAppStore()

  if (!currentUser) return null

  const initials = `${currentUser.firstName?.[0] || ''}${currentUser.lastName?.[0] || ''}`.toUpperCase()

  const handleLogout = () => {
    logout()
    toast.info('Odjavljeni ste')
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="h-8 gap-2 px-2">
          <Avatar className="h-6 w-6">
            <AvatarFallback className="text-[10px] bg-primary text-primary-foreground">
              {initials}
            </AvatarFallback>
          </Avatar>
          <span className="text-xs font-medium hidden sm:inline">
            {currentUser.firstName} {currentUser.lastName}
          </span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-56">
        <DropdownMenuLabel>
          <div className="flex flex-col">
            <span className="text-sm font-medium">{currentUser.firstName} {currentUser.lastName}</span>
            <span className="text-xs text-muted-foreground">{currentUser.email}</span>
            {currentUser.isSuperAdmin && (
              <span className="text-[10px] text-primary font-medium mt-0.5 flex items-center gap-1">
                <Shield className="h-3 w-3" /> Super Admin
              </span>
            )}
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={() => setActiveModule('podesavanja')} className="cursor-pointer">
          <User className="h-4 w-4 mr-2" />
          Profil
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setActiveModule('podesavanja')} className="cursor-pointer">
          <Users className="h-4 w-4 mr-2" />
          Korisnici
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={handleLogout} className="text-destructive cursor-pointer">
          <LogOut className="h-4 w-4 mr-2" />
          Odjavi se
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
