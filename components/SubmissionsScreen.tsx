import React, { useState } from 'react';
import { MenuItem, VendorSubmission } from '../types';
import useLocalStorage from '../hooks/useLocalStorage';
import Modal from './Modal';
import { InventoryForm } from './InventoryForm';
import { TrashIcon } from './Icons';

interface SubmissionsScreenProps {
  setInventory: React.Dispatch<React.SetStateAction<MenuItem[]>>;
}

const SubmissionsScreen: React.FC<SubmissionsScreenProps> = ({ setInventory }) => {
  const [submissions, setSubmissions] = useLocalStorage<VendorSubmission[]>('vendorSubmissions', []);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [processingSubmission, setProcessingSubmission] = useState<VendorSubmission | null>(null);

  const handleProcessClick = (submission: VendorSubmission) => {
    setProcessingSubmission(submission);
    setIsModalOpen(true);
  };

  const handleDeleteClick = (submissionId: string) => {
    if (window.confirm('Adakah anda pasti mahu memadam penyerahan ini?')) {
      setSubmissions(prev => prev.filter(s => s.id !== submissionId));
    }
  };

  const handleFormSubmit = (itemData: Omit<MenuItem, 'id'>) => {
    if (!processingSubmission) return;

    const newItem: MenuItem = { ...itemData, id: `item-${Date.now()}` };
    setInventory(prev => [...prev, newItem]);
    setSubmissions(prev => prev.filter(s => s.id !== processingSubmission.id));
    
    handleCloseModal();
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setProcessingSubmission(null);
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-2">Penyerahan Vendor</h2>
      <p className="text-slate-600 dark:text-slate-400 mb-6">Semak menu yang dihantar oleh vendor dan tambahkannya ke dalam inventori anda.</p>

      <div className="space-y-4">
        {submissions.length > 0 ? (
          submissions
            .sort((a, b) => b.submittedAt - a.submittedAt)
            .map(sub => (
              <div key={sub.id} className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors duration-300">
                <div>
                  <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{sub.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Oleh: <span className="font-semibold">{sub.vendor}</span>
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Harga Kos: <span className="font-semibold theme-text-primary">RM{sub.costPrice.toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500 mt-1">
                    Dihantar pada: {new Date(sub.submittedAt).toLocaleString('ms-MY')}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0 self-end sm:self-center">
                  <button
                    onClick={() => handleDeleteClick(sub.id)}
                    className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 transition-colors"
                    aria-label={`Padam penyerahan ${sub.name}`}
                  >
                    <TrashIcon />
                  </button>
                  <button
                    onClick={() => handleProcessClick(sub)}
                    className="px-4 py-2 theme-bg-primary text-white text-sm font-semibold rounded-md theme-bg-primary-hover transition"
                  >
                    Proses
                  </button>
                </div>
              </div>
            ))
        ) : (
          <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-lg shadow">
            <h3 className="text-xl font-semibold text-slate-700 dark:text-slate-200">Peti Masuk Kosong</h3>
            <p className="text-slate-500 dark:text-slate-400 mt-2">Tiada penyerahan menu baharu daripada vendor pada masa ini.</p>
          </div>
        )}
      </div>

      <Modal isOpen={isModalOpen} onClose={handleCloseModal} title="Proses & Tambah Menu Vendor">
        <InventoryForm
          onSubmit={handleFormSubmit}
          initialData={processingSubmission ? {
            name: processingSubmission.name,
            vendor: processingSubmission.vendor,
            costPrice: processingSubmission.costPrice,
            sellingPrice: processingSubmission.costPrice,
            stock: 0,
            imageUrl: ''
          } : null}
          onClose={handleCloseModal}
          submitButtonText="Tambah ke Inventori"
        />
      </Modal>
    </div>
  );
};

export default SubmissionsScreen;
