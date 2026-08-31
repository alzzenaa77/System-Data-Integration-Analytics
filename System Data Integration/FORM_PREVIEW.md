# Form Preview - Fee Competitor Input

## 🎨 Visual Design

### Form Layout

```
┌────────────────────────────────────────────────────────────────────┐
│                    Submit Fee Competitor Data                      │
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ ┃ Identitas Pengisi (Submitter Identity)                          │
│ ┃─────────────────────────────────────────────────────────────────│
│ ┃                                                                  │
│ ┃  ┌─────────────────┐  ┌─────────────────┐  ┌─────────────────┐│
│ ┃  │ Nama (Name) *   │  │ Divisi (Div) *  │  │ Tanggal Input * ││
│ ┃  │ [            ]  │  │ [            ]  │  │ [  /  /    ]    ││
│ ┃  └─────────────────┘  └─────────────────┘  └─────────────────┘│
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ ┃ Identitas (Service Provider & Recipient Identity)               │
│ ┃─────────────────────────────────────────────────────────────────│
│ ┃                                                                  │
│ ┃  ┌──────────────────────────────┐  ┌──────────────────────────┐│
│ ┃  │ Pemberi Jasa (Provider) *    │  │ Penerima Jasa (Recip) *  ││
│ ┃  │ [                         ]  │  │ [                     ]  ││
│ ┃  └──────────────────────────────┘  └──────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ ┃ Detail Jasa (Service Details)                                   │
│ ┃─────────────────────────────────────────────────────────────────│
│ ┃                                                                  │
│ ┃  ┌──────────────────────────────┐  ┌──────────────────────────┐│
│ ┃  │ Jenis Jasa (Service Type) *  │  │ Tahun Pajak (Tax Year) * ││
│ ┃  │ [                         ]  │  │ [                     ]  ││
│ ┃  └──────────────────────────────┘  └──────────────────────────┘│
│ ┃                                                                  │
│ ┃  ┌────────────────────────────────────────────────────────────┐│
│ ┃  │ Scope of Work *                                            ││
│ ┃  │ [                                                          ]││
│ ┃  │ [                                                          ]││
│ ┃  │ [                                                          ]││
│ ┃  └────────────────────────────────────────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│ ┃ Financial Data                                                   │
│ ┃─────────────────────────────────────────────────────────────────│
│ ┃                                                                  │
│ ┃  ┌──────────────────────────────┐  ┌──────────────────────────┐│
│ ┃  │ Jenis (Type) *               │  │ Skema Fee (Scheme) *     ││
│ ┃  │ [                         ]  │  │ [                     ]  ││
│ ┃  └──────────────────────────────┘  └──────────────────────────┘│
│ ┃                                                                  │
│ ┃  ┌────────────────────────────────────────────────────────────┐│
│ ┃  │ Deskripsi (Description) *                                  ││
│ ┃  │ [                                                          ]││
│ ┃  │ [                                                          ]││
│ ┃  │ [                                                          ]││
│ ┃  └────────────────────────────────────────────────────────────┘│
│ ┃                                                                  │
│ ┃  ┌─────────────────┐  ┌──────────┐  ┌─────────────────────────┐│
│ ┃  │ Nominal (Amt) * │  │Currency  │  │ Tanggal (Date) *        ││
│ ┃  │ [            ]  │  │ [IDR ▼]  │  │ [  /  /    ]            ││
│ ┃  └─────────────────┘  └──────────┘  └─────────────────────────┘│
└────────────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────────────┐
│                                                                    │
│  ┌──────────────┐  ┌──────────────┐                              │
│  │ Submit Data  │  │  Reset Form  │                              │
│  └──────────────┘  └──────────────┘                              │
└────────────────────────────────────────────────────────────────────┘
```

## 🎨 Color Scheme

### Section Backgrounds
- **Background**: `#f8f9fa` (Light gray)
- **Border Left**: `#007bff` (Blue accent - 4px)
- **Section Title Border**: `#dee2e6` (Gray - 2px bottom)

### Form Elements
- **Input Border**: `#ced4da` (Gray)
- **Input Focus**: `#80bdff` (Light blue)
- **Input Focus Shadow**: `rgba(0, 123, 255, 0.25)`

### Buttons
- **Primary (Submit)**: `#007bff` → `#0056b3` (hover)
- **Secondary (Reset)**: `#6c757d` → `#5a6268` (hover)

### Text Colors
- **Section Title**: `#333` (Dark gray)
- **Label**: `#495057` (Medium gray)
- **Placeholder**: `#adb5bd` (Light gray, italic)

## 📱 Responsive Behavior

### Desktop (> 768px)
```
┌─────────────┬─────────────┬─────────────┐
│   Field 1   │   Field 2   │   Field 3   │
└─────────────┴─────────────┴─────────────┘
```

### Mobile (< 768px)
```
┌─────────────────────────────────────────┐
│            Field 1                      │
├─────────────────────────────────────────┤
│            Field 2                      │
├─────────────────────────────────────────┤
│            Field 3                      │
└─────────────────────────────────────────┘
```

## 🎯 Interactive States

### Input Focus
```
┌────────────────────────────────────┐
│ Nama (Name) *                      │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │ ← Blue border
│ ┃ John Doe                      ┃ │ ← Blue shadow
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
└────────────────────────────────────┘
```

### Validation Error
```
┌────────────────────────────────────┐
│ Nama (Name) *                      │
│ ┏━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┓ │ ← Red border
│ ┃                               ┃ │
│ ┗━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━┛ │
│ ⚠ Field ini wajib diisi            │ ← Error message
└────────────────────────────────────┘
```

### Success Message
```
┌────────────────────────────────────────────────────────┐
│ ✓ Data fee berhasil disubmit!                         │ ← Green background
└────────────────────────────────────────────────────────┘
```

## 📊 Table Display

### Fee Data Table
```
┌──────────────┬──────────────┬──────────────┬──────────┬─────────┬──────────┬──────────┬────────┐
│  Submitter   │   Provider   │  Recipient   │   Type   │Tax Year │  Amount  │   Date   │ Status │
├──────────────┼──────────────┼──────────────┼──────────┼─────────┼──────────┼──────────┼────────┤
│ John Doe     │ ABC Consult  │ XYZ Corp     │   Tax    │  2024   │ IDR 50M  │ 15/01/24 │ [PEND] │
│ Tax Division │              │              │Consulting│         │  Fixed   │          │        │
├──────────────┼──────────────┼──────────────┼──────────┼─────────┼──────────┼──────────┼────────┤
│ Jane Smith   │ DEF Advisory │ ABC Inc      │  Audit   │  2024   │ USD 25K  │ 20/01/24 │ [ACPT] │
│ Audit Div    │              │              │          │         │ Hourly   │          │        │
└──────────────┴──────────────┴──────────────┴──────────┴─────────┴──────────┴──────────┴────────┘
```

### Submitter Info Styling
```
┌─────────────────┐
│ John Doe        │ ← Bold, 14px, #333
│ Tax Division    │ ← Small, 12px, #6c757d
└─────────────────┘
```

### Amount Display
```
┌─────────────────┐
│ IDR 50,000,000  │ ← Bold, main amount
│ Fixed           │ ← Small, 11px, fee scheme
└─────────────────┘
```

### Status Badges
```
┌─────────┐  ┌─────────┐  ┌─────────┐  ┌─────────┐
│ PENDING │  │ACCEPTED │  │REJECTED │  │ CLARIFY │
└─────────┘  └─────────┘  └─────────┘  └─────────┘
  Yellow       Green        Red          Blue
```

## 🎨 Typography

### Font Family
```
-apple-system, BlinkMacSystemFont, 'Segoe UI', 'Roboto', 
'Oxygen', 'Ubuntu', 'Cantarell', 'Fira Sans', 'Droid Sans', 
'Helvetica Neue', sans-serif
```

### Font Sizes
- **Section Title**: 18px, weight 600
- **Form Label**: 14px, weight 500
- **Input Text**: 14px, weight 400
- **Placeholder**: 14px, weight 400, italic
- **Small Text**: 12px, weight 400
- **Tiny Text**: 11px, weight 400

## 📐 Spacing

### Section Padding
- **Section**: 20px all sides
- **Section Margin**: 30px bottom

### Form Elements
- **Form Group Margin**: 15px bottom
- **Label Margin**: 5px bottom
- **Input Padding**: 10px 12px
- **Grid Gap**: 15px

### Buttons
- **Button Padding**: 10px 20px
- **Button Gap**: 10px
- **Actions Padding Top**: 20px
- **Actions Border Top**: 2px

## 🎯 Accessibility

### Labels
- ✅ All inputs have associated labels
- ✅ Required fields marked with asterisk (*)
- ✅ Bilingual labels (Indonesia/English)

### Focus States
- ✅ Clear focus indicators (blue border + shadow)
- ✅ Keyboard navigation supported
- ✅ Tab order follows logical flow

### Color Contrast
- ✅ Text meets WCAG AA standards
- ✅ Status badges have sufficient contrast
- ✅ Error messages clearly visible

## 💡 User Experience Features

### Visual Feedback
- ✅ Section separation dengan colors
- ✅ Hover effects pada buttons
- ✅ Focus states pada inputs
- ✅ Success/error messages

### Data Entry
- ✅ Helpful placeholders
- ✅ Date pickers untuk date fields
- ✅ Dropdown untuk currency
- ✅ Number validation untuk amount
- ✅ Textarea auto-resize

### Form Management
- ✅ Reset button untuk clear form
- ✅ Validation sebelum submit
- ✅ Clear error messages
- ✅ Success confirmation

## 🌟 Key Design Principles

1. **Clarity**: Clear section separation dan labels
2. **Consistency**: Uniform styling across all elements
3. **Feedback**: Immediate visual feedback untuk user actions
4. **Accessibility**: Keyboard navigation dan screen reader support
5. **Responsiveness**: Works seamlessly di semua device sizes
6. **Efficiency**: Logical flow dan minimal clicks required

---

**Design Status**: ✅ Implemented and Ready
**Last Updated**: February 13, 2026
