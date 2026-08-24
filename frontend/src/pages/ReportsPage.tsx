import { Link, useLocation } from 'react-router-dom'
import './ReportsPage.css'

type ReportScope = 'COMPANY' | 'FACILITY'
type PeriodType = 'ASSESSMENT' | 'CUSTOM'
type RecordScope = 'CALCULATED' | 'ALL'
type ReportDetail = 'SUMMARY' | 'DETAILED'

type ReportOptions = {
  assessmentId: string
  reportScope: ReportScope
  facilityId: string
  periodType: PeriodType
  periodStart: string
  periodEnd: string
  recordScope: RecordScope
  reportDetail: ReportDetail
}

type ReportActivityStatus =
  | 'CALCULATED'
  | 'DRAFT'
  | 'VALIDATED'
  | 'FAILED'

type ReportActivity = {
  id: number
  period: string
  periodDate: string
  facilityId: string
  facility: string
  consumption: string
  source: string
  status: ReportActivityStatus
  result: string
  resultKg: number
  co2Kg: number
  ch4Kg: number
  n2oKg: number
}

const defaultOptions: ReportOptions = {
  assessmentId: 'assessment-2026',
  reportScope: 'COMPANY',
  facilityId: '',
  periodType: 'ASSESSMENT',
  periodStart: '2026-01-01',
  periodEnd: '2026-12-31',
  recordScope: 'ALL',
  reportDetail: 'DETAILED',
}

const reportActivities: ReportActivity[] = [
  {
    id: 1,
    period: 'Ocak 2026',
    periodDate: '2026-01-01',
    facilityId: 'bucak',
    facility: 'Bucak',
    consumption: '12.000 m³',
    source: 'Fatura',
    status: 'CALCULATED',
    result: '22,641 tCO₂e',
    resultKg: 22641,
    co2Kg: 22600,
    ch4Kg: 30,
    n2oKg: 11,
  },
  {
    id: 2,
    period: 'Şubat 2026',
    periodDate: '2026-02-01',
    facilityId: 'burdur-merkez',
    facility: 'Burdur Merkez',
    consumption: '8.000 m³',
    source: 'Sayaç',
    status: 'DRAFT',
    result: 'Dahil edilmedi',
    resultKg: 0,
    co2Kg: 0,
    ch4Kg: 0,
    n2oKg: 0,
  },
  {
    id: 3,
    period: 'Mart 2026',
    periodDate: '2026-03-01',
    facilityId: 'bucak',
    facility: 'Bucak',
    consumption: '7.400 m³',
    source: 'Kurumsal Sistem',
    status: 'VALIDATED',
    result: 'Hesaplama bekliyor',
    resultKg: 0,
    co2Kg: 0,
    ch4Kg: 0,
    n2oKg: 0,
  },
  {
    id: 4,
    period: 'Nisan 2026',
    periodDate: '2026-04-01',
    facilityId: 'burdur-merkez',
    facility: 'Burdur Merkez',
    consumption: '6.500 m³',
    source: 'Fatura',
    status: 'FAILED',
    result: 'Dahil edilmedi',
    resultKg: 0,
    co2Kg: 0,
    ch4Kg: 0,
    n2oKg: 0,
  },
]

const statusLabels: Record<ReportActivityStatus, string> = {
  CALCULATED: 'Hesaplandı',
  DRAFT: 'Doğrulama Bekliyor',
  VALIDATED: 'Doğrulandı',
  FAILED: 'Hesaplanamadı',
}

const facilityLabels: Record<string, string> = {
  bucak: 'Bucak',
  'burdur-merkez': 'Burdur Merkez',
}

function formatDate(date: string) {
  if (!date) {
    return '—'
  }

  const [year, month, day] = date.split('-')
  return `${day}.${month}.${year}`
}

function formatKilograms(value: number) {
  return new Intl.NumberFormat('tr-TR', {
    maximumFractionDigits: 0,
  }).format(value)
}

function formatTonnes(valueInKilograms: number) {
  return new Intl.NumberFormat('tr-TR', {
    minimumFractionDigits: 3,
    maximumFractionDigits: 3,
  }).format(valueInKilograms / 1000)
}

function ReportsPage() {
  const location = useLocation()

  const options =
    (location.state as ReportOptions | null) ?? defaultOptions

  /*
   * Önce seçilen tesis ve dönem birlikte uygulanır.
   * Şirket geneli seçilirse bütün tesisler kapsanır.
   * Belirli tesis seçilirse yalnızca o tesisin kayıtları alınır.
   */
  const scopedActivities = reportActivities.filter((activity) => {
    const facilityMatches =
      options.reportScope === 'COMPANY' ||
      activity.facilityId === options.facilityId

    const periodMatches =
      options.periodType === 'ASSESSMENT' ||
      (
        activity.periodDate >= options.periodStart &&
        activity.periodDate <= options.periodEnd
      )

    return facilityMatches && periodMatches
  })

  /*
   * Kayıt kapsamı, tesis ve dönem filtresinden sonra uygulanır.
   * ALL seçeneği bütün şirketi değil, seçilen kapsamdaki
   * bütün kayıtları ifade eder.
   */
  const displayedActivities = scopedActivities.filter(
    (activity) => {
      if (options.recordScope === 'ALL') {
        return true
      }

      return activity.status === 'CALCULATED'
    },
  )

  /*
   * Emisyon toplamına yalnızca hesaplanmış kayıtlar girer.
   * Tesis ve dönem seçimi burada da korunur.
   */
  const calculatedActivities = scopedActivities.filter(
    (activity) => activity.status === 'CALCULATED',
  )

  const calculatedCount = calculatedActivities.length

  const waitingCount = scopedActivities.filter(
    (activity) =>
      activity.status === 'DRAFT' ||
      activity.status === 'VALIDATED',
  ).length

  const failedCount = scopedActivities.filter(
    (activity) => activity.status === 'FAILED',
  ).length

  const totalKg = calculatedActivities.reduce(
    (total, activity) => total + activity.resultKg,
    0,
  )

  const totalCo2Kg = calculatedActivities.reduce(
    (total, activity) => total + activity.co2Kg,
    0,
  )

  const totalCh4Kg = calculatedActivities.reduce(
    (total, activity) => total + activity.ch4Kg,
    0,
  )

  const totalN2oKg = calculatedActivities.reduce(
    (total, activity) => total + activity.n2oKg,
    0,
  )

  const includedFacilities = Array.from(
    new Set(
      scopedActivities.map(
        (activity) => activity.facility,
      ),
    ),
  )

  const reportFacilityLabel =
    options.reportScope === 'FACILITY'
      ? facilityLabels[options.facilityId] ??
        'Tesis seçilmedi'
      : includedFacilities.length > 0
        ? includedFacilities.join(', ')
        : 'Kayıt bulunamadı'

  const reportScopeLabel =
    options.reportScope === 'FACILITY'
      ? reportFacilityLabel
      : 'Şirket geneli'

  const reportPeriod =
    options.periodType === 'CUSTOM'
      ? `${formatDate(options.periodStart)} – ${formatDate(
          options.periodEnd,
        )}`
      : '01.01.2026 – 31.12.2026'

  const isDetailedReport =
    options.reportDetail === 'DETAILED'

  const hasIncompleteActivities =
    waitingCount > 0 || failedCount > 0

  function createPdf() {
    window.print()
  }

  return (
    <section className="reports-page">
      <div className="report-screen-header">
        <div>
          <p className="breadcrumb">
            Raporlar / Ön İzleme
          </p>

          <h1>Karbon Ayak İzi Raporu</h1>

          <p className="page-description">
            {reportScopeLabel} · {reportPeriod}
          </p>
        </div>

        <div className="report-screen-actions">
          <Link
            className="report-edit-button"
            to="/reports"
          >
            Seçimleri Değiştir
          </Link>

          <button
            className="pdf-button"
            type="button"
            onClick={createPdf}
          >
            PDF Oluştur
          </button>
        </div>
      </div>

      <article className="report-document">
        <header className="report-cover">
          <div>
            <span className="report-logo">
              PlanBattery KAI
            </span>

            <h2>Kurumsal Karbon Ayak İzi Raporu</h2>

            <p>Scope 1 · Doğalgaz · Sabit Yanma</p>
          </div>

          <dl className="report-metadata">
            <div>
              <dt>Şirket</dt>
              <dd>E&amp;M Akü</dd>
            </div>

            <div>
              <dt>Rapor kapsamı</dt>
              <dd>{reportScopeLabel}</dd>
            </div>

            <div>
              <dt>Değerlendirme</dt>
              <dd>
                2026 Kurumsal Karbon Değerlendirmesi
              </dd>
            </div>

            <div>
              <dt>Rapor dönemi</dt>
              <dd>{reportPeriod}</dd>
            </div>

            <div>
              <dt>Rapor türü</dt>
              <dd>
                {isDetailedReport
                  ? 'Ayrıntılı rapor'
                  : 'Özet rapor'}
              </dd>
            </div>

            <div>
              <dt>Rapor sürümü</dt>
              <dd>Ön İzleme · v0.1</dd>
            </div>

            <div>
              <dt>Oluşturulma tarihi</dt>
              <dd>24.08.2026</dd>
            </div>
          </dl>
        </header>

        {hasIncompleteActivities && (
          <div className="report-warning">
            Bu değerlendirme henüz tamamlanmamıştır.
            Yalnızca hesaplanmış kayıtlar toplam emisyon
            sonucuna dahil edilmiştir.
          </div>
        )}

        <section className="report-section">
          <h3>
            1. Organizasyon ve raporlama sınırı
          </h3>

          <p>
            Bu rapor E&amp;M Akü şirketinin seçilen rapor
            dönemindeki doğalgaz tüketiminden kaynaklanan
            doğrudan sera gazı emisyonlarını kapsamaktadır.
          </p>

          <dl className="report-information-grid">
            <div>
              <dt>Rapor kapsamı</dt>
              <dd>{reportScopeLabel}</dd>
            </div>

            <div>
              <dt>Kapsanan tesisler</dt>
              <dd>{reportFacilityLabel}</dd>
            </div>

            <div>
              <dt>Emisyon kapsamı</dt>
              <dd>Scope 1</dd>
            </div>

            <div>
              <dt>Faaliyet kategorisi</dt>
              <dd>Sabit yanma</dd>
            </div>

            <div>
              <dt>Faaliyet verisi birimi</dt>
              <dd>m³ doğalgaz</dd>
            </div>

            <div>
              <dt>Kayıt kapsamı</dt>
              <dd>
                {options.recordScope === 'CALCULATED'
                  ? 'Seçilen kapsamdaki hesaplanan kayıtlar'
                  : 'Seçilen kapsamdaki tüm kayıtlar'}
              </dd>
            </div>
          </dl>
        </section>

        {isDetailedReport && (
          <section className="report-section">
            <h3>2. Hesaplama metodolojisi</h3>

            <p>
              Doğalgaz tüketimi; CO₂, CH₄ ve N₂O emisyon
              faktörleriyle ayrı ayrı değerlendirilmiştir.
              CH₄ ve N₂O sonuçları seçilen GWP değerleri
              kullanılarak CO₂ eşdeğerine dönüştürülmüştür.
            </p>

            <div className="methodology-table-wrapper">
              <table className="methodology-table">
                <tbody>
                  <tr>
                    <th>Emisyon faktörü seti</th>
                    <td>
                      GHG Protocol Cross-Sector Tools V2.0
                    </td>
                  </tr>

                  <tr>
                    <th>GWP seti</th>
                    <td>IPCC AR5</td>
                  </tr>

                  <tr>
                    <th>CH₄ GWP</th>
                    <td>28</td>
                  </tr>

                  <tr>
                    <th>N₂O GWP</th>
                    <td>265</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        <section className="report-section">
          <h3>
            {isDetailedReport ? '3.' : '2.'}{' '}
            Veri kalitesi ve tamamlanma durumu
          </h3>

          <div className="report-status-summary">
            <strong>
              Toplam {scopedActivities.length} kayıt:
            </strong>

            <span>{calculatedCount} hesaplandı</span>
            <span>{waitingCount} işlem bekliyor</span>
            <span>{failedCount} hesaplanamadı</span>
          </div>

          <p className="report-status-note">
            Toplam emisyon sonucu yalnızca seçilen kapsamdaki
            hesaplanmış kayıtlardan oluşturulmuştur.
          </p>
        </section>

        {isDetailedReport && (
          <section className="report-section">
            <h3>4. Faaliyet kayıtları</h3>

            {displayedActivities.length > 0 ? (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Dönem</th>
                    <th>Tesis</th>
                    <th>Tüketim</th>
                    <th>Veri kaynağı</th>
                    <th>Durum</th>
                    <th>Sonuç</th>
                  </tr>
                </thead>

                <tbody>
                  {displayedActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td>{activity.period}</td>
                      <td>{activity.facility}</td>
                      <td>{activity.consumption}</td>
                      <td>{activity.source}</td>
                      <td>
                        {statusLabels[activity.status]}
                      </td>
                      <td>{activity.result}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>
                Seçilen kapsam ve kayıt ölçütlerine uygun
                faaliyet kaydı bulunamadı.
              </p>
            )}
          </section>
        )}

        <section className="report-section">
          <h3>
            {isDetailedReport ? '5.' : '3.'}{' '}
            Emisyon sonucu
          </h3>

          <div className="report-gas-grid">
            <article>
              <span>CO₂ katkısı</span>

              <strong>
                {formatKilograms(totalCo2Kg)} kgCO₂e
              </strong>
            </article>

            <article>
              <span>CH₄ katkısı</span>

              <strong>
                {formatKilograms(totalCh4Kg)} kgCO₂e
              </strong>
            </article>

            <article>
              <span>N₂O katkısı</span>

              <strong>
                {formatKilograms(totalN2oKg)} kgCO₂e
              </strong>
            </article>
          </div>

          <div className="report-total">
            <span>Toplam emisyon</span>

            <strong>
              {formatTonnes(totalKg)} tCO₂e
            </strong>

            <small>
              {formatKilograms(totalKg)} kgCO₂e
            </small>
          </div>
        </section>

        <section className="report-section">
          <h3>
            {isDetailedReport ? '6.' : '4.'}{' '}
            Kısıtlar ve hariç tutulan kayıtlar
          </h3>

          <p>
            Doğrulama bekleyen, hesaplama bekleyen veya
            hesaplama hatası bulunan kayıtlar toplam emisyon
            sonucuna dahil edilmemiştir. Değerlendirme
            tamamlandığında rapor yeniden oluşturulmalıdır.
          </p>
        </section>

        <footer className="report-footer">
          <p>
            Bu rapor PlanBattery KAI tarafından
            oluşturulmuştur.
          </p>

          <p>
            Rapor sürümü: v0.1 · Durum: Ön izleme
          </p>
        </footer>
      </article>
    </section>
  )
}

export default ReportsPage