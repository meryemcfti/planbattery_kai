import { Link } from 'react-router-dom'
import {
  Activity,
  ArrowRight,
  BarChart3,
  Building2,
  CheckCircle2,
  ClipboardCheck,
  FileCheck2,
  FileSpreadsheet,
  Flame,
  Layers,
  Lock,
  ShieldCheck,
  TrendingDown,
  Users,
} from 'lucide-react'
import brandSymbol from '../assets/planbattery-symbol.svg'
import windEnergyImg from '../assets/wind-energy.jpg'
import saplingGrowthImg from '../assets/sapling-growth.jpg'
import forestCo2LeafImg from '../assets/forest-co2-leaf.jpg'
import forestChartImg from '../assets/forest-chart.jpg'
import forestCycleImg from '../assets/forest-cycle.jpg'
import './LandingPage.css'

const features = [
  {
    icon: Flame,
    title: 'Kapsam 1 Doğalgaz & Sabit Yanma',
    description:
      'Tesis bazlı aylık doğalgaz tüketimlerini fatura, sayaç veya ERP referanslarıyla kaydedin; m³ ve kWh bazında standartlaştırın.',
  },
  {
    icon: ShieldCheck,
    title: 'Akredite Katsayı & GWP Motoru',
    description:
      'GHG Protocol ve IPCC AR5/AR6 standartlarına uygun emisyon faktörleriyle CO₂, CH₄ ve N₂O gazlarını ayrı ayrı hesaplayın.',
  },
  {
    icon: ClipboardCheck,
    title: 'Çok Kademeli Doğrulama Zinciri',
    description:
      'Veri girişinden uzman incelemesine, revizyon talebinden şirket yöneticisi onayına kadar uçtan uca kontrollü iş akışı kurun.',
  },
  {
    icon: FileCheck2,
    title: 'Denetime Hazır ISO 14064-1 Raporları',
    description:
      'Şirket geneli veya tesis kırılımında, özet ya da detaylı kurumsal karbon ayak izi raporlarını tek tıkla oluşturun ve dışa aktarın.',
  },
  {
    icon: Layers,
    title: 'Hesaplama Snapshot & Denetim İzi',
    description:
      'Her hesaplama koşusunda kullanılan girdi değerleri, emisyon faktörü sürümleri ve GWP katsayıları değişmez snapshot olarak saklanır.',
  },
  {
    icon: Users,
    title: 'Çoklu Tesis ve Rol Bazlı Yetki',
    description:
      'Şirket Yöneticisi, Karbon Uzmanı, Veri Giriş Sorumlusu ve İzleyici rolleriyle kurum içi sorumlulukları net biçimde ayırın.',
  },
]

const workflowSteps = [
  {
    step: '01',
    title: 'Değerlendirme Dönemi ve Tesis Tanımı',
    description:
      'Yıllık veya özel dönemli kurumsal karbon değerlendirmenizi açın, üretim ve hizmet tesislerinizi ilişkilendirin.',
  },
  {
    step: '02',
    title: 'Faaliyet Verisi ve Kanıt Girişi',
    description:
      'Tesislerin doğalgaz tüketim miktarlarını fatura numarası, tedarikçi ve sayaç bilgileriyle birlikte sisteme işleyin.',
  },
  {
    step: '03',
    title: 'Otomatik Hesaplama ve Uzman Kontrolü',
    description:
      'Sistem CO₂, CH₄ ve N₂O emisyonlarını tCO₂e cinsinden hesaplar; karbon uzmanı kayıtları inceleyerek doğrular.',
  },
  {
    step: '04',
    title: 'Konsolide Analiz ve Resmi Raporlama',
    description:
      'Doğrulanmış emisyon verilerini yönetim panelinden izleyin ve denetime hazır kurumsal raporunuzu oluşturun.',
  },
]

function LandingPage() {
  const isLoggedIn = Boolean(localStorage.getItem('kai_access_token'))

  return (
    <div className="landing-page">
      {/* Top Navbar */}
      <header className="landing-navbar">
        <div className="landing-container landing-navbar-inner">
          <Link to="/" className="landing-brand">
            <span className="landing-brand-icon">
              <img src={brandSymbol} alt="PlanBattery Logo" />
            </span>
            <span className="landing-brand-text">
              <strong>PlanBattery</strong>
              <small>Karbon Ayak İzi</small>
            </span>
          </Link>

          <nav className="landing-nav-links" aria-label="Sayfa bölümleri">
            <a href="#ozellikler">Özellikler</a>
            <a href="#nasil-calisir">Nasıl Çalışır?</a>
            <a href="#metodoloji">Metodoloji</a>
            <a href="#raporlama">Kurumsal Raporlama</a>
          </nav>

          <div className="landing-nav-actions">
            {isLoggedIn ? (
              <Link to="/dashboard" className="landing-btn landing-btn-primary">
                <span>Yönetim Paneline Git</span>
                <ArrowRight size={16} />
              </Link>
            ) : (
              <>
                <Link to="/demo" className="landing-btn landing-btn-ghost">
                  Demo Sürümünü Dene
                </Link>
                <Link to="/login" className="landing-btn landing-btn-ghost">
                  Giriş Yap
                </Link>
                <Link
                  to="/register"
                  className="landing-btn landing-btn-primary"
                >
                  <span>Kayıt Ol</span>
                  <ArrowRight size={16} />
                </Link>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="landing-hero">
        <div className="landing-hero-glow landing-hero-glow-1" />
        <div className="landing-hero-glow landing-hero-glow-2" />

        <div className="landing-container landing-hero-grid">
          <div className="landing-hero-copy">
            <h1>
              Kurumsal karbon ayak izinizi{' '}
              <span className="landing-gradient-title">
                ölçün, doğrulayın ve raporlayın.
              </span>
            </h1>

            <p className="landing-hero-lead">
              PlanBattery ile şirket ve tesis bazlı enerji ve doğalgaz tüketim
              faaliyetlerinizi tek merkezden yönetin. Akredite emisyon
              faktörleriyle Kapsam 1 emisyonlarınızı hatasız hesaplayın ve
              denetime hazır kurumsal raporlar üretin.
            </p>

            <div className="landing-hero-cta-group">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="landing-btn landing-btn-primary landing-btn-lg"
                >
                  <span>Panele Devam Et</span>
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="landing-btn landing-btn-primary landing-btn-lg"
                  >
                    <span>Hemen Başlayın</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/demo"
                    className="landing-btn landing-btn-outline landing-btn-lg"
                  >
                    <span>Demo Sürümünü Dene</span>
                  </Link>
                  <Link
                    to="/login"
                    className="landing-btn landing-btn-outline landing-btn-lg"
                  >
                    <span>Mevcut Hesapla Giriş Yap</span>
                  </Link>
                </>
              )}
            </div>

            <div className="landing-hero-trust">
              <div className="trust-item">
                <CheckCircle2 size={16} />
                <span>Çoklu Tesis Desteği</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} />
                <span>IPCC AR5 / AR6 Katsayıları</span>
              </div>
              <div className="trust-item">
                <CheckCircle2 size={16} />
                <span>Denetim İzi (Audit Trail)</span>
              </div>
            </div>
          </div>

          {/* Interactive Dashboard Preview Card */}
          <div className="landing-hero-preview" aria-hidden="true">
            <div className="preview-window">
              <div className="preview-window-bar">
                <div className="preview-dots">
                  <span />
                  <span />
                  <span />
                </div>
                <div className="preview-window-title">
                  PlanBattery · 2026 Kurumsal Karbon Değerlendirmesi
                </div>
                <span className="preview-status-badge">Aktif Dönem</span>
              </div>

              <div className="preview-window-body">
                <div className="preview-kpi-row">
                  <div className="preview-kpi-card preview-kpi-primary">
                    <span className="preview-kpi-label">
                      TOPLAM KAPSAM 1 EMİSYONU
                    </span>
                    <strong className="preview-kpi-value">
                      51.697 <small>kgCO₂e</small>
                    </strong>
                    <span className="preview-kpi-trend">
                      <TrendingDown size={13} /> Uzman onaylı faaliyet bazlı
                    </span>
                  </div>

                  <div className="preview-kpi-card">
                    <span className="preview-kpi-label">DOĞALGAZ TÜKETİMİ</span>
                    <strong className="preview-kpi-value">
                      27.400 <small>m³</small>
                    </strong>
                    <span className="preview-kpi-sub">
                      2 aktif üretim tesisi
                    </span>
                  </div>
                </div>

                <div className="preview-section-card">
                  <div className="preview-section-header">
                    <span>Tesis Bazlı Emisyon Dağılımı</span>
                    <span className="preview-tag">Sabit Yanma</span>
                  </div>

                  <div className="preview-facility-list">
                    <div className="preview-facility-item">
                      <div className="preview-facility-info">
                        <Building2 size={15} />
                        <div>
                          <strong>Bucak Üretim Tesisi</strong>
                          <small>19.400 m³ · Fatura & ERP Kayıtlı</small>
                        </div>
                      </div>
                      <div className="preview-facility-metric">
                        <strong>36.603 kgCO₂e</strong>
                        <span className="status-pill-verified">Onaylandı</span>
                      </div>
                    </div>

                    <div className="preview-facility-item">
                      <div className="preview-facility-info">
                        <Building2 size={15} />
                        <div>
                          <strong>Burdur Merkez Tesis</strong>
                          <small>8.000 m³ · Sayaç Kayıtlı</small>
                        </div>
                      </div>
                      <div className="preview-facility-metric">
                        <strong>15.094 kgCO₂e</strong>
                        <span className="status-pill-verified">Onaylandı</span>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="preview-gas-strip">
                  <div className="preview-gas-box">
                    <span>CO₂ Payı</span>
                    <strong>%99,81</strong>
                  </div>
                  <div className="preview-gas-box">
                    <span>CH₄ (Metan)</span>
                    <strong>%0,13</strong>
                  </div>
                  <div className="preview-gas-box">
                    <span>N₂O (Azot Oksit)</span>
                    <strong>%0,06</strong>
                  </div>
                  <div className="preview-gas-box preview-gas-standard">
                    <span>Metodoloji</span>
                    <strong>GHG Protocol V2</strong>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Metrics / Standards Strip */}
      <section className="landing-metrics-bar">
        <div className="landing-container landing-metrics-grid">
          <div className="metric-item">
            <strong>ISO 14064-1</strong>
            <span>Kurumsal Sera Gazı Envanteri Uyumlu</span>
          </div>
          <div className="metric-item">
            <strong>CO₂ · CH₄ · N₂O</strong>
            <span>Gaz Bazında Ayrı Kütle ve tCO₂e Hesabı</span>
          </div>
          <div className="metric-item">
            <strong>%100 İzlenebilir</strong>
            <span>Katsayı ve GWP Snapshot Kayıt Mimarisi</span>
          </div>
          <div className="metric-item">
            <strong>Çoklu Rol Yapısı</strong>
            <span>Uzman Doğrulama ve Yönetici Onay Akışı</span>
          </div>
        </div>
      </section>

      {/* Features & Apple-Style Visual Bento Showcase Section */}
      <section id="ozellikler" className="landing-section">
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="section-eyebrow">SÜRDÜRÜLEBİLİRLİK VE TEKNOLOJİ</span>
            <h2>Doğayla uyumlu, bilimsel veriye dayalı karbon yönetimi</h2>
            <p>
              Dağınık tablolar yerine standartlaştırılmış veri girişi, otomatik
              kgCO₂e hesaplama motoru ve uzman onay mekanizmasıyla kurumsal
              emisyon envanterinizi güvenle yönetin.
            </p>
          </div>

          {/* Apple-Style Visual Photo Bento Row */}
          <div className="apple-photo-bento">
            <article className="photo-bento-card photo-bento-wide">
              <img
                src={windEnergyImg}
                alt="Temiz Enerji ve Kurumsal Dönüşüm"
                className="photo-bento-img"
              />
              <div className="photo-bento-overlay" />
              <div className="photo-bento-content">
                <span className="photo-bento-tag">ENERJİ VE EMİSYON İZLEME</span>
                <h3>Tesislerinizin enerji izini gerçek zamanlı takip edin</h3>
                <p>
                  Üretim sahalarınızdaki doğalgaz ve sabit yanma faaliyetlerini
                  fatura, sayaç ve ERP referanslarıyla tek merkezde toplayın.
                </p>
              </div>
            </article>

            <article className="photo-bento-card">
              <img
                src={saplingGrowthImg}
                alt="Sürdürülebilir Gelecek"
                className="photo-bento-img"
              />
              <div className="photo-bento-overlay" />
              <div className="photo-bento-content">
                <span className="photo-bento-tag">NET SIFIR YOL HARİTASI</span>
                <h3>Doğrulanabilir çevresel sorumluluk</h3>
                <p>
                  Çevre uzmanınızın kontrolü ve ISO 14064-1 uyumlu kgCO₂e
                  raporlarıyla azaltım hedeflerinize sağlam bir temel oluşturun.
                </p>
              </div>
            </article>
          </div>

          <div className="apple-photo-trio">
            <article className="photo-trio-card">
              <img src={forestCo2LeafImg} alt="CO2 Emisyon Takibi" />
              <div className="photo-trio-overlay" />
              <div className="photo-trio-text">
                <span>CO₂ ENVANTERİ</span>
                <strong>Hassas kgCO₂e Ölçümü</strong>
              </div>
            </article>

            <article className="photo-trio-card">
              <img src={forestChartImg} alt="Performans Analizi" />
              <div className="photo-trio-overlay" />
              <div className="photo-trio-text">
                <span>ANALİTİK GÖRÜNÜM</span>
                <strong>Tesis Bazlı Eğilim Takibi</strong>
              </div>
            </article>

            <article className="photo-trio-card">
              <img src={forestCycleImg} alt="Döngüsel Sürdürülebilirlik" />
              <div className="photo-trio-overlay" />
              <div className="photo-trio-text">
                <span>DÖNGÜSEL YÖNETİM</span>
                <strong>Denetime Hazır Süreç</strong>
              </div>
            </article>
          </div>

          <div className="landing-features-grid">
            {features.map((item) => {
              const IconComponent = item.icon
              return (
                <article key={item.title} className="landing-feature-card">
                  <div className="landing-feature-icon">
                    <IconComponent size={22} />
                  </div>
                  <h3>{item.title}</h3>
                  <p>{item.description}</p>
                </article>
              )
            })}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section
        id="nasil-calisir"
        className="landing-section landing-section-alt"
      >
        <div className="landing-container">
          <div className="landing-section-header">
            <span className="section-eyebrow">İŞ AKIŞI</span>
            <h2>4 adımda doğrulanabilir karbon muhasebesi</h2>
            <p>
              Veri toplama aşamasından denetçi sunumuna kadar tüm süreci şeffaf
              ve tekrarlanabilir bir akışla yönetin.
            </p>
          </div>

          <div className="landing-steps-grid">
            {workflowSteps.map((item) => (
              <div key={item.step} className="landing-step-card">
                <span className="landing-step-number">{item.step}</span>
                <h3>{item.title}</h3>
                <p>{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Methodology & Calculation Transparency Section */}
      <section id="metodoloji" className="landing-section">
        <div className="landing-container">
          <div className="landing-methodology-box">
            <div className="methodology-content">
              <span className="section-eyebrow section-eyebrow-light">
                BİLİMSEL METODOLOJİ VE ŞEFFAFLIK
              </span>
              <h2>Uluslararası standartlarla uyumlu emisyon hesaplama motoru</h2>
              <p>
                PlanBattery, girilen her doğalgaz tüketim kaydını uluslararası
                kabul görmüş emisyon faktörleri ve Küresel Isınma Potansiyeli
                (GWP) değerleriyle işler.
              </p>

              <ul className="methodology-list">
                <li>
                  <Activity size={18} />
                  <div>
                    <strong>Birim Normalizasyonu ve Doğrulama</strong>
                    <span>
                      Standart m³ ve enerji birimleri (kWh) üzerinden tutarlı
                      veri kontrolü.
                    </span>
                  </div>
                </li>
                <li>
                  <BarChart3 size={18} />
                  <div>
                    <strong>Gaz Bazlı Ayrıştırma</strong>
                    <span>
                      CO₂, CH₄ ve N₂O gazlarının ayrı kütle (kg) ve karbondioksit
                      eşdeğeri (kgCO₂e / tCO₂e) hesabı.
                    </span>
                  </div>
                </li>
                <li>
                  <Lock size={18} />
                  <div>
                    <strong>Değişmez Hesaplama Kaydı</strong>
                    <span>
                      Geçmiş dönem raporlarınız, katsayılar güncellense dahi
                      hesaplandığı andaki snapshot ile korunur.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            <div id="raporlama" className="methodology-formula-card">
              <div className="formula-header">
                <FileSpreadsheet size={18} />
                <span>Örnek Hesaplama Özeti</span>
              </div>

              <div className="formula-equation">
                <code>
                  Emisyon (kgCO₂e) = Σ (Faaliyet Verisi × EFᵢ × GWPᵢ)
                </code>
              </div>

              <div className="formula-breakdown">
                <div className="formula-row">
                  <span>Örnek Tesis Tüketimi</span>
                  <strong>12.000 m³ Doğalgaz</strong>
                </div>
                <div className="formula-row">
                  <span>CO₂ Kaynaklı Emisyon</span>
                  <strong>22.600 kgCO₂e</strong>
                </div>
                <div className="formula-row">
                  <span>CH₄ Kaynaklı Emisyon (GWP: 28)</span>
                  <strong>30 kgCO₂e</strong>
                </div>
                <div className="formula-row">
                  <span>N₂O Kaynaklı Emisyon (GWP: 265)</span>
                  <strong>11 kgCO₂e</strong>
                </div>
                <div className="formula-row formula-row-total">
                  <span>Toplam Karbon Ayak İzi</span>
                  <strong>22.641 kgCO₂e</strong>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Bottom Call To Action */}
      <section className="landing-cta-section">
        <div className="landing-container">
          <div className="landing-cta-card">
            <div>
              <h2>Kurumsal karbon ayak izi yönetimine bugün başlayın</h2>
              <p>
                Yeni bir şirket hesabı oluşturun veya mevcut kurumsal hesabınızla
                giriş yaparak değerlendirme dönemlerinizi yönetin.
              </p>
            </div>

            <div className="landing-cta-buttons">
              {isLoggedIn ? (
                <Link
                  to="/dashboard"
                  className="landing-btn landing-btn-primary landing-btn-lg"
                >
                  <span>Yönetim Paneline Git</span>
                  <ArrowRight size={18} />
                </Link>
              ) : (
                <>
                  <Link
                    to="/register"
                    className="landing-btn landing-btn-primary landing-btn-lg"
                  >
                    <span>Hesap Oluştur</span>
                    <ArrowRight size={18} />
                  </Link>
                  <Link
                    to="/login"
                    className="landing-btn landing-btn-secondary-light landing-btn-lg"
                  >
                    <span>Giriş Yap</span>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="landing-footer">
        <div className="landing-container landing-footer-inner">
          <div className="landing-footer-brand">
            <div className="landing-brand">
              <span className="landing-brand-icon">
                <img src={brandSymbol} alt="PlanBattery Logo" />
              </span>
              <span className="landing-brand-text">
                <strong>PlanBattery</strong>
                <small>Karbon Ayak İzi</small>
              </span>
            </div>
            <p>
              Kurumsal enerji ve doğalgaz faaliyetlerinden kaynaklanan sera gazı
              emisyonlarının izlenmesi, hesaplanması ve raporlanması için
              geliştirilmiş yönetim platformu.
            </p>
          </div>

          <div className="landing-footer-links">
            <div>
              <h4>Platform</h4>
              <a href="#ozellikler">Özellikler</a>
              <a href="#nasil-calisir">Nasıl Çalışır?</a>
              <a href="#metodoloji">Metodoloji</a>
            </div>
            <div>
              <h4>Erişim</h4>
              <Link to="/login">Giriş Yap</Link>
              <Link to="/register">Kayıt Ol</Link>
              <Link to="/dashboard">Yönetim Paneli</Link>
            </div>
          </div>
        </div>

        <div className="landing-container landing-footer-bottom">
          <span>
            © {new Date().getFullYear()} PlanBattery. Tüm hakları saklıdır.
          </span>
          <span>ISO 14064-1 · GHG Protocol Kurumsal Standart</span>
        </div>
      </footer>
    </div>
  )
}

export default LandingPage

