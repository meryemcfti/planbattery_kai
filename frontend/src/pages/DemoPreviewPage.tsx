import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  ArrowRight,
  BarChart3,
  Building2,
  Calculator,
  FileCheck2,
  Flame,
  Lock,
  ShieldCheck,
} from 'lucide-react'
import brandSymbol from '../assets/planbattery-symbol.svg'
import './DemoPreviewPage.css'

const SAMPLE_FACILITIES = [
  { name: 'Örnek Üretim Tesisi A', m3: 18500, kgCo2e: 34905 },
  { name: 'Örnek Lojistik Tesisi B', m3: 6200, kgCo2e: 11698 },
]

export default function DemoPreviewPage() {
  const [m3Input, setM3Input] = useState<string>('10000')

  const calc = useMemo(() => {
    const val = Number(m3Input)
    if (!Number.isFinite(val) || val <= 0) {
      return { m3: 0, kgCo2e: 0, tCo2e: '0,00' }
    }
    const kg = Math.round(val * 1.88675)
    const ton = (kg / 1000).toLocaleString('tr-TR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })
    return { m3: val, kgCo2e: kg, tCo2e: ton }
  }, [m3Input])

  return (
    <div className="demo-preview-page">
      {/* Top Bar */}
      <header className="demo-topbar">
        <Link to="/" className="demo-brand">
          <span className="demo-brand-icon">
            <img src={brandSymbol} alt="PlanBattery Logo" />
          </span>
          <span>
            <strong>PlanBattery</strong>
            <small>Ücretsiz Demo Önizleme</small>
          </span>
        </Link>

        <div className="demo-topbar-actions">
          <Link to="/login" className="demo-btn-ghost">
            Giriş Yap
          </Link>
          <Link to="/register" className="demo-btn-primary">
            <span>Kurumsal Kayıt Ol</span>
            <ArrowRight size={15} />
          </Link>
        </div>
      </header>

      <main className="demo-container">
        {/* Banner */}
        <section className="demo-hero-banner">
          <h1>PlanBattery Kurumsal Karbon Platformu Önizlemesi</h1>
          <p>
            Kayıt olmadan temel doğalgaz emisyon hesaplamasını deneyebilir ve
            platform arayüzünü inceleyebilirsiniz. Dönemsel karşılaştırma, detaylı
            hesaplama matrisi, belge yönetimi ve QR doğrulamalı PDF raporlar
            kurumsal hesaplarda aktiftir.
          </p>
        </section>

        {/* Main 2-column grid: Basic Free Calculator + Sample Dashboard Preview */}
        <div className="demo-main-grid">
          <section className="demo-card">
            <div className="demo-card-head">
              <span className="demo-icon-box">
                <Calculator size={18} />
              </span>
              <div>
                <h2>Temel Doğalgaz Emisyon Hesaplayıcı</h2>
                <p>Ücretsiz önizleme — özet Kapsam 1 tahmini</p>
              </div>
            </div>

            <label className="demo-field">
              <span>Aylık Doğalgaz Tüketimi (m³)</span>
              <input
                type="number"
                min={0}
                step="any"
                value={m3Input}
                onChange={(e) => setM3Input(e.target.value)}
                placeholder="Örn. 10000"
              />
            </label>

            <div className="demo-calc-results">
              <article className="demo-result-box featured">
                <span>Tahmini Toplam Emisyon</span>
                <strong>{calc.kgCo2e.toLocaleString('tr-TR')} kgCO₂e</strong>
                <small>{calc.tCo2e} tCO₂e (Yaklaşık)</small>
              </article>
              <article className="demo-result-box">
                <span>Girilen Tüketim</span>
                <strong>{calc.m3.toLocaleString('tr-TR')} m³</strong>
                <small>Sabit yanma · Doğalgaz</small>
              </article>
            </div>

            <div className="demo-note-box">
              <ShieldCheck size={15} />
              <span>
                Demo hesaplamada yalnızca özet sonuç gösterilir. CO₂ / CH₄ / N₂O
                gaz kırılımları, NCV ve IPCC AR5/AR6 matris parametreleri
                kurumsal sürümde yer alır.
              </span>
            </div>
          </section>

          <section className="demo-card">
            <div className="demo-card-head">
              <span className="demo-icon-box">
                <Building2 size={18} />
              </span>
              <div>
                <h2>Kurumsal Panel Önizlemesi (Örnek Veri)</h2>
                <p>Şirketinizin içeride göreceği özet yerleşim</p>
              </div>
            </div>

            <div className="demo-sample-kpis">
              <div>
                <span>Örnek Toplam Emisyon</span>
                <strong>46.603 kgCO₂e</strong>
              </div>
              <div>
                <span>Örnek Tüketim</span>
                <strong>24.700 m³</strong>
              </div>
            </div>

            <div className="demo-sample-facilities">
              {SAMPLE_FACILITIES.map((fac) => (
                <div key={fac.name} className="demo-sample-facility-row">
                  <div>
                    <strong>{fac.name}</strong>
                    <small>{fac.m3.toLocaleString('tr-TR')} m³</small>
                  </div>
                  <span>{fac.kgCo2e.toLocaleString('tr-TR')} kgCO₂e</span>
                </div>
              ))}
            </div>
          </section>
        </div>

        {/* Locked Enterprise Features */}
        <section className="demo-locked-section">
          <div className="demo-locked-header">
            <div>
              <h2>Kurumsal Sürümle Neler Kazanırsınız?</h2>
              <p>
                Şirketinizin tüm tesislerini tek merkezde toplayın; kanıtlı,
                karşılaştırmalı ve denetime hazır karbon yönetimine geçin.
              </p>
            </div>
            <Link to="/register" className="demo-btn-primary demo-btn-lg">
              <span>Ücretsiz Kurumsal Hesap Oluştur</span>
              <ArrowRight size={16} />
            </Link>
          </div>

          <div className="demo-locked-grid">
            <article className="demo-locked-card tone-emerald">
              <div className="locked-top">
                <span className="locked-icon">
                  <BarChart3 size={20} />
                </span>
                <span className="locked-badge">
                  <Lock size={11} /> Kurumsal Özellik
                </span>
              </div>
              <strong>Yıl, Ay, Hafta ve Tesis Karşılaştırması</strong>
              <p>
                Hangi tesisinizde tüketim arttı, geçen aya veya geçen yıla göre
                ne kadar düşüş sağladınız? Tüm farkları tek ekranda görün.
              </p>
              <ul className="locked-benefits">
                <li>Yıldan yıla ve haftadan haftaya trend</li>
                <li>Tesisler arası doğrudan kıyaslama</li>
              </ul>
            </article>

            <article className="demo-locked-card tone-teal">
              <div className="locked-top">
                <span className="locked-icon">
                  <Flame size={20} />
                </span>
                <span className="locked-badge">
                  <Lock size={11} /> Kurumsal Özellik
                </span>
              </div>
              <strong>Belgeli Veri Girişi ve Uzman Onayı</strong>
              <p>
                Çalışanlarınız fatura fotoğrafını ve tüketim bilgisini yüklesin,
                çevre uzmanınız kontrol notuyla onaylasın. Hata riskini sıfırlayın.
              </p>
              <ul className="locked-benefits">
                <li>Fatura ve sayaç kanıt arşivi</li>
                <li>Adım adım denetim ve onay izi</li>
              </ul>
            </article>

            <article className="demo-locked-card tone-amber">
              <div className="locked-top">
                <span className="locked-icon">
                  <FileCheck2 size={20} />
                </span>
                <span className="locked-badge">
                  <Lock size={11} /> Kurumsal Özellik
                </span>
              </div>
              <strong>Kurum Logolu Resmi PDF & Ekip Yetkileri</strong>
              <p>
                Şirket logonuzu taşıyan, QR kodla doğrulanabilen tek sayfa A4
                resmi raporlar alın. Yönetici, uzman ve çalışan yetkilerini ayırın.
              </p>
              <ul className="locked-benefits">
                <li>QR doğrulamalı resmi PDF çıktı</li>
                <li>Yönetici / Uzman / Çalışan ayrımı</li>
              </ul>
            </article>
          </div>
        </section>
      </main>
    </div>
  )
}
