# DriveDeal 🚗

Buy and sell **Indian cars** online: Tata, Mahindra, Maruti Suzuki, Force Motors and Hindustan Motors.

- **Frontend:** React + Vite + Tailwind CSS + Three.js (`@react-three/fiber`)
- **Backend:** Node.js + Express + SQLite (built into Node, no database account needed) + Socket.io
- **Auth:** email + password (bcrypt-hashed, JWT sessions)

## Features

Browse with filters (brand, budget, city, fuel, transmission, body type, year, km) · Car details with a **3D viewer** · Sell your car with photo upload · Login / Signup · Dashboard (my listings, saved cars) · **Live chat** between buyer and seller · Compare up to 3 cars · EMI calculator · Verified-seller badge · **Admin panel** (approve listings, verify sellers, read contact messages) · About · Contact

## Run it on your computer

You need [Node.js](https://nodejs.org) **22.13 or newer**.

```bash
npm run setup                       # installs everything
cp backend/.env.example backend/.env   # Windows PowerShell: Copy-Item backend\.env.example backend\.env
```

Open `backend/.env` and set `JWT_SECRET` to a long random string (see the comment in the file) and, if you like, `ADMIN_PASSWORD`. Then:

```bash
npm run dev
```

- Website: <http://localhost:5173>
- API: <http://localhost:5000>

On first start the database is created and filled with ~50 sample listings. The **admin** account is `admin@drivedeal.in` with the `ADMIN_PASSWORD` from your `.env` (if you left it blank, a random one is printed in the terminal on first run). Open `/admin` after logging in.

To wipe the data and start again: `npm run seed`.

## Online demo (GitHub Pages)

The workflow in `.github/workflows/pages.yml` publishes a **demo** of the front end to GitHub Pages on every push to `main`. GitHub Pages can only host static files, so the demo has no server: browsing, filters, 3D view, compare, saved cars and the EMI calculator work; login, selling, chat and admin need the full version above.

To enable it: repository **Settings → Pages → Source: GitHub Actions**.

## Project layout

```
backend/    Express API, SQLite database, chat (Socket.io), uploads
frontend/   React app (pages, components, 3D car)
shared/     Sample car data shared by the backend and the demo
```

## Going live for everyone later

Host `backend/` on any Node host (e.g. Render, Railway), host `frontend/` on Vercel/Netlify/GitHub Pages, and set `VITE_API_URL` (frontend) and `CLIENT_ORIGIN` (backend). For lasting data, use a host with a persistent disk, or move the database to a managed service.
