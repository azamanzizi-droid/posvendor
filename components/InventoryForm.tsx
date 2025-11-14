import React, { useState } from 'react';
import { MenuItem } from '../types';
import { FoodPlaceholderIcon, CameraIcon } from './Icons';
import CameraModal from './CameraModal';

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

export const InventoryForm: React.FC<{
  onSubmit: (item: Omit<MenuItem, 'id'>) => void;
  initialData?: Partial<MenuItem> | null;
  onClose: () => void;
  submitButtonText?: string;
}> = ({ onSubmit, initialData, onClose, submitButtonText = 'Simpan' }) => {
  const [name, setName] = useState(initialData?.name || '');
  const [vendor, setVendor] = useState(initialData?.vendor || '');
  const [imageUrl, setImageUrl] = useState(initialData?.imageUrl || '');
  const [costPrice, setCostPrice] = useState(initialData?.costPrice !== undefined ? String(initialData.costPrice) : '');
  const [sellingPrice, setSellingPrice] = useState(initialData?.sellingPrice !== undefined ? String(initialData.sellingPrice) : '');
  const [stock, setStock] = useState(initialData?.stock !== undefined ? String(initialData.stock) : '');
  const [isCameraModalOpen, setIsCameraModalOpen] = useState(false);

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

    if (finalSellingPrice && finalCostPrice > finalSellingPrice) {
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
    <>
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
                 <button
                    type="button"
                    onClick={() => setIsCameraModalOpen(true)}
                    className="flex items-center justify-center gap-2 rounded-md bg-slate-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-slate-700 transition-colors duration-150"
                >
                    <CameraIcon className="w-4 h-4"/>
                    <span>Guna Kamera</span>
                </button>
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
          <button type="submit" className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150">{submitButtonText}</button>
        </div>
      </form>
      <CameraModal
        isOpen={isCameraModalOpen}
        onClose={() => setIsCameraModalOpen(false)}
        onCapture={(imageDataUrl) => {
            setImageUrl(imageDataUrl);
            setIsCameraModalOpen(false);
        }}
    />
    </>
  );
};
