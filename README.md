# Air Taxi 2099 🚕

A neon cyberpunk mobile arcade game. Dodge skyscrapers, collect fares, climb the leaderboard.

## 🚀 First-time GitHub Setup (do this once)

### 1. Create the repository

1. Go to [github.com/new](https://github.com/new)
2. Name it `air-taxi-2099`
3. Set it to **Public** (required for free GitHub Pages)
4. Click **Create repository**

### 2. Upload the files

Upload these files to the root of your repo:

```
air-taxi-2099/
├── index.html          ← the game
├── sw.js               ← service worker (offline + updates)
├── manifest.json       ← PWA install support
└── .github/
    └── workflows/
        └── deploy.yml  ← auto-deployment
```

**Quick way:** On your new repo page, click **uploading an existing file**, drag all files in, commit to `main`.

> **For `deploy.yml`:** You must create the folder path `.github/workflows/` manually in the GitHub UI,
> or use GitHub Desktop / git CLI to push the whole folder structure.

### 3. Enable GitHub Pages

1. Go to your repo → **Settings** → **Pages** (left sidebar)
2. Under **Source**, select **GitHub Actions**
3. Save

### 4. Wait ~30 seconds, then visit:

```
https://YOUR-USERNAME.github.io/air-taxi-2099/
```

That's it. The game is live. ✅

---

## 🔄 How to push an update

Every time you change the game:

### Step 1 — Bump the version in TWO places

**In `index.html`** (search for `GAME_VERSION`):
```javascript
const GAME_VERSION = '1.0.1'; // ← change this
```

**In `sw.js`** (first line):
```javascript
const CACHE_VERSION = '1.0.1'; // ← match it here
```

Both numbers must match. That's the whole version system.

### Step 2 — Commit and push

```bash
git add index.html sw.js
git commit -m "v1.0.1 - describe what changed"
git push
```

Or drag-and-drop updated files on GitHub.com and commit to `main`.

### Step 3 — GitHub deploys automatically

The Actions tab will show a yellow ⏳ spinner, then a green ✅ in about 30 seconds.
Players already on the game will see an **"⬆ UPDATE READY — TAP TO RELOAD"** banner
appear within 60 seconds. Tapping it reloads with the new version — no disruption mid-game.

---

## 📱 Offline play

The Service Worker caches the entire game (including music) on first load.
After that, it works with **zero internet connection**.

Players can also **install it as an app**:
- **Android:** Chrome → ⋮ menu → "Add to Home Screen"
- **iOS:** Safari → Share → "Add to Home Screen"

---

## 📂 File reference

| File | Purpose | Edit when... |
|------|---------|--------------|
| `index.html` | The entire game | Any game change |
| `sw.js` | Offline cache + update detection | Every release (bump version) |
| `manifest.json` | PWA install metadata | Changing name, icons, colors |
| `.github/workflows/deploy.yml` | Auto-deployment pipeline | Almost never |

---

## 🎨 Adding app icons (optional but recommended)

Create an `icons/` folder in your repo with:
- `icon-192.png` — 192×192px
- `icon-512.png` — 512×512px

Use a neon taxi on a dark background. Tools: [realfavicongenerator.net](https://realfavicongenerator.net)

---

## 🔗 Useful links

- **Live game:** `https://YOUR-USERNAME.github.io/air-taxi-2099/`
- **GitHub Actions (deploy status):** `https://github.com/YOUR-USERNAME/air-taxi-2099/actions`
- **GitHub Pages settings:** `https://github.com/YOUR-USERNAME/air-taxi-2099/settings/pages`
