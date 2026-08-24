import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'
import './LoginPage.css'

type TenantRole = 'COMPANY_ADMIN' | 'DATA_ENTRY' | 'VIEWER'

type DemoUser = {
  name: string
  email: string
  password: string
  role: string
  tenantRole: TenantRole
  tenantName: string
}

const demoUsers: DemoUser[] = [
  {
    name: 'Ayşe Yılmaz',
    email: 'ayse@emandaku.com',
    password: 'Demo123!',
    role: 'Çevre Uzmanı',
    tenantRole: 'DATA_ENTRY',
    tenantName: 'E&M Akü',
  },
  {
    name: 'Engin Zengin',
    email: 'engin@emandaku.com',
    password: 'Admin123!',
    role: 'Şirket Yöneticisi',
    tenantRole: 'COMPANY_ADMIN',
    tenantName: 'E&M Akü',
  },
]

function LoginPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setError('')

    if (!email.trim() || !password.trim()) {
      setError('E-posta ve parola alanları zorunludur.')
      return
    }

    setIsSubmitting(true)

    window.setTimeout(() => {
      const matchedUser = demoUsers.find(
        (user) =>
          user.email === email.trim().toLowerCase() &&
          user.password === password,
      )

      if (!matchedUser) {
        setError('E-posta veya parola hatalı.')
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
          tenantName: matchedUser.tenantName,
        }),
      )

      navigate('/activities', { replace: true })
    }, 500)
  }

  function fillDemoUser(user: DemoUser) {
    setEmail(user.email)
    setPassword(user.password)
    setError('')
  }

  return (
    <main className="login-page">
      <section className="login-brand">
        <div className="login-logo">
          <span>◇</span>
          PlanBattery KAI
        </div>

        <div>
          <p className="login-eyebrow">
            Kurumsal karbon yönetimi
          </p>

          <h1>
            Faaliyet verilerinizi yönetin, emisyonlarınızı hesaplayın.
          </h1>

          <p className="login-description">
            Şirket ve tesis bazlı doğalgaz faaliyetlerini güvenli,
            izlenebilir ve doğrulanabilir biçimde yönetin.
          </p>
        </div>

        <p className="login-scope">
          Scope 1 · Doğalgaz · Sabit Yanma
        </p>
      </section>

      <section className="login-panel">
        <form className="login-form" onSubmit={handleSubmit}>
          <div className="login-form-heading">
            <h2>Hesabınıza giriş yapın</h2>

            <p>
              Şirketinizin karbon değerlendirmesine erişmek için
              bilgilerinizi girin.
            </p>
          </div>

          {error && (
            <div className="login-error" role="alert">
              {error}
            </div>
          )}

          <label>
            <span>E-posta adresi</span>

            <input
              type="email"
              value={email}
              placeholder="ornek@sirket.com"
              autoComplete="email"
              onChange={(event) => setEmail(event.target.value)}
            />
          </label>

          <label>
            <span>Parola</span>

            <input
              type="password"
              value={password}
              placeholder="Parolanızı girin"
              autoComplete="current-password"
              onChange={(event) => setPassword(event.target.value)}
            />
          </label>

          <button
            className="login-button"
            type="submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Giriş yapılıyor...' : 'Giriş Yap'}
          </button>

          <div className="demo-credentials">
            <strong>Demo hesapları</strong>

            <button
              type="button"
              onClick={() => fillDemoUser(demoUsers[0])}
            >
              <span>Ayşe Yılmaz</span>
              <small>Veri Girişi · DATA_ENTRY</small>
            </button>

            <button
              type="button"
              onClick={() => fillDemoUser(demoUsers[1])}
            >
              <span>Engin Zengin</span>
              <small>Şirket Yöneticisi · COMPANY_ADMIN</small>
            </button>
          </div>

          <p className="login-help">
            Hesabınız yoksa şirket yöneticiniz veya platform
            yöneticisiyle iletişime geçin.
          </p>
        </form>
      </section>
    </main>
  )
}

export default LoginPage