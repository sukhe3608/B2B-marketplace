/* ============================================================
   TradeLink — Constants
   Application-wide constants, categories, and dropdown options.
   ============================================================ */

/* ── Categories ───────────────────────────────────────────── */
export const CATEGORIES = [
  { id: 'machinery', label: 'Machinery', iconName: 'Factory', color: '#4F46E5' },
  { id: 'electronics', label: 'Electronics', iconName: 'Cpu', color: '#7C3AED' },
  { id: 'fashion', label: 'Fashion & Apparel', iconName: 'Shirt', color: '#EC4899' },
  { id: 'chemicals', label: 'Chemicals', iconName: 'FlaskConical', color: '#F59E0B' },
  { id: 'home-living', label: 'Home & Living', iconName: 'Home', color: '#10B981' },
  { id: 'industrial-tools', label: 'Industrial Tools', iconName: 'Wrench', color: '#06B6D4' },
  { id: 'food-beverages', label: 'Food & Beverages', iconName: 'ShoppingBag', color: '#EF4444' },
  { id: 'healthcare', label: 'Healthcare', iconName: 'HeartPulse', color: '#8B5CF6' },
  { id: 'construction', label: 'Construction', iconName: 'Building', color: '#D97706' },
  { id: 'automotive', label: 'Automotive', iconName: 'Car', color: '#334155' },
  { id: 'packaging', label: 'Packaging Materials', iconName: 'Box', color: '#059669' },
  { id: 'textiles', label: 'Textiles', iconName: 'Sparkles', color: '#DC2626' },
];

/* ── Business Types ───────────────────────────────────────── */
export const BUSINESS_TYPES = [
  { value: 'manufacturer', label: 'Manufacturer' },
  { value: 'trader', label: 'Trader / Wholesaler' },
  { value: 'service-provider', label: 'Service Provider' },
  { value: 'distributor', label: 'Distributor' },
  { value: 'retailer', label: 'Retailer' },
  { value: 'exporter', label: 'Exporter / Importer' },
];

/* ── Indian States ────────────────────────────────────────── */
export const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand',
  'Karnataka', 'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur',
  'Meghalaya', 'Mizoram', 'Nagaland', 'Odisha', 'Punjab',
  'Rajasthan', 'Sikkim', 'Tamil Nadu', 'Telangana', 'Tripura',
  'Uttar Pradesh', 'Uttarakhand', 'West Bengal',
  'Delhi', 'Chandigarh', 'Puducherry',
];

/* ── Employee Ranges ──────────────────────────────────────── */
export const EMPLOYEE_RANGES = [
  { value: '1-10', label: '1–10 employees' },
  { value: '11-50', label: '11–50 employees' },
  { value: '51-200', label: '51–200 employees' },
  { value: '201-500', label: '201–500 employees' },
  { value: '500+', label: '500+ employees' },
];

/* ── RFQ Statuses ─────────────────────────────────────────── */
export const RFQ_STATUSES = {
  OPEN: { value: 'open', label: 'Open', color: 'primary' },
  QUOTED: { value: 'quoted', label: 'Quoted', color: 'success' },
  NEGOTIATING: { value: 'negotiating', label: 'Negotiating', color: 'warning' },
  CLOSED: { value: 'closed', label: 'Closed', color: 'neutral' },
  EXPIRED: { value: 'expired', label: 'Expired', color: 'error' },
};

/* ── Verification Statuses ────────────────────────────────── */
export const VERIFICATION_STATUSES = {
  NONE: { value: 'none', label: 'Not Submitted', color: 'neutral' },
  PENDING: { value: 'pending', label: 'Pending Review', color: 'warning' },
  UNDER_REVIEW: { value: 'under_review', label: 'Under Review', color: 'primary' },
  VERIFIED: { value: 'verified', label: 'Verified', color: 'success' },
  REJECTED: { value: 'rejected', label: 'Rejected', color: 'error' },
};

/* ── Trust Stats (for landing page) ───────────────────────── */
export const TRUST_STATS = [
  { value: '5M+', label: 'Registered Buyers', icon: 'Users' },
  { value: '1.5M+', label: 'Verified Suppliers', icon: 'BadgeCheck' },
  { value: '50K+', label: 'Products & Categories', icon: 'Package' },
  { value: '99%', label: 'Trust & Safety', icon: 'ShieldCheck' },
];

/* ── How It Works Steps ───────────────────────────────────── */
export const HOW_IT_WORKS_CONSUMER = [
  { step: 1, title: 'Search Products', description: 'Browse millions of products across categories' },
  { step: 2, title: 'Compare Quotes', description: 'Get quotes from multiple verified suppliers' },
  { step: 3, title: 'Connect & Order', description: 'Connect directly and place your order' },
];

export const HOW_IT_WORKS_SELLER = [
  { step: 1, title: 'Register Free', description: 'Sign up and complete your business profile' },
  { step: 2, title: 'List Products', description: 'Add your catalog and showcase your business' },
  { step: 3, title: 'Get Leads', description: 'Receive buyer inquiries and grow your business' },
];

/* ── Navigation Links ─────────────────────────────────────── */
export const NAV_LINKS = [
  { label: 'Products', href: '#' },
  { label: 'Suppliers', href: '#' },
  { label: 'Categories', href: '#' },
  { label: 'About', href: '#' },
];

/* ── Consumer Sidebar Nav ─────────────────────────────────── */
export const CONSUMER_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/consumer/dashboard' },
  { id: 'rfqs', label: 'My RFQs', icon: 'FileText', path: '/consumer/rfqs' },
  { id: 'suppliers', label: 'Saved Suppliers', icon: 'Heart', path: '/consumer/suppliers' },
  { id: 'messages', label: 'Messages', icon: 'MessageSquare', path: '/consumer/messages' },
  { id: 'profile', label: 'Profile', icon: 'User', path: '/consumer/profile' },
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/consumer/settings' },
];

/* ── Seller Sidebar Nav ───────────────────────────────────── */
export const SELLER_NAV = [
  { id: 'dashboard', label: 'Dashboard', icon: 'LayoutDashboard', path: '/seller/dashboard' },
  { id: 'products', label: 'Products', icon: 'Package', path: '/seller/products' },
  { id: 'rfqs', label: 'RFQs', icon: 'FileText', path: '/seller/rfqs' },
  { id: 'orders', label: 'Orders', icon: 'ShoppingCart', path: '/seller/orders' },
  { id: 'company', label: 'Company Profile', icon: 'Building2', path: '/seller/company-profile' },
  { id: 'verification', label: 'Verification', icon: 'ShieldCheck', path: '/seller/verification' },
  { id: 'settings', label: 'Settings', icon: 'Settings', path: '/seller/settings' },
];

/* ── Testimonials ─────────────────────────────────────────── */
export const TESTIMONIALS = [
  {
    id: 1,
    name: 'Rajesh Gupta',
    company: 'Gupta Engineering Pvt Ltd',
    role: 'buyer',
    rating: 5,
    text: 'TradeLink helped us find verified industrial suppliers in just 2 days. The quality of leads is exceptional compared to other platforms.',
    avatar: 'RG',
  },
  {
    id: 2,
    name: 'Priya Sharma',
    company: 'Sharma Textiles',
    role: 'seller',
    rating: 5,
    text: "Our monthly inquiries tripled within 3 months of listing on TradeLink. The platform's verification system builds real trust with buyers.",
    avatar: 'PS',
  },
  {
    id: 3,
    name: 'Amit Verma',
    company: 'Verma Chemicals',
    role: 'seller',
    rating: 4,
    text: 'The seller dashboard is intuitive and the lead management tools save us hours every week. Highly recommended for B2B sellers.',
    avatar: 'AV',
  },
];

/* ── Mock Data ────────────────────────────────────────────── */
export const MOCK_RFQS = [
  {
    id: 'rfq-001',
    product: 'Industrial Water Pump — 5HP',
    category: 'Machinery',
    quantity: '50 Units',
    budget: '₹2,50,000 – ₹5,00,000',
    status: 'open',
    createdAt: '2026-09-15',
    quotesReceived: 3,
    buyer: 'Rahul K.',
  },
  {
    id: 'rfq-002',
    product: 'LED Strip Lights — Warm White',
    category: 'Electronics',
    quantity: '1000 Meters',
    budget: '₹50,000 – ₹1,00,000',
    status: 'quoted',
    createdAt: '2026-09-12',
    quotesReceived: 7,
    buyer: 'Megha S.',
  },
  {
    id: 'rfq-003',
    product: 'Packaging Materials — Corrugated Boxes',
    category: 'Packaging',
    quantity: '5000 Pieces',
    budget: '₹1,00,000 – ₹2,00,000',
    status: 'negotiating',
    createdAt: '2026-09-10',
    quotesReceived: 5,
    buyer: 'Suresh M.',
  },
  {
    id: 'rfq-004',
    product: 'Cotton Fabric — 40s Count',
    category: 'Textiles',
    quantity: '2000 Meters',
    budget: '₹80,000 – ₹1,50,000',
    status: 'closed',
    createdAt: '2026-09-05',
    quotesReceived: 4,
    buyer: 'Anita P.',
  },
  {
    id: 'rfq-005',
    product: 'Stainless Steel Pipes — 304 Grade',
    category: 'Industrial Tools',
    quantity: '200 Pieces',
    budget: '₹3,00,000 – ₹6,00,000',
    status: 'open',
    createdAt: '2026-09-18',
    quotesReceived: 1,
    buyer: 'Vikram R.',
  },
];

export const MOCK_SELLER_PRODUCTS = [
  {
    id: 'prod-001',
    name: 'Industrial Water Pump 5HP',
    category: 'Machinery',
    price: '₹8,500',
    stock: 'In Stock',
    views: 342,
    inquiries: 12,
    image: null,
  },
  {
    id: 'prod-002',
    name: 'LED Panel Light 18W',
    category: 'Electronics',
    price: '₹450',
    stock: 'In Stock',
    views: 1205,
    inquiries: 45,
    image: null,
  },
  {
    id: 'prod-003',
    name: 'Safety Helmet — ISI Certified',
    category: 'Industrial Tools',
    price: '₹250',
    stock: 'Low Stock',
    views: 678,
    inquiries: 23,
    image: null,
  },
];

export const MOCK_SELLER_STATS = {
  totalProducts: 24,
  activeRFQs: 12,
  pendingOrders: 5,
  totalViews: 3420,
  totalLeads: 156,
  responseRate: 92,
  monthlyGrowth: [
    { month: 'Apr', views: 1200, leads: 45 },
    { month: 'May', views: 1800, leads: 62 },
    { month: 'Jun', views: 2100, leads: 78 },
    { month: 'Jul', views: 1900, leads: 71 },
    { month: 'Aug', views: 2800, leads: 95 },
    { month: 'Sep', views: 3420, leads: 156 },
  ],
};

export const MOCK_CONSUMER_STATS = {
  activeRFQs: 12,
  savedSuppliers: 8,
  messages: 5,
};

/* ── Feature Flags ────────────────────────────────────────── */
export const FEATURES = {
  SOCIAL_LOGIN: true,
  PASSWORDLESS_OTP: true,
  CAPTCHA: false, // Enable in production
  AUTO_GST_VERIFY: true,
};
