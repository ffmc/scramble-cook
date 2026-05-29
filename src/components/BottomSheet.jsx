import { createPortal } from 'react-dom'

export default function BottomSheet({ isOpen, onClose, children, maxHeight = '85vh' }) {
  return createPortal(
    <>
      <div
        className={`fixed inset-0 bg-black/40 z-40 transition-opacity duration-300
          ${isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'}`}
        onClick={onClose}
      />
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-sheet
          transition-transform duration-300 ease-out flex flex-col
          ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}
        style={{ maxHeight }}
      >
        <div className="w-10 h-1 bg-warm-line rounded-full mx-auto mt-3 mb-2 shrink-0" />
        <div className="overflow-y-auto flex-1 pb-8">
          {children}
        </div>
      </div>
    </>,
    document.getElementById('portal-root')
  )
}
