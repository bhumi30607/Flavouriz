import React from 'react';
import {
  Sparkles,
  Coffee,
  Utensils,
  Moon,
  Cookie,
  IceCream,
} from 'lucide-react';

const CATEGORIES = [
  { name: 'All', icon: Sparkles },
  { name: 'Breakfast', icon: Coffee },
  { name: 'Lunch', icon: Utensils },
  { name: 'Dinner', icon: Moon },
  { name: 'Snacks', icon: Cookie },
  { name: 'Desserts', icon: IceCream },
];

export default function CategoryFilter({
  activeCategory = 'All',
  onSelectCategory,
  className = '',
}) {
  return (
    <div className={`flex items-center gap-2 overflow-x-auto pb-2 scrollbar-none ${className}`}>
      {CATEGORIES.map((cat) => {
        const Icon = cat.icon;
        const isActive = activeCategory.toLowerCase() === cat.name.toLowerCase();

        return (
          <button
            key={cat.name}
            onClick={() => onSelectCategory(cat.name)}
            className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-xs font-bold transition-all duration-200 whitespace-nowrap shadow-sm ${
              isActive
                ? 'bg-forest-green text-cream shadow-soft scale-105'
                : 'bg-white text-forest-green/80 hover:bg-cream hover:text-forest-green border border-forest-green/10'
            }`}
          >
            <Icon className={`w-3.5 h-3.5 ${isActive ? 'text-terracotta' : 'text-forest-green'}`} />
            <span>{cat.name}</span>
          </button>
        );
      })}
    </div>
  );
}
