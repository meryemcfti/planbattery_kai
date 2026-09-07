import { useEffect, useState } from 'react'
import { NavLink, Outlet, useNavigate } from 'react-router-dom'

type StoredUser = { name: string; email: string; role: string; tenantName: string; tenantRole?: 'COMPANY_ADMIN' | 'DATA_ENTRY' | 'VIEWER' }
const fallbackUser: StoredUser = { name: 'Kullanıcı', email: '', role: 'Kullanıcı', tenantName: 'Şirket', tenantRole: 'VIEWER' }

function getStoredUser(): StoredUser {
  try { return JSON.parse(localStorage.getItem('kai_user') ?? '') as StoredUser } catch { return fallbackUser }
}

const Icon = ({ name }: { name: string }) => {
  const icons: Record<string, string> = { home: '⌂', activity: '↗', report: '▤', settings: '⚙', logout: '↪', menu: '☰' }
  return <span className="nav-icon" aria-hidden="true">{icons[name]}</span>
}

function AppLayout() {
  const navigate = useNavigate()
  const user = getStoredUser()
  const [collapsed, setCollapsed] = useState(localStorage.getItem('kai_sidebar_collapsed') === 'true')
  const isAdmin = user.tenantRole === 'COMPANY_ADMIN'

  useEffect(() => { localStorage.setItem('kai_sidebar_collapsed', String(collapsed)) }, [collapsed])
  function handleLogout() { localStorage.removeItem('kai_access_token'); localStorage.removeItem('kai_user'); navigate('/login', { replace: true }) }

  return <div className={`app-layout ${collapsed ? 'sidebar-collapsed' : ''}`}>
    <aside className="sidebar">
      <div className="sidebar-top"><div className="brand"><span className="brand-icon">◇</span><span className="brand-text">PlanBattery KAI</span></div><button className="sidebar-toggle" type="button" onClick={() => setCollapsed((value) => !value)} aria-label={collapsed ? 'Menüyü aç' : 'Menüyü kapat'}><Icon name="menu" /></button></div>
      <div className="selected-company"><span className="company-label">SEÇİLİ ŞİRKET</span><strong>{user.tenantName}</strong></div>
      <nav className="navigation" aria-label="Ana menü">
        <NavLink className="navigation-item" to="/dashboard" title="Genel Bakış"><Icon name="home" /><span>Genel Bakış</span></NavLink>
        <NavLink className="navigation-item" to="/activities" title={isAdmin ? 'Faaliyetler' : 'Kayıtlarım'}><Icon name="activity" /><span>{isAdmin ? 'Faaliyetler' : 'Kayıtlarım'}</span></NavLink>
        {isAdmin && <NavLink className="navigation-item" to="/reports" title="Raporlar"><Icon name="report" /><span>Raporlar</span></NavLink>}
        <NavLink className="navigation-item" to="/settings" title="Ayarlar"><Icon name="settings" /><span>Ayarlar</span></NavLink>
      </nav>
      <div className="current-user"><div className="avatar">{user.name.slice(0, 1).toUpperCase()}</div><div className="current-user-information"><strong>{user.name}</strong><span>{user.role}</span></div><button className="logout-button" type="button" onClick={handleLogout} title="Çıkış Yap"><Icon name="logout" /><span>Çıkış Yap</span></button></div>
    </aside>
    <main className="page-content"><Outlet /></main>
  </div>
}

export default AppLayout
