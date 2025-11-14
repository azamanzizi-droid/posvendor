
import React, { useState } from 'react';
import { MenuItem } from '../types';
import Modal from './Modal';
import BulkUploadModal from './BulkUploadModal';
import { PlusIcon, EditIcon, TrashIcon, CloudUploadIcon, FoodPlaceholderIcon } from './Icons';
import { InventoryForm } from './InventoryForm';

interface InventoryScreenProps {
  inventory: MenuItem[];
  setInventory: React.Dispatch<React.SetStateAction<MenuItem[]>>;
}

const InventoryScreen: React.FC<InventoryScreenProps> = ({ inventory, setInventory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);
  const [addStockItem, setAddStockItem] = useState<MenuItem | null>(null);

  const handleStockUpdate = (itemId: string, newStock: number) => {
    const stock = Math.max(0, newStock); // Ensure stock is not negative
    setInventory(prev =>
      prev.map(item =>
        item.id === itemId ? { ...item, stock } : item
      )
    );
  };
  
  const handleAddStock = (quantity: number) => {
    if (!addStockItem) return;
    const quantityToAdd = Math.max(0, quantity);
    setInventory(prev =>
      prev.map(item =>
        item.id === addStockItem.id ? { ...item, stock: item.stock + quantityToAdd } : item
      )
    );
    setAddStockItem(null); // Close modal
  };

  const handleAddItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = { ...item, id: `item-${Date.now()}` };
    setInventory(prev => [...prev, newItem]);
  };

  const handleBulkAdd = (items: Omit<MenuItem, 'id'>[]) => {
    const newItems: MenuItem[] = items.map(item => ({
        ...item,
        id: `item-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
    }));
    setInventory(prev => [...prev, ...newItems]);
    setIsUploadModalOpen(false);
  };

  const handleEditItem = (updatedItem: MenuItem) => {
    setInventory(prev => prev.map(item => item.id === updatedItem.id ? updatedItem : item));
  }

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Adakah anda pasti mahu memadam item ini?')) {
      setInventory(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingItem(null);
  };

  const handleFormSubmit = (itemData: Omit<MenuItem, 'id'>) => {
    if (editingItem) {
        handleEditItem({ ...itemData, id: editingItem.id });
    } else {
        handleAddItem(itemData);
    }
    handleCloseModal();
  };
  
  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };
  
  const openAddStockModal = (item: MenuItem) => {
    setAddStockItem(item);
  };

  const getModalTitle = () => {
      if(editingItem) return 'Edit Menu';
      return 'Tambah Menu Baru';
  }

  return (
    <div>
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200">Senarai Inventori</h2>
        <div className="flex items-center gap-2">
            <button onClick={() => setIsUploadModalOpen(true)} className="flex items-center gap-2 bg-slate-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-slate-700 transition">
              <CloudUploadIcon className="w-5 h-5" /> Muat Naik Pukal
            </button>
            <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition">
              <PlusIcon className="w-5 h-5" /> Tambah Menu
            </button>
        </div>
      </div>

      <div className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden transition-colors duration-300">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500 dark:text-slate-400">
            <thead className="text-xs text-slate-700 dark:text-slate-300 uppercase bg-slate-50 dark:bg-slate-700 transition-colors duration-300">
              <tr>
                <th scope="col" className="px-6 py-3">Imej</th>
                <th scope="col" className="px-6 py-3">Nama</th>
                <th scope="col" className="px-6 py-3">Vendor</th>
                <th scope="col" className="px-6 py-3">Harga Kos</th>
                <th scope="col" className="px-6 py-3">Harga Jual</th>
                <th scope="col" className="px-6 py-3">Stok</th>
                <th scope="col" className="px-6 py-3 text-right">Tindakan</th>
              </tr>
            </thead>
            <tbody>
              {inventory.length > 0 ? inventory.map(item => (
                <tr key={item.id} className="bg-white dark:bg-slate-800 border-b dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-150">
                  <td className="px-6 py-4">
                    {item.imageUrl ? (
                      <img src={item.imageUrl} alt={item.name} className="h-10 w-10 rounded-md object-cover" />
                    ) : (
                      <div className="h-10 w-10 flex items-center justify-center bg-slate-100 dark:bg-slate-700 rounded-md transition-colors duration-300">
                        <FoodPlaceholderIcon className="h-6 w-6 text-slate-400" />
                      </div>
                    )}
                  </td>
                  <td className="px-6 py-4 font-medium text-slate-900 dark:text-white whitespace-nowrap">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap">{item.vendor || '-'}</td>
                  <td className="px-6 py-4">RM{item.costPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">RM{item.sellingPrice.toFixed(2)}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center border border-slate-300 dark:border-slate-600 rounded-md w-28">
                      <button
                        onClick={() => handleStockUpdate(item.id, item.stock - 1)}
                        className="px-3 py-1 text-lg font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-l-md transition-colors"
                        aria-label={`Kurangkan stok untuk ${item.name}`}
                      >
                        -
                      </button>
                      <input
                        type="number"
                        value={item.stock}
                        onChange={(e) => handleStockUpdate(item.id, parseInt(e.target.value, 10) || 0)}
                        className="w-full text-center bg-transparent dark:text-slate-200 focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                        aria-label={`Stok semasa untuk ${item.name}`}
                      />
                      <button
                        onClick={() => handleStockUpdate(item.id, item.stock + 1)}
                        className="px-3 py-1 text-lg font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 rounded-r-md transition-colors"
                        aria-label={`Tambah stok untuk ${item.name}`}
                      >
                        +
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-4">
                      <button onClick={() => openAddStockModal(item)} className="text-green-500 hover:text-green-700" title="Tambah Stok Manual">
                        <PlusIcon className="w-5 h-5" />
                      </button>
                      <button onClick={() => openEditModal(item)} className="text-blue-500 hover:text-blue-700" title="Edit Menu">
                        <EditIcon />
                      </button>
                      <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-800" title="Padam Menu">
                        <TrashIcon />
                      </button>
                    </div>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={7} className="text-center py-8 text-slate-600 dark:text-slate-400">Tiada item dalam inventori.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title={getModalTitle()}>
        <InventoryForm
          onSubmit={handleFormSubmit}
          initialData={editingItem}
          onClose={handleCloseModal}
          submitButtonText={editingItem ? 'Simpan' : 'Tambah'}
        />
      </Modal>

      <Modal isOpen={!!addStockItem} onClose={() => setAddStockItem(null)} title={`Tambah Stok untuk ${addStockItem?.name}`}>
        {addStockItem && (
            <form onSubmit={(e) => {
                e.preventDefault();
                const form = e.target as HTMLFormElement;
                const quantityInput = form.elements.namedItem('quantity') as HTMLInputElement;
                const quantity = parseInt(quantityInput.value, 10);
                if (!isNaN(quantity) && quantity > 0) {
                    handleAddStock(quantity);
                }
            }}>
                <div className="space-y-4">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                        Stok semasa: <span className="font-bold">{addStockItem.stock}</span>. Masukkan kuantiti untuk ditambah.
                    </p>
                    <div>
                        <label htmlFor="add-stock-quantity" className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">
                            Kuantiti Tambahan
                        </label>
                        <input
                            id="add-stock-quantity"
                            name="quantity"
                            type="number"
                            min="1"
                            required
                            autoFocus
                            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400 transition-colors duration-300"
                        />
                    </div>
                    <div className="flex justify-end gap-3 pt-4">
                        <button type="button" onClick={() => setAddStockItem(null)} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors duration-150">Batal</button>
                        <button type="submit" className="px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition-colors duration-150">Tambah Stok</button>
                    </div>
                </div>
            </form>
        )}
      </Modal>

      <BulkUploadModal
        isOpen={isUploadModalOpen}
        onClose={() => setIsUploadModalOpen(false)}
        onConfirm={handleBulkAdd}
      />
      
    </div>
  );
};

export default InventoryScreen;