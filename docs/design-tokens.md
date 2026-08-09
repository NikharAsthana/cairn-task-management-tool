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

### Priority Badges (text + icon share one color)
| Priority | Color                          | Icon         |
|----------|----------------------------------|--------------|
| High     | #EF4444 (Tailwind red-500)      | SignalHigh   |
| Medium   | #F97316 (Tailwind orange-500)   | SignalHigh (same icon as High — intentional, matches Figma; document as-is) |
| Low      | #9CA3AF (Tailwind gray-400)     | SignalLow    |
- height: 16px, width: fit-content (do not hardcode text widths)
- font: font-sans, medium weight, text-xs

### Label/Tag Chip ("Deployment" style)
- background: var(--base-secondary, #F5F5F5)
- text color: var(--base-secondary-foreground, #171717)
- icon: Lucide "Tag", color var(--base-foreground, #0A0A0A)
- padding: spacing/0-5 (vertical) spacing/2 (horizontal)
- border-radius: rounded-3xl (effectively full pill at this height)
- border: 1px solid transparent

### Due Date Pill ("29 Jul" style)
- background: var(--base-destructive, #DC2626) at ~10% opacity
- text + icon color: var(--base-destructive, #DC2626)
- icon: Lucide "Calendar"
- padding/radius/border: same as label chip above

### Task Card (Kanban)
- padding: spacing/3
- border-radius: rounded-md
- background: var(--base-background, #FFFFFF)
- border: 1px solid var(--base-border, #E5E5E5)
- internal vertical gap between title / avatar-row / chip-row: 16px
- title text: font-sans medium text-sm, color var(--base-accent-foreground, #171717)
- avatar: 20×20, rounded-full, fallback bg var(--base-muted, #F5F5F5)

### Table Header (List view)
- text: font-sans medium text-sm, color var(--base-primary, #171717)
- row height: 48px
- row background: not yet confirmed, defaulting to var(--base-muted) until spot-checked


## Task Detail Screen — component inventory (light pass, colors TODO)

New component types spotted (not yet color-inspected):
- Resources row (attach doc/link — icon + placeholder text button)
- Subtasks data table (Task / Priority / Members / Due Date / Actions)
- Comments/activity feed (avatar, name, relative timestamp, text, reply + emoji-react)
- Details sidebar panel (collapsible; Status, Priority, Members, Dates, Labels, Teams, Reporter fields)
- Priority levels — CONFIRMED 5, not 3: No Priority, Urgent, High, Medium, Low
  (board cards only showed High/Medium/Low — Urgent + No Priority colors still TODO)
- Date range picker (Start + End, calendar widget)
- Status field: current task shows "Backlog" (orange/amber dot) — exists as a valid
  status value; NOT currently mapped to a visible Kanban column. Open question,
  low priority — revisit if Projects' board or a Tasks-board scroll clarifies it.

### TODO (deferred to full pass / Phase 8)
- [ ] Exact hex for Backlog status dot
- [ ] Exact hex for Urgent + No Priority (only High/Medium/Low colors confirmed so far)
- [ ] Subtask table row styling, spacing, borders
- [ ] Comments feed spacing/avatar sizing
- [ ] Date range picker component styling


## Projects Screen — component inventory (light pass)

- Layout: same List-view table pattern as Tasks (List view), different columns:
  Projects / Priority / Lead / Due Date / Actions
- Frame size: CONFIRMED 1280×900 — second frame at this size (alongside Login).
  File treated as desktop-only; no further width checks needed.
- New component: "Fields" toolbar button — column visibility toggle dropdown
  (Status, Priority, Members, Due Date, Teams, Labels, Reporter)
- Toolbar also has search (magnifier) and filter (funnel) icons — same row as Fields
- "Lead" column = single-avatar assignee field, same avatar component as elsewhere
- Minor inconsistency spotted: primary action button reads "+ Add Task" in one
  screenshot, "+ Add Project" in another, same screen — likely template leftover,
  worth a one-line README deviation note (low priority, but good "attention to
  detail" signal)

## Theme / Color Mode dropdown — CONFIRMED matches planned approach
- Account avatar (sidebar top) → dropdown → "Change Theme" (Light/Dark) +
  "Color Mode" (Amber/Blue/Pink/Rose/Emerald/Black) + Settings link
- Settings page's own "Theme"/"Color" nav items are placeholders (no real frame) —
  this dropdown is the actual control. Plan unchanged: reuse this control set
  when building Settings in Phase 8, document as intentional deviation.
- No hex extraction needed for the 6 accent colors — deriving via shadcn
  convention per earlier decision.
  
## Settings / Profile Screen — component inventory (light pass)

- Layer name confirmed as "Blocks / Sidebar-02" in this screenshot —
  concrete example of the misleading-layer-name issue noted earlier
  (shared app-shell component name, not per-screen)
- Settings sidebar: Back to app, Search, Profile / Theme / Color nav items
  — Theme and Color confirmed as placeholders with no distinct content pane,
  consistent with plan to reuse account-dropdown Theme/Color controls instead
- New components:
  - Avatar upload row (image + label, click target presumably the avatar itself)
  - Read-only field + inline pencil edit icon (Email row)
  - Text input styled with placeholder-weight text as the value (Full name, Username)
  - Label + helper subtext pattern under field label (Title, Username)
  - Danger-zone section: muted heading + description, destructive-styled button
    ("Leave Workspace" — red text, presumably red-tinted bg on hover)
    
## Project Detail Screen — component inventory (light pass)

- Accessed via Projects > [project name] breadcrumb (confirmed: "Design Homepage")
- Shares the same grouped/collapsible List-view pattern as the main Tasks screen
  (sections: To Do / Doing / Completed — same table columns: Task, Priority,
  Members, Due Date, Actions; same "Add Task" row per group)
- Likely also has a Board (Kanban) view via the same view-toggle pattern seen on
  the main Tasks screen — not directly confirmed, low priority to chase further
- Visible task data (Design Homepage / Develop Login Feature / Test Payment
  Gateway) is repeated identically across all three status groups — confirmed
  placeholder/dummy content, not a real pattern to design around
- No new component types beyond what's already captured for Tasks (List view)

## Backlog status — RESOLVED (documented deviation, not pursued further)

Confirmed as a real, selectable status value (visible in the Task Detail
Status field and Priority-style dropdown pattern). However, it does not appear
as a rendered column/group in either board layout checked (main Tasks Kanban:
To Do / Doing / On Hold / Completed; Project Detail List view: To Do / Doing /
Completed). Decision: **treat as an intentional source-file inconsistency,
document in the README's deviations section** — e.g. "Backlog exists as a
valid status in the source file's data model but is not visually represented
as a board column anywhere in the Figma file; we've included it as a column
in our implementation for data-model completeness" (or excluded — final call
belongs in Phase 3 schema design, not now).
