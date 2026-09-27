import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  Lock,
  Sparkles,
  ArrowRight,
  Stethoscope,
  Building2,
  FileCheck2,
  Truck,
  HeartPulse,
} from 'lucide-react';
import { useStore, ADMIN_EMAIL } from '../context/StoreContext';

interface AuthLandingPageProps {
  onContinueAsGuest?: () => void;
}

export const AuthLandingPage: React.FC<AuthLandingPageProps> = ({
  onContinueAsGuest,
}) => {
  const { signInWithGoogleAuth, signInWithAppleAuth, settings } = useStore();
  const [loadingProvider, setLoadingProvider] = useState<'google' | 'apple' | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);

  const handleGoogleSignIn = async () => {
    try {
      setAuthError(null);
      setLoadingProvider('google');
      await signInWithGoogleAuth();
    } catch (err: any) {
      console.error(err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError(
          "Impossible de finaliser l'inscription Google. Veuillez réessayer ou vérifier vos bloqueurs de pop-up."
        );
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  const handleAppleSignIn = async () => {
    try {
      setAuthError(null);
      setLoadingProvider('apple');
      await signInWithAppleAuth();
    } catch (err: any) {
      console.error(err);
      if (err?.code !== 'auth/popup-closed-by-user') {
        setAuthError(
          "Impossible de finaliser l'inscription Apple. Veuillez vérifier vos identifiants Apple ID ou réessayer avec Google."
        );
      }
    } finally {
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-sky-950 to-slate-900 flex flex-col justify-between text-slate-100 relative overflow-hidden">
      {/* Decorative ambient background */}
      <div className="absolute inset-0 opacity-15 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:24px_24px] pointer-events-none"></div>
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-teal-500/20 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-sky-500/20 rounded-full blur-3xl pointer-events-none"></div>

      {/* Top Header / Branding Bar */}
      <header className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-sky-500 to-teal-400 flex items-center justify-center shadow-lg shadow-sky-500/30 text-white border border-white/20">
            <HeartPulse className="w-6 h-6 animate-pulse" />
          </div>
          <div>
            <span className="font-extrabold text-lg sm:text-xl tracking-tight text-white block">
              Congo Médical <span className="text-teal-400 font-light">Fournitures</span>
            </span>
            <span className="text-[11px] text-slate-400 hidden sm:block">
              Brazzaville & Pointe-Noire • République du Congo
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-400/30 text-emerald-300 text-xs font-semibold backdrop-blur-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Portail Biomédical Sécurisé</span>
          </span>
        </div>
      </header>

      {/* Main Account Creation Card Section */}
      <main className="relative z-10 max-w-5xl mx-auto w-full px-4 sm:px-6 py-6 sm:py-10 my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
          
          {/* Left Column: Presentation & Value proposition */}
          <div className="lg:col-span-6 space-y-6">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl bg-sky-500/15 border border-sky-400/20 text-sky-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5 text-sky-400" />
              <span>Accès réservé aux professionnels & établissements de santé</span>
            </div>

            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold text-white tracking-tight leading-[1.15]">
              Créez votre compte pour accéder au{' '}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-sky-400 via-teal-300 to-emerald-400">
                Catalogue Médical Officiel
              </span>
            </h1>

            <p className="text-slate-300 text-sm sm:text-base leading-relaxed">
              Rejoignez les cliniques, hôpitaux, cabinets et pharmacies de la République du Congo. Consultez nos tarifs en <strong>Francs CFA</strong>, générez vos <strong>factures proforma</strong> et validez vos commandes prioritaires par <strong>WhatsApp</strong>.
            </p>

            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/40">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Dispositifs et consommables certifiés <strong>CE & ISO 13485</strong></span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/40">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Factures proforma téléchargeables immédiatement en PDF</span>
              </div>

              <div className="flex items-center gap-3 text-xs sm:text-sm text-slate-200">
                <div className="w-6 h-6 rounded-full bg-teal-500/20 text-teal-300 flex items-center justify-center shrink-0 border border-teal-500/40">
                  <CheckCircle2 className="w-4 h-4" />
                </div>
                <span>Livraison sécurisée et réactive à Brazzaville et Pointe-Noire</span>
              </div>
            </div>

            <div className="p-3.5 rounded-2xl bg-slate-800/80 border border-slate-700/80 text-xs text-slate-400 flex items-center gap-3">
              <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Compte administrateur certifié pour <strong className="text-white font-mono">{ADMIN_EMAIL}</strong> (déverrouille la création et modification des produits).
              </span>
            </div>
          </div>

          {/* Right Column: Account Creation Box with Google and Apple buttons */}
          <div className="lg:col-span-6">
            <div className="bg-white/95 backdrop-blur-md rounded-3xl p-6 sm:p-8 shadow-2xl border border-white/20 text-slate-900 space-y-6">
              <div className="text-center space-y-2">
                <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mx-auto border border-sky-100 shadow-xs">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-xl sm:text-2xl font-black text-slate-900">
                  Création de Compte
                </h2>
                <p className="text-xs text-slate-500 max-w-sm mx-auto">
                  Choisissez l'une des 2 options officielles sécurisées pour créer votre compte en 1 clic :
                </p>
              </div>

              {/* Error message if popup fails */}
              {authError && (
                <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl text-xs text-rose-700 leading-relaxed text-center font-medium">
                  {authError}
                </div>
              )}

              {/* Two Mandatory Signup Options: Google and Apple */}
              <div className="space-y-3.5">
                {/* 1. Continuer avec Google */}
                <button
                  onClick={handleGoogleSignIn}
                  disabled={loadingProvider !== null}
                  className="w-full py-4 px-5 rounded-2xl bg-white hover:bg-slate-50 border-2 border-slate-200 hover:border-sky-500 text-slate-800 font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer transform active:scale-[0.98] disabled:opacity-50"
                >
                  {loadingProvider === 'google' ? (
                    <div className="w-5 h-5 border-2 border-sky-600 border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 shrink-0" viewBox="0 0 24 24">
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
                        d="M5.28 14.28c-.24-.72-.38-1.49-.38-2.28s.14-1.56.38-2.28V6.57H1.25C.45 8.16 0 9.98 0 12s.45 3.84 1.25 5.43l4.03-3.15z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.77c1.77 0 3.35.61 4.6 1.8l3.43-3.43C17.95 1.19 15.24 0 12 0 7.36 0 3.26 2.64 1.25 6.57l4.03 3.15c.95-2.83 3.6-4.95 6.72-4.95z"
                      />
                    </svg>
                  )}
                  <span>
                    {loadingProvider === 'google'
                      ? 'Connexion Google en cours...'
                      : 'Créer mon compte avec Google'}
                  </span>
                </button>

                {/* 2. Continuer avec Apple */}
                <button
                  onClick={handleAppleSignIn}
                  disabled={loadingProvider !== null}
                  className="w-full py-4 px-5 rounded-2xl bg-black hover:bg-zinc-800 text-white font-bold text-sm sm:text-base flex items-center justify-center gap-3 shadow-md hover:shadow-lg transition-all cursor-pointer transform active:scale-[0.98] disabled:opacity-50"
                >
                  {loadingProvider === 'apple' ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  ) : (
                    <svg className="w-5 h-5 fill-current shrink-0" viewBox="0 0 170 170">
                      <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.05-7.7-7.85-12.01-14.4-5.35-8.18-9.59-17.65-12.74-28.43-3.14-10.78-4.71-21.2-4.71-31.25 0-14.54 3.73-26.68 11.19-36.43 7.46-9.75 16.92-14.73 28.37-14.94 4.58 0 9.77 1.25 15.58 3.76 5.81 2.5 9.7 3.82 11.66 3.96 1.77 0 5.86-1.39 12.28-4.17 6.42-2.78 12.06-4.04 16.93-3.77 13.06.66 23.49 5.56 31.3 14.7-11.33 6.87-16.89 16.32-16.68 28.35.22 9.53 3.97 17.51 11.25 23.94 7.28 6.43 15.75 10.02 25.42 10.78-2.61 7.61-5.78 15.01-9.51 22.2zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.89-10.45 19.78-12.17.21 1.74.32 3.42.32 5.04 0 7.29-2.79 14.33-8.38 21.11-5.59 6.78-12.44 10.74-20.55 11.88-.11-1.63-.12-3.36-.12-5.19z" />
                    </svg>
                  )}
                  <span>
                    {loadingProvider === 'apple'
                      ? 'Connexion Apple en cours...'
                      : 'Créer mon compte avec Apple'}
                  </span>
                </button>
              </div>

              {/* Guarantees & Terms footnote */}
              <div className="pt-2 border-t border-slate-100 text-center space-y-2">
                <p className="text-[11px] text-slate-400">
                  En continuant, vous confirmez être un professionnel de santé, représentant d'un établissement médical ou acheteur autorisé.
                </p>

                {onContinueAsGuest && (
                  <div className="pt-2">
                    <button
                      onClick={onContinueAsGuest}
                      className="text-xs text-slate-600 hover:text-sky-600 font-semibold underline cursor-pointer transition-colors inline-flex items-center gap-1"
                    >
                      <span>Consulter le catalogue en mode aperçu public</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>
      </main>

      {/* Bottom Footer */}
      <footer className="relative z-10 max-w-7xl mx-auto w-full px-4 sm:px-6 py-4 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-500 border-t border-slate-800">
        <div>
          © {new Date().getFullYear()} Congo Médical Fournitures — Dispositifs Médicaux & Équipements Hospitaliers.
        </div>
        <div className="flex items-center gap-4">
          <a
            href={`https://wa.me/${settings.whatsappRaw}`}
            target="_blank"
            rel="noreferrer"
            className="text-emerald-400 hover:text-emerald-300 font-semibold transition-colors"
          >
            Assistance WhatsApp : {settings.whatsappNumber}
          </a>
        </div>
      </footer>
    </div>
  );
};
