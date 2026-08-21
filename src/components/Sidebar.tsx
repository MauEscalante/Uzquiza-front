import type { SectionId } from '../App'
import styles from './Sidebar.module.css'

interface SectionEntry {
  id: SectionId
  label: string
  title: string
}

interface SidebarProps {
  sections: SectionEntry[]
  activeSection: SectionId
  onChangeSection: (section: SectionId) => void
}

function Sidebar({ sections, activeSection, onChangeSection }: SidebarProps) {
  return (
    <aside className={styles.sidebar}>
      <div className={styles.brand}>
        <div className={styles.brandMark}>IM</div>
        <div>
          <strong>Inmobiliaria</strong>
          <span>Panel administrativo</span>
        </div>
      </div>

      <nav className={styles.nav} aria-label="Navegación principal">
        {sections.map((section) => (
          <button
            key={section.id}
            type="button"
            className={[styles.navItem, activeSection === section.id ? styles.active : ''].filter(Boolean).join(' ')}
            onClick={() => onChangeSection(section.id)}
          >
            <span className={styles.icon}>{getIcon(section.id)}</span>
            <span>{section.label}</span>
          </button>
        ))}
      </nav>

      <div className={styles.footer}>
        <p>Gestión profesional de alquileres, contratos y recibos.</p>
      </div>
    </aside>
  )
}

function getIcon(section: SectionId) {
  switch (section) {
    case 'dashboard':
      return <svg viewBox="0 0 24 24"><path d="M4 11h7V4H4v7Zm9 9h7v-7h-7v7Zm-9 0h7v-5H4v5Zm9-17v9h7V3h-7Z" /></svg>
    case 'clientes':
      return <svg viewBox="0 0 24 24"><path d="M16 11a4 4 0 1 0-4-4 4 4 0 0 0 4 4Zm-8 1a3 3 0 1 0-3-3 3 3 0 0 0 3 3Zm0 2c-2.67 0-8 1.34-8 4v2h10v-2c0-1.05.28-1.97.77-2.75A8.47 8.47 0 0 0 8 14Zm8 0c-.46 0-.98.04-1.53.11A5.98 5.98 0 0 1 18 19v2h6v-2c0-2.66-5.33-4-8-4Z" /></svg>
    case 'propiedades':
      return <svg viewBox="0 0 24 24"><path d="m12 3 9 7v11h-6v-7H9v7H3V10l9-7Zm0 2.56L5 11v8h2v-7h10v7h2v-8l-7-5.44Z" /></svg>
    case 'contratos':
      return <svg viewBox="0 0 24 24"><path d="M6 2h9l5 5v15H6V2Zm8 1.5V8h4.5L14 3.5ZM8 12h8v2H8v-2Zm0 4h8v2H8v-2Zm0-8h4v2H8V8Z" /></svg>
    case 'ajustes':
      return <svg viewBox="0 0 24 24"><path d="M19.14 12.94a7.43 7.43 0 0 0 .05-.94 7.43 7.43 0 0 0-.05-.94l2.03-1.58a.5.5 0 0 0 .12-.64l-1.93-3.34a.5.5 0 0 0-.6-.22l-2.39.96a7.28 7.28 0 0 0-1.63-.94l-.36-2.54A.5.5 0 0 0 13.9 1h-3.86a.5.5 0 0 0-.49.42l-.36 2.54c-.58.23-1.12.54-1.63.94l-2.39-.96a.5.5 0 0 0-.6.22L2.64 7.46a.5.5 0 0 0 .12.64l2.03 1.58c-.03.31-.05.62-.05.94s.02.63.05.94L2.76 13.14a.5.5 0 0 0-.12.64l1.93 3.34a.5.5 0 0 0 .6.22l2.39-.96c.5.4 1.05.72 1.63.94l.36 2.54a.5.5 0 0 0 .49.42h3.86a.5.5 0 0 0 .49-.42l.36-2.54c.58-.23 1.12-.54 1.63-.94l2.39.96a.5.5 0 0 0 .6-.22l1.93-3.34a.5.5 0 0 0-.12-.64l-2.03-1.58ZM12 15.5A3.5 3.5 0 1 1 15.5 12 3.5 3.5 0 0 1 12 15.5Z" /></svg>
    case 'recibos':
      return <svg viewBox="0 0 24 24"><path d="M6 2h12a1 1 0 0 1 1 1v18l-3-1.5L13 21l-3-1.5L7 21 4 19.5V3a1 1 0 0 1 1-1Zm2 5h8V5H8v2Zm0 4h8V9H8v2Zm0 4h5v-2H8v2Z" /></svg>
    case 'libroDiario':
      return <svg viewBox="0 0 24 24"><path d="M4 3h13a3 3 0 0 1 3 3v15H7a3 3 0 0 1-3-3V3Zm2 2v13a1 1 0 0 0 1 1h11V6a1 1 0 0 0-1-1H6Zm3 3h8v2H9V8Zm0 4h8v2H9v-2Zm0 4h5v2H9v-2Z" /></svg>
  }
}

export default Sidebar