import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import {
  AlertCircle,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ShieldCheck,
  Sparkles,
  UserCheck,
  Users,
} from 'lucide-react'
import brandSymbol from '../assets/planbattery-symbol.svg'
import {
  clearCorporateSession,
  demoUsers,
  getCorporateSession,
  getRegisteredUsers,
} from '../services/authStore'
import { getTenantLogo } from '../services/activityStore'
import type { TenantRole } from '../services/authStore'
import './RoleLoginPage.css'

type RoleOption = {
  tenantRole: TenantRole
  title: string
  subtitle: string
  badge: string
  demoEmail: string
  demoPassword: string
}

const ROLE_OPTIONS: RoleOption[] = [
  {
    tenantRole: 'COMPANY_ADMIN',
    title: 'Şirket Yöneticisi',
    subtitle: 'Rapor inceleme, çıktı alma ve kontrol talebi',
    badge: 'Yönetici',
    demoEmail: 'engin@emandaku.com',
    demoPassword: 'Admin123!',
  },
  {
    tenantRole: 'CARBON_SPECIALIST',
    title: 'Çevre / Karbon Uzmanı',
    subtitle: 'Veri kontrolü, hesaplama ve sistem onayı',
    badge: 'Uzman',
    demoEmail: 'ayse@emandaku.com',
    demoPassword: 'Demo123!',
  },
  {
    tenantRole: 'DATA_ENTRY',
    title: 'Çalışan / Veri Sorumlusu',
    subtitle: 'Fatura, SAP görüntüsü ve matris veri girişi',
    badge: 'Çalışan',
    demoEmail: 'mehmet@emandaku.com',
    demoPassword: 'Veri123!',
  },
]

export default function RoleLoginPage() {
  const navigate = useNavigate()
  const corporateSession = getCorporateSession()

  const [selectedRole, setSelectedRole] =
    useState<TenantRole>('COMPANY_ADMIN')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  useEffect(() => {
    if (!corporateSession) {
      navigate('/login', { replace: true })
    }
  }, [corporateSession, navigate])

  if (!corporateSession) return null

  const companyLogo = getTenantLogo(corporateSession.tenantName)
  const companyMonogram = corporateSession.tenantName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase() ?? '')
    .join('')

  const activeRoleOption =
    ROLE_OPTIONS.find((r) => r.tenantRole === selectedRole) ?? ROLE_OPTIONS[0]

  function handleSelectRole(role: TenantRole) {
    setSelectedRole(role)
    setError('')
    setEmail('')
    setPassword('')
  }

  function handleFillRoleDemo() {
    const matchedRegistered = getRegisteredUsers().find(
      (u) =>
        u.tenantRole === selectedRole &&
        u.tenantName === corporateSession?.tenantName,
    )
    if (matchedRegistered) {
      setEmail(matchedRegistered.email)
      setPassword(matchedRegistered.password)
    } else {
      setEmail(activeRoleOption.demoEmail)
      setPassword(activeRoleOption.demoPassword)
    }
    setError('')
  }

  function handleChangeCompany() {
    clearCorporateSession()
    localStorage.removeItem('kai_access_token')
    localStorage.removeItem('kai_user')
    navigate('/login', { replace: true })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('Lütfen seçili yetki için e-posta ve parolanızı girin.')
      return
    }

    setIsSubmitting(true)

    window.setTimeout(() => {
      const normalizedEmail = email.trim().toLowerCase()
      const matchedDemo = demoUsers.find(
        (u) =>
          u.email === normalizedEmail &&
          u.password === password &&
          u.tenantRole === selectedRole,
      )
      const matchedRegistered = getRegisteredUsers().find(
        (u) =>
          u.email.toLowerCase() === normalizedEmail &&
          u.password === password &&
          u.tenantRole === selectedRole,
      )

      const matchedUser = matchedDemo ?? matchedRegistered

      if (!matchedUser) {
        setError(
          `Girilen bilgiler "${activeRoleOption.title}" yetkisiyle eşleşmiyor. Lütfen e-posta, parola ve seçili yetkiyi kontrol edin.`,
        )
        setIsSubmitting(false)
        return
      }

      localStorage.setItem(
        'kai_access_token',
        `demo-token-${matchedUser.tenantRole}`,
      )
      localStorage.setItem(
        'kai_user',
        JSON.stringify({
          name: matchedUser.name,
          email: matchedUser.email,
          role: matchedUser.role,
          tenantRole: matchedUser.tenantRole,
          tenantName: corporateSession?.tenantName ?? matchedUser.tenantName,
        }),
      )

      navigate('/dashboard', { replace: true })
    }, 350)
  }

  return (
    <main className="role-login-page">
      <div className="role-login-topbar">
        <Link to="/" className="role-login-brand">
          <div className="role-brand-icon">
            <img src={brandSymbol} alt="PlanBattery Logo" />
          </div>
          <div>
            <strong>PlanBattery</strong>
            <small>Karbon Ayak İzi</small>
          </div>
        </Link>

        <button
          type="button"
          className="role-change-company-btn"
          onClick={handleChangeCompany}
        >
          <ArrowLeft size={14} />
          <span>Kurum Değiştir</span>
        </button>
      </div>

      <section className="role-login-card" aria-label="Yetki Girişi">
        <div className="role-corp-banner">
          <div className="role-corp-info">
            {companyLogo ? (
              <img
                src={companyLogo}
                alt={`${corporateSession.tenantName} Logosu`}
                className="role-corp-logo-img"
              />
            ) : (
              <span className="role-corp-icon">{companyMonogram || 'EA'}</span>
            )}
            <div>
              <strong>{corporateSession.tenantName}</strong>
              <small>{corporateSession.corporateEmail}</small>
            </div>
          </div>
          <span className="role-corp-verified">
            <CheckCircle2 size={13} />
            <span>Kurumsal Kimlik Doğrulandı</span>
          </span>
        </div>

        <header className="role-card-header">
          <h1>
            <Users size={20} />
            <span>Yetki Türü ile Giriş Yapın</span>
          </h1>
          <p>
            Devam etmek için yönetici, çevre uzmanı veya çalışan hesabınızı
            seçip oturum açın.
          </p>
        </header>

        <div className="role-selector-grid" role="tablist">
          {ROLE_OPTIONS.map((opt) => {
            const isActive = selectedRole === opt.tenantRole
            return (
              <button
                key={opt.tenantRole}
                type="button"
                role="tab"
                aria-selected={isActive}
                className={`role-option-card ${isActive ? 'active' : ''}`}
                onClick={() => handleSelectRole(opt.tenantRole)}
              >
                <div className="role-option-top">
                  <span className="role-option-badge">{opt.badge}</span>
                  {isActive && <CheckCircle2 size={15} className="role-check" />}
                </div>
                <strong>{opt.title}</strong>
                <small>{opt.subtitle}</small>
              </button>
            )
          })}
        </div>

        {error && (
          <div className="role-alert-error" role="alert">
            <AlertCircle size={15} />
            <span>{error}</span>
          </div>
        )}

        <form className="role-login-form" onSubmit={handleSubmit}>
          <div className="role-form-head">
            <span>
              <UserCheck size={14} />
              <strong>{activeRoleOption.title}</strong> Girişi
            </span>
            <button
              type="button"
              className="role-demo-fill-btn"
              onClick={handleFillRoleDemo}
            >
              <Sparkles size={13} />
              <span>Demo Bilgilerini Doldur</span>
            </button>
          </div>

          <div className="role-form-fields">
            <div className="role-field">
              <label htmlFor="role-email">Yetkili E-posta Adresi</label>
              <div className="role-input-wrap">
                <Mail size={15} className="role-input-icon" />
                <input
                  id="role-email"
                  type="email"
                  placeholder={activeRoleOption.demoEmail}
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="role-field">
              <label htmlFor="role-password">Parola</label>
              <div className="role-input-wrap">
                <Lock size={15} className="role-input-icon" />
                <input
                  id="role-password"
                  type={showPassword ? 'text' : 'password'}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                />
                <button
                  type="button"
                  className="role-pw-toggle"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? 'Parolayı gizle' : 'Parolayı göster'}
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="role-submit-btn"
            disabled={isSubmitting}
          >
            {isSubmitting ? (
              <>
                <Loader2 size={16} className="spin" />
                <span>Yetki Doğrulanıyor...</span>
              </>
            ) : (
              <>
                <span>{activeRoleOption.title} Olarak Giriş Yap</span>
                <ArrowRight size={16} />
              </>
            )}
          </button>
        </form>

        <div className="role-security-footer">
          <ShieldCheck size={13} />
          <span>Rol bazlı yetkilendirme aktif · ISO 14064-1</span>
        </div>
      </section>
    </main>
  )
}
