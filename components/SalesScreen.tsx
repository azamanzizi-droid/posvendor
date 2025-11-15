import React, { useState, useMemo } from 'react';
import { MenuItem, CartItem, Sale } from '../types';
import { TrashIcon, CashIcon, WalletIcon, FoodPlaceholderIcon, ShareIcon } from './Icons';
import ReceiptModal from './ReceiptModal';
import CashPaymentModal from './CashPaymentModal';
import ShareModal from './ShareModal';

interface SalesScreenProps {
  inventory: MenuItem[];
  setInventory: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  addSale: (sale: Sale) => void;
  brandName: string;
}

const SalesScreen: React.FC<SalesScreenProps> = ({ inventory, setInventory, addSale, brandName }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receiptData, setReceiptData] = useState<Sale | null>(null);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);
  const [isShareModalOpen, setIsShareModalOpen] = useState(false);
  const [itemToShare, setItemToShare] = useState<MenuItem | null>(null);
  const [cartSearchQuery, setCartSearchQuery] = useState('');
  const [menuSearchQuery, setMenuSearchQuery] = useState('');

  const addToCart = (item: MenuItem) => {
    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      const currentQuantityInCart = existingItem ? existingItem.quantity : 0;
      const requestedQuantity = currentQuantityInCart + 1;

      if (requestedQuantity > item.stock) {
        if (item.stock > 0) {
            alert(`Stok untuk ${item.name} tidak mencukupi. Baki stok: ${item.stock}.`);
        } else {
            alert(`${item.name} sudah habis stok.`);
        }
        return prevCart;
      }

      if (existingItem) {
        return prevCart.map(cartItem =>
          cartItem.id === item.id ? { ...cartItem, quantity: cartItem.quantity + 1 } : cartItem
        );
      } else {
        return [...prevCart, { ...item, quantity: 1 }];
      }
    });
  };

  const removeFromCart = (itemId: string) => {
    setCart(prevCart => prevCart.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: string, newQuantity: number) => {
    const inventoryItem = inventory.find(i => i.id === itemId);
    if (!inventoryItem) return;

    if (newQuantity <= 0) {
      removeFromCart(itemId);
    } else if (newQuantity > inventoryItem.stock) {
        alert(`Stok untuk ${inventoryItem.name} tidak mencukupi. Baki stok: ${inventoryItem.stock}`);
        setCart(prevCart => prevCart.map(item => item.id === itemId ? { ...item, quantity: inventoryItem.stock } : item));
    } else {
      setCart(prevCart => prevCart.map(item => item.id === itemId ? { ...item, quantity: newQuantity } : item));
    }
  };
  
  const handleShareClick = (item: MenuItem, event: React.MouseEvent) => {
    event.stopPropagation(); // Prevent addToCart from firing
    setItemToShare(item);
    setIsShareModalOpen(true);
  };

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0), [cart]);

  const filteredCart = useMemo(() => {
    if (!cartSearchQuery) {
        return cart;
    }
    return cart.filter(item =>
        item.name.toLowerCase().includes(cartSearchQuery.toLowerCase())
    );
  }, [cart, cartSearchQuery]);

  const filteredInventory = useMemo(() => {
    if (!menuSearchQuery) {
        return inventory;
    }
    return inventory.filter(item =>
        item.name.toLowerCase().includes(menuSearchQuery.toLowerCase())
    );
  }, [inventory, menuSearchQuery]);

  const processCheckout = (paymentMethod: 'Tunai' | 'E-Wallet', amountReceived?: number) => {
    if (cart.length === 0) return;

    const profit = cart.reduce((sum, item) => sum + (item.sellingPrice - item.costPrice) * item.quantity, 0);

    const newSale: Sale = {
      id: `sale-${Date.now()}`,
      timestamp: Date.now(),
      items: cart,
      total,
      profit,
      paymentMethod,
    };

    if (paymentMethod === 'Tunai' && amountReceived) {
        newSale.amountReceived = amountReceived;
        newSale.change = amountReceived - total;
    }

    addSale(newSale);

    const newInventory = inventory.map(inventoryItem => {
      const cartItem = cart.find(ci => ci.id === inventoryItem.id);
      if (cartItem) {
        return { ...inventoryItem, stock: inventoryItem.stock - cartItem.quantity };
      }
      return inventoryItem;
    });
    setInventory(newInventory);
    setCart([]);
    setCartSearchQuery('');
    setReceiptData(newSale);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4">
      {/* Menu Items */}
      <div className="lg:w-2/3">
        <div className="mb-4">
          <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100 transition-colors duration-300">{brandName}</h1>
        </div>
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 mb-4">Pilih Menu</h2>
        <div className="mb-4">
            <input
                type="text"
                placeholder="Cari menu..."
                value={menuSearchQuery}
                onChange={(e) => setMenuSearchQuery(e.target.value)}
                className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus\:theme-border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400 transition-colors duration-300"
            />
        </div>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {inventory.length > 0 ? (
            filteredInventory.length > 0 ? (
                filteredInventory.map(item => (
                  <div 
                    key={item.id} 
                    onClick={() => item.stock > 0 && addToCart(item)} 
                    className={`relative bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden transition-all duration-300 ease-in-out ${item.stock > 0 ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'opacity-50'}`}
                    aria-disabled={item.stock <= 0}
                    role="button"
                    tabIndex={item.stock > 0 ? 0 : -1}
                    onKeyDown={(e) => { if (e.key === 'Enter' && item.stock > 0) addToCart(item); }}
                  >
                    <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full z-10 ${item.stock > 0 ? 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-300' : 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-300'}`}>
                      Stok: {item.stock}
                    </div>
                    <div className="aspect-square bg-slate-50 dark:bg-slate-700 flex items-center justify-center overflow-hidden transition-colors duration-300">
                        {item.imageUrl ? (
                            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
                        ) : (
                            <FoodPlaceholderIcon className="w-16 h-16 text-slate-300 dark:text-slate-500" />
                        )}
                    </div>
                    <div className="p-3">
                      <p className="text-xs text-slate-600 dark:text-slate-400 truncate">{item.vendor || ' '}&nbsp;</p>
                      <p className="font-semibold text-slate-800 dark:text-slate-100 truncate">{item.name}</p>
                      <div className="flex justify-between items-center mt-1">
                        <p className="theme-text-primary font-bold">RM{item.sellingPrice.toFixed(2)}</p>
                        <button
                          onClick={(e) => handleShareClick(item, e)}
                          className="p-1 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700"
                          aria-label={`Kongsi ${item.name}`}
                        >
                          <ShareIcon className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
            ) : (
                <div className="col-span-full text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow transition-colors duration-300">
                    <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Tiada Menu Ditemui</h3>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">
                        Tiada menu yang sepadan dengan carian "{menuSearchQuery}".
                    </p>
                </div>
            )
          ) : (
            <div className="col-span-full text-center p-8 bg-white dark:bg-slate-800 rounded-lg shadow transition-colors duration-300">
              <h3 className="text-lg font-semibold text-slate-700 dark:text-slate-200">Inventori Kosong</h3>
              <p className="text-slate-600 dark:text-slate-400 mt-2">
                Nampaknya tiada apa-apa di sini lagi.
              </p>
              <p className="text-slate-600 dark:text-slate-400 mt-1">
                Sila ke halaman <strong className="theme-text-primary">Inventori</strong> untuk menambah produk anda.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="lg:w-1/3 bg-white dark:bg-slate-800 rounded-lg shadow p-4 flex flex-col transition-colors duration-300">
        <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200 border-b border-slate-200 dark:border-slate-700 pb-2 mb-4">Pesanan</h2>
        
        {cart.length > 0 && (
            <div className="mb-4">
                <input
                    type="text"
                    placeholder="Cari dalam pesanan..."
                    value={cartSearchQuery}
                    onChange={(e) => setCartSearchQuery(e.target.value)}
                    className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-2 focus\:theme-border-primary dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400 transition-colors duration-300"
                />
            </div>
        )}

        <div className="flex-grow overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400 text-center mt-8">Pilih item untuk ditambah.</p>
          ) : filteredCart.length === 0 ? (
            <p className="text-slate-600 dark:text-slate-400 text-center mt-8">Tiada item sepadan dengan carian anda.</p>
          ) : (
            <ul className="divide-y divide-slate-200 dark:divide-slate-700">
              {filteredCart.map(item => (
                <li key={item.id} className="flex items-center justify-between py-3">
                  <div className="flex-grow pr-4">
                    <p className="font-semibold text-slate-800 dark:text-slate-100">{item.name}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">RM{item.sellingPrice.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center rounded-lg bg-slate-100 dark:bg-slate-700 shadow-sm">
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity - 1)}
                            className="px-3 py-1.5 text-lg font-bold text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-l-lg transition-colors duration-150"
                            aria-label={`Kurangkan kuantiti untuk ${item.name}`}
                        >
                            -
                        </button>
                        <input
                            type="number"
                            value={item.quantity}
                            onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10) || 0)}
                            className="w-12 text-center bg-transparent font-semibold dark:text-slate-200 focus:outline-none focus:ring-2 focus\:theme-border-primary [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                            aria-label={`Kuantiti untuk ${item.name}`}
                        />
                        <button
                            onClick={() => updateQuantity(item.id, item.quantity + 1)}
                            className="px-3 py-1.5 text-lg font-bold text-slate-500 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 rounded-r-lg transition-colors duration-150"
                            aria-label={`Tambah kuantiti untuk ${item.name}`}
                        >
                            +
                        </button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-slate-400 hover:text-red-500 dark:text-slate-500 dark:hover:text-red-400 transition-colors" aria-label={`Padam ${item.name} dari troli`}>
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t border-slate-200 dark:border-slate-700 pt-4 mt-4">
          <div className="flex justify-between items-center text-lg font-bold dark:text-slate-100">
            <span>Jumlah:</span>
            <span>RM{total.toFixed(2)}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button 
                onClick={() => setIsCashModalOpen(true)} 
                disabled={cart.length === 0}
                className="flex items-center justify-center w-full theme-bg-primary text-white font-semibold py-3 rounded-lg shadow theme-bg-primary-hover transition disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
              <CashIcon /> Tunai
            </button>
            <button 
                onClick={() => processCheckout('E-Wallet')} 
                disabled={cart.length === 0}
                className="flex items-center justify-center w-full bg-slate-700 dark:bg-slate-600 text-white font-semibold py-3 rounded-lg shadow hover:bg-slate-800 dark:hover:bg-slate-500 transition disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed">
              <WalletIcon /> E-Wallet
            </button>
          </div>
        </div>
      </div>
      
      {receiptData && <ReceiptModal sale={receiptData} onClose={() => setReceiptData(null)} brandName={brandName} />}
      
      {isCashModalOpen && (
        <CashPaymentModal
            isOpen={isCashModalOpen}
            onClose={() => setIsCashModalOpen(false)}
            totalAmount={total}
            onConfirm={(amountReceived) => {
                processCheckout('Tunai', amountReceived);
                setIsCashModalOpen(false);
            }}
        />
      )}
      
      {itemToShare && (
        <ShareModal
          isOpen={isShareModalOpen}
          onClose={() => setIsShareModalOpen(false)}
          item={itemToShare}
        />
      )}
    </div>
  );
};

export default SalesScreen;
