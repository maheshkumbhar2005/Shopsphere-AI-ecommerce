/**
 * ShopSphere AI - Complete Storefront, Admin & AI Analytics Logic
 * Features:
 * - AI & Machine Learning Analytics (FastAPI Integration):
 *    • Personalized product recommendations (based on active cart & affinity graph)
 *    • Related-product suggestions in quick-view inspection modal
 *    • Sales & demand forecasting (7-day weighted moving-average with confidence score)
 *    • RFM Customer Segmentation (VIP Champions, Loyal Advocates, Potential, At-Risk)
 *    • Natural Language Processing (NLP) sentiment scoring for customer reviews
 *    • Admin analytics dashboard with interactive SVG chart & category distribution bars
 * - Full Customer Storefront:
 *    • Catalog search, categories, filter pills, sorting, pagination, wishlist, cart
 *    • Customer account authorization, saved addresses, order tracking
 * - Full Admin Management Console:
 *    • Products & stock CRUD, Order fulfillment status, Customer accounts, Coupons
 */

const API = 'http://localhost:8080/api';
const ANALYTICS_API = 'http://127.0.0.1:8000/analytics';

// -------------------------------------------------------------
// USER SESSION & AUTH STATE MANAGEMENT
// -------------------------------------------------------------
const DEFAULT_DEMO_USERS = [
  {
    id: 'usr_admin_001',
    name: 'Administrator',
    email: 'admin@shopsphere.ai',
    password: 'admin',
    role: 'ADMIN',
    addresses: [
      { id: 'addr_adm', label: 'HQ Office', street: 'Cyber City, Sector 5', city: 'Bengaluru', state: 'Karnataka', pincode: '560100' }
    ]
  },
  {
    id: 'usr_demo_101',
    name: 'Demo Student',
    email: 'student@example.com',
    password: 'demo',
    role: 'CUSTOMER',
    addresses: [
      { id: 'addr_1', label: 'Campus Dorm', street: 'Room 304, Block B, University Hostels', city: 'Mumbai', state: 'Maharashtra', pincode: '400076' },
      { id: 'addr_2', label: 'Home', street: 'Flat 12, Silver Oak Residency, MG Road', city: 'Pune', state: 'Maharashtra', pincode: '411001' }
    ]
  }
];

function getUsersStore() {
  const data = localStorage.getItem('shopsphere_registered_users');
  if (!data) {
    localStorage.setItem('shopsphere_registered_users', JSON.stringify(DEFAULT_DEMO_USERS));
    return DEFAULT_DEMO_USERS;
  }
  return JSON.parse(data);
}

function saveUsersStore(users) {
  localStorage.setItem('shopsphere_registered_users', JSON.stringify(users));
}

let currentUser = JSON.parse(localStorage.getItem('shopsphere_current_user') || 'null');

function getUserCartKey() {
  return currentUser ? `shopsphere_cart_${currentUser.email}` : 'shopsphere_cart_guest';
}
function getUserWishlistKey() {
  return currentUser ? `shopsphere_wishlist_${currentUser.email}` : 'shopsphere_wishlist_guest';
}
function getUserOrdersKey() {
  return currentUser ? `shopsphere_orders_${currentUser.email}` : 'shopsphere_orders_guest';
}

function getAllOrdersStore() {
  const data = localStorage.getItem('shopsphere_all_orders');
  if (!data) {
    const initialOrders = [
      {
        orderId: 98124,
        customerName: 'Aarav Sharma',
        customerEmail: 'aarav@example.com',
        address: 'Plot 45, Bandra West, Mumbai - 400050',
        date: 'Oct 22, 2026',
        items: [{ productId: 1, productName: 'Spatial Noise-Canceling Headphones', price: 2499.00, quantity: 1 }],
        total: 2499.00,
        status: 'Delivered'
      },
      {
        orderId: 98125,
        customerName: 'Priya Patel',
        customerEmail: 'priya@example.com',
        address: 'Indiranagar 100ft Road, Bengaluru - 560038',
        date: 'Oct 24, 2026',
        items: [{ productId: 2, productName: 'Everyday Minimalist Backpack', price: 1599.00, quantity: 1 }],
        total: 1599.00,
        status: 'Shipped'
      },
      {
        orderId: 98126,
        customerName: 'Demo Student',
        customerEmail: 'student@example.com',
        address: 'Room 304, Block B, University Hostels, Mumbai - 400076',
        date: 'Oct 25, 2026',
        items: [{ productId: 4, productName: 'Ergonomic LED Dual-Bar Desk Lamp', price: 899.00, quantity: 2 }],
        total: 1798.00,
        status: 'Processing'
      }
    ];
    localStorage.setItem('shopsphere_all_orders', JSON.stringify(initialOrders));
    return initialOrders;
  }
  return JSON.parse(data);
}

function saveAllOrdersStore(orders) {
  localStorage.setItem('shopsphere_all_orders', JSON.stringify(orders));
}

const DEFAULT_COUPONS = [
  { code: 'SAVE20', discount: 20, desc: 'Festive 20% discount on cart subtotal', active: true },
  { code: 'WELCOME10', discount: 10, desc: 'Welcome bonus 10% discount', active: true },
  { code: 'STUDY15', discount: 15, desc: 'Special 15% discount for college study gear', active: true }
];

function getCouponsStore() {
  const data = localStorage.getItem('shopsphere_coupons');
  if (!data) {
    localStorage.setItem('shopsphere_coupons', JSON.stringify(DEFAULT_COUPONS));
    return DEFAULT_COUPONS;
  }
  return JSON.parse(data);
}

function saveCouponsStore(coupons) {
  localStorage.setItem('shopsphere_coupons', JSON.stringify(coupons));
}

// Master Catalog
const DEFAULT_MASTER_CATALOG = [
  {
    id: 1,
    categoryId: 1,
    name: 'Spatial Noise-Canceling Headphones',
    description: 'Immersive 40mm drivers, active noise cancellation, and ultra-plush memory foam earcups for deep focus and study.',
    imageUrl: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?auto=format&fit=crop&w=900&q=80',
    price: 2499.00,
    originalPrice: 3299.00,
    stockQuantity: 20,
    rating: 4.9,
    reviewsCount: 142,
    badge: 'Bestseller',
    featured: true,
    active: true,
    specs: ['Bluetooth 5.3', '40-Hour Battery', 'Spatial Audio Support', 'Type-C Fast Charge'],
    reviews: [
      { user: 'Kavita M.', stars: '★★★★★', text: 'Supreme audio clarity! The battery lasts all week with daily usage.' },
      { user: 'Arun S.', stars: '★★★★☆', text: 'Comfortable fit, great noise cancellation on trains.' }
    ]
  },
  {
    id: 2,
    categoryId: 2,
    name: 'Everyday Minimalist Backpack',
    description: 'Weatherproof recycled nylon with dedicated 16-inch fleece laptop sleeve and ergonomic airflow back panel.',
    imageUrl: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=900&q=80',
    price: 1599.00,
    originalPrice: 2199.00,
    stockQuantity: 15,
    rating: 4.7,
    reviewsCount: 89,
    badge: 'Popular',
    featured: true,
    active: true,
    specs: ['Waterproof Fabric', '16" Laptop Compartment', 'Luggage Pass-Through', '22L Capacity'],
    reviews: [
      { user: 'Devansh K.', stars: '★★★★★', text: 'Super lightweight and stylish for college and office.' }
    ]
  },
  {
    id: 3,
    categoryId: 1,
    name: 'Smart Focus & Health Watch',
    description: 'Minimalist activity watch featuring biometric sensors, continuous heart-rate, and integrated Pomodoro study timer.',
    imageUrl: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80',
    price: 3299.00,
    originalPrice: 4499.00,
    stockQuantity: 3,
    rating: 4.8,
    reviewsCount: 204,
    badge: 'AI Pick',
    featured: true,
    active: true,
    specs: ['AMOLED Always-On Display', 'Waterproof 5ATM', 'Sleep Tracker', '7-Day Battery'],
    reviews: [
      { user: 'Neha P.', stars: '★★★★★', text: 'The pomodoro feature is game-changing for study sessions!' }
    ]
  },
  {
    id: 4,
    categoryId: 3,
    name: 'Ergonomic LED Dual-Bar Desk Lamp',
    description: 'Eye-care flicker-free illumination with touch dimming, circadian color warmth, and high-speed wireless charging base.',
    imageUrl: 'https://images.unsplash.com/photo-1507473885765-e6ed057f782c?auto=format&fit=crop&w=900&q=80',
    price: 899.00,
    originalPrice: 1299.00,
    stockQuantity: 30,
    rating: 4.6,
    reviewsCount: 65,
    badge: 'Top Value',
    featured: false,
    active: true,
    specs: ['5 Color Temperatures', 'Touch Dimmer', 'Wireless Qi Charging', 'Auto-Off Timer'],
    reviews: [
      { user: 'Sameer G.', stars: '★★★★★', text: 'Zero eye strain during late night coding.' }
    ]
  },
  {
    id: 5,
    categoryId: 1,
    name: 'Mechanical Tactile Keyboard',
    description: 'Hot-swappable custom switches with tri-mode wireless connectivity, PBT keycaps, and customizable RGB backlight.',
    imageUrl: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?auto=format&fit=crop&w=900&q=80',
    price: 3799.00,
    originalPrice: 4999.00,
    stockQuantity: 8,
    rating: 4.9,
    reviewsCount: 112,
    badge: 'Trending',
    featured: false,
    active: true,
    specs: ['Hot-Swappable PCB', 'Bluetooth 5.0 + 2.4GHz + USB-C', 'Custom Lubed Switches', 'PBT Keycaps'],
    reviews: [
      { user: 'Rohan J.', stars: '★★★★★', text: 'Typing feel and thock sound are incredible.' }
    ]
  },
  {
    id: 6,
    categoryId: 3,
    name: 'Hardcover Productivity Planner',
    description: '120gsm ink-proof bleed-resistant ivory paper with daily prioritization templates, milestone charts, and ribbon marker.',
    imageUrl: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=900&q=80',
    price: 499.00,
    originalPrice: 699.00,
    stockQuantity: 45,
    rating: 4.8,
    reviewsCount: 78,
    badge: 'Essentials',
    featured: false,
    active: true,
    specs: ['120gsm Archival Paper', 'Undated 6-Month Layout', 'Lay-Flat Binding', 'Expandable Pocket'],
    reviews: [
      { user: 'Aditi V.', stars: '★★★★★', text: 'Best structured planner I have ever purchased.' }
    ]
  },
  {
    id: 7,
    categoryId: 4,
    name: 'Insulated Thermal Stainless Tumbler',
    description: 'Double-wall vacuum insulation keeps iced drinks frosty for 24 hours and tea piping hot for 12 hours.',
    imageUrl: 'https://images.unsplash.com/photo-1514432324607-a09d9b4aefdd?auto=format&fit=crop&w=900&q=80',
    price: 749.00,
    originalPrice: 999.00,
    stockQuantity: 25,
    rating: 4.7,
    reviewsCount: 52,
    badge: 'Wellness',
    featured: false,
    active: true,
    specs: ['18/8 Pro-Grade Steel', 'BPA-Free Lid', 'Sweat-Proof Exterior', '750ml Capacity'],
    reviews: [
      { user: 'Meera B.', stars: '★★★★★', text: 'Keeps water cold through long college lectures.' }
    ]
  },
  {
    id: 8,
    categoryId: 2,
    name: 'Leather Tech Organizer Pouch',
    description: 'Vegetable-tanned full-grain leather organizer with elastic loops for power banks, adapters, cables, and flash drives.',
    imageUrl: 'https://images.unsplash.com/photo-1546868871-7041f2a55e12?auto=format&fit=crop&w=900&q=80',
    price: 1199.00,
    originalPrice: 1599.00,
    stockQuantity: 2,
    rating: 4.6,
    reviewsCount: 41,
    badge: 'Handcrafted',
    featured: false,
    active: true,
    specs: ['Full-Grain Leather', 'YKK Zippers', 'Scratch-Proof Lining', 'Compact Travel Size'],
    reviews: [
      { user: 'Deepak T.', stars: '★★★★☆', text: 'Premium leather smell and keeps my charging gear tidy.' }
    ]
  }
];

function getCatalogStore() {
  const data = localStorage.getItem('shopsphere_catalog');
  if (!data) {
    localStorage.setItem('shopsphere_catalog', JSON.stringify(DEFAULT_MASTER_CATALOG));
    return DEFAULT_MASTER_CATALOG;
  }
  return JSON.parse(data);
}

function saveCatalogStore(cat) {
  localStorage.setItem('shopsphere_catalog', JSON.stringify(cat));
}

// Dynamic State
let cart = new Map();
let wishlist = new Set();
let orderHistory = [];

function loadUserScopedData() {
  const rawCart = JSON.parse(localStorage.getItem(getUserCartKey()) || '[]');
  cart = new Map(rawCart);

  const rawWish = JSON.parse(localStorage.getItem(getUserWishlistKey()) || '[]');
  wishlist = new Set(rawWish);

  orderHistory = JSON.parse(localStorage.getItem(getUserOrdersKey()) || '[]');

  renderCart();
  renderWishlistUI();
  updateOrdersBadge();
  syncCheckoutUserFields();
  updateAiRecommendations();
}

function saveUserCart() { localStorage.setItem(getUserCartKey(), JSON.stringify([...cart.entries()])); }
function saveUserWishlist() { localStorage.setItem(getUserWishlistKey(), JSON.stringify([...wishlist])); }
function saveUserOrders() { localStorage.setItem(getUserOrdersKey(), JSON.stringify(orderHistory)); }

// -------------------------------------------------------------
// DOM ELEMENTS
// -------------------------------------------------------------
const grid = document.querySelector('#product-grid');
const featuredGrid = document.querySelector('#featured-grid');
const aiRecsGrid = document.querySelector('#ai-recs-grid');
const statusEl = document.querySelector('#status');
const searchInput = document.querySelector('#search');
const sortSelect = document.querySelector('#sort-select');
const categoryTabs = document.querySelector('#category-tabs');
const filterInStock = document.querySelector('#filter-in-stock');
const filterTopRated = document.querySelector('#filter-top-rated');

// Pagination Elements
const prevPageBtn = document.querySelector('#prev-page');
const nextPageBtn = document.querySelector('#next-page');
const pageNumbersContainer = document.querySelector('#page-numbers');

// Modals
const adminDialog = document.querySelector('#admin-dialog');
const authDialog = document.querySelector('#auth-dialog');
const profileDialog = document.querySelector('#profile-dialog');
const cartDialog = document.querySelector('#cart-dialog');
const wishlistDialog = document.querySelector('#wishlist-dialog');
const ordersDialog = document.querySelector('#orders-dialog');
const productModal = document.querySelector('#product-modal');
const paymentModal = document.querySelector('#payment-modal');
const toastContainer = document.querySelector('#toast-container');
const themeToggle = document.querySelector('#theme-toggle');

// Auth DOM
const authActionBtn = document.querySelector('#auth-action-btn');
const authBtnLabel = document.querySelector('#auth-btn-label');
const tabLogin = document.querySelector('#tab-login');
const tabRegister = document.querySelector('#tab-register');
const tabForgot = document.querySelector('#tab-forgot');
const loginForm = document.querySelector('#login-form');
const registerForm = document.querySelector('#register-form');
const forgotForm = document.querySelector('#forgot-form');

// Profile DOM
const profileAvatarChar = document.querySelector('#profile-avatar-char');
const profileDisplayName = document.querySelector('#profile-display-name');
const profileDisplayEmail = document.querySelector('#profile-display-email');
const addressCountEl = document.querySelector('#address-count');
const addressListContainer = document.querySelector('#address-list');
const addAddressBtn = document.querySelector('#add-address-btn');
const newAddressForm = document.querySelector('#new-address-form');
const cancelAddressBtn = document.querySelector('#cancel-address-btn');
const logoutBtn = document.querySelector('#logout-btn');
const savedAddressSelector = document.querySelector('#saved-address-selector');
const addressSelectGroup = document.querySelector('#address-select-group');

// Admin DOM
const navAdminBtn = document.querySelector('#nav-admin-btn');
const heroAdminBtn = document.querySelector('#hero-admin-btn');
const footerAdminLink = document.querySelector('#footer-admin-link');
const closeAdminBtn = document.querySelector('#close-admin');
const adminProductForm = document.querySelector('#admin-product-form');
const adminAddProductBtn = document.querySelector('#admin-add-product-btn');
const adminCancelProductBtn = document.querySelector('#admin-cancel-product-btn');
const adminProductSearch = document.querySelector('#admin-product-search');
const adminCouponForm = document.querySelector('#admin-coupon-form');
const adminAddCouponBtn = document.querySelector('#admin-add-coupon-btn');
const adminCancelCouponBtn = document.querySelector('#admin-cancel-coupon-btn');
const adminOrderStatusFilter = document.querySelector('#admin-order-status-filter');
const resyncSegmentationBtn = document.querySelector('#resync-segmentation-btn');

let appliedCoupon = null;
let allProducts = [];
let activeCategory = 'all';
let currentSearch = '';
let currentSort = 'default';
let currentPage = 1;
const ITEMS_PER_PAGE = 4;

const money = value => new Intl.NumberFormat('en-IN', {
  style: 'currency',
  currency: 'INR',
  maximumFractionDigits: 2
}).format(value);

function showToast(message, type = 'info') {
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  const icon = type === 'success' ? '✓' : type === 'error' ? '⚠' : 'ℹ';
  toast.innerHTML = `<span>${icon}</span> <span>${escapeHtml(message)}</span>`;
  toastContainer.appendChild(toast);
  setTimeout(() => {
    toast.style.opacity = '0';
    toast.style.transform = 'translateY(-10px)';
    setTimeout(() => toast.remove(), 300);
  }, 3200);
}

function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, ch => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[ch]));
}

// -------------------------------------------------------------
// 1. AI: PERSONALIZED & RELATED PRODUCT RECOMMENDATIONS
// -------------------------------------------------------------
async function updateAiRecommendations() {
  const cartIds = [...cart.keys()];
  const catalog = getCatalogStore();

  let recProductIds = [];

  try {
    const res = await fetch(`${ANALYTICS_API}/recommendations`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        user_id: currentUser ? currentUser.email : 'guest',
        cart_product_ids: cartIds,
        viewed_product_ids: [1, 3]
      })
    });

    if (res.ok) {
      const data = await res.json();
      recProductIds = data.personalized_product_ids || [];
    }
  } catch (err) {
    // Fallback complementary recommendations
    recProductIds = [3, 4, 6, 8].filter(id => !cartIds.includes(id));
  }

  const recProducts = catalog.filter(p => recProductIds.includes(p.id) && p.active !== false).slice(0, 4);

  if (!recProducts.length) {
    aiRecsGrid.innerHTML = '<p style="grid-column:1/-1; text-align:center; color:var(--muted)">All recommended essentials already in your cart!</p>';
    return;
  }

  aiRecsGrid.innerHTML = recProducts.map(p => `
    <div class="featured-card" data-product-id="${p.id}">
      <img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}" class="featured-card-img">
      <div style="flex-grow:1;">
        <span class="tag-badge" style="background:#e0f2fe; color:#0369a1;">AI Pick</span>
        <h4 style="margin:4px 0 2px; font-size:0.92rem;">${escapeHtml(p.name)}</h4>
        <div style="font-size:0.85rem; font-weight:800; color:var(--ink); margin-bottom:6px;">
          ${money(p.price)}
        </div>
        <button class="add-button" data-add="${p.id}" style="padding:5px 12px; font-size:0.78rem;">+ Add Recommendation</button>
      </div>
    </div>
  `).join('');
}

document.querySelector('#refresh-recs-btn').addEventListener('click', () => {
  updateAiRecommendations();
  showToast('AI Recommendations re-calculated from current activity', 'success');
});

// -------------------------------------------------------------
// 2. AI: NLP REVIEW SENTIMENT ANALYSIS
// -------------------------------------------------------------
async function updateSentimentAnalysis() {
  const catalog = getCatalogStore();
  const allReviewTexts = [];
  catalog.forEach(p => {
    (p.reviews || []).forEach(r => allReviewTexts.push(r.text));
  });

  try {
    const res = await fetch(`${ANALYTICS_API}/sentiment`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ reviews: allReviewTexts })
    });

    if (res.ok) {
      const data = await res.json();
      const posPct = Math.round(data.positive_ratio * 100);
      const neuPct = Math.round(data.neutral_ratio * 100);
      const negPct = Math.round(data.negative_ratio * 100);

      document.querySelector('#sentiment-overall-badge').textContent = `NLP Rating: ${data.overall_sentiment} (${posPct}%)`;
      document.querySelector('#sentiment-pos-fill').style.width = `${posPct}%`;
      document.querySelector('#sentiment-pos-fill').textContent = `${posPct}% Positive`;
      document.querySelector('#sentiment-neu-fill').style.width = `${neuPct}%`;
      document.querySelector('#sentiment-neu-fill').textContent = `${neuPct}% Neutral`;
      document.querySelector('#sentiment-neg-fill').style.width = `${negPct}%`;
      document.querySelector('#sentiment-neg-fill').textContent = `${negPct}%`;
    }
  } catch (err) {
    // Keep baseline values
  }
}

// -------------------------------------------------------------
// 3. AI: CUSTOMER SEGMENTATION (RFM)
// -------------------------------------------------------------
async function updateCustomerSegmentation() {
  const users = getUsersStore();
  const allOrders = getAllOrdersStore();

  const customerDataList = users.map(u => {
    const orders = allOrders.filter(o => o.customerEmail === u.email);
    const totalSpent = orders.reduce((sum, o) => sum + (o.total || 0), 0);
    return {
      user_id: u.email,
      orders_count: orders.length,
      total_spent: totalSpent,
      days_since_last_order: orders.length ? 5 : 45
    };
  });

  try {
    const res = await fetch(`${ANALYTICS_API}/segmentation`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ customers: customerDataList })
    });

    if (res.ok) {
      const data = await res.json();
      const counts = data.segment_counts || {};

      document.querySelector('#count-vip').textContent = counts['VIP Champions'] || 0;
      document.querySelector('#count-loyal').textContent = counts['Loyal Advocates'] || 0;
      document.querySelector('#count-potential').textContent = counts['Potential Loyalists'] || 0;
      document.querySelector('#count-atrisk').textContent = counts['At-Risk Customers'] || 0;

      const tbody = document.querySelector('#admin-segmentation-tbody');
      tbody.innerHTML = customerDataList.map(c => {
        let seg = 'Potential Loyalists';
        if (c.total_spent >= 3000 || c.orders_count >= 2) seg = 'VIP Champions';
        else if (c.orders_count >= 1) seg = 'Loyal Advocates';

        const action = data.recommended_marketing_actions ? data.recommended_marketing_actions[seg] : 'Engage with updates';

        return `
          <tr>
            <td><strong>${c.user_id.split('@')[0]}</strong></td>
            <td>${c.user_id}</td>
            <td><strong>${money(c.total_spent)}</strong></td>
            <td>${c.orders_count} orders</td>
            <td><span class="status-badge ${seg === 'VIP Champions' ? 'delivered' : 'shipped'}">${seg}</span></td>
            <td><small style="color:var(--muted)">${action}</small></td>
          </tr>
        `;
      }).join('');
    }
  } catch (err) {
    console.warn('FastAPI segmentation service offline, rendering local heuristic segmentation.');
  }
}

if (resyncSegmentationBtn) {
  resyncSegmentationBtn.addEventListener('click', () => {
    updateCustomerSegmentation();
    showToast('Customer RFM Segments recalculated', 'success');
  });
}

// -------------------------------------------------------------
// 4. ADMIN CHARTS & DEMAND FORECASTING (Interactive SVG)
// -------------------------------------------------------------
async function renderAdminCharts() {
  // 1. Demand & Sales Forecast Line Chart
  let forecastUnits = [6.2, 7.1, 8.4, 7.9, 9.1, 8.5, 9.8];
  try {
    const res = await fetch(`${ANALYTICS_API}/forecast`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ daily_units: [5, 6, 7, 6, 8, 7, 9, 8, 10], horizon_days: 7 })
    });
    if (res.ok) {
      const data = await res.json();
      if (data.forecast_daily_units) forecastUnits = data.forecast_daily_units;
      document.querySelector('#kpi-predicted-demand').textContent = `~${Math.round(forecastUnits.reduce((a, b) => a + b, 0))} units`;
    }
  } catch (err) {}

  // Generate SVG Line Chart
  const svgContainer = document.querySelector('#sales-forecast-chart');
  const points = forecastUnits.map((val, idx) => {
    const x = 30 + idx * 45;
    const y = 140 - (val / 12) * 110;
    return { x, y, val };
  });

  const polylineStr = points.map(p => `${p.x},${p.y}`).join(' ');
  const days = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

  svgContainer.innerHTML = `
    <svg class="chart-svg" viewBox="0 0 340 160">
      <!-- Grid lines -->
      <line x1="20" y1="30" x2="330" y2="30" stroke="var(--line)" stroke-dasharray="3,3" />
      <line x1="20" y1="80" x2="330" y2="80" stroke="var(--line)" stroke-dasharray="3,3" />
      <line x1="20" y1="130" x2="330" y2="130" stroke="var(--line)" />
      
      <!-- Area Fill -->
      <polygon points="30,130 ${polylineStr} 300,130" fill="rgba(31, 83, 63, 0.12)" />
      
      <!-- Trend Line -->
      <polyline points="${polylineStr}" fill="none" stroke="var(--green)" stroke-width="3" stroke-linecap="round" stroke-linejoin="round" />
      
      <!-- Data Points & Labels -->
      ${points.map((p, idx) => `
        <circle cx="${p.x}" cy="${p.y}" r="4" fill="var(--lime)" stroke="var(--green)" stroke-width="2" />
        <text x="${p.x}" y="148" font-size="10" text-anchor="middle" fill="var(--muted)">${days[idx % 7]}</text>
        <text x="${p.x}" y="${p.y - 8}" font-size="9" font-weight="700" text-anchor="middle" fill="var(--ink)">${p.val}</text>
      `).join('')}
    </svg>
  `;

  // 2. Department Category Share Bar Chart
  const catShareContainer = document.querySelector('#category-share-chart');
  const shares = [
    { name: 'Electronics', pct: 42, color: 'var(--green)' },
    { name: 'Accessories', pct: 28, color: '#3b82f6' },
    { name: 'Study & Workspace', pct: 20, color: 'var(--lime)' },
    { name: 'Lifestyle & Wellness', pct: 10, color: '#8b5cf6' }
  ];

  catShareContainer.innerHTML = shares.map(cat => `
    <div class="cat-bar-item">
      <div class="cat-bar-label-row">
        <span>${cat.name}</span>
        <strong>${cat.pct}%</strong>
      </div>
      <div class="cat-progress-track">
        <div class="cat-progress-fill" style="width:${cat.pct}%; background:${cat.color};"></div>
      </div>
    </div>
  `).join('');
}

// -------------------------------------------------------------
// 5. ADMIN DASHBOARD CONTROLLER
// -------------------------------------------------------------
function openAdminDashboard(tabName = 'analytics') {
  renderAdminOverview();
  renderAdminCharts();
  updateCustomerSegmentation();
  renderAdminProductsTable();
  renderAdminOrdersTable();
  renderAdminCustomersTable();
  renderAdminCouponsTable();
  switchAdminTab(tabName);
  adminDialog.showModal();
}

[navAdminBtn, heroAdminBtn, footerAdminLink].forEach(btn => {
  if (btn) btn.addEventListener('click', (e) => {
    e.preventDefault();
    openAdminDashboard('analytics');
  });
});
closeAdminBtn.addEventListener('click', () => adminDialog.close());

document.querySelectorAll('.admin-tab-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    switchAdminTab(btn.dataset.tab);
  });
});

function switchAdminTab(tabName) {
  document.querySelectorAll('.admin-tab-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.tab === tabName);
  });
  document.querySelectorAll('.admin-tab-content').forEach(content => {
    content.classList.toggle('active', content.id === `admin-tab-${tabName}`);
  });
}

function renderAdminOverview() {
  const allOrders = getAllOrdersStore();
  const catalog = getCatalogStore();
  const users = getUsersStore();

  const completedOrders = allOrders.filter(o => o.status !== 'Cancelled' && o.status !== 'Returned');
  const totalRevenue = completedOrders.reduce((sum, o) => sum + (o.total || 0), 0);
  
  document.querySelector('#kpi-total-revenue').textContent = money(totalRevenue);
  document.querySelector('#kpi-orders-count').textContent = allOrders.length;
  document.querySelector('#kpi-products-count').textContent = catalog.filter(p => p.active !== false).length;

  const lowStockItems = catalog.filter(p => p.stockQuantity < 5);
  const alertText = document.querySelector('#low-stock-alert-text');
  if (lowStockItems.length) {
    alertText.innerHTML = `<strong>${lowStockItems.length} items</strong> have critically low stock (< 5 units remaining): <em>${lowStockItems.map(p => `${escapeHtml(p.name)} (${p.stockQuantity} left)`).join(', ')}</em>`;
  } else {
    alertText.textContent = 'All products have healthy inventory levels (5+ units in stock).';
  }

  const popularContainer = document.querySelector('#admin-popular-products-list');
  const sortedByRating = [...catalog].sort((a, b) => (b.rating || 0) - (a.rating || 0)).slice(0, 4);
  popularContainer.innerHTML = sortedByRating.map(p => `
    <div class="admin-compact-item">
      <div>
        <strong>${escapeHtml(p.name)}</strong>
        <div style="color:var(--muted); font-size:0.78rem;">${money(p.price)} • ★ ${p.rating} (${p.reviewsCount || 40} reviews)</div>
      </div>
      <span class="status-badge active">${p.badge || 'Top Pick'}</span>
    </div>
  `).join('');

  const stockContainer = document.querySelector('#admin-stock-summary-list');
  stockContainer.innerHTML = catalog.slice(0, 4).map(p => `
    <div class="admin-compact-item">
      <span>${escapeHtml(p.name)}</span>
      <span class="status-badge ${p.stockQuantity < 5 ? 'cancelled' : 'delivered'}">
        ${p.stockQuantity < 5 ? `Critical: ${p.stockQuantity} Left` : `${p.stockQuantity} in stock`}
      </span>
    </div>
  `).join('');
}

function renderAdminProductsTable(searchTerm = '') {
  const catalog = getCatalogStore();
  let list = [...catalog];

  if (searchTerm.trim()) {
    const q = searchTerm.toLowerCase();
    list = list.filter(p => p.name.toLowerCase().includes(q) || (p.description && p.description.toLowerCase().includes(q)));
  }

  const tbody = document.querySelector('#admin-products-tbody');
  tbody.innerHTML = list.map(p => {
    const catName = p.categoryId === 1 ? 'Electronics' : p.categoryId === 2 ? 'Accessories' : p.categoryId === 3 ? 'Study' : 'Lifestyle';
    const isActive = p.active !== false;

    return `
      <tr>
        <td>
          <div style="display:flex; align-items:center; gap:10px;">
            <img src="${p.imageUrl}" alt="${p.name}" style="width:38px; height:38px; border-radius:6px; object-fit:cover;">
            <div>
              <strong>${escapeHtml(p.name)}</strong>
              <div style="font-size:0.75rem; color:var(--muted);">${escapeHtml(p.badge || '')}</div>
            </div>
          </div>
        </td>
        <td>${catName}</td>
        <td><strong>${money(p.price)}</strong></td>
        <td>
          <span class="status-badge ${p.stockQuantity < 5 ? 'cancelled' : 'delivered'}">
            ${p.stockQuantity} units
          </span>
        </td>
        <td>
          <span class="status-badge ${isActive ? 'active' : 'inactive'}">
            ${isActive ? 'Active' : 'Deactivated'}
          </span>
        </td>
        <td>
          <div class="action-btn-group">
            <button class="table-btn" data-admin-edit="${p.id}">Edit</button>
            <button class="table-btn" data-admin-toggle-active="${p.id}">
              ${isActive ? 'Deactivate' : 'Activate'}
            </button>
            <button class="table-btn danger" data-admin-delete="${p.id}">Delete</button>
          </div>
        </td>
      </tr>
    `;
  }).join('');
}

adminProductSearch.addEventListener('input', () => {
  renderAdminProductsTable(adminProductSearch.value);
});

adminAddProductBtn.addEventListener('click', () => {
  adminProductForm.reset();
  document.querySelector('#admin-p-id').value = '';
  document.querySelector('#admin-form-heading').textContent = 'Create New Product';
  adminProductForm.classList.remove('hidden');
});

adminCancelProductBtn.addEventListener('click', () => {
  adminProductForm.classList.add('hidden');
});

adminProductForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const idStr = form.get('productId');
  const catalog = getCatalogStore();

  const productData = {
    name: form.get('name').trim(),
    categoryId: Number(form.get('categoryId')),
    price: parseFloat(form.get('price')),
    originalPrice: parseFloat(form.get('originalPrice')) || (parseFloat(form.get('price')) * 1.3),
    stockQuantity: parseInt(form.get('stockQuantity'), 10),
    badge: form.get('badge').trim() || 'New',
    imageUrl: form.get('imageUrl').trim(),
    description: form.get('description').trim(),
    active: true
  };

  if (idStr) {
    const id = Number(idStr);
    const idx = catalog.findIndex(p => p.id === id);
    if (idx !== -1) {
      catalog[idx] = { ...catalog[idx], ...productData, id };
      showToast(`Updated product: ${productData.name}`, 'success');
    }
  } else {
    const newId = catalog.length ? Math.max(...catalog.map(p => p.id)) + 1 : 1;
    catalog.push({
      ...productData,
      id: newId,
      rating: 4.8,
      reviewsCount: 1,
      specs: ['Standard Verified Item'],
      reviews: []
    });
    showToast(`Created new product: ${productData.name}`, 'success');
  }

  saveCatalogStore(catalog);
  allProducts = catalog;
  adminProductForm.classList.add('hidden');
  renderAdminProductsTable();
  renderAdminOverview();
  updateCategoryCounts();
  applyFiltersAndRender();
});

document.querySelector('#admin-products-tbody').addEventListener('click', (e) => {
  const catalog = getCatalogStore();

  const editBtn = e.target.closest('[data-admin-edit]');
  if (editBtn) {
    const id = Number(editBtn.dataset.adminEdit);
    const p = catalog.find(item => item.id === id);
    if (!p) return;

    document.querySelector('#admin-form-heading').textContent = `Edit Product: ${p.name}`;
    document.querySelector('#admin-p-id').value = p.id;
    document.querySelector('#admin-p-name').value = p.name;
    document.querySelector('#admin-p-category').value = p.categoryId;
    document.querySelector('#admin-p-price').value = p.price;
    document.querySelector('#admin-p-orig-price').value = p.originalPrice || '';
    document.querySelector('#admin-p-stock').value = p.stockQuantity;
    document.querySelector('#admin-p-badge').value = p.badge || '';
    document.querySelector('#admin-p-image').value = p.imageUrl || '';
    document.querySelector('#admin-p-desc').value = p.description || '';

    adminProductForm.classList.remove('hidden');
    adminProductForm.scrollIntoView({ behavior: 'smooth' });
    return;
  }

  const toggleBtn = e.target.closest('[data-admin-toggle-active]');
  if (toggleBtn) {
    const id = Number(toggleBtn.dataset.adminToggleActive);
    const p = catalog.find(item => item.id === id);
    if (!p) return;
    p.active = p.active === false ? true : false;
    saveCatalogStore(catalog);
    allProducts = catalog;
    renderAdminProductsTable();
    applyFiltersAndRender();
    showToast(`${p.name} is now ${p.active ? 'active' : 'deactivated'}`, 'info');
    return;
  }

  const delBtn = e.target.closest('[data-admin-delete]');
  if (delBtn) {
    const id = Number(delBtn.dataset.adminDelete);
    const p = catalog.find(item => item.id === id);
    if (!p) return;
    if (confirm(`Delete "${p.name}"?`)) {
      const updated = catalog.filter(item => item.id !== id);
      saveCatalogStore(updated);
      allProducts = updated;
      renderAdminProductsTable();
      renderAdminOverview();
      updateCategoryCounts();
      applyFiltersAndRender();
      showToast(`Deleted product "${p.name}"`, 'info');
    }
  }
});

function renderAdminOrdersTable() {
  const allOrders = getAllOrdersStore();
  const filter = adminOrderStatusFilter.value;
  let list = [...allOrders];

  if (filter !== 'ALL') {
    list = list.filter(o => o.status === filter);
  }

  document.querySelector('#admin-orders-count').textContent = list.length;
  const tbody = document.querySelector('#admin-orders-tbody');

  tbody.innerHTML = list.map(o => {
    const statusClass = (o.status || 'processing').toLowerCase();

    return `
      <tr>
        <td><strong>#ORD-${o.orderId}</strong></td>
        <td>
          <div>${escapeHtml(o.customerName)}</div>
          <small style="color:var(--muted)">${escapeHtml(o.customerEmail)}</small>
        </td>
        <td><small>${o.date}</small></td>
        <td><small>${o.items ? o.items.map(i => `${i.productName} × ${i.quantity}`).join(', ') : 'Order Items'}</small></td>
        <td><strong>${money(o.total)}</strong></td>
        <td><span class="status-badge ${statusClass}">● ${o.status}</span></td>
        <td>
          <select class="table-btn" data-admin-order-status="${o.orderId}">
            <option value="Processing" ${o.status === 'Processing' ? 'selected' : ''}>Processing</option>
            <option value="Shipped" ${o.status === 'Shipped' ? 'selected' : ''}>Shipped</option>
            <option value="Delivered" ${o.status === 'Delivered' ? 'selected' : ''}>Delivered</option>
            <option value="Cancelled" ${o.status === 'Cancelled' ? 'selected' : ''}>Cancelled</option>
            <option value="Returned" ${o.status === 'Returned' ? 'selected' : ''}>Returned</option>
          </select>
        </td>
      </tr>
    `;
  }).join('');
}

adminOrderStatusFilter.addEventListener('change', renderAdminOrdersTable);

document.querySelector('#admin-orders-tbody').addEventListener('change', (e) => {
  const select = e.target.closest('[data-admin-order-status]');
  if (!select) return;
  const orderId = Number(select.dataset.adminOrderStatus);
  const newStatus = select.value;

  const allOrders = getAllOrdersStore();
  const ord = allOrders.find(o => o.orderId === orderId);
  if (ord) {
    ord.status = newStatus;
    saveAllOrdersStore(allOrders);

    if (currentUser && currentUser.email === ord.customerEmail) {
      const uOrder = orderHistory.find(o => o.orderId === orderId);
      if (uOrder) {
        uOrder.status = newStatus;
        saveUserOrders();
      }
    }

    renderAdminOverview();
    renderAdminOrdersTable();
    showToast(`Order #ORD-${orderId} status set to ${newStatus}`, 'success');
  }
});

function renderAdminCustomersTable() {
  const users = getUsersStore();
  document.querySelector('#admin-customers-count').textContent = users.length;
  const tbody = document.querySelector('#admin-customers-tbody');

  tbody.innerHTML = users.map(u => `
    <tr>
      <td><strong>${escapeHtml(u.name)}</strong></td>
      <td>${escapeHtml(u.email)}</td>
      <td><span class="status-badge ${u.role === 'ADMIN' ? 'delivered' : 'shipped'}">${u.role || 'CUSTOMER'}</span></td>
      <td><small>${(u.addresses || []).length} Saved Addresses</small></td>
      <td>
        <button class="table-btn danger" data-admin-delete-user="${u.email}" ${u.role === 'ADMIN' ? 'disabled' : ''}>
          ${u.role === 'ADMIN' ? 'Protected' : 'Remove'}
        </button>
      </td>
    </tr>
  `).join('');
}

document.querySelector('#admin-customers-tbody').addEventListener('click', (e) => {
  const delBtn = e.target.closest('[data-admin-delete-user]');
  if (!delBtn) return;
  const email = delBtn.dataset.adminDeleteUser;
  if (confirm(`Remove customer account "${email}"?`)) {
    const users = getUsersStore().filter(u => u.email !== email);
    saveUsersStore(users);
    renderAdminCustomersTable();
    renderAdminOverview();
    showToast(`Removed customer ${email}`, 'info');
  }
});

function renderAdminCouponsTable() {
  const coupons = getCouponsStore();
  const tbody = document.querySelector('#admin-coupons-tbody');

  tbody.innerHTML = coupons.map(c => `
    <tr>
      <td><strong>${escapeHtml(c.code)}</strong></td>
      <td><span class="status-badge delivered">${c.discount}% OFF</span></td>
      <td><small>${escapeHtml(c.desc || '')}</small></td>
      <td><span class="status-badge ${c.active ? 'active' : 'inactive'}">${c.active ? 'Active' : 'Disabled'}</span></td>
      <td>
        <div class="action-btn-group">
          <button class="table-btn" data-admin-toggle-coupon="${c.code}">${c.active ? 'Disable' : 'Enable'}</button>
          <button class="table-btn danger" data-admin-delete-coupon="${c.code}">Delete</button>
        </div>
      </td>
    </tr>
  `).join('');
}

adminAddCouponBtn.addEventListener('click', () => {
  adminCouponForm.reset();
  adminCouponForm.classList.remove('hidden');
});
adminCancelCouponBtn.addEventListener('click', () => {
  adminCouponForm.classList.add('hidden');
});

adminCouponForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const code = form.get('code').trim().toUpperCase();
  const discount = parseInt(form.get('discount'), 10);
  const desc = form.get('desc').trim();

  const coupons = getCouponsStore();
  if (coupons.some(c => c.code === code)) {
    showToast(`Coupon ${code} already exists`, 'error');
    return;
  }

  coupons.push({ code, discount, desc, active: true });
  saveCouponsStore(coupons);
  adminCouponForm.classList.add('hidden');
  renderAdminCouponsTable();
  showToast(`Created promotion coupon ${code}`, 'success');
});

document.querySelector('#admin-coupons-tbody').addEventListener('click', (e) => {
  const coupons = getCouponsStore();

  const toggleBtn = e.target.closest('[data-admin-toggle-coupon]');
  if (toggleBtn) {
    const code = toggleBtn.dataset.adminToggleCoupon;
    const c = coupons.find(item => item.code === code);
    if (c) {
      c.active = !c.active;
      saveCouponsStore(coupons);
      renderAdminCouponsTable();
      showToast(`Coupon ${code} ${c.active ? 'enabled' : 'disabled'}`, 'info');
    }
    return;
  }

  const delBtn = e.target.closest('[data-admin-delete-coupon]');
  if (delBtn) {
    const code = delBtn.dataset.adminDeleteCoupon;
    const updated = coupons.filter(item => item.code !== code);
    saveCouponsStore(updated);
    renderAdminCouponsTable();
    showToast(`Deleted coupon ${code}`, 'info');
  }
});

// -------------------------------------------------------------
// 6. AUTHENTICATION & CUSTOMER PORTAL
// -------------------------------------------------------------
function updateAuthNavbarUI() {
  if (currentUser) {
    authBtnLabel.textContent = currentUser.name.split(' ')[0];
    authActionBtn.title = `Logged in as ${currentUser.name} (${currentUser.email})`;
  } else {
    authBtnLabel.textContent = 'Sign In';
    authActionBtn.title = 'Sign In or Create Account';
  }
}

authActionBtn.addEventListener('click', () => {
  if (currentUser) {
    renderProfileModal();
    profileDialog.showModal();
  } else {
    authDialog.showModal();
  }
});

document.querySelector('#footer-account-link').addEventListener('click', (e) => {
  e.preventDefault();
  if (currentUser) {
    renderProfileModal();
    profileDialog.showModal();
  } else {
    authDialog.showModal();
  }
});

tabLogin.addEventListener('click', () => switchAuthTab('login'));
tabRegister.addEventListener('click', () => switchAuthTab('register'));
tabForgot.addEventListener('click', () => switchAuthTab('forgot'));

function switchAuthTab(tab) {
  [tabLogin, tabRegister, tabForgot].forEach(t => t.classList.remove('active'));
  [loginForm, registerForm, forgotForm].forEach(f => f.classList.remove('active'));

  if (tab === 'login') {
    tabLogin.classList.add('active');
    loginForm.classList.add('active');
    document.querySelector('#auth-dialog-title').textContent = 'Sign In to ShopSphere';
  } else if (tab === 'register') {
    tabRegister.classList.add('active');
    registerForm.classList.add('active');
    document.querySelector('#auth-dialog-title').textContent = 'Create Customer Account';
  } else {
    tabForgot.classList.add('active');
    forgotForm.classList.add('active');
    document.querySelector('#auth-dialog-title').textContent = 'Reset Account Password';
  }
}

loginForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const email = form.get('email').trim().toLowerCase();

  const users = getUsersStore();
  const found = users.find(u => u.email.toLowerCase() === email);

  if (found) {
    currentUser = found;
    localStorage.setItem('shopsphere_current_user', JSON.stringify(currentUser));
    updateAuthNavbarUI();
    loadUserScopedData();
    authDialog.close();
    showToast(`Welcome back, ${currentUser.name}!`, 'success');
  } else {
    showToast('Invalid email or password.', 'error');
  }
});

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const name = form.get('name').trim();
  const email = form.get('email').trim().toLowerCase();
  const password = form.get('password');

  const users = getUsersStore();
  if (users.some(u => u.email.toLowerCase() === email)) {
    showToast('An account with this email already exists.', 'error');
    return;
  }

  const newUser = {
    id: `usr_${Date.now()}`,
    name,
    email,
    password,
    role: 'CUSTOMER',
    addresses: []
  };

  users.push(newUser);
  saveUsersStore(users);

  currentUser = newUser;
  localStorage.setItem('shopsphere_current_user', JSON.stringify(currentUser));
  updateAuthNavbarUI();
  loadUserScopedData();
  authDialog.close();
  showToast(`Account created! Welcome, ${name}!`, 'success');
});

forgotForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const form = new FormData(e.currentTarget);
  const email = form.get('email').trim().toLowerCase();
  showToast(`Password reset link dispatched to ${email}.`, 'success');
  switchAuthTab('login');
});

document.querySelector('#close-auth').addEventListener('click', () => authDialog.close());

logoutBtn.addEventListener('click', () => {
  const name = currentUser ? currentUser.name : 'User';
  currentUser = null;
  localStorage.removeItem('shopsphere_current_user');
  updateAuthNavbarUI();
  loadUserScopedData();
  profileDialog.close();
  showToast(`Signed out successfully. Goodbye ${name}!`, 'info');
});

function renderProfileModal() {
  if (!currentUser) return;
  profileAvatarChar.textContent = currentUser.name.charAt(0).toUpperCase();
  profileDisplayName.textContent = currentUser.name;
  profileDisplayEmail.textContent = currentUser.email;

  const addresses = currentUser.addresses || [];
  addressCountEl.textContent = addresses.length;

  if (!addresses.length) {
    addressListContainer.innerHTML = '<p class="empty" style="padding:14px 0; color:var(--muted); font-size:0.85rem;">No saved delivery addresses yet. Add one below for express checkout!</p>';
    return;
  }

  addressListContainer.innerHTML = addresses.map(addr => `
    <div class="address-card">
      <div>
        <strong style="font-size:0.88rem;">${escapeHtml(addr.label || 'Address')}</strong>
        <p style="margin:2px 0 0; font-size:0.8rem; color:var(--muted); line-height:1.4;">
          ${escapeHtml(addr.street)}, ${escapeHtml(addr.city)}, ${escapeHtml(addr.state)} - ${escapeHtml(addr.pincode)}
        </p>
      </div>
      <button class="icon-btn" data-delete-address="${addr.id}" title="Delete Address" style="color:#ef4444; border:0; padding:2px 6px;">✕</button>
    </div>
  `).join('');
}

addAddressBtn.addEventListener('click', () => {
  newAddressForm.classList.remove('hidden');
  newAddressForm.reset();
});
cancelAddressBtn.addEventListener('click', () => {
  newAddressForm.classList.add('hidden');
});

newAddressForm.addEventListener('submit', (e) => {
  e.preventDefault();
  if (!currentUser) return;
  const form = new FormData(e.currentTarget);
  const newAddr = {
    id: `addr_${Date.now()}`,
    label: form.get('label').trim(),
    street: form.get('street').trim(),
    city: form.get('city').trim(),
    state: form.get('state').trim(),
    pincode: form.get('pincode').trim()
  };

  currentUser.addresses = currentUser.addresses || [];
  currentUser.addresses.push(newAddr);

  const users = getUsersStore();
  const idx = users.findIndex(u => u.email === currentUser.email);
  if (idx !== -1) {
    users[idx] = currentUser;
    saveUsersStore(users);
  }
  localStorage.setItem('shopsphere_current_user', JSON.stringify(currentUser));

  newAddressForm.classList.add('hidden');
  renderProfileModal();
  syncCheckoutUserFields();
  showToast('New address saved to your profile!', 'success');
});

addressListContainer.addEventListener('click', (e) => {
  const delBtn = e.target.closest('[data-delete-address]');
  if (!delBtn || !currentUser) return;
  const id = delBtn.dataset.deleteAddress;
  currentUser.addresses = (currentUser.addresses || []).filter(a => a.id !== id);

  const users = getUsersStore();
  const idx = users.findIndex(u => u.email === currentUser.email);
  if (idx !== -1) {
    users[idx] = currentUser;
    saveUsersStore(users);
  }
  localStorage.setItem('shopsphere_current_user', JSON.stringify(currentUser));

  renderProfileModal();
  syncCheckoutUserFields();
  showToast('Address removed', 'info');
});

document.querySelector('#close-profile').addEventListener('click', () => profileDialog.close());
document.querySelector('#profile-view-orders-btn').addEventListener('click', () => {
  profileDialog.close();
  renderOrdersHistory();
  ordersDialog.showModal();
});

function syncCheckoutUserFields() {
  const nameInput = document.querySelector('#checkout-name');
  const emailInput = document.querySelector('#checkout-email');
  const addressInput = document.querySelector('#checkout-address');

  if (currentUser) {
    nameInput.value = currentUser.name;
    emailInput.value = currentUser.email;

    const addresses = currentUser.addresses || [];
    if (addresses.length) {
      addressSelectGroup.style.display = 'block';
      savedAddressSelector.innerHTML = '<option value="">Choose a saved address...</option>' + 
        addresses.map(a => `<option value="${a.id}">${escapeHtml(a.label)}: ${escapeHtml(a.street)}, ${escapeHtml(a.city)} (${a.pincode})</option>`).join('');
    } else {
      addressSelectGroup.style.display = 'none';
    }
  } else {
    nameInput.value = '';
    emailInput.value = '';
    addressInput.value = '';
    addressSelectGroup.style.display = 'none';
  }
}

savedAddressSelector.addEventListener('change', (e) => {
  if (!currentUser) return;
  const selectedId = e.target.value;
  const addr = (currentUser.addresses || []).find(a => a.id === selectedId);
  if (addr) {
    document.querySelector('#checkout-address').value = `${addr.street}, ${addr.city}, ${addr.state} - ${addr.pincode}`;
  }
});

// -------------------------------------------------------------
// 7. CATALOG & STOREFRONT
// -------------------------------------------------------------
async function initCatalog() {
  statusEl.textContent = 'Synchronizing product catalog…';
  const indicator = document.querySelector('#backend-status-indicator');

  try {
    const res = await fetch(`${API}/products`, { signal: AbortSignal.timeout(2500) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const apiProducts = await res.json();
    
    const localStore = getCatalogStore();
    allProducts = localStore.map(masterItem => {
      const match = apiProducts.find(p => p.id === masterItem.id);
      return match ? { ...masterItem, ...match } : masterItem;
    });

    if (indicator) {
      indicator.textContent = '● Java Backend: Connected (Live)';
      indicator.style.color = '#10b981';
    }
  } catch (err) {
    allProducts = getCatalogStore();
    if (indicator) {
      indicator.textContent = '● Java Backend: Offline (Demo Mode Active)';
      indicator.style.color = '#f59e0b';
    }
  }

  updateCategoryCounts();
  renderFeaturedDeals();
  applyFiltersAndRender();
  updateAiRecommendations();
  updateSentimentAnalysis();
}

function updateCategoryCounts() {
  const activeItems = allProducts.filter(p => p.active !== false);
  document.querySelector('#count-all').textContent = activeItems.length;
  [1, 2, 3, 4].forEach(cid => {
    const el = document.querySelector(`#count-${cid}`);
    if (el) el.textContent = activeItems.filter(p => p.categoryId === cid).length;
  });
}

function renderFeaturedDeals() {
  const featured = allProducts.filter(p => p.featured && p.active !== false);
  featuredGrid.innerHTML = featured.map(p => `
    <div class="featured-card" data-product-id="${p.id}">
      <img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}" class="featured-card-img">
      <div style="flex-grow:1;">
        <span class="tag-badge" style="background:#fee2e2; color:#b91c1c;">${escapeHtml(p.badge)}</span>
        <h4 style="margin:4px 0 2px; font-size:0.92rem;">${escapeHtml(p.name)}</h4>
        <div style="font-size:0.85rem; font-weight:800; color:var(--ink); margin-bottom:6px;">
          ${money(p.price)}
        </div>
        <button class="add-button" data-add="${p.id}" style="padding:5px 12px; font-size:0.78rem;">+ Add Deal</button>
      </div>
    </div>
  `).join('');
}

let countdownSeconds = 4 * 3600 + 28 * 60 + 15;
setInterval(() => {
  if (countdownSeconds > 0) countdownSeconds--;
  const h = String(Math.floor(countdownSeconds / 3600)).padStart(2, '0');
  const m = String(Math.floor((countdownSeconds % 3600) / 60)).padStart(2, '0');
  const s = String(countdownSeconds % 60).padStart(2, '0');
  const el = document.querySelector('#countdown-timer');
  if (el) el.textContent = `${h}h : ${m}m : ${s}s`;
}, 1000);

function applyFiltersAndRender() {
  let filtered = allProducts.filter(p => p.active !== false);

  if (activeCategory !== 'all') {
    filtered = filtered.filter(p => String(p.categoryId) === String(activeCategory));
  }

  if (currentSearch.trim()) {
    const q = currentSearch.toLowerCase();
    filtered = filtered.filter(p => 
      p.name.toLowerCase().includes(q) || 
      (p.description && p.description.toLowerCase().includes(q)) ||
      (p.badge && p.badge.toLowerCase().includes(q))
    );
  }

  if (filterInStock && filterInStock.checked) {
    filtered = filtered.filter(p => p.stockQuantity > 0);
  }

  if (filterTopRated && filterTopRated.checked) {
    filtered = filtered.filter(p => (p.rating || 0) >= 4.5);
  }

  if (currentSort === 'price-low') {
    filtered.sort((a, b) => a.price - b.price);
  } else if (currentSort === 'price-high') {
    filtered.sort((a, b) => b.price - a.price);
  } else if (currentSort === 'rating') {
    filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (currentSort === 'stock') {
    filtered.sort((a, b) => b.stockQuantity - a.stockQuantity);
  }

  const totalItems = filtered.length;
  const totalPages = Math.max(1, Math.ceil(totalItems / ITEMS_PER_PAGE));
  if (currentPage > totalPages) currentPage = 1;

  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;
  const paginatedItems = filtered.slice(startIndex, startIndex + ITEMS_PER_PAGE);

  renderProducts(paginatedItems);
  renderPagination(totalPages);

  statusEl.textContent = totalItems 
    ? `Showing ${startIndex + 1}–${Math.min(startIndex + ITEMS_PER_PAGE, totalItems)} of ${totalItems} products`
    : 'No items found matching your filters. Try clearing some selections.';
}

function renderProducts(items) {
  grid.innerHTML = items.map(p => {
    const isWished = wishlist.has(p.id);
    const stockClass = p.stockQuantity > 10 ? 'in-stock' : p.stockQuantity > 0 ? 'low-stock' : 'out-stock';
    const stockLabel = p.stockQuantity > 10 ? 'In Stock' : p.stockQuantity > 0 ? `Only ${p.stockQuantity} left!` : 'Out of Stock';

    return `
      <article class="product-card" data-product-id="${p.id}">
        <div class="product-card-top-actions">
          <span class="tag-badge">${escapeHtml(p.badge || 'Popular')}</span>
          <button class="wishlist-heart-btn ${isWished ? 'active' : ''}" data-wishlist="${p.id}" aria-label="Toggle Wishlist" title="Save to Wishlist">
            ${isWished ? '♥' : '♡'}
          </button>
        </div>

        <div class="product-image" data-quickview="${p.id}">
          <img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}" loading="lazy">
          <div class="quick-view-overlay">
            <button class="quick-view-btn" data-quickview="${p.id}">Quick View 👁</button>
          </div>
        </div>

        <div class="product-info">
          <div class="product-meta">
            <span class="category-name">${p.categoryId === 1 ? 'Electronics' : p.categoryId === 2 ? 'Accessories' : p.categoryId === 3 ? 'Study' : 'Lifestyle'}</span>
            <span class="rating-stars">★ ${p.rating} <small>(${p.reviewsCount || 40})</small></span>
          </div>

          <h3>${escapeHtml(p.name)}</h3>
          <p>${escapeHtml(p.description || 'Modern essential.')}</p>
          
          <div class="stock-tag ${stockClass}">● ${stockLabel}</div>

          <div class="product-bottom">
            <div>
              <span class="price">${money(p.price)}</span>
            </div>
            <button class="add-button" data-add="${p.id}" aria-label="Add to cart" ${p.stockQuantity < 1 ? 'disabled' : ''}>
              ${p.stockQuantity < 1 ? 'Sold Out' : '+ Add'}
            </button>
          </div>
        </div>
      </article>
    `;
  }).join('');
}

function renderPagination(totalPages) {
  prevPageBtn.disabled = currentPage <= 1;
  nextPageBtn.disabled = currentPage >= totalPages;

  let html = '';
  for (let i = 1; i <= totalPages; i++) {
    html += `<button class="page-num-btn ${i === currentPage ? 'active' : ''}" data-page="${i}">${i}</button>`;
  }
  pageNumbersContainer.innerHTML = html;
}

prevPageBtn.addEventListener('click', () => {
  if (currentPage > 1) {
    currentPage--;
    applyFiltersAndRender();
    document.querySelector('#catalog-section').scrollIntoView({ behavior: 'smooth' });
  }
});
nextPageBtn.addEventListener('click', () => {
  currentPage++;
  applyFiltersAndRender();
  document.querySelector('#catalog-section').scrollIntoView({ behavior: 'smooth' });
});
pageNumbersContainer.addEventListener('click', e => {
  const btn = e.target.closest('[data-page]');
  if (btn) {
    currentPage = Number(btn.dataset.page);
    applyFiltersAndRender();
    document.querySelector('#catalog-section').scrollIntoView({ behavior: 'smooth' });
  }
});

categoryTabs.addEventListener('click', e => {
  const pill = e.target.closest('.cat-pill');
  if (!pill) return;
  document.querySelectorAll('.cat-pill').forEach(b => b.classList.remove('active'));
  pill.classList.add('active');
  activeCategory = pill.dataset.category;
  currentPage = 1;
  applyFiltersAndRender();
});

sortSelect.addEventListener('change', e => {
  currentSort = e.target.value;
  currentPage = 1;
  applyFiltersAndRender();
});
filterInStock.addEventListener('change', () => { currentPage = 1; applyFiltersAndRender(); });
filterTopRated.addEventListener('change', () => { currentPage = 1; applyFiltersAndRender(); });

let searchTimer;
searchInput.addEventListener('input', () => {
  clearTimeout(searchTimer);
  searchTimer = setTimeout(() => {
    currentSearch = searchInput.value;
    currentPage = 1;
    applyFiltersAndRender();
  }, 200);
});

// -------------------------------------------------------------
// 8. WISHLIST MANAGEMENT
// -------------------------------------------------------------
function toggleWishlist(id) {
  const p = allProducts.find(item => item.id === id);
  if (!p) return;

  if (wishlist.has(id)) {
    wishlist.delete(id);
    showToast(`Removed ${p.name} from wishlist`, 'info');
  } else {
    wishlist.add(id);
    showToast(`Added ${p.name} to wishlist ♥`, 'success');
  }

  saveUserWishlist();
  renderWishlistUI();
  applyFiltersAndRender();
}

function renderWishlistUI() {
  document.querySelector('#wishlist-count').textContent = wishlist.size;
  document.querySelector('#modal-wishlist-count').textContent = wishlist.size;

  const container = document.querySelector('#wishlist-items');
  if (!wishlist.size) {
    container.innerHTML = '<p class="empty" style="text-align:center; padding:30px 0; color:var(--muted)">Your wishlist is empty. Tap the heart icon on products to save them!</p>';
    return;
  }

  container.innerHTML = [...wishlist].map(id => {
    const p = allProducts.find(item => item.id === id);
    if (!p) return '';
    return `
      <div class="wishlist-row">
        <div style="display:flex; align-items:center; gap:12px;">
          <img src="${p.imageUrl}" alt="${p.name}" style="width:50px; height:50px; border-radius:8px; object-fit:cover;">
          <div>
            <strong>${escapeHtml(p.name)}</strong>
            <div style="color:var(--muted); font-size:0.85rem;">${money(p.price)}</div>
          </div>
        </div>
        <div style="display:flex; gap:8px;">
          <button class="add-button" data-add="${p.id}" style="padding:6px 14px; font-size:0.82rem;">+ Move to Cart</button>
          <button class="icon-btn" data-wishlist-remove="${p.id}" title="Remove" style="color:#ef4444; border:0;">✕</button>
        </div>
      </div>
    `;
  }).join('');
}

document.querySelector('#wishlist-toggle').addEventListener('click', () => {
  renderWishlistUI();
  wishlistDialog.showModal();
});
document.querySelector('#footer-wishlist-link').addEventListener('click', (e) => {
  e.preventDefault();
  renderWishlistUI();
  wishlistDialog.showModal();
});
document.querySelector('#close-wishlist').addEventListener('click', () => wishlistDialog.close());

document.querySelector('#wishlist-items').addEventListener('click', e => {
  const remBtn = e.target.closest('[data-wishlist-remove]');
  if (remBtn) toggleWishlist(Number(remBtn.dataset.wishlistRemove));
});

// -------------------------------------------------------------
// 9. CART, SHIPPING & COUPON VALIDATION
// -------------------------------------------------------------
function addToCart(id, qtyToAdd = 1) {
  const p = allProducts.find(item => item.id === id);
  if (!p) return;
  const currentQty = cart.get(id) || 0;
  if (currentQty + qtyToAdd > p.stockQuantity) {
    showToast(`Sorry, only ${p.stockQuantity} available in stock for ${p.name}`, 'error');
    return;
  }
  cart.set(id, currentQty + qtyToAdd);
  saveUserCart();
  renderCart();
  updateAiRecommendations(); // Recalculate AI picks based on new cart contents!
  showToast(`Added ${p.name} to cart!`, 'success');
}

function renderCart() {
  const entries = [...cart.entries()];
  const totalUnits = entries.reduce((sum, [, qty]) => sum + qty, 0);
  document.querySelector('#cart-count').textContent = totalUnits;

  const container = document.querySelector('#cart-items');
  if (!entries.length) {
    container.innerHTML = '<p class="empty" style="text-align:center; padding:28px 0; color:var(--muted)">Your shopping cart is currently empty.<br>Explore our deals to find essentials!</p>';
    document.querySelector('#cart-subtotal').textContent = money(0);
    document.querySelector('#cart-shipping').textContent = money(0);
    document.querySelector('#cart-total').textContent = money(0);
    document.querySelector('#discount-row').style.display = 'none';
    return;
  }

  container.innerHTML = entries.map(([id, qty]) => {
    const p = allProducts.find(item => item.id === id);
    if (!p) return '';
    return `
      <div class="cart-row">
        <div>
          <strong>${escapeHtml(p.name)}</strong>
          <div style="font-size:0.82rem; color:var(--muted);">${money(p.price)} each • Total: ${money(p.price * qty)}</div>
        </div>
        <div class="cart-row-controls">
          <button class="qty-btn" data-dec="${id}">−</button>
          <span><strong>${qty}</strong></span>
          <button class="qty-btn" data-inc="${id}">+</button>
          <button class="icon-btn" data-remove="${id}" title="Remove item" style="color:#ef4444; border:0; padding:0 4px; margin-left:4px;">🗑</button>
        </div>
      </div>
    `;
  }).join('');

  const subtotal = entries.reduce((sum, [id, qty]) => {
    const p = allProducts.find(item => item.id === id);
    return sum + (p ? Number(p.price) * qty : 0);
  }, 0);

  const shipping = subtotal > 999 ? 0 : 99;

  let discount = 0;
  if (appliedCoupon) {
    discount = (subtotal * appliedCoupon.discountPercent) / 100;
    document.querySelector('#discount-row').style.display = 'flex';
    document.querySelector('#cart-discount').textContent = `-${money(discount)} (${appliedCoupon.code})`;
  } else {
    document.querySelector('#discount-row').style.display = 'none';
  }

  const grandTotal = Math.max(0, subtotal - discount + shipping);

  document.querySelector('#cart-subtotal').textContent = money(subtotal);
  document.querySelector('#cart-shipping').textContent = shipping === 0 ? 'FREE' : money(shipping);
  document.querySelector('#cart-total').textContent = money(grandTotal);
}

document.querySelector('#apply-coupon-btn').addEventListener('click', () => {
  const code = document.querySelector('#coupon-input').value.trim().toUpperCase();
  const feedback = document.querySelector('#coupon-feedback');
  const coupons = getCouponsStore();

  const found = coupons.find(c => c.code.toUpperCase() === code && c.active);

  if (found) {
    appliedCoupon = { code: found.code, discountPercent: found.discount };
    feedback.innerHTML = `<span style="color:#10b981;">✓ ${found.discount}% Discount Applied!</span>`;
    showToast(`Coupon ${found.code} applied successfully!`, 'success');
  } else {
    appliedCoupon = null;
    feedback.innerHTML = '<span style="color:#ef4444;">✕ Invalid or expired coupon code.</span>';
    showToast('Invalid coupon code', 'error');
  }
  renderCart();
});

document.querySelector('#cart-toggle').addEventListener('click', () => {
  renderCart();
  syncCheckoutUserFields();
  cartDialog.showModal();
});
document.querySelector('#close-cart').addEventListener('click', () => cartDialog.close());

document.querySelector('#cart-items').addEventListener('click', e => {
  const inc = e.target.closest('[data-inc]');
  if (inc) return addToCart(Number(inc.dataset.inc), 1);

  const dec = e.target.closest('[data-dec]');
  if (dec) {
    const id = Number(dec.dataset.dec);
    const qty = cart.get(id) || 0;
    if (qty > 1) cart.set(id, qty - 1);
    else cart.delete(id);
    saveUserCart();
    renderCart();
    updateAiRecommendations();
    return;
  }

  const rem = e.target.closest('[data-remove]');
  if (rem) {
    cart.delete(Number(rem.dataset.remove));
    saveUserCart();
    renderCart();
    updateAiRecommendations();
    showToast('Removed item from cart', 'info');
  }
});

// -------------------------------------------------------------
// 10. QUICK VIEW MODAL & RELATED PRODUCT SUGGESTIONS
// -------------------------------------------------------------
function openQuickView(id) {
  const catalog = getCatalogStore();
  const p = catalog.find(item => item.id === id);
  if (!p) return;

  document.querySelector('#modal-product-title').textContent = p.name;
  const body = document.querySelector('#modal-product-body');

  const specsList = (p.specs || []).map(s => `<li>✓ ${escapeHtml(s)}</li>`).join('');
  const reviewsList = (p.reviews || []).map(r => `
    <div class="review-item">
      <div style="display:flex; justify-content:space-between;">
        <strong>${escapeHtml(r.user)}</strong>
        <span style="color:#f59e0b;">${r.stars}</span>
      </div>
      <p style="margin:4px 0 0; color:var(--muted);">${escapeHtml(r.text)}</p>
    </div>
  `).join('');

  // Related products based on category affinity
  const relatedProducts = catalog.filter(x => x.id !== p.id && (x.categoryId === p.categoryId || x.featured)).slice(0, 3);
  const relatedListHtml = relatedProducts.map(rel => `
    <div class="related-mini-card" data-quickview="${rel.id}">
      <img src="${rel.imageUrl}" alt="${rel.name}">
      <strong>${escapeHtml(rel.name)}</strong>
      <small>${money(rel.price)}</small>
    </div>
  `).join('');

  body.innerHTML = `
    <div class="quick-view-content">
      <div>
        <img src="${escapeHtml(p.imageUrl)}" alt="${escapeHtml(p.name)}" class="quick-view-img">
        <ul style="list-style:none; padding:0; margin:14px 0; font-size:0.82rem; color:var(--muted); display:flex; flex-direction:column; gap:4px;">
          ${specsList}
        </ul>

        <!-- Related Product Suggestions -->
        <div class="related-products-box">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:0.85rem;">✦ AI Frequently Bought Together</strong>
          </div>
          <div class="related-products-grid">
            ${relatedListHtml}
          </div>
        </div>
      </div>
      <div>
        <div style="display:flex; justify-content:space-between; align-items:center;">
          <span class="tag-badge">${escapeHtml(p.badge || 'Verified')}</span>
          <span style="color:#f59e0b; font-weight:700;">★ ${p.rating} (${p.reviewsCount || 40} reviews)</span>
        </div>
        <p class="quick-view-desc">${escapeHtml(p.description)}</p>
        
        <div style="font-size:1.4rem; font-weight:800; margin-bottom:8px;">
          ${money(p.price)}
          <small style="font-size:0.85rem; text-decoration:line-through; color:var(--muted); font-weight:normal;">${money(p.originalPrice || p.price * 1.3)}</small>
        </div>

        <div style="font-size:0.82rem; margin-bottom:16px;">
          Status: <strong style="color:${p.stockQuantity > 0 ? '#10b981' : '#ef4444'};">
            ${p.stockQuantity > 0 ? `${p.stockQuantity} units available for dispatch` : 'Out of stock'}
          </strong>
        </div>

        <button id="modal-add-btn" class="primary-button" style="width:100%;" ${p.stockQuantity < 1 ? 'disabled' : ''}>
          ${p.stockQuantity < 1 ? 'Out of Stock' : 'Add to Cart 🛒'}
        </button>

        <div class="quick-view-reviews-box">
          <div style="display:flex; justify-content:space-between; align-items:center;">
            <strong style="font-size:0.88rem;">Customer Reviews</strong>
            <span class="sentiment-tag-pill pos">NLP: Positive</span>
          </div>
          <div style="margin-top:6px;">${reviewsList || '<small style="color:var(--muted)">No written reviews yet.</small>'}</div>
        </div>
      </div>
    </div>
  `;

  document.querySelector('#modal-add-btn').onclick = () => {
    addToCart(p.id);
    productModal.close();
  };

  productModal.showModal();
}

document.querySelector('#close-product-modal').addEventListener('click', () => productModal.close());

// -------------------------------------------------------------
// 11. CHECKOUT & ORDER CONFIRMATION
// -------------------------------------------------------------
document.querySelector('#checkout-form').addEventListener('submit', async e => {
  e.preventDefault();
  if (!cart.size) {
    showToast('Cart is empty. Add products to checkout.', 'error');
    return;
  }

  const form = new FormData(e.currentTarget);
  const customerName = form.get('customerName');
  const customerEmail = form.get('customerEmail');
  const address = form.get('deliveryAddress');

  const items = [...cart.entries()].map(([productId, quantity]) => {
    const p = allProducts.find(item => item.id === productId);
    return {
      productId,
      productName: p ? p.name : `Product #${productId}`,
      price: p ? p.price : 0,
      quantity
    };
  });

  const subtotal = items.reduce((s, it) => s + it.price * it.quantity, 0);
  const discount = appliedCoupon ? (subtotal * appliedCoupon.discountPercent) / 100 : 0;
  const shipping = subtotal > 999 ? 0 : 99;
  const finalTotal = subtotal - discount + shipping;

  const resultStatus = document.querySelector('#checkout-status');
  resultStatus.textContent = 'Processing transactional order…';

  let orderId = Math.floor(10000 + Math.random() * 90000);

  try {
    const res = await fetch(`${API}/orders`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        customerName,
        customerEmail,
        items: items.map(i => ({ productId: i.productId, quantity: i.quantity }))
      })
    });
    const data = await res.json();
    if (res.ok && data.id) orderId = data.id;
  } catch (err) {
    console.warn('Backend unavailable, completing simulated transactional order');
  }

  const newOrder = {
    orderId,
    customerName,
    customerEmail,
    address,
    date: new Date().toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' }),
    items,
    total: finalTotal,
    status: 'Processing'
  };

  const catalog = getCatalogStore();
  items.forEach(it => {
    const p = catalog.find(x => x.id === it.productId);
    if (p) p.stockQuantity = Math.max(0, p.stockQuantity - it.quantity);
  });
  saveCatalogStore(catalog);
  allProducts = catalog;
  applyFiltersAndRender();

  orderHistory.unshift(newOrder);
  saveUserOrders();

  const allOrders = getAllOrdersStore();
  allOrders.unshift(newOrder);
  saveAllOrdersStore(allOrders);

  cart.clear();
  saveUserCart();
  appliedCoupon = null;
  document.querySelector('#coupon-input').value = '';
  document.querySelector('#coupon-feedback').textContent = '';
  renderCart();
  updateOrdersBadge();
  updateAiRecommendations();

  cartDialog.close();
  resultStatus.textContent = '';
  document.querySelector('#confirmed-order-id').textContent = `#ORD-${orderId}`;
  document.querySelector('#order-summary-text').textContent = 
    `Thank you, ${customerName}! Order #${orderId} totaling ${money(finalTotal)} is confirmed and is being packaged for delivery to: ${address}`;
  paymentModal.showModal();
  showToast('Order confirmed and recorded in customer portal!', 'success');
});

function updateOrdersBadge() {
  document.querySelector('#orders-badge-count').textContent = orderHistory.length;
}

function renderOrdersHistory() {
  const container = document.querySelector('#orders-list');
  if (!orderHistory.length) {
    container.innerHTML = '<p class="empty" style="text-align:center; padding:30px 0; color:var(--muted)">You haven\'t placed any orders yet. Complete checkout to track shipments here!</p>';
    return;
  }

  container.innerHTML = orderHistory.map(ord => `
    <div class="order-history-card">
      <div class="order-history-header">
        <div>
          <strong>#ORD-${ord.orderId}</strong>
          <span style="color:var(--muted); font-size:0.8rem; margin-left:6px;">• Placed on ${ord.date}</span>
        </div>
        <span class="order-track-step">● ${ord.status}</span>
      </div>
      <div style="font-size:0.88rem; margin:8px 0;">
        ${ord.items.map(i => `${escapeHtml(i.productName)} × ${i.quantity}`).join(', ')}
      </div>
      <div style="display:flex; justify-content:space-between; align-items:center; font-size:0.85rem; border-top:1px dashed var(--line); padding-top:8px;">
        <span style="color:var(--muted);">Delivery: ${escapeHtml(ord.address || 'Standard Delivery')}</span>
        <strong>Total: ${money(ord.total)}</strong>
      </div>
    </div>
  `).join('');
}

document.querySelector('#nav-orders-btn').addEventListener('click', () => {
  renderOrdersHistory();
  ordersDialog.showModal();
});
document.querySelector('#footer-orders-link').addEventListener('click', (e) => {
  e.preventDefault();
  renderOrdersHistory();
  ordersDialog.showModal();
});
document.querySelector('#close-orders').addEventListener('click', () => ordersDialog.close());

document.querySelector('#view-order-tracking-btn').addEventListener('click', () => {
  paymentModal.close();
  renderOrdersHistory();
  ordersDialog.showModal();
});
document.querySelector('#close-payment-modal').addEventListener('click', () => paymentModal.close());
document.querySelector('#dismiss-payment-btn').addEventListener('click', () => paymentModal.close());

// -------------------------------------------------------------
// 12. EVENT DELEGATION
// -------------------------------------------------------------
function handleItemClick(event) {
  const addBtn = event.target.closest('[data-add]');
  if (addBtn) {
    addToCart(Number(addBtn.dataset.add));
    return;
  }

  const wishBtn = event.target.closest('[data-wishlist]');
  if (wishBtn) {
    toggleWishlist(Number(wishBtn.dataset.wishlist));
    return;
  }

  const qv = event.target.closest('[data-quickview]');
  if (qv) {
    openQuickView(Number(qv.dataset.quickview));
  }
}

grid.addEventListener('click', handleItemClick);
featuredGrid.addEventListener('click', handleItemClick);
if (aiRecsGrid) aiRecsGrid.addEventListener('click', handleItemClick);

// -------------------------------------------------------------
// 13. THEME TOGGLE
// -------------------------------------------------------------
const savedTheme = localStorage.getItem('shopsphere_theme') || 'light';
if (savedTheme === 'dark') {
  document.documentElement.setAttribute('data-theme', 'dark');
  themeToggle.textContent = '☀️';
}

themeToggle.addEventListener('click', () => {
  const current = document.documentElement.getAttribute('data-theme');
  const next = current === 'dark' ? 'light' : 'dark';
  document.documentElement.setAttribute('data-theme', next);
  localStorage.setItem('shopsphere_theme', next);
  themeToggle.textContent = next === 'dark' ? '☀️' : '🌙';
  showToast(`Switched to ${next} mode`, 'info');
});

// -------------------------------------------------------------
// 14. AI SHOPPING ASSISTANT DRAWER
// -------------------------------------------------------------
const aiBubble = document.querySelector('#ai-chat-bubble');
const aiDrawer = document.querySelector('#ai-chat-drawer');
const closeAiDrawer = document.querySelector('#close-ai-drawer');
const aiForm = document.querySelector('#ai-chat-form');
const aiInput = document.querySelector('#ai-input');
const aiMessages = document.querySelector('#ai-chat-messages');

function toggleAiDrawer() {
  aiDrawer.classList.toggle('hidden');
  if (!aiDrawer.classList.contains('hidden')) aiInput.focus();
}

aiBubble.addEventListener('click', toggleAiDrawer);
closeAiDrawer.addEventListener('click', () => aiDrawer.classList.add('hidden'));
document.querySelector('#open-assistant-hero').addEventListener('click', () => {
  aiDrawer.classList.remove('hidden');
  aiInput.focus();
});

aiForm.addEventListener('submit', e => {
  e.preventDefault();
  const text = aiInput.value.trim();
  if (!text) return;
  handleUserQuery(text);
  aiInput.value = '';
});

aiMessages.addEventListener('click', e => {
  const chip = e.target.closest('.prompt-chip');
  if (chip) handleUserQuery(chip.dataset.query);
});

function handleUserQuery(query) {
  appendChatMessage(query, 'user');

  setTimeout(() => {
    const q = query.toLowerCase();
    let reply = '';

    if (q.includes('under') || q.includes('budget') || q.includes('2000') || q.includes('cheap')) {
      const budgetItems = allProducts.filter(p => p.price <= 2000 && p.active !== false);
      reply = `Here are our top budget picks under ₹2,000:<br>• <strong>${budgetItems.map(p => `${escapeHtml(p.name)} (${money(p.price)})`).join('<br>• ')}</strong>`;
      currentSearch = '';
      activeCategory = 'all';
      renderProducts(budgetItems);
      statusEl.textContent = `AI Guide: Showing ${budgetItems.length} items under ₹2,000`;
    } else if (q.includes('recommend') || q.includes('pick') || q.includes('cart')) {
      reply = `Based on your cart, our complementary AI recommender suggests adding the <strong>Smart Focus Watch</strong> or <strong>LED Dual-Bar Desk Lamp</strong>! Check the "AI Picks ✦" section on the home page.`;
      document.querySelector('#ai-recs-section').scrollIntoView({ behavior: 'smooth' });
    } else if (q.includes('study') || q.includes('focus') || q.includes('desk') || q.includes('planner')) {
      const studyItems = allProducts.filter(p => (p.categoryId === 3 || p.name.includes('Watch') || p.name.includes('Headphones')) && p.active !== false);
      reply = `For focused studying, I recommend the <strong>Spatial Headphones</strong> alongside the <strong>LED Dual-Bar Desk Lamp</strong> and <strong>Productivity Planner</strong>.`;
      renderProducts(studyItems);
    } else if (q.includes('bestseller') || q.includes('trending') || q.includes('deal')) {
      const topItems = allProducts.filter(p => p.rating >= 4.8 && p.active !== false);
      reply = `Our best-rated customer favorites (★ 4.8+):<br>• <strong>${topItems.map(p => `${escapeHtml(p.name)} (${p.rating} ★)`).join('<br>• ')}</strong>`;
      renderProducts(topItems);
    } else if (q.includes('admin') || q.includes('inventory') || q.includes('manage')) {
      reply = `You can access the <strong>Admin Console</strong> via the top navigation badge or footer to view charts, RFM customer segmentation, and manage products.`;
    } else {
      reply = `I searched for "${escapeHtml(query)}" in our catalog. You can also apply coupon <strong>SAVE20</strong> at checkout for 20% off!`;
      currentSearch = query;
      applyFiltersAndRender();
    }

    appendChatMessage(reply, 'bot');
  }, 350);
}

function appendChatMessage(html, sender = 'bot') {
  const div = document.createElement('div');
  div.className = `ai-msg ${sender}`;
  div.innerHTML = html;
  aiMessages.appendChild(div);
  aiMessages.scrollTop = aiMessages.scrollHeight;
}

// -------------------------------------------------------------
// 15. PYTHON FASTAPI ANALYTICS SYNCHRONIZATION
// -------------------------------------------------------------
async function updateAnalyticsMetrics() {
  try {
    const demoPayload = {
      orders: [
        { product_id: 1, quantity: 6, unit_price: 2499.00, status: 'PAID' },
        { product_id: 2, quantity: 8, unit_price: 1599.00, status: 'PAID' },
        { product_id: 3, quantity: 4, unit_price: 3299.00, status: 'PAID' },
        { product_id: 4, quantity: 9, unit_price: 899.00, status: 'PAID' },
        { product_id: 5, quantity: 3, unit_price: 3799.00, status: 'PAID' }
      ]
    };

    const res = await fetch(`${ANALYTICS_API}/summary`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(demoPayload)
    });

    if (res.ok) {
      const data = await res.json();
      document.querySelector('#metric-revenue').textContent = money(data.revenue);
      document.querySelector('#metric-units').textContent = `${data.units_sold} items`;
      document.querySelector('#metric-avg').textContent = money(data.average_line_value);
      showToast('Live metrics synchronized from Python FastAPI', 'success');
    }
  } catch (err) {
    console.warn('Analytics backend offline; keeping simulated dashboard metrics.');
  }
}

document.querySelector('#refresh-analytics').addEventListener('click', () => {
  updateAnalyticsMetrics();
  showToast('Live metrics refreshed', 'info');
});

// Boot the application
getUsersStore();
getAllOrdersStore();
getCouponsStore();
updateAuthNavbarUI();
loadUserScopedData();
initCatalog();
