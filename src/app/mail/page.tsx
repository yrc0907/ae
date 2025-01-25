"use client"
import React from 'react'
// import Mail from './mail'
import dynamic from 'next/dynamic'
import ThemeToggle from '@/components/theme-togger'
import { UserButton } from '@clerk/nextjs'

const ComposeButton = dynamic(() => {
  return import('./compose-button')
},{
  ssr: false, // this is important to avoid server rendering
})
const Mail = dynamic(() => {
  return import('./mail')
},{
  ssr: false, // this is important to avoid server rendering
})
const page = () => {
  return (
    <>
    <div className='absolute bottom-4 left-4'>
      <div className='flex items-center gap-2'>
      <UserButton/>
      <ThemeToggle/>
      <ComposeButton/>
      </div>

    </div>
      <Mail
        defaultLayout={[20,32,40]}
        defaultCollapsed={false}
        navCollapsedSize={4}
      />
    </>
  )
}

export default page
