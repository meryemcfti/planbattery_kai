import { useState } from 'react'
import type { ChangeEvent } from 'react'
import { Link, useParams } from 'react-router-dom'
import {
  AlertTriangle,
  ArrowLeft,
  Calculator,
  CheckCircle2,
  Edit3,
  Eye,
  FileDown,
  FileImage,
  FileSpreadsheet,
  MessageSquareWarning,
  Monitor,
  RefreshCw,
  Send,
  ShieldCheck,
  Upload,
  X,
} from 'lucide-react'
import TenantBrandLogo from '../components/TenantBrandLogo'
import DocumentQrCode from '../components/DocumentQrCode'
import { getAssessments } from '../services/assessments'
import {
  addManagerFeedback,
  createDemoCalculation,
  getActivity,
  getCurrentUser,
  getDefaultMatrix,
  updateActivity,
} from '../services/activityStore'
import type {
  ActivityStatus,
  EvidenceAttachment,
  EvidenceKind,
} from '../services/activityStore'
import './ActivityDetailPage.css'

const statusLabels: Record<ActivityStatus, string> = {
  PENDING_REVIEW: 'Uzman Onayı Bekliyor',
  VALIDATED: 'Uzman Tarafından Onaylandı',
  REVISION_REQUESTED: 'Kontrol / Güncelleme Talebi',
  FAILED: 'Hesaplanamadı',
}

function statusClass(status: ActivityStatus) {
  return status.toLowerCase().replace(/_/g, '-')
}

function ActivityDetailPage() {
  const { activityId } = useParams()
  const id = Number(activityId)
  const [activity, setActivity] = useState(() => getActivity(id))
  const currentUser = getCurrentUser()

  const isSpecialist = currentUser.tenantRole === 'CARBON_SPECIALIST'
  const isCompanyAdmin = currentUser.tenantRole === 'COMPANY_ADMIN'
  const isDataEntry = currentUser.tenantRole === 'DATA_ENTRY'
  const canEditData = isSpecialist || isDataEntry

  // Manager feedback / control request state
  const [feedbackText, setFeedbackText] = useState('')
  const [feedbackSentNotice, setFeedbackSentNotice] = useState(false)

  // Data Entry / Specialist edit & recalculate state (covers all Faaliyet Bilgileri fields)
  const assessments = getAssessments()
  const [editOpen, setEditOpen] = useState(false)
  const [editAssessmentId, setEditAssessmentId] = useState(
    activity?.assessmentId ?? '',
  )
  const [editFacilityId, setEditFacilityId] = useState(
    activity?.facilityId ?? 'bucak',
  )
  const [editPeriodStart, setEditPeriodStart] = useState(
    activity?.periodStart ?? '',
  )
  const [editPeriodEnd, setEditPeriodEnd] = useState(activity?.periodEnd ?? '')
  const [editConsumption, setEditConsumption] = useState(
    activity ? String(activity.consumptionValue) : '',
  )
  const [editSourceType, setEditSourceType] = useState(
    activity?.sourceType ?? 'Fatura',
  )
  const [editReference, setEditReference] = useState(
    activity?.sourceReference ?? '',
  )
  const [editSupplier, setEditSupplier] = useState(
    activity?.supplierName && activity.supplierName !== '—'
      ? activity.supplierName
      : '',
  )
  const [editNotes, setEditNotes] = useState('')
  const [editError, setEditError] = useState('')
  const [editPendingPhotos, setEditPendingPhotos] = useState<
    EvidenceAttachment[]
  >([])
  const [submittedToSpecialistNotice, setSubmittedToSpecialistNotice] =
    useState(false)

  // Preview modal for Invoice Photo / SAP Screenshot / Matrix
  const [previewAttachment, setPreviewAttachment] =
    useState<EvidenceAttachment | null>(null)

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

  const matrix = activity.matrix ?? getDefaultMatrix()
  const attachments = activity.attachments ?? []

  function handleSpecialistApprove() {
    if (!activity) return
    const calc =
      activity.calculation ?? createDemoCalculation(activity.consumptionValue)
    const specialistName = currentUser.name ?? 'Çevre / Karbon Uzmanı'

    const updated = updateActivity(activity.id, {
      status: 'VALIDATED',
      calculation: calc,
      errorMessage: '',
      revisionReason: '',
      validatedBy: `${specialistName} (Çevre / Karbon Uzmanı)`,
      validatedAt: new Date().toLocaleString('tr-TR'),
    })

    addManagerFeedback({
      targetType: 'ACTIVITY',
      targetId: String(activity.id),
      targetTitle: `Uzman Onayı Tamamlandı: ${activity.facility} · ${activity.period} (${activity.consumption})`,
      message: `#${activity.id} numaralı doğalgaz faaliyet kaydı, kanıt görselleri ve karbon matrisi (${calc.totalKgCo2e}) Çevre / Karbon Uzmanı tarafından kontrol edilerek onaylandı.`,
      createdBy: specialistName,
      senderRole: 'Çevre / Karbon Uzmanı',
      senderTenantRole: 'CARBON_SPECIALIST',
    })

    setActivity(updated)
    setEditOpen(false)
  }

  function formatEditedPeriod(start: string, end: string) {
    if (!start || !end) return activity?.period ?? ''
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
    return `${startDate.toLocaleDateString('tr-TR')} – ${endDate.toLocaleDateString('tr-TR')}`
  }

  function openEditForm() {
    if (!activity) return
    setEditAssessmentId(activity.assessmentId)
    setEditFacilityId(activity.facilityId)
    setEditPeriodStart(activity.periodStart)
    setEditPeriodEnd(activity.periodEnd)
    setEditConsumption(String(activity.consumptionValue))
    setEditSourceType(activity.sourceType)
    setEditReference(activity.sourceReference)
    setEditSupplier(
      activity.supplierName && activity.supplierName !== '—'
        ? activity.supplierName
        : '',
    )
    setEditNotes('')
    setEditError('')
    setEditPendingPhotos([])
    setEditOpen(true)
  }

  function handleEditPhotoSelect(event: ChangeEvent<HTMLInputElement>) {
    if (!activity) return
    const files = event.target.files
    if (!files || files.length === 0) return

    Array.from(files).forEach((file) => {
      const reader = new FileReader()
      reader.onload = () => {
        const dataUrl =
          typeof reader.result === 'string' ? reader.result : undefined
        const photoItem: EvidenceAttachment = {
          id: `att-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
          kind:
            editSourceType === 'Kurumsal Sistem'
              ? 'SAP_SCREENSHOT'
              : editSourceType === 'Sayaç'
                ? 'METER_PHOTO'
                : 'INVOICE_PHOTO',
          title: `Güncelleme Kanıt Fotoğrafı (${editSourceType})`,
          fileName: file.name,
          uploadedBy: currentUser.name ?? 'Uzman / Veri Sorumlusu',
          uploadedAt: new Date().toLocaleString('tr-TR'),
          documentCode: editReference.trim() || activity.sourceReference,
          imageDataUrl: dataUrl,
        }
        setEditPendingPhotos((prev) => [photoItem, ...prev])
      }
      reader.readAsDataURL(file)
    })

    event.target.value = ''
  }

  function handleSaveUpdate() {
    if (!activity || !canEditData) return
    setEditError('')

    const nextVal = Number(editConsumption)
    if (!Number.isFinite(nextVal) || nextVal <= 0) {
      setEditError('Lütfen geçerli bir tüketim miktarı (m³) girin.')
      return
    }
    if (!editPeriodStart || !editPeriodEnd || editPeriodStart > editPeriodEnd) {
      setEditError(
        'Lütfen geçerli bir tüketim dönemi başlangıç ve bitiş tarihi girin.',
      )
      return
    }
    if (!editNotes.trim()) {
      setEditError(
        'Her güncellemede açıklama / kontrol notu eklemek zorunludur. Lütfen yaptığınız değişikliği açıklayın.',
      )
      return
    }

    const facilityMap: Record<string, string> = {
      bucak: 'Bucak',
      'burdur-merkez': 'Burdur Merkez',
    }
    const matchedAssessment = assessments.find((a) => a.id === editAssessmentId)

    const newCalc = createDemoCalculation(nextVal)
    const nextStatus: ActivityStatus = isSpecialist
      ? 'VALIDATED'
      : 'PENDING_REVIEW'

    const mergedAttachments =
      editPendingPhotos.length > 0
        ? [...editPendingPhotos, ...(activity.attachments ?? [])]
        : activity.attachments

    const updated = updateActivity(activity.id, {
      assessmentId: editAssessmentId || activity.assessmentId,
      assessmentName: matchedAssessment?.name ?? activity.assessmentName,
      facilityId: editFacilityId,
      facility: facilityMap[editFacilityId] ?? activity.facility,
      periodStart: editPeriodStart,
      periodEnd: editPeriodEnd,
      period: formatEditedPeriod(editPeriodStart, editPeriodEnd),
      consumptionValue: nextVal,
      consumption: `${nextVal.toLocaleString('tr-TR')} m³`,
      sourceType: editSourceType || activity.sourceType,
      sourceReference: editReference.trim() || activity.sourceReference,
      supplierName: editSupplier.trim() || '—',
      notes: editNotes.trim(),
      attachments: mergedAttachments,
      calculation: newCalc,
      status: nextStatus,
      errorMessage: '',
      revisionReason: '',
      ...(isSpecialist
        ? {
            validatedBy: `${currentUser.name ?? 'Çevre / Karbon Uzmanı'} (Çevre / Karbon Uzmanı)`,
            validatedAt: new Date().toLocaleString('tr-TR'),
          }
        : {}),
    })

    if (isDataEntry && updated) {
      addManagerFeedback({
        targetType: 'ACTIVITY',
        targetId: String(updated.id),
        targetTitle: `Güncellenen Veri & Matris: ${updated.facility} · ${updated.period} (${updated.consumption})`,
        message: `${editNotes.trim()} (${newCalc.totalKgCo2e})`,
        createdBy: currentUser.name ?? 'Veri ve Operasyon Sorumlusu',
        senderRole: 'Veri ve Operasyon Sorumlusu',
        senderTenantRole: 'DATA_ENTRY',
      })
      setSubmittedToSpecialistNotice(true)
    }

    setActivity(updated)
    setEditPendingPhotos([])
    setEditNotes('')
    setEditOpen(false)
  }

  function handleUploadEvidenceOnDetail(
    event: ChangeEvent<HTMLInputElement>,
    kind: EvidenceKind,
  ) {
    if (!activity) return
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
              ? 'Yüklenen Doğalgaz Fatura Görseli'
              : kind === 'SAP_SCREENSHOT'
                ? 'Yüklenen SAP ERP Ekran Görüntüsü'
                : 'Yüklenen Karbon Matrisi / Kanıt Belgesi',
          fileName: file.name,
          uploadedBy: currentUser.name ?? 'Mehmet Kaya',
          uploadedAt: new Date().toLocaleString('tr-TR'),
          documentCode: activity.sourceReference || 'BELGE-2026',
          imageDataUrl: dataUrl,
        }
        const currentList = getActivity(activity.id)?.attachments ?? []
        const updated = updateActivity(activity.id, {
          attachments: [newAtt, ...currentList],
        })
        setActivity(updated)
      }
      reader.readAsDataURL(file)
    })

    event.target.value = ''
  }

  function handleSendToSpecialistControl() {
    if (!activity) return
    const sender = currentUser.name ?? 'Mehmet Kaya'
    addManagerFeedback({
      targetType: 'ACTIVITY',
      targetId: String(activity.id),
      targetTitle: `Kontrol Sunumu: ${activity.facility} · ${activity.period} (${activity.consumption})`,
      message: `${sender}, #${activity.id} numaralı doğalgaz kaydının fatura fotoğrafı, SAP görüntüsü ve karbon hesaplama matrisini (${activity.calculation?.totalKgCo2e ?? '—'}) kontrol ve onayınız için gönderdi.`,
      createdBy: sender,
      senderRole: 'Veri ve Operasyon Sorumlusu',
    })
    setSubmittedToSpecialistNotice(true)
  }

  function handleManagerSendFeedback() {
    if (!activity) return
    if (!feedbackText.trim()) {
      window.alert(
        'Lütfen çevre uzmanına iletilecek kontrol veya güncelleme notunuzu yazın.',
      )
      return
    }

    const nowStr = new Date().toLocaleString('tr-TR')
    const managerName = currentUser.name ?? 'Şirket Yöneticisi'

    const updated = updateActivity(activity.id, {
      status: 'REVISION_REQUESTED',
      revisionReason: feedbackText.trim(),
      feedbackBy: managerName,
      feedbackAt: nowStr,
    })

    addManagerFeedback({
      targetType: 'ACTIVITY',
      targetId: String(activity.id),
      targetTitle: `${activity.facility} · ${activity.period} (${activity.consumption})`,
      message: feedbackText.trim(),
      createdBy: managerName,
      senderRole: 'Şirket Yöneticisi',
    })

    setActivity(updated)
    setFeedbackText('')
    setFeedbackSentNotice(true)
  }

  const canCreatePdf =
    activity.status === 'VALIDATED' && Boolean(activity.calculation)

  const docCode = `KAI-2026-${String(activity.id).padStart(4, '0')}`
  const qrPayload = `BELGE:${docCode}|KURUM:${activity.tenantName}|TESIS:${activity.facility}|DONEM:${activity.period}|TUKETIM:${activity.consumptionValue}m3|EMISYON:${activity.calculation?.totalKgCo2e ?? '0'}`
  const cleanValidatorName = (
    activity.validatedBy ?? 'Ayşe Yılmaz'
  ).replace(/\s*\(.*?\)/g, '')

  return (
    <section className="activity-detail-page">
      {/* Screen-Only Interactive View */}
      <div className="screen-only-view">
        <div className="detail-top-bar">
          <Link className="detail-back-link" to="/activities">
            <ArrowLeft size={16} />
            <span>Faaliyet Listesine Dön</span>
          </Link>
        </div>

        <div className="detail-header">
        <div>
          <p className="breadcrumb">
            Faaliyetler / Doğalgaz / Kayıt #{activity.id}
          </p>
          <h1>Doğalgaz Faaliyet, Kanıt ve Matris Detayı</h1>
          <p className="page-description">
            Kapsam 1 · Sabit Yanma · Birim: kgCO₂e
          </p>
        </div>

        <span
          className={`detail-status status-${statusClass(activity.status)}`}
        >
          {statusLabels[activity.status]}
        </span>
      </div>

      {submittedToSpecialistNotice && (
        <div className="feedback-success-banner" style={{ marginBottom: 18 }}>
          <CheckCircle2 size={17} />
          <span>
            Kayıt, kanıt görselleri ve karbon hesaplama matrisi Çevre Uzmanı
            (Ayşe Yılmaz) bildirim merkezine iletildi.
          </span>
        </div>
      )}

      {/* Error Alert if Failed */}
      {activity.status === 'FAILED' && (
        <div className="calculation-error">
          <div className="notice-header">
            <AlertTriangle size={18} />
            <strong>
              Hesaplama tamamlanamadı — Matris veya Veri Güncellemesi Gerekli
            </strong>
          </div>
          <p>{activity.errorMessage}</p>
          {canEditData && !editOpen && (
            <button
              type="button"
              className="inline-fix-btn"
              onClick={openEditForm}
            >
              <RefreshCw size={15} />
              <span>
                {isSpecialist
                  ? 'Matrisi Eşleştir, Yeniden Hesapla ve Onayla'
                  : 'Veriyi Düzenle ve Uzman Kontrolüne Gönder'}
              </span>
            </button>
          )}
        </div>
      )}

      {/* Manager Feedback / Revision Notice */}
      {activity.status === 'REVISION_REQUESTED' && (
        <div className="revision-notice">
          <div className="notice-header">
            <MessageSquareWarning size={18} />
            <strong>
              Kontrol / Güncelleme Talebi
              {activity.feedbackBy ? ` (${activity.feedbackBy})` : ''}
            </strong>
          </div>
          <p>{activity.revisionReason}</p>
          {activity.feedbackAt && (
            <small className="notice-meta">
              Talep tarihi: {activity.feedbackAt}
            </small>
          )}
        </div>
      )}

      {/* Data Entry / Specialist Inline Update & Recalculate Card */}
      {canEditData && editOpen && (
        <div className="specialist-edit-card">
          <div className="specialist-edit-header">
            <Edit3 size={18} />
            <div>
              <h2>
                {isSpecialist
                  ? 'Çevre Uzmanı Veri Güncelleme & Yeniden Hesaplama'
                  : 'Veri ve Operasyon Sorumlusu Kayıt & Matris Güncelleme'}
              </h2>
              <p>
                Tüketim miktarını veya fatura/SAP referans bilgisini güncelleyip
                kgCO₂e hesabını yenileyebilirsiniz.
              </p>
            </div>
          </div>

          <div className="specialist-edit-grid">
            <label>
              <span>Değerlendirme Dönemi *</span>
              <select
                value={editAssessmentId}
                onChange={(e) => setEditAssessmentId(e.target.value)}
              >
                {assessments.map((a) => (
                  <option key={a.id} value={a.id}>
                    {a.name}
                  </option>
                ))}
              </select>
            </label>

            <label>
              <span>Tesis *</span>
              <select
                value={editFacilityId}
                onChange={(e) => setEditFacilityId(e.target.value)}
              >
                <option value="bucak">Bucak</option>
                <option value="burdur-merkez">Burdur Merkez</option>
              </select>
            </label>

            <label>
              <span>Dönem Başlangıç Tarihi *</span>
              <input
                type="date"
                value={editPeriodStart}
                onChange={(e) => setEditPeriodStart(e.target.value)}
              />
            </label>

            <label>
              <span>Dönem Bitiş Tarihi *</span>
              <input
                type="date"
                value={editPeriodEnd}
                onChange={(e) => setEditPeriodEnd(e.target.value)}
              />
            </label>

            <label>
              <span>Tüketim Miktarı (m³) *</span>
              <input
                type="number"
                min="1"
                value={editConsumption}
                onChange={(e) => setEditConsumption(e.target.value)}
              />
            </label>

            <label>
              <span>Veri Kaynağı *</span>
              <select
                value={editSourceType}
                onChange={(e) => setEditSourceType(e.target.value)}
              >
                <option value="Fatura">Fatura</option>
                <option value="Sayaç">Sayaç</option>
                <option value="Kurumsal Sistem">Kurumsal Sistem (SAP)</option>
                <option value="Manuel Giriş">Manuel Giriş</option>
                <option value="Diğer">Diğer</option>
              </select>
            </label>

            <label>
              <span>Kaynak Referansı (Fatura / SAP / Sayaç) *</span>
              <input
                type="text"
                value={editReference}
                onChange={(e) => setEditReference(e.target.value)}
              />
            </label>

            <label>
              <span>Tedarikçi</span>
              <input
                type="text"
                placeholder="Örn. BOTAŞ"
                value={editSupplier}
                onChange={(e) => setEditSupplier(e.target.value)}
              />
            </label>

            <label className="full-col">
              <span>Güncelleme Açıklama / Kontrol Notu * (Zorunlu)</span>
              <textarea
                rows={2}
                required
                placeholder="Örn: BOTAŞ faturasındaki güncel m³ değeri ve belge numarası düzeltilip yeni fatura fotoğrafı eklendi..."
                value={editNotes}
                onChange={(e) => {
                  setEditNotes(e.target.value)
                  if (editError) setEditError('')
                }}
              />
            </label>

            <div className="full-col edit-photo-upload-box">
              <div className="edit-photo-upload-head">
                <div>
                  <strong>Güncelleme Fotoğrafı / Kanıt Görseli Ekle</strong>
                  <small>
                    Yeni fatura fotoğrafı, sayaç görüntüsü veya SAP ekran
                    görüntüsü yükleyebilirsiniz.
                  </small>
                </div>
                <label className="edit-photo-pick-btn">
                  <input
                    type="file"
                    accept="image/*,.pdf"
                    multiple
                    onChange={handleEditPhotoSelect}
                  />
                  <Upload size={14} />
                  <span>Fotoğraf / Belge Seç</span>
                </label>
              </div>

              {editPendingPhotos.length > 0 && (
                <div className="edit-pending-photos-list">
                  {editPendingPhotos.map((ph) => (
                    <div key={ph.id} className="edit-pending-photo-chip">
                      {ph.imageDataUrl ? (
                        <img src={ph.imageDataUrl} alt={ph.fileName} />
                      ) : (
                        <FileImage size={15} />
                      )}
                      <span>{ph.fileName}</span>
                      <button
                        type="button"
                        onClick={() =>
                          setEditPendingPhotos((prev) =>
                            prev.filter((item) => item.id !== ph.id),
                          )
                        }
                        aria-label="Kaldır"
                      >
                        <X size={13} />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {editError && (
            <div className="edit-form-error" role="alert">
              <AlertTriangle size={15} />
              <span>{editError}</span>
            </div>
          )}

          <div className="specialist-edit-actions">
            <button
              type="button"
              className="secondary-button"
              onClick={() => setEditOpen(false)}
            >
              Vazgeç
            </button>
            <button
              type="button"
              className="primary-button"
              onClick={handleSaveUpdate}
            >
              <CheckCircle2 size={16} />
              <span>
                {isSpecialist
                  ? 'Güncelle, Hesapla ve Onayla'
                  : 'Güncelle ve Uzman Kontrolüne Gönder'}
              </span>
            </button>
          </div>
        </div>
      )}

      {/* Activity Details Card */}
      <div className="detail-card">
        <div className="detail-card-top">
          <h2>Faaliyet Bilgileri</h2>
          {canEditData && !editOpen && (
            <button
              type="button"
              className="edit-toggle-btn"
              onClick={openEditForm}
            >
              <Edit3 size={14} />
              <span>Kaydı Düzenle / Yeniden Hesapla</span>
            </button>
          )}
        </div>

        <dl className="detail-grid">
          <div>
            <dt>Değerlendirme</dt>
            <dd>{activity.assessmentName}</dd>
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
            <dt>Sisteme İşleyen</dt>
            <dd>{activity.enteredBy}</dd>
          </div>
          <div>
            <dt>Kayıt Tarihi</dt>
            <dd>{activity.enteredAt}</dd>
          </div>
          {activity.validatedBy && (
            <div>
              <dt>Kontrol ve Onaylayan</dt>
              <dd>{activity.validatedBy}</dd>
            </div>
          )}
          {activity.validatedAt && (
            <div>
              <dt>Onay Tarihi</dt>
              <dd>{activity.validatedAt}</dd>
            </div>
          )}
          {activity.notes && (
            <div>
              <dt>Son Güncelleme / Kontrol Notu</dt>
              <dd>{activity.notes}</dd>
            </div>
          )}
        </dl>
      </div>

      {/* Uploaded Evidence Photos & SAP Screenshots Card */}
      <div className="detail-card">
        <div className="detail-card-top">
          <div>
            <h2 style={{ marginBottom: 4 }}>
              Kanıt Görselleri ve Belgeleri (Fatura Fotoğrafı & SAP Görüntüsü)
            </h2>
            <p className="card-sub-desc">
              Veri sorumlusu tarafından sisteme yüklenen fatura fotoğrafları,
              SAP ERP ekran görüntüleri ve hesaplama matrisi dosyaları.
            </p>
          </div>

          {canEditData && (
            <div className="detail-upload-actions">
              <label className="detail-upload-btn">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) =>
                    handleUploadEvidenceOnDetail(e, 'INVOICE_PHOTO')
                  }
                />
                <Upload size={14} />
                <span>+ Fatura Fotoğrafı Ekle</span>
              </label>

              <label className="detail-upload-btn">
                <input
                  type="file"
                  accept="image/*,.pdf"
                  multiple
                  onChange={(e) =>
                    handleUploadEvidenceOnDetail(e, 'SAP_SCREENSHOT')
                  }
                />
                <Monitor size={14} />
                <span>+ SAP Görüntüsü Ekle</span>
              </label>
            </div>
          )}
        </div>

        <div className="evidence-cards-grid">
          {attachments.map((att) => (
            <article key={att.id} className="evidence-item-card">
              <div className="evidence-item-head">
                {att.imageDataUrl ? (
                  <img
                    src={att.imageDataUrl}
                    alt={att.title}
                    className="evidence-mini-img"
                  />
                ) : (
                  <span className="evidence-kind-icon">
                    {att.kind === 'SAP_SCREENSHOT' ? (
                      <Monitor size={19} />
                    ) : att.kind === 'MATRIX_SHEET' ? (
                      <FileSpreadsheet size={19} />
                    ) : (
                      <FileImage size={19} />
                    )}
                  </span>
                )}
                <div className="evidence-item-titles">
                  <strong>{att.title}</strong>
                  <code>{att.fileName}</code>
                </div>
              </div>

              <div className="evidence-item-footer">
                <small>
                  Yükleyen: {att.uploadedBy} · {att.uploadedAt}
                </small>
                <button
                  type="button"
                  className="evidence-preview-btn"
                  onClick={() => setPreviewAttachment(att)}
                >
                  <Eye size={14} />
                  <span>Görseli / Belgeyi Aç</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>

      {/* Document / Photo Lightbox Preview Modal */}
      {previewAttachment && (
        <div
          className="evidence-modal-backdrop"
          onClick={() => setPreviewAttachment(null)}
        >
          <div
            className="evidence-modal-window"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="evidence-modal-header">
              <div>
                <strong>{previewAttachment.title}</strong>
                <span>
                  {previewAttachment.fileName} · Yükleyen:{' '}
                  {previewAttachment.uploadedBy}
                </span>
              </div>
              <button
                type="button"
                className="modal-close-btn"
                onClick={() => setPreviewAttachment(null)}
              >
                <X size={18} />
              </button>
            </div>

            <div className="evidence-modal-body">
              {previewAttachment.imageDataUrl ? (
                <img
                  src={previewAttachment.imageDataUrl}
                  alt={previewAttachment.title}
                  className="uploaded-full-preview-img"
                />
              ) : previewAttachment.kind === 'SAP_SCREENSHOT' ? (
                <div className="simulated-sap-screen">
                  <div className="sap-top-bar">
                    <span>SAP Easy Access — Malzeme Belgesi Görüntüle (MB03 / MIGO)</span>
                    <code>Belge No: {previewAttachment.documentCode}</code>
                  </div>
                  <div className="sap-grid-body">
                    <div>
                      <small>Şirket Kodu</small>
                      <strong>1000 — E&M Akü Sanayi A.Ş.</strong>
                    </div>
                    <div>
                      <small>Üretim Yeri / Tesis</small>
                      <strong>{activity.facility} Üretim Tesisi</strong>
                    </div>
                    <div>
                      <small>Malzeme / Enerji Türü</small>
                      <strong>NG-01 — Sanayi Doğalgazı (Kapsam 1)</strong>
                    </div>
                    <div>
                      <small>Kayıt Dönemi</small>
                      <strong>{activity.period}</strong>
                    </div>
                    <div>
                      <small>Miktar ve Birim</small>
                      <strong>{activity.consumption}</strong>
                    </div>
                    <div>
                      <small>SAP Durumu</small>
                      <strong className="sap-ok">ONAYLANDI — MUHASEBELEŞTİ</strong>
                    </div>
                  </div>
                </div>
              ) : previewAttachment.kind === 'MATRIX_SHEET' ? (
                <div className="simulated-matrix-sheet">
                  <div className="matrix-sheet-head">
                    <strong>
                      KAPSAM 1 SABİT YANMA KARBON HESAPLAMA MATRİSİ ({matrix.matrixCode})
                    </strong>
                  </div>
                  <table className="matrix-preview-table">
                    <thead>
                      <tr>
                        <th>Parametre</th>
                        <th>Değer</th>
                        <th>Standart Referans</th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td>Faaliyet Tüketimi</td>
                        <td>{activity.consumption}</td>
                        <td>Fatura / Sayaç / SAP</td>
                      </tr>
                      <tr>
                        <td>Alt Isıl Değer (NCV)</td>
                        <td>{matrix.ncvMjPerM3}</td>
                        <td>IPCC 2006 / 2024 Tablo 1.2</td>
                      </tr>
                      <tr>
                        <td>Oksidasyon Faktörü</td>
                        <td>{matrix.oxidationFactor}</td>
                        <td>GHG Protocol V2.0</td>
                      </tr>
                      <tr>
                        <td>Birim Enerji Dönüşümü</td>
                        <td>{matrix.kwhPerM3}</td>
                        <td>BOTAŞ Referans Değeri</td>
                      </tr>
                      <tr>
                        <td>CO₂ / CH₄ / N₂O Katsayıları</td>
                        <td>
                          {matrix.co2KgPerTj} · {matrix.ch4KgPerTj} ·{' '}
                          {matrix.n2oKgPerTj}
                        </td>
                        <td>IPCC AR5 GWP (1 / 28 / 265)</td>
                      </tr>
                      <tr>
                        <td>
                          <strong>Hesaplanan Toplam Emisyon</strong>
                        </td>
                        <td>
                          <strong>
                            {activity.calculation?.totalKgCo2e ?? '—'}
                          </strong>
                        </td>
                        <td>ISO 14064-1 Doğrulanabilir</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              ) : (
                <div className="simulated-invoice-doc">
                  <div className="invoice-doc-head">
                    <div>
                      <strong>{activity.supplierName !== '—' ? activity.supplierName : 'BOTAŞ'} DOĞALGAZ FATURASI SURETİ</strong>
                      <span>Resmi Tüketim ve Sayaç Belgesi</span>
                    </div>
                    <code>Fatura No: {previewAttachment.documentCode}</code>
                  </div>
                  <div className="invoice-doc-grid">
                    <div>
                      <small>Abone / Kurum</small>
                      <strong>{activity.tenantName} — {activity.facility} Tesisi</strong>
                    </div>
                    <div>
                      <small>Fatura Dönemi</small>
                      <strong>{activity.period}</strong>
                    </div>
                    <div>
                      <small>Fiili Doğalgaz Tüketimi</small>
                      <strong>{activity.consumption}</strong>
                    </div>
                    <div>
                      <small>Üst / Alt Isıl Değer</small>
                      <strong>{matrix.ncvMjPerM3} ({matrix.kwhPerM3})</strong>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Carbon Calculation Matrix Card */}
      <div className="detail-card">
        <div className="detail-card-top">
          <h2>
            <Calculator
              size={18}
              style={{ verticalAlign: 'middle', marginRight: 8, color: '#158055' }}
            />
            Karbon Hesaplama Matrisi ({matrix.matrixCode})
          </h2>
        </div>

        <dl className="detail-grid">
          <div>
            <dt>Alt Isıl Değer (NCV)</dt>
            <dd>{matrix.ncvMjPerM3}</dd>
          </div>
          <div>
            <dt>Oksidasyon Faktörü</dt>
            <dd>{matrix.oxidationFactor}</dd>
          </div>
          <div>
            <dt>Enerji Dönüşüm Katsayısı</dt>
            <dd>{matrix.kwhPerM3}</dd>
          </div>
          <div>
            <dt>CO₂ Matris Katsayısı</dt>
            <dd>{matrix.co2KgPerTj}</dd>
          </div>
          <div>
            <dt>CH₄ Matris Katsayısı (GWP: 28)</dt>
            <dd>{matrix.ch4KgPerTj}</dd>
          </div>
          <div>
            <dt>N₂O Matris Katsayısı (GWP: 265)</dt>
            <dd>{matrix.n2oKgPerTj}</dd>
          </div>
        </dl>
      </div>

      {/* Calculation & Gas Breakdown (Strictly in kgCO₂e) */}
      {activity.calculation && (
        <>
          <div className="detail-card">
            <h2>Sera Gazı Kırılımı (kgCO₂e)</h2>
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
            <strong>{activity.calculation.totalKgCo2e}</strong>
            <p>
              Doğalgaz sabit yanma faaliyetinden kaynaklanan toplam sera gazı
              emisyonu (kgCO₂e)
            </p>
            <small>
              {activity.status === 'VALIDATED'
                ? `Bu kayıt Çevre Uzmanı (${activity.validatedBy ?? 'Ayşe Yılmaz'}) tarafından onaylanmıştır ve kurumsal rapora dahildir.`
                : 'Bu sonuç, Çevre Uzmanı (Ayşe Yılmaz) teknik kontrol ve onayını tamamlayana kadar nihai rapora dahil edilmez.'}
            </small>
          </div>
        </>
      )}

      {/* Company Admin Dedicated Feedback & Control Request Section */}
      {isCompanyAdmin && (
        <div className="manager-feedback-card">
          <div className="manager-feedback-header">
            <MessageSquareWarning size={20} />
            <div>
              <h2>Şirket Yöneticisi Geri Bildirim & Kontrol Talebi</h2>
              <p>
                Bu kayıtta bir hata, tutarsızlık veya eksik belge olduğunu
                düşünüyorsanız Çevre Uzmanı Ayşe Yılmaz&apos;a doğrudan kontrol
                veya güncelleme talebi iletebilirsiniz.
              </p>
            </div>
          </div>

          {feedbackSentNotice && (
            <div className="feedback-success-banner">
              <CheckCircle2 size={16} />
              <span>
                Kontrol ve güncelleme talebiniz Çevre Uzmanı Ayşe Yılmaz&apos;ın
                iş listesine iletildi.
              </span>
            </div>
          )}

          <div className="manager-feedback-form">
            <textarea
              rows={3}
              value={feedbackText}
              placeholder="Örn: Bu dönemin doğalgaz tüketim miktarı veya fatura referansı yeniden kontrol edilmeli..."
              onChange={(event) => {
                setFeedbackText(event.target.value)
                if (feedbackSentNotice) setFeedbackSentNotice(false)
              }}
            />
            <div className="manager-feedback-actions">
              <button
                type="button"
                className="manager-request-btn"
                onClick={handleManagerSendFeedback}
              >
                <Send size={15} />
                <span>Çevre Uzmanından Kontrol / Güncelleme İste</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Bottom Action Bar */}
      <div className="detail-actions">
        <Link className="secondary-button" to="/activities">
          Listeye Dön
        </Link>

        <button
          className="secondary-button"
          type="button"
          disabled={!canCreatePdf}
          title={
            canCreatePdf
              ? 'Bu kaydın çıktısını PDF olarak al'
              : 'Yalnızca Çevre Uzmanı tarafından onaylanmış kayıtlar PDF olarak kaydedilebilir'
          }
          onClick={() => window.print()}
        >
          <FileDown size={16} />
          <span>PDF Çıktısı Al</span>
        </button>

        {/* Data Entry Employee Action: Send to Specialist Control */}
        {isDataEntry && activity.status !== 'VALIDATED' && (
          <button
            className="primary-button"
            type="button"
            onClick={handleSendToSpecialistControl}
          >
            <Send size={16} />
            <span>Çevre / Karbon Uzmanı Kontrolüne Gönder</span>
          </button>
        )}

        {/* Specialist Approval Action */}
        {isSpecialist && activity.status !== 'VALIDATED' && (
          <button
            className="primary-button"
            type="button"
            onClick={handleSpecialistApprove}
          >
            <ShieldCheck size={17} />
            <span>Kaydı, Kanıtları ve Matrisi Onayla (Çevre Uzmanı)</span>
          </button>
        )}

        {isCompanyAdmin && activity.status !== 'VALIDATED' && (
          <span className="permission-message">
            Bu kayıt Çevre / Karbon Uzmanı tarafından kontrol ve onay bekliyor.
          </span>
        )}
      </div>
      </div>

      {/* Standardized 1-Page A4 Corporate Print Certificate */}
      <article className="a4-official-certificate" aria-label="Kurumsal A4 Faaliyet ve Emisyon Belgesi">
        <header className="a4-cert-header">
          <div className="a4-cert-brand">
            <TenantBrandLogo tenantName={activity.tenantName} />
          </div>
          <div className="a4-cert-docmeta">
            <strong>KURUMSAL SERA GAZI FAALİYET VE HESAPLAMA BELGESİ</strong>
            <span>ISO 14064-1 · Kapsam 1 · Sabit Yanma Doğalgaz Envanteri</span>
            <div className="a4-cert-codes">
              <span>Belge No: KAI-2026-{String(activity.id).padStart(4, '0')}</span>
              <span>Durum: {statusLabels[activity.status]}</span>
              <span>Tarih: {new Date().toLocaleDateString('tr-TR')}</span>
            </div>
          </div>
        </header>

        <section className="a4-cert-section">
          <h3>1. KURUM, TESİS VE FAALİYET BİLGİLERİ</h3>
          <table className="a4-cert-table a4-kv-table">
            <tbody>
              <tr>
                <th>Kurum / Şirket</th>
                <td>{activity.tenantName}</td>
                <th>Üretim Tesisi</th>
                <td>{activity.facility}</td>
              </tr>
              <tr>
                <th>Değerlendirme Dönemi</th>
                <td>{activity.assessmentName}</td>
                <th>Tüketim Dönemi</th>
                <td>{activity.period}</td>
              </tr>
              <tr>
                <th>Fiili Tüketim Miktarı</th>
                <td><strong>{activity.consumption}</strong></td>
                <th>Veri Kaynağı & Referans</th>
                <td>{activity.sourceType} ({activity.sourceReference})</td>
              </tr>
              <tr>
                <th>Tedarikçi Kurum</th>
                <td>{activity.supplierName}</td>
                <th>Sisteme İşleyen / Tarih</th>
                <td>{activity.enteredBy} · {activity.enteredAt}</td>
              </tr>
              <tr>
                <th>Çevre Uzmanı Onayı</th>
                <td>{activity.validatedBy ?? 'Onay Bekliyor'}</td>
                <th>Onay Tarihi</th>
                <td>{activity.validatedAt ?? '—'}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="a4-cert-section">
          <h3>2. KARBON HESAPLAMA MATRİSİ PARAMETRELERİ ({matrix.matrixCode})</h3>
          <table className="a4-cert-table">
            <thead>
              <tr>
                <th>Alt Isıl Değer (NCV)</th>
                <th>Oksidasyon Faktörü</th>
                <th>Dönüşüm Katsayısı</th>
                <th>CO₂ Katsayısı</th>
                <th>CH₄ Katsayısı (GWP:28)</th>
                <th>N₂O Katsayısı (GWP:265)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>{matrix.ncvMjPerM3}</td>
                <td>{matrix.oxidationFactor}</td>
                <td>{matrix.kwhPerM3}</td>
                <td>{matrix.co2KgPerTj}</td>
                <td>{matrix.ch4KgPerTj}</td>
                <td>{matrix.n2oKgPerTj}</td>
              </tr>
            </tbody>
          </table>
        </section>

        <section className="a4-cert-section">
          <h3>3. DOĞRULANMIŞ KANIT BELGELERİ (FATURA, SAP GÖRÜNTÜSÜ VE MATRİS)</h3>
          <table className="a4-cert-table">
            <thead>
              <tr>
                <th>Belge Türü ve Başlığı</th>
                <th>Dosya Adı</th>
                <th>Referans Kodu</th>
                <th>Yükleyen ve Tarih</th>
              </tr>
            </thead>
            <tbody>
              {attachments.map((att) => (
                <tr key={att.id}>
                  <td>{att.title}</td>
                  <td>{att.fileName}</td>
                  <td>{att.documentCode}</td>
                  <td>{att.uploadedBy} · {att.uploadedAt}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>

        {activity.calculation && (
          <section className="a4-cert-section">
            <h3>4. SERA GAZI KIRILIMI VE TOPLAM EMİSYON SONUCU (kgCO₂e)</h3>
            <div className="a4-emission-summary-row">
              <div className="a4-gas-box">
                <span>CO₂ Katkısı</span>
                <strong>{activity.calculation.co2eFromCo2}</strong>
              </div>
              <div className="a4-gas-box">
                <span>CH₄ Katkısı</span>
                <strong>{activity.calculation.co2eFromCh4}</strong>
              </div>
              <div className="a4-gas-box">
                <span>N₂O Katkısı</span>
                <strong>{activity.calculation.co2eFromN2o}</strong>
              </div>
              <div className="a4-gas-box a4-gas-total">
                <span>TOPLAM EMİSYON (kgCO₂e)</span>
                <strong>{activity.calculation.totalKgCo2e}</strong>
              </div>
            </div>
            <p className="a4-methodology-footnote">
              Metodoloji: {activity.calculation.emissionFactorSet} · {activity.calculation.gwpSet} · Birim: Kilogram CO₂ Eşdeğeri (kgCO₂e)
            </p>
          </section>
        )}

        <footer className="a4-cert-signatures">
          <div className="a4-sig-box">
            <span>ÇEVRE / KARBON UZMANI ONAYI</span>
            <strong>{cleanValidatorName}</strong>
          </div>
          <div className="a4-sig-box">
            <span>KURUMSAL STANDART KAYDI</span>
            <strong>{activity.tenantName}</strong>
          </div>
          <div className="a4-sig-qr-box">
            <DocumentQrCode value={qrPayload} codeLabel={docCode} size={58} />
          </div>
        </footer>
      </article>
    </section>
  )
}

export default ActivityDetailPage
