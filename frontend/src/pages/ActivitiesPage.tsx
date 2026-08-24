import { Link } from 'react-router-dom'

function ActivitiesPage() {
  return (
    <section>
      <h1>Doğalgaz Faaliyetleri</h1>

      <p>
        Kayıtlı doğalgaz faaliyetleri bu ekranda gösterilecek.
      </p>

      <Link to="/activities/new">
        Yeni Doğalgaz Kaydı
      </Link>
    </section>
  )
}

export default ActivitiesPage