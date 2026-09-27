import React, { useState, useMemo } from 'react';
import { StoreProvider, useStore } from './context/StoreContext';
import { Header } from './components/Header';
import { HeroSection } from './components/HeroSection';
import { CategoryNav } from './components/CategoryNav';
import { ProductCard } from './components/ProductCard';
import { ProductDetailModal } from './components/ProductDetailModal';
import { CartDrawer } from './components/CartDrawer';
import { CheckoutModal } from './components/CheckoutModal';
import { InvoiceViewModal } from './components/InvoiceViewModal';
import { AdminPanel } from './components/AdminPanel';
import { AdminLoginModal } from './components/AdminLoginModal';
import { MedicalSearchGroundingModal } from './components/MedicalSearchGroundingModal';
import { AuthLandingPage } from './components/AuthLandingPage';
import { FloatingWhatsApp } from './components/FloatingWhatsApp';
import { Footer } from './components/Footer';
import { Product, Order } from './types';
import {
  PackageSearch,
  SlidersHorizontal,
  Phone,
  ShieldCheck,
  FileCheck2,
  Sparkles,
  Plus,
} from 'lucide-react';

function MainApp() {
  const {
    products,
    categories,
    settings,
    isAdmin,
    adminUser,
    adminEmail,
    firebaseUser,
    isLoginModalOpen,
    setIsLoginModalOpen,
    activeOrderForInvoice,
    setActiveOrderForInvoice,
    selectedProductForDetail,
    setSelectedProductForDetail,
  } = useStore();

  const [activeView, setActiveView] = useState<'catalog' | 'admin'>('catalog');
  const [selectedCategory, setSelectedCategory] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isCartOpen, setIsCartOpen] = useState<boolean>(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState<boolean>(false);
  const [checkoutOrderType, setCheckoutOrderType] = useState<'order' | 'quote'>('order');
  const [isSearchGroundingOpen, setIsSearchGroundingOpen] = useState<boolean>(false);
  const [guestPreviewDismissed, setGuestPreviewDismissed] = useState<boolean>(false);


  // Filter products by category and search
  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const matchesCategory =
        selectedCategory === 'ALL' || product.category === selectedCategory;

      const q = searchQuery.toLowerCase().trim();
      const matchesSearch =
        !q ||
        product.name.toLowerCase().includes(q) ||
        product.reference.toLowerCase().includes(q) ||
        product.brand.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.description && product.description.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [products, selectedCategory, searchQuery]);

  const handleOpenCheckout = (orderType: 'order' | 'quote') => {
    setCheckoutOrderType(orderType);
    setIsCheckoutOpen(true);
  };

  const handleOrderSuccess = (order: Order) => {
    setActiveOrderForInvoice(order);
  };

  const handleExploreCatalog = () => {
    const el = document.getElementById('catalog-section');
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  const handleAdminAccess = () => {
    if (!isAdmin) {
      setIsLoginModalOpen(true);
    } else {
      setActiveView('admin');
    }
  };

  // User Authentication Gate: Anyone who does not have an account lands on the account creation page with Google or Apple
  if (!firebaseUser && !adminUser && !guestPreviewDismissed) {
    return (
      <AuthLandingPage
        onContinueAsGuest={() => setGuestPreviewDismissed(true)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col font-sans">
      {/* Header */}
      <Header
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAdmin={handleAdminAccess}
        onOpenLoginModal={() => setIsLoginModalOpen(true)}
        onOpenSearchGrounding={() => setIsSearchGroundingOpen(true)}
        onOpenAuthLanding={() => setGuestPreviewDismissed(false)}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        selectedCategory={selectedCategory}
        setSelectedCategory={setSelectedCategory}
        activeView={activeView}
        setActiveView={setActiveView}
      />

      {/* View Switcher: Admin or Storefront */}
      {activeView === 'admin' ? (
        <AdminPanel
          onBackToStore={() => setActiveView('catalog')}
          onViewInvoice={(order) => setActiveOrderForInvoice(order)}
        />
      ) : (
        <main className="flex-1 flex flex-col">
          {/* Hero Section */}
          <HeroSection
            onExploreCatalog={handleExploreCatalog}
            onRequestQuote={() => handleOpenCheckout('quote')}
          />

          {/* Sticky Category Nav */}
          <CategoryNav
            selectedCategory={selectedCategory}
            onSelectCategory={setSelectedCategory}
            onOpenAddCategory={() => setActiveView('admin')}
          />

          {/* Catalog Section */}
          <section id="catalog-section" className="max-w-7xl mx-auto px-4 py-8 w-full flex-1">
            {/* EXCLUSIVE ADMIN ACTION BAR: Visible only for venceslasrabe@gmail.com */}
            {isAdmin && (
              <div className="mb-6 p-4 rounded-2xl bg-gradient-to-r from-slate-900 to-sky-950 text-white flex flex-col sm:flex-row items-center justify-between gap-4 border border-sky-800 shadow-md">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 flex items-center justify-center font-bold">
                    <ShieldCheck className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <p className="text-xs text-emerald-400 font-bold flex items-center gap-1.5">
                      <span>Mode Administrateur Actif</span>
                      <span className="text-slate-400 font-mono text-[11px]">
                        ({adminEmail})
                      </span>
                    </p>
                    <p className="text-xs text-slate-300">
                      Vous êtes le seul autorisé à ajouter, modifier ou supprimer des produits et catégories.
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={() => setActiveView('admin')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-500 text-white font-bold text-xs flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
                  >
                    <Plus className="w-4 h-4" />
                    <span>+ Créer un Produit</span>
                  </button>

                  <button
                    onClick={() => setActiveView('admin')}
                    className="flex-1 sm:flex-none px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-1.5 border border-slate-700 transition-all cursor-pointer"
                  >
                    <SlidersHorizontal className="w-4 h-4 text-sky-400" />
                    <span>Gérer le Catalogue</span>
                  </button>
                </div>
              </div>
            )}

            {/* Catalog Section Title & Filter Summary */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 mb-6">
              <div>

                <h2 className="text-xl sm:text-2xl font-extrabold text-slate-900 tracking-tight flex items-center gap-2">
                  <span>
                    {selectedCategory === 'ALL'
                      ? 'Tous les Dispositifs Médicaux & Chirurgicaux'
                      : selectedCategory}
                  </span>
                  <span className="text-xs font-bold text-sky-700 bg-sky-100 px-2.5 py-0.5 rounded-full">
                    {filteredProducts.length} référence{filteredProducts.length > 1 ? 's' : ''}
                  </span>
                </h2>
                <p className="text-xs text-slate-500 mt-0.5">
                  Tarifs certifiés en Francs CFA (FCFA) • Prêt pour expédition immédiate à Brazzaville & Pointe-Noire
                </p>
              </div>

              {/* Reset filter if searched */}
              {(searchQuery || selectedCategory !== 'ALL') && (
                <button
                  onClick={() => {
                    setSearchQuery('');
                    setSelectedCategory('ALL');
                  }}
                  className="text-xs text-sky-600 hover:text-sky-700 font-bold hover:underline cursor-pointer"
                >
                  Réinitialiser les filtres
                </button>
              )}
            </div>

            {/* Product Grid */}
            {filteredProducts.length === 0 ? (
              <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 shadow-xs max-w-md mx-auto my-8 space-y-3">
                <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto">
                  <PackageSearch className="w-8 h-8" />
                </div>
                <h3 className="font-extrabold text-slate-800 text-base">
                  Aucun produit trouvé
                </h3>
                <p className="text-xs text-slate-500">
                  Aucun article ne correspond à votre recherche "{searchQuery}". Essayez un autre mot-clé ou contactez directement l'administrateur.
                </p>
                <div className="pt-2">
                  <a
                    href={`https://wa.me/${settings.whatsappRaw}?text=${encodeURIComponent(`Bonjour CongoMed, je recherche le produit : "${searchQuery}". L'avez-vous en stock ?`)}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-md shadow-emerald-600/20"
                  >
                    <Phone className="w-3.5 h-3.5" />
                    <span>Demander sur WhatsApp</span>
                  </a>
                </div>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
                {filteredProducts.map((product) => (
                  <ProductCard
                    key={product.id}
                    product={product}
                    onOpenDetail={(prod) => setSelectedProductForDetail(prod)}
                  />
                ))}
              </div>
            )}

            {/* Guarantee / Institutional Trust Banner */}
            <div className="mt-14 rounded-3xl bg-gradient-to-r from-slate-900 via-sky-950 to-slate-900 text-white p-6 sm:p-8 flex flex-col md:flex-row items-center justify-between gap-6 border border-slate-800 shadow-xl">
              <div className="space-y-2 text-center md:text-left">
                <span className="text-[11px] font-bold text-sky-400 uppercase tracking-widest bg-sky-900/60 px-2.5 py-1 rounded-full border border-sky-700/50">
                  Marchés Publics & Privés
                </span>
                <h3 className="text-lg sm:text-xl font-extrabold">
                  Besoin d'un approvisionnement hospitalier ou d'un appel d'offres ?
                </h3>
                <p className="text-xs text-slate-300 max-w-xl">
                  Notre équipe prépare vos devis officiels avec références normatives CE/ISO, délais d'acheminement sur Brazzaville et bordereau de prix détaillés.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
                <button
                  onClick={() => handleOpenCheckout('quote')}
                  className="px-5 py-3 rounded-xl bg-white hover:bg-slate-100 text-slate-900 font-extrabold text-xs shadow-md transition-all cursor-pointer flex items-center justify-center gap-2"
                >
                  <FileCheck2 className="w-4 h-4 text-sky-600" />
                  <span>Demander un Devis Proforma</span>
                </button>
                <a
                  href={`https://wa.me/${settings.whatsappRaw}?text=${encodeURIComponent('Bonjour, je représente un établissement hospitalier et souhaite échanger avec la direction commerciale de CongoMed.')}`}
                  target="_blank"
                  rel="noreferrer"
                  className="px-5 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>WhatsApp : {settings.whatsappNumber}</span>
                </a>
              </div>
            </div>
          </section>

          {/* Floating WhatsApp hotline */}
          <FloatingWhatsApp />

          {/* Footer */}
          <Footer
            onOpenAdmin={handleAdminAccess}
            onSelectCategory={(cat) => setSelectedCategory(cat)}
          />
        </main>
      )}

      {/* Product Detail Modal */}
      <ProductDetailModal
        product={selectedProductForDetail}
        onClose={() => setSelectedProductForDetail(null)}
        onOpenCart={() => setIsCartOpen(true)}
      />

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onProceedToCheckout={handleOpenCheckout}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        orderType={checkoutOrderType}
        onOrderSuccess={handleOrderSuccess}
      />

      {/* Invoice / Proforma / Bon de commande Modal */}
      <InvoiceViewModal
        order={activeOrderForInvoice}
        onClose={() => setActiveOrderForInvoice(null)}
      />

      {/* Admin Authentication & Privilege Modal */}
      <AdminLoginModal
        isOpen={isLoginModalOpen}
        onClose={() => setIsLoginModalOpen(false)}
        onSuccess={() => setActiveView('admin')}
      />

      {/* Google Search Grounding: Live Medical & Regulatory Intelligence Modal */}
      <MedicalSearchGroundingModal
        isOpen={isSearchGroundingOpen}
        onClose={() => setIsSearchGroundingOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <StoreProvider>
      <MainApp />
    </StoreProvider>
  );
}
