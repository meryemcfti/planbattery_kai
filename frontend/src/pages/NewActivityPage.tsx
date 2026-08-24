import { Link } from 'react-router-dom'

function NewActivityPage() {
  return (
    <section>
      <h1>Yeni Doğalgaz Kaydı</h1>

      <p>
        Doğalgaz veri giriş formu bu ekranda bulunacak.
      </p>

      <Link to="/activities">
        Faaliyetlere Dön
      </Link>
    </section>
  )
}

export default NewActivityPage