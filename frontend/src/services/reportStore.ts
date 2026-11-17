export type ReportScope = "COMPANY" | "FACILITY";
export type PeriodType = "ASSESSMENT" | "CUSTOM";
export type RecordScope = "CALCULATED" | "ALL";
export type ReportDetail = "SUMMARY" | "DETAILED";

export type ReportOptions = {
  assessmentId: string;
  reportScope: ReportScope;
  facilityId: string;
  periodType: PeriodType;
  periodStart: string;
  periodEnd: string;
  recordScope: RecordScope;
  reportDetail: ReportDetail;
};

export type SavedReport = {
  id: string;
  assessmentId: string;
  assessmentName: string;
  name: string;
  createdAt: string;
  createdAtMs?: number;
  createdBy: string;
  options: ReportOptions;
};

export type ReportPeriodGroup = {
  key: string;
  assessmentId: string;
  assessmentName: string;
  reports: SavedReport[];
};

type StoredUser = {
  name?: string;
  tenantName?: string;
};

function getUser(): StoredUser {
  try {
    return JSON.parse(localStorage.getItem("kai_user") ?? "{}") as StoredUser;
  } catch {
    return {};
  }
}

function getStorageKey() {
  const tenantName = getUser().tenantName ?? "Şirket";
  return `kai_reports_${encodeURIComponent(tenantName)}`;
}

function saveReports(reports: SavedReport[]) {
  localStorage.setItem(getStorageKey(), JSON.stringify(reports));
}

export function normalizeReportNameKey(name: string) {
  return name.trim().toLocaleLowerCase("tr-TR");
}

export function isReportNameTaken(name: string, reports: SavedReport[]) {
  const target = normalizeReportNameKey(name);
  if (!target) return false;
  return reports.some((r) => normalizeReportNameKey(r.name) === target);
}

export function suggestUniqueReportName(
  baseName: string,
  reports: SavedReport[]
) {
  const cleanBase = baseName.trim();
  let counter = 1;
  while (isReportNameTaken(`${cleanBase} #${counter}`, reports)) {
    counter += 1;
  }
  return `${cleanBase} #${counter}`;
}

export function parseReportTimestamp(report: SavedReport): number {
  if (typeof report.createdAtMs === "number" && Number.isFinite(report.createdAtMs)) {
    return report.createdAtMs;
  }
  const idMatch = /^report-(\d+)$/.exec(report.id);
  if (idMatch) {
    const ms = Number(idMatch[1]);
    if (Number.isFinite(ms)) return ms;
  }
  const trMatch = /^(\d{1,2})\.(\d{1,2})\.(\d{4})(?:\s+(\d{1,2}):(\d{2})(?::(\d{2}))?)?/.exec(
    report.createdAt
  );
  if (trMatch) {
    const [, dd, mm, yyyy, hh = "0", min = "0", ss = "0"] = trMatch;
    return new Date(
      Number(yyyy),
      Number(mm) - 1,
      Number(dd),
      Number(hh),
      Number(min),
      Number(ss)
    ).getTime();
  }
  return 0;
}

function deduplicateLegacyReports(reports: SavedReport[]): {
  normalized: SavedReport[];
  changed: boolean;
} {
  if (reports.length === 0) return { normalized: reports, changed: false };

  // Count occurrences case-insensitively
  const counts = new Map<string, number>();
  for (const rep of reports) {
    const key = normalizeReportNameKey(rep.name);
    counts.set(key, (counts.get(key) ?? 0) + 1);
  }

  const hasDuplicates = Array.from(counts.values()).some((c) => c > 1);
  if (!hasDuplicates) return { normalized: reports, changed: false };

  // Number duplicates chronologically (oldest -> #1, newest -> #N)
  const chronological = [...reports].sort(
    (a, b) => parseReportTimestamp(a) - parseReportTimestamp(b)
  );
  const usedKeys = new Set<string>();
  const baseCounters = new Map<string, number>();
  const renamedById = new Map<string, string>();
  let changed = false;

  for (const rep of chronological) {
    const key = normalizeReportNameKey(rep.name);
    const totalWithSameName = counts.get(key) ?? 0;

    if (totalWithSameName > 1 || usedKeys.has(key)) {
      const cleanBase = rep.name.trim();
      let idx = (baseCounters.get(key) ?? 0) + 1;
      let candidate = `${cleanBase} #${idx}`;
      while (usedKeys.has(normalizeReportNameKey(candidate))) {
        idx += 1;
        candidate = `${cleanBase} #${idx}`;
      }
      baseCounters.set(key, idx);
      usedKeys.add(normalizeReportNameKey(candidate));
      renamedById.set(rep.id, candidate);
      if (candidate !== rep.name) changed = true;
    } else {
      usedKeys.add(key);
      renamedById.set(rep.id, rep.name);
    }
  }

  if (!changed) return { normalized: reports, changed: false };

  return {
    normalized: reports.map((rep) => ({
      ...rep,
      name: renamedById.get(rep.id) ?? rep.name,
    })),
    changed: true,
  };
}

export function getReports(): SavedReport[] {
  const stored = localStorage.getItem(getStorageKey());
  if (!stored) return [];

  try {
    const parsed = JSON.parse(stored) as SavedReport[];
    const { normalized, changed } = deduplicateLegacyReports(parsed);
    if (changed) {
      saveReports(normalized);
    }
    return normalized;
  } catch {
    return [];
  }
}

export function getReportsByAssessment(assessmentId: string) {
  return getReports().filter((report) => report.assessmentId === assessmentId);
}

export function groupReportsByPeriod(reports: SavedReport[]): ReportPeriodGroup[] {
  const groups = new Map<string, ReportPeriodGroup>();

  for (const report of reports) {
    const key = report.assessmentName?.trim() || report.assessmentId || "Diğer Dönemler";
    const existing = groups.get(key);
    if (existing) {
      existing.reports.push(report);
    } else {
      groups.set(key, {
        key,
        assessmentId: report.assessmentId,
        assessmentName: key,
        reports: [report],
      });
    }
  }

  const result = Array.from(groups.values());
  for (const group of result) {
    group.reports.sort((a, b) => parseReportTimestamp(b) - parseReportTimestamp(a));
  }
  result.sort((a, b) => {
    const latestA = a.reports[0] ? parseReportTimestamp(a.reports[0]) : 0;
    const latestB = b.reports[0] ? parseReportTimestamp(b.reports[0]) : 0;
    return latestB - latestA;
  });

  return result;
}

export function createReport(
  assessmentName: string,
  options: ReportOptions,
  customName?: string
) {
  const user = getUser();
  const existing = getReports();
  const trimmedCustom = customName?.trim() ?? "";

  if (trimmedCustom && isReportNameTaken(trimmedCustom, existing)) {
    throw new Error(
      "Bu isimde bir rapor zaten mevcut (büyük/küçük harf fark etmeksizin benzersiz olmalıdır)."
    );
  }

  const finalName =
    trimmedCustom ||
    suggestUniqueReportName(`${assessmentName} Karbon Ayak İzi Raporu`, existing);

  const now = new Date();
  const createdAt = now.toLocaleString("tr-TR");
  const report: SavedReport = {
    id: `report-${Date.now()}`,
    assessmentId: options.assessmentId,
    assessmentName,
    name: finalName,
    createdAt,
    createdAtMs: now.getTime(),
    createdBy: user.name ?? "Karbon Uzmanı",
    options,
  };

  saveReports([report, ...existing]);
  return report;
}

export function deleteReport(id: string) {
  saveReports(getReports().filter((report) => report.id !== id));
}
