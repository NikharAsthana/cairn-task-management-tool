# Cairn — Design Tokens

Extracted from the Figma source file (`Assessment-Task`, view-only access) via manual
Inspect-panel readouts, since programmatic Figma MCP access is not available on this
file. Values below are **confirmed**; anything still marked `TODO` needs a follow-up
pass on another screen.

Token names in the `base-*` / `spacing/*` / `text/*` format are the names Figma's
Inspect panel reports directly. They closely match shadcn/ui's own default CSS
variable naming (`background`, `primary`, `primary-foreground`, `muted-foreground`,
`input`, etc.) — strong signal this file was built from a shadcn-based Figma kit. We
translate `base-X` → shadcn's `--X` variable, dropping the `base-` prefix, when we
wire this into `globals.css` in Phase 7.

## Colors (light mode — confirmed from Login screen)

| Token (Figma) | CSS variable (shadcn convention) | Hex | Used for |
|---|---|---|---|
| `base-background` | `--background` | `#FFFFFF` | Page background |
| `base-card-foreground` | `--card-foreground` | `#0A0A0A` | Heading / high-emphasis text |
| `base-muted-foreground` | `--muted-foreground` | `#737373` | Secondary / subtext |
| `base-primary` | `--primary` | `#171717` | Primary button fill |
| `base-primary-foreground` | `--primary-foreground` | `#FAFAFA` | Text on primary button |
| `base-input` | `--input` | `#E5E5E5` | Borders, outline buttons, dividers |

### TODO — still need to pull from other screens
- [ ] Priority colors: Urgent / High / Medium / Low (Tasks board + task detail priority dropdown)
- [ ] Status colors: Backlog / To Do / Doing / On Hold / Completed (Kanban column headers)
- [ ] Label/tag chip colors (Deployment, Research, Design, Testing, etc. — Task detail)
- [ ] Kanban card background + column background (may differ from page background)
- [ ] Dark mode — full value set (light mode confirmed above; dark mode not directly
      viewable via Inspect panel in view-only access — see note below)
- [ ] Six accent-color values: Amber / Blue / Pink / Rose / Emerald / Black (currently
      only visually spotted as swatches in the account dropdown, not yet inspected for hex)

**Note on dark mode / accent colors**: attempted to find Figma's variable-mode
switcher (the diamond/mode icon on bound values) to read these directly; not
accessible on this view-only file. Plan: derive dark mode and the six accent
palettes ourselves using shadcn's standard theming conventions once light mode
is fully mapped, and **document this explicitly as an intentional, disclosed
deviation in the README** per the brief's requirement to document any deviations
from the source design.

## Typography

| Token (Figma) | Resolved | Used for |
|---|---|---|
| `font/font-sans` | **Inter** | Base typeface — needs to be loaded via `next/font/google` in Phase 6 |
| `text/xl/font-size` | 20px | Headings (Login heading uses this with a manual 100% line-height override, not the scale default) |
| `text/sm/font-size` | 14px | Body / subtext |
| `text/sm/line-height` | 20px | Body / subtext (14px font, 20px line-height — matches Tailwind's default `text-sm`) |
| `font-weight/normal` | 400 | Body text |
| `font-weight/medium` | 500 | Button labels |
| `font-weight/semibold` | 600 | Headings |

### TODO
- [ ] Remaining type scale sizes (`text/xs`, `text/base`, `text/lg`, `text/2xl`, etc.) — pull from Tasks board, task detail, and settings screens as they appear

## Spacing

Confirmed: **the file's spacing scale is Tailwind's default 4px-based scale.**
Each `spacing/N` token resolves to `N × 4px`:

| Token | Resolved |
|---|---|
| `spacing/1.5` | 6px |
| `spacing/2` | 8px |
| `spacing/3` | 12px |
| `spacing/6` | 24px (used as the Login screen's vertical stack gap) |
| `spacing/10` | 40px (used as the Login frame's outer padding) |

**Implication for Phase 6**: no custom Tailwind spacing config needed — `p-10`,
`gap-6`, `p-2`, `p-3` etc. already match this file's values out of the box.

## Border radius

| Token | Resolved | Note |
|---|---|---|
| `border-radius/rounded-4xl` | 26px | On the 36px-tall Login buttons, this exceeds half the element height (18px), so it's **visually and functionally equivalent to Tailwind's `rounded-full`** — use `rounded-full`, not a hardcoded 26px value. |

### TODO
- [ ] Card corner radius (Task cards, project cards — likely a smaller, non-full value like `rounded-lg` or `rounded-xl`)

## Icon set

Confirmed from the Components page and the "Login with Google" button inspect data:
this file uses the **Remix Icon** library (e.g. `Remix Icon / more-line`,
`Remix Icon / google-fill`), not Lucide. Since Section 5's recommended stack defaults
to `lucide-react`, using Lucide's closest equivalents instead of pulling in a second
icon library is a reasonable, low-risk substitution — **also worth a one-line note
in the README's documented-deviations section**, even though it's a minor one.

## Frame sizing

| Screen | W × H |
|---|---|
| Login | 1280 × 900 |

### TODO
- [ ] Check W value on 2–3 other screens to confirm whether this is a desktop-only
      file (all ~1280px wide) or whether tablet/mobile-width frames exist elsewhere
      that we haven't spotted yet
