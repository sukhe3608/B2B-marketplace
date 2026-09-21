/* ============================================================
   TradeLink — Screen 12: Design System & UI Elements Showcase
   Interactive live reproduction of Screen 12 wireframe.
   ============================================================ */
import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Home, Search, Filter, Bell, Package, ShieldCheck,
  Check, ChevronDown, Copy, ArrowLeft
} from 'lucide-react';
import './DesignSystemPage.css';

export default function DesignSystemPage() {
  const [toggleActive, setToggleActive] = useState(true);
  const [checkboxChecked, setCheckboxChecked] = useState(true);
  const [radioSelected, setRadioSelected] = useState('radio1');
  const [copiedHex, setCopiedHex] = useState(null);

  const colors = [
    { label: 'Primary', hex: '#6366F1', bg: '#6366F1' },
    { label: 'Secondary', hex: '#10B981', bg: '#10B981' },
    { label: 'Accent', hex: '#F59E0B', bg: '#F59E0B' },
    { label: 'Neutral', hex: '#64748B', bg: '#64748B' },
  ];

  const handleCopyColor = (hex) => {
    navigator.clipboard?.writeText(hex);
    setCopiedHex(hex);
    setTimeout(() => setCopiedHex(null), 2000);
  };

  return (
    <div className="design-system-page">
      <div className="design-system-container animate-fade-in">
        {/* Back Link */}
        <Link to="/" className="design-system-back-link">
          <ArrowLeft size={16} /> Back to TradeLink
        </Link>

        {/* Wireframe Card */}
        <div className="design-system-wireframe-card">
          <div className="ds-card-header">
            <h1 className="ds-card-title">12. Design System / UI Elements</h1>
            <p className="ds-card-sub">Exact reproduction of the wireframe design tokens, components, and interaction patterns.</p>
          </div>

          {/* Section 1: Colors */}
          <div className="ds-section">
            <h3 className="ds-section-label">Colors</h3>
            <div className="ds-colors-row">
              {colors.map((c) => (
                <div
                  key={c.label}
                  className="ds-color-card"
                  onClick={() => handleCopyColor(c.hex)}
                  title="Click to copy hex"
                >
                  <div className="ds-color-swatch-circle" style={{ backgroundColor: c.bg }}>
                    {copiedHex === c.hex && <Check size={16} color="#FFFFFF" />}
                  </div>
                  <div className="ds-color-info">
                    <span className="ds-color-name">{c.label}</span>
                    <span className="ds-color-hex">{c.hex}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Section 2: Typography & Buttons */}
          <div className="ds-grid-2">
            {/* Typography */}
            <div className="ds-section">
              <h3 className="ds-section-label">Typography</h3>
              <div className="ds-typography-block">
                <div className="ds-font-preview-name">Inter</div>
                <div className="ds-type-scales">
                  <div className="ds-type-scale-item">
                    <span className="ds-scale-label">Headings:</span>
                    <span className="ds-scale-spec">24/32, 600</span>
                  </div>
                  <div className="ds-type-scale-item">
                    <span className="ds-scale-label">Body:</span>
                    <span className="ds-scale-spec">16/24, 400</span>
                  </div>
                  <div className="ds-type-scale-item">
                    <span className="ds-scale-label">Buttons:</span>
                    <span className="ds-scale-spec">14/16, 500</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Buttons */}
            <div className="ds-section">
              <h3 className="ds-section-label">Buttons</h3>
              <div className="ds-buttons-row">
                <button className="ds-btn ds-btn-primary">Primary</button>
                <button className="ds-btn ds-btn-secondary">Secondary</button>
                <button className="ds-btn ds-btn-text">Text</button>
              </div>
            </div>
          </div>

          {/* Section 3: Form Elements */}
          <div className="ds-section">
            <h3 className="ds-section-label">Form Elements</h3>
            <div className="ds-forms-grid">
              <div className="ds-form-col">
                <label className="ds-input-label">Enter Text</label>
                <div className="ds-input-box">
                  <input type="text" placeholder="Enter text" className="ds-input-field" readOnly value="Enter text" />
                  <ChevronDown size={16} className="ds-input-arrow" />
                </div>
              </div>

              <div className="ds-form-col">
                <label className="ds-input-label">Dropdown</label>
                <div className="ds-input-box">
                  <span className="ds-select-text">Select option</span>
                  <ChevronDown size={16} className="ds-input-arrow" />
                </div>
              </div>

              <div className="ds-toggles-col">
                <label className="ds-switch">
                  <input
                    type="checkbox"
                    checked={toggleActive}
                    onChange={() => setToggleActive(!toggleActive)}
                  />
                  <span className="ds-slider round"></span>
                </label>
              </div>
            </div>

            {/* Checkbox and Radio controls row */}
            <div className="ds-controls-row">
              <label className="ds-checkbox-label">
                <input
                  type="checkbox"
                  checked={checkboxChecked}
                  onChange={() => setCheckboxChecked(!checkboxChecked)}
                />
                <span className="ds-custom-checkbox"></span>
                <span className="ds-control-text">Checkbox</span>
              </label>

              <label className="ds-radio-label">
                <input
                  type="radio"
                  name="ds-radio"
                  checked={radioSelected === 'radio1'}
                  onChange={() => setRadioSelected('radio1')}
                />
                <span className="ds-custom-radio"></span>
                <span className="ds-control-text">Radio</span>
              </label>
            </div>
          </div>

          {/* Section 4: Icons */}
          <div className="ds-section">
            <h3 className="ds-section-label">Icons</h3>
            <div className="ds-icons-row">
              <div className="ds-icon-box active" title="Home">
                <Home size={22} />
              </div>
              <div className="ds-icon-box" title="Search">
                <Search size={22} />
              </div>
              <div className="ds-icon-box" title="Filter">
                <Filter size={22} />
              </div>
              <div className="ds-icon-box" title="Notification">
                <Bell size={22} />
              </div>
              <div className="ds-icon-box" title="Package">
                <Package size={22} />
              </div>
              <div className="ds-icon-box" title="Verified Security">
                <ShieldCheck size={22} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
