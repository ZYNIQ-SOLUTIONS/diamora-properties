# 🏢 Diamora Properties — Luxury UAE Real Estate Platform & Executive Portal

An ultra-luxury, high-performance real estate landing page and executive management system for **Diamora Properties** (Abu Dhabi & Dubai, UAE).

---

## 🌟 Key Features

1. **Cinematic Hero Experience**:
   - Ultra-luxury drone video banner with fluid GSAP/ScrollTrigger choreography.
   - Interactive instant search & filter bar by island/development, category, and budget.
2. **Signature Properties Showcase**:
   - Dynamic UAE luxury property cards (Palm Jumeirah Villas, Saadiyat Townhouses, Dubai Hills Mansions, Downtown Penthouses).
   - Real-time filtering, live pricing in AED, and instant WhatsApp inquiry deep links.
3. **Interactive Strategic Geolocation Hub**:
   - Customized Leaflet CartoDB Voyager map highlighting Abu Dhabi capital corridors (Saadiyat, Yas Island, Corniche, Al Maryah ADGM, Al Bateen).
   - Investment perimeter radar rings and landmark category chips.
4. **Lead Capture & VIP Network**:
   - Floating VIP Pre-Launch & Off-Market deals subscription card.
   - 45-minute private consultation booking form with auto-sync to backend API and WhatsApp handoff.
5. **Executive Admin Dashboard (`/dashboard`)**:
   - Obsidian Dark & Imperial Gold theme matching the master brand.
   - Live KPI metric cards (Total Portfolio Value, Available Units, VIP Leads).
   - Full CRUD property manager with preset image selector.
   - VIP Inquiries & leads manager with status workflow (`New`, `Contacted`, `Qualified`, `Closed`).
   - **Smart Dual-Mode Engine**: Operates seamlessly connected to the Express/MongoDB backend OR standalone with local browser caching.

---

## 🐳 1-Click Production Docker Deployment

Diamora Properties is fully containerized with high-performance Nginx, Node.js 20 API, and a persistent MongoDB database service.

### Quickstart with Docker Compose

```bash
# 1. Clone repository
git clone https://github.com/ZYNIQ-SOLUTIONS/diamora-properties.git
cd diamora-properties

# 2. Build and launch all production containers
./deploy.sh up
# or: docker compose up -d --build
```

Access the deployed platform:
- **Main Website**: [http://localhost/](http://localhost/)
- **Signature Properties Portfolio**: [http://localhost/properties](http://localhost/properties)
- **Executive Admin Portal**: [http://localhost/dashboard/](http://localhost/dashboard/)
- **API Health Check**: [http://localhost/api/health](http://localhost/api/health)

### Management CLI Commands (`./deploy.sh`)

| Command | Action |
| :--- | :--- |
| `./deploy.sh up` | Build and start all production containers in background |
| `./deploy.sh down` | Stop containers preserving persistent MongoDB volume |
| `./deploy.sh restart` | Restart all running containers |
| `./deploy.sh logs` | Stream live logs from all containers (or `./deploy.sh logs api`) |
| `./deploy.sh status` | Display health status of `web`, `api`, and `mongodb` containers |
| `./deploy.sh seed` | Run database seeding for luxury properties and admin user |
| `./deploy.sh backup` | Create a timestamped MongoDB archive dump in `./backups/` |

---

## 📋 System Requirements (Non-Docker Local Development)

| Requirement | Recommended Version | Purpose |
| :--- | :--- | :--- |
| **Node.js** | `v18.0.0` or higher | Running local dev server & backend API |
| **npm** | `v9.0.0` or higher | Package management |
| **Modern Browser** | Chrome, Safari, Edge, Firefox | WebP rendering, GSAP ScrollTrigger, Leaflet map |
| **MongoDB** *(Optional)* | `v6.0+` or MongoDB Atlas | Persistent database storage for properties & leads |

> [!NOTE]
> The platform includes **Smart Dual-Mode Resilience**. If MongoDB is not running locally, the entire website and Admin Dashboard will automatically function in high-speed Standalone Mode using LocalStorage caching.

---

## 🚀 Step-by-Step: How to Run & Test on Your Computer

### Step 1: Clone or Navigate to the Workspace
```bash
cd /path/to/diamora-landing-page
```

---

### Step 2: Start the Backend API *(Optional but Recommended)*

1. Navigate to the `api` directory and install dependencies:
   ```bash
   cd api
   npm install
   ```

2. *(Optional)* Seed initial admin credentials & luxury properties:
   ```bash
   npm run seed
   ```

3. Start the Express server:
   ```bash
   npm start
   ```
   > The API server will be live at `http://localhost:5000/api`

---

### Step 3: Start the Frontend Website & Dashboard

Open a **new terminal window** in the root directory of the project:

#### Option A: Using `npx serve` (Recommended)
```bash
npm start
# or
npx serve .
```

#### Option B: Using Python 3
```bash
python3 -m http.server 8080
```

#### Option C: Using VS Code Live Server
Right-click [`index.html`](file:///home/level-77/Desktop/diamora-landing-page/index.html) and select **"Open with Live Server"**.

---

## 🧪 Testing Checklist

Once your local server is running (e.g., at `http://localhost:3000` or `http://localhost:8080`):

| Test Item | URL | What to Verify |
| :--- | :--- | :--- |
| **1. Landing Page** | `/index.html` | Verify brand preloader, video hero, smooth scroll animations, architectural blueprint drawing, interactive Leaflet map, and WhatsApp floating button. |
| **2. Search & Filters** | `/index.html#heroSearchStage` | Test filtering properties by typology (Villas, Penthouses, Mansions), location, and keyword search. |
| **3. Lead Submissions** | `/index.html#vipNewsletterForm` | Enter an email in the VIP card or submit the consultation form at `/index.html#consult`. Verify success state. |
| **4. Signature Portfolio** | `/properties.html` | Verify full catalog rendering, filter chips, search bar, and WhatsApp inquiry buttons. |
| **5. Admin Portal Login** | `/dashboard/index.html` | Enter authorized administrator credentials. |
| **6. Dashboard Management** | `/dashboard/index.html` | • **Properties Tab**: Add a new property, edit existing, or delete.<br>• **VIP Leads Tab**: View submissions from the landing page and update lead statuses.<br>• **Settings Tab**: Ping API health or configure live settings. |

---

## 🔐 Admin Portal Management

To create or update administrator credentials, use the secure CLI utility:
```bash
docker exec -it diamora_api node create_admin.js <username> <password>
```

---

## 📁 Project Structure

```
diamora-landing-page/
├── 404.html                     # Luxury branded 404 error page
├── index.html                   # Master Landing Page
├── properties.html              # Full Signature Portfolio page
├── package.json                 # Project configuration & start scripts
├── netlify.toml                 # Netlify deployment configuration
├── LANDING_PAGE_INFO.md         # Brand guidelines & contact records
├── README.md                    # Setup & documentation manual
│
├── api/                         # Express & MongoDB Backend
│   ├── server.js                # API entry point (port 5000)
│   ├── seed_data.js             # Database seeder (Admin, Properties, Inquiries)
│   ├── package.json             # Backend dependencies
│   ├── models/
│   │   ├── User.js              # Admin user schema with bcrypt
│   │   ├── Property.js          # Property asset schema
│   │   └── Inquiry.js           # Leads and newsletter schema
│   └── routes/
│       ├── auth.js              # JWT login endpoint
│       ├── properties.js        # Properties CRUD
│       └── inquiries.js         # Leads CRUD & status tracking
│
├── dashboard/                   # Executive Admin Dashboard
│   ├── index.html               # Admin portal markup
│   ├── dashboard.css            # Obsidian & Gold executive styling
│   └── dashboard.js             # Controller with API & LocalStorage dual-mode
│
├── assets/
│   ├── herosection_video.MOV    # High-definition cinematic background video
│   ├── logos/                   # Master vector and transparent logos
│   │   ├── diamora-horizontal.svg
│   │   ├── diamora-horizontal-white.svg
│   │   ├── diamora-icon.svg
│   │   └── logo-gold.png
│   ├── properties/              # High-resolution property assets
│   │   ├── palm-villa.jpg
│   │   ├── saadiyat-townhouse.jpg
│   │   └── dubai-hills-mansion.jpg
│   └── images/
│       └── abudhabi_drone_view/ # Optimized WebP flyover sequence
│
├── css/
│   └── style.css                # Master luxury styling system
└── js/
    └── main.js                  # Hero sequence, Leaflet map & GSAP ScrollTriggers
```

---

## 🌐 Netlify Deployment

This repository is ready for instant deployment to Netlify:
1. Connect your repository to Netlify.
2. Build command: *(leave empty)*
3. Publish directory: `.`
4. Netlify will apply HTTP caching headers, WebP support, and clean URL routing defined in [`netlify.toml`](file:///home/level-77/Desktop/diamora-landing-page/netlify.toml).
