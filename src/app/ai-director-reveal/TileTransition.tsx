'use client'

import { useEffect, useState, useMemo } from 'react'
import type { Occasion } from './prototype'

export type TileVariant =
  | 'tileFadeOut'
  | 'tileSlideOut'
  | 'tileDissolve'
  | 'tileFlipOut'
  | 'tileChapterReveal'
  | 'tileFinale'

interface TileTransitionProps {
  variant: TileVariant
  occasion: Occasion
  onComplete: () => void
  isMobile: boolean
}

interface TileData {
  col: number
  row: number
  delay: number
  slideX: number
  slideY: number
}

function generateTileGrid(columns: number, rows: number, variant: TileVariant): TileData[] {
  const tiles: TileData[] = []
  const total = columns * rows
  const centerCol = Math.floor(columns / 2)
  const centerRow = Math.floor(rows / 2)

  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < columns; col++) {
      const index = row * columns + col

      // Calculate delay based on variant pattern
      let delay = 0
      let slideX = 0
      let slideY = 0

      switch (variant) {
        case 'tileFadeOut':
          // Diagonal wave from top-left to bottom-right
          delay = (col + row) * 15
          break

        case 'tileSlideOut':
          // From center outward
          const distFromCenter = Math.abs(col - centerCol) + Math.abs(row - centerRow)
          delay = distFromCenter * 20
          // Slide direction based on position relative to center
          slideX = (col - centerCol) * 30
          slideY = (row - centerRow) * 30
          break

        case 'tileDissolve':
          // Checkerboard pattern
          const isEven = (col + row) % 2 === 0
          delay = isEven ? index * 2 : (total - index) * 2
          break

        case 'tileFlipOut':
          // Left to right wave
          delay = col * 25
          break

        case 'tileChapterReveal':
          // Fast outward from center
          const dist = Math.abs(col - centerCol) + Math.abs(row - centerRow)
          delay = dist * 15
          slideX = (col - centerCol) * 40
          slideY = (row - centerRow) * 40
          break

        case 'tileFinale':
          // Cascade down with slight variation
          delay = row * 40 + col * 10
          slideY = 40
          break
      }

      tiles.push({
        col: col + 1,
        row: row + 1,
        delay,
        slideX,
        slideY,
      })
    }
  }

  return tiles
}

function getVariantDuration(variant: TileVariant): number {
  switch (variant) {
    case 'tileFadeOut':
      return 450
    case 'tileSlideOut':
      return 500
    case 'tileDissolve':
      return 480
    case 'tileFlipOut':
      return 520
    case 'tileChapterReveal':
      return 400
    case 'tileFinale':
      return 600
    default:
      return 500
  }
}

export function TileTransition({ variant, occasion, onComplete, isMobile }: TileTransitionProps) {
  const [isVisible, setIsVisible] = useState(true)

  // Grid size based on viewport
  const columns = isMobile ? 6 : 10
  const rows = isMobile ? 5 : 8

  // Generate tiles with memoization to prevent regeneration on re-render
  const tiles = useMemo(() => generateTileGrid(columns, rows, variant), [columns, rows, variant])

  useEffect(() => {
    // Get base duration from variant
    const baseDuration = getVariantDuration(variant)

    // Add buffer for staggered tiles to finish (max delay + animation time)
    const maxDelay = Math.max(...tiles.map(t => t.delay))
    const totalDuration = baseDuration + maxDelay + 50 // 50ms buffer

    // Hide tiles and call onComplete after animation
    const timer = setTimeout(() => {
      setIsVisible(false)
      onComplete()
    }, totalDuration)

    return () => clearTimeout(timer)
  }, [variant, tiles, onComplete])

  if (!isVisible) return null

  return (
    <div
      className="tile-overlay"
      style={{
        position: 'absolute',
        inset: 0,
        display: 'grid',
        gridTemplateColumns: `repeat(${columns}, 1fr)`,
        gridTemplateRows: `repeat(${rows}, 1fr)`,
        zIndex: 10,
        pointerEvents: 'none',
      }}
    >
      <style dangerouslySetInnerHTML={{
        __html: `
          .tile-overlay .tile {
            background: var(--paper, #fffaf3);
            opacity: 0.95;
            animation-fill-mode: forwards;
            animation-timing-function: cubic-bezier(0.4, 0, 0.2, 1);
            will-change: transform, opacity;
          }

          @keyframes tileFadeOut {
            from { opacity: 0.95; }
            to { opacity: 0; }
          }

          @keyframes tileSlideOut {
            from {
              opacity: 0.95;
              transform: translate(0, 0);
            }
            to {
              opacity: 0;
              transform: translate(var(--slide-x), var(--slide-y));
            }
          }

          @keyframes tileDissolve {
            from {
              opacity: 0.95;
              transform: scale(1);
            }
            to {
              opacity: 0;
              transform: scale(0.7);
            }
          }

          @keyframes tileFlipOut {
            from {
              opacity: 0.95;
              transform: rotateY(0deg);
            }
            to {
              opacity: 0;
              transform: rotateY(90deg);
            }
          }

          @keyframes tileChapterReveal {
            from {
              opacity: 0.98;
              transform: translate(0, 0) scale(1);
            }
            to {
              opacity: 0;
              transform: translate(var(--slide-x), var(--slide-y)) scale(0.8);
            }
          }

          @keyframes tileFinale {
            from {
              opacity: 0.95;
              transform: translateY(0) rotate(0deg);
            }
            to {
              opacity: 0;
              transform: translateY(var(--slide-y)) rotate(5deg);
            }
          }

          @media (prefers-reduced-motion: reduce) {
            .tile-overlay .tile {
              animation: none !important;
              opacity: 0 !important;
            }
          }
        `
      }} />
      {tiles.map((tile, i) => (
        <div
          key={i}
          className="tile"
          style={{
            gridColumn: tile.col,
            gridRow: tile.row,
            animationName: variant,
            animationDuration: `${getVariantDuration(variant)}ms`,
            animationDelay: `${tile.delay}ms`,
            ['--slide-x' as string]: `${tile.slideX}px`,
            ['--slide-y' as string]: `${tile.slideY}px`,
          }}
        />
      ))}
    </div>
  )
}
