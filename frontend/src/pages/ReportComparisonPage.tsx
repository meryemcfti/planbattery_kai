import { useMemo } from 'react'
import { Link, Navigate } from 'react-router-dom'
import { ArrowLeft, FileSpreadsheet } from 'lucide-react'
import ReportComparisonPanel from '../components/ReportComparisonPanel'
import { getActivities, getCurrentUser } from '../services/activityStore'
import { getReports } from '../services/reportStore'
import './ReportOptionsPage.css'

const baseFacilities: Record<string, string> = {
  bucak: 'Bucak',
  'burdur-merkez': 'Burdur Merkez',
}

export default function ReportComparisonPage() {
  const currentUser = getCurrentUser()
  const canAnalyzeReports =
    currentUser.tenantRole === 'CARBON_SPECIALIST' ||
    currentUser.tenantRole === 'COMPANY_ADMIN'

  const reports = useMemo(() => getReports(), [])
  const facilities = useMemo(() => {
    const map = new Map<string, string>(Object.entries(baseFacilities))
    for (const act of getActivities()) {
      if (act.facilityId && act.facility && !map.has(act.facilityId)) {
        map.set(act.facilityId, act.facility)
      }
    }
    for (const rep of reports) {
      if (
        rep.options.reportScope === 'FACILITY' &&
        rep.options.facilityId &&
        !map.has(rep.options.facilityId)
      ) {
        map.set(rep.options.facilityId, rep.options.facilityId)
      }
    }
    return Array.from(map.entries()).map(([id, name]) => ({ id, name }))
  }, [reports])

  if (!canAnalyzeReports) {
    return <Navigate to="/reports" replace />
  }

  return (
    <section className="report-options-page">
      <header className="report-options-header">
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 16,
            flexWrap: 'wrap',
          }}
        >
          <div>
            <h1>Dönemsel ve Tesis Bazlı Karşılaştırma</h1>
            <p className="page-description">
              Yıldan yıla, aydan aya, haftadan haftaya veya özel tarih
              aralıklarına göre şirket geneli ve tesisler özelinde emisyon
              farklarını analiz edin.
            </p>
          </div>
          <Link
            to="/reports"
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 16px',
              borderRadius: 11,
              background: 'rgba(255, 255, 255, 0.14)',
              border: '1px solid rgba(255, 255, 255, 0.28)',
              color: '#ffffff',
              textDecoration: 'none',
              fontSize: 13.5,
              fontWeight: 700,
              backdropFilter: 'blur(10px)',
            }}
          >
            <ArrowLeft size={16} />
            <FileSpreadsheet size={16} />
            <span>Raporlara Dön</span>
          </Link>
        </div>
      </header>

      <ReportComparisonPanel reports={reports} facilities={facilities} />
    </section>
  )
}
