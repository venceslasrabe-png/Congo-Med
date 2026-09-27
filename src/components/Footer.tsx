import React from 'react';
import {
  ShieldCheck,
  Phone,
  Mail,
  MapPin,
  Clock,
  Lock,
  Heart,
  FileCheck2,
  CheckCircle2,
} from 'lucide-react';
import { useStore } from '../context/StoreContext';

interface FooterProps {
  onOpenAdmin: () => void;
  onSelectCategory: (cat: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  onOpenAdmin,
  onSelectCategory,
}) => {
  const { settings, categories } = useStore();

  return (
    <footer className="bg-slate-900 text-slate-300 pt-12 pb-8 border-t border-slate-800 no-print">
      <div className="max-w-7xl mx-auto px-4 space-y-10">
        {/* Main Columns */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-8">
          {/* Col 1: Brand & Mission */}
          <div className="lg:col-span-4 space-y-4">
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-sky-500 to-teal-500 flex items-center justify-center text-white shadow-md">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <span className="font-extrabold text-xl tracking-tight text-white">
                Congo<span className="text-sky-400">Med</span>
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Centrale d'achat et distributeur de dispositifs médicaux certifiés, consommables d'urgence et instrumentation chirurgicale de précision en République du Congo.
            </p>

            <div className="p-3 bg-slate-800/80 rounded-xl border border-slate-700/80 text-xs space-y-1">
              <p className="font-bold text-white flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Conformité Réglementaire
              </p>
              <p className="text-[11px] text-slate-400">
                Dispositifs conformes aux normes CE médical, ISO 13485 et Pharmacopée. Traçabilité des lots et fiches de données de sécurité garanties.
              </p>
            </div>
          </div>

          {/* Col 2: Categories */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider">
              Gammes & Spécialités
            </h4>
            <ul className="space-y-2 text-xs">
              {categories.map((c) => (
                <li key={c.id}>
                  <button
                    onClick={() => {
                      onSelectCategory(c.name);
                      window.scrollTo({ top: 380, behavior: 'smooth' });
                    }}
                    className="hover:text-sky-400 transition-colors text-slate-400 hover:underline cursor-pointer"
                  >
                    {c.name}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Col 3: Contacts & WhatsApp */}
          <div className="lg:col-span-3 space-y-3">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider">
              Service Client & Commandes
            </h4>
            <div className="space-y-2.5 text-xs text-slate-400">
              <div className="flex items-start gap-2">
                <Phone className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-white">WhatsApp & Urgences :</span>
                  <a
                    href={`https://wa.me/${settings.whatsappRaw}`}
                    target="_blank"
                    rel="noreferrer"
                    className="text-emerald-400 hover:underline font-mono text-sm font-bold"
                  >
                    {settings.whatsappNumber}
                  </a>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <Mail className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-white">Courriel Devis :</span>
                  <span>{settings.email}</span>
                </div>
              </div>

              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-sky-400 shrink-0 mt-0.5" />
                <div>
                  <span className="block font-bold text-white">Dépôt & Distribution :</span>
                  <span>{settings.address}, {settings.city}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Col 4: Zones de livraison & Admin */}
          <div className="lg:col-span-2 space-y-3">
            <h4 className="text-xs font-bold uppercase text-white tracking-wider">
              Zones Desservies
            </h4>
            <p className="text-xs text-slate-400 leading-relaxed">
              Expédition quotidienne vers :
            </p>
            <div className="flex flex-wrap gap-1.5 text-[11px]">
              {['Brazzaville', 'Pointe-Noire', 'Dolisie', 'Nkayi', 'Oyo', 'Kinkala'].map(
                (city) => (
                  <span
                    key={city}
                    className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded-md border border-slate-700"
                  >
                    {city}
                  </span>
                )
              )}
            </div>

            <div className="pt-3 border-t border-slate-800">
              <button
                onClick={onOpenAdmin}
                className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-white transition-colors cursor-pointer"
              >
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Accès Administrateur (venceslasrabe@gmail.com)</span>
              </button>
            </div>
          </div>
        </div>

        {/* Bottom Credits & Legal */}
        <div className="pt-8 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500">
          <div>
            © {new Date().getFullYear()} {settings.storeName}. Tous droits réservés.
            <span className="ml-2 text-[11px] font-mono text-slate-600">
              RCCM : {settings.rccm} | NIF : {settings.nif}
            </span>
          </div>

          <div className="flex items-center gap-4 text-[11px]">
            <span>Facturation Proforma & Bons de Commande Conformes</span>
            <span>•</span>
            <span className="text-emerald-400 font-medium">WhatsApp : {settings.whatsappNumber}</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
