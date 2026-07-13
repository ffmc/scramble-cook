import { createPortal } from 'react-dom'
import { useRef, useEffect } from 'react'

export default function BottomSheet({ isOpen, onClose, children, maxHeight = '85vh' }) {
  const sheetRef  = useRef(null)
  const startYRef = useRef(0)

  useEffect(() => {
    if (!isOpen) return

    window.history.pushState({ bottomSheet: true }, '')

    const handlePopState = () => onClose()
    window.addEventListener('popstate', handlePopState)

    return () => {
      window.removeEventListener('popstate', handlePopState)
      if (window.history.state?.bottomSheet) {
        window.history.back()
      }
    }
  }, [isOpen])

  const handleTouchStart = (e) => {
    startYRef.current = e.touches[0].clientY
    if (sheetRef.current) sheetRef.current.style.transition = 'none'
  }

  const handleTouchMove = (e) => {
    const delta = e.touches[0].clientY - startYRef.current
    if (delta > 0 && sheetRef.current) {
      sheetRef.current.style.transform = `translateY(${delta}px)`
    }
  }

  const handleTouchEnd = (e) => {
    const delta = e.changedTouches[0].clientY - startYRef.current
    const el = sheetRef.current
    if (!el) return

    if (delta > 100) {
      el.style.transition = 'transform 0.25s ease-out'
      el.style.transform = 'translateY(100%)'
      setTimeout(() => {
        el.style.transition = ''
        el.style.transform = ''
        onClose()
      }, 250)
    } else {
      el.style.transition = 'transform 0.2s ease-out'
      el.style.transform = ''
      setTimeout(() => { el.style.transition = '' }, 200)
    }
  }

  return createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        ref={sheetRef}
        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-sheet
          transition-transform duration-300 ease-out flex flex-col
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight }}
      >
        <div
          className="pt-3 pb-2 flex justify-center shrink-0 touch-none cursor-grab active:cursor-grabbing"
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
        >
          <div className="w-10 h-1 bg-warm-line rounded-full" />
        </div>
        <div className="overflow-y-auto flex-1 pb-8">
          {children}
        </div>
      </div>
    </>,
    document.getElementById('portal-root')
  )
}
