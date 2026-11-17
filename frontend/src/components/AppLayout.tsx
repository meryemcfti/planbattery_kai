import { useEffect, useRef, useState } from 'react'
import {
  Link,
  NavLink,
  Outlet,
  useLocation,
  useNavigate,
} from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Bell,
  CalendarRange,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardList,
  Clock,
  Compass,
  FileChartColumn,
  FileSpreadsheet,
  Flame,
  LayoutDashboard,
  LogOut,
  Menu,
  MessageSquareReply,
  Send,
  Settings,
  Trash2,
  X,
} from 'lucide-react'
import brandSymbol from '../assets/planbattery-symbol.svg'
import RoleOnboardingModal, {
  getOnboardingStorageKey,
} from './RoleOnboardingModal'
import { clearCorporateSession } from '../services/authStore'
import {
  deleteManagerFeedback,
  getIncomingAndResolvedNotifications,
  getReportOptionsForFeedback,
  getSentNotifications,
  getTenantLogo,
  resolveManagerFeedback,
} from '../services/activityStore'
import type { ManagerFeedbackItem } from '../services/activityStore'

type StoredUser = {
  name: string
  email: string
  role: string
  tenantName: string
  tenantRole?:
  | 'COMPANY_ADMIN'
  | 'CARBON_SPECIALIST'
  | 'DATA_ENTRY'
  | 'VIEWER'
}

const fallbackUser: StoredUser = {
  name: 'Kullanıcı',
  email: '',
  role: 'Kullanıcı',
  tenantName: 'Şirket',
  tenantRole: 'VIEWER',
}

function getStoredUser(): StoredUser {
  try {
    return JSON.parse(
      localStorage.getItem('kai_user') ?? '',
    ) as StoredUser
  } catch {
    return fallbackUser
  }
}

const icons = {
  home: LayoutDashboard,
  assessment: CalendarRange,
  activity: ClipboardList,
  report: FileChartColumn,
  settings: Settings,
  logout: LogOut,
}

type IconName = keyof typeof icons

function Icon({ name }: { name: IconName }) {
  const SelectedIcon = icons[name]

  return (
    <SelectedIcon
      className="nav-icon"
      strokeWidth={1.8}
      aria-hidden="true"
    />
  )
}

function AppLayout() {
  const navigate = useNavigate()
  const location = useLocation()
  const user = getStoredUser()
  const [collapsed, setCollapsed] = useState(
    localStorage.getItem('kai_sidebar_collapsed') === 'true',
  )
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  // Topbar dropdown states
  const [notifOpen, setNotifOpen] = useState(false)
  const [notifTab, setNotifTab] = useState<'INCOMING' | 'SENT'>('INCOMING')
  const [profileOpen, setProfileOpen] = useState(false)
  const [incomingNotifs, setIncomingNotifs] = useState<ManagerFeedbackItem[]>(
    getIncomingAndResolvedNotifications,
  )
  const [sentNotifs, setSentNotifs] = useState<ManagerFeedbackItem[]>(
    getSentNotifications,
  )
  const [expandedNotifId, setExpandedNotifId] = useState<string | null>(null)
  const [replyTexts, setReplyTexts] = useState<Record<string, string>>({})
  const [companyLogo, setCompanyLogo] = useState<string | null>(getTenantLogo)
  const [onboardingOpen, setOnboardingOpen] = useState<boolean>(() => {
    const role = user.tenantRole ?? 'COMPANY_ADMIN'
    return (
      localStorage.getItem(getOnboardingStorageKey(user.tenantName, role)) !==
      'true'
    )
  })
  const [onboardingTrigger, setOnboardingTrigger] = useState(0)

  const notifRef = useRef<HTMLDivElement>(null)
  const profileRef = useRef<HTMLDivElement>(null)

  const isAdmin = user.tenantRole === 'COMPANY_ADMIN'
  const isCarbonSpecialist = user.tenantRole === 'CARBON_SPECIALIST'
  const isDataEntry = user.tenantRole === 'DATA_ENTRY'
  const canAccessCarbonManagement =
    isAdmin || isCarbonSpecialist || isDataEntry
  const activitiesLabel = isDataEntry
    ? 'Veri & Matris Girişi'
    : 'Faaliyetler'

  const openNotifCount = incomingNotifs.filter((f) => !f.resolved).length
  const displayedPopoverNotifs =
    notifTab === 'INCOMING' ? incomingNotifs : sentNotifs

  useEffect(() => {
    localStorage.setItem('kai_sidebar_collapsed', String(collapsed))
  }, [collapsed])

  useEffect(() => {
    setMobileMenuOpen(false)
    setNotifOpen(false)
    setProfileOpen(false)
  }, [location.pathname])

  useEffect(() => {
    function syncFeedbacks() {
      setIncomingNotifs(getIncomingAndResolvedNotifications())
      setSentNotifs(getSentNotifications())
      setCompanyLogo(getTenantLogo())
    }
    syncFeedbacks()
    window.addEventListener('kai-feedback-updated', syncFeedbacks)
    window.addEventListener('kai-logo-updated', syncFeedbacks)
    window.addEventListener('storage', syncFeedbacks)
    return () => {
      window.removeEventListener('kai-feedback-updated', syncFeedbacks)
      window.removeEventListener('kai-logo-updated', syncFeedbacks)
      window.removeEventListener('storage', syncFeedbacks)
    }
  }, [location.pathname])

  useEffect(() => {
    function handleOutsideClick(event: MouseEvent) {
      const target = event.target as Node
      if (notifRef.current && !notifRef.current.contains(target)) {
        setNotifOpen(false)
      }
      if (profileRef.current && !profileRef.current.contains(target)) {
        setProfileOpen(false)
      }
    }

    function handleEscape(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        setMobileMenuOpen(false)
        setNotifOpen(false)
        setProfileOpen(false)
      }
    }

    document.addEventListener('mousedown', handleOutsideClick)
    window.addEventListener('keydown', handleEscape)
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick)
      window.removeEventListener('keydown', handleEscape)
    }
  }, [])

  function handleMenuToggle() {
    if (window.matchMedia('(max-width: 1000px)').matches) {
      setMobileMenuOpen((value) => !value)
      return
    }
    setCollapsed((value) => !value)
  }

  function handleSwitchRole() {
    localStorage.removeItem('kai_access_token')
    localStorage.removeItem('kai_user')
    setProfileOpen(false)
    navigate('/role-login', { replace: true })
  }

  function handleLogout() {
    localStorage.removeItem('kai_access_token')
    localStorage.removeItem('kai_user')
    clearCorporateSession()
    navigate('/login', { replace: true })
  }

  function toggleExpandNotif(id: string) {
    setExpandedNotifId((prev) => (prev === id ? null : id))
  }

  function handleResolveNotif(item: ManagerFeedbackItem) {
    const reply = replyTexts[item.id] ?? ''
    resolveManagerFeedback(item.id, reply)
    setIncomingNotifs(getIncomingAndResolvedNotifications())
    setSentNotifs(getSentNotifications())
  }

  function handleDeleteNotif(id: string) {
    deleteManagerFeedback(id)
    setIncomingNotifs(getIncomingAndResolvedNotifications())
    setSentNotifs(getSentNotifications())
    if (expandedNotifId === id) {
      setExpandedNotifId(null)
    }
  }

  return (
    <div
      className={[
        'app-layout',
        collapsed ? 'sidebar-collapsed' : '',
        mobileMenuOpen ? 'mobile-menu-open' : '',
      ]
        .filter(Boolean)
        .join(' ')}
    >
      <aside className="sidebar">
        <div className="sidebar-top">
          <NavLink
            className="brand"
            to="/dashboard"
            aria-label="Genel Bakış"
          >
            <span className="brand-icon">
              <img
                className="brand-logo"
                src={brandSymbol}
                alt=""
                aria-hidden="true"
              />
            </span>
            <span className="brand-text">
              <strong>PlanBattery</strong>
              <small>Karbon Ayak İzi</small>
            </span>
          </NavLink>

          <button
            className="sidebar-toggle"
            type="button"
            onClick={handleMenuToggle}
            aria-label={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
            aria-expanded={mobileMenuOpen}
            title={mobileMenuOpen ? 'Menüyü kapat' : 'Menüyü aç'}
          >
            {mobileMenuOpen ? (
              <X size={21} strokeWidth={1.9} />
            ) : (
              <Menu size={21} strokeWidth={1.9} />
            )}
          </button>
        </div>

        <div className="selected-company">
          <span className="company-label">SEÇİLİ ŞİRKET</span>
          <strong>{user.tenantName}</strong>
        </div>

        <nav className="navigation" aria-label="Ana menü">
          <NavLink
            className="navigation-item"
            to="/dashboard"
            title="Genel Bakış"
          >
            <Icon name="home" />
            <span>Genel Bakış</span>
          </NavLink>

          {canAccessCarbonManagement && (
            <NavLink
              className="navigation-item"
              to="/assessments"
              title="Değerlendirmeler"
            >
              <Icon name="assessment" />
              <span>Değerlendirmeler</span>
            </NavLink>
          )}

          <NavLink
            className="navigation-item"
            to="/activities"
            title={activitiesLabel}
          >
            <Icon name="activity" />
            <span>{activitiesLabel}</span>
          </NavLink>

          {canAccessCarbonManagement && (
            <NavLink
              className="navigation-item"
              to="/reports"
              end
              title="Raporlar"
            >
              <Icon name="report" />
              <span>Raporlar</span>
            </NavLink>
          )}

          {(isAdmin || isCarbonSpecialist) && (
            <NavLink
              className="navigation-item"
              to="/reports/comparison"
              title="Dönemsel Karşılaştırma"
            >
              <BarChart3
                className="nav-icon"
                strokeWidth={1.8}
                aria-hidden="true"
              />
              <span>Dönemsel Karşılaştırma</span>
            </NavLink>
          )}

          <NavLink
            className="navigation-item"
            to="/settings"
            title="Ayarlar"
          >
            <Icon name="settings" />
            <span>Ayarlar</span>
          </NavLink>

          <button
            className="navigation-item mobile-logout"
            type="button"
            onClick={handleLogout}
          >
            <Icon name="logout" />
            <span>Çıkış Yap</span>
          </button>
        </nav>

        <div className="current-user">
          <NavLink
            className="avatar"
            to="/settings"
            title="Ayarlara git"
            aria-label="Ayarlara git"
          >
            {user.name.slice(0, 1).toUpperCase()}
          </NavLink>

          <div className="current-user-information">
            <strong>{user.name}</strong>
            <span>{user.role}</span>
          </div>

          <button
            className="logout-button"
            type="button"
            onClick={handleLogout}
            title="Çıkış Yap"
            aria-label="Çıkış Yap"
          >
            <Icon name="logout" />
            <span>Çıkış Yap</span>
          </button>
        </div>
      </aside>

      <button
        type="button"
        className="mobile-menu-overlay"
        aria-label="Menüyü kapat"
        onClick={() => setMobileMenuOpen(false)}
      />

      <div className="app-main-column">
        {/* Top Utility Bar (Company Logo & Name on Left, Notifications & Profile on Right) */}
        <header className="app-topbar">
          <div className="topbar-left">
            <Link
              to="/settings"
              className="topbar-company-brand"
              title="Şirket ve logo ayarları"
            >
              {companyLogo ? (
                <img
                  src={companyLogo}
                  alt={`${user.tenantName} Logosu`}
                  className="topbar-company-logo-img"
                />
              ) : (
                <span className="topbar-company-monogram">
                  {user.tenantName
                    .split(/\s+/)
                    .map((w) => w[0])
                    .join('')
                    .slice(0, 2)
                    .toUpperCase()}
                </span>
              )}
              <strong className="topbar-company-name">{user.tenantName}</strong>
            </Link>
            <span className="topbar-divider">·</span>
            <span className="topbar-role-text">{user.role}</span>
          </div>

          <div className="topbar-right">
            {/* Notifications Bell & Dropdown Popover */}
            <div className="topbar-dropdown-wrap" ref={notifRef}>
              <button
                type="button"
                className={`topbar-icon-btn ${notifOpen ? 'active' : ''}`}
                onClick={() => {
                  setNotifOpen((prev) => !prev)
                  setProfileOpen(false)
                }}
                aria-label="Bildirimler"
                title="Bildirimler ve Kontrol Talepleri"
              >
                <Bell size={19} />
                {openNotifCount > 0 && (
                  <span className="topbar-notif-badge">{openNotifCount}</span>
                )}
              </button>

              {notifOpen && (
                <div className="topbar-notif-popover">
                  <div className="popover-header">
                    <div>
                      <strong>Bildirimler ve Talepler</strong>
                      <span>
                        {openNotifCount > 0
                          ? `${openNotifCount} açık kontrol talebi`
                          : 'Tüm bildirimler incelendi'}
                      </span>
                    </div>
                  </div>

                  {/* Popover Tabs: Incoming/Completed vs Sent (İletildi) */}
                  <div className="popover-tabs-bar" role="tablist">
                    <button
                      type="button"
                      className={`popover-tab-btn ${notifTab === 'INCOMING' ? 'active' : ''
                        }`}
                      onClick={() => setNotifTab('INCOMING')}
                    >
                      <span>Gelenler & Tamamlananlar</span>
                      {openNotifCount > 0 && (
                        <em className="popover-tab-count">{openNotifCount}</em>
                      )}
                    </button>
                    <button
                      type="button"
                      className={`popover-tab-btn ${notifTab === 'SENT' ? 'active' : ''
                        }`}
                      onClick={() => setNotifTab('SENT')}
                    >
                      <span>İletildi</span>
                      <em className="popover-tab-count muted">
                        {sentNotifs.length}
                      </em>
                    </button>
                  </div>

                  {/* Accordion Notification List (Collapsed by default, expands on click) */}
                  <div className="popover-notif-list">
                    {displayedPopoverNotifs.length > 0 ? (
                      displayedPopoverNotifs.map((item) => {
                        const isExpanded = expandedNotifId === item.id
                        const isActivity = item.targetType === 'ACTIVITY'
                        const resolvedReportOptions = !isActivity
                          ? getReportOptionsForFeedback(item)
                          : undefined

                        return (
                          <div
                            key={item.id}
                            className={`popover-notif-item ${item.resolved ? 'resolved' : 'unread'
                              } ${isExpanded ? 'expanded' : ''}`}
                          >
                            <button
                              type="button"
                              className="popover-notif-summary"
                              onClick={() => toggleExpandNotif(item.id)}
                            >
                              <span
                                className={`popover-notif-icon ${item.resolved ? 'resolved' : 'open'
                                  }`}
                              >
                                {isActivity ? (
                                  <Flame size={15} />
                                ) : (
                                  <FileSpreadsheet size={15} />
                                )}
                              </span>

                              <div className="popover-notif-meta">
                                <strong>{item.targetTitle}</strong>
                                <small>
                                  {item.senderRole ?? 'Yetkili'} ({item.createdBy}
                                  ) · {item.createdAt}
                                </small>
                              </div>

                              <span
                                className={`popover-status-dot ${item.resolved ? 'resolved' : 'open'
                                  }`}
                                title={
                                  item.resolved
                                    ? 'Tamamlandı'
                                    : 'Kontrol Bekliyor'
                                }
                              />

                              <ChevronDown
                                size={16}
                                className={`popover-chevron ${isExpanded ? 'open' : ''
                                  }`}
                              />
                            </button>

                            {/* Expanded Details (Only visible when clicked!) */}
                            {isExpanded && (
                              <div className="popover-notif-details">
                                <div className="popover-msg-box">
                                  <span>
                                    {(item.senderRole ?? 'YÖNETİCİ').toUpperCase()}{' '}
                                    NOTU:
                                  </span>
                                  <p>{item.message}</p>
                                </div>

                                {item.resolved && item.specialistReply && (
                                  <div className="popover-reply-box">
                                    <span>
                                      <MessageSquareReply size={12} /> UZMAN
                                      YANITI ({item.repliedBy ?? 'Ayşe Yılmaz'}):
                                    </span>
                                    <p>{item.specialistReply}</p>
                                  </div>
                                )}

                                {!item.resolved &&
                                  notifTab === 'INCOMING' &&
                                  (isCarbonSpecialist || isDataEntry) && (
                                    <div className="popover-reply-input-row">
                                      <input
                                        type="text"
                                        placeholder="Yanıt veya işlem notu yazın..."
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
                                        className="popover-resolve-btn"
                                        onClick={() => handleResolveNotif(item)}
                                      >
                                        <Check size={14} />
                                        <span>Tamamla</span>
                                      </button>
                                    </div>
                                  )}

                                <div className="popover-detail-actions">
                                  <span
                                    className={`popover-state-tag ${item.resolved ? 'resolved' : 'open'
                                      }`}
                                  >
                                    {item.resolved ? (
                                      <>
                                        <CheckCircle2 size={12} /> Tamamlandı
                                      </>
                                    ) : notifTab === 'SENT' ? (
                                      <>
                                        <Send size={11} /> İletildi · Bekliyor
                                      </>
                                    ) : (
                                      <>
                                        <Clock size={12} /> Kontrol Bekliyor
                                      </>
                                    )}
                                  </span>

                                  <div className="popover-action-btns">
                                    {isActivity ? (
                                      <Link
                                        to={`/activities/${item.targetId}`}
                                        className="popover-open-target-btn"
                                        onClick={() => setNotifOpen(false)}
                                      >
                                        <span>İlgili Kaydı Aç</span>
                                        <ArrowRight size={13} />
                                      </Link>
                                    ) : (
                                      <Link
                                        to="/reports/preview"
                                        state={resolvedReportOptions}
                                        className="popover-open-target-btn"
                                        onClick={() => setNotifOpen(false)}
                                      >
                                        <span>İlgili Raporu Aç</span>
                                        <ArrowRight size={13} />
                                      </Link>
                                    )}

                                    <button
                                      type="button"
                                      className="popover-del-btn"
                                      onClick={() => handleDeleteNotif(item.id)}
                                      title="Bildirimi Sil"
                                    >
                                      <Trash2 size={14} />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            )}
                          </div>
                        )
                      })
                    ) : (
                      <div className="popover-empty">
                        <Bell size={22} />
                        <p>Henüz bildirim veya kontrol talebi bulunmuyor.</p>
                      </div>
                    )}
                  </div>

                  <div className="popover-footer">
                    <Link
                      to="/notifications"
                      onClick={() => setNotifOpen(false)}
                    >
                      Tüm Bildirim Merkezini Aç →
                    </Link>
                  </div>
                </div>
              )}
            </div>

            {/* User Profile / Settings / Logout Dropdown */}
            <div className="topbar-dropdown-wrap" ref={profileRef}>
              <button
                type="button"
                className={`topbar-profile-btn ${profileOpen ? 'active' : ''}`}
                onClick={() => {
                  setProfileOpen((prev) => !prev)
                  setNotifOpen(false)
                }}
              >
                <span className="topbar-avatar">
                  {user.name.slice(0, 1).toUpperCase()}
                </span>
                <span className="topbar-user-info">
                  <strong>{user.name}</strong>
                  <small>{user.role}</small>
                </span>
                <ChevronDown
                  size={15}
                  className={`topbar-chevron ${profileOpen ? 'open' : ''}`}
                />
              </button>

              {profileOpen && (
                <div className="topbar-profile-popover">
                  <div className="profile-popover-head">
                    <strong>{user.name}</strong>
                    <span>{user.email || user.tenantName}</span>
                  </div>

                  <Link
                    to="/settings"
                    className="profile-popover-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Settings size={16} />
                    <span>Profil ve Ayarlar</span>
                  </Link>

                  <Link
                    to="/notifications"
                    className="profile-popover-item"
                    onClick={() => setProfileOpen(false)}
                  >
                    <Bell size={16} />
                    <span>Bildirim ve Talep Merkezi</span>
                    {openNotifCount > 0 && (
                      <em className="mini-count">{openNotifCount}</em>
                    )}
                  </Link>

                  <button
                    type="button"
                    className="profile-popover-item"
                    onClick={() => {
                      setProfileOpen(false)
                      setOnboardingTrigger((n) => n + 1)
                      setOnboardingOpen(true)
                    }}
                  >
                    <Compass size={16} />
                    <span>Kullanım Rehberi</span>
                  </button>

                  <button
                    type="button"
                    className="profile-popover-item"
                    onClick={handleSwitchRole}
                  >
                    <ClipboardList size={16} />
                    <span>Yetki Değiştir</span>
                  </button>

                  <button
                    type="button"
                    className="profile-popover-item logout"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} />
                    <span>Kurumsal Çıkış Yap</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </header>

        <main className="page-content">
          <Outlet />
        </main>
      </div>

      {onboardingOpen && (
        <RoleOnboardingModal
          tenantName={user.tenantName}
          tenantRole={user.tenantRole ?? 'COMPANY_ADMIN'}
          forceOpen={onboardingTrigger > 0}
          onClose={() => setOnboardingOpen(false)}
        />
      )}
    </div>
  )
}

export default AppLayout
