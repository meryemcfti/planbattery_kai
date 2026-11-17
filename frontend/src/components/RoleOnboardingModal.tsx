import { useEffect, useState } from 'react'
import {
  ArrowLeft,
  ArrowRight,
  BarChart3,
  Bell,
  CalendarRange,
  CheckCircle2,
  ClipboardCheck,
  Compass,
  FileSpreadsheet,
  Flame,
  ShieldCheck,
  X,
} from 'lucide-react'
import type { TenantRoleType } from '../services/activityStore'
import './RoleOnboardingModal.css'

type OnboardingStep = {
  title: string
  why: string
  how: string
  icon: 'overview' | 'calendar' | 'activity' | 'report' | 'compare' | 'bell'
}

type RoleGuide = {
  roleLabel: string
  welcomeTitle: string
  welcomeSubtitle: string
  steps: OnboardingStep[]
}

const ROLE_GUIDES: Record<TenantRoleType, RoleGuide> = {
  COMPANY_ADMIN: {
    roleLabel: 'Şirket Yöneticisi',
    welcomeTitle: 'Yönetici Paneline Hoş Geldiniz',
    welcomeSubtitle:
      'Bu kısa yönlendirme, kurumsal karbon raporlarını ve tesis performansını nasıl inceleyeceğinizi özetler.',
    steps: [
      {
        title: 'Genel Bakış & Tesis Kartları',
        why: 'Şirketinizin yalnızca uzman onayından geçmiş güvenilir emisyon sonuçlarını (kgCO₂e) ve tesis paylarını tek bakışta görmek için kullanılır.',
        how: 'Tesis Bazlı Emisyon Dağılımı kartlarında bir tesise (ör. Bucak) tıklayarak doğrudan o tesise ait raporları filtreleyebilirsiniz.',
        icon: 'overview',
      },
      {
        title: 'Rapor İnceleme & QR Doğrulamalı PDF',
        why: 'Çevre veya veri uzmanının hazırladığı dönem raporlarını denetim ve yönetim sunumları için inceleyip arşivlemek amacıyla kullanılır.',
        how: 'Raporlar sekmesinden dönem grubu altındaki raporu açıp tek sayfa A4 PDF çıktısı alabilirsiniz.',
        icon: 'report',
      },
      {
        title: 'Dönemsel & Tesisler Özelinde Karşılaştırma',
        why: 'Yıldan yıla, aydan aya, haftadan haftaya veya tesisler arasında (ör. Bucak vs Burdur Merkez) tüketim ve emisyon değişimlerini analiz etmek için kullanılır.',
        how: 'Sol menüdeki "Dönemsel Karşılaştırma" sekmesinden istediğiniz zaman dilimini veya tesis karşılaştırmasını seçebilirsiniz.',
        icon: 'compare',
      },
      {
        title: 'Uzman Bildirimleri & Kontrol Talepleri',
        why: 'Şüpheli bulduğunuz bir rapor veya faaliyet kaydı hakkında doğrudan Çevre / Karbon Uzmanından kontrol istemek için kullanılır.',
        how: 'Sağ üstteki zil simgesinden yalnızca Çevre Uzmanından gelen bildirimleri ve sizin ilettiğiniz talepleri takip edebilirsiniz.',
        icon: 'bell',
      },
    ],
  },
  CARBON_SPECIALIST: {
    roleLabel: 'Çevre / Karbon Uzmanı',
    welcomeTitle: 'Çevre / Karbon Uzmanı Paneline Hoş Geldiniz',
    welcomeSubtitle:
      'Bu kısa yönlendirme; dönem yönetimi, teknik veri doğrulama ve karşılaştırma analizlerini nasıl yürüteceğinizi özetler.',
    steps: [
      {
        title: 'Değerlendirme Dönemleri',
        why: 'Faaliyet kayıtlarının ve raporların bağlanacağı yıllık veya aylık kurumsal envanter dönemlerini tanımlamak için kullanılır.',
        how: 'Sol menüdeki "Değerlendirmeler" sayfasından yeni dönem açabilir ve dönem içi ilerlemeyi izleyebilirsiniz.',
        icon: 'calendar',
      },
      {
        title: 'Veri Kontrolü, Güncelleme & Onay',
        why: 'Veri sorumlusunun girdiği doğalgaz tüketimlerini fatura/SAP/matris kanıtlarıyla karşılaştırıp ISO 14064-1 doğrulaması yapmak için kullanılır.',
        how: 'Kayıt detayından kanıtları inceleyin; düzeltme gerekiyorsa zorunlu kontrol notu (ve gerekirse ek fotoğraf) ile güncelleyin veya onaylayın.',
        icon: 'activity',
      },
      {
        title: 'Rapor Oluşturma & Karşılaştırmalı Analiz',
        why: 'Yönetici incelemesine sunulacak benzersiz isimli raporlar üretmek ve yıl/ay/hafta veya tesis bazlı emisyon kıyaslamaları yapmak için kullanılır.',
        how: '"Raporlar" sayfasından yeni rapor oluşturabilir, "Dönemsel Karşılaştırma" sekmesinden tüm dönem ve tesis analizlerini yapabilirsiniz.',
        icon: 'compare',
      },
      {
        title: 'Çift Yönlü Bildirim Merkezi',
        why: 'Veri Sorumlusunun ilettiği yeni kayıtları ve Şirket Yöneticisinin kontrol taleplerini tek merkezden yönetmek için kullanılır.',
        how: 'Üstteki zil simgesinden gelen talepleri yanıtlayıp tamamlandı olarak işaretleyebilirsiniz.',
        icon: 'bell',
      },
    ],
  },
  DATA_ENTRY: {
    roleLabel: 'Veri ve Operasyon Sorumlusu',
    welcomeTitle: 'Veri ve Operasyon Paneline Hoş Geldiniz',
    welcomeSubtitle:
      'Bu kısa yönlendirme; fatura, SAP ve matris verilerini sisteme nasıl işleyip uzmana sunacağınızı özetler.',
    steps: [
      {
        title: 'Fatura, SAP & Matris Veri Girişi',
        why: 'Tesislere ait doğalgaz tüketim miktarlarını (m³), referans numaralarını ve kanıt belgelerini sisteme eksiksiz kaydetmek için kullanılır.',
        how: 'Ana ekrandaki "Fatura / SAP & Matris İşle" butonuyla tüketim dönemini, tesis bilgisini ve kanıt görsellerini girin.',
        icon: 'activity',
      },
      {
        title: 'Zorunlu Not & Fotoğraflı Güncelleme',
        why: 'Çevre Uzmanı tarafından revizyon istenen veya düzeltilmesi gereken kayıtlarda değişiklik sebebini denetim izi olarak kayıt altına almak için kullanılır.',
        how: 'İlgili faaliyet kaydını düzenlerken yapılan değişikliği açıklayan zorunlu notu yazın ve gerekiyorsa güncel belge fotoğrafını ekleyin.',
        icon: 'overview',
      },
      {
        title: 'Rapor Yapılandırma & Arşivleme',
        why: 'Sisteme işlenen verilerden dönem raporu oluşturup Çevre / Karbon Uzmanı kontrolüne sunmak ve rapor listesini düzenli tutmak için kullanılır.',
        how: '"Raporlar" sayfasından kapsam ve benzersiz rapor adı belirleyerek raporu oluşturup uzmana iletebilirsiniz.',
        icon: 'report',
      },
      {
        title: 'Bildirim & Talep Takibi',
        why: 'Çevre Uzmanından gelen düzeltme isteklerini görmek ve kendi gönderdiğiniz bildirimlerin durumunu ("İletildi") takip etmek için kullanılır.',
        how: 'Sağ üstteki zil simgesinden size gelen istekleri açıp doğrudan ilgili kayda geçebilirsiniz.',
        icon: 'bell',
      },
    ],
  },
  VIEWER: {
    roleLabel: 'İzleyici',
    welcomeTitle: 'PlanBattery Paneline Hoş Geldiniz',
    welcomeSubtitle:
      'Kurumsal karbon ayak izi kayıtlarını ve dönem özetlerini salt okunur olarak inceleyebilirsiniz.',
    steps: [
      {
        title: 'Genel Bakış & Kayıtlar',
        why: 'Kurumunuzun karbon envanter durumunu ve tesis dağılımlarını takip etmek için kullanılır.',
        how: 'Sol menüdeki sekmeler üzerinden aktif dönem ve faaliyet özetlerini görüntüleyebilirsiniz.',
        icon: 'overview',
      },
    ],
  },
}

function StepIcon({ kind }: { kind: OnboardingStep['icon'] }) {
  switch (kind) {
    case 'calendar':
      return <CalendarRange size={20} />
    case 'activity':
      return <Flame size={20} />
    case 'report':
      return <FileSpreadsheet size={20} />
    case 'compare':
      return <BarChart3 size={20} />
    case 'bell':
      return <Bell size={20} />
    default:
      return <ClipboardCheck size={20} />
  }
}

export function getOnboardingStorageKey(
  tenantName: string,
  tenantRole: TenantRoleType,
) {
  return `kai_onboarding_hide_${encodeURIComponent(tenantName)}_${tenantRole}`
}

export default function RoleOnboardingModal({
  tenantName,
  tenantRole,
  forceOpen,
  onClose,
}: {
  tenantName: string
  tenantRole: TenantRoleType
  forceOpen?: boolean
  onClose: () => void
}) {
  const guide = ROLE_GUIDES[tenantRole] ?? ROLE_GUIDES.COMPANY_ADMIN
  const [stepIndex, setStepIndex] = useState(0)
  const [dontShowAgain, setDontShowAgain] = useState(false)

  useEffect(() => {
    setStepIndex(0)
  }, [tenantRole, forceOpen])

  const currentStep = guide.steps[stepIndex] ?? guide.steps[0]
  const isLastStep = stepIndex >= guide.steps.length - 1

  function persistIfChecked(alwaysHide?: boolean) {
    if (alwaysHide || dontShowAgain) {
      localStorage.setItem(getOnboardingStorageKey(tenantName, tenantRole), 'true')
    }
  }

  function handleSkip() {
    persistIfChecked(false)
    onClose()
  }

  function handleFinish() {
    persistIfChecked(false)
    onClose()
  }

  return (
    <div
      className="onboarding-backdrop"
      role="dialog"
      aria-modal="true"
      aria-labelledby="onboarding-title"
    >
      <div className="onboarding-modal">
        <div className="onboarding-topbar">
          <span className="onboarding-role-pill">
            <Compass size={14} />
            <span>
              {tenantName} · {guide.roleLabel}
            </span>
          </span>

          <div className="onboarding-top-actions">
            <button
              type="button"
              className="onboarding-skip-btn"
              onClick={handleSkip}
            >
              Atla
            </button>
            <button
              type="button"
              className="onboarding-close-icon"
              onClick={handleSkip}
              aria-label="Kapat"
            >
              <X size={16} />
            </button>
          </div>
        </div>

        <div className="onboarding-hero">
          <h2 id="onboarding-title">{guide.welcomeTitle}</h2>
          <p>{guide.welcomeSubtitle}</p>
        </div>

        <div className="onboarding-progress-dots">
          {guide.steps.map((step, idx) => (
            <button
              key={step.title}
              type="button"
              className={`onboarding-dot-pill ${idx === stepIndex ? 'active' : idx < stepIndex ? 'done' : ''}`}
              onClick={() => setStepIndex(idx)}
              title={step.title}
            >
              <span>{idx + 1}</span>
            </button>
          ))}
        </div>

        <div className="onboarding-step-card">
          <div className="onboarding-step-head">
            <span className="onboarding-step-icon">
              <StepIcon kind={currentStep.icon} />
            </span>
            <div>
              <small>
                Adım {stepIndex + 1} / {guide.steps.length}
              </small>
              <h3>{currentStep.title}</h3>
            </div>
          </div>

          <div className="onboarding-step-grid">
            <div className="onboarding-info-box">
              <strong>Neden Kullanılır?</strong>
              <p>{currentStep.why}</p>
            </div>
            <div className="onboarding-info-box is-how">
              <strong>Nasıl Kullanılır?</strong>
              <p>{currentStep.how}</p>
            </div>
          </div>
        </div>

        <footer className="onboarding-footer">
          <div className="onboarding-footer-left">
            <label className="onboarding-checkbox">
              <input
                type="checkbox"
                checked={dontShowAgain}
                onChange={(e) => setDontShowAgain(e.target.checked)}
              />
              <span>Bir daha gösterme</span>
            </label>
          </div>

          <div className="onboarding-footer-actions">
            {stepIndex > 0 && (
              <button
                type="button"
                className="onboarding-prev-btn"
                onClick={() => setStepIndex((i) => Math.max(0, i - 1))}
              >
                <ArrowLeft size={15} />
                <span>Önceki</span>
              </button>
            )}

            {isLastStep ? (
              <button
                type="button"
                className="onboarding-next-btn"
                onClick={handleFinish}
              >
                <CheckCircle2 size={16} />
                <span>Anladım, Başla</span>
              </button>
            ) : (
              <button
                type="button"
                className="onboarding-next-btn"
                onClick={() =>
                  setStepIndex((i) => Math.min(guide.steps.length - 1, i + 1))
                }
              >
                <span>Sonraki</span>
                <ArrowRight size={15} />
              </button>
            )}
          </div>
        </footer>

        <div className="onboarding-security-note">
          <ShieldCheck size={13} />
          <span>
            İstediğiniz zaman sağ üstteki profil menüsünden "Kullanım Rehberi"
            ile tekrar açabilirsiniz.
          </span>
        </div>
      </div>
    </div>
  )
}
