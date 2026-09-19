/* ============================================================
   TradeLink — Landing Page (Screen 1)
   Hero, trust bar, categories, how it works, testimonials, CTA.
   ============================================================ */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Search, ArrowRight, ChevronRight, Star, Users, BadgeCheck,
  Package, ShieldCheck, Zap, TrendingUp, Award, Globe,
  Cpu, ShoppingBag, FlaskConical, Home, Wrench, Shirt,
  Factory, Truck, HeartPulse, Car, Box, Sparkles,
} from 'lucide-react';
import Navbar from '../../components/layout/Navbar';
import Footer from '../../components/layout/Footer';
import { CATEGORIES, TRUST_STATS, HOW_IT_WORKS_CONSUMER, HOW_IT_WORKS_SELLER, TESTIMONIALS } from '../../utils/constants';
import heroBannerImg from '../../assets/hero-banner.jpg';
import './LandingPage.css';

const CATEGORY_ICONS = {
  'machinery': Factory,
  'electronics': Cpu,
  'fashion': Shirt,
  'chemicals': FlaskConical,
  'home-living': Home,
  'industrial-tools': Wrench,
  'food-beverages': ShoppingBag,
  'healthcare': HeartPulse,
  'construction': Factory,
  'automotive': Car,
  'packaging': Box,
  'textiles': Sparkles,
};

const TRUST_ICONS = { Users, BadgeCheck, Package, ShieldCheck };

export default function LandingPage() {
  const [searchQuery, setSearchQuery] = useState('');

  return (
    <div className="landing-page">
      <Navbar variant="public" />

      {/* ── Hero Section (Unified Card Banner matching Wireframe Screen 1) ── */}
      <section className="hero-section" id="hero-section">
        <div className="container">
          <div className="hero-banner-card animate-fade-in">
            {/* Left Content Area */}
            <div className="hero-banner-content">
              <div className="hero-pill-badge">
                India's Leading B2B Marketplace
              </div>
              <h1 className="hero-banner-title">
                Connect with Verified <br />
                <span className="hero-title-highlight">Buyers & Suppliers</span>
              </h1>
              <p className="hero-banner-subtitle">
                Find the right products, get the best quotes, and grow your business — all in one place.
              </p>

              {/* Search Bar matching wireframe */}
              <form className="hero-banner-search" onSubmit={(e) => e.preventDefault()} id="hero-search">
                <Search size={18} className="hero-search-icon" />
                <input
                  type="text"
                  placeholder="Search products, suppliers..."
                  className="hero-search-input"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  id="hero-search-input"
                  aria-label="Search products, suppliers, categories"
                />
                <button className="hero-search-btn" type="submit" aria-label="Search">
                  <Search size={16} className="hero-search-btn-icon" />
                  <span className="hero-search-btn-text">Search</span>
                </button>
              </form>
            </div>

            {/* Right Banner Visual (Handshake in Warehouse with fade blend) */}
            <div className="hero-banner-visual">
              <img
                src={heroBannerImg}
                alt="Connect with Verified Buyers & Suppliers"
                className="hero-banner-image"
                loading="eager"
              />
              <div className="hero-banner-fade"></div>

              {/* Floating Verified Suppliers Badge (Exact wireframe match) */}
              <div className="hero-verified-badge">
                <div className="hero-verified-badge-icon">
                  <ShieldCheck size={20} />
                </div>
                <div className="hero-verified-badge-text">
                  <span className="hero-verified-badge-title">Verified Suppliers</span>
                  <span className="hero-verified-badge-sub">Real Businesses</span>
                </div>
              </div>
            </div>
          </div>

          {/* ── Trust Stats Bar (4 horizontal cards matching wireframe) ── */}
          <div className="trust-stats-grid stagger-children" id="trust-bar">
            {TRUST_STATS.map((stat, i) => {
              const Icon = TRUST_ICONS[stat.icon] || Users;
              return (
                <div className="trust-stat-card" key={i}>
                  <div className="trust-stat-icon-circle">
                    <Icon size={20} />
                  </div>
                  <div className="trust-stat-info">
                    <div className="trust-stat-value">{stat.value}</div>
                    <div className="trust-stat-label">{stat.label}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── Popular Categories (6 categories matching wireframe) ── */}
      <section className="section categories-section" id="categories-section">
        <div className="container">
          <div className="section-header">
            <h2 className="section-title">Popular Categories</h2>
            <a href="#" className="section-link">
              View All <ChevronRight size={16} />
            </a>
          </div>

          <div className="categories-grid stagger-children">
            {CATEGORIES.slice(0, 6).map((cat) => {
              const Icon = CATEGORY_ICONS[cat.id] || Package;
              return (
                <a href="#" className="category-card" key={cat.id} id={`cat-${cat.id}`}>
                  <div className="category-icon" style={{ background: `${cat.color}15`, color: cat.color }}>
                    <Icon size={26} />
                  </div>
                  <span className="category-label">{cat.label}</span>
                </a>
              );
            })}
          </div>
        </div>
      </section>

      {/* ── How It Works ──────────────────────────────────── */}
      <section className="section how-it-works" id="how-it-works">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">How It Works</h2>
            <p className="section-subtitle">Get started in 3 simple steps</p>
          </div>

          <div className="hiw-tabs">
            <span className="hiw-tab-label">For Buyers</span>
          </div>

          <div className="hiw-steps stagger-children">
            {HOW_IT_WORKS_CONSUMER.map((step, i) => (
              <div className="hiw-step" key={i}>
                <div className="hiw-step-number">{step.step}</div>
                <h3 className="hiw-step-title">{step.title}</h3>
                <p className="hiw-step-desc">{step.description}</p>
                {i < HOW_IT_WORKS_CONSUMER.length - 1 && (
                  <div className="hiw-step-connector">
                    <ArrowRight size={20} />
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Testimonials ──────────────────────────────────── */}
      <section className="section testimonials-section" id="testimonials-section">
        <div className="container">
          <div className="section-header text-center">
            <h2 className="section-title">What Our Users Say</h2>
            <p className="section-subtitle">Trusted by businesses across India</p>
          </div>

          <div className="testimonials-grid stagger-children">
            {TESTIMONIALS.map((t) => (
              <div className="testimonial-card card" key={t.id}>
                <div className="testimonial-stars">
                  {Array.from({ length: t.rating }).map((_, i) => (
                    <Star key={i} size={16} fill="var(--color-warning)" color="var(--color-warning)" />
                  ))}
                </div>
                <p className="testimonial-text">"{t.text}"</p>
                <div className="testimonial-author">
                  <div className="avatar avatar-md">{t.avatar}</div>
                  <div>
                    <div className="testimonial-name">{t.name}</div>
                    <div className="testimonial-company">{t.company}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA Banner ────────────────────────────────────── */}
      <section className="cta-banner" id="cta-banner">
        <div className="container">
          <div className="cta-inner">
            <div className="cta-content">
              <h2 className="cta-title">Ready to Grow Your Business?</h2>
              <p className="cta-subtitle">
                Join millions of buyers and sellers on India's most trusted B2B marketplace.
              </p>
            </div>
            <div className="cta-actions">
              <Link to="/signup" className="btn btn-lg" style={{ background: 'white', color: 'var(--color-primary)' }}>
                Get Started Free <ArrowRight size={18} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
