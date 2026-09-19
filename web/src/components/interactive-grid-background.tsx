/*
Copyright (C) 2023-2026 QuantumNous

This program is free software: you can redistribute it and/or modify
it under the terms of the GNU Affero General Public License as
published by the Free Software Foundation, either version 3 of the
License, or (at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
GNU Affero General Public License for more details.

You should have received a copy of the GNU Affero General Public License
along with this program. If not, see <https://www.gnu.org/licenses/>.

For commercial licensing, please contact support@quantumnous.com
*/
import { useEffect, useRef } from 'react'
import { motion } from 'motion/react'
import { cn } from '@/lib/utils'

interface InteractiveGridBackgroundProps {
  className?: string
  /**
   * Whether to focus the background onto a central card (for login/register pages)
   * with radial vignetting and smooth entrance transition.
   */
  focused?: boolean
}

interface GridDot {
  originX: number
  originY: number
  currentX: number
  currentY: number
}

const GRID_SIZE = 90
const INFLUENCE_RADIUS = 150
const MAX_PULL = 26
const SPRING_FACTOR = 0.12

export function InteractiveGridBackground({
  className,
  focused = false,
}: InteractiveGridBackgroundProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const mouseRef = useRef<{ x: number; y: number; active: boolean }>({
    x: -9999,
    y: -9999,
    active: false,
  })
  const dotsRef = useRef<GridDot[]>([])
  const isRunningRef = useRef(false)
  const rafIdRef = useRef<number | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    let width = 0
    let height = 0
    let dpr = 1

    const initGrid = () => {
      width = window.innerWidth
      height = window.innerHeight
      dpr = Math.min(window.devicePixelRatio || 1, 2)

      canvas.width = Math.floor(width * dpr)
      canvas.height = Math.floor(height * dpr)
      canvas.style.width = `${width}px`
      canvas.style.height = `${height}px`
      ctx.setTransform(1, 0, 0, 1, 0, 0)
      ctx.scale(dpr, dpr)

      // Calculate grid dot origins centered horizontally (matching CSS background-position: top center)
      const dots: GridDot[] = []
      const centerX = width / 2
      const maxColDist = Math.ceil(width / 2 / GRID_SIZE) + 1
      const maxRows = Math.ceil(height / GRID_SIZE) + 1

      for (let row = 0; row <= maxRows; row++) {
        const originY = 45 + row * GRID_SIZE
        for (let col = -maxColDist; col <= maxColDist; col++) {
          const originX = centerX + col * GRID_SIZE
          dots.push({
            originX,
            originY,
            currentX: originX,
            currentY: originY,
          })
        }
      }
      dotsRef.current = dots
      renderOnce()
    }

    const renderOnce = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)

      const isDark = document.documentElement.classList.contains('dark')
      const baseRadius = isDark ? 1.0 : 1.15
      const baseOpacity = isDark ? 0.18 : 0.22

      for (const dot of dotsRef.current) {
        ctx.beginPath()
        ctx.arc(dot.currentX, dot.currentY, baseRadius, 0, Math.PI * 2)
        ctx.fillStyle = isDark
          ? `rgba(255, 255, 255, ${baseOpacity})`
          : `rgba(45, 55, 72, ${baseOpacity})`
        ctx.fill()
      }
    }

    const renderLoop = () => {
      if (!ctx) return
      ctx.clearRect(0, 0, width, height)

      const isDark = document.documentElement.classList.contains('dark')
      const baseRadius = isDark ? 1.0 : 1.15
      const baseOpacity = isDark ? 0.18 : 0.22
      const mouse = mouseRef.current

      let stillMoving = false

      for (const dot of dotsRef.current) {
        let targetX = dot.originX
        let targetY = dot.originY

        if (mouse.active) {
          const dx = mouse.x - dot.originX
          const dy = mouse.y - dot.originY
          const dist = Math.hypot(dx, dy)

          if (dist < INFLUENCE_RADIUS && dist > 0.001) {
            const norm = 1 - dist / INFLUENCE_RADIUS
            // Smoothstep curve for natural magnetic gravitation
            const smooth = norm * norm * (3 - 2 * norm)
            const pull = Math.min(dist * 0.45, MAX_PULL) * smooth
            targetX = dot.originX + (dx / dist) * pull
            targetY = dot.originY + (dy / dist) * pull
          }
        }

        // Spring lerp towards target
        const vx = (targetX - dot.currentX) * SPRING_FACTOR
        const vy = (targetY - dot.currentY) * SPRING_FACTOR
        dot.currentX += vx
        dot.currentY += vy

        if (Math.abs(vx) > 0.02 || Math.abs(vy) > 0.02) {
          stillMoving = true
        }

        // Draw dot with dynamic magnetic glow/enlarge
        const disp = Math.hypot(dot.currentX - dot.originX, dot.currentY - dot.originY)
        const dispNorm = Math.min(disp / 18, 1)

        const r = baseRadius + dispNorm * 0.75
        const opacity = baseOpacity + dispNorm * (isDark ? 0.6 : 0.55)

        ctx.beginPath()
        ctx.arc(dot.currentX, dot.currentY, r, 0, Math.PI * 2)
        ctx.fillStyle = isDark
          ? `rgba(255, 255, 255, ${opacity})`
          : `rgba(25, 30, 40, ${opacity})`
        ctx.fill()
      }

      // If active or returning home, keep animating. Otherwise, pause to save 0% idle CPU.
      if (stillMoving || mouse.active) {
        rafIdRef.current = requestAnimationFrame(renderLoop)
      } else {
        isRunningRef.current = false
      }
    }

    const startLoop = () => {
      if (!isRunningRef.current) {
        isRunningRef.current = true
        rafIdRef.current = requestAnimationFrame(renderLoop)
      }
    }

    const onPointerMove = (e: PointerEvent) => {
      mouseRef.current.x = e.clientX
      mouseRef.current.y = e.clientY
      mouseRef.current.active = true
      startLoop()
    }

    const onPointerLeave = () => {
      mouseRef.current.active = false
      startLoop() // Keep loop running to let dots spring smoothly back to origin
    }

    window.addEventListener('pointermove', onPointerMove, { passive: true })
    document.addEventListener('mouseleave', onPointerLeave)
    window.addEventListener('resize', initGrid)

    // Watch for dark mode changes
    const observer = new MutationObserver(() => {
      if (!isRunningRef.current) renderOnce()
    })
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class'],
    })

    initGrid()

    return () => {
      window.removeEventListener('pointermove', onPointerMove)
      document.removeEventListener('mouseleave', onPointerLeave)
      window.removeEventListener('resize', initGrid)
      observer.disconnect()
      if (rafIdRef.current) {
        cancelAnimationFrame(rafIdRef.current)
      }
    }
  }, [])

  if (focused) {
    return (
      <div
        aria-hidden
        className={cn(
          'pointer-events-none fixed inset-0 -z-10 select-none overflow-hidden isolate',
          className
        )}
      >
        {/* Focused radial spotlight mask with smooth entrance transition */}
        <motion.div
          initial={{ opacity: 0, scale: 0.94 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.65, ease: [0.16, 1, 0.3, 1] }}
          className='absolute inset-0'
          style={{
            maskImage:
              'radial-gradient(ellipse 580px 500px at 50% 50%, black 15%, rgba(0,0,0,0.45) 55%, transparent 100%)',
            WebkitMaskImage:
              'radial-gradient(ellipse 580px 500px at 50% 50%, black 15%, rgba(0,0,0,0.45) 55%, transparent 100%)',
          }}
        >
          <div className='absolute inset-0 hexhub-grid-pattern' />
          <canvas ref={canvasRef} className='absolute inset-0' />
        </motion.div>

        {/* Ambient subtle center glow behind card */}
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.8, ease: 'easeOut' }}
          className='pointer-events-none absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 h-[520px] w-[580px] rounded-full bg-radial from-neutral-300/30 via-neutral-200/10 to-transparent blur-3xl dark:from-white/10 dark:via-white/5 dark:to-transparent'
        />
      </div>
    )
  }

  return (
    <div
      aria-hidden
      className={cn(
        'pointer-events-none fixed inset-0 -z-10 select-none overflow-hidden',
        className
      )}
    >
      <div className='absolute inset-0 hexhub-grid-pattern' />
      <canvas ref={canvasRef} className='absolute inset-0' />
    </div>
  )
}
