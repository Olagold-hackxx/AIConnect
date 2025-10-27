"use client"

import { Suspense, useRef, useState } from "react"
import { Canvas, useFrame, useThree } from "@react-three/fiber"
import { OrbitControls, Environment, PerspectiveCamera, Float, Text } from "@react-three/drei"
import { Button } from "@/components/ui/button"
import { ArrowRight, Sparkles } from "lucide-react"
import * as THREE from "three"

function AIRobot() {
  const groupRef = useRef<THREE.Group>(null)
  const headRef = useRef<THREE.Mesh>(null)
  const leftArmRef = useRef<THREE.Group>(null)   // ✅ Group, not Mesh
  const rightArmRef = useRef<THREE.Group>(null)  // ✅ Group, not Mesh
  const leftLegRef = useRef<THREE.Group>(null)   // ✅ Group, not Mesh
  const rightLegRef = useRef<THREE.Group>(null)  // ✅ Group, not Mesh
  const leftEyeRef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null)
  const rightEyeRef = useRef<THREE.Mesh<THREE.BufferGeometry, THREE.MeshStandardMaterial>>(null)
  const [isHovered, setIsHovered] = useState(false)
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 })
  
  const { viewport } = useThree()

  useFrame((state) => {
    const time = state.clock.getElapsedTime()
    
    // Body breathing animation
    if (groupRef.current) {
      groupRef.current.scale.y = 1 + Math.sin(time * 1.5) * 0.02
      groupRef.current.rotation.y = Math.sin(time * 0.3) * 0.1
    }

    // Head movements - more expressive
    if (headRef.current) {
      if (isHovered) {
        // Look at cursor when hovered
        headRef.current.rotation.y = mousePos.x * 0.3
        headRef.current.rotation.x = -mousePos.y * 0.2
        headRef.current.position.y = 1.3 + Math.sin(time * 3) * 0.03
      } else {
        // Idle head bobbing and looking around
        headRef.current.rotation.y = Math.sin(time * 0.5) * 0.3
        headRef.current.rotation.x = Math.sin(time * 0.7) * 0.1
        headRef.current.position.y = 1.3 + Math.sin(time * 2) * 0.02
      }
    }

    // Blinking eyes
    if (leftEyeRef.current && rightEyeRef.current) {
      const blinkCycle = Math.sin(time * 0.5) * 0.5 + 0.5
      const blink = blinkCycle < 0.1 ? 0.3 : 1
      leftEyeRef.current.scale.y = blink
      rightEyeRef.current.scale.y = blink
      
      if (isHovered) {
        leftEyeRef.current.material.emissiveIntensity = 2
        rightEyeRef.current.material.emissiveIntensity = 2
      } else {
        leftEyeRef.current.material.emissiveIntensity = 1
        rightEyeRef.current.material.emissiveIntensity = 1
      }
    }

    // Arm waving animation
    if (leftArmRef.current && rightArmRef.current) {
      if (isHovered) {
        // Wave enthusiastically when hovered
        rightArmRef.current.rotation.z = Math.sin(time * 8) * 0.8 - 0.3
        rightArmRef.current.rotation.x = Math.sin(time * 8) * 0.3
        leftArmRef.current.rotation.z = Math.sin(time * 4) * 0.2 + 0.3
      } else {
        // Gentle idle arm movement
        rightArmRef.current.rotation.z = Math.sin(time * 1.2) * 0.1 - 0.1
        leftArmRef.current.rotation.z = Math.sin(time * 1.5) * 0.1 + 0.1
      }
    }

    // Walking animation for legs
    if (leftLegRef.current && rightLegRef.current) {
      const walkSpeed = isHovered ? 4 : 2
      leftLegRef.current.rotation.x = Math.sin(time * walkSpeed) * 0.2
      rightLegRef.current.rotation.x = Math.sin(time * walkSpeed + Math.PI) * 0.2
    }
  })

  const handlePointerMove = (e: { point: { x: number; y: number } }) => {
    setMousePos({
      x: (e.point.x / viewport.width) * 2,
      y: (e.point.y / viewport.height) * 2
    })
  }

  return (
    <Float speed={1.5} rotationIntensity={0.2} floatIntensity={0.3}>
      <group 
        ref={groupRef}
        onPointerOver={() => setIsHovered(true)}
        onPointerOut={() => setIsHovered(false)}
        onPointerMove={handlePointerMove}
      >
        {/* Head - more rounded and humanoid */}
        <mesh ref={headRef} position={[0, 1.3, 0]} castShadow>
          <sphereGeometry args={[0.45, 32, 32]} />
          <meshStandardMaterial
            color="#6366f1"
            emissive="#8b5cf6"
            emissiveIntensity={isHovered ? 0.6 : 0.3}
            roughness={0.2}
            metalness={0.9}
          />
        </mesh>

        {/* Face plate */}
        <mesh position={[0, 1.3, 0.42]}>
          <circleGeometry args={[0.35, 32]} />
          <meshStandardMaterial 
            color="#1e1b4b" 
            metalness={0.9}
            roughness={0.1}
          />
        </mesh>

        {/* Eyes - more expressive */}
        <mesh ref={leftEyeRef} position={[-0.15, 1.35, 0.43]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1} />
        </mesh>
        <mesh ref={rightEyeRef} position={[0.15, 1.35, 0.43]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial color="#06b6d4" emissive="#06b6d4" emissiveIntensity={1} />
        </mesh>

        {/* Smile indicator */}
        <mesh position={[0, 1.2, 0.43]}>
          <torusGeometry args={[0.12, 0.02, 16, 32, Math.PI]} />
          <meshStandardMaterial 
            color="#06b6d4" 
            emissive="#06b6d4" 
            emissiveIntensity={isHovered ? 1.5 : 0.5} 
          />
        </mesh>

        {/* Antenna with pulsing tip */}
        <mesh position={[0, 1.85, 0]}>
          <cylinderGeometry args={[0.03, 0.03, 0.3, 8]} />
          <meshStandardMaterial color="#8b5cf6" emissive="#8b5cf6" emissiveIntensity={0.5} metalness={0.9} />
        </mesh>
        <mesh position={[0, 2.05, 0]}>
          <sphereGeometry args={[0.08, 16, 16]} />
          <meshStandardMaterial 
            color="#06b6d4" 
            emissive="#06b6d4" 
            emissiveIntensity={isHovered ? 2 : 1}
            toneMapped={false}
          />
        </mesh>

        {/* Neck */}
        <mesh position={[0, 0.95, 0]}>
          <cylinderGeometry args={[0.15, 0.18, 0.2, 16]} />
          <meshStandardMaterial color="#4f46e5" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Torso - more humanoid proportions */}
        <mesh position={[0, 0.3, 0]} castShadow>
          <boxGeometry args={[0.9, 1.0, 0.5]} />
          <meshStandardMaterial
            color="#4f46e5"
            emissive="#7c3aed"
            emissiveIntensity={isHovered ? 0.4 : 0.2}
            roughness={0.3}
            metalness={0.8}
          />
        </mesh>

        {/* Chest Arc Reactor */}
        <mesh position={[0, 0.4, 0.26]}>
          <torusGeometry args={[0.15, 0.03, 16, 32]} />
          <meshStandardMaterial 
            color="#06b6d4" 
            emissive="#06b6d4" 
            emissiveIntensity={isHovered ? 2 : 1}
            metalness={0.9}
            toneMapped={false}
          />
        </mesh>
        <mesh position={[0, 0.4, 0.27]}>
          <circleGeometry args={[0.1, 32]} />
          <meshStandardMaterial 
            color="#06b6d4" 
            emissive="#06b6d4" 
            emissiveIntensity={isHovered ? 1.5 : 0.8}
            toneMapped={false}
          />
        </mesh>

        {/* Shoulders */}
        <mesh position={[-0.55, 0.7, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.8} />
        </mesh>
        <mesh position={[0.55, 0.7, 0]}>
          <sphereGeometry args={[0.18, 16, 16]} />
          <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Left Arm */}
        <group ref={leftArmRef} position={[-0.55, 0.7, 0]}>
          <mesh position={[0, -0.35, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.10, 0.7, 16]} />
            <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Elbow joint */}
          <mesh position={[0, -0.7, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#8b5cf6" metalness={0.9} />
          </mesh>
          {/* Forearm */}
          <mesh position={[0, -1.05, 0]}>
            <cylinderGeometry args={[0.10, 0.09, 0.7, 16]} />
            <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.8} />
          </mesh>
          {/* Hand */}
          <mesh position={[0, -1.45, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial 
              color="#8b5cf6" 
              emissive="#8b5cf6" 
              emissiveIntensity={0.3} 
              metalness={0.9} 
            />
          </mesh>
        </group>

        {/* Right Arm */}
        <group ref={rightArmRef} position={[0.55, 0.7, 0]}>
          <mesh position={[0, -0.35, 0]} castShadow>
            <cylinderGeometry args={[0.12, 0.10, 0.7, 16]} />
            <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.7, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial color="#8b5cf6" metalness={0.9} />
          </mesh>
          <mesh position={[0, -1.05, 0]}>
            <cylinderGeometry args={[0.10, 0.09, 0.7, 16]} />
            <meshStandardMaterial color="#6366f1" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, -1.45, 0]}>
            <sphereGeometry args={[0.12, 16, 16]} />
            <meshStandardMaterial 
              color="#8b5cf6" 
              emissive="#8b5cf6" 
              emissiveIntensity={0.3} 
              metalness={0.9} 
            />
          </mesh>
        </group>

        {/* Hip */}
        <mesh position={[0, -0.3, 0]}>
          <boxGeometry args={[0.8, 0.25, 0.45]} />
          <meshStandardMaterial color="#4f46e5" roughness={0.3} metalness={0.8} />
        </mesh>

        {/* Left Leg */}
        <group ref={leftLegRef} position={[-0.25, -0.42, 0]}>
          <mesh position={[0, -0.35, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.12, 0.7, 16]} />
            <meshStandardMaterial color="#4f46e5" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.77, 0]}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial color="#6366f1" metalness={0.9} />
          </mesh>
          <mesh position={[0, -1.15, 0]}>
            <cylinderGeometry args={[0.12, 0.11, 0.75, 16]} />
            <meshStandardMaterial color="#4f46e5" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, -1.6, 0.1]}>
            <boxGeometry args={[0.25, 0.12, 0.35]} />
            <meshStandardMaterial color="#6366f1" metalness={0.9} />
          </mesh>
        </group>

        {/* Right Leg */}
        <group ref={rightLegRef} position={[0.25, -0.42, 0]}>
          <mesh position={[0, -0.35, 0]} castShadow>
            <cylinderGeometry args={[0.14, 0.12, 0.7, 16]} />
            <meshStandardMaterial color="#4f46e5" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, -0.77, 0]}>
            <sphereGeometry args={[0.13, 16, 16]} />
            <meshStandardMaterial color="#6366f1" metalness={0.9} />
          </mesh>
          <mesh position={[0, -1.15, 0]}>
            <cylinderGeometry args={[0.12, 0.11, 0.75, 16]} />
            <meshStandardMaterial color="#4f46e5" roughness={0.3} metalness={0.8} />
          </mesh>
          <mesh position={[0, -1.6, 0.1]}>
            <boxGeometry args={[0.25, 0.12, 0.35]} />
            <meshStandardMaterial color="#6366f1" metalness={0.9} />
          </mesh>
        </group>

        {/* Glow effect - stronger when hovered */}
        <mesh position={[0, 0.3, 0]}>
          <sphereGeometry args={[2.5, 32, 32]} />
          <meshStandardMaterial 
            color="#8b5cf6" 
            transparent 
            opacity={isHovered ? 0.15 : 0.05} 
            emissive="#8b5cf6" 
            emissiveIntensity={isHovered ? 0.6 : 0.2} 
          />
        </mesh>

        {/* Hover text */}
        {isHovered && (
          <Text
            position={[0, 2.5, 0]}
            fontSize={0.2}
            color="#06b6d4"
            anchorX="center"
            anchorY="middle"
          >
            Hello! I'm your AI Employee
          </Text>
        )}
      </group>
    </Float>
  )
}

export function Scene() {
  return (
    <>
      <PerspectiveCamera makeDefault position={[0, 0.7, 7]} />
      <OrbitControls 
        enableZoom={false} 
        enablePan={false}
        minPolarAngle={Math.PI / 3}
        maxPolarAngle={Math.PI / 1.8}
        autoRotate
        autoRotateSpeed={0.5}
      />
      
      <ambientLight intensity={0.6} />
      <directionalLight position={[10, 10, 5]} intensity={1.5} castShadow />
      <pointLight position={[-10, -10, -5]} intensity={0.8} color="#8b5cf6" />
      <spotLight position={[0, 5, 0]} intensity={0.5} color="#06b6d4" />
      
      <AIRobot />
      
      <Environment preset="city" />
    </>
  )
}