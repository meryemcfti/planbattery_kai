export type Assessment = {
  id: string;
  name: string;
  periodStart: string;
  periodEnd: string;
  createdAt: string;
};

type StoredUser = {
  tenantName?: string;
};

const defaultAssessment: Assessment = {
  id: "assessment-2026",
  name: "2026 Kurumsal Karbon Değerlendirmesi",
  periodStart: "2026-01-01",
  periodEnd: "2026-12-31",
  createdAt: "01.01.2026 09:00",
};

function getTenantName() {
  try {
    const user = JSON.parse(
      localStorage.getItem("kai_user") ?? "{}",
    ) as StoredUser;
    return user.tenantName ?? "Şirket";
  } catch {
    return "Şirket";
  }
}

function getStorageKey() {
  return `kai_assessments_${encodeURIComponent(getTenantName())}`;
}

function saveAssessments(assessments: Assessment[]) {
  localStorage.setItem(getStorageKey(), JSON.stringify(assessments));
}

export function getAssessments(): Assessment[] {
  const stored = localStorage.getItem(getStorageKey());

  if (!stored) {
    const initial = getTenantName() === "E&M Akü" ? [defaultAssessment] : [];
    saveAssessments(initial);
    return initial;
  }

  try {
    return JSON.parse(stored) as Assessment[];
  } catch {
    saveAssessments([defaultAssessment]);
    return [defaultAssessment];
  }
}

export function getAssessment(id: string) {
  return getAssessments().find((assessment) => assessment.id === id);
}

export function createAssessment(
  values: Pick<Assessment, "name" | "periodStart" | "periodEnd">,
) {
  const assessment: Assessment = {
    ...values,
    id: `assessment-${Date.now()}`,
    createdAt: new Date().toLocaleString("tr-TR"),
  };

  saveAssessments([...getAssessments(), assessment]);
  return assessment;
}
