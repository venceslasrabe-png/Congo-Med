import React, { useState } from 'react';
import {
  X,
  Phone,
  Mail,
  User,
  Building,
  MapPin,
  Truck,
  CheckCircle2,
  FileText,
  AlertCircle,
  ShieldCheck,
  Building2,
  ArrowRight,
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useStore } from '../context/StoreContext';
import { CustomerInfo, Order } from '../types';
import { formatFCFA } from '../utils/format';

interface CheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  orderType: 'order' | 'quote';
  onOrderSuccess: (order: Order) => void;
}

export const CheckoutModal: React.FC<CheckoutModalProps> = ({
  isOpen,
  onClose,
  orderType,
  onOrderSuccess,
}) => {
  const { cart, cartTotal, createOrder, settings } = useStore();

  const [formData, setFormData] = useState<CustomerInfo>({
    fullName: '',
    phone: '',
    email: '',
    establishmentType: 'Clinique privée',
    establishmentName: '',
    address: '',
    city: 'Brazzaville',
    deliveryNotes: '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.fullName.trim()) {
      setErrorMsg('Veuillez renseigner votre Nom et Prénom.');
      return;
    }

    if (!formData.phone.trim()) {
      setErrorMsg('Veuillez renseigner un numéro de Téléphone / WhatsApp valide.');
      return;
    }

    if (!formData.address.trim()) {
      setErrorMsg('Veuillez préciser une adresse de livraison.');
      return;
    }

    setIsSubmitting(true);

    try {
      const newOrder = createOrder(formData, orderType);

      // Trigger celebration confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 },
        });
      } catch (err) {
        console.error(err);
      }

      setIsSubmitting(false);
      onOrderSuccess(newOrder);
      onClose();
    } catch (err: any) {
      setIsSubmitting(false);
      setErrorMsg(err?.message || 'Une erreur est survenue lors de la validation.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 no-print">
      <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
        {/* Header */}
        <div className="p-5 sm:p-6 bg-gradient-to-r from-sky-700 to-teal-700 text-white flex items-center justify-between">
          <div>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-white/20 text-white border border-white/30 uppercase tracking-wider">
              {orderType === 'quote' ? 'Demande de Devis Proforma' : 'Finalisation de la Commande'}
            </span>
            <h3 className="text-xl font-extrabold mt-1 text-white">
              Coordonnées & Livraison
            </h3>
            <p className="text-xs text-sky-100">
              Ces informations figureront sur votre bon de commande et seront transmises au gestionnaire.
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content & Form */}
        <form onSubmit={handleSubmit} className="p-5 sm:p-6 space-y-5 max-h-[80vh] overflow-y-auto">
          {errorMsg && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-xl text-xs text-rose-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Order items summary preview */}
          <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs">
            <div className="flex justify-between items-center font-bold text-slate-800 mb-2">
              <span>Articles sélectionnés ({cart.length}) :</span>
              <span className="text-sky-700 text-sm font-extrabold">{formatFCFA(cartTotal)}</span>
            </div>
            <div className="max-h-24 overflow-y-auto divide-y divide-slate-200/60 text-slate-600 pr-1">
              {cart.map((item) => (
                <div key={item.product.id} className="py-1 flex justify-between items-center text-[11px]">
                  <span className="truncate max-w-[280px]">
                    <strong>{item.quantity}x</strong> {item.product.name}
                  </span>
                  <span className="font-semibold text-slate-800 shrink-0">
                    {formatFCFA(item.product.price * item.quantity)}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Identity inputs */}
          <div className="space-y-4">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-sky-600" />
              <span>1. Contact Responsable</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom & Prénom <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) =>
                    setFormData({ ...formData, fullName: e.target.value })
                  }
                  placeholder="Ex: Dr. Jean Makosso"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-hidden"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Téléphone / WhatsApp <span className="text-rose-500">*</span>
                </label>
                <div className="relative">
                  <Phone className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="tel"
                    required
                    value={formData.phone}
                    onChange={(e) =>
                      setFormData({ ...formData, phone: e.target.value })
                    }
                    placeholder="+242 06 XXX XX XX"
                    className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-hidden"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Adresse e-mail (Optionnel pour réception facture PDF)
              </label>
              <div className="relative">
                <Mail className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="contact@clinique-exemple.cg"
                  className="w-full pl-9 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Establishment info */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-sky-600" />
              <span>2. Établissement de Santé</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Type de structure
                </label>
                <select
                  value={formData.establishmentType}
                  onChange={(e) =>
                    setFormData({ ...formData, establishmentType: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-hidden"
                >
                  <option value="Hôpital public / CHU">Hôpital public / CHU</option>
                  <option value="Clinique privée">Clinique privée</option>
                  <option value="Cabinet médical / Dentaire">Cabinet médical / Dentaire</option>
                  <option value="Pharmacie d’officine">Pharmacie d’officine</option>
                  <option value="Laboratoire d'analyses">Laboratoire d'analyses</option>
                  <option value="ONG / Mission humanitaire">ONG / Mission humanitaire</option>
                  <option value="Particulier / Soins à domicile">Particulier / Soins à domicile</option>
                  <option value="Autre structure">Autre structure</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Nom de l'établissement
                </label>
                <input
                  type="text"
                  value={formData.establishmentName}
                  onChange={(e) =>
                    setFormData({ ...formData, establishmentName: e.target.value })
                  }
                  placeholder="Ex: Clinique Saint-Joseph, Hôpital de Loandjili..."
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-hidden"
                />
              </div>
            </div>
          </div>

          {/* Delivery destination */}
          <div className="space-y-4 pt-2 border-t border-slate-100">
            <h4 className="text-xs font-bold uppercase text-slate-500 tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-sky-600" />
              <span>3. Adresse & Modalités de Livraison</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Ville <span className="text-rose-500">*</span>
                </label>
                <select
                  value={formData.city}
                  onChange={(e) =>
                    setFormData({ ...formData, city: e.target.value })
                  }
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-hidden"
                >
                  <option value="Brazzaville">Brazzaville</option>
                  <option value="Pointe-Noire">Pointe-Noire</option>
                  <option value="Dolisie">Dolisie</option>
                  <option value="Nkayi">Nkayi</option>
                  <option value="Oyo">Oyo</option>
                  <option value="Autre localité (Congo)">Autre localité (Congo)</option>
                </select>
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse complète / Quartier / Repère <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={formData.address}
                  onChange={(e) =>
                    setFormData({ ...formData, address: e.target.value })
                  }
                  placeholder="Ex: Bacongo, Rue Mbochis N°14 près de la pharmacie"
                  className="w-full px-3.5 py-2.5 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-hidden"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1">
                Instructions particulières de livraison (Optionnel)
              </label>
              <textarea
                rows={2}
                value={formData.deliveryNotes}
                onChange={(e) =>
                  setFormData({ ...formData, deliveryNotes: e.target.value })
                }
                placeholder="Ex: Livrer directement au service de chirurgie / pharmacie centrale entre 9h et 16h..."
                className="w-full px-3.5 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs sm:text-sm focus:bg-white focus:border-sky-500 focus:ring-2 focus:ring-sky-100 outline-hidden"
              />
            </div>
          </div>

          {/* Payment & WhatsApp transmission guarantee */}
          <div className="p-3.5 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-900 space-y-1">
            <p className="font-bold flex items-center gap-1.5">
              <Phone className="w-4 h-4 text-emerald-700" />
              Transmission immédiate à l'administrateur ({settings.whatsappNumber})
            </p>
            <p className="text-[11px] text-emerald-800">
              Dès validation, votre facture proforma / bon de commande sera généré avec numéro officiel et prêt à être envoyé d’un simple clic sur WhatsApp.
            </p>
          </div>

          {/* Submit CTA */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 px-6 rounded-xl bg-gradient-to-r from-sky-600 to-teal-600 hover:from-sky-700 hover:to-teal-700 text-white font-extrabold text-sm shadow-lg shadow-sky-600/25 flex items-center justify-center gap-2 cursor-pointer transition-all disabled:opacity-50"
            >
              <span>
                {orderType === 'quote'
                  ? 'Générer le Devis & Envoyer par WhatsApp'
                  : `Valider la Commande (${formatFCFA(cartTotal)})`}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
