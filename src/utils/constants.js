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

/* ── Mock Verified Suppliers (for Consumer Directory) ──────── */
export const MOCK_SUPPLIERS = [
  {
    id: 'sup-001',
    name: 'Apex Precision Engineering Ltd.',
    city: 'Pune, Maharashtra',
    rating: 4.8,
    reviewsCount: 142,
    verified: true,
    gstVerified: true,
    yearsInBusiness: 12,
    categories: ['Machinery', 'Industrial Tools'],
    description: 'Leading manufacturer of high-precision CNC turned parts, industrial valves, and hydraulic systems.',
    moq: '50 Pieces',
    responseTime: '< 2 hrs',
    primaryProducts: ['Precision CNC Lathe Parts', 'Hydraulic Control Valves', 'Industrial Flanges'],
  },
  {
    id: 'sup-002',
    name: 'Bharat ElectroTech Industries',
    city: 'Ahmedabad, Gujarat',
    rating: 4.9,
    reviewsCount: 289,
    verified: true,
    gstVerified: true,
    yearsInBusiness: 8,
    categories: ['Electronics', 'Industrial Tools'],
    description: 'Specialized in commercial LED lighting, power capacitors, and automated control panels.',
    moq: '100 Pieces',
    responseTime: '< 1 hr',
    primaryProducts: ['Commercial LED Floodlights', 'Industrial Power Supplies', 'SMD Components'],
  },
  {
    id: 'sup-003',
    name: 'Zenith Pack & Paper Mills',
    city: 'Surat, Gujarat',
    rating: 4.6,
    reviewsCount: 94,
    verified: true,
    gstVerified: true,
    yearsInBusiness: 15,
    categories: ['Packaging Materials'],
    description: 'Eco-friendly corrugated box manufacturer, heavy-duty shipping containers, and custom printed packaging.',
    moq: '500 Pieces',
    responseTime: '< 3 hrs',
    primaryProducts: ['Corrugated 5-Ply Shipping Boxes', 'Biodegradable Bubble Wrap', 'Printed Tape'],
  },
  {
    id: 'sup-004',
    name: 'Kavita Tex-Fabrics Global',
    city: 'Coimbatore, Tamil Nadu',
    rating: 4.7,
    reviewsCount: 118,
    verified: true,
    gstVerified: true,
    yearsInBusiness: 20,
    categories: ['Textiles', 'Fashion & Apparel'],
    description: 'Export-grade spun cotton yarn, industrial canvas, and fire-retardant safety workwear fabrics.',
    moq: '200 Meters',
    responseTime: '< 4 hrs',
    primaryProducts: ['Industrial Cotton Twill', 'Flame-Retardant Fabric', 'Bulk Spun Yarn'],
  },
];

/* ── Mock Conversations (for Messages Screen) ──────────────── */
export const MOCK_CONVERSATIONS = [
  {
    id: 'conv-001',
    participantName: 'Apex Precision Engineering',
    participantRole: 'Seller',
    avatar: 'A',
    online: true,
    rfqTitle: 'CNC Lathe Machine Parts (Qty: 500)',
    lastMessage: 'We have updated the revised quote with 5% bulk discount. Please check.',
    lastTime: '10:45 AM',
    unreadCount: 2,
    messages: [
      { id: 'm1', sender: 'seller', text: 'Hello Rahul! Thank you for requesting a quote on CNC Lathe Machine Parts.', time: '10:15 AM' },
      { id: 'm2', sender: 'buyer', text: 'Hi, what is your lead time for delivery to Mumbai?', time: '10:22 AM' },
      { id: 'm3', sender: 'seller', text: 'Standard production is 7 days, plus 2 days for transit.', time: '10:30 AM' },
      { id: 'm4', sender: 'seller', text: 'We have updated the revised quote with 5% bulk discount. Please check.', time: '10:45 AM' },
    ],
  },
  {
    id: 'conv-002',
    participantName: 'Bharat ElectroTech',
    participantRole: 'Seller',
    avatar: 'B',
    online: false,
    rfqTitle: 'LED Floodlights 100W (Qty: 100)',
    lastMessage: 'The samples have been dispatched via BlueDart tracking #94821.',
    lastTime: 'Yesterday',
    unreadCount: 0,
    messages: [
      { id: 'm20', sender: 'buyer', text: 'Can you send 2 samples before we confirm 100 units?', time: 'Yesterday 2:30 PM' },
      { id: 'm21', sender: 'seller', text: 'The samples have been dispatched via BlueDart tracking #94821.', time: 'Yesterday 4:15 PM' },
    ],
  },
  {
    id: 'conv-003',
    participantName: 'Zenith Pack & Paper',
    participantRole: 'Seller',
    avatar: 'Z',
    online: true,
    rfqTitle: 'Heavy Duty 5-Ply Cartons (Qty: 2,000)',
    lastMessage: 'Yes, customized logo printing is included free on orders above 1,000 pcs.',
    lastTime: 'Sep 17',
    unreadCount: 0,
    messages: [
      { id: 'm30', sender: 'buyer', text: 'Do you offer custom company branding on the boxes?', time: 'Sep 17' },
      { id: 'm31', sender: 'seller', text: 'Yes, customized logo printing is included free on orders above 1,000 pcs.', time: 'Sep 17' },
    ],
  },
];

/* ── Mock Orders (for Seller Orders screen) ─────────────────── */
export const MOCK_SELLER_ORDERS = [
  {
    id: 'ORD-8941',
    buyerName: 'Tata Projects Subcontracting',
    buyerEmail: 'procurement@tataprojects.demo',
    buyerCity: 'Mumbai, MH',
    productName: 'Heavy Industrial Valves & Regulators',
    quantity: 120,
    unitPrice: '₹2,400',
    totalAmount: '₹2,88,000',
    status: 'processing', // pending, processing, dispatched, completed
    orderDate: '2026-09-18',
    deliveryDue: '2026-09-28',
    paymentStatus: 'Paid (Escrow)',
  },
  {
    id: 'ORD-8920',
    buyerName: 'Mahindra Logistics Facilities',
    buyerEmail: 'supplies@mahindralogistics.demo',
    buyerCity: 'Pune, MH',
    productName: 'LED Warehouse High-Bay Lights 150W',
    quantity: 60,
    unitPrice: '₹1,850',
    totalAmount: '₹1,11,000',
    status: 'dispatched',
    orderDate: '2026-09-15',
    deliveryDue: '2026-09-22',
    paymentStatus: 'Paid (Escrow)',
  },
  {
    id: 'ORD-8895',
    buyerName: 'Reliance Retail Distribution Hub',
    buyerEmail: 'vendor.connect@ril.demo',
    buyerCity: 'Navi Mumbai, MH',
    productName: 'Industrial Grade Strapping Rolls (1000m)',
    quantity: 250,
    unitPrice: '₹480',
    totalAmount: '₹1,20,000',
    status: 'completed',
    orderDate: '2026-09-10',
    deliveryDue: '2026-09-16',
    paymentStatus: 'Released to Bank',
  },
  {
    id: 'ORD-8952',
    buyerName: 'Godrej Properties Procurement',
    buyerEmail: 'materials@godrejproperties.demo',
    buyerCity: 'Bengaluru, KA',
    productName: 'Safety Harness & Fall Arrestors',
    quantity: 80,
    unitPrice: '₹950',
    totalAmount: '₹76,000',
    status: 'pending',
    orderDate: '2026-09-20',
    deliveryDue: '2026-09-30',
    paymentStatus: 'Payment Awaiting',
  },
];

