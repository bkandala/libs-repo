# libs-repo — Shared EDS Component Library

This is the **central shared library** for all EDS (Edge Delivery Services) sites in this da.live organisation. It mirrors the pattern established by [Adobe Milo](https://github.com/adobecom/milo) — a single repo whose `/libs` directory is referenced by every consuming site.

---

## Architecture Overview

```
libs-repo (this repo — hosted on AEM Live)
│
│  Exposed URL: https://main--libs-repo--<org>.aem.live/libs
│
└── libs/
    ├── utils/utils.js        ← Core engine (setConfig, getConfig, loadBlock, loadArea …)
    ├── scripts/scripts.js    ← loadPage() — page-load pipeline
    ├── styles/styles.css     ← Design tokens + base CSS
    └── blocks/               ← All shared blocks
        ├── header/
        ├── footer/
        ├── fragment/
        ├── marquee/
        ├── cards/
        ├── columns/
        ├── carousel/
        ├── accordion/
        ├── modal/
        ├── table/
        ├── video/
        ├── section-metadata/
        └── metadata/

consumer-repo (any other site)
└── scripts/scripts.js        ← imports loadPage() from libs URL, calls loadPage({ libsUrl })
```

### How block resolution works

`loadBlock()` in `libs/utils/utils.js` resolves block files using this priority:

1. `externalLibs` override — per-block base URL registered in config
2. `config.base` — resolves to `libsUrl` (the shared libs URL) if provided
3. `config.codeRoot` — the consuming repo's own origin (fallback)

Path formula: `${base}/blocks/${blockName}/${blockName}.{js|css}`

So `cards` on a consumer site automatically loads from:
```
https://main--libs-repo--<org>.aem.live/libs/blocks/cards/cards.js
```

---

## Shared Blocks Catalogue

| Block | Description | Variants |
|-------|-------------|----------|
| `header` | Responsive nav, hamburger, dropdowns | — |
| `footer` | Footer loaded from /footer fragment | — |
| `fragment` | Inline content fragment loader | — |
| `marquee` | Full-width hero banner with BG image | `light`, `dark` |
| `cards` | Responsive card grid | `two-col`, `three-col` |
| `columns` | Multi-column layout | `align-center`, `reverse` |
| `carousel` | Slide carousel with dots + keyboard nav | — |
| `accordion` | `<details>`-based expand/collapse | — |
| `modal` | Fragment-loaded overlay dialog | — |
| `table` | Semantic HTML table from authored grid | `striped` |
| `video` | YouTube, Vimeo, or native `<video>` | — |
| `section-metadata` | Apply section style classes from content | — |
| `metadata` | Inject `<meta>` tags from content | — |

---

## Using this library in a consuming repo

### 1. `scripts/scripts.js` in the consumer repo

```javascript
// Resolve libs URL per environment
const LIBS_URL = (() => {
  const { host } = window.location;
  if (host.includes('localhost'))  return 'http://localhost:6456/libs';
  if (host.includes('.aem.page'))  return 'https://main--libs-repo--<org>.aem.page/libs';
  return 'https://main--libs-repo--<org>.aem.live/libs';
})();

const { loadPage } = await import(`${LIBS_URL}/scripts/scripts.js`);

await loadPage({
  libsUrl: LIBS_URL,   // ← this drives ALL shared block/style URLs
  codeRoot: '/',       // consumer repo's own root for custom blocks
});
```

### 2. `styles/styles.css` in the consumer repo

```css
/* Override design tokens — no need to copy base styles */
:root {
  --color-brand-primary: #fa0f00;
  --nav-height: 72px;
}
```

### 3. Custom blocks in the consumer repo

Only build blocks that are unique to that site. Blocks with the same name as a shared block will **not** automatically override — use `externalLibs` in `loadPage()` for that:

```javascript
await loadPage({
  libsUrl: LIBS_URL,
  codeRoot: '/',
  externalLibs: [
    { base: '/', blocks: ['my-override-block'] },
  ],
});
```

---

## Local Development

### Run the libs server (port 6456)
```bash
cd libs-repo
npm install
npm run libs   # serves /libs at http://localhost:6456/libs
```

### Run a consumer repo alongside it
```bash
cd consumer-repo
aem up         # proxies to localhost; scripts.js detects localhost → uses port 6456
```

---

## Adding a new shared block

1. Create `libs/blocks/<name>/` with `<name>.js` and `<name>.css`
2. Default export: `export default function decorate(block) { … }`
3. Import utilities from `../../utils/utils.js`
4. Document it in this CLAUDE.md table above
5. Preview → Publish this repo; consumers get the block automatically at next page load

---

## da.live Content Authoring

Pages within this repo are authored at **https://da.live** under the `libs-repo` org/repo.
Content is served through the AEM Code Sync GitHub App → `https://main--libs-repo--<org>.aem.live`.

| Action | Tool |
|--------|------|
| Edit page content | da.live editor |
| Preview changes | AEM Sidekick → Preview |
| Publish to live | AEM Sidekick → Publish |
| Edit block logic | Edit files in this repo, push to GitHub |

### `fstab.yaml`
```yaml
mountpoints:
  /:
    url: https://da.live/edit#/libs-repo
    type: markup
```

---

## Design Tokens

All design tokens live in `libs/styles/styles.css` as CSS custom properties on `:root`.
Consumer repos override them in their own `styles/styles.css` — no duplication of base styles needed.

Key tokens:
- `--color-brand-primary` / `--color-brand-secondary` — brand palette
- `--body-font-family` / `--heading-font-family`
- `--heading-font-size-*` / `--body-font-size-*`
- `--spacing-*` (xxs → xxxl)
- `--grid-max-width` / `--grid-padding`
- `--nav-height`
- `--border-radius-*` / `--box-shadow`
- `--transition-*`

---

## MCP Servers (`.claude/settings.json`)

Replace `<your-org>` with the actual GitHub org.

### `aem-eds` — preview/publish operations
### `da-live` — document CRUD in da.live
## this is the initial setup
