import React from 'react';
import {
  Bandage,
  Scissors,
  Activity,
  Stethoscope,
  Wind,
  ShieldCheck,
  Layers,
  FolderOpen,
  Plus,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface CategoryNavProps {
  selectedCategory: string;
  onSelectCategory: (category: string) => void;
  onOpenAddCategory?: () => void;
}

export const CategoryNav: React.FC<CategoryNavProps> = ({
  selectedCategory,
  onSelectCategory,
  onOpenAddCategory,
}) => {
  const { categories, products, isAdmin } = useStore();

  const getIcon = (name: string) => {
    switch (name) {
      case 'Bandage':
        return <Bandage className="w-4 h-4" />;
      case 'Scissors':
        return <Scissors className="w-4 h-4" />;
      case 'Activity':
        return <Activity className="w-4 h-4" />;
      case 'Stethoscope':
        return <Stethoscope className="w-4 h-4" />;
      case 'Wind':
        return <Wind className="w-4 h-4" />;
      case 'ShieldCheck':
        return <ShieldCheck className="w-4 h-4" />;
      default:
        return <FolderOpen className="w-4 h-4" />;
    }
  };

  const getProductCount = (categoryName: string) => {
    if (categoryName === 'ALL') return products.length;
    return products.filter((p) => p.category === categoryName).length;
  };

  return (
    <div className="py-4 border-b border-slate-200 bg-white sticky top-[73px] z-30 shadow-xs no-print">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => onSelectCategory('ALL')}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
              selectedCategory === 'ALL'
                ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25 ring-2 ring-sky-600/20'
                : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Tous les produits</span>
            <span
              className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                selectedCategory === 'ALL'
                  ? 'bg-sky-700 text-sky-100'
                  : 'bg-slate-200 text-slate-600'
              }`}
            >
              {getProductCount('ALL')}
            </span>
          </button>

          {categories.map((cat) => {
            const isSelected = selectedCategory === cat.name;
            const count = getProductCount(cat.name);

            return (
              <button
                key={cat.id}
                onClick={() => onSelectCategory(cat.name)}
                className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer ${
                  isSelected
                    ? 'bg-sky-600 text-white shadow-sm shadow-sky-600/25 ring-2 ring-sky-600/20'
                    : 'bg-slate-100 text-slate-700 hover:bg-slate-200/80 hover:text-slate-900'
                }`}
              >
                {getIcon(cat.iconName)}
                <span>{cat.name}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.5 rounded-full font-bold ${
                    isSelected
                      ? 'bg-sky-700 text-sky-100'
                      : 'bg-slate-200 text-slate-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}

          {/* ADMIN ONLY: Button to add/manage categories in catalog */}
          {isAdmin && onOpenAddCategory && (
            <button
              onClick={onOpenAddCategory}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold transition-all shrink-0 cursor-pointer bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200"
              title="Ajouter une nouvelle catégorie (Admin)"
            >
              <Plus className="w-3.5 h-3.5 text-amber-700" />
              <span>+ Catégorie</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
