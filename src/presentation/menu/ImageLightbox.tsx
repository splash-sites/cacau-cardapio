import { useEffect, useState } from 'react'

interface ImageLightboxProps {
  imageUrl: string
  name: string
  price: string
  onClose: () => void
}

const TRANSITION_MS = 250
const UNMOUNT_DELAY_MS = 260

export function ImageLightbox({ imageUrl, name, price, onClose }: ImageLightboxProps) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const frame = requestAnimationFrame(() => setVisible(true))
    return () => cancelAnimationFrame(frame)
  }, [])

  useEffect(() => {
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') handleClose()
    }
    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  function handleClose() {
    setVisible(false)
    setTimeout(onClose, UNMOUNT_DELAY_MS)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-label={name}
      onClick={handleClose}
      style={{ transitionDuration: `${TRANSITION_MS}ms` }}
      className={`fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-[4px] [-webkit-backdrop-filter:blur(4px)] transition-opacity ease-out motion-reduce:transition-none ${
        visible ? 'opacity-100' : 'opacity-0'
      }`}
    >
      <button
        type="button"
        onClick={handleClose}
        aria-label="Fechar"
        className="absolute right-4 top-4 flex h-11 w-11 min-h-11 items-center justify-center rounded-full bg-black/50 text-2xl leading-none text-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary"
      >
        ×
      </button>
      <div
        onClick={(event) => event.stopPropagation()}
        style={{ transitionDuration: `${TRANSITION_MS}ms` }}
        className={`flex w-[80%] flex-col items-center gap-3 transition-transform ease-out motion-reduce:transition-none ${
          visible ? 'scale-100' : 'scale-[0.8]'
        }`}
      >
        <img src={imageUrl} alt={name} className="w-full rounded-xl object-cover" />
        <p className="font-display text-xl text-background">{name}</p>
        <p className="font-body font-medium text-primary">{price}</p>
      </div>
    </div>
  )
}
