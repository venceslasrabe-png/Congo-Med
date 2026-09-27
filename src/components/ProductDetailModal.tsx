import React, { useState } from 'react';
import {
  X,
  ShoppingCart,
  Phone,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Truck,
  Building2,
  FileCheck2,
  Minus,
  Plus,
  Share2,
} from 'lucide-react';
import { Product } from '../types';
import { useStore } from '../context/StoreContext';
import { formatFCFA } from '../utils/format';

interface ProductDetailModalProps {
  product: Product | null;
  onClose: () => void;
  onOpenCart: () => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({
  product,
  onClose,
  onOpenCart,
}) => {
  const { addToCart, settings } = useStore();
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [copied, setCopied] = useState(false);

  if (!product) return null;

  const isOutOfStock = product.stockQuantity <= 0;
  const isLowStock =
    product.stockQuantity > 0 &&
    product.stockQuantity <= product.lowStockThreshold;

  const handleAddToCart = () => {
    addToCart(product, quantity);
    onClose();
    onOpenCart();
  };

  const handleShare = () => {
    navigator.clipboard?.writeText(window.location.href);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const whatsAppDirectMessage = `Bonjour CongoMed,
Je souhaite passer commande pour :
• Désignation : *${product.name}*
• Référence : *${product.reference}*
• Marque : *${product.brand}*
• Quantité souhaitée : *${quantity}*
• Prix unitaire : *${formatFCFA(product.price)}*
• Total estimé : *${formatFCFA(product.price * quantity)}*

Pouvez-vous me confirmer la disponibilité et le délai de livraison sur Brazzaville / Pointe-Noire ? Merci.`;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 no-print">
      <div className="relative w-full max-w-4xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-10 p-2.5 rounded-full bg-white/90 hover:bg-slate-100 text-slate-700 shadow-md border border-slate-200 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-12 max-h-[90vh] overflow-y-auto">
          {/* Left Column: Images */}
          <div className="md:col-span-6 p-6 bg-slate-50 flex flex-col justify-between border-b md:border-b-0 md:border-r border-slate-200">
            <div>
              {/* Main Image */}
              <div className="relative aspect-4/3 rounded-2xl overflow-hidden bg-white border border-slate-200 shadow-xs mb-3">
                <img
                  src={
                    product.images[selectedImageIndex] ||
                    product.images[0] ||
                    'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'
                  }
                  alt={product.name}
                  className="w-full h-full object-cover object-center"
                />

                {/* Badges on main image */}
                <div className="absolute top-3 left-3 flex flex-col gap-1.5">
                  <span className="px-2.5 py-1 rounded-md text-xs font-mono font-bold bg-slate-900 text-white shadow-xs">
                    {product.reference}
                  </span>
                  {product.isSterile && (
                    <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-teal-600 text-white shadow-xs">
                      Stérilité Garantie
                    </span>
                  )}
                </div>
              </div>

              {/* Thumbnails if multiple images */}
              {product.images.length > 1 && (
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {product.images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSelectedImageIndex(idx)}
                      className={`w-16 h-16 rounded-xl overflow-hidden border-2 shrink-0 transition-all cursor-pointer ${
                        selectedImageIndex === idx
                          ? 'border-sky-600 ring-2 ring-sky-600/20'
                          : 'border-slate-200 opacity-70 hover:opacity-100'
                      }`}
                    >
                      <img
                        src={img}
                        alt={`Aperçu ${idx + 1}`}
                        className="w-full h-full object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Medical Guarantee Callout */}
            <div className="mt-4 p-3.5 bg-sky-50/70 rounded-2xl border border-sky-100 text-xs text-sky-900 space-y-2">
              <div className="flex items-center gap-2 font-bold text-sky-800">
                <ShieldCheck className="w-4 h-4 text-sky-600" />
                <span>Garantie de Traçabilité Médicale</span>
              </div>
              <p className="text-[11px] text-sky-700 leading-relaxed">
                Chaque lot est vérifié pour sa conformité aux standards hospitaliers internationaux (CE, ISO, Pharmacopée). Certificat d'analyse ou de stérilisation disponible sur demande.
              </p>
            </div>
          </div>

          {/* Right Column: Details & Ordering */}
          <div className="md:col-span-6 p-6 flex flex-col justify-between space-y-6">
            <div className="space-y-4">
              {/* Category, Brand, Certifications */}
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-sky-100 text-sky-800">
                  {product.category}
                </span>
                <span className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                  Marque : <strong className="text-slate-800">{product.brand}</strong>
                </span>
              </div>

              {/* Name */}
              <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 leading-tight">
                {product.name}
              </h2>

              {/* Stock Status Badge */}
              <div className="flex items-center gap-3">
                {isOutOfStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-rose-100 text-rose-800 border border-rose-200">
                    <XCircle className="w-3.5 h-3.5 text-rose-600" />
                    Rupture temporaire de stock
                  </span>
                ) : isLowStock ? (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-200">
                    <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                    Stock limité : {product.stockQuantity} unités disponibles
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    En stock ({product.stockQuantity} disponibles)
                  </span>
                )}

                {product.packaging && (
                  <span className="text-xs text-slate-500 font-medium">
                    Cond. : {product.packaging}
                  </span>
                )}
              </div>

              {/* Price Banner */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-baseline justify-between">
                <div>
                  <span className="text-xs font-semibold text-slate-500 uppercase block">
                    Tarif Hôpital / Client (TTC)
                  </span>
                  <div className="text-3xl font-extrabold text-slate-900">
                    {formatFCFA(product.price)}
                  </div>
                </div>
                {product.certification && (
                  <div className="text-right">
                    <span className="text-[10px] font-bold text-slate-400 block uppercase">
                      Agrément
                    </span>
                    <span className="text-xs font-bold text-slate-700">
                      {product.certification}
                    </span>
                  </div>
                )}
              </div>

              {/* Description */}
              <div>
                <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-1">
                  Description clinique
                </h4>
                <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                  {product.description}
                </p>
              </div>

              {/* Technical specs table */}
              {product.technicalSpecs && product.technicalSpecs.length > 0 && (
                <div>
                  <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider mb-2">
                    Caractéristiques techniques & Spécifications
                  </h4>
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 text-xs">
                    {product.technicalSpecs.map((spec, i) => (
                      <div
                        key={i}
                        className={`flex justify-between px-3 py-2 ${
                          i % 2 === 0 ? 'bg-slate-50/70' : 'bg-white'
                        }`}
                      >
                        <span className="font-semibold text-slate-600">
                          {spec.label}
                        </span>
                        <span className="font-medium text-slate-900 text-right">
                          {spec.value}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Actions: Quantity + Add to Cart + WhatsApp */}
            <div className="pt-4 border-t border-slate-200 space-y-3">
              {/* Quantity selector */}
              {!isOutOfStock && (
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    Quantité souhaitée :
                  </span>
                  <div className="flex items-center border border-slate-300 rounded-xl overflow-hidden bg-white shadow-xs">
                    <button
                      onClick={() => setQuantity(Math.max(1, quantity - 1))}
                      disabled={quantity <= 1}
                      className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    >
                      <Minus className="w-4 h-4" />
                    </button>
                    <span className="w-12 text-center text-sm font-bold text-slate-800">
                      {quantity}
                    </span>
                    <button
                      onClick={() =>
                        setQuantity(
                          Math.min(product.stockQuantity || 99, quantity + 1)
                        )
                      }
                      disabled={quantity >= (product.stockQuantity || 99)}
                      className="p-2 text-slate-600 hover:bg-slate-100 disabled:opacity-30 cursor-pointer"
                    >
                      <Plus className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              )}

              {/* Main buttons */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                <button
                  onClick={handleAddToCart}
                  disabled={isOutOfStock}
                  className={`py-3 px-4 rounded-xl font-bold text-xs sm:text-sm flex items-center justify-center gap-2 transition-all cursor-pointer ${
                    isOutOfStock
                      ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                      : 'bg-sky-600 hover:bg-sky-700 active:scale-95 text-white shadow-lg shadow-sky-600/25'
                  }`}
                >
                  <ShoppingCart className="w-4 h-4" />
                  <span>
                    {isOutOfStock ? 'Rupture de stock' : `Ajouter au Panier (${formatFCFA(product.price * quantity)})`}
                  </span>
                </button>

                <a
                  href={`https://wa.me/${settings.whatsappRaw}?text=${encodeURIComponent(whatsAppDirectMessage)}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-3 px-4 rounded-xl font-bold text-xs sm:text-sm bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/25 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>Commander WhatsApp</span>
                </a>
              </div>

              <div className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                <span className="flex items-center gap-1">
                  <Truck className="w-3.5 h-3.5 text-slate-500" />
                  Expédition rapide Brazza & Pointe-Noire
                </span>
                <button
                  onClick={handleShare}
                  className="flex items-center gap-1 hover:text-slate-600 cursor-pointer"
                >
                  <Share2 className="w-3 h-3" />
                  <span>{copied ? 'Lien copié !' : 'Partager'}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
