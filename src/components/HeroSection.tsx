import React from 'react';
import {
  ShieldCheck,
  Truck,
  FileCheck2,
  Phone,
  Sparkles,
  ArrowRight,
  PackageCheck,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface HeroSectionProps {
  onExploreCatalog: () => void;
  onRequestQuote: () => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  onExploreCatalog,
  onRequestQuote,
}) => {
  const { settings } = useStore();

  return (
    <div className="relative bg-gradient-to-b from-sky-900 via-slate-900 to-slate-900 text-white overflow-hidden no-print">
      {/* Subtle decorative background grid */}
      <div className="absolute inset-0 opacity-10 bg-[linear-gradient(to_right,#38bdf8_1px,transparent_1px),linear-gradient(to_bottom,#38bdf8_1px,transparent_1px)] bg-[size:4rem_4rem]"></div>
      
      {/* Radial soft glow */}
      <div className="absolute -top-40 -right-40 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-20 -left-20 w-80 h-80 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>

      <div className="relative max-w-7xl mx-auto px-4 pt-10 pb-14 md:pt-14 md:pb-18">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          {/* Left Text Content */}
          <div className="lg:col-span-7 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-sky-500/15 border border-sky-400/30 text-sky-300 text-xs font-semibold backdrop-blur-xs">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Fournisseur biomédical de référence en République du Congo</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-extrabold tracking-tight leading-[1.15]">
              Fournitures Médicales, Consommables & Matériel{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
                Chirurgical de Précision
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-2xl">
              Approvisionnez vos hôpitaux, cliniques, cabinets et pharmacies en dispositifs médicaux certifiés.
              Constituez votre panier, téléchargez vos <strong className="text-white">factures proforma & devis</strong> et transmettez instantanément vos commandes à notre équipe via <strong className="text-emerald-400">WhatsApp</strong>.
            </p>

            {/* CTAs */}
            <div className="flex flex-wrap items-center gap-3 pt-2">
              <button
                onClick={onExploreCatalog}
                className="px-6 py-3.5 rounded-xl bg-gradient-to-r from-sky-500 to-teal-500 hover:from-sky-600 hover:to-teal-600 text-white font-bold text-sm shadow-lg shadow-sky-500/25 transition-all transform hover:-translate-y-0.5 cursor-pointer flex items-center gap-2"
              >
                <span>Explorer le Catalogue</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              <a
                href={`https://wa.me/${settings.whatsappRaw}?text=${encodeURIComponent('Bonjour, je souhaite transmettre une commande / demande de cotation urgente pour notre établissement.')}`}
                target="_blank"
                rel="noreferrer"
                className="px-6 py-3.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-sm shadow-lg shadow-emerald-600/25 transition-all transform hover:-translate-y-0.5 flex items-center gap-2"
              >
                <Phone className="w-4 h-4 text-emerald-100" />
                <span>WhatsApp : {settings.whatsappNumber}</span>
              </a>
            </div>

            {/* Value checklist */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-800 text-xs text-slate-300">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Normes CE & ISO 13485</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Facture & Bon de commande PDF</span>
              </div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                <span>Livraison Congo rapide</span>
              </div>
            </div>
          </div>

          {/* Right Feature Card */}
          <div className="lg:col-span-5">
            <div className="bg-slate-800/80 backdrop-blur-md border border-slate-700/80 rounded-2xl p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-700 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></div>
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-300">
                    Processus de Commande Simplifié
                  </span>
                </div>
                <span className="text-xs text-sky-400 font-semibold">100% Transparent</span>
              </div>

              <div className="space-y-3">
                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Sélectionnez vos produits</h4>
                    <p className="text-[11px] text-slate-400">Consommables, sets chirurgicaux, diagnostic et respiratoire en FCFA.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="w-7 h-7 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">Renseignez votre établissement</h4>
                    <p className="text-[11px] text-slate-400">Nom clinique/hôpital, adresse de livraison et contact WhatsApp.</p>
                  </div>
                </div>

                <div className="flex items-start gap-3 p-2.5 rounded-xl bg-emerald-500/10 border border-emerald-500/20">
                  <div className="w-7 h-7 rounded-lg bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold text-xs shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-emerald-300">Validation & Envoi WhatsApp instantané</h4>
                    <p className="text-[11px] text-emerald-200/80">
                      Génération automatique du bon de commande et transmission directe au <strong>{settings.whatsappNumber}</strong>.
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-2 text-center">
                <p className="text-[11px] text-slate-400">
                  Besoin d’un devis institutionnel pour appel d'offres ?{' '}
                  <button
                    onClick={onRequestQuote}
                    className="text-sky-400 font-semibold underline hover:text-sky-300 ml-1 cursor-pointer"
                  >
                    Demander une proforma ici
                  </button>
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
