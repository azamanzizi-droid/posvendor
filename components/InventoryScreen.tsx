
import React, { useState } from 'react';
import { MenuItem } from '../types';
import Modal from './Modal';
import { PlusIcon, EditIcon, TrashIcon } from './Icons';

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
    <label className="block text-sm font-medium text-slate-600 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      step={step}
      required={required}
      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400"
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
  const [costPrice, setCostPrice] = useState(initialData ? String(initialData.costPrice) : '');
  const [sellingPrice, setSellingPrice] = useState(initialData ? String(initialData.sellingPrice) : '');
  const [stock, setStock] = useState(initialData ? String(initialData.stock) : '');

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
      <InputField label="Harga Kos (RM)" type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} step="0.01" />
      <InputField label="Harga Jual (RM)" type="number" value={sellingPrice} onChange={e => setSellingPrice(e.target.value)} step="0.01" />
      <InputField label="Stok Awal" type="number" value={stock} onChange={e => setStock(e.target.value)} />
      <div className="flex justify-end gap-3 pt-4">
        <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300">Batal</button>
        <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600">{initialData ? 'Simpan' : 'Tambah'}</button>
      </div>
    </form>
  );
};


const InventoryScreen: React.FC<InventoryScreenProps> = ({ inventory, setInventory }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<MenuItem | null>(null);

  const handleAddItem = (item: Omit<MenuItem, 'id'>) => {
    const newItem: MenuItem = { ...item, id: `item-${Date.now()}` };
    setInventory(prev => [...prev, newItem]);
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
        <h2 className="text-2xl font-bold text-slate-800">Senarai Inventori</h2>
        <button onClick={openAddModal} className="flex items-center gap-2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition">
          <PlusIcon className="w-5 h-5" /> Tambah Menu
        </button>
      </div>

      <div className="bg-white rounded-lg shadow overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left text-slate-500">
            <thead className="text-xs text-slate-700 uppercase bg-slate-50">
              <tr>
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
                <tr key={item.id} className="bg-white border-b hover:bg-slate-50">
                  <td className="px-6 py-4 font-medium text-slate-900 whitespace-nowrap">{item.name}</td>
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
                  <td colSpan={6} className="text-center py-8 text-slate-600">Tiada item dalam inventori.</td>
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
    </div>
  );
};

export default InventoryScreen;