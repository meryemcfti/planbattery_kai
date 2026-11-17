import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  AlertTriangle,
  Building2,
  Calendar,
  CheckCircle2,
  Clock,
  Eye,
  FileCheck2,
  FileText,
  Flame,
  Plus,
  RotateCcw,
  Trash2,
  XCircle,
} from 'lucide-react'
import {
  addManagerFeedback,
  deleteActivityById,
  getActivities,
  getCurrentUser,
  updateActivity,
} from '../services/activityStore'
import type { Activity, ActivityStatus } from '../services/activityStore'
import './ActivitiesPage.css'

const statusLabels: Record<ActivityStatus, string> = {
  PENDING_REVIEW: 'Uzman Onayı Bekliyor',
  VALIDATED: 'Onaylandı (Uzman)',
  REVISION_REQUESTED: 'Yönetici Kontrol Talebi',
  FAILED: 'Hesaplanamadı',
}

function getStatusClass(status: ActivityStatus) {
  return status.toLowerCase().replace(/_/g, '-')
}

function formatPeriodDisplay(period: string) {
  if (period.includes('–') || period.includes('-')) {
    const parts = period.split(/[–-]/).map((s) => s.trim())
    if (parts.length === 2 && parts[0].length === 10 && parts[1].length === 10) {
      return `${parts[0].slice(0, 5)} – ${parts[1]}`
    }
  }
  return period
}

function ActivitiesPage() {
  const currentUser = getCurrentUser()
  const isAdmin = currentUser.tenantRole === 'COMPANY_ADMIN'
  const isSpecialist = currentUser.tenantRole === 'CARBON_SPECIALIST'
  const isDataEntry = currentUser.tenantRole === 'DATA_ENTRY'
  const canCreateActivity =
    currentUser.tenantRole !== 'COMPANY_ADMIN' &&
    currentUser.tenantRole !== 'VIEWER'

  const [activities, setActivities] = useState<Activity[]>(getActivities)
  const [assessmentFilter, setAssessmentFilter] = useState('')
  const [facilityFilter, setFacilityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const visibleActivities = useMemo(() => {
    if (isAdmin || isSpecialist || isDataEntry) {
      return activities
    }

    return activities.filter(
      (activity) => activity.enteredBy === currentUser.name,
    )
  }, [activities, currentUser.name, isAdmin, isSpecialist, isDataEntry])

  const filteredActivities = useMemo(() => {
    return visibleActivities.filter((activity) => {
      const assessmentMatches =
        assessmentFilter === '' || activity.assessmentId === assessmentFilter
      const facilityMatches =
        facilityFilter === '' || activity.facility === facilityFilter
      const statusMatches =
        statusFilter === '' || activity.status === statusFilter

      return assessmentMatches && facilityMatches && statusMatches
    })
  }, [visibleActivities, assessmentFilter, facilityFilter, statusFilter])

  const assessments = Array.from(
    new Map(
      visibleActivities.map((activity) => [
        activity.assessmentId,
        activity.assessmentName,
      ]),
    ),
  )

  const facilities = Array.from(
    new Set(visibleActivities.map((activity) => activity.facility)),
  )

  const validatedCount = visibleActivities.filter(
    (activity) => activity.status === 'VALIDATED',
  ).length

  const waitingCount = visibleActivities.filter(
    (activity) =>
      activity.status === 'PENDING_REVIEW' ||
      activity.status === 'REVISION_REQUESTED',
  ).length

  const failedCount = visibleActivities.filter(
    (activity) => activity.status === 'FAILED',
  ).length

  const totalValidatedEmission = useMemo(() => {
    const totalKg = visibleActivities
      .filter((a) => a.status === 'VALIDATED' && a.calculation)
      .reduce((sum, a) => sum + a.consumptionValue * 1.88675, 0)

    return Math.round(totalKg).toLocaleString('tr-TR')
  }, [visibleActivities])

  const hasActiveFilters =
    assessmentFilter !== '' || facilityFilter !== '' || statusFilter !== ''

  function clearFilters() {
    setAssessmentFilter('')
    setFacilityFilter('')
    setStatusFilter('')
  }

  function removeActivity(id: number) {
    const shouldDelete = window.confirm(
      'Bu doğalgaz faaliyet kaydını silmek istediğinizden emin misiniz?',
    )

    if (shouldDelete) {
      deleteActivityById(id)
      setActivities(getActivities())
    }
  }

  function quickValidate(activity: Activity) {
    if (!isSpecialist || !activity.calculation) return
    const specialistName = currentUser.name ?? 'Çevre / Karbon Uzmanı'
    updateActivity(activity.id, {
      status: 'VALIDATED',
      revisionReason: '',
      validatedBy: `${specialistName} (Çevre / Karbon Uzmanı)`,
      validatedAt: new Date().toLocaleString('tr-TR'),
    })
    addManagerFeedback({
      targetType: 'ACTIVITY',
      targetId: String(activity.id),
      targetTitle: `Uzman Onayı Tamamlandı: ${activity.facility} · ${activity.period} (${activity.consumption})`,
      message: `#${activity.id} numaralı doğalgaz faaliyet kaydı (${activity.calculation.totalKgCo2e}) Çevre / Karbon Uzmanı tarafından onaylandı.`,
      createdBy: specialistName,
      senderRole: 'Çevre / Karbon Uzmanı',
      senderTenantRole: 'CARBON_SPECIALIST',
    })
    setActivities(getActivities())
  }

  return (
    <section className="activities-page">
      {/* Top Page Header */}
      <header className="activities-header">
        <div className="activities-header-left">
          <div className="activities-role-pill">
            <Flame size={14} />
            <span>
              {isAdmin
                ? 'Şirket Yöneticisi · Rapor İnceleme ve Geri Bildirim Görünümü'
                : isDataEntry
                  ? 'Veri ve Operasyon Sorumlusu · Fatura, SAP Görüntüsü ve Karbon Matrisi Girişi'
                  : 'Çevre / Karbon Uzmanı · Veri Kontrol, Hesaplama ve Onay Merkezi'}
            </span>
          </div>
          <h1>Doğalgaz Faaliyet Kayıtları</h1>
          <p className="page-description">
            {currentUser.tenantName ?? 'Kurumsal'} tesislerinin Kapsam 1 sabit
            yanma tüketim verileri ve kgCO₂e emisyon hesaplamaları.
          </p>
        </div>

        <div className="activities-header-actions">
          {canCreateActivity ? (
            <Link className="new-activity-button" to="/activities/new">
              <Plus size={18} />
              <span>Yeni Doğalgaz Kaydı</span>
            </Link>
          ) : (
            <Link className="new-activity-button" to="/reports">
              <FileCheck2 size={18} />
              <span>Raporları İncele / Çıktı Al</span>
            </Link>
          )}
        </div>
      </header>

      {/* 4 Interactive KPI Summary Cards */}
      <div className="summary-grid">
        <button
          type="button"
          className={`summary-card ${statusFilter === '' ? 'active-card' : ''}`}
          onClick={() => setStatusFilter('')}
        >
          <div className="summary-card-top">
            <span>Toplam Kayıt</span>
            <div className="summary-icon summary-icon-slate">
              <FileText size={18} />
            </div>
          </div>
          <strong>{visibleActivities.length}</strong>
          <small>{facilities.length} aktif üretim tesisi</small>
        </button>

        <button
          type="button"
          className={`summary-card ${statusFilter === 'VALIDATED' ? 'active-card' : ''
            }`}
          onClick={() =>
            setStatusFilter(statusFilter === 'VALIDATED' ? '' : 'VALIDATED')
          }
        >
          <div className="summary-card-top">
            <span>Uzman Onaylı Kayıt</span>
            <div className="summary-icon summary-icon-emerald">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <strong>{validatedCount}</strong>
          <small className="text-emerald">
            {totalValidatedEmission} kgCO₂e onaylı emisyon
          </small>
        </button>

        <button
          type="button"
          className={`summary-card ${statusFilter === 'PENDING_REVIEW' ? 'active-card' : ''
            }`}
          onClick={() =>
            setStatusFilter(
              statusFilter === 'PENDING_REVIEW' ? '' : 'PENDING_REVIEW',
            )
          }
        >
          <div className="summary-card-top">
            <span>
              {isSpecialist ? 'Onayınızı Bekleyen' : 'Uzman Kontrolünde'}
            </span>
            <div className="summary-icon summary-icon-amber">
              <Clock size={18} />
            </div>
          </div>
          <strong>{waitingCount}</strong>
          <small className="text-amber">
            {waitingCount > 0
              ? 'Çevre uzmanı incelemesinde'
              : 'Bekleyen kayıt yok'}
          </small>
        </button>

        <button
          type="button"
          className={`summary-card ${statusFilter === 'FAILED' ? 'active-card' : ''
            }`}
          onClick={() =>
            setStatusFilter(statusFilter === 'FAILED' ? '' : 'FAILED')
          }
        >
          <div className="summary-card-top">
            <span>Hesaplanamayan / Hatalı</span>
            <div className="summary-icon summary-icon-red">
              <XCircle size={18} />
            </div>
          </div>
          <strong>{failedCount}</strong>
          <small className="text-red">
            {failedCount > 0 ? 'Müdahale gerekiyor' : 'Sorunlu kayıt yok'}
          </small>
        </button>
      </div>

      {/* Role-Specific Status Alert Banner */}
      {waitingCount + failedCount > 0 && (
        <div className="completion-warning">
          <div className="warning-content">
            <AlertTriangle size={18} className="warning-banner-icon" />
            <div>
              <strong>Değerlendirme dönemi henüz tamamlanmadı</strong>
              <p>
                {isAdmin
                  ? `Nihai kurumsal rapora yalnızca Çevre Uzmanı (Ayşe Yılmaz) tarafından onaylanan kayıtlar dahil edilir. Kayıt detayına girerek çevre uzmanına kontrol veya güncelleme talebi (feedback) iletebilirsiniz.`
                  : `Çevre Uzmanı olarak bekleyen (${waitingCount}) ve hatalı (${failedCount}) kayıtları kontrol edip onayladığınızda nihai rapora dahil edilir.`}
              </p>
            </div>
          </div>

          {isSpecialist &&
            waitingCount > 0 &&
            statusFilter !== 'PENDING_REVIEW' && (
              <button
                type="button"
                className="warning-quick-btn"
                onClick={() => setStatusFilter('PENDING_REVIEW')}
              >
                Onay Bekleyenleri Göster ({waitingCount})
              </button>
            )}
        </div>
      )}

      {/* Main Table Card */}
      <div className="activity-table-card">
        {/* Clean Filter Bar */}
        <div className="activity-toolbar">
          <div className="status-pills-bar" role="tablist">
            <button
              type="button"
              className={`filter-pill ${statusFilter === '' ? 'active' : ''}`}
              onClick={() => setStatusFilter('')}
            >
              Tümü ({visibleActivities.length})
            </button>
            <button
              type="button"
              className={`filter-pill ${statusFilter === 'VALIDATED' ? 'active' : ''
                }`}
              onClick={() => setStatusFilter('VALIDATED')}
            >
              Doğrulandı ({validatedCount})
            </button>
            <button
              type="button"
              className={`filter-pill ${statusFilter === 'PENDING_REVIEW' ? 'active' : ''
                }`}
              onClick={() => setStatusFilter('PENDING_REVIEW')}
            >
              Bekleyen ({waitingCount})
            </button>
            {failedCount > 0 && (
              <button
                type="button"
                className={`filter-pill filter-pill-danger ${statusFilter === 'FAILED' ? 'active' : ''
                  }`}
                onClick={() => setStatusFilter('FAILED')}
              >
                Hatalı ({failedCount})
              </button>
            )}
          </div>

          <div className="activity-filters">
            <div className="filter-select-group">
              <select
                aria-label="Tesis filtresi"
                value={facilityFilter}
                onChange={(event) => setFacilityFilter(event.target.value)}
              >
                <option value="">Tüm Tesisler</option>
                {facilities.map((facility) => (
                  <option key={facility} value={facility}>
                    {facility}
                  </option>
                ))}
              </select>

              <select
                aria-label="Değerlendirme filtresi"
                value={assessmentFilter}
                onChange={(event) => setAssessmentFilter(event.target.value)}
              >
                <option value="">Tüm Değerlendirmeler</option>
                {assessments.map(([id, name]) => (
                  <option key={id} value={id}>
                    {name}
                  </option>
                ))}
              </select>
            </div>

            {hasActiveFilters && (
              <button
                className="clear-filters"
                type="button"
                onClick={clearFilters}
              >
                <RotateCcw size={14} />
                <span>Sıfırla</span>
              </button>
            )}
          </div>
        </div>

        {/* Clean 6-Column Enterprise Table */}
        <div className="table-container">
          <table className="activities-table">
            <thead>
              <tr>
                <th>Tesis & Değerlendirme</th>
                <th>Tüketim Dönemi</th>
                <th>Veri Kaynağı & Referans</th>
                <th className="num-col">Tüketim Miktarı</th>
                <th className="num-col">Emisyon (kgCO₂e)</th>
                <th>Durum</th>
                <th className="action-col">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {filteredActivities.map((activity) => {
                const needsAttention =
                  activity.status === 'FAILED' ||
                  activity.status === 'REVISION_REQUESTED'
                const canDelete =
                  canCreateActivity &&
                  (activity.status === 'PENDING_REVIEW' ||
                    activity.status === 'REVISION_REQUESTED' ||
                    activity.status === 'FAILED')
                const canQuickApprove =
                  isSpecialist &&
                  (activity.status === 'PENDING_REVIEW' ||
                    activity.status === 'REVISION_REQUESTED') &&
                  Boolean(activity.calculation)

                return (
                  <tr
                    key={activity.id}
                    className={needsAttention ? 'row-attention' : ''}
                  >
                    {/* 1. Facility & Assessment */}
                    <td>
                      <div className="cell-facility">
                        <span className="facility-avatar">
                          <Building2 size={16} />
                        </span>
                        <div className="facility-text">
                          <strong>{activity.facility}</strong>
                          <small title={activity.assessmentName}>
                            {activity.assessmentName}
                          </small>
                        </div>
                      </div>
                    </td>

                    {/* 2. Period */}
                    <td>
                      <div className="cell-period">
                        <Calendar size={14} />
                        <span>{formatPeriodDisplay(activity.period)}</span>
                      </div>
                    </td>

                    {/* 3. Data Source & Reference */}
                    <td>
                      <div className="cell-source">
                        <span className="source-type-label">
                          {activity.sourceType}
                        </span>
                        <code
                          className="source-ref-code"
                          title={activity.sourceReference}
                        >
                          {activity.sourceReference || '—'}
                        </code>
                      </div>
                    </td>

                    {/* 4. Consumption */}
                    <td className="num-col">
                      <strong className="consumption-val">
                        {activity.consumption}
                      </strong>
                    </td>

                    {/* 5. Emission Result */}
                    <td className="num-col">
                      {activity.calculation ? (
                        <strong className="emission-val">
                          {activity.calculation.totalKgCo2e}
                        </strong>
                      ) : (
                        <span className="emission-empty">Hesaplanmadı</span>
                      )}
                    </td>

                    {/* 6. Status Badge */}
                    <td>
                      <span
                        className={`status-badge status-${getStatusClass(
                          activity.status,
                        )}`}
                      >
                        <span className="status-dot" />
                        {statusLabels[activity.status]}
                      </span>
                    </td>

                    {/* 7. Actions */}
                    <td className="action-col">
                      <div className="table-actions">
                        {canQuickApprove && (
                          <button
                            type="button"
                            className="quick-approve-btn"
                            onClick={() => quickValidate(activity)}
                            title="Kaydı hemen doğrula ve onayla"
                          >
                            <CheckCircle2 size={14} />
                            <span>Onayla</span>
                          </button>
                        )}

                        <Link
                          className={`view-action ${needsAttention ? 'view-action-warning' : ''
                            }`}
                          to={`/activities/${activity.id}`}
                        >
                          {needsAttention ? (
                            <>
                              <AlertTriangle size={14} />
                              <span>İncele</span>
                            </>
                          ) : (
                            <>
                              <Eye size={14} />
                              <span>Detay</span>
                            </>
                          )}
                        </Link>

                        {canDelete && (
                          <button
                            type="button"
                            className="icon-delete-btn"
                            onClick={() => removeActivity(activity.id)}
                            title="Kaydı Sil"
                            aria-label="Kaydı Sil"
                          >
                            <Trash2 size={15} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                )
              })}

              {filteredActivities.length === 0 && (
                <tr>
                  <td className="empty-table" colSpan={7}>
                    Seçilen filtrelere uygun doğalgaz faaliyet kaydı bulunamadı.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  )
}

export default ActivitiesPage
