import React from 'react';
import {
  ShoppingCart,
  Phone,
  Eye,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Tag,
  Building,
  Shield,
  Sparkles,
  Edit2,
  Trash2,
} from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatFCFA } from '../utils/format';

interface ProductCardProps {
  product: Product;
  onOpenDetail: (product: Product) => void;
  onEditProduct?: (product: Product) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onOpenDetail,
  onEditProduct,
}) => {
  const { addToCart, settings, isAdmin, deleteProduct } = useStore();

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock =
    product.stockQuantity > 0 &&
    product.stockQuantity <= product.lowStockThreshold;

  const quickWhatsAppMessage = `Bonjour CongoMed, je souhaite commander le produit suivant :
• Réf : ${product.reference}
• Désignation : ${product.name}
• Prix : ${formatFCFA(product.price)}
• Quantité souhaitée : 1 unité/boîte.
Pouvez-vous me confirmer la disponibilité et le délai ?`;

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 hover:border-sky-300 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group">
      {/* Top Image area */}
      <div
        className="relative aspect-4/3 bg-slate-100 overflow-hidden cursor-pointer"
        onClick={() => onOpenDetail(product)}
      >
        <img
          src={
            product.images[0] ||
            'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
          }
          alt={product.name}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-500"
          loading="lazy"
        />

        {/* Badges on image */}
        <div className="absolute top-2.5 left-2.5 flex flex-col gap-1 items-start">
          <span className="px-2 py-1 rounded-md text-[10px] font-mono font-bold bg-slate-900/85 text-white backdrop-blur-xs tracking-wider">
            {product.reference}
          </span>
          {product.isSterile && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-teal-600/90 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
              <Shield className="w-2.5 h-2.5" /> Stérile
            </span>
          )}
          {product.featured && (
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-500/90 text-white backdrop-blur-xs flex items-center gap-1 shadow-xs">
              <Sparkles className="w-2.5 h-2.5" /> Recommandé
            </span>
          )}
        </div>

        {/* Stock status indicator badge */}
        <div className="absolute top-2.5 right-2.5">
          {isOutOfStock ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-500/95 text-white flex items-center gap-1 shadow-sm backdrop-blur-xs">
              <XCircle className="w-3 h-3" /> Rupture
            </span>
          ) : isLowStock ? (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-amber-500/95 text-white flex items-center gap-1 shadow-sm backdrop-blur-xs">
              <AlertTriangle className="w-3 h-3" /> Reste {product.stockQuantity}
            </span>
          ) : (
            <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-600/95 text-white flex items-center gap-1 shadow-sm backdrop-blur-xs">
              <CheckCircle2 className="w-3 h-3" /> En stock ({product.stockQuantity})
            </span>
          )}
        </div>

        {/* Quick view overlay hover icon */}
        <div className="absolute inset-0 bg-slate-900/30 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onOpenDetail(product);
            }}
            className="px-3.5 py-2 rounded-xl bg-white/95 text-slate-900 font-bold text-xs shadow-lg flex items-center gap-1.5 hover:bg-white transform -translate-y-2 group-hover:translate-y-0 transition-transform cursor-pointer"
          >
            <Eye className="w-3.5 h-3.5 text-sky-600" />
            <span>Fiche technique</span>
          </button>
        </div>
      </div>

      {/* Content body */}
      <div className="p-4 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Brand */}
          <div className="flex items-center justify-between gap-2 text-xs text-slate-500 mb-1.5">
            <span className="font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded text-[11px] truncate">
              {product.category}
            </span>
            <span className="text-[11px] font-bold text-slate-600 shrink-0">
              {product.brand}
            </span>
          </div>

          {/* Product Name */}
          <h3
            className="font-extrabold text-sm text-slate-900 line-clamp-2 group-hover:text-sky-600 transition-colors cursor-pointer"
            onClick={() => onOpenDetail(product)}
            title={product.name}
          >
            {product.name}
          </h3>

          {/* Packaging preview if available */}
          {product.packaging && (
            <p className="text-[11px] text-slate-500 mt-1 flex items-center gap-1 line-clamp-1">
              <Tag className="w-3 h-3 text-slate-400 shrink-0" />
              <span>{product.packaging}</span>
            </p>
          )}

          {/* Description snippet */}
          <p className="text-xs text-slate-600 mt-1.5 line-clamp-2 leading-relaxed">
            {product.description}
          </p>
        </div>

        {/* Price & Purchase controls */}
        <div className="mt-4 pt-3 border-t border-slate-100">
          <div className="flex items-baseline justify-between mb-3">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 block">
                Prix unitaire HT
              </span>
              <span className="text-lg font-extrabold text-slate-900">
                {formatFCFA(product.price)}
              </span>
            </div>
            {product.certification && (
              <span className="text-[10px] font-bold text-slate-500 border border-slate-200 px-1.5 py-0.5 rounded bg-slate-50">
                {product.certification.split('/')[0].trim()}
              </span>
            )}
          </div>

          <div className="grid grid-cols-2 gap-2">
            <button
              onClick={() => addToCart(product, 1)}
              disabled={isOutOfStock}
              className={`py-2 px-2.5 rounded-xl font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                isOutOfStock
                  ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                  : 'bg-sky-600 hover:bg-sky-700 active:scale-95 text-white shadow-xs shadow-sky-600/20'
              }`}
            >
              <ShoppingCart className="w-3.5 h-3.5" />
              <span>{isOutOfStock ? 'Épuisé' : 'Ajouter'}</span>
            </button>

            <a
              href={`https://wa.me/${settings.whatsappRaw}?text=${encodeURIComponent(quickWhatsAppMessage)}`}
              target="_blank"
              rel="noreferrer"
              className="py-2 px-2 rounded-xl font-bold text-xs bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 flex items-center justify-center gap-1 transition-colors"
              title="Commander rapidement ce produit sur WhatsApp"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>WhatsApp</span>
            </a>
          </div>

          {/* ADMIN ONLY CONTROLS: Show modify / delete buttons ONLY when logged in as admin */}
          {isAdmin && (
            <div className="mt-3 pt-2.5 border-t border-dashed border-slate-200 flex items-center justify-between text-xs bg-amber-50/70 -mx-4 -mb-4 px-4 py-2">
              <span className="text-[10px] font-bold text-amber-900 font-mono">
                Admin :
              </span>
              <div className="flex items-center gap-1.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (onEditProduct) {
                      onEditProduct(product);
                    } else {
                      onOpenDetail(product);
                    }
                  }}
                  className="px-2 py-1 rounded-md bg-white hover:bg-sky-50 text-sky-700 hover:text-sky-800 border border-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Modifier ce produit (Admin)"
                >
                  <Edit2 className="w-3 h-3" />
                  <span>Modifier</span>
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (
                      confirm(
                        `Confirmez-vous la suppression définitive du produit "${product.name}" ?`
                      )
                    ) {
                      deleteProduct(product.id);
                    }
                  }}
                  className="px-2 py-1 rounded-md bg-white hover:bg-rose-50 text-rose-600 hover:text-rose-700 border border-slate-200 text-[11px] font-bold flex items-center gap-1 cursor-pointer transition-colors shadow-2xs"
                  title="Supprimer ce produit (Admin)"
                >
                  <Trash2 className="w-3 h-3" />
                  <span>Supprimer</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
