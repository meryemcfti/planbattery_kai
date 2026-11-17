import { useState } from 'react'
import { Link } from 'react-router-dom'
import type { FormEvent } from 'react'
import { CalendarRange, Plus } from 'lucide-react'
import {
  createAssessment,
  getAssessments,
} from '../services/assessments'
import type { Assessment } from '../services/assessments'
import './AssessmentsPage.css'

type TenantRole =
  | 'COMPANY_ADMIN'
  | 'CARBON_SPECIALIST'
  | 'DATA_ENTRY'
  | 'VIEWER'

type StoredUser = {
  tenantRole?: TenantRole
}

type FormValues = {
  name: string
  periodStart: string
  periodEnd: string
}

const initialValues: FormValues = {
  name: '',
  periodStart: '',
  periodEnd: '',
}

function getStoredUser(): StoredUser {
  try {
    return JSON.parse(
      localStorage.getItem('kai_user') ?? '{}',
    ) as StoredUser
  } catch {
    return {}
  }
}

function AssessmentsPage() {
  const user = getStoredUser()
  const canManageAssessments =
    user.tenantRole === 'CARBON_SPECIALIST'
  const [assessments, setAssessments] =
    useState<Assessment[]>(getAssessments)
  const [values, setValues] =
    useState<FormValues>(initialValues)
  const [errors, setErrors] =
    useState<Record<string, string>>({})

  function updateField(field: keyof FormValues, value: string) {
    setValues((current) => ({ ...current, [field]: value }))
    setErrors((current) => {
      const nextErrors = { ...current }
      delete nextErrors[field]
      return nextErrors
    })
  }

  function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()

    if (!canManageAssessments) {
      return
    }

    const nextErrors: Record<string, string> = {}

    if (!values.name.trim()) {
      nextErrors.name = 'Değerlendirme adı zorunludur.'
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
      nextErrors.periodEnd =
        'Bitiş tarihi başlangıç tarihinden önce olamaz.'
    }

    const nameExists = assessments.some(
      (assessment) =>
        assessment.name.trim().toLocaleLowerCase('tr-TR') ===
        values.name.trim().toLocaleLowerCase('tr-TR'),
    )

    if (nameExists) {
      nextErrors.name =
        'Bu isimde bir değerlendirme zaten bulunuyor.'
    }

    setErrors(nextErrors)

    if (Object.keys(nextErrors).length > 0) {
      return
    }

    const createdAssessment = createAssessment({
      name: values.name.trim(),
      periodStart: values.periodStart,
      periodEnd: values.periodEnd,
    })

    setAssessments((current) => [...current, createdAssessment])
    setValues(initialValues)
  }

  return (
    <section className="assessments-page">
      <header className="assessments-header">
        <p className="breadcrumb">Değerlendirmeler</p>
        <h1>Karbon Değerlendirmeleri</h1>
        <p>
          {canManageAssessments
            ? 'Faaliyetlerin ve raporların bağlanacağı değerlendirme dönemlerini görüntüleyin ve yönetin.'
            : 'Değerlendirme dönemlerini ve bağlı kayıtları inceleyin.'}
        </p>
      </header>

      <div
        className={`assessment-layout ${!canManageAssessments ? 'single-column' : ''}`}
      >
        {canManageAssessments && (
          <form
            className="assessment-create-card"
            onSubmit={handleSubmit}
            noValidate
          >
            <div className="assessment-card-heading">
              <span className="assessment-heading-icon">
                <Plus size={20} />
              </span>
              <div>
                <h2>Yeni Değerlendirme</h2>
                <p>Değerlendirme adını ve dönemini belirleyin.</p>
              </div>
            </div>

            <label className="assessment-field">
              <span>Değerlendirme Adı *</span>
              <input
                type="text"
                maxLength={150}
                placeholder="Örn. 2027 Kurumsal Karbon Değerlendirmesi"
                value={values.name}
                onChange={(event) =>
                  updateField('name', event.target.value)
                }
              />
              {errors.name && <small>{errors.name}</small>}
            </label>

            <div className="assessment-date-grid">
              <label className="assessment-field">
                <span>Başlangıç Tarihi *</span>
                <input
                  type="date"
                  value={values.periodStart}
                  onChange={(event) =>
                    updateField('periodStart', event.target.value)
                  }
                />
                {errors.periodStart && (
                  <small>{errors.periodStart}</small>
                )}
              </label>

              <label className="assessment-field">
                <span>Bitiş Tarihi *</span>
                <input
                  type="date"
                  value={values.periodEnd}
                  onChange={(event) =>
                    updateField('periodEnd', event.target.value)
                  }
                />
                {errors.periodEnd && (
                  <small>{errors.periodEnd}</small>
                )}
              </label>
            </div>

            <button
              className="assessment-create-button"
              type="submit"
            >
              Değerlendirme Oluştur
            </button>
          </form>
        )}

        <div className="assessment-list-card">
          <div className="assessment-card-heading">
            <span className="assessment-heading-icon">
              <CalendarRange size={20} />
            </span>
            <div>
              <h2>Mevcut Değerlendirmeler</h2>
              <p>{assessments.length} değerlendirme bulunuyor.</p>
            </div>
          </div>

          <div className="assessment-list">
            {assessments.map((assessment) => (
              <Link
                className="assessment-list-item"
                key={assessment.id}
                to={`/assessments/${assessment.id}`}
              >
                <div>
                  <strong>{assessment.name}</strong>
                  <span>
                    {formatDate(assessment.periodStart)} –{' '}
                    {formatDate(assessment.periodEnd)}
                  </span>
                </div>
                <span className="assessment-status">Aktif</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat('tr-TR').format(
    new Date(`${value}T00:00:00`),
  )
}

export default AssessmentsPage
