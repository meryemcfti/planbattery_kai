1. Platform kullanicisi olusturulur ve bir tenant'a `tenant_memberships` ile baglanir.
2. Tenant altinda tesisler `facilities` tablosunda tanimlanir.
3. Sirket icin bir karbon degerlendirme donemi `carbon_assessments` olarak acilir.
4. Degerlendirmeye dahil tesisler `assessment_facilities` ile secilir.
5. Veri giris kullanicisi dogal gaz tuketimini `natural_gas_activities` olarak kaydeder.
6. Fatura, sayac kaydi veya ERP ciktisi `activity_evidence` olarak aktiviteye baglanir.
7. Yetkili kullanici aktiviteyi dogrular ve durumunu `VALIDATED` yapar.
8. Hesaplama motoru uygun `emission_factors`, `emission_factor_components`, `gwp_sets` ve `gwp_values` kayitlarini secerek `calculation_runs` baslatir.
9. Hesaplamada kullanilan aktivite ve faktor degerleri snapshot tablolarina yazilir.
10. Sonuc `calculation_results` tablosuna kaydedilir ve aktivite `CALCULATED` durumuna cekilir.
11. Donemdeki hesaplamalar tamamlaninca assessment `FINALIZED` olur.
12. Rapor uretilir, `reports` tablosuna versiyonlu kaydedilir.
13. Kritik islemler `audit_logs` ile izlenir.

## Modul Sinirlari

- `identity`: kullanicilar, platform rolleri, giris islemleri.
- `tenancy`: tenant, uyelik ve tenant bazli yetki kontrolu.
- `facilities`: tesis kayitlari ve aktif/pasif yonetimi.
- `assessments`: donem acma, tesis baglama, finalize etme.
- `activities`: dogal gaz aktivite girisi, kanit baglama, validasyon.
- `factors`: emisyon faktor kaynaklari, faktor bilesenleri, GWP setleri.
- `calculations`: hesaplama calistirma, snapshot alma, sonuc yazma.
- `reports`: finalize edilmis assessment icin rapor versiyonlama.
- `audit`: create/update/delete/calculate/finalize/export islemlerinin iz kaydi.

## Durum Kurallari

- `carbon_assessments`
  - `DRAFT`: donem hazirlanir, tesisler secilir.
  - `ACTIVE`: veri girisi ve validasyon yapilir.
  - `FINALIZED`: hesaplamalar kilitlenir, raporlama esas alinir.
  - `ARCHIVED`: eski donem arsivlenir.

- `natural_gas_activities`
  - `DRAFT`: veri girildi ama henuz dogrulanmadi.
  - `VALIDATED`: kanit ve deger kontrol edildi.
  - `CALCULATED`: emisyon sonucu uretildi.

- `calculation_runs`
  - `PENDING`: hesaplama baslatildi.
  - `SUCCESS`: snapshot ve sonuc olustu.
  - `FAILED`: hata mesaji ile kaydedildi.

## Hesaplama Mantigi

Dogal gaz aktivitesi icin temel formul:

```text
gas_mass_kg = normalized_consumption_value * gas_factor
gas_co2e_kg = gas_mass_kg * gas_gwp
total_co2e_kg = co2_co2e_kg + ch4_co2e_kg + n2o_co2e_kg
```

Hesaplama aninda aktivite, tesis adi, normalize tuketim, faktor kaynagi, faktor degerleri ve GWP degerleri snapshot olarak saklanir. Boylece faktor seti daha sonra degisse bile eski raporun nasil hesaplandigi geriye donuk kanitlanabilir.

## Hesaplama On Kosullari

- Aktivite tenant'a ait olmalidir.
- Aktivite `VALIDATED` durumunda olmalidir.
- Emisyon faktoru aktif olmalidir.
- GWP seti aktif olmalidir.
- Aktivite birimi, faktorun input birimiyle ayni olmalidir. Birim donusum tablosu eklenene kadar hesaplama servisinde otomatik donusum yapilmaz.
- Dogal gaz hesaplamasi icin faktor `SCOPE_1` ve `STATIONARY_COMBUSTION` olmalidir.
- CO2 faktor bileseni ve CO2 GWP degeri zorunludur.

## Hesaplama Transaction'i

`POST /api/v1/tenants/:tenantId/calculations` tek transaction icinde su kayitlari olusturur:

1. `calculation_runs` kaydi `PENDING` durumunda acilir.
2. `calculation_input_snapshots` ile aktivite girdisi dondurulur.
3. `calculation_factor_snapshots` ile faktor ve GWP degerleri dondurulur.
4. `calculation_results` ile gaz bazli kütle ve CO2e sonuclari yazilir.
5. `calculation_runs` kaydi `SUCCESS` olur.
6. Aktivite durumu `CALCULATED` olur.

## API Oncelik Sirasi

1. Auth ve tenant membership kontrolu.
2. Tenant ve facility CRUD.
3. Assessment olusturma ve facility baglama.
4. Natural gas activity CRUD ve evidence metadata kaydi.
5. Activity validation endpoint'i.
6. Emission factor ve GWP seed/import akisina hazirlik.
7. Calculation run endpoint'i.
8. Assessment finalize endpoint'i.
9. Report generation endpoint'i.
10. Audit middleware/helper.
