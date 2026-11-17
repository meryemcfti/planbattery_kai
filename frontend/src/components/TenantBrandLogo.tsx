import { useEffect, useState } from 'react'
import type { ChangeEvent } from 'react'
import { Building2, Upload } from 'lucide-react'
import {
  getCurrentUser,
  getTenantLogo,
  setTenantLogo,
} from '../services/activityStore'

type Props = {
  tenantName?: string
  allowUpload?: boolean
}

export default function TenantBrandLogo({
  tenantName,
  allowUpload = false,
}: Props) {
  const user = getCurrentUser()
  const company = tenantName || user.tenantName || 'Kurumsal Şirket'
  const [logoUrl, setLogoUrl] = useState<string | null>(getTenantLogo)

  useEffect(() => {
    function syncLogo() {
      setLogoUrl(getTenantLogo())
    }
    window.addEventListener('kai-logo-updated', syncLogo)
    return () => {
      window.removeEventListener('kai-logo-updated', syncLogo)
    }
  }, [])

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        setTenantLogo(reader.result)
        setLogoUrl(reader.result)
      }
    }
    reader.readAsDataURL(file)
    e.target.value = ''
  }

  const monogram = company
    .split(/\s+/)
    .map((w) => w[0])
    .join('')
    .slice(0, 3)
    .toUpperCase()

  return (
    <div className="tenant-brand-logo-wrap">
      <div className="tenant-brand-identity">
        {logoUrl ? (
          <img
            src={logoUrl}
            alt={`${company} Logosu`}
            className="tenant-custom-logo-img"
          />
        ) : (
          <div className="tenant-default-emblem">
            <Building2 size={18} />
            <span>{monogram}</span>
          </div>
        )}
        <div className="tenant-brand-titles">
          <strong>{company}</strong>
          <small>Kurumsal Sera Gazı Envanteri</small>
        </div>
      </div>

      {allowUpload && (
        <label
          className="tenant-logo-upload-trigger no-print-col"
          title="PDF ve raporlarda görünecek kurum logonuzu yükleyin"
        >
          <input
            type="file"
            accept="image/*"
            onChange={handleLogoChange}
          />
          <Upload size={13} />
          <span>{logoUrl ? 'Kurum Logosunu Değiştir' : 'Kurum Logosu Yükle'}</span>
        </label>
      )}
    </div>
  )
}
