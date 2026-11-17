import { Link, useParams } from "react-router-dom";
import { ArrowLeft, CalendarDays, FileChartColumn, Plus } from "lucide-react";
import { getAssessment } from "../services/assessments";
import { getActivities, getCurrentUser } from "../services/activityStore";
import type { ActivityStatus } from "../services/activityStore";
import { getReportsByAssessment } from "../services/reportStore";
import "./AssessmentDetailPage.css";

const statusLabels: Record<ActivityStatus, string> = {
  PENDING_REVIEW: "Doğrulama Bekliyor",
  VALIDATED: "Doğrulandı",
  REVISION_REQUESTED: "Düzeltme İstendi",
  FAILED: "Hesaplanamadı",
};

function statusClass(status: ActivityStatus) {
  return status.toLowerCase().replace(/_/g, "-");
}

function AssessmentDetailPage() {
  const { assessmentId = "" } = useParams();
  const assessment = getAssessment(assessmentId);
  const currentUser = getCurrentUser();
  const canManage = currentUser.tenantRole === "CARBON_SPECIALIST";

  if (!assessment) {
    return (
      <section className="assessment-not-found">
        <h1>Değerlendirme bulunamadı</h1>
        <p>Aradığınız değerlendirme silinmiş veya mevcut olmayabilir.</p>
        <Link to="/assessments">Değerlendirmelere Dön</Link>
      </section>
    );
  }

  const activities = getActivities().filter(
    (activity) => activity.assessmentId === assessment.id,
  );
  const reports = getReportsByAssessment(assessment.id);
  const validatedCount = activities.filter(
    (activity) => activity.status === "VALIDATED",
  ).length;
  const waitingCount = activities.filter(
    (activity) => activity.status === "PENDING_REVIEW",
  ).length;
  const attentionCount = activities.filter(
    (activity) =>
      activity.status === "FAILED" || activity.status === "REVISION_REQUESTED",
  ).length;

  return (
    <section className="assessment-detail-page">
      <Link className="assessment-back-link" to="/assessments">
        <ArrowLeft size={17} />
        Değerlendirmelere Dön
      </Link>

      <header className="assessment-detail-header">
        <div>
          <p className="breadcrumb">Değerlendirmeler / Detay</p>
          <h1>{assessment.name}</h1>
          <div className="assessment-period">
            <CalendarDays size={18} />
            <span>
              {formatDate(assessment.periodStart)} –{" "}
              {formatDate(assessment.periodEnd)}
            </span>
            <span className="assessment-detail-status">Aktif</span>
          </div>
        </div>

        {canManage && (
          <div className="assessment-detail-actions">
            <Link
              className="assessment-report-button"
              to={`/reports?assessmentId=${assessment.id}`}
            >
              <FileChartColumn size={18} />
              Yeni Rapor Oluştur
            </Link>
            <Link
              className="assessment-activity-button"
              to={`/activities/new?assessmentId=${assessment.id}`}
            >
              <Plus size={18} />
              Yeni Faaliyet Ekle
            </Link>
          </div>
        )}
      </header>

      <div className="assessment-summary-grid">
        <article>
          <span>Toplam Faaliyet</span>
          <strong>{activities.length}</strong>
        </article>
        <article>
          <span>Doğrulanan</span>
          <strong>{validatedCount}</strong>
        </article>
        <article>
          <span>Kontrol Bekleyen</span>
          <strong>{waitingCount}</strong>
        </article>
        <article>
          <span>İşlem Gerektiren</span>
          <strong>{attentionCount}</strong>
        </article>
      </div>

      <div className="assessment-activities-card">
        <div className="assessment-activities-heading">
          <div>
            <h2>Bağlı Faaliyetler</h2>
            <p>Yalnızca bu değerlendirmeye bağlanan doğalgaz kayıtları.</p>
          </div>
          <span>{activities.length} kayıt</span>
        </div>

        {activities.length > 0 ? (
          <div className="assessment-table-container">
            <table>
              <thead>
                <tr>
                  <th>Tüketim Dönemi</th>
                  <th>Tesis</th>
                  <th>Tüketim</th>
                  <th>Durum</th>
                  <th>Emisyon (kgCO₂e)</th>
                  <th>İşlem</th>
                </tr>
              </thead>
              <tbody>
                {activities.map((activity) => (
                  <tr key={activity.id}>
                    <td>{activity.period}</td>
                    <td>{activity.facility}</td>
                    <td>{activity.consumption}</td>
                    <td>
                      <span
                        className={`assessment-activity-status status-${statusClass(activity.status)}`}
                      >
                        {statusLabels[activity.status]}
                      </span>
                    </td>
                    <td>{activity.calculation?.totalKgCo2e ?? "—"}</td>
                    <td>
                      <Link
                        className="assessment-view-link"
                        to={`/activities/${activity.id}`}
                      >
                        Görüntüle
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="assessment-empty-state">
            <CalendarDays size={28} />
            <strong>Henüz faaliyet bulunmuyor</strong>
            <p>Bu değerlendirmeye bağlı faaliyet kaydı bulunmamaktadır.</p>
          </div>
        )}
      </div>

      <div className="assessment-activities-card assessment-reports-card">
        <div className="assessment-activities-heading">
          <div>
            <h2>Değerlendirme Raporları</h2>
            <p>Yalnızca bu değerlendirme için oluşturulan raporlar.</p>
          </div>
          <span>{reports.length} rapor</span>
        </div>

        {reports.length > 0 ? (
          <div className="assessment-report-list">
            {reports.map((report) => (
              <article key={report.id} className="assessment-report-item">
                <FileChartColumn size={21} />
                <div>
                  <strong>{report.name}</strong>
                  <span>
                    {report.createdAt} · {report.createdBy}
                  </span>
                </div>
                <Link to="/reports/preview" state={report.options}>
                  Raporu Görüntüle
                </Link>
              </article>
            ))}
          </div>
        ) : (
          <div className="assessment-empty-state">
            <FileChartColumn size={28} />
            <strong>Henüz rapor oluşturulmadı</strong>
            <p>Bu değerlendirmeye ait kayıtlı bir rapor bulunmuyor.</p>
            {canManage && (
              <Link to={`/reports?assessmentId=${assessment.id}`}>
                İlk Raporu Oluştur
              </Link>
            )}
          </div>
        )}
      </div>
    </section>
  );
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("tr-TR").format(new Date(`${value}T00:00:00`));
}

export default AssessmentDetailPage;
