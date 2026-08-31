# Quick Fix - Data Kosong di Validator Portal

## Masalah
Data yang diinput Contributor tampil kosong untuk field: Submitter, Service Provider, Service Recipient, Tax Year

## Penyebab
Backend endpoint masih menggunakan struktur lama (8 fields). Sudah diperbaiki di `src/routes/contributor.js`.

## Solusi Cepat (3 Langkah)

### Langkah 1: Pastikan PostgreSQL Running

**Windows:**
```bash
# Check status
pg_ctl status

# Jika tidak running, start PostgreSQL
# Buka Services (Win+R, ketik services.msc)
# Cari "postgresql-x64-XX" dan klik Start
```

### Langkah 2: Hapus Data Lama via SQL

**Opsi A: Via pgAdmin**
1. Buka pgAdmin
2. Connect ke database `fee_intelligence`
3. Buka Query Tool
4. Jalankan query ini:

```sql
-- Lihat data lama
SELECT id, status, created_at
FROM fee_data
WHERE submitter_name IS NULL;

-- Hapus data lama
DELETE FROM fee_data
WHERE submitter_name IS NULL 
   OR service_provider IS NULL 
   OR service_recipient IS NULL
   OR tax_year IS NULL;

-- Verifikasi
SELECT COUNT(*) FROM fee_data;
```

**Opsi B: Via psql Command Line**
```bash
psql -U postgres -d fee_intelligence

-- Jalankan query di atas
```

**Opsi C: Hapus SEMUA data dan mulai fresh**
```sql
-- HATI-HATI: Ini akan menghapus SEMUA data fee
TRUNCATE TABLE fee_data CASCADE;
```

### Langkah 3: Restart Backend & Test

```bash
# Stop backend (Ctrl+C)
# Start backend
npm start
```

**Test:**
1. Login sebagai Contributor
2. Submit data fee BARU dengan mengisi semua field
3. Periksa di tab "My Data"
4. Semua field harus terisi lengkap!

## Alternatif: Jika PostgreSQL Tidak Bisa Running

Jika PostgreSQL tidak bisa dijalankan, gunakan backend API yang sudah running:

### Via Browser Console (Developer Tools)

1. Login sebagai admin/developer
2. Buka Developer Tools (F12)
3. Buka tab Console
4. Jalankan script ini:

```javascript
// Get all fee data
fetch('http://localhost:3000/api/my-data', {
  headers: {
    'Authorization': 'Bearer ' + localStorage.getItem('token')
  }
})
.then(r => r.json())
.then(data => {
  console.log('Fee Data:', data.feeData);
  
  // Delete old data (yang kosong)
  data.feeData.forEach(item => {
    if (!item.submitter_name || !item.service_provider) {
      console.log('Deleting old data:', item.id);
      // Note: Perlu endpoint DELETE di backend
    }
  });
});
```

## Verifikasi Setelah Fix

### 1. Test Submit Data Baru
- Login sebagai Contributor
- Klik tab "Submit Fee Data"
- Isi SEMUA 14 field:
  - **Identitas Pengisi**: Nama, Divisi, Tanggal Input
  - **Identitas**: Pemberi Jasa, Penerima Jasa
  - **Detail Jasa**: Jenis Jasa, Scope of Work, Tahun Pajak
  - **Financial Data**: Jenis, Deskripsi, Skema Fee, Nominal, Currency, Tanggal
- Submit
- Periksa tab "My Data" - semua field harus terisi!

### 2. Test Validator Portal
- Login sebagai Validator
- Klik tab "Pending Validations"
- Data baru harus tampil lengkap dengan semua field
- Validate data (Accept)

### 3. Test Dashboard
- Login sebagai Partner/Manager
- Klik tab "Fee Competitor"
- Data harus tampil di insights dan table
- Semua field harus terisi lengkap

## Troubleshooting

### Error: "All fields are required"
**Solusi**: Pastikan SEMUA 14 field diisi, tidak boleh ada yang kosong

### Data masih kosong setelah submit
**Solusi**: 
1. Clear browser cache (Ctrl+Shift+Delete)
2. Logout dan login kembali
3. Periksa Network tab di Developer Tools untuk melihat response API

### Backend error saat submit
**Solusi**:
1. Periksa console backend untuk error detail
2. Pastikan database connection OK
3. Pastikan semua field name di frontend match dengan backend

## File yang Sudah Diperbaiki

✅ `src/routes/contributor.js` - POST /api/fee-data endpoint updated
✅ `src/database/clean-old-data.js` - Script untuk hapus data lama
✅ `src/database/check-and-clean-data.js` - Script untuk cek data

## Next Steps

Setelah data lama dihapus dan backend di-restart:

1. ✅ Submit data baru via Contributor portal
2. ✅ Validate via Validator portal  
3. ✅ View di Partner/Manager portal
4. ✅ Test insights dashboard
5. ✅ Test point system

---

**Catatan**: Jika masih ada masalah, screenshot error dan kirim ke developer untuk debugging lebih lanjut.
