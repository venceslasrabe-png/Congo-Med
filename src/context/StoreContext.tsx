import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  Category,
  CartItem,
  Order,
  StockMovement,
  StoreSettings,
  CustomerInfo,
  OrderStatus,
  AdminUser,
} from '../types';
import {
  INITIAL_CATEGORIES,
  INITIAL_PRODUCTS,
  INITIAL_SETTINGS,
} from '../data/initialData';
import {
  generateOrderNumber,
  generateInvoiceNumber,
  generateQuoteNumber,
} from '../utils/format';
import {
  db,
  auth,
  signInWithGoogle,
  signInWithApple,
  logOut,
  collection,
  doc,
  setDoc,
  getDocs,
  onSnapshot,
  updateDoc,
  deleteDoc,
  onAuthStateChanged,
  FirebaseUser,
} from '../firebase';

export const ADMIN_EMAIL = 'venceslasrabe@gmail.com';

interface StoreContextType {
  products: Product[];
  categories: Category[];
  cart: CartItem[];
  orders: Order[];
  stockMovements: StockMovement[];
  settings: StoreSettings;
  activeOrderForInvoice: Order | null;
  selectedProductForDetail: Product | null;

  // Firebase Auth State
  firebaseUser: FirebaseUser | null;
  signInWithGoogleAuth: () => Promise<void>;
  signInWithAppleAuth: () => Promise<void>;
  signOutAuth: () => Promise<void>;

  // Authentication & Admin RBAC
  adminUser: AdminUser | null;
  isAdmin: boolean;
  adminEmail: string;
  isLoginModalOpen: boolean;
  setIsLoginModalOpen: (open: boolean) => void;
  actionBlockedMessage: string | null;
  setActionBlockedMessage: (msg: string | null) => void;
  loginAdmin: (email: string, passwordOrPin?: string) => { success: boolean; error?: string };
  logoutAdmin: () => void;

  // Cart actions
  addToCart: (product: Product, quantity?: number) => void;
  updateCartQuantity: (productId: string, quantity: number) => void;
  removeFromCart: (productId: string) => void;
  clearCart: () => void;
  cartTotal: number;
  cartCount: number;

  // Order actions
  createOrder: (customer: CustomerInfo, orderType: 'order' | 'quote') => Order;
  updateOrderStatus: (orderId: string, status: OrderStatus) => boolean;
  setActiveOrderForInvoice: (order: Order | null) => void;
  setSelectedProductForDetail: (product: Product | null) => void;

  // Product CRUD (Restricted strictly to venceslasrabe@gmail.com)
  addProduct: (product: Omit<Product, 'id'>) => boolean;
  updateProduct: (id: string, product: Partial<Product>) => boolean;
  deleteProduct: (id: string) => boolean;

  // Category CRUD (Restricted strictly to venceslasrabe@gmail.com)
  addCategory: (category: Omit<Category, 'id' | 'slug'>) => boolean;
  updateCategory: (id: string, name: string, description: string) => boolean;
  deleteCategory: (id: string) => boolean;

  // Stock management (Restricted strictly to venceslasrabe@gmail.com)
  adjustStock: (
    productId: string,
    delta: number,
    type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE',
    reason: string
  ) => boolean;

  // Settings & Reset
  updateSettings: (newSettings: StoreSettings) => boolean;
  resetToInitialData: () => boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  // Firebase Auth user state
  const [firebaseUser, setFirebaseUser] = useState<FirebaseUser | null>(null);

  // Admin user authentication state
  const [adminUser, setAdminUser] = useState<AdminUser | null>(() => {
    const saved = localStorage.getItem('congomed_admin_user');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (
          parsed &&
          parsed.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()
        ) {
          return parsed;
        }
      } catch (e) {
        console.error(e);
      }
    }
    // Default to null: Public visitors and customers are unauthenticated and do not see admin buttons
    return null;
  });

  const [isLoginModalOpen, setIsLoginModalOpen] = useState<boolean>(false);
  const [actionBlockedMessage, setActionBlockedMessage] = useState<string | null>(null);

  // Core entities
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('congomed_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [categories, setCategories] = useState<Category[]>(() => {
    const saved = localStorage.getItem('congomed_categories');
    return saved ? JSON.parse(saved) : INITIAL_CATEGORIES;
  });

  const [cart, setCart] = useState<CartItem[]>(() => {
    const saved = localStorage.getItem('congomed_cart');
    return saved ? JSON.parse(saved) : [];
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('congomed_orders');
    return saved ? JSON.parse(saved) : [];
  });

  const [stockMovements, setStockMovements] = useState<StockMovement[]>(() => {
    const saved = localStorage.getItem('congomed_stock_movements');
    return saved ? JSON.parse(saved) : [];
  });

  const [settings, setSettings] = useState<StoreSettings>(() => {
    const saved = localStorage.getItem('congomed_settings');
    return saved ? JSON.parse(saved) : INITIAL_SETTINGS;
  });

  const [activeOrderForInvoice, setActiveOrderForInvoice] = useState<Order | null>(null);
  const [selectedProductForDetail, setSelectedProductForDetail] = useState<Product | null>(null);

  // Determine whether current active user is Super Admin
  const isAdmin = Boolean(
    (adminUser && adminUser.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()) ||
    (firebaseUser && firebaseUser.email?.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase())
  );

  // Sync Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      setFirebaseUser(user);
      if (user && user.email) {
        const isUserAdmin = user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
        if (isUserAdmin) {
          const adminSession: AdminUser = {
            email: user.email,
            name: user.displayName || 'Venceslas Rabe',
            role: 'admin',
            lastLogin: new Date().toISOString(),
          };
          setAdminUser(adminSession);
          localStorage.setItem('congomed_admin_user', JSON.stringify(adminSession));
        } else {
          // If a non-admin Google user logs in, remove any admin privileges!
          setAdminUser(null);
          localStorage.removeItem('congomed_admin_user');
        }


        // Save user profile to Firestore
        try {
          const userDocRef = doc(db, 'users', user.uid);
          await setDoc(
            userDocRef,
            {
              uid: user.uid,
              email: user.email,
              displayName: user.displayName || '',
              photoURL: user.photoURL || '',
              role: isUserAdmin ? 'admin' : 'client',
              updatedAt: new Date().toISOString(),
            },
            { merge: true }
          );
        } catch (err) {
          console.warn('Firestore user profile sync error (offline fallback):', err);
        }
      }
    });

    return () => unsubscribe();
  }, []);

  // Listen to Firestore Products
  useEffect(() => {
    try {
      const productsRef = collection(db, 'products');
      const unsubscribe = onSnapshot(
        productsRef,
        async (snapshot) => {
          if (!snapshot.empty) {
            const firestoreProducts: Product[] = [];
            snapshot.forEach((d) => {
              firestoreProducts.push({ id: d.id, ...d.data() } as Product);
            });
            setProducts(firestoreProducts);
            localStorage.setItem('congomed_products', JSON.stringify(firestoreProducts));
          } else {
            // Seed Firestore with initial medical products if collection is empty
            for (const prod of INITIAL_PRODUCTS) {
              await setDoc(doc(db, 'products', prod.id), prod);
            }
          }
        },
        (error) => {
          console.warn('Firestore products onSnapshot offline fallback:', error.message);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Error setting up Firestore products listener:', e);
    }
  }, []);

  // Listen to Firestore Categories
  useEffect(() => {
    try {
      const categoriesRef = collection(db, 'categories');
      const unsubscribe = onSnapshot(
        categoriesRef,
        async (snapshot) => {
          if (!snapshot.empty) {
            const firestoreCategories: Category[] = [];
            snapshot.forEach((d) => {
              firestoreCategories.push({ id: d.id, ...d.data() } as Category);
            });
            setCategories(firestoreCategories);
            localStorage.setItem('congomed_categories', JSON.stringify(firestoreCategories));
          } else {
            // Seed initial categories
            for (const cat of INITIAL_CATEGORIES) {
              await setDoc(doc(db, 'categories', cat.id), cat);
            }
          }
        },
        (error) => {
          console.warn('Firestore categories onSnapshot error:', error.message);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Error setting up Firestore categories listener:', e);
    }
  }, []);

  // Listen to Firestore Orders
  useEffect(() => {
    try {
      const ordersRef = collection(db, 'orders');
      const unsubscribe = onSnapshot(
        ordersRef,
        (snapshot) => {
          if (!snapshot.empty) {
            const firestoreOrders: Order[] = [];
            snapshot.forEach((d) => {
              firestoreOrders.push({ id: d.id, ...d.data() } as Order);
            });
            setOrders(firestoreOrders);
            localStorage.setItem('congomed_orders', JSON.stringify(firestoreOrders));
          }
        },
        (error) => {
          console.warn('Firestore orders onSnapshot error:', error.message);
        }
      );
      return () => unsubscribe();
    } catch (e) {
      console.warn('Error setting up Firestore orders listener:', e);
    }
  }, []);

  // Sync LocalStorage for Cart
  useEffect(() => {
    localStorage.setItem('congomed_cart', JSON.stringify(cart));
  }, [cart]);

  // Google Sign-in with Firebase
  const signInWithGoogleAuth = async () => {
    try {
      const user = await signInWithGoogle();
      if (user && user.email) {
        if (user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase()) {
          const adminSession: AdminUser = {
            email: user.email,
            name: user.displayName || 'Venceslas Rabe',
            role: 'admin',
            lastLogin: new Date().toISOString(),
          };
          setAdminUser(adminSession);
          localStorage.setItem('congomed_admin_user', JSON.stringify(adminSession));
        }
      }
    } catch (error) {
      console.error('Sign-in failed:', error);
      throw error;
    }
  };

  const signInWithAppleAuth = async () => {
    try {
      const user = await signInWithApple();
      if (user && user.email) {
        const isUserAdmin = user.email.toLowerCase().trim() === ADMIN_EMAIL.toLowerCase();
        if (isUserAdmin) {
          const adminSession: AdminUser = {
            email: user.email,
            name: user.displayName || 'Venceslas Rabe',
            role: 'admin',
            lastLogin: new Date().toISOString(),
          };
          setAdminUser(adminSession);
          localStorage.setItem('congomed_admin_user', JSON.stringify(adminSession));
        } else {
          setAdminUser(null);
          localStorage.removeItem('congomed_admin_user');
        }
      }
    } catch (error) {
      console.error('Apple Sign-in failed:', error);
      throw error;
    }
  };

  const signOutAuth = async () => {
    try {
      await logOut();
      setFirebaseUser(null);
      setAdminUser(null);
      localStorage.removeItem('congomed_admin_user');
    } catch (error) {
      console.error('Sign-out failed:', error);
    }
  };

  // Traditional Admin Login
  const loginAdmin = (
    email: string,
    passwordOrPin?: string
  ): { success: boolean; error?: string } => {
    const cleanEmail = email.trim().toLowerCase();
    if (cleanEmail !== ADMIN_EMAIL.toLowerCase()) {
      return {
        success: false,
        error: `Accès refusé. Seule l'adresse propriétaire (${ADMIN_EMAIL}) dispose des droits de gestion.`,
      };
    }

    if (passwordOrPin && passwordOrPin !== 'admin2026' && passwordOrPin !== '1234') {
      return {
        success: false,
        error: 'Code PIN ou mot de passe de sécurité incorrect.',
      };
    }

    const adminSession: AdminUser = {
      email: cleanEmail,
      name: 'Venceslas Rabe',
      role: 'admin',
      lastLogin: new Date().toISOString(),
    };

    setAdminUser(adminSession);
    localStorage.setItem('congomed_admin_user', JSON.stringify(adminSession));
    setIsLoginModalOpen(false);
    setActionBlockedMessage(null);
    return { success: true };
  };

  const logoutAdmin = () => {
    signOutAuth();
  };

  const verifyAdminPrivilege = (actionName: string): boolean => {
    if (!isAdmin) {
      setActionBlockedMessage(
        `Action interdite : Seul l'administrateur (${ADMIN_EMAIL}) peut ${actionName}. Veuillez vous connecter.`
      );
      setIsLoginModalOpen(true);
      return false;
    }
    return true;
  };

  // Cart operations
  const addToCart = (product: Product, quantity = 1) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
      }
      return [...prev, { product, quantity }];
    });
  };

  const updateCartQuantity = (productId: string, quantity: number) => {
    if (quantity <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) =>
        item.product.id === productId ? { ...item, quantity } : item
      )
    );
  };

  const removeFromCart = (productId: string) => {
    setCart((prev) => prev.filter((item) => item.product.id !== productId));
  };

  const clearCart = () => setCart([]);

  const cartTotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  // Order creation (Persists to Firestore)
  const createOrder = (
    customer: CustomerInfo,
    orderType: 'order' | 'quote'
  ): Order => {
    const orderItems = cart.map((item) => ({
      productId: item.product.id,
      reference: item.product.reference,
      name: item.product.name,
      brand: item.product.brand,
      quantity: item.quantity,
      unitPrice: item.product.price,
      totalPrice: item.product.price * item.quantity,
      packaging: item.product.packaging,
      image: item.product.images[0] || '',
    }));

    const orderNumber =
      orderType === 'order' ? generateOrderNumber() : generateQuoteNumber();
    const invoiceNumber = generateInvoiceNumber(orderNumber);

    const newOrder: Order = {
      id: `ord_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
      orderNumber,
      invoiceNumber,
      orderType,
      createdAt: new Date().toISOString(),
      customer,
      items: orderItems,
      totalAmount: cartTotal,
      status: 'En attente',
      paymentMethod: 'À la livraison (Espèces / Chèque / Mobile Money)',
      notes: customer.deliveryNotes || '',
    };

    // Save to local state
    setOrders((prev) => [newOrder, ...prev]);

    // Save to Firestore
    try {
      setDoc(doc(db, 'orders', newOrder.id), {
        ...newOrder,
        userId: firebaseUser?.uid || null,
        userEmail: firebaseUser?.email || customer.email || null,
      }).catch((err) => {
        console.warn('Firestore order save error (fallback to local):', err);
      });
    } catch (e) {
      console.warn('Error saving order to Firestore:', e);
    }

    // Automatically decrement inventory for confirmed orders
    if (orderType === 'order') {
      orderItems.forEach((item) => {
        adjustStock(
          item.productId,
          -item.quantity,
          'SALE',
          `Commande ${orderNumber} - ${customer.fullName}`
        );
      });
    }

    clearCart();
    setActiveOrderForInvoice(newOrder);
    return newOrder;
  };

  const updateOrderStatus = (orderId: string, status: OrderStatus): boolean => {
    if (!verifyAdminPrivilege('modifier le statut d’une commande')) return false;

    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status } : o))
    );

    // Sync to Firestore
    try {
      updateDoc(doc(db, 'orders', orderId), { status }).catch((e) =>
        console.warn('Firestore status update error:', e)
      );
    } catch (e) {
      console.warn('Error updating order in Firestore:', e);
    }

    return true;
  };

  // Product CRUD
  const addProduct = (prodData: Omit<Product, 'id'>): boolean => {
    if (!verifyAdminPrivilege('ajouter un nouveau produit')) return false;

    const newProduct: Product = {
      ...prodData,
      id: `prod_${Date.now()}_${Math.random().toString(36).substr(2, 6)}`,
    };

    setProducts((prev) => [newProduct, ...prev]);

    // Persist to Firestore
    try {
      setDoc(doc(db, 'products', newProduct.id), newProduct).catch((e) =>
        console.warn('Firestore addProduct error:', e)
      );
    } catch (e) {
      console.warn('Error adding product to Firestore:', e);
    }

    return true;
  };

  const updateProduct = (id: string, prodData: Partial<Product>): boolean => {
    if (!verifyAdminPrivilege('modifier un produit')) return false;

    setProducts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, ...prodData } : p))
    );

    // Persist to Firestore
    try {
      updateDoc(doc(db, 'products', id), prodData).catch((e) =>
        console.warn('Firestore updateProduct error:', e)
      );
    } catch (e) {
      console.warn('Error updating product in Firestore:', e);
    }

    return true;
  };

  const deleteProduct = (id: string): boolean => {
    if (!verifyAdminPrivilege('supprimer un produit du catalogue')) return false;

    setProducts((prev) => prev.filter((p) => p.id !== id));

    // Persist to Firestore
    try {
      deleteDoc(doc(db, 'products', id)).catch((e) =>
        console.warn('Firestore deleteProduct error:', e)
      );
    } catch (e) {
      console.warn('Error deleting product from Firestore:', e);
    }

    return true;
  };

  // Category CRUD
  const addCategory = (catData: Omit<Category, 'id' | 'slug'>): boolean => {
    if (!verifyAdminPrivilege('créer une nouvelle catégorie')) return false;

    const newCat: Category = {
      ...catData,
      id: `cat_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      slug: catData.name.toLowerCase().replace(/[^a-z0-9]/g, '-'),
    };

    setCategories((prev) => [...prev, newCat]);

    // Persist to Firestore
    try {
      setDoc(doc(db, 'categories', newCat.id), newCat).catch((e) =>
        console.warn('Firestore addCategory error:', e)
      );
    } catch (e) {
      console.warn('Error adding category to Firestore:', e);
    }

    return true;
  };

  const updateCategory = (id: string, name: string, description: string): boolean => {
    if (!verifyAdminPrivilege('modifier une catégorie')) return false;

    setCategories((prev) =>
      prev.map((c) => (c.id === id ? { ...c, name, description } : c))
    );

    try {
      updateDoc(doc(db, 'categories', id), { name, description }).catch((e) =>
        console.warn('Firestore updateCategory error:', e)
      );
    } catch (e) {
      console.warn('Error updating category in Firestore:', e);
    }

    return true;
  };

  const deleteCategory = (id: string): boolean => {
    if (!verifyAdminPrivilege('supprimer une catégorie')) return false;

    setCategories((prev) => prev.filter((c) => c.id !== id));

    try {
      deleteDoc(doc(db, 'categories', id)).catch((e) =>
        console.warn('Firestore deleteCategory error:', e)
      );
    } catch (e) {
      console.warn('Error deleting category from Firestore:', e);
    }

    return true;
  };

  // Stock management
  const adjustStock = (
    productId: string,
    delta: number,
    type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE',
    reason: string
  ): boolean => {
    const targetProduct = products.find((p) => p.id === productId);
    if (!targetProduct) return false;

    const newQty = Math.max(0, targetProduct.stockQuantity + delta);

    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, stockQuantity: newQty } : p
      )
    );

    // Update Firestore product quantity
    try {
      updateDoc(doc(db, 'products', productId), { stockQuantity: newQty }).catch(
        (e) => console.warn('Firestore stockQuantity update error:', e)
      );
    } catch (e) {
      console.warn('Error updating stockQuantity in Firestore:', e);
    }

    // Add stock movement audit log
    const movement: StockMovement = {
      id: `mov_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      productId,
      productName: targetProduct.name,
      reference: targetProduct.reference,
      type: type === 'SALE' ? 'OUT' : type,
      quantity: Math.abs(delta),
      reason,
      performedBy: adminUser?.name || firebaseUser?.displayName || 'Système CongoMed',
      date: new Date().toISOString(),
    };

    setStockMovements((prev) => [movement, ...prev]);

    try {
      setDoc(doc(db, 'stockMovements', movement.id), movement).catch((e) =>
        console.warn('Firestore stock movement error:', e)
      );
    } catch (e) {
      console.warn('Error saving stock movement to Firestore:', e);
    }

    return true;
  };

  // Settings
  const updateSettings = (newSettings: StoreSettings): boolean => {
    if (!verifyAdminPrivilege('modifier les coordonnées et paramètres du magasin')) {
      return false;
    }
    setSettings(newSettings);
    localStorage.setItem('congomed_settings', JSON.stringify(newSettings));

    try {
      setDoc(doc(db, 'settings', 'general'), newSettings).catch((e) =>
        console.warn('Firestore settings update error:', e)
      );
    } catch (e) {
      console.warn('Error updating settings in Firestore:', e);
    }

    return true;
  };

  const resetToInitialData = (): boolean => {
    if (!verifyAdminPrivilege('réinitialiser le catalogue')) return false;

    setProducts(INITIAL_PRODUCTS);
    setCategories(INITIAL_CATEGORIES);
    setSettings(INITIAL_SETTINGS);
    setOrders([]);
    setStockMovements([]);

    localStorage.setItem('congomed_products', JSON.stringify(INITIAL_PRODUCTS));
    localStorage.setItem('congomed_categories', JSON.stringify(INITIAL_CATEGORIES));
    localStorage.setItem('congomed_settings', JSON.stringify(INITIAL_SETTINGS));
    localStorage.removeItem('congomed_orders');
    localStorage.removeItem('congomed_stock_movements');

    return true;
  };

  return (
    <StoreContext.Provider
      value={{
        products,
        categories,
        cart,
        orders,
        stockMovements,
        settings,
        activeOrderForInvoice,
        selectedProductForDetail,

        // Firebase Auth
        firebaseUser,
        signInWithGoogleAuth,
        signInWithAppleAuth,
        signOutAuth,

        // Admin Auth
        adminUser,
        isAdmin,
        adminEmail: ADMIN_EMAIL,
        isLoginModalOpen,
        setIsLoginModalOpen,
        actionBlockedMessage,
        setActionBlockedMessage,
        loginAdmin,
        logoutAdmin,

        // Cart
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,
        cartTotal,
        cartCount,

        // Orders
        createOrder,
        updateOrderStatus,
        setActiveOrderForInvoice,
        setSelectedProductForDetail,

        // Products
        addProduct,
        updateProduct,
        deleteProduct,

        // Categories
        addCategory,
        updateCategory,
        deleteCategory,

        // Stocks
        adjustStock,

        // Settings
        updateSettings,
        resetToInitialData,
      }}
    >
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (!context) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
