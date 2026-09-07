import { useState } from 'react'
import './SettingsPage.css'
type User = { name?: string; email?: string; role?: string; tenantName?: string }
export default function SettingsPage() {
  let user: User = {}; try { user = JSON.parse(localStorage.getItem('kai_user') ?? '{}') as User } catch { user = {} }
  const [compact, setCompact] = useState(localStorage.getItem('kai_compact_tables') === 'true')
  function updateCompact(value: boolean) { setCompact(value); localStorage.setItem('kai_compact_tables', String(value)) }
  return <section className="settings-page"><header><span className="eyebrow">HESAP VE UYGULAMA</span><h1>Ayarlar</h1><p>Profil bilgilerinizi ve arayüz tercihlerinizi görüntüleyin.</p></header><div className="settings-grid"><article className="settings-card"><h2>Profil bilgileri</h2><p>Bu bilgiler hesabınızdan otomatik alınır.</p><dl><div><dt>Ad soyad</dt><dd>{user.name}</dd></div><div><dt>E-posta</dt><dd>{user.email}</dd></div><div><dt>Yetki</dt><dd>{user.role}</dd></div></dl></article><article className="settings-card"><h2>Şirket bağlamı</h2><p>Şu anda işlem yaptığınız organizasyon.</p><dl><div><dt>Şirket</dt><dd>{user.tenantName}</dd></div><div><dt>Değerlendirme</dt><dd>2026 Kurumsal Karbon Değerlendirmesi</dd></div></dl></article><article className="settings-card interface-settings"><h2>Arayüz</h2><p>Çalışma biçiminize uygun görünümü seçin.</p><label><div><strong>Sıkıştırılmış tablolar</strong><span>Liste satırlarında daha fazla kayıt gösterir.</span></div><input type="checkbox" checked={compact} onChange={(event) => updateCompact(event.target.checked)}/></label><div className="setting-note">Sol menüdeki ☰ düğmesiyle menüyü istediğiniz zaman açıp kapatabilirsiniz.</div></article></div></section>
}
