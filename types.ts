
export interface MenuItem {
  id: string;
  name: string;
  vendor?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
  imageUrl?: string;
}

export interface CartItem extends MenuItem {
  quantity: number;
}

export interface Sale {
  id: string;
  timestamp: number;
  items: CartItem[];
  total: number;
  profit: number;
  paymentMethod: 'Tunai' | 'E-Wallet';
  amountReceived?: number;
  change?: number;
}

// FIX: Add missing VendorSubmission interface.
export interface VendorSubmission {
  id: string;
  vendor: string;
  name: string;
  costPrice: number;
  submittedAt: number;
}

export type Page = 'jualan' | 'inventori' | 'laporan' | 'tetapan';