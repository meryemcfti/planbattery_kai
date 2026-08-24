import {
  NavLink,
  Outlet,
  useNavigate,
} from 'react-router-dom'

type StoredUser = {
  name: string
  email: string
  role: string
  tenantName: string
}

const fallbackUser: StoredUser = {
  name: 'Kullanıcı',
  email: '',
  role: 'Rol bilgisi bulunamadı',
  tenantName: 'Şirket bilgisi bulunamadı',
}

function getStoredUser(): StoredUser {
  const storedUser = localStorage.getItem('kai_user')

  if (!storedUser) {
    return fallbackUser
  }

  try {
    return JSON.parse(storedUser) as StoredUser
  } catch {
    return fallbackUser
  }
}

function AppLayout() {
  const navigate = useNavigate()
  const user = getStoredUser()

  function handleLogout() {
    localStorage.removeItem('kai_access_token')
    localStorage.removeItem('kai_user')
    navigate('/login', { replace: true })
  }

  return (
    <div className="app-layout">
      <aside className="sidebar">
        <div className="brand">
          <span className="brand-icon">◇</span>
          <span>PlanBattery KAI</span>
        </div>

        <div className="selected-company">
          <span className="company-label">
            SEÇİLİ ŞİRKET
          </span>

          <strong>{user.tenantName}</strong>
        </div>

        <nav className="navigation">
          <span className="navigation-item disabled">
            Genel Bakış
          </span>

          <span className="navigation-item disabled">
            Değerlendirmeler
          </span>

          <span className="navigation-item disabled">
            Tesisler
          </span>

          <NavLink
            className="navigation-item"
            to="/activities"
          >
            Faaliyetler
          </NavLink>

          <span className="navigation-item disabled">
            Raporlar
          </span>
        </nav>

        <div className="current-user">
          <div className="current-user-information">
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>

          <button
            className="logout-button"
            type="button"
            onClick={handleLogout}
          >
            Çıkış Yap
          </button>
        </div>
      </aside>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout