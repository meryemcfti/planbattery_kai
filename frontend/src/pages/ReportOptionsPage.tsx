import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import './ReportOptionsPage.css'

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

const initialOptions: ReportOptions = {
  assessmentId: 'assessment-2026',
  reportScope: 'COMPANY',
  facilityId: '',
  periodType: 'ASSESSMENT',
  periodStart: '2026-01-01',
  periodEnd: '2026-12-31',
  recordScope: 'CALCULATED',
  reportDetail: 'DETAILED',
}

function ReportOptionsPage() {
  const navigate = useNavigate()

  const [options, setOptions] =
    useState<ReportOptions>(initialOptions)

  const [errorMessage, setErrorMessage] = useState('')

  function updateOption<Key extends keyof ReportOptions>(
    key: Key,
    value: ReportOptions[Key],
  ) {
    setOptions((currentOptions) => ({
      ...currentOptions,
      [key]: value,
    }))

    setErrorMessage('')
  }

  function clearOptions() {
    setOptions(initialOptions)
    setErrorMessage('')
  }

  function openPreview() {
    if (!options.assessmentId) {
      setErrorMessage('Lütfen bir değerlendirme seçin.')
      return
    }

    if (
      options.reportScope === 'FACILITY' &&
      !options.facilityId
    ) {
      setErrorMessage('Lütfen raporlanacak tesisi seçin.')
      return
    }

    if (
      options.periodType === 'CUSTOM' &&
      (!options.periodStart || !options.periodEnd)
    ) {
      setErrorMessage(
        'Lütfen rapor başlangıç ve bitiş tarihlerini girin.',
      )
      return
    }

    if (
      options.periodType === 'CUSTOM' &&
      options.periodStart > options.periodEnd
    ) {
      setErrorMessage(
        'Başlangıç tarihi bitiş tarihinden sonra olamaz.',
      )
      return
    }

    navigate('/reports/preview', {
      state: options,
    })
  }

  return (
    <section className="report-options-page">
      <header className="report-options-header">
        <p className="breadcrumb">
          Raporlar / Yeni Rapor
        </p>

        <h1>Karbon Ayak İzi Raporu Oluştur</h1>

        <p className="page-description">
          Raporun kapsamını ve içeriğini belirleyerek ön izleme
          oluşturun.
        </p>
      </header>

      <div className="report-options-card">
        <section className="report-option-section">
          <div className="report-option-heading">
            <span className="report-option-number">1</span>

            <div>
              <h2>Değerlendirme</h2>
              <p>
                Raporun bağlı olacağı karbon değerlendirmesini seçin.
              </p>
            </div>
          </div>

          <label className="report-field">
            <span>Değerlendirme *</span>

            <select
              value={options.assessmentId}
              onChange={(event) =>
                updateOption(
                  'assessmentId',
                  event.target.value,
                )
              }
            >
              <option value="">
                Değerlendirme seçin
              </option>

              <option value="assessment-2026">
                2026 Kurumsal Karbon Değerlendirmesi
              </option>
            </select>
          </label>
        </section>

        <section className="report-option-section">
          <div className="report-option-heading">
            <span className="report-option-number">2</span>

            <div>
              <h2>Rapor kapsamı</h2>
              <p>
                Şirket genelini veya belirli bir tesisi raporlayın.
              </p>
            </div>
          </div>

          <div className="report-choice-grid">
            <label
              className={`report-choice ${
                options.reportScope === 'COMPANY'
                  ? 'selected'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="reportScope"
                checked={options.reportScope === 'COMPANY'}
                onChange={() =>
                  updateOption('reportScope', 'COMPANY')
                }
              />

              <span>
                <strong>Şirket geneli</strong>
                <small>
                  Değerlendirmeye bağlı tüm tesisleri kapsar.
                </small>
              </span>
            </label>

            <label
              className={`report-choice ${
                options.reportScope === 'FACILITY'
                  ? 'selected'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="reportScope"
                checked={options.reportScope === 'FACILITY'}
                onChange={() =>
                  updateOption('reportScope', 'FACILITY')
                }
              />

              <span>
                <strong>Belirli tesis</strong>
                <small>
                  Yalnızca seçilen tesisi kapsar.
                </small>
              </span>
            </label>
          </div>

          {options.reportScope === 'FACILITY' && (
            <label className="report-field">
              <span>Tesis *</span>

              <select
                value={options.facilityId}
                onChange={(event) =>
                  updateOption(
                    'facilityId',
                    event.target.value,
                  )
                }
              >
                <option value="">Tesis seçin</option>
                <option value="bucak">Bucak</option>
                <option value="burdur-merkez">
                  Burdur Merkez
                </option>
              </select>
            </label>
          )}
        </section>

        <section className="report-option-section">
          <div className="report-option-heading">
            <span className="report-option-number">3</span>

            <div>
              <h2>Rapor dönemi</h2>
              <p>
                Değerlendirmenin tamamını veya özel tarih aralığını
                kullanın.
              </p>
            </div>
          </div>

          <div className="report-choice-grid">
            <label
              className={`report-choice ${
                options.periodType === 'ASSESSMENT'
                  ? 'selected'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="periodType"
                checked={
                  options.periodType === 'ASSESSMENT'
                }
                onChange={() =>
                  updateOption(
                    'periodType',
                    'ASSESSMENT',
                  )
                }
              />

              <span>
                <strong>Değerlendirme dönemi</strong>
                <small>01.01.2026 – 31.12.2026</small>
              </span>
            </label>

            <label
              className={`report-choice ${
                options.periodType === 'CUSTOM'
                  ? 'selected'
                  : ''
              }`}
            >
              <input
                type="radio"
                name="periodType"
                checked={options.periodType === 'CUSTOM'}
                onChange={() =>
                  updateOption('periodType', 'CUSTOM')
                }
              />

              <span>
                <strong>Özel tarih aralığı</strong>
                <small>
                  Değerlendirme içinden belirli bir dönem seçin.
                </small>
              </span>
            </label>
          </div>

          {options.periodType === 'CUSTOM' && (
            <div className="report-date-grid">
              <label className="report-field">
                <span>Başlangıç tarihi *</span>

                <input
                  type="date"
                  min="2026-01-01"
                  max="2026-12-31"
                  value={options.periodStart}
                  onChange={(event) =>
                    updateOption(
                      'periodStart',
                      event.target.value,
                    )
                  }
                />
              </label>

              <label className="report-field">
                <span>Bitiş tarihi *</span>

                <input
                  type="date"
                  min="2026-01-01"
                  max="2026-12-31"
                  value={options.periodEnd}
                  onChange={(event) =>
                    updateOption(
                      'periodEnd',
                      event.target.value,
                    )
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
              <h2>Rapor içeriği</h2>
              <p>
                Raporlanacak kayıtları ve ayrıntı seviyesini seçin.
              </p>
            </div>
          </div>

          <div className="report-two-column-fields">
            <label className="report-field">
              <span>Kayıt kapsamı</span>

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
                  Yalnızca hesaplanan kayıtlar
                </option>

                <option value="ALL">
                  Tüm kayıtlar
                </option>
              </select>
            </label>

            <label className="report-field">
              <span>Rapor ayrıntısı</span>

              <select
                value={options.reportDetail}
                onChange={(event) =>
                  updateOption(
                    'reportDetail',
                    event.target.value as ReportDetail,
                  )
                }
              >
                <option value="SUMMARY">
                  Özet rapor
                </option>

                <option value="DETAILED">
                  Ayrıntılı rapor
                </option>
              </select>
            </label>
          </div>

          <div className="report-selection-note">
            <strong>Faaliyet türü:</strong>
            <span>Scope 1 · Doğalgaz · Sabit Yanma</span>
          </div>
        </section>

        {errorMessage && (
          <div className="report-options-error">
            {errorMessage}
          </div>
        )}

        <footer className="report-options-actions">
          <button
            className="report-clear-button"
            type="button"
            onClick={clearOptions}
          >
            Seçimleri Temizle
          </button>

          <button
            className="report-preview-button"
            type="button"
            onClick={openPreview}
          >
            Raporu Önizle
          </button>
        </footer>
      </div>
    </section>
  )
}

export default ReportOptionsPage