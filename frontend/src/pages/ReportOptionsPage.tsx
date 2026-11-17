import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import {
  BarChart3,
  Building2,
  CalendarRange,
  Eye,
  FileCheck2,
  FileSpreadsheet,
  SlidersHorizontal,
  Trash2,
  User,
} from 'lucide-react'
import { getAssessments } from '../services/assessments'
import {
  addManagerFeedback,
  getActivities,
  getCurrentUser,
} from '../services/activityStore'
import {
  createReport,
  deleteReport,
  getReports,
  groupReportsByPeriod,
  isReportNameTaken,
  suggestUniqueReportName,
} from '../services/reportStore'
import type {
  ReportDetail,
  ReportOptions,
  ReportScope,
  RecordScope,
  SavedReport,
} from '../services/reportStore'
import './ReportOptionsPage.css'

const facilityNames: Record<string, string> = {
  bucak: 'Bucak',
  'burdur-merkez': 'Burdur Merkez',
}

function ReportOptionsPage() {
  const navigate = useNavigate()
  const [searchParams, setSearchParams] = useSearchParams()
  const assessments = getAssessments()
  const [reports, setReports] = useState<SavedReport[]>(getReports)
  const currentUser = getCurrentUser()
  const isDataEntry = currentUser.tenantRole === 'DATA_ENTRY'
  const canCreateReport =
    currentUser.tenantRole === 'CARBON_SPECIALIST' || isDataEntry
  const canAnalyzeReports =
    currentUser.tenantRole === 'CARBON_SPECIALIST' ||
    currentUser.tenantRole === 'COMPANY_ADMIN'

  const requestedAssessmentId = searchParams.get('assessmentId') ?? ''
  const requestedFacilityId = searchParams.get('facilityId') ?? ''
  const requestedFacilityName = searchParams.get('facilityName') ?? ''
  const [facilityFilter, setFacilityFilter] = useState<string>(
    () => requestedFacilityId || 'ALL',
  )

  useEffect(() => {
    setFacilityFilter(requestedFacilityId || 'ALL')
  }, [requestedFacilityId])

  const defaultAssessment =
    assessments.find((a) => a.id === requestedAssessmentId) ?? assessments[0]

  const [options, setOptions] = useState<ReportOptions>(() => ({
    assessmentId: defaultAssessment?.id ?? '',
    reportScope: 'COMPANY',
    facilityId: '',
    periodType: 'ASSESSMENT',
    periodStart: defaultAssessment?.periodStart ?? '',
    periodEnd: defaultAssessment?.periodEnd ?? '',
    recordScope: 'CALCULATED',
    reportDetail: 'DETAILED',
  }))
  const [reportName, setReportName] = useState('')
  const [errorMessage, setErrorMessage] = useState('')

  const selectedAssessment = useMemo(
    () =>
      assessments.find((assessment) => assessment.id === options.assessmentId),
    [assessments, options.assessmentId],
  )

  const suggestedReportName = useMemo(() => {
    if (!selectedAssessment) return ''
    return suggestUniqueReportName(
      `${selectedAssessment.name} Karbon Ayak İzi Raporu`,
      reports,
    )
  }, [selectedAssessment, reports])

  const availableFacilities = useMemo(() => {
    const map = new Map<string, string>(Object.entries(facilityNames))
    for (const act of getActivities()) {
      if (act.facilityId && act.facility && !map.has(act.facilityId)) {
        map.set(act.facilityId, act.facility)
      }
    }
    for (const rep of reports) {
      if (
        rep.options.reportScope === 'FACILITY' &&
        rep.options.facilityId &&
        !map.has(rep.options.facilityId)
      ) {
        map.set(rep.options.facilityId, rep.options.facilityId)
      }
    }
    if (requestedFacilityId && !map.has(requestedFacilityId)) {
      map.set(
        requestedFacilityId,
        requestedFacilityName || requestedFacilityId,
      )
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [reports, requestedFacilityId, requestedFacilityName])

  const filteredReports = useMemo(() => {
    if (facilityFilter === 'ALL') return reports
    if (facilityFilter === 'COMPANY') {
      return reports.filter((r) => r.options.reportScope === 'COMPANY')
    }
    return reports.filter(
      (r) =>
        r.options.reportScope === 'FACILITY' &&
        r.options.facilityId === facilityFilter,
    )
  }, [reports, facilityFilter])

  const activeFacilityLabel = useMemo(() => {
    if (facilityFilter === 'ALL' || facilityFilter === 'COMPANY') return ''
    return (
      availableFacilities.find((f) => f.id === facilityFilter)?.name ??
      requestedFacilityName ??
      facilityFilter
    )
  }, [availableFacilities, facilityFilter, requestedFacilityName])

  const groupedReports = useMemo(
    () => groupReportsByPeriod(filteredReports),
    [filteredReports],
  )

  function handleSelectFacilityFilter(value: string) {
    setFacilityFilter(value)
    const next = new URLSearchParams(searchParams)
    if (value === 'ALL' || value === 'COMPANY') {
      next.delete('facilityId')
      next.delete('facilityName')
    } else {
      next.set('facilityId', value)
      const label = availableFacilities.find((f) => f.id === value)?.name
      if (label) next.set('facilityName', label)
    }
    setSearchParams(next, { replace: true })
  }

  function updateOption<Key extends keyof ReportOptions>(
    key: Key,
    value: ReportOptions[Key],
  ) {
    setOptions((current) => ({ ...current, [key]: value }))
    setErrorMessage('')
  }

  function selectAssessment(assessmentId: string) {
    const assessment = assessments.find((item) => item.id === assessmentId)
    setOptions((current) => ({
      ...current,
      assessmentId,
      periodStart: assessment?.periodStart ?? '',
      periodEnd: assessment?.periodEnd ?? '',
    }))
    setErrorMessage('')
  }

  function clearOptions() {
    setOptions({
      assessmentId: defaultAssessment?.id ?? '',
      reportScope: 'COMPANY',
      facilityId: '',
      periodType: 'ASSESSMENT',
      periodStart: defaultAssessment?.periodStart ?? '',
      periodEnd: defaultAssessment?.periodEnd ?? '',
      recordScope: 'CALCULATED',
      reportDetail: 'DETAILED',
    })
    setReportName('')
    setErrorMessage('')
  }

  function handleRemoveReport(id: string) {
    if (window.confirm('Bu kayıtlı raporu silmek istediğinize emin misiniz?')) {
      deleteReport(id)
      setReports(getReports())
    }
  }

  function openPreview() {
    if (!canCreateReport) return
    if (!selectedAssessment) {
      setErrorMessage('Lütfen bir değerlendirme seçin.')
      return
    }
    if (reportName.trim() && isReportNameTaken(reportName, reports)) {
      setErrorMessage(
        'Bu isimde bir rapor zaten mevcut (büyük/küçük harf fark etmeksizin benzersiz olmalıdır). Lütfen farklı bir ad girin.',
      )
      return
    }
    if (options.reportScope === 'FACILITY' && !options.facilityId) {
      setErrorMessage('Lütfen raporlanacak tesisi seçin.')
      return
    }
    if (
      options.periodType === 'CUSTOM' &&
      (!options.periodStart || !options.periodEnd)
    ) {
      setErrorMessage('Lütfen rapor tarih aralığını girin.')
      return
    }
    if (
      options.periodType === 'CUSTOM' &&
      options.periodStart > options.periodEnd
    ) {
      setErrorMessage('Başlangıç tarihi bitiş tarihinden sonra olamaz.')
      return
    }

    let created: SavedReport
    try {
      created = createReport(selectedAssessment.name, options, reportName)
    } catch (err) {
      setErrorMessage(
        err instanceof Error ? err.message : 'Rapor adı benzersiz olmalıdır.',
      )
      return
    }
    const scopeLabel =
      options.reportScope === 'FACILITY'
        ? facilityNames[options.facilityId] ?? 'Tesis'
        : 'Şirket Geneli'

    if (isDataEntry) {
      addManagerFeedback({
        targetType: 'REPORT',
        targetId: created.id,
        targetTitle: `${created.name} (${scopeLabel})`,
        message: `Veri ve Operasyon Sorumlusu tarafından (${scopeLabel}) karbon ayak izi raporu oluşturuldu ve Çevre / Karbon Uzmanı kontrolü için sunuldu.`,
        createdBy: currentUser.name ?? 'Veri ve Operasyon Sorumlusu',
        senderRole: 'Veri ve Operasyon Sorumlusu',
        senderTenantRole: 'DATA_ENTRY',
        reportOptions: options,
      })
    } else if (currentUser.tenantRole === 'CARBON_SPECIALIST') {
      addManagerFeedback({
        targetType: 'REPORT',
        targetId: created.id,
        targetTitle: `Uzman Onaylı Rapor Hazır: ${created.name} (${scopeLabel})`,
        message: `Çevre / Karbon Uzmanı tarafından (${scopeLabel}) kurumsal karbon ayak izi raporu oluşturuldu ve yönetici incelemesine sunuldu.`,
        createdBy: currentUser.name ?? 'Çevre / Karbon Uzmanı',
        senderRole: 'Çevre / Karbon Uzmanı',
        senderTenantRole: 'CARBON_SPECIALIST',
        reportOptions: options,
      })
    }
    setReports(getReports())
    navigate('/reports/preview', { state: options })
  }

  return (
    <section className="report-options-page">
      <header className="report-options-header">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1>Karbon Ayak İzi Raporları</h1>
            <p className="page-description">
              {canCreateReport
                ? 'Oluşturulan kurumsal emisyon raporlarını görüntüleyin veya yeni bir rapor yapılandırın.'
                : 'Oluşturulan kurumsal emisyon raporlarını inceleyin ve değerlendirin.'}
            </p>
          </div>
          {canAnalyzeReports && (
            <Link
              to="/reports/comparison"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: 8,
                padding: '10px 16px',
                borderRadius: 11,
                background: 'rgba(255, 255, 255, 0.14)',
                border: '1px solid rgba(255, 255, 255, 0.28)',
                color: '#ffffff',
                textDecoration: 'none',
                fontSize: 13.5,
                fontWeight: 700,
                backdropFilter: 'blur(10px)',
              }}
            >
              <BarChart3 size={16} />
              <span>Dönemsel Karşılaştırma</span>
            </Link>
          )}
        </div>
      </header>

      <div
        className={`reports-layout-grid ${!canCreateReport ? 'single-column' : ''}`}
      >
        {/* Left / Top: Report Configuration Builder */}
        {canCreateReport && (
          <div className="report-options-card">
            <div className="report-builder-header">
              <div className="builder-title-wrap">
                <span className="builder-icon">
                  <SlidersHorizontal size={18} />
                </span>
                <div>
                  <h2>Yeni Rapor Yapılandır</h2>
                  <p>
                    Rapor kapsamını, tarih aralığını ve ayrıntı düzeyini
                    belirleyin.
                  </p>
                </div>
              </div>
            </div>

            <section className="report-option-section">
              <div className="report-option-heading">
                <span className="report-option-number">1</span>
                <div>
                  <h3>Değerlendirme Dönemi</h3>
                  <p>Raporun bağlı olacağı kurumsal değerlendirmeyi seçin.</p>
                </div>
              </div>
              <label className="report-field">
                <span>Değerlendirme *</span>
                <select
                  value={options.assessmentId}
                  onChange={(event) => selectAssessment(event.target.value)}
                >
                  <option value="">Değerlendirme seçin</option>
                  {assessments.map((assessment) => (
                    <option key={assessment.id} value={assessment.id}>
                      {assessment.name}
                    </option>
                  ))}
                </select>
              </label>

              <label className="report-field" style={{ marginTop: 14 }}>
                <span>Rapor Adı (İsteğe Bağlı — Benzersiz)</span>
                <input
                  type="text"
                  value={reportName}
                  placeholder={
                    suggestedReportName || 'Örn: Ekim Ayı Doğalgaz Raporu'
                  }
                  onChange={(event) => {
                    setReportName(event.target.value)
                    setErrorMessage('')
                  }}
                />
                <small className="report-field-hint">
                  Boş bırakırsanız otomatik olarak benzersiz numara (
                  {suggestedReportName || '#1'}) atanır. Özel ad girerseniz
                  büyük/küçük harf fark etmeksizin benzersiz olmalıdır.
                </small>
              </label>
            </section>

            <section className="report-option-section">
              <div className="report-option-heading">
                <span className="report-option-number">2</span>
                <div>
                  <h3>Rapor Kapsamı</h3>
                  <p>Şirket genelini veya belirli bir tesisi raporlayın.</p>
                </div>
              </div>
              <div className="report-choice-grid">
                {(['COMPANY', 'FACILITY'] as ReportScope[]).map((scope) => (
                  <label
                    key={scope}
                    className={`report-choice ${
                      options.reportScope === scope ? 'selected' : ''
                    }`}
                  >
                    <input
                      type="radio"
                      name="reportScope"
                      checked={options.reportScope === scope}
                      onChange={() => updateOption('reportScope', scope)}
                    />
                    <span>
                      <strong>
                        {scope === 'COMPANY'
                          ? 'Şirket Geneli'
                          : 'Belirli Tesis'}
                      </strong>
                      <small>
                        {scope === 'COMPANY'
                          ? 'Tüm aktif tesisleri konsolide kapsar.'
                          : 'Yalnızca seçilen üretim tesisini kapsar.'}
                      </small>
                    </span>
                  </label>
                ))}
              </div>
              {options.reportScope === 'FACILITY' && (
                <label className="report-field">
                  <span>Tesis Seçimi *</span>
                  <select
                    value={options.facilityId}
                    onChange={(event) =>
                      updateOption('facilityId', event.target.value)
                    }
                  >
                    <option value="">Tesis seçin</option>
                    {availableFacilities.map((fac) => (
                      <option key={fac.id} value={fac.id}>
                        {fac.name}
                      </option>
                    ))}
                  </select>
                </label>
              )}
            </section>

            <section className="report-option-section">
              <div className="report-option-heading">
                <span className="report-option-number">3</span>
                <div>
                  <h3>Rapor Dönemi</h3>
                  <p>
                    Değerlendirmenin tamamını veya özel tarih aralığını
                    kullanın.
                  </p>
                </div>
              </div>
              <div className="report-choice-grid">
                <label
                  className={`report-choice ${
                    options.periodType === 'ASSESSMENT' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="periodType"
                    checked={options.periodType === 'ASSESSMENT'}
                    onChange={() => updateOption('periodType', 'ASSESSMENT')}
                  />
                  <span>
                    <strong>Tam Değerlendirme Dönemi</strong>
                    <small>
                      {selectedAssessment
                        ? `${formatDate(selectedAssessment.periodStart)} – ${formatDate(selectedAssessment.periodEnd)}`
                        : 'Önce değerlendirme seçin'}
                    </small>
                  </span>
                </label>
                <label
                  className={`report-choice ${
                    options.periodType === 'CUSTOM' ? 'selected' : ''
                  }`}
                >
                  <input
                    type="radio"
                    name="periodType"
                    checked={options.periodType === 'CUSTOM'}
                    onChange={() => updateOption('periodType', 'CUSTOM')}
                  />
                  <span>
                    <strong>Özel Tarih Aralığı</strong>
                    <small>Dönem içinden alt tarih aralığı filtreleyin.</small>
                  </span>
                </label>
              </div>
              {options.periodType === 'CUSTOM' && (
                <div className="report-date-grid">
                  <label className="report-field">
                    <span>Başlangıç Tarihi *</span>
                    <input
                      type="date"
                      min={selectedAssessment?.periodStart}
                      max={selectedAssessment?.periodEnd}
                      value={options.periodStart}
                      onChange={(event) =>
                        updateOption('periodStart', event.target.value)
                      }
                    />
                  </label>
                  <label className="report-field">
                    <span>Bitiş Tarihi *</span>
                    <input
                      type="date"
                      min={selectedAssessment?.periodStart}
                      max={selectedAssessment?.periodEnd}
                      value={options.periodEnd}
                      onChange={(event) =>
                        updateOption('periodEnd', event.target.value)
                      }
                    />
                  </label>
                </div>
              )}
            </section>

            <section className="report-option-section">
              <div className="report-option-heading">
                <span className="report-option-number">4</span>
                <div>
                  <h3>Rapor İçeriği ve Ayrıntı Düzeyi</h3>
                  <p>Kayıt kapsamını ve çıktı detay seviyesini seçin.</p>
                </div>
              </div>
              <div className="report-two-column-fields">
                <label className="report-field">
                  <span>Kayıt Kapsamı</span>
                  <select
                    value={options.recordScope}
                    onChange={(event) =>
                      updateOption(
                        'recordScope',
                        event.target.value as RecordScope,
                      )
                    }
                  >
                    <option value="CALCULATED">
                      Yalnızca doğrulanmış kayıtlar
                    </option>
                    <option value="ALL">Tüm kayıtlar (Taslak/Bekleyen dahil)</option>
                  </select>
                </label>
                <label className="report-field">
                  <span>Rapor Ayrıntısı</span>
                  <select
                    value={options.reportDetail}
                    onChange={(event) =>
                      updateOption(
                        'reportDetail',
                        event.target.value as ReportDetail,
                      )
                    }
                  >
                    <option value="DETAILED">
                      Ayrıntılı Rapor (Metodoloji + Tablo)
                    </option>
                    <option value="SUMMARY">Özet Rapor (Yönetici Özeti)</option>
                  </select>
                </label>
              </div>
            </section>

            {errorMessage && (
              <div className="report-options-error">{errorMessage}</div>
            )}

            <footer className="report-options-actions">
              <button
                className="report-clear-button"
                type="button"
                onClick={clearOptions}
              >
                Seçimleri Sıfırla
              </button>
              <button
                className="report-preview-button"
                type="button"
                onClick={openPreview}
              >
                <FileCheck2 size={17} />
                <span>Raporu Oluştur ve Önizle</span>
              </button>
            </footer>
          </div>
        )}

        {/* Right / Archive Column: Saved Reports */}
        <aside className="saved-reports-card">
          <div className="saved-reports-heading">
            <div>
              <h2>Oluşturulan Raporlar</h2>
              <p>
                {activeFacilityLabel
                  ? `${activeFacilityLabel} tesisi kapsamında oluşturulan raporlar.`
                  : 'Daha önce üretilen rapor arşiviniz.'}
              </p>
            </div>
            <span className="saved-count-badge">
              {filteredReports.length} rapor
            </span>
          </div>

          <div
            className="saved-reports-filters"
            role="tablist"
            aria-label="Tesis Kapsamı Filtresi"
          >
            <button
              type="button"
              className={`saved-filter-pill ${facilityFilter === 'ALL' ? 'active' : ''}`}
              onClick={() => handleSelectFacilityFilter('ALL')}
            >
              Tümü
            </button>
            <button
              type="button"
              className={`saved-filter-pill ${facilityFilter === 'COMPANY' ? 'active' : ''}`}
              onClick={() => handleSelectFacilityFilter('COMPANY')}
            >
              Şirket Geneli
            </button>
            {availableFacilities.map((fac) => (
              <button
                key={fac.id}
                type="button"
                className={`saved-filter-pill ${facilityFilter === fac.id ? 'active' : ''}`}
                onClick={() => handleSelectFacilityFilter(fac.id)}
              >
                {fac.name}
              </button>
            ))}
          </div>

          {groupedReports.length > 0 ? (
            <div className="saved-reports-groups">
              {groupedReports.map((group) => (
                <div key={group.key} className="saved-report-group">
                  <div className="saved-report-group-header">
                    <span className="saved-report-group-title">
                      <CalendarRange size={14} />
                      <strong>{group.assessmentName}</strong>
                    </span>
                    <span className="saved-report-group-count">
                      {group.reports.length} rapor
                    </span>
                  </div>

                  <div className="saved-reports-list">
                    {group.reports.map((report) => {
                      const scopeBadge =
                        report.options.reportScope === 'FACILITY'
                          ? facilityNames[report.options.facilityId] ?? 'Tesis'
                          : 'Şirket Geneli'
                      const detailBadge =
                        report.options.reportDetail === 'DETAILED'
                          ? 'Ayrıntılı'
                          : 'Özet'

                      return (
                        <article key={report.id} className="saved-report-item">
                          <div className="saved-report-top">
                            <span className="saved-report-icon">
                              <FileSpreadsheet size={18} />
                            </span>
                            <div className="saved-report-title-box">
                              <strong>{report.name}</strong>
                              <span className="saved-report-assessment">
                                {report.createdAt}
                              </span>
                            </div>
                          </div>

                          <div className="saved-report-tags">
                            <span className="report-meta-chip">
                              <Building2 size={12} />
                              {scopeBadge}
                            </span>
                            <span className="report-meta-chip">
                              {detailBadge}
                            </span>
                          </div>

                          <div className="saved-report-footer">
                            <small className="saved-report-author">
                              <User size={12} />
                              {report.createdBy}
                            </small>

                            <div className="saved-report-actions">
                              <Link
                                to="/reports/preview"
                                state={report.options}
                                className="saved-report-view-btn"
                              >
                                <Eye size={14} />
                                <span>Görüntüle</span>
                              </Link>
                              {canCreateReport && (
                                <button
                                  type="button"
                                  className="saved-report-delete-btn"
                                  onClick={() => handleRemoveReport(report.id)}
                                  title="Raporu Sil"
                                  aria-label="Raporu Sil"
                                >
                                  <Trash2 size={14} />
                                </button>
                              )}
                            </div>
                          </div>
                        </article>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="saved-reports-empty">
              <FileSpreadsheet size={28} />
              <strong>
                {activeFacilityLabel
                  ? `${activeFacilityLabel} kapsamında rapor bulunamadı`
                  : 'Henüz rapor oluşturulmadı'}
              </strong>
              <p>
                {activeFacilityLabel
                  ? `${activeFacilityLabel} tesisi kapsamında oluşturulmuş bir rapor henüz bulunmuyor.`
                  : canCreateReport
                    ? 'Sol taraftaki yapılandırıcıyı kullanarak ilk kurumsal karbon ayak izi raporunuzu oluşturabilirsiniz.'
                    : 'Çevre veya veri uzmanı tarafından oluşturulan kurumsal karbon ayak izi raporları burada listelenecektir.'}
              </p>
              {facilityFilter !== 'ALL' && (
                <button
                  type="button"
                  className="saved-filter-reset-btn"
                  onClick={() => handleSelectFacilityFilter('ALL')}
                >
                  Tüm Raporları Göster
                </button>
              )}
            </div>
          )}
        </aside>
      </div>
    </section>
  )
}

function formatDate(value: string) {
  if (!value) return '—'
  try {
    return new Intl.DateTimeFormat('tr-TR').format(
      new Date(`${value}T00:00:00`),
    )
  } catch {
    return value
  }
}

export default ReportOptionsPage
