
export interface MenuItem {
  id: string;
  name: string;
  vendor?: string;
  costPrice: number;
  sellingPrice: number;
  stock: number;
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

export type Page = 'jualan' | 'inventori' | 'laporan' | 'tetapan';