# 🏢 Diamora Properties — Landing Page

Modern, luxury, and high-performance real estate landing page for **Diamora Properties** (UAE).

---

## 🚀 Quick Deployment to Netlify

This repository is pre-configured with [`netlify.toml`](file:///home/level-77/Desktop/diamora-landing-page/netlify.toml), asset caching rules, custom 404 handler, and security headers.

### Option 1: Deploy via Git (Continuous Deployment)
1. Push this repository to your GitHub / GitLab / Bitbucket account:
   ```bash
   git add .
   git commit -m "feat: setup Diamora Properties landing page"
   git push origin main
   ```
2. Log in to [Netlify](https://app.netlify.com/).
3. Click **"Add new site"** > **"Import an existing project"**.
4. Select your repository.
5. Netlify will automatically detect the configuration in `netlify.toml`:
   - **Publish directory**: `.`
   - **Build command**: *(leave empty)*
6. Click **"Deploy site"**.

---

### Option 2: Deploy via Netlify CLI
Run directly from this project root:
```bash
npx netlify-cli deploy --prod --dir=.
```

---

## 📁 Repository Structure

```
├── .gitignore             # Standard ignore rules for OS & dependencies
├── netlify.toml           # Netlify publish, header, and redirect configuration
├── 404.html               # Luxury branded 404 error page
├── robots.txt             # Search engine crawling directives
├── sitemap.xml            # SEO sitemap
├── index.html             # Landing page entry point
├── LANDING_PAGE_INFO.md   # Brand assets, contact details & specifications
├── package.json           # Project metadata & local dev scripts
├── assets/
│   ├── logos/             # High-res gold, white, and icon logos
│   └── images/            # Showcase imagery
├── css/
│   └── style.css          # Design system & responsive styles
└── js/
    └── main.js            # GSAP animations & interactive features
```

---

## 💻 Local Development

To run the site locally:
```bash
npm start
# or
python3 -m http.server 8080
```
Open `http://localhost:8080` in your browser.
