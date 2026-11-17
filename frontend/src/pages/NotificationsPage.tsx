import { useEffect, useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  Bell,
  Check,
  CheckCircle2,
  ChevronDown,
  Clock,
  FileSpreadsheet,
  Flame,
  MessageSquareReply,
  Trash2,
} from 'lucide-react'
import {
  deleteManagerFeedback,
  getCurrentUser,
  getIncomingAndResolvedNotifications,
  getReportOptionsForFeedback,
  getSentNotifications,
  resolveManagerFeedback,
} from '../services/activityStore'
import type { ManagerFeedbackItem } from '../services/activityStore'
import './NotificationsPage.css'

function NotificationsPage() {
  const currentUser = getCurrentUser()
  const isAdmin = currentUser.tenantRole === 'COMPANY_ADMIN'
  const isSpecialist = currentUser.tenantRole === 'CARBON_SPECIALIST'
  const isDataEntry = currentUser.tenantRole === 'DATA_ENTRY'

  const [incomingFeedbacks, setIncomingFeedbacks] = useState<
    ManagerFeedbackItem[]
  >(getIncomingAndResolvedNotifications)
  const [sentFeedbacks, setSentFeedbacks] = useState<ManagerFeedbackItem[]>(
    getSentNotifications,
  )
  const [filter, setFilter] = useState<'ALL' | 'OPEN' | 'RESOLVED' | 'SENT'>(
    'ALL',
  )
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})

  useEffect(() => {
    function syncFeedbacks() {
      setIncomingFeedbacks(getIncomingAndResolvedNotifications())
      setSentFeedbacks(getSentNotifications())
    }
    window.addEventListener('kai-feedback-updated', syncFeedbacks)
    return () => {
      window.removeEventListener('kai-feedback-updated', syncFeedbacks)
    }
  }, [])

  const openCount = incomingFeedbacks.filter((f) => !f.resolved).length
  const resolvedCount = incomingFeedbacks.filter((f) => f.resolved).length

  const filteredFeedbacks = useMemo(() => {
    if (filter === 'OPEN') return incomingFeedbacks.filter((f) => !f.resolved)
    if (filter === 'RESOLVED')
      return incomingFeedbacks.filter((f) => f.resolved)
    if (filter === 'SENT') return sentFeedbacks
    return incomingFeedbacks
  }, [incomingFeedbacks, sentFeedbacks, filter])

  function toggleExpand(id: string) {
    setExpandedId((prev) => (prev === id ? null : id))
  }

  function handleResolve(item: ManagerFeedbackItem) {
    const reply = replyTexts[item.id] ?? ''
    resolveManagerFeedback(item.id, reply)
    setIncomingFeedbacks(getIncomingAndResolvedNotifications())
    setSentFeedbacks(getSentNotifications())
  }

  function handleDelete(id: string) {
    deleteManagerFeedback(id)
    setIncomingFeedbacks(getIncomingAndResolvedNotifications())
    setSentFeedbacks(getSentNotifications())
    if (expandedId === id) {
      setExpandedId(null)
    }
  }

  return (
    <section className="notifications-page">
      <header className="notifications-header">
        <div>
          <h1>Bildirimler ve Kontrol Talepleri</h1>
          <p>
            {isAdmin
              ? 'Yalnızca Çevre / Karbon Uzmanı yetkisinden gelen bildirimleri ve uzman yanıtlarını görüntülersiniz.'
              : 'Çevre / Karbon Uzmanı, Veri ve Operasyon Sorumlusu ve Şirket Yöneticisi arasındaki tüm bildirim ve talepleri buradan yönetebilirsiniz.'}
          </p>
        </div>
      </header>

      {/* Summary KPI Row */}
      <div className="notif-kpi-grid" style={{ gridTemplateColumns: 'repeat(4, minmax(0, 1fr))' }}>
        <button
          type="button"
          className={`notif-kpi-card ${filter === 'ALL' ? 'active' : ''}`}
          onClick={() => setFilter('ALL')}
        >
          <span>Gelen & Tamamlanan</span>
          <strong>{incomingFeedbacks.length}</strong>
          <small>Size gelenler ve çözülenler</small>
        </button>

        <button
          type="button"
          className={`notif-kpi-card ${filter === 'OPEN' ? 'active' : ''}`}
          onClick={() => setFilter('OPEN')}
        >
          <span>Gelen Açık İstekler</span>
          <strong className="text-amber">{openCount}</strong>
          <small>İncelemenizi bekleyenler</small>
        </button>

        <button
          type="button"
          className={`notif-kpi-card ${filter === 'RESOLVED' ? 'active' : ''}`}
          onClick={() => setFilter('RESOLVED')}
        >
          <span>Tamamlananlar</span>
          <strong className="text-emerald">{resolvedCount}</strong>
          <small>Kontrolü tamamlananlar</small>
        </button>

        <button
          type="button"
          className={`notif-kpi-card ${filter === 'SENT' ? 'active' : ''}`}
          onClick={() => setFilter('SENT')}
        >
          <span>İletildi (Gönderdiklerim)</span>
          <strong>{sentFeedbacks.length}</strong>
          <small>Sizin gönderdiğiniz talepler</small>
        </button>
      </div>

      {/* Notifications / Requests Accordion List (Collapsed by default, expands on click) */}
      <div className="notif-list-card">
        <div className="notif-list-toolbar">
          <div className="notif-tabs" role="tablist">
            <button
              type="button"
              className={`notif-tab ${filter === 'ALL' ? 'active' : ''}`}
              onClick={() => setFilter('ALL')}
            >
              Gelenler & Tamamlananlar ({incomingFeedbacks.length})
            </button>
            <button
              type="button"
              className={`notif-tab ${filter === 'OPEN' ? 'active' : ''}`}
              onClick={() => setFilter('OPEN')}
            >
              Gelen Açık İstekler ({openCount})
            </button>
            <button
              type="button"
              className={`notif-tab ${filter === 'RESOLVED' ? 'active' : ''}`}
              onClick={() => setFilter('RESOLVED')}
            >
              Tamamlananlar ({resolvedCount})
            </button>
            <button
              type="button"
              className={`notif-tab ${filter === 'SENT' ? 'active' : ''}`}
              onClick={() => setFilter('SENT')}
            >
              İletildi ({sentFeedbacks.length})
            </button>
          </div>
        </div>

        {filteredFeedbacks.length > 0 ? (
          <div className="notif-items-stack">
            {filteredFeedbacks.map((item) => {
              const isExpanded = expandedId === item.id
              const isActivity = item.targetType === 'ACTIVITY'
              const resolvedReportOptions = !isActivity
                ? getReportOptionsForFeedback(item)
                : undefined

              return (
                <article
                  key={item.id}
                  className={`notif-item-card ${
                    item.resolved ? 'is-resolved' : 'is-open'
                  } ${isExpanded ? 'is-expanded' : ''}`}
                >
                  {/* Clickable Summary Row */}
                  <button
                    type="button"
                    className="notif-accordion-trigger"
                    onClick={() => toggleExpand(item.id)}
                    aria-expanded={isExpanded}
                  >
                    <div className="notif-item-title-group">
                      <span
                        className={`notif-type-icon ${
                          item.resolved ? 'resolved' : 'open'
                        }`}
                      >
                        {isActivity ? (
                          <Flame size={17} />
                        ) : (
                          <FileSpreadsheet size={17} />
                        )}
                      </span>
                      <div>
                        <div className="notif-title-line">
                          <strong>{item.targetTitle}</strong>
                          <span
                            className={`notif-status-badge ${
                              item.resolved ? 'resolved' : 'open'
                            }`}
                          >
                            {item.resolved ? (
                              <>
                                <CheckCircle2 size={12} />
                                <span>Tamamlandı</span>
                              </>
                            ) : (
                              <>
                                <Clock size={12} />
                                <span>İnceleme Bekliyor</span>
                              </>
                            )}
                          </span>
                        </div>
                        <small className="notif-meta">
                          Gönderen Yetki:{' '}
                          <strong>
                            {item.senderRole ?? 'Şirket Yöneticisi'}
                          </strong>{' '}
                          ({item.createdBy}) · {item.createdAt}
                        </small>
                      </div>
                    </div>

                    <div className="notif-trigger-right">
                      <span className="notif-click-hint">
                        {isExpanded ? 'Gizle' : 'Detayı Gör'}
                      </span>
                      <ChevronDown
                        size={18}
                        className={`notif-chevron ${isExpanded ? 'open' : ''}`}
                      />
                    </div>
                  </button>

                  {/* Expanded Body (Visible ONLY when clicked) */}
                  {isExpanded && (
                    <div className="notif-expanded-body">
                      {/* Sender Message Box */}
                      <div className="notif-message-bubble">
                        <span className="bubble-label">
                          {item.senderRole ?? 'GÖNDEREN'} MESAJI:
                        </span>
                        <p>{item.message}</p>
                      </div>

                      {/* Reply Display (if resolved) */}
                      {item.resolved && item.specialistReply && (
                        <div className="notif-reply-bubble">
                          <div className="reply-header">
                            <MessageSquareReply size={15} />
                            <strong>
                              Yanıt ({item.repliedBy ?? 'Çevre / Karbon Uzmanı'}
                              )
                            </strong>
                            {item.repliedAt && <small>· {item.repliedAt}</small>}
                          </div>
                          <p>{item.specialistReply}</p>
                        </div>
                      )}

                      {/* Action Box for Specialist or Data Entry */}
                      {!item.resolved && (isSpecialist || isDataEntry) && (
                        <div className="notif-specialist-action-bar">
                          <input
                            type="text"
                            placeholder="Yapılan işlem veya yanıt notunu yazın..."
                            value={replyTexts[item.id] ?? ''}
                            onChange={(e) =>
                              setReplyTexts((prev) => ({
                                ...prev,
                                [item.id]: e.target.value,
                              }))
                            }
                          />
                          <button
                            type="button"
                            className="notif-resolve-btn"
                            onClick={() => handleResolve(item)}
                          >
                            <Check size={15} />
                            <span>Yanıtla ve Tamamlandı İşaretle</span>
                          </button>
                        </div>
                      )}

                      <div className="notif-expanded-footer">
                        {isActivity ? (
                          <Link
                            to={`/activities/${item.targetId}`}
                            className="notif-goto-btn"
                          >
                            <span>İlgili Kaydı Aç</span>
                            <ArrowRight size={14} />
                          </Link>
                        ) : (
                          <Link
                            to="/reports/preview"
                            state={resolvedReportOptions}
                            className="notif-goto-btn"
                          >
                            <span>İlgili Raporu Aç</span>
                            <ArrowRight size={14} />
                          </Link>
                        )}

                        <button
                          type="button"
                          className="notif-delete-btn"
                          onClick={() => handleDelete(item.id)}
                          title="Bildirimi Sil"
                          aria-label="Bildirimi Sil"
                        >
                          <Trash2 size={15} />
                          <span>Bildirimi Sil</span>
                        </button>
                      </div>
                    </div>
                  )}
                </article>
              )
            })}
          </div>
        ) : (
          <div className="notif-empty-state">
            <Bell size={28} />
            <strong>Görüntülenecek bildirim veya talep bulunmuyor</strong>
            <p>
              Yetki grubunuza iletilen rapor ve faaliyet bildirimleri burada
              listelenir.
            </p>
          </div>
        )}
      </div>
    </section>
  )
}

export default NotificationsPage
