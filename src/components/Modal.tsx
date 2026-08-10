import type { PropsWithChildren, ReactNode } from 'react'
import Button from './Button'
import styles from './Modal.module.css'

interface ModalProps extends PropsWithChildren {
  open: boolean
  title: string
  onClose: () => void
  footer?: ReactNode
}

function Modal({ open, title, onClose, footer, children }: ModalProps) {
  if (!open) {
    return null
  }

  return (
    <div className={styles.backdrop} role="presentation" onClick={onClose}>
      <div className={styles.modal} role="dialog" aria-modal="true" aria-labelledby="modal-title" onClick={(event) => event.stopPropagation()}>
        <header className={styles.header}>
          <h2 id="modal-title">{title}</h2>
          <Button variant="ghost" onClick={onClose} aria-label="Cerrar modal">
            Cerrar
          </Button>
        </header>
        <div className={styles.body}>{children}</div>
        {footer ? <footer className={styles.footer}>{footer}</footer> : null}
      </div>
    </div>
  )
}

export default Modal