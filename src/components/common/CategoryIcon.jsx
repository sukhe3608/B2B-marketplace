/* ============================================================
   TradeLink — Category Icon Component
   Renders real Lucide React icons for all marketplace categories.
   ============================================================ */
import {
  Factory,
  Cpu,
  Shirt,
  FlaskConical,
  Home,
  Wrench,
  ShoppingBag,
  HeartPulse,
  Building,
  Car,
  Box,
  Sparkles,
  Package,
} from 'lucide-react';

export const CATEGORY_ICON_MAP = {
  machinery: Factory,
  electronics: Cpu,
  fashion: Shirt,
  chemicals: FlaskConical,
  'home-living': Home,
  'industrial-tools': Wrench,
  'food-beverages': ShoppingBag,
  healthcare: HeartPulse,
  construction: Building,
  automotive: Car,
  packaging: Box,
  textiles: Sparkles,
};

export default function CategoryIcon({ id, categoryId, size = 18, className = '', style = {} }) {
  const key = (id || categoryId || '').toLowerCase();
  const IconComponent = CATEGORY_ICON_MAP[key] || Package;
  return <IconComponent size={size} className={className} style={style} />;
}
