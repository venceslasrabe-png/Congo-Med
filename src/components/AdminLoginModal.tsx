import React, { useState } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Lock,
  Mail,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  X,
  UserCheck,
  Eye,
  EyeOff,
} from 'lucide-react';
import { useStore, ADMIN_EMAIL } from '../context/StoreContext';

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const {
    adminUser,
    isAdmin,
    firebaseUser,
    signInWithGoogleAuth,
    signInWithAppleAuth,
    loginAdmin,
    logoutAdmin,
    actionBlockedMessage,
    setActionBlockedMessage,
  } = useStore();

  const [emailInput, setEmailInput] = useState<string>(ADMIN_EMAIL);
  const [passwordInput, setPasswordInput] = useState<string>('admin2026');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successNotice, setSuccessNotice] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    const result = loginAdmin(emailInput, passwordInput);
    if (!result.success) {
      setErrorMsg(result.error || 'Erreur d’authentification');
    } else {
      setSuccessNotice(`Connecté avec succès en tant qu’administrateur (${ADMIN_EMAIL}) !`);
      setTimeout(() => {
        setSuccessNotice(null);
        onClose();
        if (onSuccess) onSuccess();
      }, 700);
    }
  };

  const handleQuickAdminLogin = () => {
    setEmailInput(ADMIN_EMAIL);
    setErrorMsg(null);
    const result = loginAdmin(ADMIN_EMAIL, 'admin2026');
    if (result.success) {
      setSuccessNotice(`Authentification validée pour ${ADMIN_EMAIL}`);
      setTimeout(() => {
        setSuccessNotice(null);
        onClose();
        if (onSuccess) onSuccess();
      }, 600);
    }
  };

  const handleLogoutToVisitor = () => {
    logoutAdmin();
    setSuccessNotice('Vous êtes maintenant en mode Client / Visiteur (droits administrateur désactivés).');
    setTimeout(() => {
      setSuccessNotice(null);
    }, 1500);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4">
      <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200 animate-in fade-in zoom-in-95 duration-200">
        {/* Header */}
        <div className="bg-slate-900 text-white p-6 relative">
          <button
            onClick={() => {
              setActionBlockedMessage(null);
              onClose();
            }}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-sky-500/20 border border-sky-400/30 flex items-center justify-center text-sky-400">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <h3 className="font-extrabold text-lg text-white">
                Contrôle d'Accès Administrateur
              </h3>
              <p className="text-xs text-slate-400">
                Gestion réservée aux ayants droit
              </p>
            </div>
          </div>
        </div>

        {/* Content */}
        <div className="p-6 space-y-5">
          {/* Blocked message notice if triggered by an action */}
          {actionBlockedMessage && (
            <div className="p-3.5 bg-rose-50 border border-rose-200 rounded-2xl flex items-start gap-2.5 text-xs text-rose-800">
              <ShieldAlert className="w-5 h-5 text-rose-600 shrink-0 mt-0.5" />
              <div>
                <strong className="block font-bold">Sécurité du Catalogue</strong>
                <span>{actionBlockedMessage}</span>
              </div>
            </div>
          )}

          {/* Current status display */}
          <div className="p-4 rounded-2xl border text-xs flex items-center justify-between gap-3 bg-slate-50 border-slate-200">
            <div className="flex items-center gap-2.5">
              {isAdmin ? (
                <div className="w-8 h-8 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-4 h-4" />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-full bg-slate-200 text-slate-600 flex items-center justify-center shrink-0">
                  <Lock className="w-4 h-4" />
                </div>
              )}
              <div>
                <p className="font-bold text-slate-800">
                  {isAdmin
                    ? 'Session Administrateur Active'
                    : 'Mode Client / Visiteur (Lecture seule)'}
                </p>
                <p className="text-slate-500 text-[11px]">
                  {isAdmin ? adminUser?.email : 'Non authentifié comme admin'}
                </p>
              </div>
            </div>

            {isAdmin && (
              <button
                type="button"
                onClick={handleLogoutToVisitor}
                className="px-2.5 py-1.5 rounded-lg bg-white border border-slate-300 text-slate-700 hover:text-rose-600 hover:border-rose-300 text-[11px] font-bold transition-colors cursor-pointer"
              >
                Déconnexion
              </button>
            )}
          </div>

          {/* Explicit requirement box */}
          <div className="bg-sky-50/80 border border-sky-200/80 rounded-2xl p-4 text-xs text-sky-900 space-y-1.5">
            <div className="flex items-center gap-1.5 font-bold text-sky-950">
              <UserCheck className="w-4 h-4 text-sky-600" />
              <span>Règle de sécurité stricte :</span>
            </div>
            <p className="leading-relaxed">
              Seul l'administrateur avec l'adresse officielle :{' '}
              <strong className="font-extrabold text-sky-700 underline font-mono">
                {ADMIN_EMAIL}
              </strong>{' '}
              est autorisé à <strong>ajouter</strong>, <strong>modifier</strong>{' '}
              ou <strong>supprimer</strong> un produit ou le catalogue.
            </p>
          </div>

          {/* Form */}
          {!isAdmin ? (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Adresse e-mail administrateur
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    required
                    placeholder="venceslasrabe@gmail.com"
                    className="w-full pl-10 pr-3.5 py-2.5 bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl text-xs outline-hidden font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  Code d'accès / Mot de passe
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    required
                    placeholder="Code d'accès sécurisé"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-50 border border-slate-300 focus:border-sky-500 focus:bg-white rounded-xl text-xs outline-hidden"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {errorMsg && (
                <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-start gap-2 text-xs text-rose-700">
                  <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {successNotice && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-2 text-xs text-emerald-800">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{successNotice}</span>
                </div>
              )}

              <div className="pt-2 flex flex-col gap-2">
                {/* Google Sign-in with Firebase Auth */}
                <button
                  type="button"
                  onClick={async () => {
                    setErrorMsg(null);
                    try {
                      await signInWithGoogleAuth();
                      setSuccessNotice(`Connecté avec succès via Google Firebase !`);
                      setTimeout(() => {
                        setSuccessNotice(null);
                        onClose();
                        if (onSuccess) onSuccess();
                      }, 700);
                    } catch (err: any) {
                      setErrorMsg(
                        err.message || 'Erreur lors de la connexion Google Firebase.'
                      );
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-white hover:bg-slate-50 border border-slate-300 text-slate-800 font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <svg className="w-4 h-4" viewBox="0 0 24 24">
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
                  <span>Connexion Google (Firebase Auth)</span>
                </button>

                {/* Apple Sign-in with Firebase Auth */}
                <button
                  type="button"
                  onClick={async () => {
                    setErrorMsg(null);
                    try {
                      await signInWithAppleAuth();
                      setSuccessNotice(`Connecté avec succès via Apple !`);
                      setTimeout(() => {
                        setSuccessNotice(null);
                        onClose();
                        if (onSuccess) onSuccess();
                      }, 700);
                    } catch (err: any) {
                      setErrorMsg(
                        err.message || 'Erreur lors de la connexion Apple.'
                      );
                    }
                  }}
                  className="w-full py-2.5 px-4 bg-black hover:bg-zinc-800 text-white font-bold text-xs rounded-xl shadow-xs transition-all flex items-center justify-center gap-2.5 cursor-pointer"
                >
                  <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 170 170">
                    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.7-3.05-7.7-7.85-12.01-14.4-5.35-8.18-9.59-17.65-12.74-28.43-3.14-10.78-4.71-21.2-4.71-31.25 0-14.54 3.73-26.68 11.19-36.43 7.46-9.75 16.92-14.73 28.37-14.94 4.58 0 9.77 1.25 15.58 3.76 5.81 2.5 9.7 3.82 11.66 3.96 1.77 0 5.86-1.39 12.28-4.17 6.42-2.78 12.06-4.04 16.93-3.77 13.06.66 23.49 5.56 31.3 14.7-11.33 6.87-16.89 16.32-16.68 28.35.22 9.53 3.97 17.51 11.25 23.94 7.28 6.43 15.75 10.02 25.42 10.78-2.61 7.61-5.78 15.01-9.51 22.2zM119.22 31.84c0-7.39 2.65-14.28 7.95-20.67 5.3-6.39 11.89-10.45 19.78-12.17.21 1.74.32 3.42.32 5.04 0 7.29-2.79 14.33-8.38 21.11-5.59 6.78-12.44 10.74-20.55 11.88-.11-1.63-.12-3.36-.12-5.19z" />
                  </svg>
                  <span>Connexion Apple</span>
                </button>

                <div className="relative my-1 text-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-slate-200"></div>
                  </div>
                  <span className="relative bg-white px-2 text-[10px] text-slate-400 font-bold uppercase">
                    Ou avec identifiant
                  </span>
                </div>

                <button
                  type="submit"
                  className="w-full py-2.5 px-4 bg-sky-600 hover:bg-sky-700 active:bg-sky-800 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 cursor-pointer transition-all flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  <span>Se connecter en tant que venceslasrabe@gmail.com</span>
                </button>

                <button
                  type="button"
                  onClick={handleQuickAdminLogin}
                  className="w-full py-2 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all flex items-center justify-center gap-2 cursor-pointer"
                >
                  <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                  <span>Authentification instantanée ({ADMIN_EMAIL})</span>
                </button>
              </div>
            </form>
          ) : (
            <div className="space-y-4">
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl text-xs text-emerald-900 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-emerald-950">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Statut vérifié</span>
                </div>
                <p>
                  Vous disposez de l'ensemble des droits pour créer, éditer ou supprimer des articles, des catégories et ajuster les stocks.
                </p>
              </div>

              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    onClose();
                    if (onSuccess) onSuccess();
                  }}
                  className="flex-1 py-2.5 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
                >
                  Accéder à la gestion
                </button>
                <button
                  type="button"
                  onClick={handleLogoutToVisitor}
                  className="py-2.5 px-4 bg-slate-100 hover:bg-rose-50 hover:text-rose-700 text-slate-700 font-bold text-xs rounded-xl border border-slate-200 cursor-pointer transition-colors"
                >
                  Tester mode client
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
