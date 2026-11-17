export type TenantRole =
  | 'COMPANY_ADMIN'
  | 'CARBON_SPECIALIST'
  | 'DATA_ENTRY'
  | 'VIEWER'

export type DemoUser = {
  id: string
  name: string
  initials: string
  email: string
  password: string
  role: string
  tenantRole: TenantRole
  tenantName: string
  badgeVariant: 'emerald' | 'indigo' | 'amber'
  description: string
}

export type RegisteredUser = {
  name: string
  email: string
  password: string
  role: string
  tenantRole: TenantRole
  tenantName: string
}

export type CorporateAccount = {
  id: string
  tenantName: string
  corporateEmail: string
  corporateCode: string
  password: string
}

export type CorporateSession = {
  tenantName: string
  corporateEmail: string
  verifiedAt: string
}

export const CORPORATE_ACCOUNTS: CorporateAccount[] = [
  {
    id: 'em-aku',
    tenantName: 'E&M Akü',
    corporateEmail: 'kurumsal@emandaku.com',
    corporateCode: 'EMAKU-2026',
    password: 'Kurum123!',
  },
]

export const demoUsers: DemoUser[] = [
  {
    id: 'engin',
    name: 'Engin Zengin',
    initials: 'EZ',
    email: 'engin@emandaku.com',
    password: 'Admin123!',
    role: 'Şirket Yöneticisi',
    tenantRole: 'COMPANY_ADMIN',
    tenantName: 'E&M Akü',
    badgeVariant: 'indigo',
    description: 'Rapor inceleme, PDF çıktı alma ve kontrol talebi',
  },
  {
    id: 'ayse',
    name: 'Ayşe Yılmaz',
    initials: 'AY',
    email: 'ayse@emandaku.com',
    password: 'Demo123!',
    role: 'Çevre / Karbon Uzmanı',
    tenantRole: 'CARBON_SPECIALIST',
    tenantName: 'E&M Akü',
    badgeVariant: 'emerald',
    description: 'Tesis veri girişi, hesaplama kontrolü ve sistem onayı',
  },
  {
    id: 'mehmet',
    name: 'Mehmet Kaya',
    initials: 'MK',
    email: 'mehmet@emandaku.com',
    password: 'Veri123!',
    role: 'Veri ve Operasyon Sorumlusu',
    tenantRole: 'DATA_ENTRY',
    tenantName: 'E&M Akü',
    badgeVariant: 'amber',
    description: 'Fatura, SAP görüntüsü ve karbon matrisi veri girişi',
  },
]

const CORP_SESSION_KEY = 'kai_corporate_session'
const REGISTERED_USERS_KEY = 'kai_registered_users'

export function getRegisteredUsers(): RegisteredUser[] {
  try {
    return JSON.parse(
      localStorage.getItem(REGISTERED_USERS_KEY) ?? '[]',
    ) as RegisteredUser[]
  } catch {
    return []
  }
}

export function saveRegisteredUser(user: RegisteredUser) {
  const existing = getRegisteredUsers().filter((u) => u.email !== user.email)
  localStorage.setItem(
    REGISTERED_USERS_KEY,
    JSON.stringify([...existing, user]),
  )
}

export function getCorporateSession(): CorporateSession | null {
  try {
    const raw = localStorage.getItem(CORP_SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CorporateSession
    return parsed?.tenantName ? parsed : null
  } catch {
    return null
  }
}

export function setCorporateSession(session: CorporateSession) {
  localStorage.setItem(CORP_SESSION_KEY, JSON.stringify(session))
}

export function clearCorporateSession() {
  localStorage.removeItem(CORP_SESSION_KEY)
}

export function verifyCorporateCredentials(
  identifier: string,
  password: string,
): CorporateSession | null {
  const cleanId = identifier.trim().toLowerCase()
  const cleanCode = identifier.trim().toUpperCase()

  const matchedCorp = CORPORATE_ACCOUNTS.find(
    (c) =>
      (c.corporateEmail.toLowerCase() === cleanId ||
        c.corporateCode.toUpperCase() === cleanCode) &&
      c.password === password,
  )
  if (matchedCorp) {
    return {
      tenantName: matchedCorp.tenantName,
      corporateEmail: matchedCorp.corporateEmail,
      verifiedAt: new Date().toISOString(),
    }
  }

  // Also allow registered company users or demo users to verify their organization
  const matchedRegistered = getRegisteredUsers().find(
    (u) => u.email.toLowerCase() === cleanId && u.password === password,
  )
  if (matchedRegistered) {
    return {
      tenantName: matchedRegistered.tenantName,
      corporateEmail: matchedRegistered.email,
      verifiedAt: new Date().toISOString(),
    }
  }

  const matchedDemo = demoUsers.find(
    (u) => u.email.toLowerCase() === cleanId && u.password === password,
  )
  if (matchedDemo) {
    return {
      tenantName: matchedDemo.tenantName,
      corporateEmail: matchedDemo.email,
      verifiedAt: new Date().toISOString(),
    }
  }

  return null
}
