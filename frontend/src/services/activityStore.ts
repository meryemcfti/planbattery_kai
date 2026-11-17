import type { ReportOptions } from './reportStore'
import { getReports } from './reportStore'
import { getAssessments } from './assessments'

export type ActivityStatus =
  | 'PENDING_REVIEW'
  | 'VALIDATED'
  | 'REVISION_REQUESTED'
  | 'FAILED'

export type CalculationResult = {
  co2eFromCo2: string
  co2eFromCh4: string
  co2eFromN2o: string
  totalKgCo2e: string
  totalTCo2e: string
  emissionFactorSet: string
  gwpSet: string
}

export type CalculationMatrix = {
  ncvMjPerM3: string
  oxidationFactor: string
  kwhPerM3: string
  co2KgPerTj: string
  ch4KgPerTj: string
  n2oKgPerTj: string
  matrixCode: string
}

export type EvidenceKind =
  | 'INVOICE_PHOTO'
  | 'SAP_SCREENSHOT'
  | 'METER_PHOTO'
  | 'MATRIX_SHEET'

export type EvidenceAttachment = {
  id: string
  kind: EvidenceKind
  title: string
  fileName: string
  uploadedBy: string
  uploadedAt: string
  documentCode: string
  imageDataUrl?: string
}

export type Activity = {
  id: number
  tenantName: string
  assessmentId: string
  assessmentName: string
  periodStart: string
  periodEnd: string
  period: string
  facilityId: string
  facility: string
  consumptionValue: number
  consumption: string
  sourceType: string
  sourceReference: string
  supplierName: string
  notes: string
  enteredBy: string
  enteredAt: string
  status: ActivityStatus
  calculation?: CalculationResult
  matrix?: CalculationMatrix
  attachments?: EvidenceAttachment[]
  errorMessage?: string
  revisionReason?: string
  feedbackBy?: string
  feedbackAt?: string
  validatedBy?: string
  validatedAt?: string
}

export type TenantRoleType =
  | 'COMPANY_ADMIN'
  | 'CARBON_SPECIALIST'
  | 'DATA_ENTRY'
  | 'VIEWER'

export type ManagerFeedbackItem = {
  id: string
  targetType: 'ACTIVITY' | 'REPORT'
  targetId: string
  targetTitle: string
  message: string
  createdBy: string
  senderRole?: string
  senderTenantRole?: TenantRoleType
  createdAt: string
  resolved: boolean
  reportOptions?: ReportOptions
  specialistReply?: string
  repliedBy?: string
  repliedByTenantRole?: TenantRoleType
  repliedAt?: string
}

type StoredUser = {
  name?: string
  tenantName?: string
  tenantRole?: TenantRoleType
}

export function getDefaultMatrix(): CalculationMatrix {
  return {
    ncvMjPerM3: '34,54 MJ/m³',
    oxidationFactor: '%99,5 (0,995)',
    kwhPerM3: '10,64 kWh/m³',
    co2KgPerTj: '56.100 kg/TJ',
    ch4KgPerTj: '1,0 kg/TJ',
    n2oKgPerTj: '0,1 kg/TJ',
    matrixCode: 'MAT-GHG-2026-NG01',
  }
}

export function getDefaultAttachmentsForActivity(
  id: number,
  sourceType: string,
  sourceReference: string,
  period: string,
  enteredBy: string,
  enteredAt: string,
): EvidenceAttachment[] {
  const isSap = sourceType.toLowerCase().includes('sistem')
  const isMeter = sourceType.toLowerCase().includes('sayaç')

  const primaryAttachment: EvidenceAttachment = isSap
    ? {
        id: `att-${id}-1`,
        kind: 'SAP_SCREENSHOT',
        title: 'SAP ERP Tüketim Kayıt Ekran Görüntüsü',
        fileName: `SAP_MM_${sourceReference || '490001'}_${period.replace(/\s+/g, '_')}.png`,
        uploadedBy: enteredBy || 'Mehmet Kaya',
        uploadedAt: enteredAt,
        documentCode: sourceReference || 'SAP-490001',
      }
    : isMeter
      ? {
          id: `att-${id}-1`,
          kind: 'METER_PHOTO',
          title: 'Saha Doğalgaz Sayaç Endeks Fotoğrafı',
          fileName: `Sayac_${sourceReference || 'SYC004'}_${period.replace(/\s+/g, '_')}.jpg`,
          uploadedBy: enteredBy || 'Mehmet Kaya',
          uploadedAt: enteredAt,
          documentCode: sourceReference || 'SYC-004',
        }
      : {
          id: `att-${id}-1`,
          kind: 'INVOICE_PHOTO',
          title: 'BOTAŞ Doğalgaz Tüketim Faturası Fotoğrafı',
          fileName: `Fatura_${sourceReference || 'FAT2026'}_${period.replace(/\s+/g, '_')}.jpg`,
          uploadedBy: enteredBy || 'Mehmet Kaya',
          uploadedAt: enteredAt,
          documentCode: sourceReference || 'FAT-2026-001',
        }

  const matrixAttachment: EvidenceAttachment = {
    id: `att-${id}-2`,
    kind: 'MATRIX_SHEET',
    title: 'Kapsam 1 Sabit Yanma Karbon Hesaplama Matrisi',
    fileName: `Karbon_Matrisi_${period.replace(/\s+/g, '_')}.xlsx`,
    uploadedBy: enteredBy || 'Mehmet Kaya',
    uploadedAt: enteredAt,
    documentCode: 'MAT-GHG-2026-NG01',
  }

  return [primaryAttachment, matrixAttachment]
}

export function createDemoCalculation(
  consumptionValue: number,
): CalculationResult {
  const co2 = consumptionValue * 1.8833333333
  const ch4 = consumptionValue * 0.0025
  const n2o = consumptionValue * 0.0009166667
  const total = co2 + ch4 + n2o

  const formatKg = (value: number) =>
    `${Math.round(value).toLocaleString('tr-TR')} kgCO₂e`

  const formattedTotalKg = formatKg(total)

  return {
    co2eFromCo2: formatKg(co2),
    co2eFromCh4: formatKg(ch4),
    co2eFromN2o: formatKg(n2o),
    totalKgCo2e: formattedTotalKg,
    totalTCo2e: formattedTotalKg,
    emissionFactorSet: 'GHG Protocol Cross-Sector Tools V2.0',
    gwpSet: 'IPCC AR5 — CH₄: 28, N₂O: 265',
  }
}

const initialActivities: Activity[] = [
  {
    id: 1,
    tenantName: 'E&M Akü',
    assessmentId: 'assessment-2026',
    assessmentName: '2026 Kurumsal Karbon Değerlendirmesi',
    periodStart: '2026-01-01',
    periodEnd: '2026-01-31',
    period: 'Ocak 2026',
    facilityId: 'bucak',
    facility: 'Bucak',
    consumptionValue: 12000,
    consumption: '12.000 m³',
    sourceType: 'Fatura',
    sourceReference: 'FAT-2026-001',
    supplierName: 'BOTAŞ',
    notes: 'Ocak ayı doğalgaz faturası fotoğrafı ve matris tablosu eklendi.',
    enteredBy: 'Mehmet Kaya',
    enteredAt: '03.02.2026 10:24',
    status: 'VALIDATED',
    calculation: createDemoCalculation(12000),
    matrix: getDefaultMatrix(),
    validatedBy: 'Ayşe Yılmaz (Çevre Uzmanı)',
    validatedAt: '04.02.2026 09:15',
  },
  {
    id: 2,
    tenantName: 'E&M Akü',
    assessmentId: 'assessment-2026',
    assessmentName: '2026 Kurumsal Karbon Değerlendirmesi',
    periodStart: '2026-02-01',
    periodEnd: '2026-02-28',
    period: 'Şubat 2026',
    facilityId: 'burdur-merkez',
    facility: 'Burdur Merkez',
    consumptionValue: 8000,
    consumption: '8.000 m³',
    sourceType: 'Sayaç',
    sourceReference: 'SYC-004',
    supplierName: '—',
    notes: 'Saha sayaç fotoğrafı ve hesaplama matrisi uzman kontrolüne sunuldu.',
    enteredBy: 'Mehmet Kaya',
    enteredAt: '04.03.2026 14:12',
    status: 'PENDING_REVIEW',
    calculation: createDemoCalculation(8000),
    matrix: getDefaultMatrix(),
  },
  {
    id: 3,
    tenantName: 'E&M Akü',
    assessmentId: 'assessment-2026',
    assessmentName: '2026 Kurumsal Karbon Değerlendirmesi',
    periodStart: '2026-03-01',
    periodEnd: '2026-03-31',
    period: 'Mart 2026',
    facilityId: 'bucak',
    facility: 'Bucak',
    consumptionValue: 7400,
    consumption: '7.400 m³',
    sourceType: 'Kurumsal Sistem',
    sourceReference: 'SAP-490001',
    supplierName: '—',
    notes: 'SAP MM tüketim ekran görüntüsü sisteme işlendi.',
    enteredBy: 'Mehmet Kaya',
    enteredAt: '02.04.2026 09:17',
    status: 'VALIDATED',
    calculation: createDemoCalculation(7400),
    matrix: getDefaultMatrix(),
    validatedBy: 'Ayşe Yılmaz (Çevre Uzmanı)',
    validatedAt: '03.04.2026 11:05',
  },
  {
    id: 4,
    tenantName: 'E&M Akü',
    assessmentId: 'assessment-2026',
    assessmentName: '2026 Kurumsal Karbon Değerlendirmesi',
    periodStart: '2026-04-01',
    periodEnd: '2026-04-30',
    period: 'Nisan 2026',
    facilityId: 'burdur-merkez',
    facility: 'Burdur Merkez',
    consumptionValue: 6500,
    consumption: '6.500 m³',
    sourceType: 'Fatura',
    sourceReference: 'FAT-2026-014',
    supplierName: 'BOTAŞ',
    notes: '',
    enteredBy: 'Mehmet Kaya',
    enteredAt: '05.05.2026 11:42',
    status: 'FAILED',
    matrix: getDefaultMatrix(),
    errorMessage:
      'Bu tüketim dönemi için geçerli bir emisyon faktörü bulunamadı. Lütfen katsayı matrisini doğrulayarak yeniden hesaplayın.',
  },
]

export function getCurrentUser(): StoredUser {
  try {
    return JSON.parse(
      localStorage.getItem('kai_user') ?? '{}',
    ) as StoredUser
  } catch {
    return {}
  }
}

function getCurrentTenantName() {
  const userTenant = getCurrentUser().tenantName
  if (userTenant) return userTenant
  try {
    const corp = JSON.parse(
      localStorage.getItem('kai_corporate_session') ?? '{}',
    ) as { tenantName?: string }
    if (corp.tenantName) return corp.tenantName
  } catch {
    // ignore malformed corporate session
  }
  return 'Şirket'
}

function getStorageKey() {
  return `kai_activities_${encodeURIComponent(getCurrentTenantName())}`
}

function getFeedbackStorageKey() {
  return `kai_feedbacks_${encodeURIComponent(getCurrentTenantName())}`
}

function getLogoStorageKey(tenantName?: string) {
  return `kai_tenant_logo_${encodeURIComponent(tenantName ?? getCurrentTenantName())}`
}

export function getTenantLogo(tenantName?: string): string | null {
  return localStorage.getItem(getLogoStorageKey(tenantName))
}

export function setTenantLogo(dataUrl: string | null) {
  if (!dataUrl) {
    localStorage.removeItem(getLogoStorageKey())
  } else {
    localStorage.setItem(getLogoStorageKey(), dataUrl)
  }
  window.dispatchEvent(new Event('kai-logo-updated'))
}

function getInitialActivities() {
  const tenantName = getCurrentTenantName()

  if (tenantName !== 'E&M Akü') {
    return []
  }

  return initialActivities.map((activity) => ({ ...activity }))
}

function normalizeActivity(activity: Activity): Activity {
  const defaultMatrix = activity.matrix ?? getDefaultMatrix()
  const defaultAttachments =
    activity.attachments && activity.attachments.length > 0
      ? activity.attachments
      : getDefaultAttachmentsForActivity(
          activity.id,
          activity.sourceType,
          activity.sourceReference,
          activity.period,
          activity.enteredBy,
          activity.enteredAt,
        )

  if (!activity.calculation) {
    return {
      ...activity,
      matrix: defaultMatrix,
      attachments: defaultAttachments,
    }
  }

  const rebuilt = createDemoCalculation(activity.consumptionValue)
  return {
    ...activity,
    matrix: defaultMatrix,
    attachments: defaultAttachments,
    calculation: {
      ...activity.calculation,
      co2eFromCo2: rebuilt.co2eFromCo2,
      co2eFromCh4: rebuilt.co2eFromCh4,
      co2eFromN2o: rebuilt.co2eFromN2o,
      totalKgCo2e: rebuilt.totalKgCo2e,
      totalTCo2e: rebuilt.totalKgCo2e,
    },
  }
}

export function getActivities(): Activity[] {
  const storedActivities = localStorage.getItem(getStorageKey())

  if (!storedActivities) {
    const activities = getInitialActivities()
    saveActivities(activities)
    return activities
  }

  try {
    const parsed = JSON.parse(storedActivities) as Activity[]
    return parsed.map(normalizeActivity)
  } catch {
    const activities = getInitialActivities()
    saveActivities(activities)
    return activities
  }
}

export function getActivity(id: number) {
  return getActivities().find((activity) => activity.id === id)
}

export function saveActivities(activities: Activity[]) {
  localStorage.setItem(
    getStorageKey(),
    JSON.stringify(activities.map(normalizeActivity)),
  )
}

export function addActivity(
  activity: Omit<Activity, 'id' | 'tenantName'>,
) {
  const activities = getActivities()
  const nextId =
    activities.reduce(
      (largestId, current) => Math.max(largestId, current.id),
      0,
    ) + 1

  const newActivity: Activity = normalizeActivity({
    ...activity,
    id: nextId,
    tenantName: getCurrentTenantName(),
  })

  saveActivities([newActivity, ...activities])
  return newActivity
}

export function updateActivity(
  id: number,
  changes: Partial<Activity>,
) {
  const activities = getActivities().map((activity) =>
    activity.id === id
      ? normalizeActivity({ ...activity, ...changes })
      : activity,
  )

  saveActivities(activities)
  return activities.find((activity) => activity.id === id)
}

export function deleteActivityById(id: number) {
  saveActivities(
    getActivities().filter((activity) => activity.id !== id),
  )
}

const roleDisplayNames: Record<TenantRoleType, string> = {
  COMPANY_ADMIN: 'Şirket Yöneticisi',
  CARBON_SPECIALIST: 'Çevre / Karbon Uzmanı',
  DATA_ENTRY: 'Veri ve Operasyon Sorumlusu',
  VIEWER: 'İzleyici',
}

function inferSenderTenantRole(item: ManagerFeedbackItem): TenantRoleType {
  if (item.senderTenantRole) return item.senderTenantRole
  if (
    item.senderRole?.includes('Veri') ||
    item.senderRole?.includes('Operasyon')
  ) {
    return 'DATA_ENTRY'
  }
  if (item.senderRole?.includes('Uzman')) {
    return 'CARBON_SPECIALIST'
  }
  return 'COMPANY_ADMIN'
}

function isCompletionNotification(title: string) {
  return (
    title.startsWith('Uzman Onayı Tamamlandı') ||
    title.startsWith('Uzman Onaylı Rapor Hazır')
  )
}

export function getAllManagerFeedbacks(): ManagerFeedbackItem[] {
  const raw = localStorage.getItem(getFeedbackStorageKey())
  if (!raw) return []
  try {
    const parsed = JSON.parse(raw) as ManagerFeedbackItem[]
    let changed = false
    const normalized = parsed.map((item) => {
      if (!item.resolved && isCompletionNotification(item.targetTitle)) {
        changed = true
        return {
          ...item,
          resolved: true,
          repliedAt: item.repliedAt ?? item.createdAt,
          repliedBy:
            item.repliedBy ?? `${item.createdBy} (${item.senderRole ?? 'Uzman'})`,
        }
      }
      return item
    })
    if (changed) {
      localStorage.setItem(getFeedbackStorageKey(), JSON.stringify(normalized))
    }
    return normalized
  } catch {
    return []
  }
}

/**
 * Role-based Incoming & Completed notifications:
 * - Shows ONLY requests coming from other roles (respecting hierarchy: COMPANY_ADMIN never sees DATA_ENTRY raw items)
 *   AND completed (resolved === true) items.
 * - Unresolved items sent by the current role itself are shown in the "İletildi" (Sent) tab, not here.
 */
export function getIncomingAndResolvedNotifications(): ManagerFeedbackItem[] {
  const currentUser = getCurrentUser()
  const viewerRole: TenantRoleType = currentUser.tenantRole ?? 'VIEWER'
  const all = getAllManagerFeedbacks()

  return all.filter((item) => {
    const sender = inferSenderTenantRole(item)

    if (viewerRole === 'COMPANY_ADMIN') {
      // Admin never sees DATA_ENTRY raw operational items
      if (sender === 'DATA_ENTRY') return false
      // Admin sees items from CARBON_SPECIALIST, or their own requests once resolved
      return sender === 'CARBON_SPECIALIST' || item.resolved
    }

    // CARBON_SPECIALIST and DATA_ENTRY see incoming requests from other roles, or resolved items
    return sender !== viewerRole || item.resolved
  })
}

/**
 * Notifications created/sent by the current user's role ("İletildi" tab)
 */
export function getSentNotifications(): ManagerFeedbackItem[] {
  const currentUser = getCurrentUser()
  const viewerRole: TenantRoleType = currentUser.tenantRole ?? 'VIEWER'
  return getAllManagerFeedbacks().filter(
    (item) => inferSenderTenantRole(item) === viewerRole,
  )
}

export function getManagerFeedbacks(): ManagerFeedbackItem[] {
  return getIncomingAndResolvedNotifications()
}

function notifyFeedbackUpdate() {
  window.dispatchEvent(new Event('kai-feedback-updated'))
}

export function addManagerFeedback(
  item: Omit<ManagerFeedbackItem, 'id' | 'createdAt' | 'resolved'> & {
    resolved?: boolean
  },
) {
  const currentUser = getCurrentUser()
  const senderTenantRole: TenantRoleType =
    item.senderTenantRole ?? currentUser.tenantRole ?? 'COMPANY_ADMIN'
  const senderRole = item.senderRole ?? roleDisplayNames[senderTenantRole]
  const createdAt = new Date().toLocaleString('tr-TR')
  const autoResolved =
    item.resolved ?? isCompletionNotification(item.targetTitle)

  const list = getAllManagerFeedbacks()
  const created: ManagerFeedbackItem = {
    ...item,
    senderTenantRole,
    senderRole,
    id: `fb-${Date.now()}-${Math.random().toString(36).slice(2, 5)}`,
    createdAt,
    resolved: autoResolved,
    ...(autoResolved
      ? {
          repliedAt: createdAt,
          repliedBy: `${item.createdBy} (${senderRole})`,
        }
      : {}),
  }
  localStorage.setItem(
    getFeedbackStorageKey(),
    JSON.stringify([created, ...list]),
  )
  notifyFeedbackUpdate()
  return created
}

export function resolveManagerFeedback(id: string, specialistReply?: string) {
  const currentUser = getCurrentUser()
  const replierRole: TenantRoleType =
    currentUser.tenantRole ?? 'CARBON_SPECIALIST'
  const roleLabel = roleDisplayNames[replierRole]

  const updated = getAllManagerFeedbacks().map((item) =>
    item.id === id
      ? {
          ...item,
          resolved: true,
          specialistReply:
            specialistReply?.trim() ||
            item.specialistReply ||
            'Kontrol ve gerekli güncelleme tamamlandı.',
          repliedBy: `${currentUser.name ?? roleLabel} (${roleLabel})`,
          repliedByTenantRole: replierRole,
          repliedAt: new Date().toLocaleString('tr-TR'),
        }
      : item,
  )
  localStorage.setItem(getFeedbackStorageKey(), JSON.stringify(updated))
  notifyFeedbackUpdate()
  return getManagerFeedbacks()
}

export function deleteManagerFeedback(id: string) {
  const updated = getAllManagerFeedbacks().filter((item) => item.id !== id)
  localStorage.setItem(getFeedbackStorageKey(), JSON.stringify(updated))
  notifyFeedbackUpdate()
  return getManagerFeedbacks()
}

export function getReportOptionsForFeedback(
  fb: ManagerFeedbackItem,
): ReportOptions {
  if (fb.reportOptions) {
    return fb.reportOptions
  }

  const savedReports = getReports()
  const matchedSaved = savedReports.find(
    (r) => r.id === fb.targetId || r.assessmentId === fb.targetId,
  )
  if (matchedSaved) {
    return matchedSaved.options
  }

  const assessments = getAssessments()
  const matchedAssessment =
    assessments.find((a) => a.id === fb.targetId) ?? assessments[0]

  return {
    assessmentId: matchedAssessment?.id ?? 'assessment-2026',
    reportScope: 'COMPANY',
    facilityId: '',
    periodType: 'ASSESSMENT',
    periodStart: matchedAssessment?.periodStart ?? '2026-01-01',
    periodEnd: matchedAssessment?.periodEnd ?? '2026-12-31',
    recordScope: 'CALCULATED',
    reportDetail: 'DETAILED',
  }
}
