# TradeLink — Enterprise B2B Marketplace & Inventory ERP Platform

> A production-grade, role-aware Indian B2B marketplace and supplier inventory management platform. Modeled on enterprise B2B workflows (such as IndiaMART and Udaan), featuring wholesale tier/slab pricing, GST compliance, real-time inventory reservation, double-entry stock movement ledgers, RFQ price negotiations, and cross-role state synchronization.

---

## 📑 Table of Contents

1. [Architectural Overview](#-architectural-overview)
2. [Key Modules & Capabilities](#-key-modules--capabilities)
   - [A. Consumer Wholesale Shop](#a-consumer-wholesale-shop)
   - [B. Seller Inventory & ERP Management](#b-seller-inventory--erp-management)
   - [C. Auth, Onboarding & KYC Verification](#c-auth-onboarding--kyc-verification)
   - [D. Pure Business Logic Engine](#d-pure-business-logic-engine)
   - [E. Mock Database & Service Layer](#e-mock-database--service-layer)
3. [Component Hierarchy & Directory Structure](#-component-hierarchy--directory-structure)
4. [Cross-Side Integration & State Flow](#-cross-side-integration--state-flow)
   - [Stock Reservation & Fulfillment Lifecycle](#stock-reservation--fulfillment-lifecycle)
   - [RFQ & Custom Quote Lifecycle](#rfq--custom-quote-lifecycle)
5. [State Management Architecture](#-state-management-architecture)
6. [Design System & UI Components](#-design-system--ui-components)
7. [Testing & Quality Assurance](#-testing--quality-assurance)
8. [Getting Started & Local Development](#-getting-started--local-development)
9. [Demo Credentials & Dev Utilities](#-demo-credentials--dev-utilities)

---

## 🏛️ Architectural Overview

TradeLink operates as a **two-sided B2B platform** with strict role separation and synchronous state synchronization:

```
┌────────────────────────────────────────────────────────────────────────┐
│                          TradeLink Platform                            │
├──────────────────────────────────┬─────────────────────────────────────┤
│      Consumer Role (Buyer)       │        Seller Role (Supplier)       │
├──────────────────────────────────┼─────────────────────────────────────┤
│ • Wholesale Catalog Discovery    │ • Inventory Overview & KPI Metrics  │
│ • Quantity Slabs & MOQ Pricing   │ • Product Catalog & Variant Control │
│ • Multi-Seller Cart & Checkout   │ • Stock Adjustments (Restock/Loss)  │
│ • Purchase Order Tracking        │ • Order Fulfillment & Dispatching   │
│ • RFQ (Volume Quote) Requests    │ • RFQ Negotiation Desk              │
│ • Wishlist & Restock Alerts      │ • Double-Entry Audit Ledger         │
│ • Downloadable B2B Tax Invoices  │ • CSV Bulk Import / Export          │
└──────────────────────────────────┴─────────────────────────────────────┘
                                   │
               ┌───────────────────┴───────────────────┐
               ▼                                       ▼
      Core Business Logic                     Mock Database Engine
   (Pure Functions / Invariant)              (localStorage + Memory)
   • inventoryLogic.js                       • mockDb.js (Collections)
   • cartLogic.js                            • Realistic Latency (300ms)
               ▲                                       ▲
               └───────────────────┬───────────────────┘
                                   │
                           State Management
           • Redux Toolkit: Cart & Wishlist (Persistent)
           • Zustand: Auth, KYC, Session, Verification
           • React Query: Server State Cache & Invalidation
```

---

## 📦 Key Modules & Capabilities

### A. Consumer Wholesale Shop

| Route | Page Component | Features & Workflows |
|---|---|---|
| `/consumer/shop` | `ShopListingPage.jsx` | Wholesale catalog with multi-facet filters (category tree, seller, stock status, price range), search, grid/list view, volume price badges, and MOQ indicators. |
| `/consumer/shop/:id` | `ProductDetailPage.jsx` | 4-image interactive photo gallery, live stock status badge, interactive quantity tier slab table with real-time price calculations, MOQ stepper, "Request Custom Quote" modal, and "Save to Wishlist". |
| `/consumer/cart` | `CartPage.jsx` | Multi-seller partitioned cart, automatic quantity-tier discount application, itemized GST calculation (0%, 5%, 12%, 18%, 28%), live stock & MOQ re-validation against inventory with warning banners, and Save for Later. |
| `/consumer/checkout` | `CheckoutPage.jsx` | Multi-seller consignee address capture, freight option selection (Commercial Road vs Express Cargo), Net-30 Trade Credit limit vs COD payment methods, and atomic inventory stock reservation. |
| `/consumer/orders` | `OrdersPage.jsx` | Filter orders by status (`placed`, `confirmed`, `shipped`, `delivered`, `cancelled`), line item thumbnails, reorder action (re-populates cart), and order cancellation (releases reservations). |
| `/consumer/orders/:id` | `OrderDetailPage.jsx` | Fulfillment timeline, delivery destination details, line item pricing and tax breakdown, and downloadable commercial B2B Tax Invoice. |
| `/consumer/wishlist` | `WishlistPage.jsx` | Saved items, 1-click "Move to Cart", and back-in-stock notification alert toggle. |
| `/consumer/rfqs-shop` | `ConsumerRFQsShopPage.jsx` | Tracks submitted RFQs, displays supplier quotes, and provides a 1-click "Add Quoted Rate to Cart" action. |

---

### B. Seller Inventory & ERP Management

| Route | Page Component | Features & Workflows |
|---|---|---|
| `/seller/inventory` | `InventoryOverviewPage.jsx` | Real-time KPI cards (Total SKUs, Low Stock Count, Out of Stock Count, Total Warehouse Valuation in ₹), low-stock alert table with immediate stock adjust modal, and recent stock movement audit rows. |
| `/seller/inventory/products` | `ProductListPage.jsx` | Comprehensive SKU management table with stock status indicators, quick stock adjustment triggers, product cloning/duplication, CSV catalog export, and archiving. |
| `/seller/inventory/products/new`<br>`/seller/inventory/products/:id/edit` | `ProductFormPage.jsx` | Full product creator/editor with Zod schema validation, multi-image gallery manager, wholesale slab discount creator (`SlabEditor.jsx`), lead time, MOQ, and track-stock toggle. |
| `/seller/inventory/products/:id` | `ProductDetailPage.jsx` | SKU overview, stock metrics (`onHand`, `reserved`, `available`, `reorderLevel`), wholesale pricing tier table, image gallery, and dedicated movement history ledger. |
| `/seller/inventory/import` | `BulkImportPage.jsx` | PapaParse-powered CSV bulk catalog import with client-side header and type validation, error breakdown, downloadable template, and batch commit. |
| `/seller/inventory/movements` | `MovementsLedgerPage.jsx` | Double-entry inventory ledger logging all stock mutations (`in`, `out`, `reserved`, `released`, `adjustment`), with type filtering and CSV export. |
| `/seller/inventory/orders` | `InventoryOrdersPage.jsx` | Incoming purchase orders grouped by status, order lines preview with thumbnails, buyer shipping destination, and order processing links. |
| `/seller/inventory/orders/:id` | `InventoryOrderDetailPage.jsx` | Order fulfillment engine: Confirm order → Ship order (automatically deducts warehouse physical stock and records outbound movement) → Mark Delivered, or Reject order (releases reserved stock). |
| `/seller/inventory/rfqs` | `InventoryRFQsPage.jsx` | Inbound buyer volume RFQ inquiries, formal price quote formulation, and custom terms dispatch. |
| `/seller/inventory/reports` | `ReportsPage.jsx` | Inventory valuation analytics, category distribution charts, stock health breakdown, and turnover statistics. |

---

### C. Auth, Onboarding & KYC Verification

- **Role-Aware Authentication**: Clean login and signup screens with OTP simulation modal. Supports consumer and seller roles with persistent authentication.
- **KYC Onboarding Wizard**: Multi-step business onboarding capturing GSTIN, PAN, business addresses, and document verification.
- **Verification Gate Engine**: Sellers in `pending`, `rejected`, or `suspended` states see context banners (`VerificationBanner.jsx`) and are restricted to read-only mode until approved.
- **DevMenu State Switcher**: Interactive floating drawer in development mode allowing instant switching between seller verification states (`approved`, `pending`, `rejected`, `suspended`).

---

### D. Pure Business Logic Engine

All critical calculations are extracted into pure, zero-dependency, unit-tested functions located in `src/logic/`:

#### 1. Inventory Math (`src/logic/inventoryLogic.js`)

```javascript
// Available stock is strictly onHand minus active reserved allocations
computeAvailable(onHand, reserved) => Math.max(0, onHand - reserved)

// Automatic stock status categorization
computeStockStatus(available, reorderLevel, trackStock)
// Returns: 'made_to_order' | 'out_of_stock' | 'low_stock' | 'in_stock'

// Atomic stock state transitions
applyReserve(stock, qty)   // Increases reserved; throws if qty > available
applyShip(stock, qty)      // Decreases onHand & reserved equally upon dispatch
applyRelease(stock, qty)   // Decreases reserved on cancellation/rejection
applyAdjust(stock, newOnHand, reason) // Restock or inventory shrinkage
```

#### 2. Cart & Wholesale Pricing Math (`src/logic/cartLogic.js`)

```javascript
// Automatically selects the lowest eligible price slab based on volume
unitPrice(priceSlabs, qty, basePrice)

// GST & Line totals
lineGST(unitPrice, qty, gstRate)
lineTotal(unitPrice, qty, gstAmount)

// Real-time stock validation (flags if qty exceeds current available or under MOQ)
validateCartLine(line, product, stockLevel)

// Partitions a multi-vendor cart into discrete seller orders with independent totals
groupCartBySeller(cartLines)
```

---

### E. Mock Database & Service Layer

TradeLink uses an in-browser relational database simulation (`src/services/mockDb.js`) backed by `localStorage`:

- **Collections**: `products`, `stockLevels`, `stockMovements`, `orders`, `rfqs`, `sellers`, `categories`.
- **Relational Integrity**: Foreign keys (`sellerId`, `productId`, `consumerId`) are resolved automatically by the service layer.
- **Pre-Seeded Dataset**: 40 rich B2B industrial products across 6 verified suppliers with multi-tier pricing slabs, stock records, and high-resolution category photography.
- **Realistic Network Latency**: Built-in 300–600ms artificial latency simulating production REST APIs.
- **Service Segregation**:
  - `shopService.js`: Consumer-facing catalog, cart validation, order creation, RFQ submission.
  - `inventoryService.js`: Seller-facing catalog mutation, stock adjustments, order dispatch, quote submission.

---

## 🌲 Component Hierarchy & Directory Structure

```
src/
├── assets/                  # Brand assets, illustrations, category art
├── components/
│   ├── common/              # Shared UI primitives
│   │   ├── DevMenu.jsx      # Developer floating drawer (role switcher, KYC toggles, reset)
│   │   ├── ProductImage.jsx # Adaptive image component with SVG category fallbacks
│   │   ├── CategoryIcon.jsx # Lucide icon mapper for industry categories
│   │   └── Skeleton.jsx     # Loading shimmer skeletons
│   ├── inventory/           # Seller inventory UI components
│   │   ├── BulkImportPreview.jsx # CSV validation and error review modal
│   │   ├── ConfirmDialog.jsx     # Reusable confirmation and cancellation modal
│   │   ├── ImageUploader.jsx     # Product image manager with preview cards
│   │   ├── MovementTable.jsx     # Stock movement audit ledger table
│   │   ├── SlabEditor.jsx        # Wholesale price slab tier builder
│   │   ├── StockAdjustModal.jsx  # Inventory count adjustment modal (restock/loss)
│   │   └── VerificationBanner.jsx# KYC alert banner with action triggers
│   ├── layout/              # Structural chrome
│   │   ├── DashboardShell.jsx # Responsive dashboard sidebar, header, and user menu
│   │   ├── Navbar.jsx         # Consumer storefront header with cart badge
│   │   └── Footer.jsx         # Enterprise platform footer
│   └── shop/                # Consumer storefront components
│       ├── CartItem.jsx       # Cart row with stepper, price slabs, and warning flags
│       ├── CategoryTree.jsx   # Nested category filter tree
│       ├── ProductCard.jsx    # Catalog product card with tiered price previews
│       ├── QuantityStepper.jsx# MOQ-aware quantity incrementor/decrementor
│       ├── SellerCard.jsx     # Supplier credibility and rating card
│       ├── SlabTable.jsx      # Wholesale tier pricing breakdown table
│       └── StockBadge.jsx     # Visual inventory status badge (In Stock, Low Stock, etc.)
├── features/                # Query key definitions for React Query cache
│   ├── inventory/inventoryQueryKeys.js
│   └── shop/shopQueryKeys.js
├── hooks/
│   ├── index.js             # useAuth, useCart, useWishlist shortcuts
│   └── useQuery.js          # Lightweight React Query implementation
├── logic/                   # Pure business logic and unit tests
│   ├── cartLogic.js         # Volume pricing, GST, and cart validation
│   ├── cartLogic.test.js    # 4 cart math unit tests
│   ├── inventoryLogic.js    # Stock formulas, reservation, and shipment transitions
│   └── inventoryLogic.test.js # 6 inventory math unit tests
├── mocks/                   # Seed JSON datasets
│   ├── categories.json      # 6 industrial categories
│   ├── orders.json          # Pre-seeded purchase orders
│   ├── products.json        # 40 multi-image industrial products
│   ├── rfqs.json            # Pre-seeded RFQ inquiries
│   ├── sellers.json         # 6 verified supplier profiles
│   ├── stockLevels.json     # Warehouse onHand & reserved counters
│   └── stockMovements.json  # Double-entry audit ledger entries
├── pages/                   # Application route views
│   ├── Auth/                # Login, Signup, OTP modal
│   ├── Consumer/Shop/       # Shop, ProductDetail, Cart, Checkout, Orders, RFQs, Wishlist
│   ├── Onboarding/          # Role select, Buyer details, Seller KYC details
│   ├── Seller/Inventory/    # Overview, Products, New/Edit, Detail, Orders, RFQs, Movements, Reports
│   └── Landing/             # Homepage with marketplace metrics and category showcase
├── routes/
│   ├── AppRouter.jsx        # Complete HashRouter configuration
│   └── Guards.jsx           # ProtectedRoute and RoleGuard navigation gates
├── services/
│   ├── mockDb.js            # In-browser relational DB engine with localStorage persistence
│   ├── shopService.js       # Consumer API service
│   └── inventoryService.js  # Seller API service
├── store/
│   ├── reduxStore.js        # Redux Toolkit configuration
│   ├── cartSlice.js         # Shopping cart state with localStorage persistence
│   ├── wishlistSlice.js     # Wishlist and alert toggles
│   ├── uiSlice.js           # Modal and drawer state
│   ├── authStore.js         # Zustand authentication and session store
│   └── verificationStore.js # Zustand KYC status store
├── styles/                  # Design tokens, variables, typography, and utility classes
├── tests/
│   ├── integration/         # Cross-side integration flows (Buyer ↔ Supplier)
│   └── runner.js            # Standalone test runner (17 test cases)
└── utils/
    ├── constants.js         # Feature flags, payment methods, delivery options
    ├── csvHelper.js         # CSV export and parsing utilities
    └── validators.js        # GSTIN, PAN, and phone number regex validators
```

---

## 🔄 Cross-Side Integration & State Flow

TradeLink's signature architectural feature is **synchronous cross-side reactive consistency**: actions taken by a seller immediately reflect on the consumer storefront, and buyer purchases immediately alter supplier warehouse metrics.

### Stock Reservation & Fulfillment Lifecycle

```
[Buyer: Places Order at Checkout]
               │
               ▼
   mockDb: applyReserve()
   ├── onHand: unchanged
   ├── reserved: increases by Qty
   └── available: decreases (onHand - reserved)
               │
               ├────────────────────────────────────────┐
               ▼                                        ▼
   [Buyer Storefront View]                  [Seller Inventory View]
   • If available == 0:                     • Incoming Order appears in "Placed"
     Status -> "Out of Stock"               • Product stock shows reserved units
   • If available <= reorder:               • Low stock alerts trigger if applicable
     Status -> "Low Stock"
               │
               │
   ┌───────────┴────────────────────────────────────────┐
   ▼                                                    ▼
[Buyer: Cancels Order]                     [Seller: Confirms & Ships Order]
   │                                                    │
   ▼                                                    ▼
mockDb: applyRelease()                     mockDb: applyShip()
• reserved decreases by Qty                • onHand decreases by Qty
• available returns to original            • reserved decreases by Qty
• Stock restored in catalog                • Outbound movement logged in ledger
```

### RFQ & Custom Quote Lifecycle

```
1. [Buyer] submits custom quantity & requirements on Product Detail Page.
2. [Seller] receives inquiry in `/seller/inventory/rfqs`.
3. [Seller] enters formal quoted price per unit and terms of delivery.
4. [Buyer] receives notification in `/consumer/rfqs-shop`.
5. [Buyer] clicks "Add Quoted Rate to Cart" → item is added to cart at negotiated price.
```

---

## ⚡ State Management Architecture

TradeLink intentionally balances three state paradigms:

1. **Redux Toolkit (`src/store/`)**:
   - Manages **Client Domain State** that requires complex reducer math and persistence across browser sessions:
     - `cartSlice.js`: Line item quantity updates, automatic tier discount recalculation, and stock validation flags.
     - `wishlistSlice.js`: Saved item bookmarks and restock notification toggles.
2. **Zustand (`src/store/authStore.js`)**:
   - Manages **Session & Identity State**: current user profile, role switching (`consumer` vs `seller`), active seller ID, and KYC verification levels.
3. **React Query Pattern (`src/hooks/useQuery.js`)**:
   - Manages **Remote Server State**: cached queries for products, orders, stock levels, and RFQs, complete with cache key invalidation on mutations.

---

## 🎨 Design System & UI Components

The application is styled using **Vanilla CSS Design Tokens** located in `src/styles/design-tokens.css`:

- **Color Palette**:
  - Primary Brand: Deep Indigo (`#4F46E5`, `#4338CA`)
  - Accent / Amber: Warning and Low Stock (`#D97706`, `#F59E0B`)
  - Success / Green: In Stock and Verified (`#059669`, `#10B981`)
  - Danger / Crimson: Out of Stock and Cancellations (`#DC2626`)
  - Slate Neutrals: Modern enterprise backgrounds (`#F8FAFC`, `#F1F5F9`, `#0F172A`)
- **Iconography**: 100% SVG Lucide React icons — zero emojis in production components.
- **Responsive Layout**: Mobile-first design optimized from 360px smartphones up to 4K ultra-wide monitors.
- **Fail-Safe Images**: The custom `<ProductImage>` component wraps photography with automatic SVG fallbacks tailored to the product's industry category if an asset fails to load.

---

## 🧪 Testing & Quality Assurance

TradeLink includes an automated test runner with 17 test suites covering pure logic and end-to-end integration flows:

```bash
# Run test suite
npm test
# or direct node runner:
node src/tests/runner.js
```

### Test Coverage Highlights:
- **`inventoryLogic` Suite (6 tests)**:
  - `computeAvailable`: verifies `onHand - reserved` logic.
  - `computeStockStatus`: validates `in_stock`, `low_stock`, `out_of_stock`, and `made_to_order`.
  - `applyReserve`: verifies reservation and over-allocation prevention.
  - `applyShip`: verifies equal reduction of `onHand` and `reserved`.
  - `applyRelease`: verifies stock unlocking on cancellation.
  - `applyAdjust`: validates restock, shrinkage, and prevents `onHand < reserved`.
- **`cartLogic` Suite (4 tests)**:
  - `unitPrice`: verifies quantity slab threshold matching.
  - `lineGST` & `lineTotal`: validates Indian GST calculations.
  - `validateCartLine`: verifies MOQ and available stock boundary enforcement.
  - `groupCartBySeller`: verifies multi-vendor order partitioning.
- **Cross-Side Integration Suite (7 flows)**:
  - Flow 1: Seller adjusts stock to 0 → customer immediately sees out of stock, cart flagged.
  - Flow 2: Customer places order → reserved increases, catalog available decreases.
  - Flow 3: Seller confirms & ships → onHand and reserved reduced equally in warehouse.
  - Flow 4: Customer cancels order → reservation released back to catalog.
  - Flow 5: Seller archives product → SKU immediately disappears from customer catalog.
  - Flow 6: Customer RFQ inquiry → Seller submits quote → Buyer converts quote to cart.
  - Flow 7: Seller restocks inventory → product status transitions to `in_stock`.

---

## 🚀 Getting Started & Local Development

### Prerequisites
- Node.js (v18 or higher recommended)
- npm or pnpm

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/sukhe3608/B2B-marketplace.git
cd B2B-marketplace/B2B

# 2. Install dependencies
npm install

# 3. Start the development server
npm run dev

# 4. Open in browser
# Local URL: http://localhost:5173/
```

### Production Build

```bash
# Build the application
npm run build

# Preview the production build locally
npm run preview
```

---

## 🔑 Demo Credentials & Dev Utilities

To test both sides of the marketplace without completing the onboarding flow, use the pre-configured accounts:

| Role | Email | Password | Pre-linked Profile |
|---|---|---|---|
| **Consumer (Buyer)** | `consumer@demo.com` | `Demo@1234` | Demo Industrial Buyer |
| **Seller (Supplier)** | `seller@demo.com` | `Demo@1234` | Apex Industrial Tools (`sel-001`) |

### DevMenu (Floating Helper)
In the bottom-right corner of the screen, click the **Dev Tools** button to:
1. **Switch Roles**: Instantly toggle between Consumer and Seller views.
2. **Toggle Seller Verification**: Switch between `approved`, `pending`, `rejected`, and `suspended` to test KYC feature gating.
3. **Reset Demo Data**: Restore the mock database to its clean, original 40-product pre-seeded state.

---

## 📄 License

This project is proprietary and developed as an enterprise B2B platform demonstration.
