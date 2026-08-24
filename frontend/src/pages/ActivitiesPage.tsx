import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import './ActivitiesPage.css'

type ActivityStatus = 'CALCULATED' | 'DRAFT' | 'VALIDATED' | 'FAILED'

type Activity = {
  id: number
  period: string
  facility: string
  consumption: string
  sourceType: string
  sourceReference: string
  status: ActivityStatus
  result: string | null
}

const initialActivities: Activity[] = [
  {
    id: 1,
    period: 'Ocak 2026',
    facility: 'Bucak',
    consumption: '12.000 m³',
    sourceType: 'Fatura',
    sourceReference: 'FAT-2026-001',
    status: 'CALCULATED',
    result: '22,641 tCO₂e',
  },
  {
    id: 2,
    period: 'Şubat 2026',
    facility: 'Burdur Merkez',
    consumption: '8.000 m³',
    sourceType: 'Sayaç',
    sourceReference: 'SYC-004',
    status: 'DRAFT',
    result: null,
  },
  {
    id: 3,
    period: 'Mart 2026',
    facility: 'Bucak',
    consumption: '7.400 m³',
    sourceType: 'Kurumsal Sistem',
    sourceReference: 'SAP-490001',
    status: 'VALIDATED',
    result: null,
  },
  {
    id: 4,
    period: 'Nisan 2026',
    facility: 'Burdur Merkez',
    consumption: '6.500 m³',
    sourceType: 'Fatura',
    sourceReference: 'FAT-2026-014',
    status: 'FAILED',
    result: null,
  },
]

const statusLabels: Record<ActivityStatus, string> = {
  CALCULATED: 'Hesaplandı',
  DRAFT: 'Doğrulama Bekliyor',
  VALIDATED: 'Doğrulandı',
  FAILED: 'Hesaplanamadı',
}

function ActivitiesPage() {
  const [activities, setActivities] =
    useState<Activity[]>(initialActivities)

  const [facilityFilter, setFacilityFilter] = useState('')
  const [statusFilter, setStatusFilter] = useState('')

  const filteredActivities = useMemo(() => {
    return activities.filter((activity) => {
      const facilityMatches =
        facilityFilter === '' || activity.facility === facilityFilter

      const statusMatches =
        statusFilter === '' || activity.status === statusFilter

      return facilityMatches && statusMatches
    })
  }, [activities, facilityFilter, statusFilter])

  const calculatedCount = activities.filter(
    (activity) => activity.status === 'CALCULATED',
  ).length

  const waitingCount = activities.filter(
    (activity) =>
      activity.status === 'DRAFT' ||
      activity.status === 'VALIDATED',
  ).length

  const failedCount = activities.filter(
    (activity) => activity.status === 'FAILED',
  ).length

  function clearFilters() {
    setFacilityFilter('')
    setStatusFilter('')
  }

  function deleteActivity(id: number) {
    const shouldDelete = window.confirm(
      'Bu doğalgaz kaydını silmek istediğinizden emin misiniz?',
    )

    if (shouldDelete) {
      setActivities((currentActivities) =>
        currentActivities.filter((activity) => activity.id !== id),
      )
    }
  }

  return (
    <section className="activities-page">
      <div className="activities-header">
        <div>
          <p className="breadcrumb">Faaliyetler / Doğalgaz</p>
          <h1>Doğalgaz Faaliyetleri</h1>

          <p className="page-description">
            2026 Kurumsal Karbon Değerlendirmesi · Scope 1 · Sabit Yanma
          </p>
        </div>

        <Link className="new-activity-button" to="/activities/new">
          Yeni Doğalgaz Kaydı
        </Link>
      </div>

      <div className="summary-grid">
        <article className="summary-card">
          <span>Toplam Kayıt</span>
          <strong>{activities.length}</strong>
        </article>

        <article className="summary-card">
          <span>Hesaplanan</span>
          <strong>{calculatedCount}</strong>
        </article>

        <article className="summary-card">
          <span>Bekleyen</span>
          <strong>{waitingCount}</strong>
        </article>

        <article className="summary-card">
          <span>Hesaplanamayan</span>
          <strong>{failedCount}</strong>
        </article>
      </div>

      <div className="completion-warning">
        Bu değerlendirme henüz tamamlanmamıştır. Hesaplanmamış kayıtlar
        toplam emisyon sonucuna dahil edilmemiştir.
      </div>

      <div className="activity-table-card">
        <div className="activity-filters">
          <label>
            <span>Tesis</span>

            <select
              value={facilityFilter}
              onChange={(event) =>
                setFacilityFilter(event.target.value)
              }
            >
              <option value="">Tüm Tesisler</option>
              <option value="Bucak">Bucak</option>
              <option value="Burdur Merkez">Burdur Merkez</option>
            </select>
          </label>

          <label>
            <span>Durum</span>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value)
              }
            >
              <option value="">Tüm Durumlar</option>
              <option value="CALCULATED">Hesaplandı</option>
              <option value="DRAFT">Doğrulama Bekliyor</option>
              <option value="VALIDATED">Doğrulandı</option>
              <option value="FAILED">Hesaplanamadı</option>
            </select>
          </label>

          <button
            className="clear-filters"
            type="button"
            onClick={clearFilters}
          >
            Filtreleri Temizle
          </button>
        </div>

        <div className="table-container">
          <table>
            <thead>
              <tr>
                <th>Tüketim Dönemi</th>
                <th>Tesis</th>
                <th>Tüketim</th>
                <th>Veri Kaynağı</th>
                <th>Kaynak Referansı</th>
                <th>Durum</th>
                <th>Emisyon Sonucu</th>
                <th>İşlemler</th>
              </tr>
            </thead>

            <tbody>
              {filteredActivities.map((activity) => (
                <tr key={activity.id}>
                  <td>{activity.period}</td>
                  <td>{activity.facility}</td>
                  <td>{activity.consumption}</td>
                  <td>{activity.sourceType}</td>
                  <td>{activity.sourceReference}</td>

                  <td>
                    <span
                      className={`status-badge status-${activity.status.toLowerCase()}`}
                    >
                      {statusLabels[activity.status]}
                    </span>
                  </td>

                  <td>{activity.result ?? '—'}</td>

                  <td>
                    <div className="table-actions">
                      <Link
                        className="table-action"
                        to={`/activities/${activity.id}`}
                      >
                        {activity.status === 'FAILED'
                          ? 'Sorunu Gör'
                          : 'Görüntüle'}
                      </Link>

                      {activity.status === 'DRAFT' && (
                        <button
                          className="table-action delete-action"
                          type="button"
                          onClick={() => deleteActivity(activity.id)}
                        >
                          Sil
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}

              {filteredActivities.length === 0 && (
                <tr>
                  <td className="empty-table" colSpan={8}>
                    Seçilen filtrelere uygun kayıt bulunamadı.
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