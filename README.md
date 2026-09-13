# Mehr-E-Commerce-frontend

Storefront for **MEHR**, a Pakistani fashion house (women, kids, shawls). React + Vite + TypeScript.

API: [Mehr-E-Commerce-Backend](https://github.com/sohail-brohi/Mehr-E-Commerce-Backend)

---

## Features

- Catalogue by category and collection, product pages with 360 viewer
- Guest bag and wishlist (device id, merged on sign-in)
- Checkout: COD, Stripe card, JazzCash / Easypaisa, bank transfer
- Account, order history, password reset
- Guest order tracking (`MHR-` number + email)
- Virtual try-on
- Atelier chatbot
- Studio (`/admin`) for catalogue, orders, customers, inbox, pay-to

---

## Architecture

```
src/
  main.tsx                 Browser entry
  app/
    App.tsx                Shell — errors, toasts, scroll
    providers.tsx          Query, router, shop store
    routes.tsx             URL map
  layouts/
    StorefrontLayout.tsx   Header, footer, bag, search, chat
  pages/
    storefront/            Shop, product, checkout, try-on, about
    account/               Login, profile, reset
    legal/                 Shipping, returns, privacy
    studio/                Admin desk + panels
  components/
    layout/                Header, footer, logo
    shop/                  Cards, filters, bag, search
    media/                 Images, 360 viewer
    try-on/                Fitting room
    chat/                  Atelier desk
    shared/                SEO, reveal, errors
    ui/                    shadcn primitives
  services/                API client, catalogue, payments, studio
  store/                   Shop context + React Query keys
  hooks/
  lib/utils.ts             `cn()` for shadcn
  assets/
```

| Layer | Owns |
|---|---|
| `app/` | Boot, providers, routes |
| `pages/` | Screens |
| `components/` | Reusable UI |
| `services/` | HTTP and domain helpers |
| `store/` | Client state |

`@/` maps to `src/`.

---

## Develop

Start the API on port 4000, then:

```sh
cd frontend
npm i
npm run dev
```

| Script | What it does |
|---|---|
| `npm run dev` | Vite on http://localhost:5173 |
| `npm run build` | Production bundle |
| `npm run lint` | ESLint |
| `npm run format` | Prettier |

Copy `frontend/.env.example` to `frontend/.env`.

```
VITE_API_URL=https://o3kgo9xbgs2u6s5ev0rxk566.161.97.71.161.sslip.io
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_xxxxxxxx
API_PORT=4000
```

`VITE_API_URL` is the API origin (no trailing slash). Leave it empty to proxy `/api` to `http://localhost:${API_PORT:-4000}`. Card checkout uses Stripe Checkout; only the publishable key belongs in the frontend.

---

## Stack

- React 19, Vite 8, TypeScript
- Tailwind CSS 4
- React Router 7
- TanStack Query
- shadcn/ui + Radix

---

## Routes

| Path | Page |
|---|---|
| `/` | Home |
| `/women` `/kids` `/shawls` `/new-arrivals` | Category |
| `/collections` | Chapters |
| `/products/:slug` | Product |
| `/wishlist` `/checkout` | Bag |
| `/try-on` `/try-on/:slug` | Fitting room |
| `/account` `/account/login` | Customer |
| `/track` | Guest order lookup |
| `/about` `/contact` `/shipping` `/returns` `/privacy` | House |
| `/admin` | Studio (admin JWT) |

---

## Talking to the API

`services/api.ts` sends `Authorization: Bearer` and `X-Guest-Id` on every call. Auth, catalogue, orders, wishlist, studio, chat, and media all go through that client.
