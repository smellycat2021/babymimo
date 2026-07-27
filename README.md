# yoora.io — website

Static site for **yoora.io** (Yoora Baby Tracker + Yoora Daycare), served by GitHub Pages.

- `index.html` — Baby Tracker home
- `daycare.html` — Yoora Daycare page
- `privacy.html`, `terms.html` — legal
- `media/` — images/assets
- `analytics.js` — analytics snippet

---

## ⚠️ Deploy branch is `main` — NOT `cname`

**GitHub Pages builds yoora.io from the `main` branch** (`Settings → Pages → Source: main /`).

There is a branch literally named **`cname`**. It is a **trap**: despite the name and the
`CNAME` file, Pages does **not** deploy from it. A fresh `git clone` / local checkout may
land you on `cname`, so it's easy to commit + push there and see **nothing change on the
live site.** (This exact mistake happened on 2026-07-27.)

**To publish a change, it must land on `main`.**

### How to publish (the reliable way)

```bash
# 1. make your edit to index.html / daycare.html / etc.
# 2. commit it (whatever branch you're on)
git add daycare.html
git commit -m "…"

# 3. put that commit on main and push (this is what actually deploys)
COMMIT=$(git rev-parse HEAD)
git fetch origin
git worktree add /tmp/wt-main origin/main        # isolated checkout of main
cd /tmp/wt-main
git cherry-pick "$COMMIT"
git push origin HEAD:main                          # ← deploys to yoora.io
cd -
git worktree remove /tmp/wt-main --force
```

Or, if you just want to work on `main` directly, `git checkout main` first and commit +
push there — then you never touch `cname`.

### Verify the deploy

Pages takes ~30–90s to rebuild after a push to `main`:

```bash
curl -s -o /dev/null -w "%{http_code}\n" "https://yoora.io/daycare.html?cb=$(date +%s)"
# 200 = live. Browser caches aggressively — hard-refresh (Cmd+Shift+R) or use incognito.
```

Pages build status:
```bash
gh api repos/smellycat2021/babymimo/pages/builds/latest | grep -E '"status"|"commit"'
```

---

## Auth

Pushing uses the **`gh` CLI** credential (`gh auth status` → account `smellycat2021`,
`repo` scope). No manual PAT needed. (An older `ghp_` token was revoked/dead — ignore any
note that says a new token is required; `gh` handles it.)

## Custom domain

`CNAME` file = `yoora.io`. HTTPS cert is managed by GitHub Pages. Keep the `CNAME` file in
whatever branch Pages deploys (`main`) so the custom domain sticks.

## TODO / gotchas

- [ ] Reconcile or delete the `cname` branch to remove the trap (it and `main` currently
      hold the same content apart from history).
- [ ] `daycare.html` has a placeholder Cloudflare analytics token
      (`YOUR_CF_TOKEN_HERE`) — replace with the real token for analytics to record.
