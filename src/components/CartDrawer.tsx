import React from 'react';
import {
  X,
  Trash2,
  Plus,
  Minus,
  ShoppingCart,
  ArrowRight,
  ShieldCheck,
  FileSpreadsheet,
  AlertCircle,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';
import { formatFCFA } from '../utils/format';

interface CartDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  onProceedToCheckout: (orderType: 'order' | 'quote') => void;
}

export const CartDrawer: React.FC<CartDrawerProps> = ({
  isOpen,
  onClose,
  onProceedToCheckout,
}) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart, cartTotal, cartCount } =
    useStore();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden no-print">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-xs transition-opacity"
        onClick={onClose}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 sm:p-5 border-b border-slate-200 bg-slate-50 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <div className="p-2 rounded-xl bg-sky-100 text-sky-700">
                <ShoppingCart className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-slate-900 text-base">
                  Votre Panier Médical
                </h3>
                <p className="text-xs text-slate-500">
                  {cartCount} article{cartCount > 1 ? 's' : ''} sélectionné{cartCount > 1 ? 's' : ''}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {cart.length > 0 && (
                <button
                  onClick={clearCart}
                  className="text-xs text-rose-600 hover:text-rose-700 hover:underline p-1 font-semibold cursor-pointer"
                  title="Vider le panier"
                >
                  Vider
                </button>
              )}
              <button
                onClick={onClose}
                className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-200 transition-colors cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Cart Items List */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-5 space-y-4">
            {cart.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center">
                  <ShoppingCart className="w-8 h-8" />
                </div>
                <h4 className="font-bold text-slate-800 text-base">
                  Votre panier est vide
                </h4>
                <p className="text-xs text-slate-500 max-w-xs">
                  Sélectionnez des fournitures ou équipements dans le catalogue pour constituer votre commande ou demande de devis.
                </p>
                <button
                  onClick={onClose}
                  className="mt-3 px-5 py-2.5 rounded-xl bg-sky-600 text-white font-bold text-xs shadow-md shadow-sky-600/20 hover:bg-sky-700 cursor-pointer"
                >
                  Parcourir les produits
                </button>
              </div>
            ) : (
              cart.map((item) => {
                const maxStock = item.product.stockQuantity || 1;
                return (
                  <div
                    key={item.product.id}
                    className="flex gap-3.5 p-3 rounded-2xl border border-slate-200 hover:border-slate-300 bg-white transition-all shadow-2xs"
                  >
                    {/* Item Image */}
                    <img
                      src={
                        item.product.images[0] ||
                        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=400&q=80'
                      }
                      alt={item.product.name}
                      className="w-20 h-20 rounded-xl object-cover border border-slate-100 shrink-0 bg-slate-50"
                    />

                    {/* Item Details */}
                    <div className="flex-1 flex flex-col justify-between min-w-0">
                      <div>
                        <div className="flex items-start justify-between gap-1">
                          <span className="text-[10px] font-mono font-bold text-slate-500 bg-slate-100 px-1.5 py-0.5 rounded">
                            {item.product.reference}
                          </span>
                          <button
                            onClick={() => removeFromCart(item.product.id)}
                            className="text-slate-400 hover:text-rose-600 p-0.5 transition-colors cursor-pointer"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <h4 className="font-bold text-xs text-slate-900 mt-1 line-clamp-2 leading-snug">
                          {item.product.name}
                        </h4>
                        <p className="text-[11px] text-slate-500 mt-0.5">
                          {formatFCFA(item.product.price)} / unité
                        </p>
                      </div>

                      {/* Quantity & Item Subtotal */}
                      <div className="flex items-center justify-between pt-2 border-t border-slate-100">
                        {/* Stepper */}
                        <div className="flex items-center border border-slate-200 rounded-lg bg-slate-50">
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                item.quantity - 1
                              )
                            }
                            className="p-1 hover:bg-slate-200 text-slate-600 rounded-l cursor-pointer"
                          >
                            <Minus className="w-3 h-3" />
                          </button>
                          <span className="w-7 text-center text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              updateCartQuantity(
                                item.product.id,
                                Math.min(maxStock, item.quantity + 1)
                              )
                            }
                            disabled={item.quantity >= maxStock}
                            className="p-1 hover:bg-slate-200 text-slate-600 rounded-r disabled:opacity-30 cursor-pointer"
                          >
                            <Plus className="w-3 h-3" />
                          </button>
                        </div>

                        {/* Total line */}
                        <span className="text-xs font-extrabold text-slate-900">
                          {formatFCFA(item.product.price * item.quantity)}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Footer with Subtotals & Checkout CTA */}
          {cart.length > 0 && (
            <div className="p-4 sm:p-5 border-t border-slate-200 bg-slate-50 space-y-3">
              <div className="space-y-1.5 text-xs">
                <div className="flex justify-between text-slate-600">
                  <span>Sous-total articles :</span>
                  <span className="font-semibold text-slate-800">
                    {formatFCFA(cartTotal)}
                  </span>
                </div>
                <div className="flex justify-between text-slate-600">
                  <span>Frais de livraison (Congo) :</span>
                  <span className="font-semibold text-emerald-700">
                    Calculé selon adresse (Brazza / PN)
                  </span>
                </div>
                <div className="flex justify-between text-sm font-extrabold text-slate-900 pt-2 border-t border-slate-200">
                  <span>Total estimé :</span>
                  <span className="text-sky-700 text-base">
                    {formatFCFA(cartTotal)}
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-2 pt-1">
                <button
                  onClick={() => {
                    onClose();
                    onProceedToCheckout('order');
                  }}
                  className="w-full py-3 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-98 text-white font-bold text-xs sm:text-sm shadow-md shadow-sky-600/20 flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <span>Valider la commande</span>
                  <ArrowRight className="w-4 h-4" />
                </button>

                <button
                  onClick={() => {
                    onClose();
                    onProceedToCheckout('quote');
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-white hover:bg-slate-100 text-slate-700 border border-slate-300 font-bold text-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
                >
                  <FileSpreadsheet className="w-3.5 h-3.5 text-slate-500" />
                  <span>Demander un devis proforma officiel</span>
                </button>
              </div>

              <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-500 pt-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Validation sécurisée avec envoi WhatsApp au +242 05 059 95 60</span>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
