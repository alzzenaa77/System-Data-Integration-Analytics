# Debug: Clarification Duplicate Row Issue

## Problem
Saat contributor submit clarification, muncul 2 row:
- **Row 1**: Status NEEDS_CLARIFICATION (data asli)
- **Row 2**: Status PENDING dengan data corrupt (IDR NaN, Invalid Date)

## Root Cause Analysis

### Kemungkinan 1: Bug di Validate Endpoint ❌
**Status**: TIDAK - Kode sudah benar, hanya update status

### Kemungkinan 2: Bug di Clarification Endpoint ❌
**Status**: TIDAK - Kode sudah benar, hanya update status

### Kemungkinan 3: Data Corrupt dari Awal ✅
**Status**: KEMUNGKINAN BESAR INI!

Dari screenshot, row 2 menunjukkan:
- Amount: "IDR NaN"
- Date: "Invalid Date"
- Financial Type: (kosong/undefined)

Ini berarti **data sudah corrupt sejak awal submit**, bukan karena clarification.

## Debug Steps

### Step 1: Check Console Logs
1. Buka browser console (F12)
2. Submit data baru sebagai contributor
3. Check console untuk "=== FETCH MY DATA ===" 
4. **Verify**: Apakah ada 2 data dengan ID berbeda?

### Step 2: Request Clarification
1. Login sebagai validator
2. Request clarification
3. Check console untuk "=== VALIDATE DEBUG ==="
4. **Verify**: 
   - Total feeData sebelum dan sesudah (harus sama)
   - Status berubah ke NEEDS_CLARIFICATION

### Step 3: Submit Clarification
1. Login sebagai contributor
2. Submit clarification
3. Check console untuk "=== CLARIFICATION DEBUG ==="
4. **Verify**:
   - Data ID yang di-update
   - Total feeData sebelum dan sesudah (harus sama)
   - Item found dan status updated

### Step 4: Check Final Result
1. Check console untuk "=== FETCH MY DATA ==="
2. **Verify**:
   - Fee Data Count (harus 1, bukan 2)
   - Fee Data IDs (harus hanya 1 ID dengan status PENDING)

## Expected Console Output

### Normal Flow (No Duplicate):
```
=== FETCH MY DATA ===
Fee Data Count: 1
Fee Data IDs: [{id: 1708425600000, status: "PENDING"}]
=== END FETCH ===
```

### Bug Flow (Duplicate):
```
=== FETCH MY DATA ===
Fee Data Count: 2
Fee Data IDs: [
  {id: 1708425600000, status: "NEEDS_CLARIFICATION"},
  {id: 1708425700000, status: "PENDING"}
]
=== END FETCH ===
```

## Possible Fixes

### Fix 1: Clear MOCK_DATA Before Testing
Jika ada data lama yang corrupt, clear MOCK_DATA:

```javascript
// Di browser console:
localStorage.clear();
// Refresh page
```

### Fix 2: Verify Submit Data
Check apakah semua fields terisi saat submit:

```javascript
// Di handleSubmitFee, tambahkan validation:
console.log('Submitting data:', {
  ...feeForm,
  serviceType: finalServiceType
});

// Verify semua fields ada value, tidak ada undefined/null
```

### Fix 3: Add Data Validation
Tambahkan validation di api.js saat create data:

```javascript
// Validate all required fields
if (!data.submitterName || !data.serviceProvider || !data.feeAmount) {
  console.error('ERROR: Missing required fields!', data);
  return { data: { error: 'Missing required fields' } };
}
```

## Quick Fix: Force Single Row

Jika masalah persist, tambahkan deduplication di fetchMyData:

```javascript
const fetchMyData = async () => {
  try {
    const response = await api.get('/my-data');
    
    // Deduplicate by keeping only latest version of each unique data
    const uniqueFeeData = response.data.feeData.reduce((acc, item) => {
      // Group by service_provider + service_type + tax_year
      const key = `${item.service_provider}-${item.service_type}-${item.tax_year}`;
      if (!acc[key] || acc[key].id < item.id) {
        acc[key] = item;
      }
      return acc;
    }, {});
    
    setMyData({
      feeData: Object.values(uniqueFeeData),
      crossDivisionData: response.data.crossDivisionData
    });
  } catch (error) {
    console.error('Failed to fetch data:', error);
  }
};
```

## Testing Instructions

1. **Clear all data**: `localStorage.clear()` di console
2. **Refresh page**
3. **Login sebagai contributor**
4. **Submit 1 data baru** dengan semua fields lengkap
5. **Check console**: Harus ada 1 data saja
6. **Login sebagai validator** → Request clarification
7. **Check console**: Total data harus tetap 1
8. **Login sebagai contributor** → Submit clarification
9. **Check console**: Total data harus tetap 1
10. **Verify table**: Harus hanya ada 1 row dengan status PENDING

## If Still Duplicate

Jika masih ada duplicate setelah clear localStorage:

1. Check apakah ada **multiple submit** (double click button)
2. Check apakah ada **race condition** (multiple API calls)
3. Check apakah ada **browser extension** yang interfere
4. Try **incognito mode**

## Contact

Jika masalah persist setelah semua debug steps, share:
1. Console logs (screenshot atau copy text)
2. Network tab (API calls)
3. Steps to reproduce

Saya akan bantu debug lebih lanjut!
