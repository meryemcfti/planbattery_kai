import { Building2, User as UserIcon } from 'lucide-react'
import TenantBrandLogo from '../components/TenantBrandLogo'
import './SettingsPage.css'

type User = {
  name?: string
  email?: string
  role?: string
  tenantName?: string
}

export default function SettingsPage() {
  let user: User = {}
  try {
    user = JSON.parse(localStorage.getItem('kai_user') ?? '{}') as User
  } catch {
    user = {}
  }

  return (
    <section className="settings-page">
      <header className="settings-hero">
        <h1>Ayarlar</h1>
        <p>
          Profil bilgilerinizi ve tek sayfa A4 PDF raporlarda yer alacak kurum
          logonuzu yönetin.
        </p>
      </header>

      <div className="settings-grid">
        <article className="settings-card">
          <div className="settings-card-head">
            <span className="settings-card-icon">
              <UserIcon size={18} />
            </span>
            <div>
              <h2>Profil bilgileri</h2>
              <p>Bu bilgiler aktif oturumunuzdan otomatik alınır.</p>
            </div>
          </div>
          <dl>
            <div>
              <dt>Ad soyad</dt>
              <dd>{user.name}</dd>
            </div>
            <div>
              <dt>E-posta</dt>
              <dd>{user.email}</dd>
            </div>
            <div>
              <dt>Yetki</dt>
              <dd>{user.role}</dd>
            </div>
          </dl>
        </article>

        <article className="settings-card">
          <div className="settings-card-head">
            <span className="settings-card-icon">
              <Building2 size={18} />
            </span>
            <div>
              <h2>Şirket & PDF Kurum Logosu</h2>
              <p>Kurumsal antet ve raporlama standardı bilgileri</p>
            </div>
          </div>
          <div className="settings-logo-box">
            <TenantBrandLogo tenantName={user.tenantName} allowUpload />
          </div>
          <dl>
            <div>
              <dt>Şirket</dt>
              <dd>{user.tenantName}</dd>
            </div>
            <div>
              <dt>Aktif Raporlama Standardı</dt>
              <dd>ISO 14064-1 & GHG Protocol (kgCO₂e)</dd>
            </div>
          </dl>
        </article>
      </div>
    </section>
  )
}
