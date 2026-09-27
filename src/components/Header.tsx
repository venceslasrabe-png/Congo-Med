import React, { useState } from 'react';
import {
  ShoppingCart,
  Phone,
  ShieldCheck,
  Search,
  SlidersHorizontal,
  Lock,
  Building2,
  CheckCircle2,
  Menu,
  X,
  FileText,
  UserCheck,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { useStore, ADMIN_EMAIL } from '../context/StoreContext';
import { formatFCFA } from '../utils/format';

interface HeaderProps {
  onOpenCart: () => void;
  onOpenAdmin: () => void;
  onOpenLoginModal: () => void;
  onOpenSearchGrounding?: () => void;
  onOpenAuthLanding?: () => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  selectedCategory: string;
  setSelectedCategory: (cat: string) => void;
  activeView: 'catalog' | 'admin';
  setActiveView: (view: 'catalog' | 'admin') => void;
}

export const Header: React.FC<HeaderProps> = ({
  onOpenCart,
  onOpenAdmin,
  onOpenLoginModal,
  onOpenSearchGrounding,
  onOpenAuthLanding,
  searchQuery,
  setSearchQuery,
  selectedCategory,
  setSelectedCategory,
  activeView,
  setActiveView,
}) => {
  const {
    cartCount,
    cartTotal,
    settings,
    categories,
    isAdmin,
    adminUser,
    firebaseUser,
    signInWithGoogleAuth,
    signInWithAppleAuth,
    signOutAuth,
    logoutAdmin,
  } = useStore();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs no-print">
      {/* Top emergency and notification bar */}
      <div className="bg-slate-900 text-slate-200 text-xs py-2 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-2">
          <div className="flex items-center gap-2 text-center md:text-left flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Service Médical Actif
            </span>
            <span className="hidden sm:inline text-slate-400">•</span>
            <span className="text-slate-300 text-xs">
              Livraison rapide hôpitaux & cliniques à <strong className="text-white">Brazzaville</strong>, <strong className="text-white">Pointe-Noire</strong> et intérieur du pays.
            </span>
          </div>

          <div className="flex items-center gap-3 sm:gap-4 text-slate-300 text-xs">
            <a
              href={`https://wa.me/${settings.whatsappRaw}?text=${encodeURIComponent('Bonjour CongoMed, j’ai une demande de renseignements concernant vos fournitures médicales.')}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-emerald-400 transition-colors font-medium text-emerald-300"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-400" />
              <span>WhatsApp : <strong>{settings.whatsappNumber}</strong></span>
            </a>

            <span className="hidden md:inline text-slate-600">|</span>

            {/* Admin status indicator & quick action */}
            {isAdmin ? (
              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    setActiveView('admin');
                    onOpenAdmin();
                  }}
                  className="inline-flex items-center gap-1.5 px-2 py-1 rounded-md bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30 transition-colors font-mono text-[11px]"
                  title={`Connecté : ${ADMIN_EMAIL}`}
                >
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="font-semibold truncate max-w-[140px]">{ADMIN_EMAIL}</span>
                </button>
                <button
                  onClick={logoutAdmin}
                  title="Basculer en mode client"
                  className="text-slate-400 hover:text-rose-300 p-1 transition-colors"
                >
                  <LogOut className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <button
                onClick={onOpenLoginModal}
                className="flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Connexion Admin</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main navigation */}
      <div className="max-w-7xl mx-auto px-4 py-3.5">
        <div className="flex items-center justify-between gap-4">
          {/* Logo */}
          <div
            className="flex items-center gap-3 cursor-pointer group"
            onClick={() => setActiveView('catalog')}
          >
            <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-sky-600 to-teal-500 flex items-center justify-center text-white shadow-md shadow-sky-500/20 group-hover:scale-105 transition-transform">
              <div className="relative">
                <ShieldCheck className="w-7 h-7" />
                <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
                </span>
              </div>
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="font-extrabold text-xl tracking-tight text-slate-900">
                  Congo<span className="text-sky-600">Med</span>
                </span>
                <span className="text-[10px] uppercase font-bold tracking-wider px-1.5 py-0.5 rounded bg-sky-50 text-sky-700 border border-sky-200">
                  Médical & Chirurgical
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium hidden sm:block">
                Fournitures & Dispositifs Médicaux Certifiés • Brazzaville
              </p>
            </div>
          </div>

          {/* Search bar */}
          <div className="hidden lg:flex flex-1 max-w-lg mx-4">
            <div className="relative w-full">
              <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Rechercher désignation, référence (ex: REF-CS-001), bistouri, gants, masque..."
                className="w-full pl-10 pr-10 py-2.5 bg-slate-50 hover:bg-white focus:bg-white border border-slate-200 focus:border-sky-500 focus:ring-2 focus:ring-sky-100 rounded-xl text-sm transition-all outline-hidden text-slate-800 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-1"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* View Mode Switcher: Visible EXCLUSIVELY for the authenticated admin */}
            {isAdmin && (
              <div className="hidden sm:flex bg-slate-100 p-1 rounded-xl border border-slate-200">
                <button
                  onClick={() => setActiveView('catalog')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeView === 'catalog'
                      ? 'bg-white text-sky-700 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  Catalogue
                </button>
                <button
                  onClick={() => {
                    setActiveView('admin');
                    onOpenAdmin();
                  }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                    activeView === 'admin'
                      ? 'bg-sky-600 text-white shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5 text-emerald-300" />
                  <span>Administration</span>
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                </button>
              </div>
            )}


            {/* Google Search Grounding: Live Medical & Regulatory Intelligence */}
            {onOpenSearchGrounding && (
              <button
                onClick={onOpenSearchGrounding}
                className="hidden md:flex items-center gap-1.5 px-3 py-2 rounded-xl bg-gradient-to-r from-sky-50 to-indigo-50 hover:from-sky-100 hover:to-indigo-100 text-sky-900 border border-sky-200 text-xs font-bold transition-all shadow-2xs cursor-pointer"
                title="Consulter l'Assistant Médical et Réglementaire avec Google Search Grounding"
              >
                <Sparkles className="w-3.5 h-3.5 text-sky-600 animate-pulse" />
                <span>Veille Médicale IA</span>
              </button>
            )}

            {/* Firebase Google Auth Button / User Profile */}
            {firebaseUser ? (
              <div className="flex items-center gap-2 pl-2 border-l border-slate-200">
                {firebaseUser.photoURL ? (
                  <img
                    src={firebaseUser.photoURL}
                    alt={firebaseUser.displayName || 'Utilisateur'}
                    className="w-7 h-7 rounded-full border border-sky-400"
                  />
                ) : (
                  <div className="w-7 h-7 rounded-full bg-sky-600 text-white flex items-center justify-center font-bold text-xs">
                    {(firebaseUser.displayName || firebaseUser.email || 'U')[0].toUpperCase()}
                  </div>
                )}
                <div className="hidden xl:block text-left text-[11px] leading-tight">
                  <span className="font-bold text-slate-800 block truncate max-w-[100px]">
                    {firebaseUser.displayName || firebaseUser.email?.split('@')[0]}
                  </span>
                  <button
                    onClick={signOutAuth}
                    className="text-slate-400 hover:text-rose-600 text-[10px] font-semibold"
                  >
                    Déconnexion
                  </button>
                </div>
              </div>
            ) : (
              <div className="hidden sm:flex items-center gap-1.5">
                <button
                  onClick={onOpenAuthLanding || signInWithGoogleAuth}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-white hover:bg-slate-50 border border-slate-300 text-slate-700 text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title="Créer un compte ou se connecter avec Google"
                >
                  <svg className="w-3.5 h-3.5 shrink-0" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.36 24 12 24z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                    />
                  </svg>
                  <span>Google</span>
                </button>

                <button
                  onClick={onOpenAuthLanding || signInWithAppleAuth}
                  className="flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-black hover:bg-zinc-800 text-white text-xs font-bold transition-all cursor-pointer shadow-2xs"
                  title="Créer un compte ou se connecter avec Apple"
                >
                  <svg className="w-3.5 h-3.5 fill-current shrink-0" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.05-7.7-7.85-12.01-14.4-5.35-8.18-9.59-17.65-12.74-28.43-3.14-10.78-4.71-21.2-4.71-31.25 0-14.54 3.73-26.68 11.19-36.43 7.46-9.75 16.92-14.73 28.37-14.94 4.58 0 9.77 1.25 15.58 3.76 5.81 2.5 9.7 3.82 11.66 3.96 1.77 0 5.86-1.39 12.28-4.17 6.42-2.78 12.06-4.04 16.93-3.77 13.06.66 23.49 5.56 31.3 14.7-11.33 6.87-16.89 16.32-16.68 28.35.22 9.53 3.97 17.51 11.25 23.94 7.28 6.43 15.75 10.02 25.42 10.78-2.61 7.61-5.78 15.01-9.51 22.2zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.89-10.45 19.78-12.17.21 1.74.32 3.42.32 5.04 0 7.29-2.79 14.33-8.38 21.11-5.59 6.78-12.44 10.74-20.55 11.88-.11-1.63-.12-3.36-.12-5.19z" />
                  </svg>
                  <span>Apple</span>
                </button>
              </div>
            )}

            {/* Direct WhatsApp quote button */}
            <a
              href={`https://wa.me/${settings.whatsappRaw}?text=${encodeURIComponent('Bonjour CongoMed, je souhaite obtenir un devis proforma pour une commande de matériel médical.')}`}
              target="_blank"
              rel="noreferrer"
              className="hidden md:inline-flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200 transition-colors"
            >
              <Phone className="w-3.5 h-3.5 text-emerald-600" />
              <span>Devis WhatsApp</span>
            </a>

            {/* Cart trigger button */}
            <button
              onClick={onOpenCart}
              className="relative flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white font-semibold shadow-md shadow-sky-600/20 transition-all cursor-pointer"
            >
              <div className="relative">
                <ShoppingCart className="w-5 h-5" />
                {cartCount > 0 && (
                  <span className="absolute -top-2 -right-2 bg-rose-500 text-white font-bold text-[11px] w-5 h-5 rounded-full flex items-center justify-center border-2 border-white shadow-xs">
                    {cartCount}
                  </span>
                )}
              </div>
              <div className="hidden sm:block text-left">
                <span className="block text-[11px] leading-tight text-sky-100">
                  Mon Panier
                </span>
                <span className="block text-xs font-bold leading-tight">
                  {cartCount > 0 ? formatFCFA(cartTotal) : '0 FCFA'}
                </span>
              </div>
            </button>

            {/* Mobile menu toggle */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Search input */}
        <div className="mt-3 lg:hidden">
          <div className="relative w-full">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Rechercher désignation, référence..."
              className="w-full pl-10 pr-10 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs outline-hidden"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 p-1"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>
        </div>

        {/* Mobile menu dropdown */}
        {mobileMenuOpen && (
          <div className="mt-3 pt-3 border-t border-slate-100 lg:hidden flex flex-col gap-2">
            <div className="flex gap-2">
              <button
                onClick={() => {
                  setActiveView('catalog');
                  setMobileMenuOpen(false);
                }}
                className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold ${
                  activeView === 'catalog'
                    ? 'bg-sky-600 text-white'
                    : 'bg-slate-100 text-slate-700'
                }`}
              >
                Catalogue Médical
              </button>

              {isAdmin && (
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    setActiveView('admin');
                    onOpenAdmin();
                  }}
                  className={`flex-1 py-2 px-3 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 ${
                    activeView === 'admin'
                      ? 'bg-sky-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  <span>Administration</span>
                </button>
              )}
            </div>

            {isAdmin && (
              <div className="p-2.5 bg-emerald-50 rounded-xl text-xs text-emerald-900 flex justify-between items-center">
                <span>Connecté : {ADMIN_EMAIL}</span>
                <button
                  onClick={logoutAdmin}
                  className="text-xs font-bold text-rose-600 underline"
                >
                  Déconnexion
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
