import { useMemo, useState } from 'react'
import type { ChangeEvent, FormEvent, ReactNode } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  Calculator,
  CheckCircle2,
  FileImage,
  FileSpreadsheet,
  Monitor,
  Plus,
  Send,
  Trash2,
  Upload,
} from 'lucide-react'
import { getAssessments } from '../services/assessments'
import {
  addActivity,
  addManagerFeedback,
  createDemoCalculation,
  getCurrentUser,
  getDefaultMatrix,
} from '../services/activityStore'
import type {
  CalculationMatrix,
  EvidenceAttachment,
  EvidenceKind,
} from '../services/activityStore'
import './NewActivityPage.css'

type SourceType =
  | ''
  | 'INVOICE'
  | 'METER'
  | 'ENTERPRISE_SYSTEM'
  | 'MANUAL'
  | 'OTHER'

type FormValues = {
  assessmentId: string
  facilityId: string
  periodStart: string
  periodEnd: string
  consumptionValue: string
  sourceType: SourceType
  invoiceNumber: string
  supplierName: string
  meterNumber: string
  sourceReference: string
  notes: string
}

const initialValues: FormValues = {
  assessmentId: '',
  facilityId: '',
  periodStart: '',
  periodEnd: '',
  consumptionValue: '',
  sourceType: '',
  invoiceNumber: '',
  supplierName: '',
  meterNumber: '',
  sourceReference: '',
  notes: '',
}

const facilityNames: Record<string, string> = {
  bucak: 'Bucak',
  'burdur-merkez': 'Burdur Merkez',
}

const sourceTypeNames: Record<Exclude<SourceType, ''>, string> = {
  INVOICE: 'Fatura',
  METER: 'Sayaç',
  ENTERPRISE_SYSTEM: 'Kurumsal Sistem',
  MANUAL: 'Manuel Giriş',
  OTHER: 'Diğer',
}

function formatPeriod(start: string, end: string) {
  const startDate = new Date(`${start}T00:00:00`)
  const endDate = new Date(`${end}T00:00:00`)

  if (
    startDate.getMonth() === endDate.getMonth() &&
    startDate.getFullYear() === endDate.getFullYear()
  ) {
    return startDate.toLocaleDateString('tr-TR', {
      month: 'long',
      year: 'numeric',
    })
  }

  return `${startDate.toLocaleDateString('tr-TR')} – ${endDate.toLocaleDateString(
    'tr-TR',
  )}`
}

function NewActivityPage() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const assessments = getAssessments()
  const currentUser = getCurrentUser()
  const requestedAssessmentId = searchParams.get('assessmentId') ?? ''

  const [values, setValues] = useState<FormValues>(() => ({
    ...initialValues,
    assessmentId: assessments.some(
      (assessment) => assessment.id === requestedAssessmentId,
    )
      ? requestedAssessmentId
      : (assessments[0]?.id ?? ''),
  }))
  const [matrix, setMatrix] = useState<CalculationMatrix>(getDefaultMatrix)
  const [attachments, setAttachments] = useState<EvidenceAttachment[]>([])
  const [errors, setErrors] = useState<Record<string, string>>({})

  const liveCalculation = useMemo(() => {
    const val = Number(values.consumptionValue)
    if (!Number.isFinite(val) || val <= 0) return null
    return createDemoCalculation(val)
  }, [values.consumptionValue])

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      const nextErrors = { ...current }
      delete nextErrors[field]
      return nextErrors
    })
  }

  function updateMatrixField(field: keyof CalculationMatrix, value: string) {
    setMatrix((current) => ({ ...current, [field]: value }))
  }

  function handleFileUpload(
    event: ChangeEvent<HTMLInputElement>,
    kind: EvidenceKind,
  ) {
    const files = event.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl =
          typeof reader.result === 'string' ? reader.result : undefined
        const newAtt: EvidenceAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          kind,
          title:
            kind === 'INVOICE_PHOTO'
              ? 'Doğalgaz Fatura Görseli'
              : kind === 'SAP_SCREENSHOT'
                ? 'SAP ERP Tüketim Ekran Görüntüsü'
                : kind === 'METER_PHOTO'
                  ? 'Saha Sayaç Okuma Fotoğrafı'
                  : 'Karbon Hesaplama Matrisi Tablosu',
          fileName: file.name,
          uploadedBy: currentUser.name ?? 'Mehmet Kaya',
          uploadedAt: new Date().toLocaleString('tr-TR'),
          documentCode:
            values.invoiceNumber ||
            values.meterNumber ||
            values.sourceReference ||
            'BELGE-2026',
          imageDataUrl: dataUrl,
        }
        setAttachments((prev) => [...prev, newAtt])
      }
      reader.readAsDataURL(file)
    })

    event.target.value = ''
  }

  function addSampleAttachment(kind: EvidenceKind) {
    const nowStr = new Date().toLocaleString('tr-TR')
    const uploader = currentUser.name ?? 'Mehmet Kaya'

    const sampleMap: Record<
      EvidenceKind,
      Omit<EvidenceAttachment, 'id' | 'uploadedBy' | 'uploadedAt'>
    > = {
      INVOICE_PHOTO: {
        kind: 'INVOICE_PHOTO',
        title: 'BOTAŞ Doğalgaz Tüketim Faturası Fotoğrafı',
        fileName: `BOTAS_Fatura_${values.invoiceNumber || '2026_09'}.jpg`,
        documentCode: values.invoiceNumber || 'FAT-2026-091',
      },
      SAP_SCREENSHOT: {
        kind: 'SAP_SCREENSHOT',
        title: 'SAP ERP MM Modülü Doğalgaz Kayıt Görüntüsü',
        fileName: `SAP_GUI_Belge_${values.sourceReference || '4900084'}.png`,
        documentCode: values.sourceReference || 'SAP-4900084',
      },
      METER_PHOTO: {
        kind: 'METER_PHOTO',
        title: 'Tesis Doğalgaz Sayaç Endeks Fotoğrafı',
        fileName: `Sayac_Endeks_${values.meterNumber || 'SYC08'}.jpg`,
        documentCode: values.meterNumber || 'SYC-008',
      },
      MATRIX_SHEET: {
        kind: 'MATRIX_SHEET',
        title: 'Kapsam 1 Sabit Yanma Karbon Hesaplama Matrisi',
        fileName: `Karbon_Hesap_Matrisi_${matrix.matrixCode}.xlsx`,
        documentCode: matrix.matrixCode,
      },
    }

    const template = sampleMap[kind]
    setAttachments((prev) => [
      ...prev,
      {
        ...template,
        id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        uploadedBy: uploader,
        uploadedAt: nowStr,
      },
    ])
  }

  function removeAttachment(id: string) {
    setAttachments((prev) => prev.filter((item) => item.id !== id))
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {}

    if (!values.assessmentId) {
      nextErrors.assessmentId = 'Değerlendirme seçimi zorunludur.'
    }
    if (!values.facilityId) {
      nextErrors.facilityId = 'Tesis seçimi zorunludur.'
    }
    if (!values.periodStart) {
      nextErrors.periodStart = 'Başlangıç tarihi zorunludur.'
    }
    if (!values.periodEnd) {
      nextErrors.periodEnd = 'Bitiş tarihi zorunludur.'
    }
    if (
      values.periodStart &&
      values.periodEnd &&
      values.periodStart > values.periodEnd
    ) {
      nextErrors.periodEnd = 'Bitiş tarihi başlangıç tarihinden önce olamaz.'
    }

    const consumptionValue = Number(values.consumptionValue)
    if (!values.consumptionValue) {
      nextErrors.consumptionValue = 'Tüketim miktarı zorunludur.'
    } else if (!Number.isFinite(consumptionValue) || consumptionValue <= 0) {
      nextErrors.consumptionValue = 'Tüketim miktarı sıfırdan büyük olmalıdır.'
    }

    if (!values.sourceType) {
      nextErrors.sourceType = 'Veri kaynağı seçimi zorunludur.'
    }
    if (values.sourceType === 'INVOICE' && !values.invoiceNumber.trim()) {
      nextErrors.invoiceNumber = 'Fatura numarası zorunludur.'
    }
    if (values.sourceType === 'METER' && !values.meterNumber.trim()) {
      nextErrors.meterNumber = 'Sayaç numarası zorunludur.'
    }
    if (
      values.sourceType === 'ENTERPRISE_SYSTEM' &&
      !values.sourceReference.trim()
    ) {
      nextErrors.sourceReference = 'Sistem veya kayıt referansı zorunludur.'
    }
    if (values.sourceType === 'MANUAL' && !values.sourceReference.trim()) {
      nextErrors.sourceReference = 'Manuel giriş gerekçesi zorunludur.'
    }
    if (values.sourceType === 'OTHER' && !values.sourceReference.trim()) {
      nextErrors.sourceReference = 'Veri kaynağı açıklaması zorunludur.'
    }

    setErrors(nextErrors)
    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validateForm() || !values.sourceType) {
      return
    }

    const assessment = assessments.find(
      (item) => String(item.id) === values.assessmentId,
    )
    const consumptionValue = Number(values.consumptionValue)
    const sourceReference =
      values.sourceType === 'INVOICE'
        ? values.invoiceNumber
        : values.sourceType === 'METER'
          ? values.meterNumber
          : values.sourceReference

    const calc = createDemoCalculation(consumptionValue)
    const facilityTitle =
      facilityNames[values.facilityId] ?? values.facilityId
    const periodTitle = formatPeriod(values.periodStart, values.periodEnd)
    const senderName = currentUser.name ?? 'Mehmet Kaya'

    const activity = addActivity({
      assessmentId: values.assessmentId,
      assessmentName: assessment?.name ?? 'Karbon Değerlendirmesi',
      periodStart: values.periodStart,
      periodEnd: values.periodEnd,
      period: periodTitle,
      facilityId: values.facilityId,
      facility: facilityTitle,
      consumptionValue,
      consumption: `${consumptionValue.toLocaleString('tr-TR')} m³`,
      sourceType: sourceTypeNames[values.sourceType],
      sourceReference: sourceReference.trim(),
      supplierName: values.supplierName.trim() || '—',
      notes: values.notes.trim(),
      enteredBy: senderName,
      enteredAt: new Date().toLocaleString('tr-TR'),
      status: 'PENDING_REVIEW',
      calculation: calc,
      matrix,
      attachments: attachments.length > 0 ? attachments : undefined,
    })

    // Notify Çevre Uzmanı Ayşe Yılmaz automatically
    addManagerFeedback({
      targetType: 'ACTIVITY',
      targetId: String(activity.id),
      targetTitle: `Yeni Veri & Matris Girişi: ${facilityTitle} · ${periodTitle} (${activity.consumption})`,
      message: `${senderName} tarafından ${sourceTypeNames[values.sourceType]} (${sourceReference.trim()}) kanıt belgeleri ve karbon hesaplama matrisi (${calc.totalKgCo2e}) sisteme işlenerek Çevre Uzmanı onayına sunuldu.`,
      createdBy: senderName,
      senderRole: 'Veri ve Operasyon Sorumlusu',
    })

    navigate(`/activities/${activity.id}`, { replace: true })
  }

  return (
    <>
      <header className="page-header">
        <div>
          <span className="breadcrumb">
            Faaliyetler / Veri, Kanıt ve Karbon Matrisi Girişi
          </span>
          <h1>Yeni Doğalgaz Faaliyet & Matris Kaydı</h1>
          <p className="page-subtitle">
            <span className="scope-badge">Kapsam 1 · Sabit Yanma</span>
            <span>
              Fatura fotoğrafı, SAP ekran görüntüsü ve karbon hesaplama
              matrisini işleyerek Çevre Uzmanı kontrolüne gönderin.
            </span>
          </p>
        </div>
      </header>

      <form className="activity-form" onSubmit={handleSubmit} noValidate>
        <div className="form-information">
          Zorunlu alanlar * ile işaretlenmiştir. Kayıt oluşturulduğunda kanıt
          görselleri ve hesaplama matrisi otomatik olarak{' '}
          <strong>Çevre Uzmanı (Ayşe Yılmaz)</strong> bildirimlerine iletilir.
        </div>

        <FormSection title="1. Kurumsal Bağlam ve Tesis" columns>
          <FormField label="Değerlendirme Dönemi *" error={errors.assessmentId}>
            <select
              value={values.assessmentId}
              onChange={(event) =>
                updateField('assessmentId', event.target.value)
              }
            >
              <option value="">Değerlendirme seçiniz</option>
              {assessments.map((assessment) => (
                <option key={assessment.id} value={String(assessment.id)}>
                  {assessment.name}
                </option>
              ))}
            </select>
          </FormField>

          <FormField label="Tesis *" error={errors.facilityId}>
            <select
              value={values.facilityId}
              onChange={(event) =>
                updateField('facilityId', event.target.value)
              }
            >
              <option value="">Tesis seçiniz</option>
              <option value="bucak">Bucak</option>
              <option value="burdur-merkez">Burdur Merkez</option>
            </select>
          </FormField>
        </FormSection>

        <FormSection title="2. Tüketim Dönemi ve Miktarı" columns>
          <FormField label="Başlangıç Tarihi *" error={errors.periodStart}>
            <input
              type="date"
              value={values.periodStart}
              onChange={(event) =>
                updateField('periodStart', event.target.value)
              }
            />
          </FormField>
          <FormField label="Bitiş Tarihi *" error={errors.periodEnd}>
            <input
              type="date"
              value={values.periodEnd}
              onChange={(event) => updateField('periodEnd', event.target.value)}
            />
          </FormField>
          <FormField label="Tüketim Miktarı *" error={errors.consumptionValue}>
            <input
              type="number"
              min="0"
              step="0.000001"
              placeholder="Örn. 12000"
              value={values.consumptionValue}
              onChange={(event) =>
                updateField('consumptionValue', event.target.value)
              }
            />
          </FormField>
          <FormField label="Faaliyet Birimi *">
            <input value="m³ Doğalgaz (Çıktı: kgCO₂e)" disabled />
          </FormField>
        </FormSection>

        <FormSection title="3. Veri Kaynağı (Fatura / SAP / Sayaç)">
          <FormField label="Veri Kaynağı *" error={errors.sourceType}>
            <select
              value={values.sourceType}
              onChange={(event) => {
                const sourceType = event.target.value as SourceType
                setValues((current) => ({
                  ...current,
                  sourceType,
                  invoiceNumber: '',
                  supplierName: '',
                  meterNumber: '',
                  sourceReference: '',
                }))
                setErrors({})
              }}
            >
              <option value="">Veri kaynağı seçiniz</option>
              <option value="INVOICE">Doğalgaz Faturası</option>
              <option value="ENTERPRISE_SYSTEM">
                Kurumsal Sistem (SAP ERP)
              </option>
              <option value="METER">Saha Doğalgaz Sayacı</option>
              <option value="MANUAL">Manuel Giriş</option>
              <option value="OTHER">Diğer</option>
            </select>
          </FormField>

          {values.sourceType === 'INVOICE' && (
            <div className="form-grid">
              <FormField label="Fatura Numarası *" error={errors.invoiceNumber}>
                <input
                  placeholder="Örn. FAT-2026-091"
                  value={values.invoiceNumber}
                  onChange={(event) =>
                    updateField('invoiceNumber', event.target.value)
                  }
                />
              </FormField>
              <FormField label="Tedarikçi Adı">
                <input
                  placeholder="Örn. BOTAŞ"
                  value={values.supplierName}
                  onChange={(event) =>
                    updateField('supplierName', event.target.value)
                  }
                />
              </FormField>
            </div>
          )}

          {values.sourceType === 'METER' && (
            <FormField label="Sayaç Numarası *" error={errors.meterNumber}>
              <input
                placeholder="Örn. SYC-008"
                value={values.meterNumber}
                onChange={(event) =>
                  updateField('meterNumber', event.target.value)
                }
              />
            </FormField>
          )}

          {values.sourceType === 'ENTERPRISE_SYSTEM' && (
            <FormField
              label="SAP / ERP Belge Referansı *"
              error={errors.sourceReference}
            >
              <input
                placeholder="Örn. SAP-MM-4900084"
                value={values.sourceReference}
                onChange={(event) =>
                  updateField('sourceReference', event.target.value)
                }
              />
            </FormField>
          )}

          {values.sourceType === 'MANUAL' && (
            <FormField
              label="Manuel Giriş Gerekçesi *"
              error={errors.sourceReference}
            >
              <textarea
                rows={2}
                value={values.sourceReference}
                onChange={(event) =>
                  updateField('sourceReference', event.target.value)
                }
              />
            </FormField>
          )}

          {values.sourceType === 'OTHER' && (
            <FormField
              label="Kaynak Açıklaması *"
              error={errors.sourceReference}
            >
              <textarea
                rows={2}
                value={values.sourceReference}
                onChange={(event) =>
                  updateField('sourceReference', event.target.value)
                }
              />
            </FormField>
          )}
        </FormSection>

        {/* 4. Karbon Hesaplama Matrisi Bölümü */}
        <fieldset className="form-section matrix-builder-section">
          <legend>
            <Calculator size={15} />
            <span>4. Karbon Hesaplama Matrisi (IPCC / GHG Protocol)</span>
          </legend>

          <p className="section-helper-note">
            Tüketilen doğalgazın (m³) enerji içeriği, oksidasyon oranı ve sera
            gazı katsayı matrisi aşağıda tanımlıdır.
          </p>

          <div className="matrix-inputs-grid">
            <label className="form-field">
              <span>Matris Referans Kodu</span>
              <input
                value={matrix.matrixCode}
                onChange={(e) =>
                  updateMatrixField('matrixCode', e.target.value)
                }
              />
            </label>
            <label className="form-field">
              <span>Alt Isıl Değer (NCV)</span>
              <input
                value={matrix.ncvMjPerM3}
                onChange={(e) =>
                  updateMatrixField('ncvMjPerM3', e.target.value)
                }
              />
            </label>
            <label className="form-field">
              <span>Oksidasyon Faktörü</span>
              <input
                value={matrix.oxidationFactor}
                onChange={(e) =>
                  updateMatrixField('oxidationFactor', e.target.value)
                }
              />
            </label>
            <label className="form-field">
              <span>Dönüşüm Katsayısı (kWh/m³)</span>
              <input
                value={matrix.kwhPerM3}
                onChange={(e) => updateMatrixField('kwhPerM3', e.target.value)}
              />
            </label>
            <label className="form-field">
              <span>CO₂ Faktörü (kg/TJ)</span>
              <input
                value={matrix.co2KgPerTj}
                onChange={(e) =>
                  updateMatrixField('co2KgPerTj', e.target.value)
                }
              />
            </label>
            <label className="form-field">
              <span>CH₄ & N₂O Faktörü (kg/TJ)</span>
              <input
                value={`CH₄: ${matrix.ch4KgPerTj} · N₂O: ${matrix.n2oKgPerTj}`}
                disabled
              />
            </label>
          </div>

          {liveCalculation && (
            <div className="live-matrix-preview">
              <div className="live-matrix-head">
                <CheckCircle2 size={16} />
                <strong>Canlı Karbon Matrisi Hesaplama Önizlemesi (kgCO₂e)</strong>
              </div>
              <div className="live-matrix-row">
                <div>
                  <span>CO₂ Katkısı</span>
                  <strong>{liveCalculation.co2eFromCo2}</strong>
                </div>
                <div>
                  <span>CH₄ Katkısı (GWP: 28)</span>
                  <strong>{liveCalculation.co2eFromCh4}</strong>
                </div>
                <div>
                  <span>N₂O Katkısı (GWP: 265)</span>
                  <strong>{liveCalculation.co2eFromN2o}</strong>
                </div>
                <div className="live-matrix-total">
                  <span>Toplam Emisyon Çıktısı</span>
                  <strong>{liveCalculation.totalKgCo2e}</strong>
                </div>
              </div>
            </div>
          )}
        </fieldset>

        {/* 5. Fatura Fotoğrafı, SAP Görüntüsü ve Matris Dosyası Yükleme */}
        <fieldset className="form-section evidence-upload-section">
          <legend>
            <FileImage size={15} />
            <span>
              5. Kanıt Görselleri (Fatura Fotoğrafı, SAP Ekran Görüntüsü, Matris)
            </span>
          </legend>

          <div className="evidence-upload-grid">
            <label className="upload-drop-card">
              <input
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={(e) => handleFileUpload(e, 'INVOICE_PHOTO')}
              />
              <Upload size={20} />
              <strong>Fatura Fotoğrafı Yükle</strong>
              <small>Bilgisayarınızdan fatura görseli seçin (.jpg, .png)</small>
            </label>

            <label className="upload-drop-card">
              <input
                type="file"
                accept="image/*,.pdf"
                multiple
                onChange={(e) => handleFileUpload(e, 'SAP_SCREENSHOT')}
              />
              <Monitor size={20} />
              <strong>SAP Ekran Görüntüsü Yükle</strong>
              <small>SAP ERP tüketim ekran görüntüsü seçin</small>
            </label>

            <label className="upload-drop-card">
              <input
                type="file"
                accept=".xlsx,.csv,image/*,.pdf"
                multiple
                onChange={(e) => handleFileUpload(e, 'MATRIX_SHEET')}
              />
              <FileSpreadsheet size={20} />
              <strong>Hesaplama Matrisi Ekle</strong>
              <small>Karbon matris tablosu veya sayaç görseli seçin</small>
            </label>
          </div>

          <div className="quick-sample-evidence-bar">
            <span>Hızlı Demo Kanıtı Ekle:</span>
            <button
              type="button"
              onClick={() => addSampleAttachment('INVOICE_PHOTO')}
            >
              <Plus size={13} /> Örnek Fatura Fotoğrafı
            </button>
            <button
              type="button"
              onClick={() => addSampleAttachment('SAP_SCREENSHOT')}
            >
              <Plus size={13} /> Örnek SAP Ekran Görüntüsü
            </button>
            <button
              type="button"
              onClick={() => addSampleAttachment('MATRIX_SHEET')}
            >
              <Plus size={13} /> Örnek Karbon Matrisi Tablosu
            </button>
          </div>

          {attachments.length > 0 && (
            <div className="attached-evidence-list">
              {attachments.map((att) => (
                <div key={att.id} className="attached-evidence-item">
                  {att.imageDataUrl ? (
                    <img
                      src={att.imageDataUrl}
                      alt={att.title}
                      className="attached-thumb"
                    />
                  ) : (
                    <span className="attached-icon-box">
                      {att.kind === 'SAP_SCREENSHOT' ? (
                        <Monitor size={16} />
                      ) : att.kind === 'MATRIX_SHEET' ? (
                        <FileSpreadsheet size={16} />
                      ) : (
                        <FileImage size={16} />
                      )}
                    </span>
                  )}
                  <div className="attached-meta">
                    <strong>{att.title}</strong>
                    <small>
                      {att.fileName} · Kod: {att.documentCode}
                    </small>
                  </div>
                  <button
                    type="button"
                    className="attached-remove-btn"
                    onClick={() => removeAttachment(att.id)}
                  >
                    <Trash2 size={15} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </fieldset>

        <FormSection title="6. Operasyon Notu">
          <FormField label="Çevre Uzmanına İletilecek Not">
            <textarea
              rows={3}
              maxLength={1000}
              placeholder="Fatura, SAP ekran görüntüsü veya hesaplama matrisiyle ilgili Çevre Uzmanı Ayşe Yılmaz'a iletmek istediğiniz not..."
              value={values.notes}
              onChange={(event) => updateField('notes', event.target.value)}
            />
          </FormField>
        </FormSection>

        <div className="form-actions">
          <button
            type="button"
            className="button secondary-button"
            onClick={() => navigate('/activities')}
          >
            İptal
          </button>
          <button type="submit" className="button primary-button submit-with-icon">
            <Send size={16} />
            <span>Kaydı ve Matrisi Çevre Uzmanı Kontrolüne Gönder</span>
          </button>
        </div>
      </form>
    </>
  )
}

type FormSectionProps = {
  title: string
  columns?: boolean
  children: ReactNode
}

function FormSection({ title, columns = false, children }: FormSectionProps) {
  return (
    <fieldset className="form-section">
      <legend>{title}</legend>
      <div className={columns ? 'form-grid' : 'form-stack'}>{children}</div>
    </fieldset>
  )
}

type FormFieldProps = {
  label: string
  error?: string
  children: ReactNode
}

function FormField({ label, error, children }: FormFieldProps) {
  return (
    <label className={error ? 'form-field invalid' : 'form-field'}>
      <span>{label}</span>
      {children}
      {error && <small className="field-error">{error}</small>}
    </label>
  )
}

export default NewActivityPage
