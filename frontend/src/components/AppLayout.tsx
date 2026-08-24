import {
  NavLink,
  Outlet,
} from 'react-router-dom'

function AppLayout() {
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

          <strong>E&M Akü</strong>
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
          <strong>Ayşe Yılmaz</strong>
          <span>Çevre Uzmanı</span>
        </div>
      </aside>

      <main className="page-content">
        <Outlet />
      </main>
    </div>
  )
}

export default AppLayout