import Button from './Button'
import styles from './Header.module.css'

interface HeaderProps {
  title: string
  userName: string
  userRole: string
}

function Header({ title, userName, userRole }: HeaderProps) {
  return (
    <header className={styles.header}>
      <div>
        <p className={styles.kicker}>Sistema administrativo</p>
        <h1>{title}</h1>
      </div>

      <div className={styles.profileArea}>
        <div className={styles.userInfo}>
          <strong>{userName}</strong>
          <span>{userRole}</span>
        </div>
        <Button variant="ghost" className={styles.profileButton} aria-label="Perfil y configuración">
          Perfil
        </Button>
      </div>
    </header>
  )
}

export default Header