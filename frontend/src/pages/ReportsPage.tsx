import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import {
  Check,
  CheckCircle2,
  FileDown,
  MessageSquareWarning,
  Send,
} from 'lucide-react'
import TenantBrandLogo from '../components/TenantBrandLogo'
import DocumentQrCode from '../components/DocumentQrCode'
import { getAssessment } from '../services/assessments'
import {
  addManagerFeedback,
  getActivities,
  getCurrentUser,
  getManagerFeedbacks,
  resolveManagerFeedback,
} from '../services/activityStore'
import type {
  ActivityStatus,
  ManagerFeedbackItem,
} from '../services/activityStore'
import type { ReportOptions } from '../services/reportStore'
import './ReportsPage.css'

const statusLabels: Record<ActivityStatus, string> = {
  PENDING_REVIEW: 'Uzman Onayı Bekliyor',
  VALIDATED: 'Uzman Onaylı',
  REVISION_REQUESTED: 'Yönetici Kontrol Talebi',
  FAILED: 'Hesaplanamadı',
}

const facilityLabels: Record<string, string> = {
  bucak: 'Bucak',
  'burdur-merkez': 'Burdur Merkez',
}

function ReportsPage() {
  const location = useLocation()
  const options = location.state as ReportOptions | null
  const currentUser = getCurrentUser()
  const isCompanyAdmin = currentUser.tenantRole === 'COMPANY_ADMIN'
  const isSpecialist = currentUser.tenantRole === 'CARBON_SPECIALIST'

  const [reportFeedback, setReportFeedback] = useState('')
  const [feedbackSent, setFeedbackSent] = useState(false)
  const [openReportFeedbacks, setOpenReportFeedbacks] = useState<
    ManagerFeedbackItem[]
  >(() =>
    getManagerFeedbacks().filter(
      (f) => f.targetType === 'REPORT' && !f.resolved,
    ),
  )
  const [specialistReplies, setSpecialistReplies] = useState<
    Record<string, string>
  >({})

  if (!options) {
    return (
      <section className="reports-page">
        <div className="report-document">
          <h1>Rapor bilgisi bulunamadı</h1>
          <p>Raporlar sayfasından bir rapor seçin veya oluşturun.</p>
          <Link className="report-edit-button" to="/reports">
            Raporlara Dön
          </Link>
        </div>
      </section>
    )
  }

  const assessment = getAssessment(options.assessmentId)

  if (!assessment) {
    return (
      <section className="reports-page">
        <div className="report-document">
          <h1>Değerlendirme bulunamadı</h1>
          <Link className="report-edit-button" to="/reports">
            Raporlara Dön
          </Link>
        </div>
      </section>
    )
  }

  const assessmentActivities = getActivities().filter(
    (activity) => activity.assessmentId === assessment.id,
  )
  const scopedActivities = assessmentActivities.filter((activity) => {
    const facilityMatches =
      options.reportScope === 'COMPANY' ||
      activity.facilityId === options.facilityId
    const periodMatches =
      options.periodType === 'ASSESSMENT' ||
      (activity.periodStart >= options.periodStart &&
        activity.periodEnd <= options.periodEnd)
    return facilityMatches && periodMatches
  })
  const displayedActivities = scopedActivities.filter(
    (activity) =>
      options.recordScope === 'ALL' || activity.status === 'VALIDATED',
  )
  const includedActivities = scopedActivities.filter(
    (activity) =>
      activity.status === 'VALIDATED' && Boolean(activity.calculation),
  )
  const hasIncompleteActivities = scopedActivities.some(
    (activity) => activity.status !== 'VALIDATED',
  )
  const totalCo2Kg = sumCalculation(includedActivities, 'co2eFromCo2')
  const totalCh4Kg = sumCalculation(includedActivities, 'co2eFromCh4')
  const totalN2oKg = sumCalculation(includedActivities, 'co2eFromN2o')
  const totalKg = totalCo2Kg + totalCh4Kg + totalN2oKg
  const allCompanyFacilities = Array.from(
    new Set([
      ...Object.values(facilityLabels),
      ...scopedActivities.map((activity) => activity.facility),
    ]),
  )
  const reportFacilityLabel =
    options.reportScope === 'FACILITY'
      ? (facilityLabels[options.facilityId] ?? 'Tesis seçilmedi')
      : `Tüm Aktif Tesisler (${allCompanyFacilities.join(', ')})`
  const reportScopeLabel =
    options.reportScope === 'FACILITY' ? reportFacilityLabel : 'Şirket geneli'
  const reportPeriod =
    options.periodType === 'CUSTOM'
      ? `${formatDate(options.periodStart)} – ${formatDate(options.periodEnd)}`
      : `${formatDate(assessment.periodStart)} – ${formatDate(assessment.periodEnd)}`
  const isDetailedReport = options.reportDetail === 'DETAILED'
  const reportDocCode = `REP-${assessment.id.slice(-4).toUpperCase()}-${options.reportScope === 'COMPANY' ? 'CORP' : options.facilityId.toUpperCase()}`
  const reportQrPayload = `RAPOR:${reportDocCode}|KURUM:${currentUser.tenantName ?? 'EM-Aku'}|KAPSAM:${reportScopeLabel}|DONEM:${reportPeriod}|EMISYON:${formatKilograms(totalKg)}kgCO2e`

  function handleSendReportFeedback() {
    if (!reportFeedback.trim() || !assessment) {
      window.alert(
        'Lütfen çevre uzmanına iletilecek rapor geri bildiriminizi veya kontrol talebinizi yazın.',
      )
      return
    }

    addManagerFeedback({
      targetType: 'REPORT',
      targetId: assessment.id,
      targetTitle: `${assessment.name} · ${reportScopeLabel} Raporu`,
      message: reportFeedback.trim(),
      createdBy: currentUser.name ?? 'Şirket Yöneticisi',
      reportOptions: options ?? undefined,
    })

    setReportFeedback('')
    setFeedbackSent(true)
  }

  function handleResolveOnReport(fbId: string) {
    const reply = specialistReplies[fbId] ?? ''
    const updated = resolveManagerFeedback(fbId, reply)
    setOpenReportFeedbacks(
      updated.filter((f) => f.targetType === 'REPORT' && !f.resolved),
    )
  }

  return (
    <section className="reports-page">
      <div className="report-screen-header">
        <div>
          <p className="breadcrumb">Raporlar / Rapor İnceleme ve Çıktı</p>
          <h1>Karbon Ayak İzi Raporu</h1>
          <p className="page-description">
            {assessment.name} · {reportScopeLabel} · {reportPeriod}
          </p>
        </div>
        <div className="report-screen-actions">
          {(isSpecialist || isCompanyAdmin) && (
            <Link
              className="report-edit-button"
              to={`/reports?assessmentId=${assessment.id}`}
            >
              Rapor Seçeneklerine Dön
            </Link>
          )}
          <button
            className="pdf-button"
            type="button"
            onClick={() => window.print()}
          >
            <FileDown size={17} />
            <span>PDF Çıktısı Al</span>
          </button>
        </div>
      </div>

      {/* Company Admin Dedicated Report Feedback & Specialist Request Box (Hidden in Print) */}
      {isCompanyAdmin && (
        <div className="report-manager-feedback-box">
          <div className="report-feedback-head">
            <MessageSquareWarning size={20} />
            <div>
              <h2>Yönetici Rapor İncelemesi & Çevre Uzmanına Geri Bildirim</h2>
              <p>
                Rapor çıktısını inceledikten sonra herhangi bir tesis verisinde
                veya hesaplamada kontrol/güncelleme gerekiyorsa Çevre Uzmanı
                Ayşe Yılmaz&apos;a buradan talep gönderebilirsiniz.
              </p>
            </div>
          </div>

          {feedbackSent && (
            <div className="report-feedback-sent">
              <CheckCircle2 size={16} />
              <span>
                Rapor geri bildiriminiz ve kontrol talebiniz Çevre Uzmanı Ayşe
                Yılmaz&apos;a iletildi.
              </span>
            </div>
          )}

          <div className="report-feedback-controls">
            <textarea
              rows={2}
              value={reportFeedback}
              placeholder="Raporla ilgili geri bildiriminiz veya çevre uzmanından kontrol/güncelleme isteğiniz..."
              onChange={(e) => {
                setReportFeedback(e.target.value)
                if (feedbackSent) setFeedbackSent(false)
              }}
            />
            <button
              type="button"
              className="report-feedback-submit"
              onClick={handleSendReportFeedback}
            >
              <Send size={15} />
              <span>Çevre Uzmanına İlet</span>
            </button>
          </div>
        </div>
      )}

      {/* Specialist View: Open Manager Requests for this Report */}
      {isSpecialist && openReportFeedbacks.length > 0 && (
        <div className="report-manager-feedback-box specialist-report-inbox">
          <div className="report-feedback-head">
            <MessageSquareWarning size={20} />
            <div>
              <h2>
                Şirket Yöneticisinin Bu Rapor İçin Kontrol & Güncelleme Talebi
              </h2>
              <p>
                Aşağıdaki tabloda yer alan faaliyet kayıtlarının yanındaki{' '}
                <strong>Kaydı Düzenle</strong> bağlantısıyla ilgili kayda
                giderek düzeltme yapabilir veya doğrudan buradan yanıtlayarak
                talebi kapatabilirsiniz.
              </p>
            </div>
          </div>

          <div className="specialist-report-fb-list">
            {openReportFeedbacks.map((fb) => (
              <div key={fb.id} className="specialist-report-fb-item">
                <div className="specialist-report-fb-msg">
                  <strong>
                    {fb.createdBy} ({fb.createdAt}):
                  </strong>{' '}
                  <span>{fb.message}</span>
                </div>
                <div className="specialist-report-fb-actions">
                  <input
                    type="text"
                    placeholder="Yöneticiye yanıt notu yazın..."
                    value={specialistReplies[fb.id] ?? ''}
                    onChange={(e) =>
                      setSpecialistReplies((prev) => ({
                        ...prev,
                        [fb.id]: e.target.value,
                      }))
                    }
                  />
                  <button
                    type="button"
                    className="specialist-report-resolve-btn"
                    onClick={() => handleResolveOnReport(fb.id)}
                  >
                    <Check size={14} />
                    <span>Yanıtla ve Tamamlandı İşaretle</span>
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <article className="report-document">
        <header className="report-cover">
          <div>
            <div style={{ marginBottom: 16 }}>
              <TenantBrandLogo tenantName={currentUser.tenantName ?? 'Şirket'} />
            </div>
            <h2>Kurumsal Karbon Ayak İzi Raporu</h2>
            <p>Kapsam 1 · Doğalgaz · Sabit Yanma (kgCO₂e)</p>
          </div>
          <dl className="report-metadata">
            <div>
              <dt>Şirket</dt>
              <dd>{currentUser.tenantName ?? 'Şirket'}</dd>
            </div>
            <div>
              <dt>Değerlendirme</dt>
              <dd>{assessment.name}</dd>
            </div>
            <div>
              <dt>Rapor kapsamı</dt>
              <dd>{reportScopeLabel}</dd>
            </div>
            <div>
              <dt>Rapor dönemi</dt>
              <dd>{reportPeriod}</dd>
            </div>
            <div>
              <dt>Oluşturulma tarihi</dt>
              <dd>{new Date().toLocaleDateString('tr-TR')}</dd>
            </div>
          </dl>
        </header>

        {hasIncompleteActivities && (
          <div className="report-warning">
            Bu değerlendirmede Çevre Uzmanı onayı tamamlanmamış kayıtlar
            bulunmaktadır. Toplam emisyona yalnızca Çevre Uzmanı tarafından
            kontrol edilip onaylanan kayıtlar dahil edilmiştir.
          </div>
        )}

        <section className="report-section">
          <h3>1. Organizasyon ve raporlama sınırı</h3>
          <p>
            Bu rapor {currentUser.tenantName ?? 'şirket'} için seçilen
            değerlendirmeye bağlanan doğalgaz faaliyetlerini kapsamaktadır.
          </p>
          <dl className="report-information-grid">
            <div>
              <dt>Değerlendirme</dt>
              <dd>{assessment.name}</dd>
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
              <dt>Faaliyet & Çıktı birimi</dt>
              <dd>m³ doğalgaz → kgCO₂e</dd>
            </div>
            <div>
              <dt>Kayıt kapsamı</dt>
              <dd>
                {options.recordScope === 'CALCULATED'
                  ? 'Çevre Uzmanı onaylı kayıtlar'
                  : 'Tüm kayıtlar'}
              </dd>
            </div>
          </dl>
        </section>

        {isDetailedReport && (
          <section className="report-section">
            <h3>2. Hesaplama metodolojisi</h3>
            <p>
              Doğalgaz tüketimi CO₂, CH₄ ve N₂O emisyon faktörleriyle
              değerlendirilmiş; sonuçlar kilogram CO₂ eşdeğerine (kgCO₂e)
              dönüştürülmüştür.
            </p>
            <div className="methodology-table-wrapper">
              <table className="methodology-table">
                <tbody>
                  <tr>
                    <th>Emisyon faktörü seti</th>
                    <td>GHG Protocol Cross-Sector Tools V2.0</td>
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
                  <tr>
                    <th>Raporlama Birimi</th>
                    <td>kgCO₂e (Kilogram Karbondioksit Eşdeğeri)</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </section>
        )}

        {isDetailedReport && (
          <section className="report-section">
            <h3>3. Faaliyet kayıtları</h3>
            {displayedActivities.length > 0 ? (
              <table className="report-table">
                <thead>
                  <tr>
                    <th>Dönem</th>
                    <th>Tesis</th>
                    <th>Tüketim</th>
                    <th>Veri kaynağı</th>
                    <th>Durum</th>
                    <th>Emisyon (kgCO₂e)</th>
                    <th className="no-print-col">İşlem</th>
                  </tr>
                </thead>
                <tbody>
                  {displayedActivities.map((activity) => (
                    <tr key={activity.id}>
                      <td>{activity.period}</td>
                      <td>{activity.facility}</td>
                      <td>{activity.consumption}</td>
                      <td>{activity.sourceType}</td>
                      <td>{statusLabels[activity.status]}</td>
                      <td>
                        {activity.calculation?.totalKgCo2e ?? 'Dahil edilmedi'}
                      </td>
                      <td className="no-print-col">
                        <Link
                          to={`/activities/${activity.id}`}
                          className="report-row-link"
                        >
                          {isSpecialist ? 'Kaydı Düzenle →' : 'Kaydı Gör →'}
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <p>Bu değerlendirme ve kapsam için faaliyet kaydı bulunamadı.</p>
            )}
          </section>
        )}

        <section className="report-section">
          <h3>{isDetailedReport ? '4.' : '2.'} Emisyon sonucu (kgCO₂e)</h3>
          <div className="report-gas-grid">
            <article>
              <span>CO₂ katkısı</span>
              <strong>{formatKilograms(totalCo2Kg)} kgCO₂e</strong>
            </article>
            <article>
              <span>CH₄ katkısı</span>
              <strong>{formatKilograms(totalCh4Kg)} kgCO₂e</strong>
            </article>
            <article>
              <span>N₂O katkısı</span>
              <strong>{formatKilograms(totalN2oKg)} kgCO₂e</strong>
            </article>
          </div>
          <div className="report-total">
            <span>Toplam Emisyon Sonucu</span>
            <strong>{formatKilograms(totalKg)} kgCO₂e</strong>
            <small>
              Çevre Uzmanı tarafından onaylanan kayıtların toplam kilogram CO₂
              eşdeğeri
            </small>
          </div>
        </section>

        <section className="report-section">
          <h3>{isDetailedReport ? '5.' : '3.'} Metodolojik Notlar ve Onay</h3>
          <p>
            Çevre Uzmanı kontrolü tamamlanmamış veya hesaplama hatası bulunan
            kayıtlar toplam emisyon sonucuna dahil edilmemiştir.
          </p>
        </section>

        <footer className="report-signatures-footer">
          <div className="report-sig-box">
            <span>ÇEVRE / KARBON UZMANI ONAYI</span>
            <strong>Ayşe Yılmaz</strong>
          </div>
          <div className="report-sig-box">
            <span>KURUMSAL STANDART KAYDI</span>
            <strong>{currentUser.tenantName ?? 'E&M Akü'}</strong>
          </div>
          <div className="report-sig-qr">
            <DocumentQrCode
              value={reportQrPayload}
              codeLabel={reportDocCode}
              size={58}
            />
          </div>
        </footer>
      </article>
    </section>
  )
}

function parseKilograms(value?: string) {
  if (!value) return 0
  const numeric = value
    .replace(/kgCO₂e/gi, '')
    .replace(/tCO₂e/gi, '')
    .replace(/[^0-9,.-]/g, '')
    .replace(/\./g, '')
    .replace(',', '.')
  return Number(numeric) || 0
}

function sumCalculation(
  activities: ReturnType<typeof getActivities>,
  key: 'co2eFromCo2' | 'co2eFromCh4' | 'co2eFromN2o',
) {
  return activities.reduce(
    (total, activity) => total + parseKilograms(activity.calculation?.[key]),
    0,
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR').format(new Date(`${value}T00:00:00`))
}

function formatKilograms(value: number) {
  return new Intl.NumberFormat('tr-TR', { maximumFractionDigits: 0 }).format(
    value,
  )
}

export default ReportsPage
