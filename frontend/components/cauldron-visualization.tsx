"use client"

import { useEffect, useRef, useState } from "react"

interface CauldronVisualizationProps {
  spellCount: number
  isBrewingActive: boolean
}

export default function CauldronVisualization({ spellCount, isBrewingActive }: CauldronVisualizationProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [particles, setParticles] = useState<
    Array<{ x: number; y: number; vx: number; vy: number; life: number; hue: number }>
  >([])

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    let animationId: number
    let particleList = particles

    const createParticles = () => {
      if (!isBrewingActive) return

      const newParticles = []
      for (let i = 0; i < 8; i++) {
        newParticles.push({
          x: canvas.width / 2 + (Math.random() - 0.5) * 80,
          y: canvas.height / 2 + (Math.random() - 0.5) * 80,
          vx: (Math.random() - 0.5) * 6,
          vy: (Math.random() - 0.5) * 6 - 4,
          life: 1,
          hue: Math.random() * 60 + 200,
        })
      }
      particleList = [...particleList, ...newParticles].filter((p) => p.life > 0)
      setParticles(particleList)
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height)

      const centerX = canvas.width / 2
      const centerY = canvas.height / 2

      // Draw outer rune circle
      ctx.strokeStyle = `rgba(245, 197, 66, ${0.3 + (isBrewingActive ? 0.4 : 0)})`
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.arc(centerX, centerY, 120, 0, Math.PI * 2)
      ctx.stroke()

      // Draw cauldron rim with glow
      ctx.strokeStyle = "rgba(245, 197, 66, 0.8)"
      ctx.lineWidth = 4
      ctx.beginPath()
      ctx.ellipse(centerX, centerY - 40, 90, 60, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Draw cauldron glow
      ctx.strokeStyle = "rgba(124, 58, 237, 0.5)"
      ctx.lineWidth = 2
      ctx.beginPath()
      ctx.ellipse(centerX, centerY - 40, 95, 65, 0, 0, Math.PI * 2)
      ctx.stroke()

      // Draw cauldron body
      const gradient = ctx.createLinearGradient(centerX - 90, centerY - 40, centerX + 90, centerY + 60)
      gradient.addColorStop(0, "rgba(124, 58, 237, 0.3)")
      gradient.addColorStop(0.5, "rgba(79, 255, 234, 0.2)")
      gradient.addColorStop(1, "rgba(124, 58, 237, 0.2)")

      ctx.strokeStyle = gradient
      ctx.lineWidth = 3
      ctx.beginPath()
      ctx.moveTo(centerX - 90, centerY - 40)
      ctx.lineTo(centerX - 80, centerY + 60)
      ctx.moveTo(centerX + 90, centerY - 40)
      ctx.lineTo(centerX + 80, centerY + 60)
      ctx.stroke()

      // Draw runes around cauldron
      const runeCount = Math.min(spellCount, 6)
      for (let i = 0; i < runeCount; i++) {
        const angle = (i / runeCount) * Math.PI * 2
        const x = centerX + Math.cos(angle) * 110
        const y = centerY + Math.sin(angle) * 110
        const glow = ctx.createRadialGradient(x, y, 0, x, y, 15)
        glow.addColorStop(0, `rgba(245, 197, 66, ${0.6 + (isBrewingActive ? 0.4 : 0)})`)
        glow.addColorStop(1, "rgba(245, 197, 66, 0)")

        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(x, y, 15, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `rgba(245, 197, 66, ${0.8 + (isBrewingActive ? 0.2 : 0)})`
        ctx.font = "bold 12px Arial"
        ctx.textAlign = "center"
        ctx.textBaseline = "middle"
        ctx.fillText("✦", x, y)
      }

      // Update and draw particles
      particleList = particleList
        .map((p) => ({
          ...p,
          x: p.x + p.vx,
          y: p.y + p.vy,
          vy: p.vy + 0.2,
          life: p.life - 0.02,
        }))
        .filter((p) => p.life > 0)

      particleList.forEach((p) => {
        const size = 3 + p.life * 4
        const glow = ctx.createRadialGradient(p.x, p.y, 0, p.x, p.y, size * 2.5)
        glow.addColorStop(0, `hsla(${p.hue}, 100%, 60%, ${p.life * 0.9})`)
        glow.addColorStop(1, `hsla(${p.hue}, 100%, 50%, 0)`)

        ctx.fillStyle = glow
        ctx.beginPath()
        ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2)
        ctx.fill()

        ctx.fillStyle = `hsla(${p.hue}, 100%, 70%, ${p.life})`
        ctx.beginPath()
        ctx.arc(p.x, p.y, size, 0, Math.PI * 2)
        ctx.fill()
      })

      setParticles(particleList)

      if (isBrewingActive) {
        createParticles()
      }

      animationId = requestAnimationFrame(animate)
    }

    animate()

    return () => cancelAnimationFrame(animationId)
  }, [isBrewingActive, spellCount])

  return (
    <div className="flex flex-col items-center justify-center h-full space-y-8">
      <div className="relative">
        <div className="absolute -inset-12 bg-gradient-to-r from-primary/30 via-accent/20 to-secondary/30 rounded-3xl opacity-60 blur-3xl animate-pulse" />
        <div className="absolute -inset-8 bg-gradient-to-r from-primary/40 via-secondary/30 to-accent/40 rounded-2xl opacity-40 blur-2xl" />

        <canvas
          ref={canvasRef}
          width={500}
          height={500}
          className="relative border-4 border-accent/70 rounded-3xl bg-gradient-to-b from-primary/15 to-secondary/10 shadow-2xl shadow-accent/40 cauldron-bubble"
        />
      </div>

      {isBrewingActive && (
        <div className="text-center space-y-4">
          <p className="text-2xl font-black bg-gradient-to-r from-accent via-secondary to-accent bg-clip-text text-transparent uppercase tracking-widest animate-pulse">
            ⚗️ Brewing Potion...
          </p>
          <div className="flex gap-2 justify-center">
            <div className="w-3 h-3 bg-accent rounded-full animate-bounce" style={{ animationDelay: "0s" }} />
            <div className="w-3 h-3 bg-secondary rounded-full animate-bounce" style={{ animationDelay: "0.2s" }} />
            <div className="w-3 h-3 bg-primary rounded-full animate-bounce" style={{ animationDelay: "0.4s" }} />
          </div>
        </div>
      )}
    </div>
  )
}
