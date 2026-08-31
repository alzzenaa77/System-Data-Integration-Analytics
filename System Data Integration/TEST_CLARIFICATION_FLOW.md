# Test Clarification Flow - Step by Step

## Issue
Status masih menunjukkan "NEEDS_CLARIFICATION" setelah contributor submit clarification, padahal seharusnya berubah menjadi "CLARIFICATION_SUBMITTED".

## Root Cause Analysis
Kemungkinan penyebab:
1. Data lama masih tersimpan di MOCK_DATA (in-memory)
2. Browser cache atau localStorage menyimpan data lama
3. Page tidak di-refresh setelah submit clarification

## Solution: Clear All Data and Test Fresh

### Step 1: Clear Browser Data
Buka browser console (F12) dan jalankan:
```javascript
// Clear all localStorage
localStorage.clear();

// Reload page
location.reload();
```

### Step 2: Test Flow dari Awal

#### A. Login sebagai Contributor
1. Username: `contributor1`
2. Password: `password123`

#### B. Submit Fee Data Baru
1. Klik tab "Submit Fee Data"
2. Isi semua field yang required:
   - Nama: "Test User"
   - Divisi: "Tax"
   - Tanggal Input: pilih tanggal hari ini
   - Service Provider: "ABC Consulting"
   - Service Recipient: "XYZ Company"
   - Service Type: pilih "Tax Compliance"
   - Tax Year: "2024"
   - Scope of Work: "Tax compliance services"
   - Financial Type: "Professional Fee"
   - Fee Scheme: "Fixed"
   - Financial Description: "Annual tax compliance"
   - Nominal: "100000000"
   - Currency: "IDR"
   - Tanggal: pilih tanggal hari ini
3. Klik "Submit Data"
4. Tunggu pesan sukses

#### C. Logout dan Login sebagai Validator
1. Logout dari Contributor
2. Login sebagai Validator:
   - Username: `validator1`
   - Password: `password123`

#### D. Request Clarification
1. Klik tab "Pending Validations"
2. Cari data yang baru disubmit
3. Klik tombol "Clarify"
4. Masukkan notes: "Please provide more details about the scope"
5. Klik OK
6. Verify status berubah menjadi "NEEDS_CLARIFICATION"

#### E. Logout dan Login kembali sebagai Contributor
1. Logout dari Validator
2. Login sebagai Contributor:
   - Username: `contributor1`
   - Password: `password123`

#### F. Submit Clarification
1. Klik tab "My Data"
2. Cari data dengan status "NEEDS_CLARIFICATION"
3. Klik tombol "Submit Clarification" (warna orange)
4. Masukkan clarification text: "The scope includes monthly tax reporting and annual tax return preparation"
5. Klik "Submit Clarification"
6. **VERIFY**: Status di Action column berubah menjadi "⏳ Clarification Submitted" (badge biru)
7. **VERIFY**: Status badge berubah menjadi "CLARIFICATION_SUBMITTED"

#### G. Logout dan Login kembali sebagai Validator
1. Logout dari Contributor
2. Login sebagai Validator:
   - Username: `validator1`
   - Password: `password123`

#### H. Review Clarification
1. Klik tab "Pending Validations"
2. **VERIFY**: Data dengan status "CLARIFICATION_SUBMITTED" muncul di tabel
3. **VERIFY**: Ada indicator "📝 Clarification provided" di bawah status badge
4. **VERIFY**: Ada expandable row yang menampilkan clarification text
5. Baca clarification text
6. Klik "Accept" untuk approve data
7. **VERIFY**: Data hilang dari Pending Validations (pindah ke Fee Competitor)

## Expected Results

### Di Contributor Portal (My Data):
- Status badge: "CLARIFICATION_SUBMITTED" (warna cyan/teal)
- Action column: "⏳ Clarification Submitted" (badge biru dengan icon hourglass)

### Di Validator Portal (Pending Validations):
- Data muncul di tabel dengan status "CLARIFICATION_SUBMITTED"
- Ada indicator "📝 Clarification provided" di bawah status badge
- Ada expandable row dengan background biru muda yang menampilkan:
  - Icon 💬
  - Text "Clarification from Contributor:"
  - Clarification text yang disubmit
  - Timestamp submission

## Debug Console Logs

Saat submit clarification, check browser console untuk logs:
```
=== CLARIFICATION DEBUG ===
Data ID: [number]
Data Type: fee-data
Found item: [object]
Before update - Total feeData: [number]
Updated status from NEEDS_CLARIFICATION to CLARIFICATION_SUBMITTED
After update - Total feeData: [number]
=== END DEBUG ===
```

Saat fetch my data, check console untuk:
```
=== FETCH MY DATA ===
Fee Data Count: [number]
Fee Data IDs: [array of objects with id and status]
After dedup - Fee Data Count: [number]
=== END FETCH ===
```

## Troubleshooting

### Jika status masih NEEDS_CLARIFICATION:
1. Check browser console untuk error messages
2. Verify clarification endpoint dipanggil dengan benar
3. Clear localStorage dan test ulang
4. Verify MOCK_DATA.feeData contains the updated item

### Jika muncul duplicate rows:
1. Clear localStorage: `localStorage.clear()`
2. Reload page: `location.reload()`
3. Test ulang dari awal

### Jika data tidak muncul di Validator:
1. Verify status adalah "CLARIFICATION_SUBMITTED" (bukan "NEEDS_CLARIFICATION")
2. Check endpoint `/validations/pending` filter: `d.status === 'PENDING' || d.status === 'CLARIFICATION_SUBMITTED'`
3. Refresh Validator page

## Code Verification

Verify these key points in the code:

### api.js - Clarification Endpoint
```javascript
if (dataType === 'fee-data') {
  const item = MOCK_DATA.feeData.find(d => d.id === dataId);
  if (item) {
    item.status = 'CLARIFICATION_SUBMITTED';  // ✅ Must be this
    item.clarification_text = data.clarification;
    item.clarification_submitted_at = new Date().toISOString();
  }
}
```

### api.js - Pending Validations Endpoint
```javascript
if (endpoint.includes('/validations/pending')) {
  return { 
    data: { 
      feeData: MOCK_DATA.feeData.filter(d => 
        d.status === 'PENDING' || d.status === 'CLARIFICATION_SUBMITTED'  // ✅ Must include both
      ),
      // ...
    } 
  };
}
```

### ContributorPortal.js - Action Column
```javascript
{item.status === 'CLARIFICATION_SUBMITTED' ? (
  <span className="badge" style={{ background: '#17a2b8', color: 'white' }}>
    ⏳ Clarification Submitted
  </span>
) : null}
```

### ValidatorPortal.js - Clarification Display
```javascript
{item.status === 'CLARIFICATION_SUBMITTED' && item.clarification_text && (
  <tr className="clarification-row">
    <td colSpan="8" style={{ background: '#f0f8ff', padding: '15px', borderLeft: '4px solid #17a2b8' }}>
      {/* Clarification content */}
    </td>
  </tr>
)}
```
