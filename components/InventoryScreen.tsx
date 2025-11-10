import React, { useState } from 'react';
import { MenuItem } from '../types';
import Modal from './Modal';
import BulkUploadModal from './BulkUploadModal';
import { PlusIcon, EditIcon, TrashIcon, CloudUploadIcon, FoodPlaceholderIcon } from './Icons';

interface InventoryScreenProps {
  inventory: MenuItem[];
  setInventory: React.Dispatch<React.SetStateAction<MenuItem[]>>;
}

const InputField: React.FC<{
  label: string;
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: string;
  required?: boolean;
}> = ({ label, type, value, onChange, step, required = true }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      step={step}
      required={required}
      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400 transition-colors duration-300"
    />
  </div>
);

const InventoryForm: React.FC<{
  onSubmit: (item: Omit<MenuItem, 'id'>) => void;
  initialData?: MenuItem | null;
  onClose: () => void;
}> = ({ onSubmit, initialData, onClose }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [vendor, setVendor] = useState(initialData?.vendor || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [costPrice, setCostPrice] = useState(initialData ? String(initialData.costPrice) : '');
  const [sellingPrice, setSellingPrice] = useState(initialData ? String(initialData.sellingPrice) : '');
  const [stock, setStock] = useState(initialData ? String(initialData.stock) : '');

  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onloadend = () => {
              setImageUrl(reader.result as string);
          };
          reader.readAsDataURL(file);
      }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const finalCostPrice = parseFloat(costPrice) || 0;
    const finalSellingPrice = parseFloat(sellingPrice) || 0;

    if (finalCostPrice > finalSellingPrice) {
      alert('Harga jual mesti lebih tinggi daripada harga kos.');
      return;
    }
    onSubmit({
      name,
      vendor,
      imageUrl,
      costPrice: finalCostPrice,
      sellingPrice: finalSellingPrice,
      stock: parseInt(stock, 10) || 0
    });
    onClose();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <InputField label="Nama Menu" type="text" value={name} onChange={e => setName(e.target.value)} />
      <InputField label="Vendor" type="text" value={vendor} onChange={e => setVendor(e.target.value)} required={false} />
      
      <div>
        <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Gambar Menu (Pilihan)</label>
        <div className="mt-1 flex items-center gap-4">
          <span className="inline-block h-20 w-20 rounded-md overflow-hidden bg-slate-100 dark:bg-slate-700 transition-colors duration-300">
            {imageUrl ? (
              <img src={imageUrl} alt="Pratonton" className="h-full w-full object-cover" />
            ) : (
              <FoodPlaceholderIcon className="h-full w-full text-slate-300 dark:text-slate-500" />
            )}
          </span>
          <div className="flex flex-col gap-2">
              <label htmlFor="file-upload" className="cursor-pointer rounded-md bg-white dark:bg-slate-700 px-3 py-2 text-sm font-semibold text-slate-900 dark:text-slate-200 shadow-sm ring-1 ring-inset ring-slate-300 dark:ring-slate-600 hover:bg-slate-50 dark:hover:bg-slate-600 transition-colors duration-150">
                  <span>Muat Naik Imej</span>
                  <input id="file-upload" name="file-upload" type="file" className="sr-only" accept="image/*" onChange={handleImageUpload} />
              </label>
              {imageUrl && (
                  <button
                      type="button"
                      onClick={() => setImageUrl('')}
                      className="rounded-md bg-red-50 dark:bg-red-900/50 px-3 py-2 text-sm font-semibold text-red-600 dark:text-red-400 shadow-sm hover:bg-red-100 dark:hover:bg-red-900 transition-colors duration-150"
                  >
                      Padam
                  </button>
              )}
          </div>
        </div>
      </div>

      <InputField label="Harga Kos (RM)" type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} step="0.01" />
      <InputField label="Harga Jual (RM)" type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} step="0.01" />
      <InputField label="Stok Awal" type="number" value={stock} onChange={e => setStock(e.target.value)} />
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors duration-150">Batal</button>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150">{initialData ? 'Simpan' : 'Tambah'}</button>
      </div>
    </form>
  );
};


const InventoryScreen: React.FC<InventoryScreenProps> = ({ inventory, setInventory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

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
    setEditingItem(null);
  }

  const handleDeleteItem = (itemId: string) => {
    if (window.confirm('Adakah anda pasti mahu memadam item ini?')) {
      setInventory(prev => prev.filter(item => item.id !== itemId));
    }
  };

  const openEditModal = (item: MenuItem) => {
    setEditingItem(item);
    setIsModalOpen(true);
  }

  const openAddModal = () => {
    setEditingItem(null);
    setIsModalOpen(true);
  };

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
                  <td className="px-6 py-4">{item.stock}</td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end items-center gap-4">
                      <button onClick={() => openEditModal(item)} className="text-blue-500 hover:text-blue-700"><EditIcon /></button>
                      <button onClick={() => handleDeleteItem(item.id)} className="text-red-600 hover:text-red-800"><TrashIcon /></button>
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

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingItem ? 'Edit Menu' : 'Tambah Menu Baru'}>
        <InventoryForm
          onSubmit={editingItem ? (item) => handleEditItem({ ...item, id: editingItem.id }) : handleAddItem}
          initialData={editingItem}
          onClose={() => setIsModalOpen(false)}
        />
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