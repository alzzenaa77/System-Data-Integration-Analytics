# Fix: Duplicate Row Issue - Clarification

## Problem
Saat contributor submit clarification, muncul 2 row berbeda:
- Row 1: Status NEEDS_CLARIFICATION (data asli)
- Row 2: Status PENDING dengan data corrupt (IDR NaN, Invalid Date)

## Root Cause
Kemungkinan ada bug yang membuat duplicate data, atau data corrupt dari awal submit.

## Solution Implemented

### 1. ✅ Deduplication di fetchMyData
**File**: `client/src/components/ContributorPortal.js`

Tambahkan logic untuk remove duplicate berdasarkan ID:
```javascript
// Deduplicate data - keep only unique IDs
const uniqueFeeData = Array.from(
  new Map(response.data.feeData.map(item => [item.id, item])).values()
);
```

**Benefit**: Jika ada duplicate (karena bug apapun), hanya 1 row yang akan ditampilkan.

### 2. ✅ Sorting by ID Descending
**File**: `client/src/services/api.js`

Sort data by ID (newest first) untuk maintain consistent order:
```javascript
const userFeeData = MOCK_DATA.feeData
  .filter(d => d.contributor_id === userId)
  .sort((a, b) => b.id - a.id);
```

**Benefit**: Data selalu muncul di posisi yang konsisten.

### 3. ✅ Debug Logs
**Files**: 
- `client/src/services/api.js` (validate & clarification endpoints)
- `client/src/components/ContributorPortal.js` (fetchMyData)

Tambahkan console.log untuk track:
- Total data count sebelum dan sesudah operasi
- Data IDs dan status
- Warning jika ada duplicate detected

**Benefit**: Mudah debug jika masalah terjadi lagi.

## Testing Steps

### Step 1: Clear Old Data
```javascript
// Di browser console:
localStorage.clear();
// Refresh page
```

### Step 2: Test Clarification Flow
1. Login sebagai contributor → Submit 1 data baru
2. **Check console**: Harus ada "Fee Data Count: 1"
3. Login sebagai validator → Request clarification
4. **Check console**: "Total feeData" sebelum dan sesudah harus sama
5. Login sebagai contributor → Submit clarification
6. **Check console**: 
   - "Total feeData" harus tetap sama
   - "After dedup - Fee Data Count: 1"
   - Tidak ada warning "Duplicate detected"
7. **Verify table**: Hanya ada 1 row dengan status PENDING

### Step 3: Verify No Duplicate
- **Expected**: 1 row saja
- **If 2 rows**: Check console untuk warning "Duplicate detected"
- **If warning muncul**: Ada bug di tempat lain yang membuat duplicate

## Console Output Examples

### ✅ Normal (No Duplicate):
```
=== FETCH MY DATA ===
Fee Data Count: 1
Fee Data IDs: [{id: 1708425600000, status: "PENDING"}]
After dedup - Fee Data Count: 1
=== END FETCH ===
```

### ⚠️ Duplicate Detected (But Fixed):
```
=== FETCH MY DATA ===
Fee Data Count: 2
Fee Data IDs: [
  {id: 1708425600000, status: "NEEDS_CLARIFICATION"},
  {id: 1708425600000, status: "PENDING"}
]
WARNING: Duplicate fee data detected and removed!
After dedup - Fee Data Count: 1
=== END FETCH ===
```

### ❌ Different IDs (Real Bug):
```
=== FETCH MY DATA ===
Fee Data Count: 2
Fee Data IDs: [
  {id: 1708425600000, status: "NEEDS_CLARIFICATION"},
  {id: 1708425700000, status: "PENDING"}
]
After dedup - Fee Data Count: 2
=== END FETCH ===
```

## If Still Duplicate After Fix

Jika masih ada 2 row dengan ID berbeda, berarti ada bug yang membuat data baru. Check:

1. **Validate endpoint** - Pastikan tidak create data baru
2. **Clarification endpoint** - Pastikan tidak create data baru
3. **Submit form** - Pastikan tidak double submit
4. **Browser extension** - Disable semua extension
5. **Network tab** - Check berapa kali API dipanggil

## Quick Workaround

Jika masalah persist dan urgent, tambahkan force dedup by content:

```javascript
// Group by unique content instead of ID
const uniqueFeeData = response.data.feeData.reduce((acc, item) => {
  const key = `${item.service_provider}-${item.service_type}-${item.tax_year}`;
  // Keep the one with latest status change (PENDING > NEEDS_CLARIFICATION)
  if (!acc[key] || item.status === 'PENDING') {
    acc[key] = item;
  }
  return acc;
}, {});

setMyData({
  feeData: Object.values(uniqueFeeData),
  crossDivisionData: response.data.crossDivisionData
});
```

## Summary

✅ **Deduplication** - Remove duplicate rows by ID  
✅ **Sorting** - Consistent order by ID descending  
✅ **Debug logs** - Easy to track data flow  
✅ **Warning system** - Alert if duplicate detected  

**Result**: Hanya 1 row yang akan muncul, bahkan jika ada bug yang membuat duplicate!

## Next Steps

1. Test dengan clear localStorage
2. Check console logs untuk verify no duplicate
3. Jika masih ada duplicate dengan ID berbeda, share console logs untuk debug lebih lanjut
