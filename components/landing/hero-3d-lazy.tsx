"use client"
import dynamic from 'next/dynamic'

const Hero3D = dynamic(() => import('./hero-3d').then(mod => ({ default: mod.Hero3D })), {
  ssr: false,
  loading: () => (
    <div className="relative w-full h-screen flex items-center justify-center ">
       <div className="animated-gradient absolute inset-0" />
      <div className="gradient-orb gradient-orb-1 absolute z-10" />
      <div className="gradient-orb gradient-orb-2 absolute z-10" />
      <div className="gradient-orb gradient-orb-3 absolute z-10" />
      <div className="text-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
      </div>
    </div>
  )
})

export default Hero3D