import { useState } from 'react'
import type { FormEvent } from 'react'
import { useNavigate } from 'react-router-dom'

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

function NewActivityPage() {
  const navigate = useNavigate()

  const [values, setValues] =
    useState<FormValues>(initialValues)

  const [errors, setErrors] =
    useState<Record<string, string>>({})

  function updateField(
    field: keyof FormValues,
    value: string,
  ) {
    setValues((current) => ({
      ...current,
      [field]: value,
    }))

    setErrors((current) => {
      const nextErrors = { ...current }
      delete nextErrors[field]

      return nextErrors
    })
  }

  function validateForm() {
    const nextErrors: Record<string, string> = {}

    if (!values.assessmentId) {
      nextErrors.assessmentId =
        'Değerlendirme seçimi zorunludur.'
    }

    if (!values.facilityId) {
      nextErrors.facilityId =
        'Tesis seçimi zorunludur.'
    }

    if (!values.periodStart) {
      nextErrors.periodStart =
        'Başlangıç tarihi zorunludur.'
    }

    if (!values.periodEnd) {
      nextErrors.periodEnd =
        'Bitiş tarihi zorunludur.'
    }

    if (
      values.periodStart &&
      values.periodEnd &&
      values.periodStart > values.periodEnd
    ) {
      nextErrors.periodEnd =
        'Bitiş tarihi başlangıç tarihinden önce olamaz.'
    }

    if (!values.consumptionValue) {
      nextErrors.consumptionValue =
        'Tüketim miktarı zorunludur.'
    } else if (Number(values.consumptionValue) <= 0) {
      nextErrors.consumptionValue =
        'Tüketim miktarı sıfırdan büyük olmalıdır.'
    }

    if (!values.sourceType) {
      nextErrors.sourceType =
        'Veri kaynağı seçimi zorunludur.'
    }

    if (
      values.sourceType === 'INVOICE' &&
      !values.invoiceNumber.trim()
    ) {
      nextErrors.invoiceNumber =
        'Fatura numarası zorunludur.'
    }

    if (
      values.sourceType === 'METER' &&
      !values.meterNumber.trim()
    ) {
      nextErrors.meterNumber =
        'Sayaç numarası zorunludur.'
    }

    if (
      values.sourceType === 'ENTERPRISE_SYSTEM' &&
      !values.sourceReference.trim()
    ) {
      nextErrors.sourceReference =
        'Sistem veya kayıt referansı zorunludur.'
    }

    if (
      values.sourceType === 'MANUAL' &&
      !values.sourceReference.trim()
    ) {
      nextErrors.sourceReference =
        'Manuel giriş gerekçesi zorunludur.'
    }

    if (
      values.sourceType === 'OTHER' &&
      !values.sourceReference.trim()
    ) {
      nextErrors.sourceReference =
        'Veri kaynağı açıklaması zorunludur.'
    }

    setErrors(nextErrors)

    return Object.keys(nextErrors).length === 0
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!validateForm()) {
      return
    }

    console.log('Gönderilecek doğalgaz kaydı:', values)

    alert('Form doğrulandı. API bağlantısı sonraki aşamada yapılacak.')
  }

  return (
    <>
      <header className="page-header">
        <div>
          <span className="breadcrumb">
            Faaliyetler / Yeni Doğalgaz Kaydı
          </span>

          <h1>Yeni Doğalgaz Kaydı</h1>

          <p className="page-subtitle">
            <span className="scope-badge">Scope 1</span>
            <span>Sabit Yanma</span>
          </p>
        </div>
      </header>

      <form
        className="activity-form"
        onSubmit={handleSubmit}
        noValidate
      >
        <div className="form-information">
          Zorunlu alanlar * ile işaretlenmiştir.
          Eksik kayıtlar sisteme gönderilmez.
        </div>

        <FormSection title="Bağlam">
          <FormField
            label="Değerlendirme *"
            error={errors.assessmentId}
          >
            <select
              value={values.assessmentId}
              onChange={(event) =>
                updateField(
                  'assessmentId',
                  event.target.value,
                )
              }
            >
              <option value="">
                Değerlendirme seçiniz
              </option>

              <option value="assessment-2026">
                2026 Kurumsal Karbon Değerlendirmesi
              </option>
            </select>
          </FormField>

          <FormField
            label="Tesis *"
            error={errors.facilityId}
          >
            <select
              value={values.facilityId}
              onChange={(event) =>
                updateField(
                  'facilityId',
                  event.target.value,
                )
              }
            >
              <option value="">Tesis seçiniz</option>
              <option value="bucak">Bucak</option>

              <option value="burdur-merkez">
                Burdur Merkez
              </option>
            </select>
          </FormField>
        </FormSection>

        <FormSection
          title="Tüketim Dönemi"
          columns
        >
          <FormField
            label="Başlangıç Tarihi *"
            error={errors.periodStart}
          >
            <input
              type="date"
              value={values.periodStart}
              onChange={(event) =>
                updateField(
                  'periodStart',
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField
            label="Bitiş Tarihi *"
            error={errors.periodEnd}
          >
            <input
              type="date"
              value={values.periodEnd}
              onChange={(event) =>
                updateField(
                  'periodEnd',
                  event.target.value,
                )
              }
            />
          </FormField>
        </FormSection>

        <FormSection
          title="Tüketim Bilgisi"
          columns
        >
          <FormField
            label="Tüketim Miktarı *"
            error={errors.consumptionValue}
          >
            <input
              type="number"
              min="0"
              step="0.000001"
              placeholder="Örn. 12000"
              value={values.consumptionValue}
              onChange={(event) =>
                updateField(
                  'consumptionValue',
                  event.target.value,
                )
              }
            />
          </FormField>

          <FormField label="Birim *">
            <input
              value="m³"
              disabled
            />
          </FormField>
        </FormSection>

        <FormSection title="Veri Kaynağı">
          <FormField
            label="Veri Kaynağı *"
            error={errors.sourceType}
          >
            <select
              value={values.sourceType}
              onChange={(event) => {
                updateField(
                  'sourceType',
                  event.target.value,
                )

                setValues((current) => ({
                  ...current,
                  sourceType:
                    event.target.value as SourceType,
                  invoiceNumber: '',
                  supplierName: '',
                  meterNumber: '',
                  sourceReference: '',
                }))

                setErrors({})
              }}
            >
              <option value="">
                Veri kaynağı seçiniz
              </option>

              <option value="INVOICE">Fatura</option>
              <option value="METER">Sayaç</option>

              <option value="ENTERPRISE_SYSTEM">
                Kurumsal Sistem
              </option>

              <option value="MANUAL">
                Manuel Giriş
              </option>

              <option value="OTHER">Diğer</option>
            </select>
          </FormField>

          {values.sourceType === 'INVOICE' && (
            <div className="form-grid">
              <FormField
                label="Fatura Numarası *"
                error={errors.invoiceNumber}
              >
                <input
                  value={values.invoiceNumber}
                  onChange={(event) =>
                    updateField(
                      'invoiceNumber',
                      event.target.value,
                    )
                  }
                />
              </FormField>

              <FormField label="Tedarikçi Adı">
                <input
                  value={values.supplierName}
                  onChange={(event) =>
                    updateField(
                      'supplierName',
                      event.target.value,
                    )
                  }
                />
              </FormField>
            </div>
          )}

          {values.sourceType === 'METER' && (
            <FormField
              label="Sayaç Numarası *"
              error={errors.meterNumber}
            >
              <input
                value={values.meterNumber}
                onChange={(event) =>
                  updateField(
                    'meterNumber',
                    event.target.value,
                  )
                }
              />
            </FormField>
          )}

          {values.sourceType ===
            'ENTERPRISE_SYSTEM' && (
            <FormField
              label="Sistem / Kayıt Referansı *"
              error={errors.sourceReference}
            >
              <input
                placeholder="Örn. SAP – Belge 4900012456"
                value={values.sourceReference}
                onChange={(event) =>
                  updateField(
                    'sourceReference',
                    event.target.value,
                  )
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
                rows={3}
                value={values.sourceReference}
                onChange={(event) =>
                  updateField(
                    'sourceReference',
                    event.target.value,
                  )
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
                rows={3}
                value={values.sourceReference}
                onChange={(event) =>
                  updateField(
                    'sourceReference',
                    event.target.value,
                  )
                }
              />
            </FormField>
          )}
        </FormSection>

        <FormSection title="Ek Bilgiler">
          <FormField label="Not">
            <textarea
              rows={4}
              maxLength={1000}
              placeholder="Bu kayıtla ilgili eklemek istediğiniz notlar..."
              value={values.notes}
              onChange={(event) =>
                updateField('notes', event.target.value)
              }
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

          <button
            type="submit"
            className="button primary-button"
          >
            Kaydı Oluştur
          </button>
        </div>
      </form>
    </>
  )
}

type FormSectionProps = {
  title: string
  columns?: boolean
  children: React.ReactNode
}

function FormSection({
  title,
  columns = false,
  children,
}: FormSectionProps) {
  return (
    <fieldset className="form-section">
      <legend>{title}</legend>

      <div
        className={
          columns ? 'form-grid' : 'form-stack'
        }
      >
        {children}
      </div>
    </fieldset>
  )
}

type FormFieldProps = {
  label: string
  error?: string
  children: React.ReactNode
}

function FormField({
  label,
  error,
  children,
}: FormFieldProps) {
  return (
    <label
      className={
        error ? 'form-field invalid' : 'form-field'
      }
    >
      <span>{label}</span>

      {children}

      {error && (
        <small className="field-error">
          {error}
        </small>
      )}
    </label>
  )
}

export default NewActivityPage