# Test Cross-Division Data

## Perbaikan yang Sudah Dilakukan

### 1. Fix Cross-Division Data Mapping ✅
**File:** `client/src/services/api.js`

Sekarang semua fields di-map dengan benar:
- `title` → `title`
- `divisionCategory` → `division_category`
- `description` → `description`
- `submissionDate` → `submission_date`
- `contributor_name` → dari user yang login

### 2. Division Filter Tabs ✅
**File:** `client/src/components/ManagerPortal.js` & `ValidatorPortal.js`

Sekarang ada filter tabs untuk setiap divisi:
- All Divisions (tampil semua)
- Accounting
- Customs
- Legal
- Tax Advisory
- Tax Compliance
- Tax Dispute
- Transfer Pricing

### 3. CSS Styling ✅
**File:** `client/src/index.css`

Tabs dengan styling modern:
- Active tab: gradient blue
- Hover effect
- Badge untuk category
- Responsive layout

---

## Cara Test Cross-Division

### STEP 1: Restart Frontend
```bash
cd client
npm start
```

### STEP 2: Clear Browser & Login
1. F12 → Application → Clear site data
2. Refresh (Ctrl + Shift + R)
3. Login: `contributor1` / `password123`

### STEP 3: Submit Cross-Division Data

1. Klik tab "Submit Cross-Division"
2. Isi form:
   - **Title:** `Market Analysis - Tax Compliance 2024`
   - **Division Category:** `Tax Compliance` (pilih dari dropdown)
   - **Submission Date:** `2024-02-18`
   - **Description:** `Comprehensive market analysis for tax compliance services in manufacturing sector`
   - **Attachment:** (skip untuk demo mode)

3. Klik "Submit Data"

### STEP 4: Submit Data Lain untuk Divisi Berbeda

Submit 2-3 data lagi dengan divisi berbeda:

**Data 2:**
- Title: `Legal Update - Corporate Law`
- Division: `Legal`
- Date: `2024-02-18`
- Description: `Latest updates on corporate law regulations`

**Data 3:**
- Title: `Transfer Pricing Guidelines`
- Division: `Transfer Pricing`
- Date: `2024-02-18`
- Description: `New transfer pricing documentation requirements`

### STEP 5: Check "My Data" Tab

1. Klik tab "My Data"
2. Scroll ke "My Cross-Division Data"
3. **Verify:** Semua data tampil dengan lengkap:
   - ✅ Title terisi
   - ✅ Category terisi (badge biru)
   - ✅ Submission Date terisi
   - ✅ Description terisi
   - ✅ Tidak ada NULL!

---

## Test Division Filter (Manager/Validator Portal)

### STEP 1: Logout & Login sebagai Manager

1. Logout dari Contributor
2. Login: `manager1` / `password123`

### STEP 2: Klik Tab "Cross-Division"

Anda akan melihat:
- Filter tabs di atas: All Divisions, Accounting, Customs, Legal, dll
- Setiap tab menampilkan jumlah data: `Tax Compliance (1)`, `Legal (1)`, dll

### STEP 3: Test Filter

1. Klik "All Divisions" → Tampil semua data (3 data)
2. Klik "Tax Compliance" → Tampil hanya data Tax Compliance (1 data)
3. Klik "Legal" → Tampil hanya data Legal (1 data)
4. Klik "Transfer Pricing" → Tampil hanya data Transfer Pricing (1 data)
5. Klik divisi lain yang kosong → Tampil "No data available"

---

## Expected Result

### Contributor Portal - My Data:
```
My Cross-Division Data
┌─────────────────────────────────┬──────────────────┬─────────────┬──────────────┐
│ Title                           │ Category         │ Date        │ Status       │
├─────────────────────────────────┼──────────────────┼─────────────┼──────────────┤
│ Market Analysis - Tax Comp...   │ Tax Compliance   │ 2024-02-18  │ PENDING      │
│ Legal Update - Corporate Law    │ Legal            │ 2024-02-18  │ PENDING      │
│ Transfer Pricing Guidelines     │ Transfer Pricing │ 2024-02-18  │ PENDING      │
└─────────────────────────────────┴──────────────────┴─────────────┴──────────────┘
```

### Manager Portal - Cross-Division Tab:
```
Filter Tabs:
┌──────────────┬────────────┬─────────┬───────┬──────────────┬─────────────────┬─────────────┬──────────────────┐
│ All (3)      │ Accounting │ Customs │ Legal │ Tax Advisory │ Tax Compliance  │ Tax Dispute │ Transfer Pricing │
│   ACTIVE     │    (0)     │   (0)   │  (1)  │     (0)      │      (1)        │     (0)     │       (1)        │
└──────────────┴────────────┴─────────┴───────┴──────────────┴─────────────────┴─────────────┴──────────────────┘

Data Table (All Divisions):
┌─────────────────────────────────┬──────────────────┬─────────────┬──────────────────────────┐
│ Title                           │ Category         │ Date        │ Description              │
├─────────────────────────────────┼──────────────────┼─────────────┼──────────────────────────┤
│ Market Analysis - Tax Comp...   │ Tax Compliance   │ 2024-02-18  │ Comprehensive market...  │
│ Legal Update - Corporate Law    │ Legal            │ 2024-02-18  │ Latest updates on...     │
│ Transfer Pricing Guidelines     │ Transfer Pricing │ 2024-02-18  │ New transfer pricing...  │
└─────────────────────────────────┴──────────────────┴─────────────┴──────────────────────────┘
```

---

## Troubleshooting

### Data tidak muncul di "My Data"?

1. **Check Console:**
   - F12 → Console
   - Lihat apakah ada error

2. **Check DEMO_MODE:**
   - File: `client/src/services/api.js`
   - Harus: `const DEMO_MODE = true;`

3. **Clear Storage & Retry:**
   - F12 → Application → Clear site data
   - Logout & Login ulang
   - Submit data baru

### Filter divisi tidak berfungsi?

1. **Check data structure:**
   - Data harus punya field `division_category`
   - Value harus match dengan nama divisi (case-sensitive)

2. **Restart frontend:**
   ```bash
   cd client
   npm start
   ```

### Badge tidak muncul atau styling aneh?

1. **Check CSS:**
   - File: `client/src/index.css`
   - Pastikan ada class `.badge-info` dan `.division-tab`

2. **Hard refresh:**
   - Ctrl + Shift + R

---

## Summary

✅ Cross-division data mapping diperbaiki
✅ Data tampil lengkap tanpa NULL
✅ Filter divisi berfungsi di Manager & Validator Portal
✅ Styling modern dengan tabs dan badges
✅ Responsive dan user-friendly

**Next:** Test dengan submit beberapa data cross-division dengan divisi berbeda, lalu test filter di Manager Portal!

