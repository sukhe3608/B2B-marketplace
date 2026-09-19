# TradeLink — Modern B2B Marketplace Platform

> India's leading role-aware B2B marketplace application, designed with enterprise architecture, strict wireframe fidelity, and 100% SVG React icons.

🌐 **Live GitHub Pages Preview**: [https://sukhe3608.github.io/B2B-marketplace/](https://sukhe3608.github.io/B2B-marketplace/)

---

## 🚀 Overview

TradeLink is a comprehensive, production-ready B2B marketplace platform modeled on **IndiaMART**'s business logic, role-aware onboarding funnel, and enterprise marketplace workflows.

### Key Screens Implemented:
1. **Landing Page (`#/`)**: High-bay warehouse handshake hero card, floating verified badge, trust metrics, and popular category grids.
2. **Sign Up (`#/signup`)**: Clean enterprise modal card with 3D logistics parcels illustration, 3-field input, Google SSO, and OTP verification modal.
3. **Role Selection (`#/onboarding/role`)**: Clean split between Consumer and Seller paths with custom circular action triggers.
4. **Consumer Details (`#/onboarding/consumer-details`)**: Multi-step indicator (Step 3 active), category interests dropdown, and recommendation artwork.
5. **Consumer Dashboard (`#/consumer/dashboard`)**: RFQs count, saved suppliers, messages, and category discovery.
6. **Seller Details (`#/onboarding/seller-details`)**: 4-step KYC wizard (Business Info, GST/PAN validation, KYC uploads).
7. **Verification Status (`#/seller/verification`)**: Concentric ring radar animation with status checklist and limited mode bypass.
8. **Seller Dashboard (`#/seller/dashboard`)**: Business growth area chart, quick action cards, and recent RFQs table.
9. **Seller Limited Dashboard (`#/seller/limited`)**: Amber verification status banner with unlocked vs locked feature matrix.
10. **Login Page (`#/login`)**: Split modal card with warehouse enterprise trust panel.

---

## 🛠️ Tech Stack
- **Framework**: React 19 + Vite
- **Routing**: React Router (HashRouter for seamless GitHub Pages SPA hosting)
- **Styling**: Vanilla CSS Design Tokens & Glassmorphism
- **Iconography**: 100% Lucide React SVG Icons (Zero raw emojis)
- **Validation**: Zod + React Hook Form + Indian GSTIN/PAN regex validators
- **State**: Zustand stores with persistent session synchronization
- **Charts**: Recharts

---

## 📦 Local Development

```bash
# Clone the repository
git clone https://github.com/sukhe3608/B2B-marketplace.git
cd B2B-marketplace

# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```
