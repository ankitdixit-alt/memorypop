/**
 * Decorative Overlay - Occasion-aware decorations scoped to reveal stage
 * Using inline styles (no Tailwind dependency)
 */

'use client'

import { useEffect, useState } from 'react'

interface DecorativeOverlayProps {
  elements: string[]
  intensity: 'subtle' | 'moderate' | 'celebration'
  speed: 'slow' | 'medium' | 'fast'
  enabled: boolean
  sceneType?: 'opening' | 'chapter' | 'memory' | 'video' | 'letter' | 'finale' | 'closing'
}

const baseStyle: React.CSSProperties = {
  position: 'absolute',
  pointerEvents: 'none',
  userSelect: 'none',
}

// Animation definitions
const animations = `
  @keyframes decorBounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-10px); }
  }
  @keyframes decorBounceSlow {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  @keyframes decorPulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.5; }
  }
  @keyframes decorPulseSlow {
    0%, 100% { opacity: 0.9; }
    50% { opacity: 0.3; }
  }
  @keyframes decorFloat {
    0%, 100% { transform: translateY(0) translateX(0); }
    33% { transform: translateY(-8px) translateX(3px); }
    66% { transform: translateY(-4px) translateX(-3px); }
  }
  @keyframes decorFloatSlow {
    0%, 100% { transform: translateY(0) translateX(0); }
    50% { transform: translateY(-5px) translateX(2px); }
  }
  @keyframes decorDrift {
    0% { transform: translateY(0) rotate(0deg); opacity: 0.8; }
    100% { transform: translateY(100px) rotate(20deg); opacity: 0; }
  }
  @keyframes decorDriftSlow {
    0% { transform: translateY(0) rotate(0deg); opacity: 0.6; }
    100% { transform: translateY(60px) rotate(10deg); opacity: 0; }
  }
  @keyframes decorGlow {
    0%, 100% { opacity: 0.4; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.05); }
  }
`

export function DecorativeOverlay({ elements, intensity, speed, enabled, sceneType = 'memory' }: DecorativeOverlayProps) {
  const [show, setShow] = useState(false)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 850)
    }
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  useEffect(() => {
    if (enabled && elements.length > 0) {
      setShow(true)
    } else {
      setShow(false)
    }
  }, [enabled, elements.length])

  // Hide decorations for scenes with heavy text or full-screen media
  const shouldHide = sceneType === 'video' || sceneType === 'letter' || sceneType === 'closing'
  // Reduce decorations for finale (keep it elegant)
  const isFinale = sceneType === 'finale'

  if (!enabled || elements.length === 0 || !show || shouldHide) {
    return null
  }

  const opacity = intensity === 'subtle' ? 0.4 : intensity === 'moderate' ? 0.5 : 0.6

  return (
    <>
      <style dangerouslySetInnerHTML={{ __html: animations }} />
      <div style={{
        position: 'absolute',
        inset: 0,
        pointerEvents: 'none',
        zIndex: 1,
        opacity,
        transition: 'opacity 1s'
      }}>
        {elements.includes('confetti') && <ConfettiElements speed={speed} mobile={isMobile} reduced={isFinale} />}
        {elements.includes('balloons') && <BalloonElements speed={speed} mobile={isMobile} reduced={isFinale} />}
        {elements.includes('hearts') && <HeartElements speed={speed} mobile={isMobile} reduced={isFinale} />}
        {elements.includes('flowers') && <FlowerElements mobile={isMobile} reduced={isFinale} />}
        {elements.includes('petals') && <PetalElements speed={speed} mobile={isMobile} reduced={isFinale} />}
        {elements.includes('stars') && <StarElements speed={speed} mobile={isMobile} reduced={isFinale} />}
        {elements.includes('sparkles') && <SparkleElements speed={speed} mobile={isMobile} reduced={isFinale} />}
        {elements.includes('particles') && <ParticleElements speed={speed} mobile={isMobile} reduced={isFinale} />}
        {elements.includes('leaves') && <LeafElements speed={speed} mobile={isMobile} reduced={isFinale} />}
        {elements.includes('glow') && <GlowElements mobile={isMobile} reduced={isFinale} />}
      </div>
    </>
  )
}

function ConfettiElements({ speed, mobile, reduced }: { speed: string; mobile: boolean; reduced: boolean }) {
  const anim = speed === 'slow' ? 'decorPulseSlow' : 'decorPulse'
  // Corner-safe zones: top-left, top-right, bottom corners only
  // Desktop: 4 elements, Mobile: 2 elements, Reduced: 2 elements
  const count = mobile || reduced ? 2 : 4

  return (
    <>
      {/* Top-left corner */}
      <div style={{...baseStyle, top: '6%', left: '3%', fontSize: mobile ? '1.5rem' : '1.75rem', animation: `${anim} 2.5s ease-in-out infinite`}}>🎉</div>
      {/* Top-right corner */}
      <div style={{...baseStyle, top: '6%', right: '3%', fontSize: mobile ? '1.5rem' : '1.75rem', animation: `${anim} 2.5s ease-in-out infinite`, animationDelay: '0.3s'}}>🎊</div>
      {/* Bottom corners - only on desktop/non-reduced */}
      {count > 2 && (
        <>
          <div style={{...baseStyle, bottom: '8%', left: '3%', fontSize: '1.5rem', animation: `${anim} 2.5s ease-in-out infinite`, animationDelay: '0.6s'}}>✨</div>
          <div style={{...baseStyle, bottom: '8%', right: '3%', fontSize: '1.5rem', animation: `${anim} 2.5s ease-in-out infinite`, animationDelay: '0.9s'}}>🎉</div>
        </>
      )}
    </>
  )
}

function BalloonElements({ speed, mobile, reduced }: { speed: string; mobile: boolean; reduced: boolean }) {
  const anim = speed === 'slow' ? 'decorBounceSlow 4.5s ease-in-out infinite' : 'decorBounce 3.5s ease-in-out infinite'
  // Corner-safe zones only
  // Desktop: 4 elements, Mobile: 2 elements, Reduced: 3 elements
  const count = mobile ? 2 : reduced ? 3 : 4

  return (
    <>
      {/* Top-left corner */}
      <div style={{...baseStyle, top: '6%', left: '3%', fontSize: mobile ? '1.5rem' : '1.75rem', animation: anim, animationDelay: '0.2s'}}>🎈</div>
      {/* Top-right corner */}
      <div style={{...baseStyle, top: '6%', right: '3%', fontSize: mobile ? '1.5rem' : '1.75rem', animation: anim}}>🎈</div>
      {/* Bottom corners */}
      {count > 2 && (
        <div style={{...baseStyle, bottom: '8%', left: '3%', fontSize: mobile ? '1.5rem' : '1.75rem', animation: anim, animationDelay: '1.2s'}}>🎈</div>
      )}
      {count > 3 && (
        <div style={{...baseStyle, bottom: '8%', right: '3%', fontSize: '1.75rem', animation: anim, animationDelay: '0.6s'}}>🎈</div>
      )}
    </>
  )
}

function HeartElements({ speed, mobile, reduced }: { speed: string; mobile: boolean; reduced: boolean }) {
  const anim = speed === 'slow' ? 'decorFloatSlow 5s ease-in-out infinite' : 'decorFloat 3.5s ease-in-out infinite'
  const count = mobile ? 2 : reduced ? 3 : 4

  return (
    <>
      {/* Top corners */}
      <div style={{...baseStyle, top: '8%', left: '4%', fontSize: mobile ? '1.25rem' : '1.5rem', animation: anim}}>💕</div>
      <div style={{...baseStyle, top: '8%', right: '4%', fontSize: mobile ? '1.25rem' : '1.5rem', animation: anim, animationDelay: '0.5s'}}>💝</div>
      {/* Bottom corners */}
      {count > 2 && (
        <div style={{...baseStyle, bottom: '10%', left: '4%', fontSize: '1.25rem', animation: anim, animationDelay: '1s'}}>💗</div>
      )}
      {count > 3 && (
        <div style={{...baseStyle, bottom: '10%', right: '4%', fontSize: '1.25rem', animation: anim, animationDelay: '1.5s'}}>💖</div>
      )}
    </>
  )
}

function FlowerElements({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  const count = mobile || reduced ? 2 : 3

  return (
    <>
      {/* Corner positions only */}
      <div style={{...baseStyle, top: '10%', left: '5%', fontSize: mobile ? '1.25rem' : '1.5rem', opacity: 0.5}}>🌸</div>
      <div style={{...baseStyle, bottom: '12%', right: '5%', fontSize: mobile ? '1.25rem' : '1.5rem', opacity: 0.5}}>🌺</div>
      {count > 2 && (
        <div style={{...baseStyle, top: '10%', right: '5%', fontSize: '1.25rem', opacity: 0.45}}>🌼</div>
      )}
    </>
  )
}

function PetalElements({ speed, mobile, reduced }: { speed: string; mobile: boolean; reduced: boolean }) {
  const duration = speed === 'slow' ? '12s' : '8s'
  const count = mobile || reduced ? 2 : 3

  return (
    <>
      {/* Drift from top-left and top-right only */}
      <div style={{...baseStyle, top: '-5%', left: '10%', fontSize: mobile ? '1rem' : '1.25rem', animation: `decorDriftSlow ${duration} linear infinite`}}>🌸</div>
      <div style={{...baseStyle, top: '-8%', right: '10%', fontSize: mobile ? '1rem' : '1.125rem', animation: `decorDriftSlow ${duration} linear infinite`, animationDelay: '4s'}}>🌸</div>
      {count > 2 && (
        <div style={{...baseStyle, top: '-10%', left: '30%', fontSize: '1rem', animation: `decorDriftSlow ${duration} linear infinite`, animationDelay: '2s'}}>🌸</div>
      )}
    </>
  )
}

function StarElements({ speed, mobile, reduced }: { speed: string; mobile: boolean; reduced: boolean }) {
  const anim = speed === 'slow' ? 'decorPulseSlow 4s ease-in-out infinite' : 'decorPulse 3s ease-in-out infinite'
  const count = mobile ? 2 : reduced ? 3 : 4

  return (
    <>
      {/* Corner positions only */}
      <div style={{...baseStyle, top: '8%', left: '4%', fontSize: mobile ? '1.25rem' : '1.5rem', animation: anim}}>⭐</div>
      <div style={{...baseStyle, top: '8%', right: '4%', fontSize: mobile ? '1.25rem' : '1.25rem', animation: anim, animationDelay: '0.5s'}}>✨</div>
      {count > 2 && (
        <div style={{...baseStyle, bottom: '10%', left: '4%', fontSize: '1.25rem', animation: anim, animationDelay: '1s'}}>🌟</div>
      )}
      {count > 3 && (
        <div style={{...baseStyle, bottom: '10%', right: '4%', fontSize: '1rem', animation: anim, animationDelay: '1.5s'}}>⭐</div>
      )}
    </>
  )
}

function SparkleElements({ speed, mobile, reduced }: { speed: string; mobile: boolean; reduced: boolean }) {
  const anim = speed === 'slow' ? 'decorPulseSlow 3.5s ease-in-out infinite' : 'decorPulse 2.5s ease-in-out infinite'
  const count = mobile ? 2 : reduced ? 3 : 4

  return (
    <>
      {/* Corner positions only */}
      <div style={{...baseStyle, top: '7%', left: '4%', fontSize: mobile ? '1rem' : '1.25rem', animation: anim}}>✨</div>
      <div style={{...baseStyle, top: '7%', right: '4%', fontSize: mobile ? '1rem' : '1.25rem', animation: anim, animationDelay: '0.5s'}}>✨</div>
      {count > 2 && (
        <div style={{...baseStyle, bottom: '10%', left: '4%', fontSize: '1.125rem', animation: anim, animationDelay: '1s'}}>✨</div>
      )}
      {count > 3 && (
        <div style={{...baseStyle, bottom: '10%', right: '4%', fontSize: '1.125rem', animation: anim, animationDelay: '1.5s'}}>✨</div>
      )}
    </>
  )
}

// Sympathy - calm floating particles
function ParticleElements({ speed, mobile, reduced }: { speed: string; mobile: boolean; reduced: boolean }) {
  const anim = 'decorFloatSlow 6s ease-in-out infinite'
  const count = mobile ? 3 : 4

  return (
    <>
      {/* Very subtle corner positions */}
      <div style={{...baseStyle, top: '12%', left: '5%', fontSize: '0.75rem', animation: anim, opacity: 0.3}}>·</div>
      <div style={{...baseStyle, top: '12%', right: '5%', fontSize: '0.75rem', animation: anim, animationDelay: '1s', opacity: 0.35}}>·</div>
      <div style={{...baseStyle, bottom: '15%', left: '5%', fontSize: '0.75rem', animation: anim, animationDelay: '2s', opacity: 0.3}}>·</div>
      {count > 3 && (
        <div style={{...baseStyle, bottom: '15%', right: '5%', fontSize: '0.75rem', animation: anim, animationDelay: '3s', opacity: 0.35}}>·</div>
      )}
    </>
  )
}

// Sympathy - gentle falling leaves
function LeafElements({ speed, mobile, reduced }: { speed: string; mobile: boolean; reduced: boolean }) {
  const count = mobile || reduced ? 2 : 3

  return (
    <>
      {/* Drift from top corners only */}
      <div style={{...baseStyle, top: '-8%', left: '8%', fontSize: mobile ? '1rem' : '1.25rem', animation: 'decorDriftSlow 14s linear infinite', opacity: 0.4}}>🍂</div>
      <div style={{...baseStyle, top: '-12%', right: '8%', fontSize: mobile ? '1rem' : '1.125rem', animation: 'decorDriftSlow 16s linear infinite', animationDelay: '3s', opacity: 0.35}}>🍂</div>
      {count > 2 && (
        <div style={{...baseStyle, top: '-10%', left: '25%', fontSize: '1rem', animation: 'decorDriftSlow 15s linear infinite', animationDelay: '6s', opacity: 0.3}}>🍂</div>
      )}
    </>
  )
}

// Soft ambient glow
function GlowElements({ mobile, reduced }: { mobile: boolean; reduced: boolean }) {
  const size = mobile ? 80 : 100
  const opacity = reduced ? 0.08 : 0.12

  return (
    <>
      {/* Top-right corner glow */}
      <div style={{
        ...baseStyle,
        top: '5%',
        right: '2%',
        width: `${size}px`,
        height: `${size}px`,
        borderRadius: '50%',
        background: `radial-gradient(circle, rgba(239, 106, 87, ${opacity}), transparent 70%)`,
        animation: 'decorGlow 8s ease-in-out infinite',
      }} />
      {/* Bottom-left corner glow - only on desktop/non-reduced */}
      {!mobile && (
        <div style={{
          ...baseStyle,
          bottom: '8%',
          left: '2%',
          width: `${size}px`,
          height: `${size}px`,
          borderRadius: '50%',
          background: `radial-gradient(circle, rgba(239, 106, 87, ${opacity * 0.8}), transparent 70%)`,
          animation: 'decorGlow 10s ease-in-out infinite',
          animationDelay: '2s',
        }} />
      )}
    </>
  )
}
