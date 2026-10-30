/* ============================================================
   TradeLink — CategoryTree Component
   2-level collapsible category filter sidebar.
   ============================================================ */
import { useState } from 'react';
import { ChevronDown, ChevronRight, Layers } from 'lucide-react';
import './shop.css';

export default function CategoryTree({
  categories = [],
  selectedCategoryId = '',
  onSelectCategory,
}) {
  // Organize categories into tree: parent (parentId == null) and children
  const parents = categories.filter((c) => !c.parentId);
  const childrenMap = {};
  categories.forEach((c) => {
    if (c.parentId) {
      if (!childrenMap[c.parentId]) childrenMap[c.parentId] = [];
      childrenMap[c.parentId].push(c);
    }
  });

  // Track expanded parent nodes
  const [expandedParents, setExpandedParents] = useState(() => {
    // Expand parent of initially selected category
    const initial = {};
    if (selectedCategoryId) {
      const selected = categories.find((c) => c.id === selectedCategoryId);
      if (selected && selected.parentId) {
        initial[selected.parentId] = true;
      } else if (selected) {
        initial[selected.id] = true;
      }
    }
    return initial;
  });

  const toggleExpand = (parentId, e) => {
    e.stopPropagation();
    setExpandedParents((prev) => ({
      ...prev,
      [parentId]: !prev[parentId],
    }));
  };

  return (
    <nav className="category-tree-nav" aria-label="Product categories">
      <div className="category-tree-header">
        <Layers size={16} />
        <span>Categories</span>
      </div>

      <ul className="category-tree-list">
        {/* All Categories item */}
        <li className="category-tree-item">
          <button
            type="button"
            className={`category-item-btn ${!selectedCategoryId ? 'active' : ''}`}
            onClick={() => onSelectCategory('')}
          >
            <span>All Categories</span>
          </button>
        </li>

        {/* Parent categories */}
        {parents.map((parent) => {
          const children = childrenMap[parent.id] || [];
          const hasChildren = children.length > 0;
          const isExpanded = !!expandedParents[parent.id];
          const isSelected = selectedCategoryId === parent.id;

          return (
            <li key={parent.id} className="category-tree-item">
              <div className={`category-item-row ${isSelected ? 'active' : ''}`}>
                <button
                  type="button"
                  className="category-label-btn"
                  onClick={() => onSelectCategory(parent.id)}
                >
                  <span>{parent.name}</span>
                </button>

                {hasChildren && (
                  <button
                    type="button"
                    className="category-expand-btn"
                    onClick={(e) => toggleExpand(parent.id, e)}
                    aria-label={isExpanded ? `Collapse ${parent.name}` : `Expand ${parent.name}`}
                  >
                    {isExpanded ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                  </button>
                )}
              </div>

              {/* Subcategories */}
              {hasChildren && isExpanded && (
                <ul className="subcategory-list">
                  {children.map((sub) => {
                    const isSubSelected = selectedCategoryId === sub.id;
                    return (
                      <li key={sub.id} className="subcategory-item">
                        <button
                          type="button"
                          className={`subcategory-btn ${isSubSelected ? 'active' : ''}`}
                          onClick={() => onSelectCategory(sub.id)}
                        >
                          <span>{sub.name}</span>
                        </button>
                      </li>
                    );
                  })}
                </ul>
              )}
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

