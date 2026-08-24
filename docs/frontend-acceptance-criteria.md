# Doğalgaz Faaliyetleri – Frontend Kabul Kriterleri

## 1. Kimlik doğrulama ve oturum

- [x] Kullanıcı e-posta ve parola ile giriş yapabilmelidir.
- [x] Giriş yapılmadan korunan sayfalara erişilememelidir.
- [x] Başarılı girişten sonra kullanıcı faaliyetler ekranına yönlendirilmelidir.
- [x] Kullanıcının adı, rolü ve seçili şirketi arayüzde gösterilmelidir.
- [x] Çıkış yapıldığında yerel oturum bilgileri temizlenmelidir.
- [ ] Gerçek giriş işlemi backend API üzerinden yapılmalıdır.
- [ ] Kullanıcının tenant ve rol bilgileri backend oturumundan alınmalıdır.

## 2. Yetkilendirme

- [x] DATA_ENTRY rolü faaliyet oluşturabilmeli ve görüntüleyebilmelidir.
- [x] DATA_ENTRY rolü doğrulama işlemi yapamamalıdır.
- [x] COMPANY_ADMIN rolü doğrulama ve reddetme işlemlerini görebilmelidir.
- [x] Yetkisiz işlemler arayüzde gösterilmemelidir.
- [ ] Yetkiler backend tarafından da kontrol edilmelidir.

## 3. Doğalgaz faaliyet kaydı

- [x] Kullanıcı değerlendirme seçmelidir.
- [x] Kullanıcı seçilen değerlendirmeye bağlı tesis seçmelidir.
- [x] Başlangıç ve bitiş tarihleri zorunlu olmalıdır.
- [x] Başlangıç tarihi bitiş tarihinden sonra olamamalıdır.
- [x] Tüketim miktarı zorunlu olmalıdır.
- [x] Tüketim miktarı sıfırdan büyük olmalıdır.
- [x] Doğalgaz birimi yalnızca m³ olmalıdır.
- [x] Veri kaynağı seçilmelidir.
- [x] Fatura seçildiğinde fatura numarası zorunlu olmalıdır.
- [x] Sayaç seçildiğinde sayaç numarası zorunlu olmalıdır.
- [x] Kurumsal Sistem seçildiğinde kaynak referansı zorunlu olmalıdır.
- [x] Diğer seçildiğinde açıklama veya kaynak referansı istenmelidir.
- [x] Eksik zorunlu alanlarla kayıt oluşturulamamalıdır.
- [ ] Oluşturulan kayıt gerçek API üzerinden backend’e gönderilmelidir.

## 4. Veri kaynağı eşleştirmesi

- [x] Kullanıcı arayüzünde “Kurumsal Sistem” gösterilmelidir.
- [ ] Kurumsal Sistem seçimi backend’e `ERP` olarak gönderilmelidir.
- [x] Fatura, Sayaç, Manuel, Kurumsal Sistem ve Diğer seçenekleri desteklenmelidir.
- [x] Veri kaynağına göre ilgili alanlar dinamik gösterilmelidir.

## 5. Faaliyet listesi

- [x] Doğalgaz faaliyetleri tabloda listelenmelidir.
- [x] Tesis, dönem, tüketim, veri kaynağı, durum ve sonuç gösterilmelidir.
- [x] Faaliyetler tesise göre filtrelenebilmelidir.
- [x] Faaliyetler duruma göre filtrelenebilmelidir.
- [x] Filtreler temizlenebilmelidir.
- [x] `DRAFT` durumu kullanıcıya “Doğrulama Bekliyor” olarak gösterilmelidir.
- [x] Hesaplanamayan kayıtlar belirgin hata durumuyla gösterilmelidir.
- [x] Kayıt detayına listeden erişilebilmelidir.
- [ ] Liste gerçek API verisiyle doldurulmalıdır.

## 6. Detay, doğrulama ve hesaplama

- [x] Kayıt detayında faaliyet bilgileri gösterilmelidir.
- [x] Hesaplanan kayıtta CO₂, CH₄ ve N₂O kırılımı gösterilmelidir.
- [x] Toplam sonuç kgCO₂e ve tCO₂e olarak gösterilmelidir.
- [x] Doğrulama bekleyen kayıtta uygun durum mesajı gösterilmelidir.
- [x] Doğrulanmış ancak hesaplanmamış kayıt ayırt edilmelidir.
- [x] Hesaplama hatası kullanıcıya açıklanmalıdır.
- [x] COMPANY_ADMIN doğrulama ve reddetme işlemlerini görebilmelidir.
- [ ] Doğrulama işlemi gerçek API’ye bağlanmalıdır.
- [ ] Hesaplama sonucu backend snapshot verisinden alınmalıdır.

## 7. Silme davranışı

- [x] Silme seçeneği yalnızca doğrulanmamış kayıt için gösterilmelidir.
- [x] Silmeden önce kullanıcıdan onay alınmalıdır.
- [ ] DATA_ENTRY yalnızca kendi oluşturduğu doğrulanmamış kaydı silebilmelidir.
- [ ] Backend DELETE endpoint’i netleştirilmelidir.
- [ ] Doğrulanmış ve hesaplanmış kayıtlar kalıcı olarak silinememelidir.

## 8. Raporlama ve PDF

- [x] Rapor açılmadan önce kullanıcı rapor kapsamını seçebilmelidir.
- [x] Şirket geneli veya belirli tesis seçilebilmelidir.
- [x] Değerlendirme dönemi veya özel tarih aralığı seçilebilmelidir.
- [x] Özet veya ayrıntılı rapor seçilebilmelidir.
- [x] Hesaplanan kayıtlar veya seçilen kapsamdaki tüm kayıtlar seçilebilmelidir.
- [x] Belirli tesis seçildiğinde başka tesisin kayıtları rapora girmemelidir.
- [x] Özel tarih aralığı dışındaki kayıtlar rapora girmemelidir.
- [x] Hesaplanmamış kayıtlar toplam emisyon sonucuna eklenmemelidir.
- [x] Ayrıntılı raporda metodoloji ve faaliyet tablosu bulunmalıdır.
- [x] Özet raporda temel kapsam ve emisyon sonucu bulunmalıdır.
- [x] PDF ön izlemesi seçilen rapor kapsamıyla aynı olmalıdır.
- [x] PDF A4 biçiminde ve okunabilir şekilde oluşturulmalıdır.
- [ ] Rapor verileri gerçek backend sonuçlarından alınmalıdır.

## 9. Tenant ve veri güvenliği

- [x] Arayüzde seçili şirket gösterilmelidir.
- [ ] Kullanıcı yalnızca üyesi olduğu tenant verilerine erişebilmelidir.
- [ ] Tesis seçilen tenant’a ait olmalıdır.
- [ ] Tesis seçilen değerlendirmeye bağlı olmalıdır.
- [ ] `enteredByUserId` JWT’deki kullanıcıdan backend tarafından alınmalıdır.
- [ ] `validatedByUserId` JWT’deki kullanıcıdan backend tarafından alınmalıdır.
- [ ] Başka tenant’a ait kayıt URL üzerinden görüntülenememelidir.

## Tamamlanma koşulu

Frontend çalışması aşağıdaki koşullarda MVP kabulüne hazır sayılacaktır:

1. Frontend production build hatasız tamamlanmalıdır.
2. Bütün zorunlu alan ve koşullu alan kontrolleri çalışmalıdır.
3. Rol bazlı ekran davranışları doğrulanmalıdır.
4. Tesis ve kayıt kapsamı rapora doğru uygulanmalıdır.
5. PDF çıktısı seçilen kapsamla aynı verileri içermelidir.
6. Gerçek login, faaliyet, doğrulama ve raporlama API’leri bağlanmalıdır.
7. Tenant izolasyonu backend ve frontend birlikte test edilmelidir.