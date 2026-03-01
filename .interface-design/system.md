# Limohome Design System

## Direction: Warm & Grounded

A Kenyan household finance app that feels like sitting at the family kitchen table — warm wood, morning tea, shared stewardship of "our money."

## Color Palette

### Warm Neutrals (replacing cold slate)
| Token | Hex | Usage |
|-------|-----|-------|
| slate-50 | #FAF7F2 | Page background, cream surfaces |
| slate-100 | #F0EBE3 | Card hover, subtle fills |
| slate-200 | #E8E0D4 | Borders, dividers |
| slate-300 | #D4C9BA | Muted borders |
| slate-400 | #B3ACA3 | Placeholder text |
| slate-500 | #8A8279 | Secondary text |
| slate-600 | #5C5650 | Body text |
| slate-700 | #4A453F | Emphasis text |
| slate-800 | #3A3530 | Strong emphasis |
| slate-900 | #2D2A26 | Headings, primary text |

### Terracotta (primary accent, replacing blue)
| Token | Hex | Usage |
|-------|-----|-------|
| blue-50 | #FDF0E9 | Active backgrounds, selected states |
| blue-100 | #F9DFD0 | Light accent fills |
| blue-200 | #F0C4A8 | Hover accents |
| blue-300 | #E0A07A | Secondary accent |
| blue-400 | #D4844F | Medium accent |
| blue-500 | #C4663A | Primary action, active nav |
| blue-600 | #C4663A | Links, interactive |
| blue-700 | #A3522D | Hover on primary |
| blue-800 | #8B4425 | Pressed state |

### Highland Green (income/success)
| Token | Hex | Usage |
|-------|-----|-------|
| emerald-50 | #EDF7F0 | Success backgrounds |
| emerald-100 | #D0EBDA | Success fills |
| emerald-500 | #2D8659 | Income amounts, success text |
| emerald-600 | #2D8659 | Success icons |
| emerald-700 | #1F6B43 | Success hover |

### Ember (expense/destructive)
| Token | Hex | Usage |
|-------|-----|-------|
| red-50 | #FEF0F0 | Error backgrounds |
| red-500 | #C53030 | Expense amounts, errors |
| red-700 | #9B2C2C | Error hover |

### Golden (warning/budget)
| Token | Hex | Usage |
|-------|-----|-------|
| amber-50 | #FEF9E7 | Warning backgrounds |
| amber-500 | #D4940A | Warning text |
| amber-700 | #B07D08 | Warning hover |

### Chart Colors (hardcoded hex in order)
```
#C4663A  Terracotta (primary)
#2D8659  Highland green
#D4940A  Golden amber
#6B5344  Warm brown
#C53030  Ember red
#8A8279  Warm gray
#B5764E  Soft copper
#A3522D  Deep terracotta
```

## Typography

- **Sans:** DM Sans (`--font-dm-sans`) — warm, rounded, excellent number rendering
- **Mono:** Geist Mono (`--font-geist-mono`) — for code/data
- Body font stack: `var(--font-dm-sans), Arial, Helvetica, sans-serif`

## Depth Strategy: Borders Only

- Borders use warm neutrals (`border-slate-200`)
- No drop shadows on cards
- Elevation through subtle background shifts (cream → white)

## Spacing

- Base unit: 4px (Tailwind default)
- Card padding: `p-6` (24px)
- Section gaps: `space-y-6`
- Inline gaps: `gap-2` to `gap-4`

## Border Radius

- Cards: `rounded-xl` (12px)
- Buttons/inputs: `rounded-lg` (8px)
- Badges/tags: `rounded` (6px) or `rounded-full`

## Dark Mode

- Background: `#1A1816` (warm charcoal)
- Foreground: `#E8E0D4` (warm cream text)

## Signature Element

Household identity — "our money" language, member contributions visible on dashboard, shared notification bell. The app frames finance as family stewardship, not individual accounting.

## Key Patterns

- **Active nav:** `bg-blue-50 text-blue-700` → renders as terracotta tint
- **Income amounts:** `text-emerald-600` → renders as highland green
- **Expense amounts:** `text-red-600` → renders as warm ember
- **Card backgrounds:** `bg-white` on `bg-slate-50` cream surface
- **Section headers:** `text-sm font-semibold text-slate-700`
