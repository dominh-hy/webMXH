'use client'

import { useEffect, useRef, useState } from 'react'

export type ScrollDirection = 'up' | 'down' | 'idle'

interface UseScrollDirectionOptions {
  threshold?: number
  topOffset?: number
}

interface ScrollDirectionState {
  direction: ScrollDirection
  isScrollingDown: boolean
  isAtTop: boolean
  scrollY: number
}

export function useScrollDirection({
  threshold = 8,
  topOffset = 24,
}: UseScrollDirectionOptions = {}): ScrollDirectionState {
  const [state, setState] = useState<ScrollDirectionState>({
    direction: 'idle',
    isScrollingDown: false,
    isAtTop: true,
    scrollY: 0,
  })

  const lastScrollY = useRef(0)
  const frameId = useRef<number | null>(null)

  useEffect(() => {
    const updateScrollDirection = () => {
      const currentScrollY = Math.max(window.scrollY, 0)
      const delta = currentScrollY - lastScrollY.current
      const isAtTop = currentScrollY <= topOffset

      if (isAtTop || Math.abs(delta) >= threshold) {
        const direction: ScrollDirection = isAtTop
          ? 'idle'
          : delta > 0
            ? 'down'
            : 'up'

        setState({
          direction,
          isScrollingDown: direction === 'down',
          isAtTop,
          scrollY: currentScrollY,
        })

        lastScrollY.current = currentScrollY
      }

      frameId.current = null
    }

    const handleScroll = () => {
      if (frameId.current === null) {
        frameId.current = window.requestAnimationFrame(updateScrollDirection)
      }
    }

    lastScrollY.current = Math.max(window.scrollY, 0)
    handleScroll()

    window.addEventListener('scroll', handleScroll, { passive: true })

    return () => {
      window.removeEventListener('scroll', handleScroll)
      if (frameId.current !== null) {
        window.cancelAnimationFrame(frameId.current)
      }
    }
  }, [threshold, topOffset])

  return state
}
