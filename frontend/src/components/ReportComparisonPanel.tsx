import { useMemo, useState } from 'react'
import {
  ArrowDownRight,
  ArrowUpRight,
  BarChart3,
  Building2,
  CalendarRange,
  Minus,
} from 'lucide-react'
import { getActivities } from '../services/activityStore'
import type { Activity } from '../services/activityStore'
import type { SavedReport } from '../services/reportStore'
import './ReportComparisonPanel.css'

type ComparisonGranularity =
  | 'YEARLY'
  | 'MONTHLY'
  | 'WEEKLY'
  | 'FACILITY'
  | 'CUSTOM'

type DateWindow = {
  label: string
  start: string
  end: string
}

type PeriodMetrics = {
  kgCo2e: number
  m3: number
  recordCount: number
  byFacility: Map<string, { name: string; kgCo2e: number; m3: number }>
}

const MS_PER_DAY = 24 * 60 * 60 * 1000

function toUtcMs(dateStr: string): number {
  const [y, m, d] = dateStr.split('-').map(Number)
  if (!y || !m || !d) return NaN
  return Date.UTC(y, m - 1, d)
}

function formatUtcDate(ms: number): string {
  const d = new Date(ms)
  const yyyy = d.getUTCFullYear()
  const mm = String(d.getUTCMonth() + 1).padStart(2, '0')
  const dd = String(d.getUTCDate()).padStart(2, '0')
  return `${yyyy}-${mm}-${dd}`
}

function formatDisplayDate(dateStr: string): string {
  if (!dateStr) return '—'
  const [y, m, d] = dateStr.split('-')
  if (!y || !m || !d) return dateStr
  return `${d}.${m}.${y}`
}

function getIsoWeekWindow(isoWeek: string): DateWindow | null {
  const match = /^(\d{4})-W(\d{2})$/.exec(isoWeek)
  if (!match) return null
  const year = Number(match[1])
  const week = Number(match[2])
  // Jan 4 is always in ISO week 1
  const jan4 = new Date(Date.UTC(year, 0, 4))
  const jan4Day = jan4.getUTCDay() || 7
  const mondayWeek1 = jan4.getTime() - (jan4Day - 1) * MS_PER_DAY
  const startMs = mondayWeek1 + (week - 1) * 7 * MS_PER_DAY
  const endMs = startMs + 6 * MS_PER_DAY
  const start = formatUtcDate(startMs)
  const end = formatUtcDate(endMs)
  return {
    label: `${year} · ${week}. Hafta (${formatDisplayDate(start)} – ${formatDisplayDate(end)})`,
    start,
    end,
  }
}

function getMonthWindow(monthStr: string): DateWindow | null {
  const match = /^(\d{4})-(\d{2})$/.exec(monthStr)
  if (!match) return null
  const year = Number(match[1])
  const month = Number(match[2])
  const lastDay = new Date(Date.UTC(year, month, 0)).getUTCDate()
  const start = `${year}-${String(month).padStart(2, '0')}-01`
  const end = `${year}-${String(month).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`
  const monthLabel = new Intl.DateTimeFormat('tr-TR', {
    month: 'long',
    year: 'numeric',
    timeZone: 'UTC',
  }).format(new Date(Date.UTC(year, month - 1, 1)))
  return {
    label: monthLabel.charAt(0).toUpperCase() + monthLabel.slice(1),
    start,
    end,
  }
}

function getActivityKgCo2e(act: Activity): number {
  if (!act.calculation) return 0
  return act.consumptionValue * 1.88675
}

function computeWindowMetrics(
  activities: Activity[],
  winStart: string,
  winEnd: string,
  facilityFilter: string,
  onlyValidated: boolean,
): PeriodMetrics {
  const startMs = toUtcMs(winStart)
  const endMs = toUtcMs(winEnd)
  const byFacility = new Map<
    string,
    { name: string; kgCo2e: number; m3: number }
  >()

  if (!Number.isFinite(startMs) || !Number.isFinite(endMs) || startMs > endMs) {
    return { kgCo2e: 0, m3: 0, recordCount: 0, byFacility }
  }

  let totalKg = 0
  let totalM3 = 0
  let recordCount = 0

  for (const act of activities) {
    if (facilityFilter !== 'ALL' && act.facilityId !== facilityFilter) continue
    if (onlyValidated && act.status !== 'VALIDATED') continue

    const actStart = toUtcMs(act.periodStart)
    const actEnd = toUtcMs(act.periodEnd)
    if (!Number.isFinite(actStart) || !Number.isFinite(actEnd)) continue
    if (actStart > endMs || actEnd < startMs) continue

    const actDays = Math.max(1, Math.round((actEnd - actStart) / MS_PER_DAY) + 1)
    const overlapStart = Math.max(actStart, startMs)
    const overlapEnd = Math.min(actEnd, endMs)
    const overlapDays = Math.max(
      0,
      Math.round((overlapEnd - overlapStart) / MS_PER_DAY) + 1,
    )
    if (overlapDays <= 0) continue

    const ratio = overlapDays / actDays
    const m3Share = act.consumptionValue * ratio
    const kgShare = getActivityKgCo2e(act) * ratio

    totalM3 += m3Share
    totalKg += kgShare
    recordCount += 1

    const existing = byFacility.get(act.facility) ?? {
      name: act.facility,
      kgCo2e: 0,
      m3: 0,
    }
    existing.m3 += m3Share
    existing.kgCo2e += kgShare
    byFacility.set(act.facility, existing)
  }

  return {
    kgCo2e: Math.round(totalKg),
    m3: Math.round(totalM3),
    recordCount,
    byFacility,
  }
}

export default function ReportComparisonPanel({
  reports,
  facilities,
}: {
  reports: SavedReport[]
  facilities: Array<{ id: string; name: string }>
}) {
  const activities = useMemo(() => getActivities(), [])

  const [granularity, setGranularity] =
    useState<ComparisonGranularity>('MONTHLY')
  const [facilityFilter, setFacilityFilter] = useState<string>('ALL')
  const [onlyValidated, setOnlyValidated] = useState<boolean>(false)

  // Yearly
  const [yearA, setYearA] = useState<string>('2026')
  const [yearB, setYearB] = useState<string>('2025')

  // Monthly
  const [monthA, setMonthA] = useState<string>('2026-10')
  const [monthB, setMonthB] = useState<string>('2026-09')

  // Weekly
  const [weekA, setWeekA] = useState<string>('2026-W42')
  const [weekB, setWeekB] = useState<string>('2026-W41')

  // Facility-to-Facility
  const [facilityA, setFacilityA] = useState<string>(
    () => facilities[0]?.id ?? 'bucak',
  )
  const [facilityB, setFacilityB] = useState<string>(
    () => facilities[1]?.id ?? facilities[0]?.id ?? 'burdur-merkez',
  )
  const [facilityPeriodYear, setFacilityPeriodYear] = useState<string>('ALL')

  // Custom
  const [customStartA, setCustomStartA] = useState<string>('2026-10-01')
  const [customEndA, setCustomEndA] = useState<string>('2026-10-31')
  const [customStartB, setCustomStartB] = useState<string>('2026-09-01')
  const [customEndB, setCustomEndB] = useState<string>('2026-09-30')

  const availableYears = useMemo(() => {
    const years = new Set<string>(['2026', '2025', '2024'])
    for (const act of activities) {
      if (act.periodStart?.slice(0, 4)) years.add(act.periodStart.slice(0, 4))
    }
    return Array.from(years).sort((a, b) => Number(b) - Number(a))
  }, [activities])

  const windowA: DateWindow = useMemo(() => {
    if (granularity === 'YEARLY') {
      return {
        label: `${yearA} Yılı`,
        start: `${yearA}-01-01`,
        end: `${yearA}-12-31`,
      }
    }
    if (granularity === 'MONTHLY') {
      return (
        getMonthWindow(monthA) ?? {
          label: monthA,
          start: `${monthA}-01`,
          end: `${monthA}-28`,
        }
      )
    }
    if (granularity === 'WEEKLY') {
      return (
        getIsoWeekWindow(weekA) ?? {
          label: weekA,
          start: '2026-10-12',
          end: '2026-10-18',
        }
      )
    }
    if (granularity === 'FACILITY') {
      const facName =
        facilities.find((f) => f.id === facilityA)?.name ?? facilityA
      return {
        label: facName,
        start:
          facilityPeriodYear === 'ALL'
            ? '2000-01-01'
            : `${facilityPeriodYear}-01-01`,
        end:
          facilityPeriodYear === 'ALL'
            ? '2099-12-31'
            : `${facilityPeriodYear}-12-31`,
      }
    }
    return {
      label: `${formatDisplayDate(customStartA)} – ${formatDisplayDate(customEndA)}`,
      start: customStartA,
      end: customEndA,
    }
  }, [
    granularity,
    yearA,
    monthA,
    weekA,
    facilityA,
    facilityPeriodYear,
    facilities,
    customStartA,
    customEndA,
  ])

  const windowB: DateWindow = useMemo(() => {
    if (granularity === 'YEARLY') {
      return {
        label: `${yearB} Yılı`,
        start: `${yearB}-01-01`,
        end: `${yearB}-12-31`,
      }
    }
    if (granularity === 'MONTHLY') {
      return (
        getMonthWindow(monthB) ?? {
          label: monthB,
          start: `${monthB}-01`,
          end: `${monthB}-28`,
        }
      )
    }
    if (granularity === 'WEEKLY') {
      return (
        getIsoWeekWindow(weekB) ?? {
          label: weekB,
          start: '2026-10-05',
          end: '2026-10-11',
        }
      )
    }
    if (granularity === 'FACILITY') {
      const facName =
        facilities.find((f) => f.id === facilityB)?.name ?? facilityB
      return {
        label: facName,
        start:
          facilityPeriodYear === 'ALL'
            ? '2000-01-01'
            : `${facilityPeriodYear}-01-01`,
        end:
          facilityPeriodYear === 'ALL'
            ? '2099-12-31'
            : `${facilityPeriodYear}-12-31`,
      }
    }
    return {
      label: `${formatDisplayDate(customStartB)} – ${formatDisplayDate(customEndB)}`,
      start: customStartB,
      end: customEndB,
    }
  }, [
    granularity,
    yearB,
    monthB,
    weekB,
    facilityB,
    facilityPeriodYear,
    facilities,
    customStartB,
    customEndB,
  ])

  const metricsA = useMemo(
    () =>
      computeWindowMetrics(
        activities,
        windowA.start,
        windowA.end,
        granularity === 'FACILITY' ? facilityA : facilityFilter,
        onlyValidated,
      ),
    [
      activities,
      windowA.start,
      windowA.end,
      granularity,
      facilityA,
      facilityFilter,
      onlyValidated,
    ],
  )

  const metricsB = useMemo(
    () =>
      computeWindowMetrics(
        activities,
        windowB.start,
        windowB.end,
        granularity === 'FACILITY' ? facilityB : facilityFilter,
        onlyValidated,
      ),
    [
      activities,
      windowB.start,
      windowB.end,
      granularity,
      facilityB,
      facilityFilter,
      onlyValidated,
    ],
  )

  const diffKg = metricsA.kgCo2e - metricsB.kgCo2e
  const diffM3 = metricsA.m3 - metricsB.m3
  const pctKg =
    metricsB.kgCo2e > 0
      ? ((diffKg / metricsB.kgCo2e) * 100).toFixed(1)
      : metricsA.kgCo2e > 0
        ? '100.0'
        : '0.0'

  const maxBarKg = Math.max(metricsA.kgCo2e, metricsB.kgCo2e, 1)

  const facilityRows = useMemo(() => {
    const names = new Set<string>([
      ...metricsA.byFacility.keys(),
      ...metricsB.byFacility.keys(),
    ])
    return Array.from(names).map((name) => {
      const a = metricsA.byFacility.get(name) ?? { name, kgCo2e: 0, m3: 0 }
      const b = metricsB.byFacility.get(name) ?? { name, kgCo2e: 0, m3: 0 }
      const delta = Math.round(a.kgCo2e - b.kgCo2e)
      const pct =
        b.kgCo2e > 0
          ? (((a.kgCo2e - b.kgCo2e) / b.kgCo2e) * 100).toFixed(1)
          : a.kgCo2e > 0
            ? '100.0'
            : '0.0'
      return {
        name,
        kgA: Math.round(a.kgCo2e),
        kgB: Math.round(b.kgCo2e),
        m3A: Math.round(a.m3),
        m3B: Math.round(b.m3),
        delta,
        pct,
      }
    })
  }, [metricsA.byFacility, metricsB.byFacility])

  function applyReportToSlot(reportId: string, slot: 'A' | 'B') {
    const rep = reports.find((r) => r.id === reportId)
    if (!rep) return
    setGranularity('CUSTOM')
    if (slot === 'A') {
      setCustomStartA(rep.options.periodStart || '2026-01-01')
      setCustomEndA(rep.options.periodEnd || '2026-12-31')
    } else {
      setCustomStartB(rep.options.periodStart || '2026-01-01')
      setCustomEndB(rep.options.periodEnd || '2026-12-31')
    }
  }

  return (
    <section
      id="comparison"
      className="comparison-panel"
      aria-label="Dönemsel Emisyon ve Rapor Karşılaştırma"
    >
      <div className="comparison-header">
        <div className="comparison-title-wrap">
          <span className="comparison-icon-box">
            <BarChart3 size={20} />
          </span>
          <div>
            <h2>Dönemsel Rapor ve Tesisler Özelinde Emisyon Karşılaştırması</h2>
            <p>
              Yıldan yıla, aydan aya, haftadan haftaya veya özel tarih
              aralıklarına göre şirket geneli ve tesisler özelinde kıyaslayın.
            </p>
          </div>
        </div>

        <div className="comparison-granularity-tabs" role="tablist">
          {(
            [
              { key: 'YEARLY', label: 'Yıldan Yıla' },
              { key: 'MONTHLY', label: 'Aydan Aya' },
              { key: 'WEEKLY', label: 'Haftadan Haftaya' },
              { key: 'FACILITY', label: 'Tesisler Özelinde' },
              { key: 'CUSTOM', label: 'Özel / Rapor' },
            ] as const
          ).map((tab) => (
            <button
              key={tab.key}
              type="button"
              role="tab"
              aria-selected={granularity === tab.key}
              className={`comparison-tab-btn ${granularity === tab.key ? 'active' : ''}`}
              onClick={() => setGranularity(tab.key)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      <div className="comparison-controls">
        <div className="comparison-slot">
          <span className="slot-badge slot-a">
            {granularity === 'FACILITY'
              ? '1. Tesis (Karşılaştırılan A)'
              : '1. Dönem (Güncel / Hedef)'}
          </span>
          {granularity === 'YEARLY' && (
            <select value={yearA} onChange={(e) => setYearA(e.target.value)}>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y} Yılı
                </option>
              ))}
            </select>
          )}
          {granularity === 'MONTHLY' && (
            <input
              type="month"
              value={monthA}
              onChange={(e) => setMonthA(e.target.value)}
            />
          )}
          {granularity === 'WEEKLY' && (
            <input
              type="week"
              value={weekA}
              onChange={(e) => setWeekA(e.target.value)}
            />
          )}
          {granularity === 'FACILITY' && (
            <select
              value={facilityA}
              onChange={(e) => setFacilityA(e.target.value)}
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          )}
          {granularity === 'CUSTOM' && (
            <div className="custom-range-row">
              <input
                type="date"
                value={customStartA}
                onChange={(e) => setCustomStartA(e.target.value)}
              />
              <span>–</span>
              <input
                type="date"
                value={customEndA}
                onChange={(e) => setCustomEndA(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="comparison-slot">
          <span className="slot-badge slot-b">
            {granularity === 'FACILITY'
              ? '2. Tesis (Karşılaştırılan B)'
              : '2. Dönem (Karşılaştırılan)'}
          </span>
          {granularity === 'YEARLY' && (
            <select value={yearB} onChange={(e) => setYearB(e.target.value)}>
              {availableYears.map((y) => (
                <option key={y} value={y}>
                  {y} Yılı
                </option>
              ))}
            </select>
          )}
          {granularity === 'MONTHLY' && (
            <input
              type="month"
              value={monthB}
              onChange={(e) => setMonthB(e.target.value)}
            />
          )}
          {granularity === 'WEEKLY' && (
            <input
              type="week"
              value={weekB}
              onChange={(e) => setWeekB(e.target.value)}
            />
          )}
          {granularity === 'FACILITY' && (
            <select
              value={facilityB}
              onChange={(e) => setFacilityB(e.target.value)}
            >
              {facilities.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.name}
                </option>
              ))}
            </select>
          )}
          {granularity === 'CUSTOM' && (
            <div className="custom-range-row">
              <input
                type="date"
                value={customStartB}
                onChange={(e) => setCustomStartB(e.target.value)}
              />
              <span>–</span>
              <input
                type="date"
                value={customEndB}
                onChange={(e) => setCustomEndB(e.target.value)}
              />
            </div>
          )}
        </div>

        <div className="comparison-slot">
          <span className="slot-badge slot-filter">
            {granularity === 'FACILITY'
              ? 'Dönem & Kayıt Filtresi'
              : 'Tesisler Özelinde & Kayıt Filtresi'}
          </span>
          <div className="comparison-filter-stack">
            {granularity === 'FACILITY' ? (
              <select
                value={facilityPeriodYear}
                onChange={(e) => setFacilityPeriodYear(e.target.value)}
              >
                <option value="ALL">Tüm Dönemler</option>
                {availableYears.map((y) => (
                  <option key={y} value={y}>
                    {y} Yılı
                  </option>
                ))}
              </select>
            ) : (
              <select
                value={facilityFilter}
                onChange={(e) => setFacilityFilter(e.target.value)}
              >
                <option value="ALL">Tüm Tesisler (Şirket Geneli)</option>
                {facilities.map((f) => (
                  <option key={f.id} value={f.id}>
                    {f.name}
                  </option>
                ))}
              </select>
            )}

            <label className="comparison-checkbox">
              <input
                type="checkbox"
                checked={onlyValidated}
                onChange={(e) => setOnlyValidated(e.target.checked)}
              />
              <span>Yalnızca uzman onaylı kayıtlar</span>
            </label>
          </div>
        </div>
      </div>

      {reports.length > 0 && granularity === 'CUSTOM' && (
        <div className="comparison-report-presets">
          <span>Kayıtlı Rapor Tarihlerini Yükle:</span>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) applyReportToSlot(e.target.value, 'A')
            }}
          >
            <option value="">1. Döneme Rapor Seç...</option>
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
          <select
            defaultValue=""
            onChange={(e) => {
              if (e.target.value) applyReportToSlot(e.target.value, 'B')
            }}
          >
            <option value="">2. Döneme Rapor Seç...</option>
            {reports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name}
              </option>
            ))}
          </select>
        </div>
      )}

      <div className="comparison-kpi-grid">
        <article className="comparison-kpi-card">
          <div className="kpi-label-row">
            <CalendarRange size={14} />
            <span>1. Dönem · {windowA.label}</span>
          </div>
          <strong>{metricsA.kgCo2e.toLocaleString('tr-TR')} kgCO₂e</strong>
          <small>
            {metricsA.m3.toLocaleString('tr-TR')} m³ doğalgaz ·{' '}
            {metricsA.recordCount} kayıt
          </small>
          <div className="comparison-bar-track">
            <span
              className="bar-a"
              style={{
                width: `${Math.max(4, Math.round((metricsA.kgCo2e / maxBarKg) * 100))}%`,
              }}
            />
          </div>
        </article>

        <article className="comparison-kpi-card">
          <div className="kpi-label-row">
            <CalendarRange size={14} />
            <span>2. Dönem · {windowB.label}</span>
          </div>
          <strong>{metricsB.kgCo2e.toLocaleString('tr-TR')} kgCO₂e</strong>
          <small>
            {metricsB.m3.toLocaleString('tr-TR')} m³ doğalgaz ·{' '}
            {metricsB.recordCount} kayıt
          </small>
          <div className="comparison-bar-track">
            <span
              className="bar-b"
              style={{
                width: `${Math.max(4, Math.round((metricsB.kgCo2e / maxBarKg) * 100))}%`,
              }}
            />
          </div>
        </article>

        <article
          className={`comparison-kpi-card delta-card ${
            diffKg < 0 ? 'is-down' : diffKg > 0 ? 'is-up' : 'is-flat'
          }`}
        >
          <div className="kpi-label-row">
            {diffKg < 0 ? (
              <ArrowDownRight size={15} />
            ) : diffKg > 0 ? (
              <ArrowUpRight size={15} />
            ) : (
              <Minus size={15} />
            )}
            <span>Net Fark (1. Dönem − 2. Dönem)</span>
          </div>
          <strong>
            {diffKg > 0 ? '+' : ''}
            {diffKg.toLocaleString('tr-TR')} kgCO₂e
          </strong>
          <div className="delta-meta-row">
            <span className="delta-pct-pill">
              {diffKg > 0 ? '+' : ''}
              %{pctKg}
            </span>
            <small>
              {diffM3 > 0 ? '+' : ''}
              {diffM3.toLocaleString('tr-TR')} m³ fark
            </small>
          </div>
        </article>
      </div>

      {facilityRows.length > 0 && (
        <div className="comparison-facility-section">
          <div className="comparison-facility-heading">
            <h3>Tesisler Özelinde Karşılaştırma</h3>
            <span>
              Seçilen dönemler arasındaki emisyon değişiminin tesis bazlı
              dağılımı
            </span>
          </div>
          <div className="comparison-facility-table-wrap">
          <table className="comparison-facility-table">
            <thead>
              <tr>
                <th>Tesis</th>
                <th>1. Dönem (kgCO₂e)</th>
                <th>2. Dönem (kgCO₂e)</th>
                <th>Fark (kgCO₂e)</th>
                <th>Değişim</th>
              </tr>
            </thead>
            <tbody>
              {facilityRows.map((row) => (
                <tr key={row.name}>
                  <td>
                    <span className="table-facility-cell">
                      <Building2 size={14} />
                      <strong>{row.name}</strong>
                    </span>
                  </td>
                  <td>{row.kgA.toLocaleString('tr-TR')}</td>
                  <td>{row.kgB.toLocaleString('tr-TR')}</td>
                  <td>
                    {row.delta > 0 ? '+' : ''}
                    {row.delta.toLocaleString('tr-TR')}
                  </td>
                  <td>
                    <span
                      className={`table-pct-badge ${
                        row.delta < 0 ? 'down' : row.delta > 0 ? 'up' : 'flat'
                      }`}
                    >
                      {row.delta > 0 ? '+' : ''}%{row.pct}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          </div>
        </div>
      )}
    </section>
  )
}
