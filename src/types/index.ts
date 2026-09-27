export interface TechnicalSpec {
  label: string;
  value: string;
}

export interface Product {
  id: string;
  reference: string;
  name: string;
  category: string;
  description: string;
  price: number; // in FCFA
  stockQuantity: number;
  lowStockThreshold: number;
  images: string[];
  brand: string;
  technicalSpecs: TechnicalSpec[];
  isAvailable: boolean;
  isSterile?: boolean;
  certification?: string;
  packaging?: string;
  requiresQuote?: boolean;
  featured?: boolean;
}

export interface Category {
  id: string;
  name: string;
  slug: string;
  description: string;
  iconName: string;
}

export interface CartItem {
  product: Product;
  quantity: number;
}

export interface CustomerInfo {
  fullName: string;
  phone: string;
  email: string;
  establishmentType: string;
  establishmentName: string;
  address: string;
  city: string;
  deliveryNotes?: string;
}

export interface OrderItem {
  productId: string;
  reference: string;
  name: string;
  brand: string;
  packaging?: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  image?: string;
}

export type OrderStatus =
  | 'En attente'
  | 'Confirmée'
  | 'En préparation'
  | 'Expédiée'
  | 'Livrée'
  | 'Annulée';

export interface Order {
  id: string;
  orderNumber: string;
  invoiceNumber: string;
  createdAt: string;
  customer: CustomerInfo;
  items: OrderItem[];
  totalAmount: number;
  status: OrderStatus;
  orderType: 'order' | 'quote';
  paymentMethod: string;
  notes?: string;
}

export interface StockMovement {
  id: string;
  productId: string;
  productName: string;
  reference: string;
  type: 'IN' | 'OUT' | 'ADJUSTMENT' | 'SALE';
  quantity: number;
  date: string;
  reason: string;
  performedBy?: string;
}

export interface StoreSettings {
  storeName: string;
  tagline: string;
  whatsappNumber: string; // e.g. "+242 05 059 95 60"
  whatsappRaw: string; // "242050599560"
  email: string;
  address: string;
  city: string;
  country: string;
  rccm: string;
  nif: string;
  currency: string;
}

export interface AdminUser {
  email: string;
  name: string;
  role: 'admin';
  lastLogin: string;
}

