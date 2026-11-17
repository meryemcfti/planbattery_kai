import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowRight,
  Building2,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronRight,
  ChevronUp,
  Circle,
  Clock,
  FileCheck2,
  MessageSquareWarning,
  Plus,
} from 'lucide-react'
import {
  addManagerFeedback,
  getActivities,
  getManagerFeedbacks,
  getReportOptionsForFeedback,
  resolveManagerFeedback,
  updateActivity,
} from '../services/activityStore'
import type {
  Activity,
  ActivityStatus,
  ManagerFeedbackItem,
} from '../services/activityStore'
import { getAssessments } from '../services/assessments'
import { getReports, groupReportsByPeriod } from '../services/reportStore'
import './DashboardPage.css'

type User = {
  name?: string
  tenantName?: string
  role?: string
  tenantRole?:
    | 'COMPANY_ADMIN'
    | 'CARBON_SPECIALIST'
    | 'DATA_ENTRY'
    | 'VIEWER'
}

type SetupStep = {
  title: string
  description: string
  to: string
  completed: boolean
}

const statusLabels: Record<ActivityStatus, string> = {
  PENDING_REVIEW: 'Uzman Onayı Bekliyor',
  VALIDATED: 'Uzman Onaylı',
  REVISION_REQUESTED: 'Yönetici Kontrol Talebi',
  FAILED: 'Hesaplanamadı',
}

function getUser(): User {
  try {
    return JSON.parse(localStorage.getItem('kai_user') ?? '{}') as User
  } catch {
    return {}
  }
}

function SetupGuide({ steps }: { steps: SetupStep[] }) {
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem('kai_setup_guide_collapsed') === 'true',
  )

  const completedCount = steps.filter((step) => step.completed).length
  const currentStepIndex = steps.findIndex((step) => !step.completed)

  function toggleGuide() {
    const nextValue = !collapsed
    setCollapsed(nextValue)
    localStorage.setItem('kai_setup_guide_collapsed', String(nextValue))
  }

  return (
    <section className={`setup-guide ${collapsed ? 'collapsed' : ''}`}>
      <div className="setup-guide-header">
        <div>
          <span className="setup-guide-eyebrow">BAŞLANGIÇ REHBERİ</span>
          <h2>Karbon değerlendirmesi iş akışı</h2>
          {!collapsed && (
            <p>
              Kurumsal sera gazı envanterinizi tamamlamak için aşağıdaki
              adımları takip edin.
            </p>
          )}
        </div>

        <div className="setup-guide-controls">
          <span className="setup-progress">
            {completedCount}/{steps.length} adım tamamlandı
          </span>

          <button
            type="button"
            onClick={toggleGuide}
            aria-label={collapsed ? 'Rehberi aç' : 'Rehberi daralt'}
            title={collapsed ? 'Rehberi aç' : 'Rehberi daralt'}
          >
            {collapsed ? <ChevronDown size={19} /> : <ChevronUp size={19} />}
          </button>
        </div>
      </div>

      {!collapsed && (
        <>
          <div className="setup-progress-track">
            <span
              style={{
                width: `${(completedCount / steps.length) * 100}%`,
              }}
            />
          </div>

          <div className="setup-step-grid">
            {steps.map((step, index) => {
              const isCurrent = index === currentStepIndex

              return (
                <Link
                  key={step.title}
                  to={step.to}
                  className={[
                    'setup-step',
                    step.completed ? 'completed' : '',
                    isCurrent ? 'current' : '',
                  ]
                    .filter(Boolean)
                    .join(' ')}
                >
                  <span className="setup-step-icon">
                    {step.completed ? (
                      <Check size={17} strokeWidth={2.4} />
                    ) : (
                      <Circle size={17} strokeWidth={1.8} />
                    )}
                  </span>

                  <span className="setup-step-content">
                    <strong>{step.title}</strong>
                    <small>{step.description}</small>
                  </span>

                  <ChevronRight className="setup-step-arrow" size={17} />
                </Link>
              )
            })}
          </div>
        </>
      )}
    </section>
  )
}

function useActivityMetrics(activities: Activity[]) {
  return useMemo(() => {
    const validated = activities.filter((a) => a.status === 'VALIDATED')
    const pending = activities.filter(
      (a) =>
        a.status === 'PENDING_REVIEW' || a.status === 'REVISION_REQUESTED',
    )
    const failed = activities.filter((a) => a.status === 'FAILED')

    const validatedKg = validated.reduce(
      (sum, a) => sum + (a.calculation ? a.consumptionValue * 1.88675 : 0),
      0,
    )
    const calculatedKg = activities.reduce(
      (sum, a) => sum + (a.calculation ? a.consumptionValue * 1.88675 : 0),
      0,
    )
    const totalConsumptionM3 = activities.reduce(
      (sum, a) => sum + a.consumptionValue,
      0,
    )

    const facilityMap = new Map<
      string,
      { id: string; name: string; m3: number; kgCo2e: number; count: number }
    >()

    for (const act of activities) {
      const current = facilityMap.get(act.facility) ?? {
        id: act.facilityId,
        name: act.facility,
        m3: 0,
        kgCo2e: 0,
        count: 0,
      }
      current.m3 += act.consumptionValue
      if (act.calculation) {
        current.kgCo2e += Math.round(act.consumptionValue * 1.88675)
      }
      current.count += 1
      facilityMap.set(act.facility, current)
    }

    const facilityBreakdown = Array.from(facilityMap.values()).sort(
      (a, b) => b.kgCo2e - a.kgCo2e,
    )

    return {
      totalCount: activities.length,
      validatedCount: validated.length,
      pendingCount: pending.length,
      failedCount: failed.length,
      validatedKgFormatted: Math.round(validatedKg).toLocaleString('tr-TR'),
      calculatedKgFormatted: Math.round(calculatedKg).toLocaleString('tr-TR'),
      totalConsumptionFormatted: totalConsumptionM3.toLocaleString('tr-TR'),
      facilityBreakdown,
      completionRate:
        activities.length > 0
          ? Math.round((validated.length / activities.length) * 100)
          : 0,
    }
  }, [activities])
}

function AdminDashboard({
  user,
  activities,
}: {
  user: User
  activities: Activity[]
}) {
  const metrics = useActivityMetrics(activities)
  const reports = useMemo(() => getReports(), [])
  const groupedReports = useMemo(() => groupReportsByPeriod(reports), [reports])
  const [collapsedReportGroups, setCollapsedReportGroups] = useState<
    Record<string, boolean>
  >({})

  function toggleReportGroup(key: string) {
    setCollapsedReportGroups((prev) => ({ ...prev, [key]: !prev[key] }))
  }

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Genel Bakış</h1>
          <p>
            {user.tenantName ?? 'Kurum'} bünyesindeki uzman onaylı karbon
            raporlarını inceleyin, PDF çıktısı alın ve gerekirse rapor üzerinden
            çevre uzmanınıza kontrol talebi iletin.
          </p>
        </div>

        <div className="dashboard-header-actions">
          <Link className="secondary-header-action" to="/reports/comparison">
            <span>Dönemsel Karşılaştırma</span>
          </Link>
          <Link className="primary-action" to="/reports">
            <FileCheck2 size={17} />
            <span>Raporları İncele / PDF Al</span>
          </Link>
        </div>
      </header>

      <div className="metric-grid">
        <article className="metric-card featured">
          <span>Uzman Onaylı Emisyon</span>
          <strong>
            {metrics.validatedKgFormatted} <small>kgCO₂e</small>
          </strong>
          <em>{metrics.validatedCount} onaylı faaliyet kaydından</em>
        </article>

        <article className="metric-card">
          <span>Toplam Doğalgaz Tüketimi</span>
          <strong>
            {metrics.totalConsumptionFormatted} <small>m³</small>
          </strong>
          <em>{metrics.facilityBreakdown.length} aktif üretim tesisi</em>
        </article>

        <article className="metric-card">
          <span>Hazır Kurumsal Rapor</span>
          <strong>{reports.length}</strong>
          <em>İnceleme ve PDF çıktısına hazır</em>
        </article>

        <article className="metric-card">
          <span>Envanter Onay Oranı</span>
          <strong>%{metrics.completionRate}</strong>
          <em>
            {metrics.pendingCount > 0
              ? `${metrics.pendingCount} kayıt uzman kontrolünde`
              : 'Tüm kayıtlar onaylandı'}
          </em>
        </article>
      </div>

      <div className="dashboard-grid">
        {/* Ready Reports for Manager Review */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Kurumsal Karbon Raporları</h2>
              <p>İncelemek veya PDF çıktısı almak için bir rapor seçin</p>
            </div>
            <Link to="/reports" className="panel-link">
              <span>Tüm Raporlar</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          {groupedReports.length > 0 ? (
            <div className="dashboard-report-groups">
              {groupedReports.map((group) => {
                const isCollapsed = !!collapsedReportGroups[group.key]
                return (
                  <div key={group.key} className="dashboard-report-group">
                    <button
                      type="button"
                      className="dashboard-report-group-header"
                      onClick={() => toggleReportGroup(group.key)}
                    >
                      <span className="report-group-title">
                        <CalendarRange size={15} />
                        <strong>{group.assessmentName}</strong>
                      </span>
                      <span className="report-group-meta">
                        <span className="report-group-count">
                          {group.reports.length} rapor
                        </span>
                        {isCollapsed ? (
                          <ChevronRight size={15} />
                        ) : (
                          <ChevronDown size={15} />
                        )}
                      </span>
                    </button>

                    {!isCollapsed && (
                      <div className="dashboard-recent-list">
                        {group.reports.slice(0, 6).map((rep) => (
                          <div key={rep.id} className="dashboard-recent-item">
                            <div className="recent-main">
                              <strong>{rep.name}</strong>
                              <small>
                                {rep.options.reportScope === 'COMPANY'
                                  ? 'Şirket Geneli'
                                  : 'Tesis Bazlı'}{' '}
                                · {rep.createdAt} · {rep.createdBy}
                              </small>
                            </div>

                            <div className="recent-status-actions">
                              <Link
                                to="/reports/preview"
                                state={rep.options}
                                className="recent-detail-btn"
                              >
                                Raporu İncele →
                              </Link>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )
              })}
            </div>
          ) : (
            <div className="all-clear-box">
              <FileCheck2 size={20} />
              <div>
                <strong>Henüz oluşturulmuş rapor bulunmuyor</strong>
                <p>
                  Raporlar sayfasından mevcut değerlendirme için anında
                  kurumsal rapor önizleyebilirsiniz.
                </p>
              </div>
            </div>
          )}
        </section>

        {/* Facility Breakdown Panel */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Tesis Bazlı Emisyon Dağılımı (kgCO₂e)</h2>
              <p>Kurum tesislerinin Kapsam 1 payları</p>
            </div>
            <span className="soft-badge">Sabit Yanma</span>
          </div>

          <div className="facility-breakdown-list">
            {metrics.facilityBreakdown.map((item) => {
              const maxKg = Math.max(
                ...metrics.facilityBreakdown.map((f) => f.kgCo2e),
                1,
              )
              const widthPercent = Math.max(
                Math.round((item.kgCo2e / maxKg) * 100),
                8,
              )

              return (
                <Link
                  key={item.id || item.name}
                  to={`/reports?facilityId=${encodeURIComponent(item.id)}&facilityName=${encodeURIComponent(item.name)}`}
                  className="facility-breakdown-item facility-breakdown-link"
                  title={`${item.name} kapsamındaki raporları görüntüle`}
                >
                  <div className="facility-breakdown-top">
                    <div className="facility-name-group">
                      <span className="facility-icon-box">
                        <Building2 size={16} />
                      </span>
                      <div>
                        <strong>{item.name}</strong>
                        <small>{item.m3.toLocaleString('tr-TR')} m³</small>
                      </div>
                    </div>

                    <div className="facility-emission-number">
                      <strong>
                        {item.kgCo2e.toLocaleString('tr-TR')} kgCO₂e
                      </strong>
                      <ChevronRight
                        size={15}
                        className="facility-link-arrow"
                      />
                    </div>
                  </div>

                  <div className="facility-bar-track">
                    <span style={{ width: `${widthPercent}%` }} />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}

function SpecialistDashboard({
  user,
  activities,
  onActivitiesChange,
}: {
  user: User
  activities: Activity[]
  onActivitiesChange: () => void
}) {
  const hasAssessment = getAssessments().length > 0
  const metrics = useActivityMetrics(activities)
  const [feedbacks, setFeedbacks] = useState<ManagerFeedbackItem[]>(
    getManagerFeedbacks,
  )
  const [expandedFbId, setExpandedFbId] = useState<string | null>(null)

  const openFeedbacks = useMemo(
    () => feedbacks.filter((f) => !f.resolved),
    [feedbacks],
  )

  const actionRequiredList = useMemo(
    () =>
      activities.filter(
        (a) =>
          a.status === 'FAILED' ||
          a.status === 'REVISION_REQUESTED' ||
          a.status === 'PENDING_REVIEW',
      ),
    [activities],
  )

  function handleResolveFeedback(id: string) {
    setFeedbacks(resolveManagerFeedback(id))
  }

  function handleQuickApprove(act: Activity) {
    if (!act.calculation) return
    const specialistName = user.name ?? 'Çevre / Karbon Uzmanı'
    updateActivity(act.id, {
      status: 'VALIDATED',
      revisionReason: '',
      validatedBy: `${specialistName} (Çevre / Karbon Uzmanı)`,
      validatedAt: new Date().toLocaleString('tr-TR'),
    })
    addManagerFeedback({
      targetType: 'ACTIVITY',
      targetId: String(act.id),
      targetTitle: `Uzman Onayı Tamamlandı: ${act.facility} · ${act.period} (${act.consumption})`,
      message: `#${act.id} numaralı doğalgaz faaliyet kaydı (${act.calculation.totalKgCo2e}) Çevre / Karbon Uzmanı tarafından onaylandı.`,
      createdBy: specialistName,
      senderRole: 'Çevre / Karbon Uzmanı',
      senderTenantRole: 'CARBON_SPECIALIST',
    })
    onActivitiesChange()
  }

  const steps: SetupStep[] = [
    {
      title: 'Değerlendirme dönemini seç',
      description: 'Aktif raporlama dönemini kontrol edin.',
      to: '/assessments',
      completed: hasAssessment,
    },
    {
      title: 'Tesis doğalgaz verisi ekle',
      description: 'Fatura, sayaç veya ERP verilerini girin.',
      to: '/activities/new',
      completed: metrics.totalCount > 0,
    },
    {
      title: 'Kontrol et ve onayla',
      description:
        metrics.failedCount + metrics.pendingCount > 0
          ? `${metrics.pendingCount} onay bekleyen, ${metrics.failedCount} hatalı kayıt`
          : 'Tüm kayıtlar onaylandı.',
      to: '/activities',
      completed: metrics.failedCount === 0 && metrics.pendingCount === 0,
    },
  ]

  return (
    <>
      <header className="dashboard-header">
        <div>
          <h1>Merhaba, {user.name?.split(' ')[0] ?? 'Kullanıcı'}</h1>
          <p>
            {user.tenantRole === 'DATA_ENTRY'
              ? `${user.tenantName ?? 'Kurum'} tesislerinin doğalgaz fatura fotoğraflarını, SAP ekran görüntülerini ve karbon hesaplama matrislerini sisteme işleyerek Çevre Uzmanı (Ayşe Yılmaz) kontrolüne gönderin.`
              : `${user.tenantName ?? 'Kurum'} tesislerinin doğalgaz faaliyet verilerini, kanıt görsellerini ve kgCO₂e hesaplama matrislerini kontrol ederek onaylayın.`}
          </p>
        </div>

        <div className="dashboard-header-actions">
          {user.tenantRole === 'CARBON_SPECIALIST' && (
            <Link className="secondary-header-action" to="/reports/comparison">
              <span>Dönemsel Karşılaştırma</span>
            </Link>
          )}
          <Link className="secondary-header-action" to="/reports">
            <span>
              {user.tenantRole === 'DATA_ENTRY'
                ? 'Rapor Oluştur & Uzmana Sun'
                : 'Raporları Yönet'}
            </span>
          </Link>
          <Link className="primary-action" to="/activities/new">
            <Plus size={18} />
            <span>
              {user.tenantRole === 'DATA_ENTRY'
                ? 'Fatura / SAP & Matris İşle'
                : 'Yeni Doğalgaz Kaydı'}
            </span>
          </Link>
        </div>
      </header>

      <SetupGuide steps={steps} />

      <div className="metric-grid">
        <article className="metric-card featured">
          <span>Hesaplanan Toplam Emisyon</span>
          <strong>
            {metrics.calculatedKgFormatted} <small>kgCO₂e</small>
          </strong>
          <em>Onayladığınız: {metrics.validatedKgFormatted} kgCO₂e</em>
        </article>

        <article className="metric-card">
          <span>Toplam Faaliyet Kaydı</span>
          <strong>{metrics.totalCount}</strong>
          <em>{metrics.totalConsumptionFormatted} m³ toplam tüketim</em>
        </article>

        <article className="metric-card">
          <span>Onayınızı Bekleyen</span>
          <strong>{metrics.pendingCount}</strong>
          <em className={metrics.pendingCount > 0 ? 'warning-text' : ''}>
            {metrics.pendingCount > 0
              ? 'Çevre uzmanı onayı bekliyor'
              : 'Bekleyen kayıt yok'}
          </em>
        </article>

        <article className="metric-card">
          <span>Yönetici Talebi / Hatalı</span>
          <strong>{metrics.failedCount + openFeedbacks.length}</strong>
          <em
            className={
              metrics.failedCount + openFeedbacks.length > 0
                ? 'danger-text'
                : ''
            }
          >
            {metrics.failedCount + openFeedbacks.length > 0
              ? 'Kontrol ve güncelleme gerekiyor'
              : 'Açık talep bulunmuyor'}
          </em>
        </article>
      </div>

      {/* Manager Feedbacks Banner for Ayşe Yılmaz */}
      {openFeedbacks.length > 0 && (
        <section className="panel specialist-feedback-inbox">
          <div className="panel-heading">
            <div>
              <h2>Şirket Yöneticisinden Gelen Kontrol & Güncelleme Talepleri</h2>
              <p>
                Şirket yöneticisinin rapor veya kayıtlar için ilettiği inceleme
                notları
              </p>
            </div>
            <span className="soft-badge">
              {openFeedbacks.length} açık talep
            </span>
          </div>

          <div className="feedback-inbox-list">
            {openFeedbacks.map((fb) => {
              const isExpanded = expandedFbId === fb.id
              return (
                <article key={fb.id} className="feedback-inbox-item-accordion">
                  <button
                    type="button"
                    className="feedback-inbox-trigger"
                    onClick={() =>
                      setExpandedFbId((prev) => (prev === fb.id ? null : fb.id))
                    }
                  >
                    <MessageSquareWarning size={18} className="fb-icon" />
                    <div className="fb-body">
                      <strong>{fb.targetTitle}</strong>
                      <small>
                        {fb.createdBy} · {fb.createdAt}
                      </small>
                    </div>
                    <ChevronDown
                      size={17}
                      className={`fb-chevron ${isExpanded ? 'open' : ''}`}
                    />
                  </button>

                  {isExpanded && (
                    <div className="feedback-inbox-expanded">
                      <p className="fb-expanded-msg">{fb.message}</p>
                      <div className="fb-actions">
                        {fb.targetType === 'ACTIVITY' ? (
                          <Link
                            to={`/activities/${fb.targetId}`}
                            className="task-action-link"
                          >
                            İlgili Kaydı Aç →
                          </Link>
                        ) : (
                          <Link
                            to="/reports/preview"
                            state={getReportOptionsForFeedback(fb)}
                            className="task-action-link"
                          >
                            İlgili Raporu Aç →
                          </Link>
                        )}
                        <button
                          type="button"
                          className="fb-resolve-btn"
                          onClick={() => handleResolveFeedback(fb.id)}
                        >
                          <Check size={14} />
                          <span>Tamamlandı</span>
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        </section>
      )}

      <div className="dashboard-grid">
        {/* Priority Action & Approval List for Specialist */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Çevre Uzmanı Kontrol & Onay Listesi</h2>
              <p>Onayınızı veya güncellemenizi bekleyen faaliyet kayıtları</p>
            </div>
            <Link to="/activities" className="panel-link">
              <span>Tüm Kayıtlar</span>
              <ArrowRight size={14} />
            </Link>
          </div>

          <div className="specialist-task-list">
            {actionRequiredList.map((act) => {
              const isFailedOrRev =
                act.status === 'FAILED' || act.status === 'REVISION_REQUESTED'
              return (
                <article
                  key={act.id}
                  className={`specialist-task-card ${
                    isFailedOrRev ? 'task-urgent' : 'task-pending'
                  }`}
                >
                  <div className="task-icon-wrap">
                    {isFailedOrRev ? (
                      <AlertTriangle size={18} />
                    ) : (
                      <Clock size={18} />
                    )}
                  </div>

                  <div className="task-body">
                    <div className="task-title-row">
                      <strong>
                        {act.facility} · {act.period} ({act.consumption})
                      </strong>
                      <span
                        className={`dash-status-pill dash-status-${act.status
                          .toLowerCase()
                          .replace(/_/g, '-')}`}
                      >
                        {statusLabels[act.status]}
                      </span>
                    </div>
                    <p>
                      {act.status === 'FAILED'
                        ? act.errorMessage ??
                          'Hesaplama sırasında emisyon faktörü hatası oluştu.'
                        : act.status === 'REVISION_REQUESTED'
                          ? `Yönetici Notu: ${act.revisionReason ?? 'Kontrol talep edildi.'}`
                          : `Hesaplanan: ${act.calculation?.totalKgCo2e ?? '—'} · Uzman onayınızı bekliyor.`}
                    </p>
                  </div>

                  <div className="task-btn-group">
                    {user.tenantRole === 'CARBON_SPECIALIST' &&
                      act.calculation && (
                        <button
                          type="button"
                          className="dash-approve-btn"
                          onClick={() => handleQuickApprove(act)}
                        >
                          <CheckCircle2 size={14} />
                          <span>Onayla</span>
                        </button>
                      )}
                    <Link
                      to={`/activities/${act.id}`}
                      className={`task-action-link ${
                        isFailedOrRev ? 'urgent' : ''
                      }`}
                    >
                      {isFailedOrRev
                        ? 'Güncelle / Çöz'
                        : user.tenantRole === 'DATA_ENTRY'
                          ? 'Kanıt & Matrisi Gör'
                          : 'Detay'}
                    </Link>
                  </div>
                </article>
              )
            })}

            {actionRequiredList.length === 0 && (
              <div className="all-clear-box">
                <CheckCircle2 size={22} />
                <div>
                  <strong>Tüm kayıtlar kontrol edildi ve onaylandı!</strong>
                  <p>
                    Onay bekleyen veya hatalı faaliyet kaydı bulunmuyor. Yeni
                    dönem tüketim verisi ekleyebilir veya rapor
                    oluşturabilirsiniz.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Facility Summary for Specialist (kgCO2e) */}
        <section className="panel">
          <div className="panel-heading">
            <div>
              <h2>Tesis Bazlı Tüketim ve Emisyon Özeti (kgCO₂e)</h2>
              <p>Girilen doğalgaz verilerinin tesislere göre dağılımı</p>
            </div>
          </div>

          <div className="facility-breakdown-list">
            {metrics.facilityBreakdown.map((item) => {
              const maxM3 = Math.max(
                ...metrics.facilityBreakdown.map((f) => f.m3),
                1,
              )
              const widthPercent = Math.max(
                Math.round((item.m3 / maxM3) * 100),
                8,
              )

              return (
                <Link
                  key={item.id || item.name}
                  to={`/reports?facilityId=${encodeURIComponent(item.id)}&facilityName=${encodeURIComponent(item.name)}`}
                  className="facility-breakdown-item facility-breakdown-link"
                  title={`${item.name} kapsamındaki raporları görüntüle`}
                >
                  <div className="facility-breakdown-top">
                    <div className="facility-name-group">
                      <span className="facility-icon-box">
                        <Building2 size={16} />
                      </span>
                      <div>
                        <strong>{item.name}</strong>
                        <small>{item.count} faaliyet kaydı</small>
                      </div>
                    </div>

                    <div className="facility-emission-number">
                      <div>
                        <strong>{item.m3.toLocaleString('tr-TR')} m³</strong>
                        <small>
                          {item.kgCo2e.toLocaleString('tr-TR')} kgCO₂e
                        </small>
                      </div>
                      <ChevronRight
                        size={15}
                        className="facility-link-arrow"
                      />
                    </div>
                  </div>

                  <div className="facility-bar-track">
                    <span style={{ width: `${widthPercent}%` }} />
                  </div>
                </Link>
              )
            })}
          </div>
        </section>
      </div>
    </>
  )
}

export default function DashboardPage() {
  const user = getUser()
  const [activities, setActivities] = useState<Activity[]>(getActivities)

  return (
    <section className="dashboard-page">
      {user.tenantRole === 'COMPANY_ADMIN' ? (
        <AdminDashboard user={user} activities={activities} />
      ) : (
        <SpecialistDashboard
          user={user}
          activities={activities}
          onActivitiesChange={() => setActivities(getActivities())}
        />
      )}
    </section>
  )
}
