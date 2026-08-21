import { useState } from 'react'
import Header from './components/Header'
import Sidebar from './components/Sidebar'
import Dashboard from './pages/Dashboard'
import Clientes from './pages/Clientes'
import Propiedades from './pages/Propiedades'
import Contratos from './pages/Contratos'
import Ajustes from './pages/Ajustes'
import Recibos from './pages/Recibos'
import LibroDiario from './pages/LibroDiario'
import styles from './App.module.css'

export type SectionId = 'dashboard' | 'clientes' | 'propiedades' | 'contratos' | 'ajustes' | 'recibos' | 'libroDiario'

const sections: Array<{ id: SectionId; label: string; title: string }> = [
  { id: 'dashboard', label: 'Dashboard', title: 'Dashboard' },
  { id: 'clientes', label: 'Clientes', title: 'Clientes' },
  { id: 'propiedades', label: 'Propiedades', title: 'Propiedades' },
  { id: 'contratos', label: 'Contratos', title: 'Contratos' },
  { id: 'ajustes', label: 'Ajustes', title: 'Ajustes' },
  { id: 'recibos', label: 'Recibos', title: 'Recibos' },
  { id: 'libroDiario', label: 'Libro diario', title: 'Libro diario' },
]

function App() {
  const [activeSection, setActiveSection] = useState<SectionId>('dashboard')

  const currentTitle = sections.find((section) => section.id === activeSection)?.title ?? 'Dashboard'

  return (
    <div className={styles.shell}>
      <Sidebar activeSection={activeSection} sections={sections} onChangeSection={setActiveSection} />
      <div className={styles.mainArea}>
        <Header title={currentTitle} userName="Mariana Torres" userRole="Administración" />
        <main className={styles.content}>
          {activeSection === 'dashboard' && <Dashboard />}
          {activeSection === 'clientes' && <Clientes />}
          {activeSection === 'propiedades' && <Propiedades />}
          {activeSection === 'contratos' && <Contratos />}
          {activeSection === 'ajustes' && <Ajustes />}
          {activeSection === 'recibos' && <Recibos />}
          {activeSection === 'libroDiario' && <LibroDiario />}
        </main>
      </div>
    </div>
  )
}

export default App