import React, { useState, useMemo } from 'react';
import { MenuItem, CartItem, Sale } from '../types';
import { TrashIcon, CashIcon, WalletIcon, FoodPlaceholderIcon } from './Icons';
import ReceiptModal from './ReceiptModal';
import CashPaymentModal from './CashPaymentModal';

interface SalesScreenProps {
  inventory: MenuItem[];
  setInventory: React.Dispatch<React.SetStateAction<MenuItem[]>>;
  addSale: (sale: Sale) => void;
}

const SalesScreen: React.FC<SalesScreenProps> = ({ inventory, setInventory, addSale }) => {
  const [cart, setCart] = useState<CartItem[]>([]);
  const [receiptData, setReceiptData] = useState<Sale | null>(null);
  const [isCashModalOpen, setIsCashModalOpen] = useState(false);

  const addToCart = (item: MenuItem) => {
    if (item.stock <= 0) {
        alert(`${item.name} sudah habis stok.`);
        return;
    }

    setCart(prevCart => {
      const existingItem = prevCart.find(cartItem => cartItem.id === item.id);
      if (existingItem) {
        if(existingItem.quantity >= item.stock) {
            alert(`Stok untuk ${item.name} tidak mencukupi.`);
            return prevCart;
        }
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

  const total = useMemo(() => cart.reduce((sum, item) => sum + item.sellingPrice * item.quantity, 0), [cart]);

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
    setReceiptData(newSale);
  };

  return (
    <div className="flex flex-col lg:flex-row h-full gap-4">
      {/* Menu Items */}
      <div className="lg:w-2/3">
        <h2 className="text-xl font-bold text-slate-700 mb-4">Pilih Menu</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {inventory.length > 0 ? (
            inventory.map(item => (
              <div 
                key={item.id} 
                onClick={() => item.stock > 0 && addToCart(item)} 
                className={`relative bg-white rounded-lg shadow overflow-hidden transition-transform duration-200 ease-in-out ${item.stock > 0 ? 'cursor-pointer hover:scale-105 hover:shadow-lg' : 'opacity-50'}`}
                aria-disabled={item.stock <= 0}
                role="button"
                tabIndex={item.stock > 0 ? 0 : -1}
                onKeyDown={(e) => { if (e.key === 'Enter' && item.stock > 0) addToCart(item); }}
              >
                <div className={`absolute top-2 right-2 px-2 py-0.5 text-xs font-semibold rounded-full z-10 ${item.stock > 0 ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                  Stok: {item.stock}
                </div>
                <div className="aspect-square bg-slate-50 flex items-center justify-center">
                    <FoodPlaceholderIcon className="w-16 h-16 text-slate-300" />
                </div>
                <div className="p-3">
                  <p className="text-xs text-slate-600 truncate">{item.vendor || ' '}&nbsp;</p>
                  <p className="font-semibold text-slate-800 truncate">{item.name}</p>
                  <p className="text-blue-500 font-bold">RM{item.sellingPrice.toFixed(2)}</p>
                </div>
              </div>
            ))
          ) : (
            <div className="col-span-full text-center p-8 bg-white rounded-lg shadow">
              <h3 className="text-lg font-semibold text-slate-700">Inventori Kosong</h3>
              <p className="text-slate-600 mt-2">
                Nampaknya tiada apa-apa di sini lagi.
              </p>
              <p className="text-slate-600 mt-1">
                Sila ke halaman <strong className="text-blue-500">Inventori</strong> untuk menambah produk anda.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Cart */}
      <div className="lg:w-1/3 bg-white rounded-lg shadow p-4 flex flex-col">
        <h2 className="text-xl font-bold text-slate-700 border-b pb-2 mb-4">Pesanan</h2>
        <div className="flex-grow overflow-y-auto">
          {cart.length === 0 ? (
            <p className="text-slate-600 text-center mt-8">Pilih item untuk ditambah.</p>
          ) : (
            <ul className="space-y-3">
              {cart.map(item => (
                <li key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-semibold text-slate-800">{item.name}</p>
                    <p className="text-sm text-slate-600">RM{item.sellingPrice.toFixed(2)}</p>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex items-center border border-slate-300 rounded-md">
                      <button onClick={() => updateQuantity(item.id, item.quantity - 1)} className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 rounded-l-md">-</button>
                      <input type="number" value={item.quantity} onChange={(e) => updateQuantity(item.id, parseInt(e.target.value, 10) || 0)} className="w-10 text-center bg-transparent focus:outline-none" />
                      <button onClick={() => updateQuantity(item.id, item.quantity + 1)} className="px-2 py-0.5 text-slate-600 hover:bg-slate-100 rounded-r-md">+</button>
                    </div>
                    <button onClick={() => removeFromCart(item.id)} className="text-red-500 hover:text-red-700">
                      <TrashIcon />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
        <div className="border-t pt-4 mt-4">
          <div className="flex justify-between items-center text-lg font-bold">
            <span>Jumlah:</span>
            <span>RM{total.toFixed(2)}</span>
          </div>
          <div className="mt-4 grid grid-cols-2 gap-3">
            <button 
                onClick={() => setIsCashModalOpen(true)} 
                disabled={cart.length === 0}
                className="flex items-center justify-center w-full bg-blue-500 text-white font-semibold py-3 rounded-lg shadow hover:bg-blue-600 transition disabled:bg-slate-400 disabled:cursor-not-allowed">
              <CashIcon /> Tunai
            </button>
            <button 
                onClick={() => processCheckout('E-Wallet')} 
                disabled={cart.length === 0}
                className="flex items-center justify-center w-full bg-slate-700 text-white font-semibold py-3 rounded-lg shadow hover:bg-slate-800 transition disabled:bg-slate-400 disabled:cursor-not-allowed">
              <WalletIcon /> E-Wallet
            </button>
          </div>
        </div>
      </div>
      
      {receiptData && <ReceiptModal sale={receiptData} onClose={() => setReceiptData(null)} />}
      
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
    </div>
  );
};

export default SalesScreen;