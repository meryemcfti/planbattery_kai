import { useEffect, useState } from 'react'
import type { FormEvent } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import {
  Mail,
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  Sparkles,
  AlertCircle,
  Loader2,
  Building2,
  CheckCircle2,
  ChevronDown,
  User,
} from 'lucide-react'
import brandSymbol from '../assets/planbattery-symbol.svg'
import {
  CORPORATE_ACCOUNTS,
  saveRegisteredUser,
  setCorporateSession,
  verifyCorporateCredentials,
} from '../services/authStore'
import type { CorporateAccount, RegisteredUser } from '../services/authStore'
import './LoginPage.css'

function LoginPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const isRegisterRoute = location.pathname === '/register'

  const [mode, setMode] = useState<'login' | 'register'>(
    isRegisterRoute ? 'register' : 'login',
  )
  const [fullName, setFullName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [selectedDemoId, setSelectedDemoId] = useState<string | null>(null)
  const [isDemoOpen, setIsDemoOpen] = useState(false)

  useEffect(() => {
    setMode(location.pathname === '/register' ? 'register' : 'login')
    setError('')
  }, [location.pathname])

  function switchMode(nextMode: 'login' | 'register') {
    setMode(nextMode)
    setError('')
    navigate(nextMode === 'register' ? '/register' : '/login', {
      replace: true,
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (mode === 'register') {
      if (
        !fullName.trim() ||
        !companyName.trim() ||
        !email.trim() ||
        !password.trim()
      ) {
        setError('Lütfen tüm kurumsal kayıt alanlarını doldurun.')
        return
      }

      if (password.trim().length < 6) {
        setError('Parola en az 6 karakter olmalıdır.')
        return
      }

      setIsSubmitting(true)

      window.setTimeout(() => {
        const newUser: RegisteredUser = {
          name: fullName.trim(),
          email: email.trim().toLowerCase(),
          password,
          role: 'Şirket Yöneticisi',
          tenantRole: 'COMPANY_ADMIN',
          tenantName: companyName.trim(),
        }

        saveRegisteredUser(newUser)
        setCorporateSession({
          tenantName: newUser.tenantName,
          corporateEmail: newUser.email,
          verifiedAt: new Date().toISOString(),
        })

        navigate('/role-login', { replace: true })
      }, 450)

      return
    }

    if (!email.trim() || !password.trim()) {
      setError('Kurumsal e-posta/kod ve parola alanları zorunludur.')
      return
    }

    setIsSubmitting(true)

    window.setTimeout(() => {
      const corpSession = verifyCorporateCredentials(email, password)

      if (!corpSession) {
        setError(
          'Kurumsal kimlik veya parola hatalı. Lütfen bilgilerinizi kontrol edin.',
        )
        setIsSubmitting(false)
        return
      }

      localStorage.removeItem('kai_access_token')
      localStorage.removeItem('kai_user')
      setCorporateSession(corpSession)

      navigate('/role-login', { replace: true })
    }, 450)
  }

  function fillCorporateDemo(corp: CorporateAccount) {
    if (mode !== 'login') {
      switchMode('login')
    }
    setEmail(corp.corporateEmail)
    setPassword(corp.password)
    setSelectedDemoId(corp.id)
    setError('')
  }

  return (
    <main className="login-page">
      {/* Visual Brand & Nature Hero Side */}
      <section
        className={`login-hero ${mode === 'register' ? 'is-register' : ''}`}
        aria-label="PlanBattery Kurumsal Tanıtım"
      >
        <div className="login-hero-overlay" />

        <div className="login-hero-content">
          {/* Top Brand Bar */}
          <div className="login-hero-header">
            <Link to="/" className="login-hero-logo">
              <div className="logo-icon-wrap">
                <img src={brandSymbol} alt="PlanBattery Logo" />
              </div>
              <div className="logo-text-wrap">
                <strong>PlanBattery</strong>
                <small>Karbon Ayak İzi</small>
              </div>
            </Link>
          </div>

          {/* Main Hero Copy */}
          <div className="login-hero-body">
            <h1>
              Faaliyet verilerinizi yönetin,{' '}
              <span className="login-gradient-text">
                emisyonlarınızı hesaplayın.
              </span>
            </h1>

            <p className="login-hero-description">
              Şirket ve tesis bazlı enerji ve doğalgaz faaliyetlerini ISO
              14064-1 ve GHG Protocol kurumsal standartlarına uygun olarak
              güvenli, izlenebilir ve doğrulanabilir biçimde yönetin.
            </p>
          </div>
        </div>
      </section>

      {/* Right Login / Register Form Panel */}
      <section className="login-panel" aria-label="Giriş ve Kayıt Formu">
        <Link to="/" className="login-back-home">
          <ArrowLeft size={15} />
          <span>Ana Sayfa</span>
        </Link>

        <div className="login-card">
          {/* Mobile Brand Header */}
          <div className="login-mobile-brand">
            <Link to="/" className="login-mobile-brand-link">
              <img src={brandSymbol} alt="PlanBattery" />
              <div>
                <strong>PlanBattery</strong>
                <small>Karbon Ayak İzi</small>
              </div>
            </Link>
            <Link to="/" className="login-mobile-back">
              Ana Sayfa
            </Link>
          </div>

          {/* Mode Switch Tabs */}
          <div className="auth-mode-tabs" role="tablist">
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'login'}
              className={`auth-mode-tab ${mode === 'login' ? 'active' : ''}`}
              onClick={() => switchMode('login')}
            >
              Giriş Yap
            </button>
            <button
              type="button"
              role="tab"
              aria-selected={mode === 'register'}
              className={`auth-mode-tab ${mode === 'register' ? 'active' : ''}`}
              onClick={() => switchMode('register')}
            >
              Kayıt Ol
            </button>
          </div>

          {error && (
            <div className="login-alert-box" role="alert">
              <AlertCircle size={18} className="alert-icon" />
              <span>{error}</span>
            </div>
          )}

          <form className="login-form-main" onSubmit={handleSubmit}>
            {mode === 'register' && (
              <>
                <div
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    gap: 8,
                    padding: '8px 12px',
                    borderRadius: 10,
                    background: '#f2f9f5',
                    border: '1px solid #cce4d8',
                    fontSize: 12,
                  }}
                >
                  <span style={{ color: '#364b60', fontWeight: 600 }}>
                    Kayıt öncesi sistemi görmek ister misiniz?
                  </span>
                  <Link
                    to="/demo"
                    style={{
                      color: '#158055',
                      fontWeight: 800,
                      textDecoration: 'none',
                      whiteSpace: 'nowrap',
                    }}
                  >
                    Demo Sürümünü Dene →
                  </Link>
                </div>
                <div className="form-group">
                  <label htmlFor="register-name">Ad Soyad</label>
                  <div className="input-with-icon">
                    <User size={18} className="input-field-icon" />
                    <input
                      id="register-name"
                      type="text"
                      value={fullName}
                      placeholder="Adınız ve Soyadınız"
                      autoComplete="name"
                      required
                      onChange={(event) => setFullName(event.target.value)}
                    />
                  </div>
                </div>

                <div className="form-group">
                  <label htmlFor="register-company">Şirket / Kurum Adı</label>
                  <div className="input-with-icon">
                    <Building2 size={18} className="input-field-icon" />
                    <input
                      id="register-company"
                      type="text"
                      value={companyName}
                      placeholder="Örn. E&M Akü Sanayi A.Ş."
                      autoComplete="organization"
                      required
                      onChange={(event) => setCompanyName(event.target.value)}
                    />
                  </div>
                </div>
              </>
            )}

            <div className="form-group">
              <label htmlFor="login-email">
                {mode === 'register'
                  ? 'Kurumsal E-posta Adresi'
                  : 'Kurumsal E-posta veya Kurum Kodu'}
              </label>
              <div className="input-with-icon">
                <Mail size={18} className="input-field-icon" />
                <input
                  id="login-email"
                  type={mode === 'register' ? 'email' : 'text'}
                  value={email}
                  placeholder={
                    mode === 'register'
                      ? 'ornek@sirket.com'
                      : 'kurumsal@emandaku.com veya EMAKU-2026'
                  }
                  autoComplete="email"
                  required
                  onChange={(event) => {
                    setEmail(event.target.value)
                    if (selectedDemoId) setSelectedDemoId(null)
                  }}
                />
              </div>
            </div>

            <div className="form-group">
              <div className="form-label-row">
                <label htmlFor="login-password">Parola</label>
                {mode === 'login' && (
                  <span
                    className="forgot-password-link"
                    title="Şifre sıfırlama için yöneticinize başvurun"
                  >
                    Şifremi unuttum?
                  </span>
                )}
              </div>
              <div className="input-with-icon">
                <Lock size={18} className="input-field-icon" />
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  placeholder="••••••••"
                  autoComplete={
                    mode === 'register' ? 'new-password' : 'current-password'
                  }
                  required
                  onChange={(event) => {
                    setPassword(event.target.value)
                    if (selectedDemoId) setSelectedDemoId(null)
                  }}
                />
                <button
                  type="button"
                  className="password-toggle-btn"
                  onClick={() => setShowPassword(!showPassword)}
                  aria-label={
                    showPassword ? 'Parolayı gizle' : 'Parolayı göster'
                  }
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {mode === 'login' && (
              <div className="form-options-row">
                <label className="checkbox-container">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                  />
                  <span className="checkbox-custom" />
                  <span className="checkbox-label">Beni hatırla</span>
                </label>

                <span className="security-tag">
                  <ShieldCheck size={13} /> Güvenli Oturum
                </span>
              </div>
            )}

            <button
              className="login-submit-btn"
              type="submit"
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={19} className="spinner-rotate" />
                  <span>
                    {mode === 'register'
                      ? 'Hesap oluşturuluyor...'
                      : 'Giriş yapılıyor...'}
                  </span>
                </>
              ) : (
                <>
                  <span>
                    {mode === 'register'
                      ? 'Kurumsal Hesap Oluştur'
                      : 'Kurumsal Kimliği Doğrula ve Devam Et'}
                  </span>
                  <ArrowRight size={18} className="btn-arrow" />
                </>
              )}
            </button>
          </form>

          {/* Corporate Demo Quick Access (Step 1) */}
          {mode === 'login' && (
            <div
              className={`demo-accounts-card ${isDemoOpen ? 'is-open' : ''}`}
            >
              <button
                type="button"
                className="demo-header-toggle"
                onClick={() => setIsDemoOpen((prev) => !prev)}
                aria-expanded={isDemoOpen}
              >
                <div className="demo-title-group">
                  <Sparkles size={15} className="demo-icon" />
                  <strong>Hızlı Kurumsal Erişim</strong>
                </div>
                <div className="demo-header-actions">
                  <span className="demo-badge">1 Tıkla Doldur</span>
                  <ChevronDown
                    size={16}
                    className={`demo-chevron ${isDemoOpen ? 'open' : ''}`}
                  />
                </div>
              </button>

              <div
                className={`demo-collapse-body ${isDemoOpen ? 'is-open' : ''}`}
              >
                <div className="demo-collapse-inner">
                  <p className="demo-helper-text">
                    Önce kurumsal kimliği doğrulayın; ardından site içinde
                    yönetici, uzman veya çalışan girişi yapın:
                  </p>

                  <div className="demo-users-list">
                    {CORPORATE_ACCOUNTS.map((corp) => {
                      const isSelected = selectedDemoId === corp.id
                      return (
                        <button
                          key={corp.id}
                          type="button"
                          className={`demo-user-btn ${
                            isSelected ? 'selected' : ''
                          }`}
                          onClick={() => fillCorporateDemo(corp)}
                        >
                          <div className="demo-user-avatar-wrap">
                            <div className="demo-avatar demo-avatar-emerald">
                              EA
                            </div>
                          </div>

                          <div className="demo-user-meta">
                            <div className="demo-name-row">
                              <span className="demo-user-name">
                                {corp.tenantName} Kurumsal Kimlik
                              </span>
                              <span className="role-chip role-chip-emerald">
                                {corp.corporateCode}
                              </span>
                            </div>
                            <span className="demo-user-sub">
                              <Building2 size={12} />
                              {corp.corporateEmail}
                            </span>
                          </div>

                          <div className="demo-select-indicator">
                            {isSelected ? (
                              <CheckCircle2
                                size={18}
                                className="check-active"
                              />
                            ) : (
                              <div className="check-placeholder" />
                            )}
                          </div>
                        </button>
                      )
                    })}
                  </div>
                </div>
              </div>
            </div>
          )}

          <p className="login-support-note">
            Kurumsal erişim desteği için şirket yöneticiniz veya platform
            ekibiyle iletişime geçebilirsiniz.
          </p>
        </div>
      </section>
    </main>
  )
}

export default LoginPage
