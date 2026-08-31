# Test Clarification & Reward Tracking

## Fitur Baru yang Diimplementasi

### 1. Clarification Input ✅
- Contributor bisa submit klarifikasi saat data status NEEDS_CLARIFICATION
- Modal form untuk input teks klarifikasi
- Data otomatis kembali ke status PENDING setelah klarifikasi disubmit

### 2. Reward Tracking ✅
- Validator bisa checklist redemption yang sudah diberikan reward
- Tracking timestamp kapan reward diberikan
- Visual indicator (hijau) untuk redemption yang sudah diberi reward

---

## Test Scenario 1: Clarification Flow

### STEP 1: Submit Data sebagai Contributor
1. Login: `contributor1` / `password123`
2. Submit Fee Data dengan semua fields lengkap
3. Logout

### STEP 2: Request Clarification sebagai Validator
1. Login: `validator1` / `password123`
2. Klik tab "Pending Validations"
3. Lihat data yang baru disubmit
4. Klik "Need Clarification"
5. Input notes: "Mohon jelaskan lebih detail tentang scope of work"
6. Confirm
7. Logout

### STEP 3: Submit Clarification sebagai Contributor
1. Login: `contributor1` / `password123`
2. Klik tab "My Data"
3. **Expected:** Data dengan status "NEEDS_CLARIFICATION" (badge orange)
4. **Expected:** Tombol "Submit Clarification" muncul di kolom Action
5. Klik tombol "Submit Clarification"
6. **Expected:** Modal muncul dengan form textarea
7. Input klarifikasi: "Scope of work mencakup: 1) Review SPT Tahunan, 2) Konsultasi pajak bulanan, 3) Pendampingan pemeriksaan"
8. Klik "Submit Clarification"
9. **Expected:** 
   - Success message
   - Modal tertutup
   - Data kembali ke status "PENDING"
10. Logout

### STEP 4: Re-validate sebagai Validator
1. Login: `validator1` / `password123`
2. Klik tab "Pending Validations"
3. **Expected:** Data yang sama muncul lagi dengan status PENDING
4. Review clarification (bisa dilihat di notes/history)
5. Klik "Accept"
6. **Expected:** Contributor dapat +5 poin

---

## Test Scenario 2: Reward Tracking Flow

### STEP 1: Accumulate Points
1. Login: `contributor1` / `password123`
2. Submit 2 data (fee + cross-division)
3. Logout
4. Login: `validator1` / `password123`
5. Approve kedua data
6. **Expected:** Contributor punya 10 poin

### STEP 2: Redeem Points
1. Login: `contributor1` / `password123`
2. Klik tab "My Points"
3. **Expected:** Total Points: 10
4. Klik "Redeem Points"
5. Input: 10 poin
6. Klik "Redeem"
7. **Expected:** Success message
8. Logout

### STEP 3: Check Notification & Mark Reward
1. Login: `validator1` / `password123`
2. **Expected:** Notification bell dengan badge "1"
3. Klik notification bell
4. **Expected:** Notification panel muncul dengan:
   - 🎁 Point Redemption Request
   - "John Contributor has redeemed 10 points"
   - Badge: "10 points"
   - Checkbox: "Tandai reward sudah diberikan"
5. **Checklist checkbox** untuk tandai reward sudah diberikan
6. **Expected:**
   - Checkbox tercentang
   - Text berubah: "✅ Reward sudah diberikan"
   - Timestamp muncul: "Diberikan: [datetime]"
   - Background notification berubah hijau muda

### STEP 4: Verify Tracking
1. Close notification panel
2. Buka lagi notification panel
3. **Expected:** 
   - Checkbox masih tercentang
   - Timestamp masih ada
   - Background masih hijau (reward-given)

---

## UI Screenshots

### Contributor - My Data with Clarification Button:
```
┌──────────┬─────────────┬──────────┬────────────────────┬────────┬──────────────────────┐
│Submitter │Service      │Service   │Status              │Action  │                      │
│          │Provider     │Type      │                    │        │                      │
├──────────┼─────────────┼──────────┼────────────────────┼────────┼──────────────────────┤
│Raffa     │PT ABC       │Tax       │NEEDS_CLARIFICATION │[Submit │                      │
│Tax Adv   │Consulting   │Compliance│                    │Clarif] │                      │
└──────────┴─────────────┴──────────┴────────────────────┴────────┴──────────────────────┘
```

### Clarification Modal:
```
┌─────────────────────────────────────────────────────────┐
│  Submit Clarification                              [×]  │
├─────────────────────────────────────────────────────────┤
│  Validator meminta klarifikasi tambahan untuk data ini. │
│  Silakan berikan penjelasan atau informasi tambahan.   │
│                                                         │
│  ┌───────────────────────────────────────────────────┐ │
│  │ Scope of work mencakup:                           │ │
│  │ 1) Review SPT Tahunan                             │ │
│  │ 2) Konsultasi pajak bulanan                       │ │
│  │ 3) Pendampingan pemeriksaan                       │ │
│  └───────────────────────────────────────────────────┘ │
│                                                         │
│                          [Batal] [Submit Clarification] │
└─────────────────────────────────────────────────────────┘
```

### Validator - Notification with Reward Tracking:
```
┌─────────────────────────────────────────────────────────┐
│  Notifications                                      [×] │
├─────────────────────────────────────────────────────────┤
│  🎁  Point Redemption Request                           │
│      John Contributor has redeemed 10 points            │
│      [10 points] 2024-02-18 10:30                       │
│      ─────────────────────────────────────────────────  │
│      ☑ ✅ Reward sudah diberikan                        │
│         Diberikan: 2024-02-18 10:35                     │
└─────────────────────────────────────────────────────────┘
```

---

## Expected Behavior

### Clarification Flow:
1. ✅ Validator request clarification → Status: NEEDS_CLARIFICATION
2. ✅ Contributor see orange badge + "Submit Clarification" button
3. ✅ Contributor submit clarification → Status: PENDING
4. ✅ Validator can re-review and approve/reject

### Reward Tracking Flow:
1. ✅ Contributor redeem points → Notification to validator
2. ✅ Validator see notification with checkbox
3. ✅ Validator check checkbox → Marked as reward given
4. ✅ Visual indicator (green background) for given rewards
5. ✅ Timestamp recorded for tracking

---

## Troubleshooting

### Clarification button tidak muncul?
1. **Check status:** Harus "NEEDS_CLARIFICATION"
2. **Restart frontend:** `cd client && npm start`
3. **Clear cache:** Ctrl + Shift + R

### Checkbox tidak berfungsi?
1. **Check console:** F12 → Console untuk error
2. **Verify API call:** Network tab → POST /mark-reward-given
3. **Restart frontend**

### Modal tidak muncul?
1. **Check import:** ClarificationModal harus di-import
2. **Check state:** showClarificationModal harus true
3. **Check CSS:** Modal overlay z-index harus tinggi

---

## Summary

✅ Clarification input: Contributor bisa submit klarifikasi
✅ Clarification modal: Form textarea dengan styling modern
✅ Status update: Auto kembali ke PENDING setelah klarifikasi
✅ Reward tracking: Validator bisa checklist reward yang sudah diberikan
✅ Visual indicator: Green background untuk reward yang sudah diberikan
✅ Timestamp tracking: Record kapan reward diberikan

**Next:** Test complete flow dari request clarification → submit → re-validate → redeem → mark reward!

