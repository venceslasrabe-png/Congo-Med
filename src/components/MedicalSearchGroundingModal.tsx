import React, { useState } from 'react';
import {
  Search,
  Sparkles,
  ExternalLink,
  Loader2,
  X,
  BookOpen,
  ShieldCheck,
  Stethoscope,
  FileText,
  AlertCircle,
  HelpCircle,
} from 'lucide-react';

interface GroundingSource {
  title: string;
  uri: string;
}

interface MedicalSearchGroundingModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SUGGESTED_QUERIES = [
  'Normes CE & ISO 13485 pour dispositifs médicaux chirurgicaux',
  'Réglementation importation matériel médical en République du Congo',
  'Recommandations OMS stérilisation autoclave matériel réutilisable',
  'Guide d’élimination des déchets d’activités de soins à risque infectieux (DASRI)',
  'Conservation et traçabilité des gants chirurgicaux et pansements en milieu tropical',
];

export const MedicalSearchGroundingModal: React.FC<
  MedicalSearchGroundingModalProps
> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [specialty, setSpecialty] = useState('Générale');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<string | null>(null);
  const [sources, setSources] = useState<GroundingSource[]>([]);
  const [searchQueries, setSearchQueries] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSearch = async (searchQueryText?: string) => {
    const textToSearch = searchQueryText || query;
    if (!textToSearch.trim()) return;

    setLoading(true);
    setError(null);
    setAnswer(null);
    setSources([]);

    try {
      const response = await fetch('/api/medical-grounding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          query: textToSearch,
          specialty,
        }),
      });

      if (!response.ok) {
        throw new Error(`Erreur serveur (${response.status})`);
      }

      const data = await response.json();
      setAnswer(data.answer);
      setSources(data.sources || []);
      setSearchQueries(data.searchQueries || []);
    } catch (err: any) {
      console.error(err);
      setError(
        'Impossible de récupérer les informations médicales en direct. Vérifiez votre connexion.'
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/70 backdrop-blur-xs flex items-center justify-center p-3 sm:p-6 no-print">
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-slate-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="p-5 bg-gradient-to-r from-sky-900 via-slate-900 to-sky-950 text-white flex items-center justify-between shrink-0 border-b border-sky-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-300 flex items-center justify-center border border-sky-500/30">
              <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-base text-white">
                  Assistant Médical & Réglementaire
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Google Search Grounding
                </span>
              </div>
              <p className="text-xs text-slate-300">
                Données actualisées en direct • Normes OMS, CE, ISO 13485 & réglementation Congo
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-6">
          {/* Search Input Box */}
          <div className="space-y-3">
            <label className="text-xs font-bold text-slate-700 block">
              Posez votre question clinique, normative ou technique :
            </label>
            <div className="flex flex-col sm:flex-row gap-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                  placeholder="Ex: Quelles sont les normes de stérilisation pour les compresses chirurgicales ?"
                  className="w-full pl-10 pr-4 py-3 bg-slate-50 border border-slate-200 focus:border-sky-500 focus:bg-white rounded-xl text-xs sm:text-sm outline-hidden transition-all text-slate-900"
                />
              </div>

              <select
                value={specialty}
                onChange={(e) => setSpecialty(e.target.value)}
                className="px-3 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 outline-hidden cursor-pointer"
              >
                <option value="Générale">Toutes spécialités</option>
                <option value="Chirurgie Générale">Chirurgie Générale</option>
                <option value="Orthopédie & Traumatologie">Orthopédie</option>
                <option value="Anesthésie & Réanimation">Anesthésie & Réa</option>
                <option value="Gynécologie & Obstétrique">Gynécologie</option>
                <option value="Pharmacie Hospitalière">Pharmacie</option>
              </select>

              <button
                onClick={() => handleSearch()}
                disabled={loading || !query.trim()}
                className="px-5 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:bg-slate-200 disabled:text-slate-400 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-sky-600/20 transition-all cursor-pointer"
              >
                {loading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Recherche...</span>
                  </>
                ) : (
                  <>
                    <Search className="w-4 h-4" />
                    <span>Rechercher</span>
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Quick Suggestions */}
          {!answer && !loading && (
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
                Exemples de requêtes fréquentes :
              </span>
              <div className="flex flex-wrap gap-1.5">
                {SUGGESTED_QUERIES.map((q, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setQuery(q);
                      handleSearch(q);
                    }}
                    className="text-left text-xs bg-slate-100 hover:bg-sky-50 hover:text-sky-700 hover:border-sky-300 border border-slate-200 px-3 py-1.5 rounded-xl text-slate-700 transition-all cursor-pointer"
                  >
                    💡 {q}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Loading state */}
          {loading && (
            <div className="py-12 text-center space-y-3">
              <div className="w-12 h-12 rounded-full border-3 border-sky-600 border-t-transparent animate-spin mx-auto"></div>
              <p className="text-xs font-bold text-slate-700">
                Interrogation des données médicales en direct avec Google Search...
              </p>
              <p className="text-[11px] text-slate-400 max-w-sm mx-auto">
                Vérification des directives OMS, réglementations CE/ISO et sources scientifiques officielles.
              </p>
            </div>
          )}

          {/* Error Message */}
          {error && (
            <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-800 text-xs flex items-center gap-3">
              <AlertCircle className="w-5 h-5 shrink-0 text-rose-600" />
              <span>{error}</span>
            </div>
          )}

          {/* Results Display */}
          {answer && (
            <div className="space-y-5 animate-in fade-in duration-300">
              {/* Answer Content */}
              <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between border-b border-slate-200/80 pb-2.5">
                  <span className="text-xs font-extrabold text-slate-800 flex items-center gap-1.5">
                    <BookOpen className="w-4 h-4 text-sky-600" />
                    <span>Synthèse Médicale Validée</span>
                  </span>
                  <span className="text-[10px] font-mono font-bold text-sky-700 bg-sky-100 px-2 py-0.5 rounded">
                    Modèle Gemini Grounded
                  </span>
                </div>

                <div className="text-xs sm:text-sm text-slate-800 leading-relaxed whitespace-pre-line font-normal">
                  {answer}
                </div>
              </div>

              {/* Grounded Web Sources */}
              {sources.length > 0 && (
                <div className="p-4 rounded-2xl bg-sky-50/60 border border-sky-200/70 space-y-2.5">
                  <h4 className="text-xs font-bold text-sky-950 flex items-center gap-1.5">
                    <ExternalLink className="w-3.5 h-3.5 text-sky-600" />
                    <span>Sources et références web vérifiées (Google Search) :</span>
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {sources.map((src, i) => (
                      <a
                        key={i}
                        href={src.uri}
                        target="_blank"
                        rel="noreferrer"
                        className="p-2.5 rounded-xl bg-white border border-sky-100 hover:border-sky-300 hover:shadow-xs text-xs text-sky-900 flex items-center justify-between gap-2 transition-all group"
                      >
                        <span className="truncate font-semibold group-hover:text-sky-600">
                          {src.title}
                        </span>
                        <ExternalLink className="w-3 h-3 text-slate-400 group-hover:text-sky-600 shrink-0" />
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 text-xs text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-3 shrink-0">
          <span className="text-[11px] text-center sm:text-left">
            ℹ️ Ces informations complètent les fiches techniques des produits CongoMed.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold text-xs transition-colors cursor-pointer"
          >
            Fermer
          </button>
        </div>
      </div>
    </div>
  );
};
