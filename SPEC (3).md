# Tool 5 — Password Generator
### Digital Heroes Trial | Vibe Coding Spec for Antigravity + Claude

---

## What to Build
A free, secure, client-side password generator. No passwords sent to any server — everything runs in the browser using the Web Crypto API. Generate strong passwords instantly with full control over length, character sets, and count.

**Personal use case to mention in submission:**
> "Every time I create accounts for new services — AWS, Vercel, GitHub, MongoDB Atlas — I need a strong unique password. I was using random online generators but never trusted them. I wanted one that runs fully in the browser so nothing is ever sent to a server."

---

## Prompt to Paste into Antigravity (Claude Sonnet 4.6)

```
Build a single-file HTML/CSS/JS Password Generator web app. No frameworks, no build step — one index.html deployable directly on Vercel.

CORE FEATURES:
1. Generate strong random passwords using window.crypto.getRandomValues() — NOT Math.random()
2. Controls:
   - Password length slider: 8 to 128, default 16, live label showing current value
   - Checkboxes: Uppercase (A-Z), Lowercase (a-z), Numbers (0-9), Symbols (!@#$%^&*...)
   - Exclude ambiguous characters toggle (removes I, l, 1, O, 0, |)
   - Number of passwords to generate: 1 / 5 / 10 / 20 (button group)
3. Generate button — large, prominent
4. Output area showing generated password(s) — each on its own row with a Copy button per row
5. "Copy All" button when multiple passwords are shown
6. Password strength meter:
   - Visual bar (colored: red → orange → yellow → green)
   - Label: Weak / Fair / Strong / Very Strong
   - Entropy bits shown (e.g. "87.2 bits of entropy")
7. Strength is calculated from actual character pool size and length:
   Entropy = length × log2(pool_size)
   Weak < 40 bits | Fair 40–60 | Strong 60–80 | Very Strong > 80
8. Passphrase mode toggle — switch from random chars to a wordlist-based passphrase:
   - Word count selector: 3 / 4 / 5 / 6 words
   - Separator selector: hyphen / dot / underscore / space / none
   - Uses a built-in list of 200 common English words (embed in JS as an array)
   - Example output: "forest-canyon-bright-wallet"
9. History panel: last 10 generated passwords stored in sessionStorage (clears on tab close, never persists)
   - Show each with a copy button and a "🗑 Clear history" button
10. Keyboard shortcut: press Enter or Space to generate a new password
11. Auto-generate on page load (so output is never blank)
12. "Built for Digital Heroes" button linking to https://digitalheroesco.com — label must be EXACT
13. Show name "Phulkeshwar Mahto" and email "phulkeshwarmahto@gmail.com" on the page

DESIGN:
- Dark theme: background #0A0A0F, card surface #13131A, accent #A855F7 (purple — security/crypto feel)
- Font: Space Grotesk (Google Fonts) for everything
- Password output: monospace font (JetBrains Mono or Courier New), large font size (~1.2rem)
- Strength bar: full-width colored bar below the output, smooth CSS transition on color change
- Controls card on top, output card below — single column, centered, max-width 600px
- Subtle animated background: very faint moving grid or noise pattern using CSS (optional, keep it light)
- Copy button: shows "✓ Copied" for 2 seconds then reverts
- Mobile: all controls stack cleanly, slider is touch-friendly

SECURITY NOTE to show on the page (small text below the output):
"Passwords are generated entirely in your browser using the Web Crypto API. Nothing is sent to any server."

MANDATORY:
- Use window.crypto.getRandomValues() — never Math.random()
- Button labeled EXACTLY "Built for Digital Heroes" → href="https://digitalheroesco.com"
- Name: Phulkeshwar Mahto visible on page
- Email: phulkeshwarmahto@gmail.com visible on page (mailto: link)
- Works and produces real secure passwords
- No paid APIs or external JS libraries
```

---

## Required Output Checklist (verify before deploying)

- [ ] Password generates on page load — output not blank
- [ ] Length slider works — label updates live, password regenerates on slide
- [ ] All 4 checkboxes work — unchecking all shows an error, not a crash
- [ ] "Exclude ambiguous" toggle removes I, l, 1, O, 0, | from output (verify manually)
- [ ] Count buttons (1/5/10/20) show the correct number of passwords
- [ ] Each password row has its own Copy button → shows "✓ Copied" then reverts
- [ ] "Copy All" appears when count > 1 and copies all passwords newline-separated
- [ ] Strength bar changes color correctly (red for short/simple, green for long/complex)
- [ ] Entropy bits displayed and match expected value (e.g. 16 chars, all sets ≈ 104 bits)
- [ ] Passphrase mode toggle switches to word-based output
- [ ] Passphrase word count and separator selectors work correctly
- [ ] History panel shows last 10 generated, each with copy button
- [ ] History clears on "Clear history" click
- [ ] History is gone after closing and reopening the tab (sessionStorage, not localStorage)
- [ ] Enter/Space keyboard shortcut generates a new password
- [ ] Security note visible below output
- [ ] "Built for Digital Heroes" button with exact label → digitalheroesco.com
- [ ] Name and email visible on page
- [ ] No console errors on load

---

## Test Cases (run these to verify)

**Entropy check:**
- Length 16, all character sets (26+26+10+32 = 94 chars)
- Expected entropy = 16 × log2(94) = 16 × 6.555 = **104.9 bits** → should show "Very Strong"

**Ambiguous exclusion check:**
- Enable "Exclude ambiguous", generate 20 passwords
- Scan output — none should contain: `I`, `l`, `1`, `O`, `0`, `|`

**Passphrase check:**
- Switch to passphrase mode, 4 words, hyphen separator
- Output should look like: `marble-forest-canyon-bright`
- All lowercase real words, exactly 4, separated by hyphens

**Crypto check (open browser console):**
```js
// This should NOT appear anywhere in the source code:
Math.random()
// This SHOULD appear:
window.crypto.getRandomValues
```

---

## GitHub → Vercel Deployment

### Step 1 — GitHub Repo
```bash
git init
git add index.html
git commit -m "feat: password generator - Digital Heroes trial tool 5"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/password-generator-tool.git
git push -u origin main
```

### Step 2 — Vercel Deploy
1. vercel.com → **Add New Project** → Import `password-generator-tool`
2. Framework Preset: **Other**
3. Build Command: **blank**
4. Output Directory: **blank**
5. Click **Deploy** → copy live URL

### Step 3 — Verify Live
- Open live URL → password auto-generated on load
- Slide length → password updates, strength meter changes
- Click "Built for Digital Heroes" → goes to digitalheroesco.com
- Open DevTools console → no errors
- Test on mobile — slider and buttons touch-friendly

---

## Submission Line (copy-paste ready)

> **Tool:** Password Generator
> **Personal use:** I create accounts on AWS, Vercel, MongoDB Atlas constantly — I needed a strong password generator I could trust. Online ones might log your passwords. This runs fully in the browser using Web Crypto API — nothing hits a server.
> **Live URL:** https://password-generator-tool.vercel.app
> **GitHub:** https://github.com/phulkeshwarmahto/password-generator-tool
> **Name:** Phulkeshwar Mahto
> **Email:** phulkeshwarmahto@gmail.com

---

## Antigravity Debug Hints

| Problem | Fix to tell Claude |
|---------|-------------------|
| Math.random() used instead of crypto | *"Replace all random number generation with: `const arr = new Uint32Array(1); crypto.getRandomValues(arr); return arr[0] / 0xFFFFFFFF`"* |
| Strength bar not transitioning smoothly | *"Add `transition: width 0.3s ease, background-color 0.3s ease` to the strength bar CSS"* |
| Checking all boxes off crashes the app | *"Add a guard at the top of generate(): if charPool is empty, show an error message and return early"* |
| Passphrase not switching layout | *"Toggle a CSS class on the controls card — `.passphrase-mode` shows word/separator controls, hides char-set checkboxes"* |
| History not showing | *"After every generate(), push to a `history` array (max 10, use unshift + slice), then call renderHistory() to rebuild the history panel HTML"* |
