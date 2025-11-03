'use client'
import React from 'react'
import { cn } from '@/lib/utils'
import { useThemeMode } from '@/app/hooks/settings/use-settings'
import { SystemMode } from './themes-placeholder/systemmode'
import { LightMode } from './themes-placeholder/lightmode'
import { DarkMode } from './themes-placeholder/darkmode'


const DarkModetoggle = () => {
  const { setTheme, theme } = useThemeMode()

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-10">
      <div className="lg:col-span-4 flex lg:flex-row flex-col items-start gap-5">
        <div
          className={cn(
            'w-full sm:w-auto rounded-2xl overflow-hidden cursor-not-allowed border-2  border-transparent opacity-40',
            theme == 'system' && 'border-[#562ae6] dark:border-[#734df1]'
          )}
          // onClick={() => setTheme('system')}
        >
          <SystemMode />
        </div>
        <div
          className={cn(
            'w-full sm:w-auto rounded-2xl overflow-hidden cursor-pointer border-2 border-transparent',
            theme == 'light' && 'border-[#562ae6] dark:border-[#734df1]'
          )}
          onClick={() => setTheme('light')}
        >
          <LightMode />
        </div>
        <div
          className={cn(
            'w-full sm:w-auto rounded-2xl overflow-hidden cursor-not-allowed border-2  border-transparent opacity-40',
            theme == 'dark' && 'border-[#562ae6] dark:border-[#734df1]'
          )}
          // onClick={() => setTheme('dark')}
        >
          <DarkMode />
        </div>
      </div>
    </div>
  )
}

export default DarkModetoggle