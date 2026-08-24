import { useState } from 'react'
import { Link, useParams } from 'react-router-dom'
import './ActivityDetailPage.css'

type ActivityState =
  | 'CALCULATED'
  | 'PENDING'
  | 'VALIDATED'
  | 'REJECTED'
  | 'FAILED'

type CalculationResult = {
  co2eFromCo2: string
  co2eFromCh4: string
  co2eFromN2o: string
  totalKgCo2e: string
  totalTCo2e: string
  emissionFactorSet: string
  gwpSet: string
}

type ActivityDetail = {
  period: string
  facility: string
  consumption: string
  sourceType: string
  sourceReference: string
  supplierName: string
  enteredBy: string
  enteredAt: string
  status: ActivityState
  calculation?: CalculationResult
  errorMessage?: string
}

const activityDetails: Record<string, ActivityDetail> = {
  '1': {
    period: 'Ocak 2026',
    facility: 'Bucak',
    consumption: '12.000 m³',
    sourceType: 'Fatura',
    sourceReference: 'FAT-2026-001',
    supplierName: 'BOTAŞ',
    enteredBy: 'Ayşe Yılmaz',
    enteredAt: '03.02.2026 10:24',
    status: 'CALCULATED',
    calculation: {
      co2eFromCo2: '22.600 kgCO₂e',
      co2eFromCh4: '30 kgCO₂e',
      co2eFromN2o: '11 kgCO₂e',
      totalKgCo2e: '22.641 kgCO₂e',
      totalTCo2e: '22,641 tCO₂e',
      emissionFactorSet: 'GHG Protocol Cross-Sector Tools V2.0',
      gwpSet: 'IPCC AR5 — CH₄: 28, N₂O: 265',
    },
  },
  '2': {
    period: 'Şubat 2026',
    facility: 'Burdur Merkez',
    consumption: '8.000 m³',
    sourceType: 'Sayaç',
    sourceReference: 'SYC-004',
    supplierName: '—',
    enteredBy: 'Ayşe Yılmaz',
    enteredAt: '04.03.2026 14:12',
    status: 'PENDING',
  },
  '3': {
    period: 'Mart 2026',
    facility: 'Bucak',
    consumption: '7.400 m³',
    sourceType: 'Kurumsal Sistem',
    sourceReference: 'SAP-490001',
    supplierName: '—',
    enteredBy: 'Ayşe Yılmaz',
    enteredAt: '02.04.2026 09:17',
    status: 'VALIDATED',
  },
  '4': {
    period: 'Nisan 2026',
    facility: 'Burdur Merkez',
    consumption: '6.500 m³',
    sourceType: 'Fatura',
    sourceReference: 'FAT-2026-014',
    supplierName: 'BOTAŞ',
    enteredBy: 'Ayşe Yılmaz',
    enteredAt: '05.05.2026 11:42',
    status: 'FAILED',
    errorMessage:
      'Bu tüketim dönemi için geçerli bir emisyon faktörü bulunamadı.',
  },
}

const statusLabels: Record<ActivityState, string> = {
  CALCULATED: 'Hesaplandı',
  PENDING: 'Doğrulama Bekliyor',
  VALIDATED: 'Doğrulandı',
  REJECTED: 'Reddedildi',
  FAILED: 'Hesaplanamadı',
}

function ActivityDetailPage() {
  const { activityId } = useParams()
  const activity = activityDetails[activityId ?? '']

  const [status, setStatus] = useState<ActivityState>(
    activity?.status ?? 'PENDING',
  )

  if (!activity) {
    return (
      <section className="activity-detail-page">
        <div className="detail-card">
          <h1>Kayıt bulunamadı</h1>
          <Link className="secondary-button" to="/activities">
            Faaliyet listesine dön
          </Link>
        </div>
      </section>
    )
  }

  function validateActivity() {
    setStatus('VALIDATED')
    window.alert(
      'Doğalgaz kaydı doğrulandı. Hesaplama için hazır durumdadır.',
    )
  }

  function rejectActivity() {
    const reason = window.prompt('Reddetme gerekçesini yazınız:')

    if (reason?.trim()) {
      setStatus('REJECTED')
      window.alert('Kayıt reddedildi.')
    }
  }

  return (
    <section className="activity-detail-page">
      <div className="detail-header">
        <div>
          <p className="breadcrumb">
            Faaliyetler / Doğalgaz / Kayıt Detayı
          </p>

          <h1>Doğalgaz Kayıt Detayı</h1>

          <p className="page-description">
            Scope 1 · Sabit Yanma
          </p>
        </div>

        <span
          className={`detail-status status-${status.toLowerCase()}`}
        >
          {statusLabels[status]}
        </span>
      </div>

      <div className="detail-card">
        <h2>Faaliyet Bilgileri</h2>

        <dl className="detail-grid">
          <div>
            <dt>Değerlendirme</dt>
            <dd>2026 Kurumsal Karbon Değerlendirmesi</dd>
          </div>

          <div>
            <dt>Tesis</dt>
            <dd>{activity.facility}</dd>
          </div>

          <div>
            <dt>Tüketim Dönemi</dt>
            <dd>{activity.period}</dd>
          </div>

          <div>
            <dt>Tüketim Miktarı</dt>
            <dd>{activity.consumption}</dd>
          </div>

          <div>
            <dt>Birim</dt>
            <dd>m³</dd>
          </div>

          <div>
            <dt>Veri Kaynağı</dt>
            <dd>{activity.sourceType}</dd>
          </div>

          <div>
            <dt>Kaynak Referansı</dt>
            <dd>{activity.sourceReference}</dd>
          </div>

          <div>
            <dt>Tedarikçi</dt>
            <dd>{activity.supplierName}</dd>
          </div>

          <div>
            <dt>Kaydı Giren</dt>
            <dd>{activity.enteredBy}</dd>
          </div>

          <div>
            <dt>Kayıt Tarihi</dt>
            <dd>{activity.enteredAt}</dd>
          </div>
        </dl>
      </div>

      {status === 'FAILED' && (
        <div className="calculation-error">
          <strong>Hesaplama tamamlanamadı</strong>
          <p>{activity.errorMessage}</p>
          <p>
            Emisyon faktörü kataloğunu kontrol edin veya sistem
            yöneticisine başvurun.
          </p>
        </div>
      )}

      {status === 'VALIDATED' && !activity.calculation && (
        <div className="calculation-info">
          Kayıt doğrulandı. Emisyon hesaplamasının çalıştırılması
          bekleniyor.
        </div>
      )}

      {activity.calculation && (
        <>
          <div className="detail-card">
            <h2>Hesaplama Bilgileri</h2>

            <dl className="detail-grid">
              <div>
                <dt>Emisyon faktörü seti</dt>
                <dd>{activity.calculation.emissionFactorSet}</dd>
              </div>

              <div>
                <dt>GWP seti</dt>
                <dd>{activity.calculation.gwpSet}</dd>
              </div>

              <div>
                <dt>Çıktı birimi</dt>
                <dd>kgCO₂e ve tCO₂e</dd>
              </div>
            </dl>
          </div>

          <div className="detail-card">
            <h2>Sera Gazı Kırılımı</h2>

            <div className="gas-results">
              <article>
                <span>CO₂ katkısı</span>
                <strong>{activity.calculation.co2eFromCo2}</strong>
              </article>

              <article>
                <span>CH₄ katkısı</span>
                <strong>{activity.calculation.co2eFromCh4}</strong>
              </article>

              <article>
                <span>N₂O katkısı</span>
                <strong>{activity.calculation.co2eFromN2o}</strong>
              </article>
            </div>
          </div>

          <div className="detail-card result-card">
            <h2>Toplam Emisyon Sonucu</h2>

            <strong>{activity.calculation.totalTCo2e}</strong>
            <p>{activity.calculation.totalKgCo2e}</p>

            <small>
              Sonuç, kullanılan emisyon faktörü ve GWP değerleriyle
              birlikte hesaplama anında kaydedilir.
            </small>
          </div>
        </>
      )}

      <div className="detail-actions">
        <Link className="secondary-button" to="/activities">
          Listeye Dön
        </Link>

        {status === 'PENDING' && (
          <>
            <button
              className="reject-button"
              type="button"
              onClick={rejectActivity}
            >
              Reddet
            </button>

            <button
              className="primary-button"
              type="button"
              onClick={validateActivity}
            >
              Doğrula
            </button>
          </>
        )}
      </div>
    </section>
  )
}

export default ActivityDetailPage