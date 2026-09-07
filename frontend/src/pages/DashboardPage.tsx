import { Link } from 'react-router-dom'
import './DashboardPage.css'

type User = { name?: string; tenantName?: string; tenantRole?: string }
function getUser(): User { try { return JSON.parse(localStorage.getItem('kai_user') ?? '{}') as User } catch { return {} } }

function AdminDashboard({ user }: { user: User }) {
  return <>
    <header className="dashboard-header"><div><span className="eyebrow">2026 KURUMSAL KARBON DEĞERLENDİRMESİ</span><h1>Genel Bakış</h1><p>{user.tenantName} şirketinin güncel emisyon ve faaliyet durumu.</p></div><Link className="primary-action" to="/activities/new">+ Yeni faaliyet kaydı</Link></header>
    <div className="metric-grid"><article className="metric-card featured"><span>Toplam emisyon</span><strong>22,641 <small>tCO₂e</small></strong><em>Hesaplanan kayıtlar</em></article><article className="metric-card"><span>Toplam faaliyet</span><strong>4</strong><em>2 tesis genelinde</em></article><article className="metric-card"><span>Doğrulama bekleyen</span><strong>2</strong><em className="warning-text">İşlem gerekiyor</em></article><article className="metric-card"><span>Veri tamamlama</span><strong>%75</strong><em>Hedefe 1 kayıt kaldı</em></article></div>
    <div className="dashboard-grid">
      <section className="panel trend-panel"><div className="panel-heading"><div><h2>Emisyon eğilimi</h2><p>Aylık toplam tCO₂e</p></div><span className="soft-badge">Son 4 ay</span></div><div className="chart"><div className="chart-line"><i style={{height:'58%'}}/><i style={{height:'42%'}}/><i style={{height:'68%'}}/><i style={{height:'52%'}}/></div><div className="chart-labels"><span>Ocak</span><span>Şubat</span><span>Mart</span><span>Nisan</span></div></div></section>
      <section className="panel composition-panel"><div className="panel-heading"><div><h2>Emisyon bileşimi</h2><p>Sera gazı dağılımı</p></div></div><div className="donut-row"><div className="donut"><div><strong>22,641</strong><span>tCO₂e</span></div></div><ul className="legend"><li><i className="co2"/><span>CO₂</span><strong>%99,82</strong></li><li><i className="ch4"/><span>CH₄</span><strong>%0,13</strong></li><li><i className="n2o"/><span>N₂O</span><strong>%0,05</strong></li></ul></div></section>
      <section className="panel activity-panel"><div className="panel-heading"><div><h2>Son faaliyetler</h2><p>En son güncellenen kayıtlar</p></div><Link to="/activities">Tümünü gör</Link></div><div className="compact-table"><div><span>Ocak 2026 · Bucak</span><strong>12.000 m³</strong><em className="success-pill">Hesaplandı</em></div><div><span>Şubat 2026 · Burdur Merkez</span><strong>8.000 m³</strong><em className="pending-pill">Doğrulama bekliyor</em></div><div><span>Nisan 2026 · Burdur Merkez</span><strong>6.500 m³</strong><em className="error-pill">Hesaplanamadı</em></div></div></section>
    </div>
  </>
}

function EntryDashboard({ user }: { user: User }) {
  return <><header className="dashboard-header"><div><span className="eyebrow">VERİ GİRİŞİ ÇALIŞMA ALANI</span><h1>Merhaba, {user.name?.split(' ')[0]}</h1><p>Size ait faaliyet kayıtlarını oluşturun ve durumlarını takip edin.</p></div><Link className="primary-action" to="/activities/new">+ Yeni doğalgaz kaydı</Link></header><div className="metric-grid entry-metrics"><article className="metric-card featured"><span>Gönderdiğim kayıt</span><strong>4</strong><em>2026 değerlendirmesi</em></article><article className="metric-card"><span>Düzeltme gereken</span><strong>1</strong><em className="warning-text">Kontrol etmeniz gerekiyor</em></article><article className="metric-card"><span>Doğrulanan</span><strong>2</strong><em>Başarıyla tamamlandı</em></article></div><section className="panel task-panel"><div className="panel-heading"><div><h2>İş listeniz</h2><p>Öncelikli kayıt ve işlemler</p></div><Link to="/activities">Kayıtlarıma git</Link></div><div className="task-list"><article><span className="task-mark urgent">!</span><div><strong>Nisan 2026 kaydını düzeltin</strong><p>Geçerli emisyon faktörü bulunamadı.</p></div><Link to="/activities/4">Sorunu gör</Link></article><article><span className="task-mark">✓</span><div><strong>Şubat 2026 kaydı gönderildi</strong><p>Şirket yöneticisinin doğrulaması bekleniyor.</p></div><Link to="/activities/2">Görüntüle</Link></article></div></section></>
}

export default function DashboardPage() { const user = getUser(); return <section className="dashboard-page">{user.tenantRole === 'COMPANY_ADMIN' ? <AdminDashboard user={user}/> : <EntryDashboard user={user}/>}</section> }
