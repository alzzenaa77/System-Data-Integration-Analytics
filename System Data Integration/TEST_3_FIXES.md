# Quick Test Guide - 3 Fixes

## ✅ Fix 1: Clarification Tetap di Row yang Sama

### Test Steps:
1. **Login sebagai Contributor**
   - Username: `contributor1` / Password: `password123`
   - Submit 1 fee data dengan data lengkap

2. **Login sebagai Validator**
   - Username: `validator1` / `password123`
   - Klik tab "Pending Validations"
   - Klik tombol "Clarify" pada data yang baru disubmit
   - Input notes: "Mohon jelaskan scope of work lebih detail"

3. **Login kembali sebagai Contributor**
   - Klik tab "My Data"
   - **VERIFY**: 
     - ✅ Hanya ada 1 row (tidak ada row baru)
     - ✅ Status: NEEDS_CLARIFICATION (orange badge)
     - ✅ Tombol "Submit Clarification" muncul

4. **Submit Clarification**
   - Klik tombol "Submit Clarification"
   - Modal muncul
   - Input: "Scope of work: 1) Review SPT, 2) Konsultasi pajak, 3) Pendampingan"
   - Klik "Submit Clarification"

5. **VERIFY HASIL**:
   - ✅ Success message muncul
   - ✅ Modal tertutup
   - ✅ **MASIH 1 ROW YANG SAMA** (tidak ada row baru!)
   - ✅ Status berubah: PENDING (yellow badge)
   - ✅ Tombol "Submit Clarification" hilang
   - ✅ Data lain (Service Provider, Amount, dll) tetap sama

6. **Login sebagai Validator - Verify Re-validation**
   - Klik tab "Pending Validations"
   - **VERIFY**: Data yang sama muncul dengan status PENDING
   - Klik "Accept" untuk approve
   - **VERIFY**: Contributor dapat +5 poin

---

## ✅ Fix 2: Point Redemption Tracking Table

### Test Steps:
1. **Setup: Accumulate Points**
   - Login sebagai contributor
   - Submit 2 data (1 fee + 1 cross-division)
   - Login sebagai validator
   - Approve kedua data
   - **Result**: Contributor punya 10 poin

2. **Redeem Points**
   - Login sebagai contributor
   - Klik tab "My Points"
   - **VERIFY**: Total Points: 10
   - Klik "Redeem Points"
   - Input: 10 poin
   - Klik "Redeem"
   - **VERIFY**: Success message

3. **Check Point Redemptions Table**
   - Login sebagai validator
   - **VERIFY**: Tab "Point Redemptions" ada badge merah dengan angka "1"
   - Klik tab "Point Redemptions"
   - **VERIFY TABLE**:
     ```
     Date: [today's date]
     Contributor: [nama contributor] + ID
     Points Redeemed: [10 points] (green badge)
     Status: ⏳ Pending (yellow badge)
     Reward Given At: -
     Action: [Mark as Given] button
     ```

4. **Mark Reward as Given**
   - Klik tombol "Mark as Given"
   - **VERIFY**:
     - ✅ Row background berubah HIJAU
     - ✅ Status: ✅ Reward Given (green badge)
     - ✅ Reward Given At: [timestamp muncul]
     - ✅ Action: "✓ Completed" (bukan tombol lagi)
     - ✅ Tab badge hilang (count = 0)

5. **Verify Persistence**
   - Refresh page atau logout/login
   - Klik tab "Point Redemptions"
   - **VERIFY**: Row masih hijau, status masih "Reward Given"

---

## ✅ Fix 3: Cross-Division Data Lengkap + Clarification

### Test Steps:
1. **Submit Cross-Division Data**
   - Login sebagai contributor
   - Klik tab "Submit Cross-Division"
   - Fill form:
     - Title: "Tax Regulation Update 2024"
     - Division Category: "Tax Advisory"
     - Submission Date: [today]
     - Description: "Update terbaru mengenai peraturan pajak 2024 yang perlu diketahui semua divisi"
     - Attachment: [optional - upload file]
   - Submit

2. **Verify Data Muncul Lengkap**
   - Klik tab "My Data"
   - Scroll ke "My Cross-Division Data"
   - **VERIFY TABLE COLUMNS**:
     - ✅ Title: "Tax Regulation Update 2024"
     - ✅ Category: "Tax Advisory" (blue badge)
     - ✅ Submission Date: [today's date]
     - ✅ Description: "Update terbaru mengenai..." (full text)
     - ✅ Attachment: "View File" link atau "No file"
     - ✅ Status: PENDING (yellow badge)
     - ✅ Action: (kosong karena status PENDING)

3. **Request Clarification**
   - Login sebagai validator
   - Klik tab "Pending Validations"
   - Scroll ke "Pending Cross-Division Data"
   - Klik "Clarify" pada data yang baru disubmit
   - Input notes: "Mohon jelaskan lebih detail tentang impact ke divisi lain"

4. **Submit Clarification untuk Cross-Division**
   - Login sebagai contributor
   - Klik tab "My Data"
   - Scroll ke "My Cross-Division Data"
   - **VERIFY**:
     - ✅ Status: NEEDS_CLARIFICATION (orange badge)
     - ✅ Tombol "Submit Clarification" muncul di kolom Action
   - Klik tombol "Submit Clarification"
   - Modal muncul
   - Input: "Impact: 1) Tax Advisory perlu update client, 2) Tax Compliance perlu adjust workflow"
   - Submit

5. **VERIFY HASIL**:
   - ✅ Success message
   - ✅ Modal tertutup
   - ✅ **ROW TETAP SAMA** (tidak ada row baru)
   - ✅ Status: PENDING
   - ✅ Tombol clarification hilang
   - ✅ Semua data lain tetap sama

---

## Quick Checklist

### Fix 1: Clarification Row
- [ ] Clarification tidak membuat row baru
- [ ] Status berubah dari NEEDS_CLARIFICATION → PENDING
- [ ] Data tetap di row yang sama
- [ ] Validator bisa re-review data yang sama

### Fix 2: Point Redemption Table
- [ ] Tab "Point Redemptions" ada di ValidatorPortal
- [ ] Tab badge menunjukkan count pending redemptions
- [ ] Tabel menampilkan semua redemptions
- [ ] Tombol "Mark as Given" berfungsi
- [ ] Row highlight hijau setelah marked
- [ ] Timestamp "Reward Given At" muncul

### Fix 3: Cross-Division Complete
- [ ] Tabel menampilkan 7 kolom (termasuk Description & Action)
- [ ] Description muncul lengkap
- [ ] Attachment link berfungsi
- [ ] Tombol clarification muncul saat NEEDS_CLARIFICATION
- [ ] Clarification untuk cross-division berfungsi
- [ ] Row tetap sama setelah clarification

---

## Expected Results Summary

| Fix | Before | After |
|-----|--------|-------|
| **1. Clarification** | ❌ Mungkin ada bug row baru | ✅ Row tetap sama, hanya status berubah |
| **2. Point Redemption** | ❌ Notification bell saja | ✅ Tab dengan tabel tracking lengkap |
| **3. Cross-Division** | ❌ Data tidak lengkap, no clarification | ✅ Data lengkap + clarification support |

---

## Troubleshooting

### Issue: Row baru muncul setelah clarification
**Solution**: Ini tidak mungkin terjadi karena kode hanya update status, tidak create new row. Jika terjadi, clear browser cache dan restart frontend.

### Issue: Tab badge tidak muncul
**Solution**: 
1. Check console untuk error
2. Verify ada redemption yang pending
3. Refresh page

### Issue: Cross-division data kosong
**Solution**:
1. Verify data sudah disubmit
2. Check DEMO_MODE = true di api.js
3. Refresh page untuk reload data

---

## Next Steps After Testing

1. ✅ Verify semua 3 fixes berfungsi
2. ✅ Test edge cases (multiple clarifications, multiple redemptions)
3. ✅ Test dengan real backend (set DEMO_MODE = false)
4. ✅ Deploy ke production

**All fixes are ready for testing!** 🚀
