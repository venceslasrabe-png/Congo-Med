import React, { useState } from 'react';
import { Phone, MessageCircle, X } from 'lucide-react';
import { useStore } from '../context/StoreContext';

export const FloatingWhatsApp: React.FC = () => {
  const { settings } = useStore();
  const [showTooltip, setShowTooltip] = useState(true);

  const directUrl = `https://wa.me/${settings.whatsappRaw}?text=${encodeURIComponent('Bonjour CongoMed, j’aimerais poser une question sur vos fournitures médicales ou vérifier la disponibilité d’un produit.')}`;

  return (
    <div className="fixed bottom-6 right-6 z-40 flex flex-col items-end gap-2 no-print">
      {/* Tooltip bubble */}
      {showTooltip && (
        <div className="bg-white rounded-2xl p-3 shadow-xl border border-slate-200 max-w-xs text-xs animate-in slide-in-from-bottom-2 fade-in relative">
          <button
            onClick={() => setShowTooltip(false)}
            className="absolute -top-1.5 -left-1.5 p-1 bg-slate-100 hover:bg-slate-200 rounded-full text-slate-500 shadow-xs"
            title="Fermer l'infobulle"
          >
            <X className="w-3 h-3" />
          </button>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="font-extrabold text-slate-900">
              Besoin d'un devis urgent ?
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            Échangez directement avec notre pharmacien & logisticien médical au{' '}
            <strong className="text-emerald-700">{settings.whatsappNumber}</strong>.
          </p>
        </div>
      )}

      {/* Floating button */}
      <a
        href={directUrl}
        target="_blank"
        rel="noreferrer"
        className="group relative flex items-center justify-center w-14 h-14 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white shadow-xl shadow-emerald-600/30 hover:shadow-emerald-600/50 hover:scale-105 active:scale-95 transition-all duration-300"
        title={`Discuter sur WhatsApp : ${settings.whatsappNumber}`}
      >
        <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-300 opacity-75"></span>
          <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-400 border-2 border-white"></span>
        </span>
        <Phone className="w-6 h-6 animate-pulse" />
      </a>
    </div>
  );
};
