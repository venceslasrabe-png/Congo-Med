import React, { useState } from 'react';
import {
  Package,
  Layers,
  ShoppingBag,
  TrendingUp,
  AlertTriangle,
  Plus,
  Edit2,
  Trash2,
  Phone,
  FileText,
  Printer,
  Search,
  Settings,
  ArrowUpRight,
  ArrowDownLeft,
  Users,
  CheckCircle2,
  XCircle,
  Clock,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Lock,
  KeyRound,
  Upload,
  RefreshCw,
  ExternalLink,
  LogOut,
} from 'lucide-react';
import { useStore, ADMIN_EMAIL } from '../context/StoreContext';
import {
  Product,
  Category,
  Order,
  OrderStatus,
  StockMovement,
  TechnicalSpec,
} from '../types';
import { formatFCFA, formatDate } from '../utils/format';

interface AdminPanelProps {
  onBackToStore: () => void;
  onViewInvoice: (order: Order) => void;
}

export const AdminPanel: React.FC<AdminPanelProps> = ({
  onBackToStore,
  onViewInvoice,
}) => {
  const {
    products,
    categories,
    orders,
    stockMovements,
    settings,
    isAdmin,
    adminUser,
    adminEmail,
    logoutAdmin,
    setIsLoginModalOpen,
    addProduct,
    updateProduct,
    deleteProduct,
    addCategory,
    deleteCategory,
    adjustStock,
    updateOrderStatus,
    updateSettings,
    resetToInitialData,
  } = useStore();


  const [activeTab, setActiveTab] = useState<
    'dashboard' | 'products' | 'stocks' | 'orders' | 'categories' | 'clients' | 'settings'
  >('dashboard');

  // Search & filter states
  const [productSearch, setProductSearch] = useState('');
  const [orderSearch, setOrderSearch] = useState('');
  const [stockFilter, setStockFilter] = useState<'all' | 'low' | 'out'>('all');

  // Modals inside admin
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [selectedStockProduct, setSelectedStockProduct] = useState<Product | null>(
    null
  );
  const [stockDelta, setStockDelta] = useState<number>(10);
  const [stockReason, setStockReason] = useState<string>('Réapprovisionnement fournisseur');
  const [stockMovementType, setStockMovementType] = useState<'IN' | 'OUT' | 'ADJUSTMENT'>('IN');

  const [isCategoryModalOpen, setIsCategoryModalOpen] = useState(false);
  const [newCatName, setNewCatName] = useState('');
  const [newCatDesc, setNewCatDesc] = useState('');

  // Product Form state
  const [prodForm, setProdForm] = useState<Omit<Product, 'id'>>({
    reference: '',
    name: '',
    category: categories[0]?.name || 'Consommables médicaux',
    description: '',
    price: 10000,
    stockQuantity: 20,
    lowStockThreshold: 5,
    images: ['https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80'],
    brand: '',
    packaging: 'Boîte de 100 unités',
    isAvailable: true,
    isSterile: false,
    certification: 'CE Médical / ISO 13485',
    technicalSpecs: [
      { label: 'Matière', value: 'Qualité médicale' },
      { label: 'Stérilité', value: 'Non stérile' },
    ],
    featured: false,
  });

  // Settings form state
  const [settingsForm, setSettingsForm] = useState(settings);

  // KPIs
  const totalRevenue = orders.reduce((sum, ord) => sum + ord.totalAmount, 0);
  const totalOrdersCount = orders.length;
  const lowStockCount = products.filter(
    (p) => p.stockQuantity > 0 && p.stockQuantity <= p.lowStockThreshold
  ).length;
  const outOfStockCount = products.filter((p) => p.stockQuantity <= 0).length;

  // Filtered products
  const filteredProducts = products.filter((p) => {
    const matchesSearch =
      p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.reference.toLowerCase().includes(productSearch.toLowerCase()) ||
      p.brand.toLowerCase().includes(productSearch.toLowerCase());

    if (stockFilter === 'low') {
      return (
        matchesSearch &&
        p.stockQuantity > 0 &&
        p.stockQuantity <= p.lowStockThreshold
      );
    }
    if (stockFilter === 'out') {
      return matchesSearch && p.stockQuantity <= 0;
    }
    return matchesSearch;
  });

  // Filtered orders
  const filteredOrders = orders.filter((o) => {
    return (
      o.orderNumber.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.fullName.toLowerCase().includes(orderSearch.toLowerCase()) ||
      o.customer.phone.toLowerCase().includes(orderSearch.toLowerCase()) ||
      (o.customer.establishmentName &&
        o.customer.establishmentName
          .toLowerCase()
          .includes(orderSearch.toLowerCase()))
    );
  });

  // Unique clients aggregated
  const clientMap = new Map<string, { customer: any; ordersCount: number; totalSpent: number }>();
  orders.forEach((ord) => {
    const key = ord.customer.phone;
    if (!clientMap.has(key)) {
      clientMap.set(key, {
        customer: ord.customer,
        ordersCount: 1,
        totalSpent: ord.totalAmount,
      });
    } else {
      const existing = clientMap.get(key)!;
      existing.ordersCount += 1;
      existing.totalSpent += ord.totalAmount;
    }
  });
  const clientsList = Array.from(clientMap.values());

  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setProdForm({
      reference: `REF-MED-${Math.floor(100 + Math.random() * 900)}`,
      name: '',
      category: categories[0]?.name || 'Consommables médicaux',
      description: '',
      price: 15000,
      stockQuantity: 25,
      lowStockThreshold: 5,
      images: [
        'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?auto=format&fit=crop&w=800&q=80',
      ],
      brand: 'Standard Médical',
      packaging: 'À l’unité',
      isAvailable: true,
      isSterile: false,
      certification: 'Norme CE / ISO',
      technicalSpecs: [
        { label: 'Origine', value: 'Certifiée' },
      ],
      featured: false,
    });
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod: Product) => {
    setEditingProduct(prod);
    setProdForm({
      reference: prod.reference,
      name: prod.name,
      category: prod.category,
      description: prod.description,
      price: prod.price,
      stockQuantity: prod.stockQuantity,
      lowStockThreshold: prod.lowStockThreshold,
      images: prod.images,
      brand: prod.brand,
      packaging: prod.packaging || '',
      isAvailable: prod.isAvailable,
      isSterile: prod.isSterile || false,
      certification: prod.certification || '',
      technicalSpecs: prod.technicalSpecs || [],
      featured: prod.featured || false,
    });
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodForm.name.trim() || !prodForm.reference.trim()) {
      alert('Veuillez remplir au moins la référence et le nom du produit.');
      return;
    }

    if (editingProduct) {
      updateProduct(editingProduct.id, prodForm);
    } else {
      addProduct(prodForm);
    }
    setIsProductModalOpen(false);
  };

  const handleOpenStockAdjust = (prod: Product) => {
    setSelectedStockProduct(prod);
    setStockDelta(10);
    setStockMovementType('IN');
    setStockReason('Entrée de stock fournisseur');
    setIsStockModalOpen(true);
  };

  const handleApplyStockMovement = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedStockProduct) return;

    const delta =
      stockMovementType === 'OUT' ? -Math.abs(stockDelta) : Math.abs(stockDelta);

    adjustStock(selectedStockProduct.id, delta, stockMovementType, stockReason);
    setIsStockModalOpen(false);
  };

  const handleCreateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCatName.trim()) return;
    addCategory({
      name: newCatName.trim(),
      description: newCatDesc.trim() || 'Matériel et consommables spécialisés',
      iconName: 'Package',
    });
    setNewCatName('');
    setNewCatDesc('');
    setIsCategoryModalOpen(false);
  };

  const handleSaveSettings = (e: React.FormEvent) => {
    e.preventDefault();
    updateSettings(settingsForm);
    alert('Paramètres de la boutique enregistrés avec succès !');
  };

  // Security Gate: Restrict full admin management exclusively to venceslasrabe@gmail.com
  if (!isAdmin) {
    return (
      <div className="min-h-[85vh] bg-slate-100 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl shadow-xl p-8 border border-slate-200 text-center space-y-5 animate-in fade-in duration-300">
          <div className="w-16 h-16 rounded-3xl bg-amber-500/10 text-amber-600 flex items-center justify-center mx-auto border border-amber-200 shadow-xs">
            <ShieldAlert className="w-8 h-8" />
          </div>

          <div>
            <h2 className="text-xl font-extrabold text-slate-900">
              Accès Réservé à l'Administrateur
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Contrôle strict des modifications du catalogue médical
            </p>
          </div>

          <div className="bg-amber-50/90 border border-amber-200 rounded-2xl p-4 text-xs text-amber-900 text-left space-y-2">
            <div className="flex items-center gap-1.5 font-bold text-amber-950">
              <Lock className="w-4 h-4 text-amber-600" />
              <span>Règle d'accès officielle :</span>
            </div>
            <p className="leading-relaxed">
              Seul l'administrateur avec l'adresse e-mail officielle{' '}
              <strong className="font-mono text-amber-950 font-bold underline">
                {ADMIN_EMAIL}
              </strong>{' '}
              est habilité à ajouter, modifier ou supprimer un produit, une catégorie ou à ajuster les stocks.
            </p>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Les clients et praticiens ont accès à la consultation du catalogue, à la constitution du panier, aux devis et à la commande via WhatsApp.
          </p>

          <div className="flex flex-col gap-2.5 pt-2">
            <button
              onClick={() => setIsLoginModalOpen(true)}
              className="w-full py-3 px-4 bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs rounded-xl shadow-md shadow-sky-600/20 cursor-pointer transition-all flex items-center justify-center gap-2"
            >
              <KeyRound className="w-4 h-4" />
              <span>Se connecter en tant que {ADMIN_EMAIL}</span>
            </button>

            <button
              onClick={onBackToStore}
              className="w-full py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs rounded-xl transition-all cursor-pointer"
            >
              Retourner au catalogue client
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100 flex flex-col text-slate-800 no-print">
      {/* Admin Top Header */}
      <header className="bg-slate-900 text-white border-b border-slate-800 sticky top-0 z-30 shadow-md">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="p-2 rounded-xl bg-sky-600 text-white font-extrabold text-sm shadow-md">
              ADM
            </span>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="font-extrabold text-base text-white">
                  Gestionnaire CongoMed
                </h1>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 font-bold border border-emerald-500/30 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Administrateur Actif
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Administration complète des stocks, commandes et factures ({settings.whatsappNumber})
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            {/* Authenticated Admin Account Badge */}
            <div className="hidden sm:flex items-center gap-2 px-3 py-1.5 rounded-xl bg-slate-800/90 border border-slate-700 text-xs">
              <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
              <div className="text-left font-mono">
                <span className="text-slate-400 text-[10px] block leading-none">Compte Admin :</span>
                <span className="text-emerald-300 font-bold text-xs leading-tight">{ADMIN_EMAIL}</span>
              </div>
            </div>

            <button
              onClick={() => {
                logoutAdmin();
                onBackToStore();
              }}
              title="Déconnexion admin et retour en mode visiteur"
              className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-rose-900/60 hover:text-rose-200 text-slate-300 text-xs font-semibold border border-slate-700 transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Mode Client</span>
            </button>

            <button
              onClick={onBackToStore}
              className="px-3.5 py-1.5 rounded-xl bg-sky-600 hover:bg-sky-500 text-white text-xs font-semibold shadow-xs transition-colors flex items-center gap-1.5 cursor-pointer"
            >
              <span>Voir Boutique</span>
            </button>
          </div>
        </div>

        {/* Security privileges bar */}
        <div className="bg-sky-950/80 text-sky-200 px-4 py-1.5 text-[11px] border-t border-slate-800 flex items-center justify-between">
          <div className="max-w-7xl mx-auto w-full flex items-center justify-between gap-2">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
              <span>
                Droits d'administration activés pour <strong>{ADMIN_EMAIL}</strong> (Ajout, modification, suppression de produits & catalogue autorisés).
              </span>
            </span>
            <span className="hidden sm:inline-block font-mono text-[10px] text-sky-400 bg-sky-900/60 px-2 py-0.5 rounded">
              Privilèges Exclusifs Vérifiés
            </span>
          </div>
        </div>


        {/* Tab Navigation */}
        <div className="max-w-7xl mx-auto px-4 flex gap-1 overflow-x-auto text-xs font-bold scrollbar-none border-t border-slate-800/80 pt-1">
          <button
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2.5 rounded-t-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'dashboard'
                ? 'bg-slate-100 text-sky-800 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <TrendingUp className="w-4 h-4" />
            <span>Tableau de bord</span>
          </button>

          <button
            onClick={() => setActiveTab('products')}
            className={`px-4 py-2.5 rounded-t-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'products'
                ? 'bg-slate-100 text-sky-800 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Package className="w-4 h-4" />
            <span>Produits ({products.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('stocks')}
            className={`px-4 py-2.5 rounded-t-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'stocks'
                ? 'bg-slate-100 text-sky-800 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <AlertTriangle className="w-4 h-4 text-amber-400" />
            <span>Gestion des Stocks</span>
            {(lowStockCount > 0 || outOfStockCount > 0) && (
              <span className="px-1.5 py-0.2 bg-rose-500 text-white rounded-full text-[10px]">
                {lowStockCount + outOfStockCount}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('orders')}
            className={`px-4 py-2.5 rounded-t-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'orders'
                ? 'bg-slate-100 text-sky-800 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <ShoppingBag className="w-4 h-4" />
            <span>Commandes ({orders.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('categories')}
            className={`px-4 py-2.5 rounded-t-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'categories'
                ? 'bg-slate-100 text-sky-800 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            <span>Catégories ({categories.length})</span>
          </button>

          <button
            onClick={() => setActiveTab('clients')}
            className={`px-4 py-2.5 rounded-t-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'clients'
                ? 'bg-slate-100 text-sky-800 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Clients & Établissements</span>
          </button>

          <button
            onClick={() => setActiveTab('settings')}
            className={`px-4 py-2.5 rounded-t-xl transition-colors cursor-pointer flex items-center gap-2 ${
              activeTab === 'settings'
                ? 'bg-slate-100 text-sky-800 font-extrabold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>Coordonnées & WhatsApp</span>
          </button>
        </div>
      </header>

      {/* Main Container */}
      <main className="max-w-7xl mx-auto px-4 py-6 flex-1 w-full space-y-6">
        {/* TAB 1: DASHBOARD */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6">
            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Volume des Ventes
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {formatFCFA(totalRevenue)}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Toutes commandes confondues
                  </span>
                </div>
                <div className="p-3 bg-sky-50 text-sky-600 rounded-xl">
                  <TrendingUp className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Commandes Reçues
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {totalOrdersCount}
                  </div>
                  <span className="text-[11px] text-emerald-600 font-bold">
                    Via WhatsApp & Web
                  </span>
                </div>
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                  <ShoppingBag className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Alertes Stock Faible
                  </span>
                  <div className="text-2xl font-black text-amber-600 mt-1">
                    {lowStockCount}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Seuil critique atteint
                  </span>
                </div>
                <div className="p-3 bg-amber-50 text-amber-600 rounded-xl">
                  <AlertTriangle className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex items-center justify-between">
                <div>
                  <span className="text-xs font-bold uppercase text-slate-400">
                    Catalogue Médical
                  </span>
                  <div className="text-2xl font-black text-slate-900 mt-1">
                    {products.length}
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">
                    Articles actifs référencés
                  </span>
                </div>
                <div className="p-3 bg-indigo-50 text-indigo-600 rounded-xl">
                  <Package className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent orders */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Left Column: Recent Orders */}
              <div className="lg:col-span-8 bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-extrabold text-base text-slate-900">
                      Dernières Commandes & Devis Reçus
                    </h3>
                    <p className="text-xs text-slate-500">
                      Validation, facturation et préparation des envois
                    </p>
                  </div>
                  <button
                    onClick={() => setActiveTab('orders')}
                    className="text-xs text-sky-600 hover:underline font-bold"
                  >
                    Voir tout ({orders.length})
                  </button>
                </div>

                {orders.length === 0 ? (
                  <div className="py-12 text-center text-slate-400 text-xs">
                    Aucune commande enregistrée pour le moment.
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100 overflow-x-auto">
                    {orders.slice(0, 5).map((ord) => (
                      <div
                        key={ord.id}
                        className="py-3 flex items-center justify-between gap-4 hover:bg-slate-50 px-2 rounded-xl transition-colors"
                      >
                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-xs text-slate-800">
                              {ord.orderNumber}
                            </span>
                            <span
                              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                                ord.status === 'Livrée'
                                  ? 'bg-emerald-100 text-emerald-800'
                                  : ord.status === 'Confirmée'
                                  ? 'bg-sky-100 text-sky-800'
                                  : ord.status === 'En préparation'
                                  ? 'bg-amber-100 text-amber-800'
                                  : 'bg-slate-100 text-slate-700'
                              }`}
                            >
                              {ord.status}
                            </span>
                          </div>
                          <p className="text-xs font-semibold text-slate-900 mt-0.5 truncate">
                            {ord.customer.fullName}{' '}
                            {ord.customer.establishmentName && `(${ord.customer.establishmentName})`}
                          </p>
                          <p className="text-[11px] text-slate-500">
                            {formatDate(ord.createdAt)} • {ord.items.length} article(s) • Ville : {ord.customer.city}
                          </p>
                        </div>

                        <div className="flex items-center gap-2 shrink-0">
                          <span className="font-extrabold text-sm text-slate-900">
                            {formatFCFA(ord.totalAmount)}
                          </span>
                          <button
                            onClick={() => onViewInvoice(ord)}
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 cursor-pointer"
                            title="Consulter Facture / Bon"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Right Column: Stock Alerts */}
              <div className="lg:col-span-4 bg-white rounded-2xl border border-slate-200 shadow-xs p-5 flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="font-extrabold text-base text-slate-900 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-amber-500" />
                      <span>Alertes Stocks</span>
                    </h3>
                    <button
                      onClick={() => {
                        setStockFilter('low');
                        setActiveTab('stocks');
                      }}
                      className="text-xs text-sky-600 hover:underline font-bold"
                    >
                      Gérer
                    </button>
                  </div>

                  <div className="space-y-3">
                    {products
                      .filter((p) => p.stockQuantity <= p.lowStockThreshold)
                      .slice(0, 5)
                      .map((prod) => (
                        <div
                          key={prod.id}
                          className="p-3 rounded-xl border border-slate-100 bg-slate-50 flex items-center justify-between"
                        >
                          <div className="min-w-0 pr-2">
                            <span className="text-[10px] font-mono font-bold text-slate-500">
                              {prod.reference}
                            </span>
                            <h4 className="text-xs font-bold text-slate-800 truncate">
                              {prod.name}
                            </h4>
                          </div>
                          <div className="text-right shrink-0">
                            <span
                              className={`text-xs font-black px-2 py-0.5 rounded-md ${
                                prod.stockQuantity <= 0
                                  ? 'bg-rose-100 text-rose-700'
                                  : 'bg-amber-100 text-amber-700'
                              }`}
                            >
                              {prod.stockQuantity <= 0
                                ? 'Rupture'
                                : `${prod.stockQuantity} restants`}
                            </span>
                            <button
                              onClick={() => handleOpenStockAdjust(prod)}
                              className="block text-[10px] text-sky-600 hover:underline font-bold mt-1"
                            >
                              + Réappro
                            </button>
                          </div>
                        </div>
                      ))}

                    {products.filter((p) => p.stockQuantity <= p.lowStockThreshold).length === 0 && (
                      <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100 text-emerald-800 text-xs flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                        <span>Tous les stocks sont à un niveau optimal !</span>
                      </div>
                    )}
                  </div>
                </div>

                <div className="pt-4 mt-4 border-t border-slate-100">
                  <button
                    onClick={handleOpenAddProduct}
                    className="w-full py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Ajouter un nouveau produit médical</span>
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: PRODUCTS CRUD */}
        {activeTab === 'products' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            {/* Top Toolbar */}
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Catalogue des Produits Médicaux & Chirurgicaux
                </h3>
                <p className="text-xs text-slate-500">
                  Ajoutez, modifiez les désignations, prix en FCFA, stocks et spécifications
                </p>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleOpenAddProduct}
                  className="px-4 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 shadow-xs cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nouveau Produit</span>
                </button>
              </div>
            </div>

            {/* Filter & Search Bar */}
            <div className="flex flex-col sm:flex-row gap-3 pt-2">
              <div className="relative flex-1">
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  placeholder="Filtrer par nom, référence ou marque..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setStockFilter('all')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold ${
                    stockFilter === 'all'
                      ? 'bg-slate-900 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Tous ({products.length})
                </button>
                <button
                  onClick={() => setStockFilter('low')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold ${
                    stockFilter === 'low'
                      ? 'bg-amber-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Stock Faible ({lowStockCount})
                </button>
                <button
                  onClick={() => setStockFilter('out')}
                  className={`px-3 py-2 rounded-xl text-xs font-bold ${
                    stockFilter === 'out'
                      ? 'bg-rose-600 text-white'
                      : 'bg-slate-100 text-slate-700'
                  }`}
                >
                  Rupture ({outOfStockCount})
                </button>
              </div>
            </div>

            {/* Products Table */}
            <div className="overflow-x-auto border border-slate-200 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px] tracking-wider">
                  <tr>
                    <th className="py-3 px-3">Réf.</th>
                    <th className="py-3 px-3">Visuel</th>
                    <th className="py-3 px-3">Désignation</th>
                    <th className="py-3 px-3">Catégorie</th>
                    <th className="py-3 px-3 text-right">Prix (FCFA)</th>
                    <th className="py-3 px-3 text-center">Stock</th>
                    <th className="py-3 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filteredProducts.map((prod) => (
                    <tr key={prod.id} className="hover:bg-slate-50/80">
                      <td className="py-3 px-3 font-mono font-bold text-slate-700 whitespace-nowrap">
                        {prod.reference}
                      </td>
                      <td className="py-3 px-3">
                        <img
                          src={prod.images[0]}
                          alt={prod.name}
                          className="w-10 h-10 object-cover rounded-lg border border-slate-200"
                        />
                      </td>
                      <td className="py-3 px-3 max-w-xs">
                        <p className="font-bold text-slate-900 leading-snug line-clamp-1">
                          {prod.name}
                        </p>
                        <span className="text-[11px] text-slate-500">
                          {prod.brand} {prod.isSterile && '• Stérile'}
                        </span>
                      </td>
                      <td className="py-3 px-3">
                        <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[11px] font-semibold">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right font-extrabold text-slate-900 whitespace-nowrap">
                        {formatFCFA(prod.price)}
                      </td>
                      <td className="py-3 px-3 text-center">
                        <span
                          className={`inline-block px-2 py-0.5 rounded-full font-bold text-[11px] ${
                            prod.stockQuantity <= 0
                              ? 'bg-rose-100 text-rose-800'
                              : prod.stockQuantity <= prod.lowStockThreshold
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {prod.stockQuantity} un.
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right whitespace-nowrap">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleOpenStockAdjust(prod)}
                            className="p-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 transition-colors"
                            title="Ajuster le stock"
                          >
                            <TrendingUp className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleOpenEditProduct(prod)}
                            className="p-1.5 rounded-lg bg-sky-50 text-sky-700 hover:bg-sky-100 transition-colors"
                            title="Modifier"
                          >
                            <Edit2 className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => {
                              if (confirm(`Confirmez-vous la suppression de "${prod.name}" ?`)) {
                                deleteProduct(prod.id);
                              }
                            }}
                            className="p-1.5 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 transition-colors"
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TAB 3: GESTION DES STOCKS (Entrées, Sorties, Alertes) */}
        {activeTab === 'stocks' && (
          <div className="space-y-6">
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                <div>
                  <h3 className="font-extrabold text-lg text-slate-900">
                    Traçabilité & Gestion des Niveaux de Stock
                  </h3>
                  <p className="text-xs text-slate-500">
                    Circuit : Entrées Fournisseurs → Stock Disponible → Commandes Clients → Sorties
                  </p>
                </div>
              </div>

              {/* Status summary */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs">
                  <span className="font-bold text-emerald-800 block">Stock Disponible Global</span>
                  <span className="text-xl font-black text-emerald-900 mt-1 block">
                    {products.reduce((sum, p) => sum + p.stockQuantity, 0)} unités
                  </span>
                  <span className="text-[11px] text-emerald-700">Sur l'ensemble du dépôt</span>
                </div>

                <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs">
                  <span className="font-bold text-amber-800 block">Articles en Stock Faible</span>
                  <span className="text-xl font-black text-amber-900 mt-1 block">
                    {lowStockCount} référence(s)
                  </span>
                  <span className="text-[11px] text-amber-700">Seuil d'alerte atteint</span>
                </div>

                <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-xs">
                  <span className="font-bold text-rose-800 block">Ruptures Confirmées</span>
                  <span className="text-xl font-black text-rose-900 mt-1 block">
                    {outOfStockCount} référence(s)
                  </span>
                  <span className="text-[11px] text-rose-700">Réapprovisionnement requis</span>
                </div>
              </div>

              {/* Products Quick Stock Editor */}
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Réf.</th>
                      <th className="py-3 px-3">Désignation</th>
                      <th className="py-3 px-3 text-center">Quantité En Stock</th>
                      <th className="py-3 px-3 text-center">Seuil Alerte</th>
                      <th className="py-3 px-3 text-center">État</th>
                      <th className="py-3 px-3 text-right">Approvisionner</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {products.map((p) => (
                      <tr key={p.id} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-mono font-bold text-slate-700">
                          {p.reference}
                        </td>
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {p.name}
                        </td>
                        <td className="py-3 px-3 text-center font-extrabold text-sm">
                          {p.stockQuantity}
                        </td>
                        <td className="py-3 px-3 text-center text-slate-500 font-medium">
                          {p.lowStockThreshold}
                        </td>
                        <td className="py-3 px-3 text-center">
                          {p.stockQuantity <= 0 ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-100 text-rose-800">
                              Rupture
                            </span>
                          ) : p.stockQuantity <= p.lowStockThreshold ? (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800">
                              Faible
                            </span>
                          ) : (
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                              Normal
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <button
                            onClick={() => handleOpenStockAdjust(p)}
                            className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer shadow-xs"
                          >
                            + Mouvement
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Stock Movement Audit Log */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
              <h4 className="font-extrabold text-base text-slate-900 mb-3">
                Journal Récent des Mouvements de Stock
              </h4>
              {stockMovements.length === 0 ? (
                <p className="text-xs text-slate-400">Aucun mouvement pour le moment.</p>
              ) : (
                <div className="divide-y divide-slate-100 overflow-x-auto">
                  {stockMovements.slice(0, 10).map((mov) => (
                    <div
                      key={mov.id}
                      className="py-2.5 flex items-center justify-between gap-4 text-xs"
                    >
                      <div className="flex items-center gap-2">
                        {mov.type === 'IN' ? (
                          <span className="p-1 rounded bg-emerald-100 text-emerald-700">
                            <ArrowDownLeft className="w-3.5 h-3.5" />
                          </span>
                        ) : mov.type === 'SALE' ? (
                          <span className="p-1 rounded bg-sky-100 text-sky-700">
                            <ShoppingBag className="w-3.5 h-3.5" />
                          </span>
                        ) : (
                          <span className="p-1 rounded bg-amber-100 text-amber-700">
                            <ArrowUpRight className="w-3.5 h-3.5" />
                          </span>
                        )}
                        <div>
                          <p className="font-bold text-slate-800">
                            {mov.productName} ({mov.reference})
                          </p>
                          <p className="text-[11px] text-slate-500">
                            Motif : {mov.reason} • {formatDate(mov.date)}
                          </p>
                        </div>
                      </div>

                      <div className="text-right font-mono font-bold">
                        <span
                          className={
                            mov.type === 'IN'
                              ? 'text-emerald-700'
                              : 'text-slate-800'
                          }
                        >
                          {mov.type === 'IN' ? `+${mov.quantity}` : `-${mov.quantity}`} un.
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 4: ORDERS & QUOTES */}
        {activeTab === 'orders' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Commandes Clients & Devis Proforma
                </h3>
                <p className="text-xs text-slate-500">
                  Suivi des statuts, génération de factures et contact direct WhatsApp avec les praticiens
                </p>
              </div>

              <div className="w-full sm:w-72">
                <input
                  type="text"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                  placeholder="Rechercher par N° commande, nom ou téléphone..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs"
                />
              </div>
            </div>

            {orders.length === 0 ? (
              <div className="py-16 text-center text-slate-400 text-xs">
                Aucune commande enregistrée pour le moment.
              </div>
            ) : (
              <div className="space-y-3">
                {filteredOrders.map((ord) => {
                  const clientWhatsApp = ord.customer.phone.replace(/[^0-9]/g, '');
                  const clientChatUrl = `https://wa.me/${clientWhatsApp}?text=${encodeURIComponent(`Bonjour ${ord.customer.fullName}, je vous contacte depuis CongoMed au sujet de votre commande ${ord.orderNumber}.`)}`;

                  return (
                    <div
                      key={ord.id}
                      className="p-4 rounded-2xl border border-slate-200 hover:border-sky-300 bg-white transition-all shadow-2xs space-y-3"
                    >
                      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-2">
                          <span className="font-mono font-extrabold text-sm text-slate-900 bg-slate-100 px-2 py-0.5 rounded">
                            {ord.orderNumber}
                          </span>
                          <span className="text-xs text-slate-500 font-mono">
                            {ord.invoiceNumber}
                          </span>
                          <span className="text-xs text-slate-400">•</span>
                          <span className="text-xs text-slate-600 font-medium">
                            {formatDate(ord.createdAt)}
                          </span>
                        </div>

                        {/* Status selector */}
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-slate-600">Statut :</span>
                          <select
                            value={ord.status}
                            onChange={(e) =>
                              updateOrderStatus(
                                ord.id,
                                e.target.value as OrderStatus
                              )
                            }
                            className="px-2.5 py-1 text-xs font-bold rounded-lg border border-slate-300 bg-slate-50 focus:bg-white outline-hidden cursor-pointer"
                          >
                            <option value="En attente">En attente</option>
                            <option value="Confirmée">Confirmée</option>
                            <option value="En préparation">En préparation</option>
                            <option value="Expédiée">Expédiée</option>
                            <option value="Livrée">Livrée</option>
                            <option value="Annulée">Annulée</option>
                          </select>
                        </div>
                      </div>

                      {/* Client + Items */}
                      <div className="grid grid-cols-1 md:grid-cols-12 gap-4 text-xs">
                        <div className="md:col-span-5 space-y-1">
                          <p className="font-extrabold text-slate-900 text-sm">
                            {ord.customer.fullName}
                          </p>
                          <p className="font-semibold text-sky-800">
                            {ord.customer.establishmentName || ord.customer.establishmentType}
                          </p>
                          <p className="text-slate-600">
                            📞 {ord.customer.phone}
                          </p>
                          <p className="text-slate-600">
                            📍 {ord.customer.address}, {ord.customer.city}
                          </p>
                          {ord.customer.deliveryNotes && (
                            <p className="text-[11px] text-slate-500 italic">
                              Note : {ord.customer.deliveryNotes}
                            </p>
                          )}
                        </div>

                        <div className="md:col-span-4 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                          <span className="font-bold text-slate-700 block mb-1">
                            Articles ({ord.items.length}) :
                          </span>
                          <div className="space-y-1 max-h-24 overflow-y-auto pr-1">
                            {ord.items.map((item, idx) => (
                              <div
                                key={idx}
                                className="flex justify-between text-[11px] text-slate-600"
                              >
                                <span className="truncate max-w-[180px]">
                                  {item.quantity}x {item.name}
                                </span>
                                <span className="font-bold text-slate-800 shrink-0">
                                  {formatFCFA(item.totalPrice)}
                                </span>
                              </div>
                            ))}
                          </div>
                        </div>

                        <div className="md:col-span-3 flex flex-col justify-between items-end">
                          <div className="text-right">
                            <span className="text-[10px] uppercase font-bold text-slate-400 block">
                              Total Commande
                            </span>
                            <span className="text-lg font-black text-slate-900">
                              {formatFCFA(ord.totalAmount)}
                            </span>
                          </div>

                          <div className="flex gap-2 mt-2">
                            <a
                              href={clientChatUrl}
                              target="_blank"
                              rel="noreferrer"
                              className="px-3 py-1.5 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 font-bold text-xs flex items-center gap-1 border border-emerald-200"
                              title="Contacter le client sur WhatsApp"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>WhatsApp</span>
                            </a>

                            <button
                              onClick={() => onViewInvoice(ord)}
                              className="px-3 py-1.5 rounded-lg bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-1.5 cursor-pointer shadow-xs"
                              title="Consulter, imprimer ou enregistrer en PDF"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Imprimer / Facture PDF</span>
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* TAB 5: CATEGORIES CRUD */}
        {activeTab === 'categories' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div className="flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-lg text-slate-900">
                  Gestion des Catégories de Produits
                </h3>
                <p className="text-xs text-slate-500">
                  Structurez vos rayons médicaux, chirurgicaux et consommables
                </p>
              </div>
              <button
                onClick={() => setIsCategoryModalOpen(true)}
                className="px-4 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs flex items-center gap-2 cursor-pointer shadow-xs"
              >
                <Plus className="w-4 h-4" />
                <span>Nouvelle Catégorie</span>
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 pt-2">
              {categories.map((cat) => {
                const count = products.filter((p) => p.category === cat.name).length;
                return (
                  <div
                    key={cat.id}
                    className="p-4 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3"
                  >
                    <div>
                      <h4 className="font-bold text-sm text-slate-900">
                        {cat.name}
                      </h4>
                      <p className="text-xs text-slate-500 mt-1">
                        {cat.description}
                      </p>
                      <span className="inline-block mt-2 px-2 py-0.5 rounded text-[11px] font-bold bg-sky-100 text-sky-800">
                        {count} produit{count > 1 ? 's' : ''} actif{count > 1 ? 's' : ''}
                      </span>
                    </div>

                    <button
                      onClick={() => {
                        if (confirm(`Supprimer la catégorie "${cat.name}" ?`)) {
                          deleteCategory(cat.id);
                        }
                      }}
                      className="text-slate-400 hover:text-rose-600 p-1"
                      title="Supprimer la catégorie"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 6: CLIENTS */}
        {activeTab === 'clients' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Répertoire des Clients & Établissements
              </h3>
              <p className="text-xs text-slate-500">
                Liste des hôpitaux, cliniques, pharmacies et praticiens ayant commandé
              </p>
            </div>

            {clientsList.length === 0 ? (
              <div className="py-12 text-center text-slate-400 text-xs">
                Aucun client enregistré pour l'instant.
              </div>
            ) : (
              <div className="overflow-x-auto border border-slate-200 rounded-xl">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50 text-slate-600 font-bold border-b border-slate-200 uppercase text-[10px]">
                    <tr>
                      <th className="py-3 px-3">Nom du Praticien</th>
                      <th className="py-3 px-3">Établissement</th>
                      <th className="py-3 px-3">Téléphone / WhatsApp</th>
                      <th className="py-3 px-3">Ville</th>
                      <th className="py-3 px-3 text-center">Commandes</th>
                      <th className="py-3 px-3 text-right">Total Dépensé</th>
                      <th className="py-3 px-3 text-right">Contacter</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100">
                    {clientsList.map((c, idx) => (
                      <tr key={idx} className="hover:bg-slate-50">
                        <td className="py-3 px-3 font-bold text-slate-900">
                          {c.customer.fullName}
                        </td>
                        <td className="py-3 px-3 font-medium text-slate-700">
                          {c.customer.establishmentName || c.customer.establishmentType}
                        </td>
                        <td className="py-3 px-3 text-slate-600">
                          {c.customer.phone}
                        </td>
                        <td className="py-3 px-3 text-slate-700 font-semibold">
                          {c.customer.city}
                        </td>
                        <td className="py-3 px-3 text-center font-bold">
                          {c.ordersCount}
                        </td>
                        <td className="py-3 px-3 text-right font-extrabold text-slate-900">
                          {formatFCFA(c.totalSpent)}
                        </td>
                        <td className="py-3 px-3 text-right">
                          <a
                            href={`https://wa.me/${c.customer.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(`Bonjour ${c.customer.fullName}, je vous contacte depuis CongoMed.`)}`}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center gap-1 px-2.5 py-1 rounded bg-emerald-50 text-emerald-700 font-bold hover:bg-emerald-100"
                          >
                            <Phone className="w-3 h-3" />
                            <span>WhatsApp</span>
                          </a>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 7: SETTINGS & WHATSAPP NUMBER */}
        {activeTab === 'settings' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 max-w-3xl space-y-6">
            <div>
              <h3 className="font-extrabold text-lg text-slate-900">
                Paramètres de la Plateforme & Coordonnées
              </h3>
              <p className="text-xs text-slate-500">
                Configurez le numéro WhatsApp administrateur de réception des commandes (+242 05 059 95 60) et les mentions de facturation.
              </p>
            </div>

            <form onSubmit={handleSaveSettings} className="space-y-4">
              <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 space-y-3">
                <h4 className="text-xs font-bold uppercase text-emerald-900 tracking-wider flex items-center gap-2">
                  <Phone className="w-4 h-4 text-emerald-700" />
                  <span>Numéro WhatsApp Administrateur (Réception des Commandes)</span>
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Numéro affiché (format international)
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.whatsappNumber}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          whatsappNumber: e.target.value,
                        })
                      }
                      placeholder="+242 05 059 95 60"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-bold text-slate-900"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      Numéro brut wa.me (chiffres uniquement)
                    </label>
                    <input
                      type="text"
                      required
                      value={settingsForm.whatsappRaw}
                      onChange={(e) =>
                        setSettingsForm({
                          ...settingsForm,
                          whatsappRaw: e.target.value.replace(/[^0-9]/g, ''),
                        })
                      }
                      placeholder="242050599560"
                      className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono font-bold text-slate-900"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Raison Sociale de l'Entreprise
                  </label>
                  <input
                    type="text"
                    required
                    value={settingsForm.storeName}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        storeName: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    E-mail officiel
                  </label>
                  <input
                    type="email"
                    required
                    value={settingsForm.email}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        email: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Adresse physique / Siège
                  </label>
                  <input
                    type="text"
                    value={settingsForm.address}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        address: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    Ville & Pays
                  </label>
                  <input
                    type="text"
                    value={`${settingsForm.city}, ${settingsForm.country}`}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        city: e.target.value.split(',')[0]?.trim() || 'Brazzaville',
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    RCCM (Registre de Commerce)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.rccm}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        rccm: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">
                    NIF (Numéro d'Identification Fiscale)
                  </label>
                  <input
                    type="text"
                    value={settingsForm.nif}
                    onChange={(e) =>
                      setSettingsForm({
                        ...settingsForm,
                        nif: e.target.value,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-xs font-mono"
                  />
                </div>
              </div>

              <div className="pt-4 flex justify-between items-center border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => {
                    if (confirm('Voulez-vous réinitialiser le catalogue avec les données de démonstration officielles ?')) {
                      resetToInitialData();
                    }
                  }}
                  className="text-xs text-rose-600 hover:underline font-bold flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Réinitialiser Données Démo</span>
                </button>

                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-xs cursor-pointer shadow-md shadow-sky-600/20"
                >
                  Enregistrer les paramètres
                </button>
              </div>
            </form>
          </div>
        )}
      </main>

      {/* MODAL: ADD / EDIT PRODUCT */}
      {isProductModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-5 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-base text-white">
                  {editingProduct ? 'Modifier le Produit Médical' : 'Ajouter un Produit Médical'}
                </h3>
                <p className="text-xs text-slate-400">
                  Définissez la référence, catégorie, prix FCFA et stocks
                </p>
              </div>
              <button
                onClick={() => setIsProductModalOpen(false)}
                className="p-1.5 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveProduct} className="p-5 space-y-4 max-h-[80vh] overflow-y-auto text-xs">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Référence Catalogue *
                  </label>
                  <input
                    type="text"
                    required
                    value={prodForm.reference}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, reference: e.target.value })
                    }
                    placeholder="Ex: REF-CS-099"
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Catégorie *
                  </label>
                  <select
                    value={prodForm.category}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, category: e.target.value })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-medium"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.name}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Désignation complète du produit *
                </label>
                <input
                  type="text"
                  required
                  value={prodForm.name}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, name: e.target.value })
                  }
                  placeholder="Ex: Compresses stériles 10x10cm (Boîte de 100)"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Prix (FCFA) *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    step="500"
                    value={prodForm.price}
                    onChange={(e) =>
                      setProdForm({
                        ...prodForm,
                        price: parseFloat(e.target.value) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Stock Initial / Dispo *
                  </label>
                  <input
                    type="number"
                    required
                    min="0"
                    value={prodForm.stockQuantity}
                    onChange={(e) =>
                      setProdForm({
                        ...prodForm,
                        stockQuantity: parseInt(e.target.value, 10) || 0,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Seuil Alerte Stock Faible
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={prodForm.lowStockThreshold}
                    onChange={(e) =>
                      setProdForm({
                        ...prodForm,
                        lowStockThreshold: parseInt(e.target.value, 10) || 5,
                      })
                    }
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Marque / Fabricant
                  </label>
                  <input
                    type="text"
                    value={prodForm.brand}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, brand: e.target.value })
                    }
                    placeholder="Ex: 3M, Ansell, Yuwell..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>

                <div>
                  <label className="block font-bold text-slate-700 mb-1">
                    Conditionnement (Packaging)
                  </label>
                  <input
                    type="text"
                    value={prodForm.packaging || ''}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, packaging: e.target.value })
                    }
                    placeholder="Ex: Boîte de 100, Carton de 50..."
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                  />
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  URL Image principale
                </label>
                <input
                  type="url"
                  value={prodForm.images[0] || ''}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, images: [e.target.value] })
                  }
                  placeholder="https://..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-mono text-[11px]"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description clinique & usage
                </label>
                <textarea
                  rows={3}
                  value={prodForm.description}
                  onChange={(e) =>
                    setProdForm({ ...prodForm, description: e.target.value })
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="flex gap-4 pt-2">
                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={prodForm.isSterile}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, isSterile: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-sky-600"
                  />
                  <span>Dispositif Stérile</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer font-bold text-slate-700">
                  <input
                    type="checkbox"
                    checked={prodForm.featured}
                    onChange={(e) =>
                      setProdForm({ ...prodForm, featured: e.target.checked })
                    }
                    className="w-4 h-4 rounded text-sky-600"
                  />
                  <span>Mettre en avant (Recommandé)</span>
                </label>
              </div>

              <div className="pt-4 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProductModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  {editingProduct ? 'Mettre à jour' : 'Créer le produit'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: STOCK ADJUSTMENT */}
      {isStockModalOpen && selectedStockProduct && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <div>
                <h3 className="font-extrabold text-sm text-white">
                  Mouvement de Stock
                </h3>
                <p className="text-[11px] text-slate-400">
                  {selectedStockProduct.name} ({selectedStockProduct.reference})
                </p>
              </div>
              <button
                onClick={() => setIsStockModalOpen(false)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleApplyStockMovement} className="p-5 space-y-4 text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border border-slate-200 flex justify-between">
                <span>Stock actuel disponible :</span>
                <span className="font-extrabold text-slate-900">
                  {selectedStockProduct.stockQuantity} unités
                </span>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Type d'opération
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setStockMovementType('IN');
                      setStockReason('Entrée de stock fournisseur');
                    }}
                    className={`py-2 rounded-xl font-bold text-xs ${
                      stockMovementType === 'IN'
                        ? 'bg-emerald-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    + Entrée (Réappro)
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setStockMovementType('OUT');
                      setStockReason('Sortie pour dotation interne ou avarie');
                    }}
                    className={`py-2 rounded-xl font-bold text-xs ${
                      stockMovementType === 'OUT'
                        ? 'bg-rose-600 text-white shadow-xs'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    - Sortie de stock
                  </button>
                </div>
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Quantité à {stockMovementType === 'IN' ? 'ajouter' : 'déduire'}
                </label>
                <input
                  type="number"
                  min="1"
                  required
                  value={stockDelta}
                  onChange={(e) =>
                    setStockDelta(parseInt(e.target.value, 10) || 1)
                  }
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl text-base font-bold text-slate-900"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Motif du mouvement (Traçabilité)
                </label>
                <input
                  type="text"
                  required
                  value={stockReason}
                  onChange={(e) => setStockReason(e.target.value)}
                  placeholder="Ex: Réception conteneur, livraison fournisseur..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsStockModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  Valider le mouvement
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: ADD CATEGORY */}
      {isCategoryModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl overflow-hidden border border-slate-200">
            <div className="p-4 bg-slate-900 text-white flex justify-between items-center">
              <h3 className="font-extrabold text-sm text-white">
                Ajouter une Catégorie Médicale
              </h3>
              <button
                onClick={() => setIsCategoryModalOpen(false)}
                className="p-1 rounded bg-slate-800 text-slate-400 hover:text-white"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleCreateCategory} className="p-5 space-y-4 text-xs">
              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Nom de la catégorie *
                </label>
                <input
                  type="text"
                  required
                  value={newCatName}
                  onChange={(e) => setNewCatName(e.target.value)}
                  placeholder="Ex: Mobilier Hospitalier, Imagerie Médicale..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl font-bold"
                />
              </div>

              <div>
                <label className="block font-bold text-slate-700 mb-1">
                  Description succincte
                </label>
                <textarea
                  rows={2}
                  value={newCatDesc}
                  onChange={(e) => setNewCatDesc(e.target.value)}
                  placeholder="Description des articles contenus..."
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-300 rounded-xl"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCategoryModalOpen(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 font-bold"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold"
                >
                  Créer la Catégorie
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
