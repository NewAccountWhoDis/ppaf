# PPAF — Public-Private Alliance Foundation

A fast, mobile-first, multi-page website for **PPAF**, "Helping Haiti Harness the Sun" — clean, safe, affordable solar cooking for Haitian families.

Static HTML/CSS/JS (no build step) plus **Decap CMS** so board members can publish reports and upload photos themselves.

---

## Pages

| File | Purpose |
|------|---------|
| `index.html` | Home — hero, problem→solution, how it works, impact, latest reports, donate CTA |
| `our-work.html` | The solar cooking program in depth |
| `about.html` | Mission, board & team bios, history, founder in memoriam |
| `history.html` | PPAF's story from its UN origins through Madagascar, the Dominican Republic, and Haiti |
| `supporters.html` | Historical directory of organizations that supported or collaborated with PPAF |
| `reports.html` | Reports list **and** individual report view (`reports.html?slug=...`) |
| `get-involved.html` | Donate, volunteer, intern, supporters |
| `contact.html` | Contact form (Netlify) + contact details |
| `admin/` | Decap CMS content studio for board members |

Shared: `css/styles.css`, `js/main.js` (nav, scroll reveal), `js/reports.js` (renders reports).
Report data lives in `reports/index.json`. Photos live in `images/uploads/`.

---

## Preview locally

Because the Reports section loads `reports/index.json`, open the site through a tiny local server (not by double-clicking the file):

```bash
cd "PPAF"
python3 -m http.server 8000
# then open http://localhost:8000
```

Everything except the live CMS login and the contact-form submission works locally.

---

## Deploy to Netlify (free)

1. Put this folder in a **GitHub repository** (`git init`, commit, push).
2. In Netlify: **Add new site → Import an existing project**, pick the repo.
   - Build command: *(leave empty)*  ·  Publish directory: `.`
3. Site goes live at `your-site.netlify.app` (add a custom domain anytime).

### Turn on board-member uploads (one-time)

1. Netlify dashboard → **Identity** → **Enable Identity**.
2. Identity → **Services** → **Enable Git Gateway**.
3. Identity → **Registration** → set to **Invite only** (recommended).
4. **Invite users** → enter each board member's email.
5. Board members click the email link, set a password, and land in the studio.

> If your repo's default branch isn't `main`, change `branch:` in `admin/config.yml`.

### Contact form
The form on `contact.html` is Netlify-ready (`data-netlify="true"`). Submissions appear under
**Netlify → Forms**. Add an email notification there to get messages in your inbox.

---

## For board members — publishing a report

1. Go to **`your-site.com/admin`** and log in.
2. **Reports → All Reports → Reports → Add Report**.
3. Fill in the title, a URL slug (e.g. `spring-update`), date, summary, and your text.
4. Add a **cover photo** and any **gallery** photos by dragging them in.
5. Click **Publish**. The site updates automatically in a minute or two.

No code required — and nothing can break the rest of the site.

---

## Before launch — quick checklist

- [ ] Confirm the external donation page and tax details.
- [ ] Confirm contact details and add any official social links.
- [ ] Publish verified field reports through the content studio.
- [ ] Enable Netlify Identity + Git Gateway and invite the board (steps above).

---

## Design notes
Warm "solar" identity: sunrise gradients, amber primary with deep-teal and clay accents, Fraunces display + Inter body. Authentic field photography is sourced from PPAF's public website. Mobile-first, semantic HTML, keyboard-accessible nav, and all motion respects `prefers-reduced-motion`.
