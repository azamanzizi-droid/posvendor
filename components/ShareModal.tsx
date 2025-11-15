import React, { useState } from 'react';
import Modal from './Modal';
import { MenuItem } from '../types';
import { FoodPlaceholderIcon } from './Icons';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  item: MenuItem;
}

const ShareModal: React.FC<ShareModalProps> = ({ isOpen, onClose, item }) => {
  const [copyStatus, setCopyStatus] = useState('Salin');
  
  const shareUrl = `${window.location.href}?item=${encodeURIComponent(item.name)}`;
  const shareText = `Jom cuba ${item.name}! Sedap sangat. Boleh dapatkan di sini.`;

  const handleCopy = () => {
    navigator.clipboard.writeText(shareUrl).then(() => {
      setCopyStatus('Disalin!');
      setTimeout(() => setCopyStatus('Salin'), 2000);
    }, () => {
      setCopyStatus('Gagal');
      setTimeout(() => setCopyStatus('Salin'), 2000);
    });
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title={`Kongsi "${item.name}"`}>
      <div className="space-y-4">
        <div className="flex items-center gap-4 p-3 bg-slate-100 dark:bg-slate-700 rounded-lg transition-colors duration-300">
          <div className="w-20 h-20 rounded-md overflow-hidden flex-shrink-0">
            {item.imageUrl ? (
              <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
            ) : (
              <FoodPlaceholderIcon className="w-full h-full text-slate-400 dark:text-slate-500" />
            )}
          </div>
          <div>
            <p className="font-bold text-lg text-slate-800 dark:text-slate-100">{item.name}</p>
            <p className="theme-text-primary font-semibold">RM{item.sellingPrice.toFixed(2)}</p>
          </div>
        </div>

        <div>
          <label className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-1 block">Salin Pautan</label>
          <div className="flex">
            <input 
              type="text" 
              readOnly 
              value={shareUrl} 
              className="w-full px-3 py-2 border border-slate-300 rounded-l-md bg-slate-50 focus:outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-slate-300 transition-colors duration-300" 
            />
            <button 
              onClick={handleCopy}
              className="px-4 py-2 theme-bg-primary text-white font-semibold rounded-r-md theme-bg-primary-hover transition-colors"
            >
              {copyStatus}
            </button>
          </div>
        </div>
        
        <div>
          <p className="text-sm font-medium text-slate-600 dark:text-slate-300 mb-2">Kongsi di:</p>
          <div className="flex justify-center gap-4">
            <a href={`https://wa.me/?text=${encodeURIComponent(shareText + ' ' + shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-green-500 text-white rounded-full hover:bg-green-600" aria-label="Kongsi di WhatsApp">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M16.75 13.96c.25.13.43.2.5.25.13.06.16.14.19.23.03.09.03.5-.03.96-.06.46-.38.87-.75 1.05-.38.19-.78.21-1.23.12-.45-.09-1.03-.3-1.83-1.05-.8-.75-1.35-1.39-1.85-2.28-.5-.88-.81-1.78-1.05-2.61-.24-.83-.41-1.63-.41-2.36 0-.73.28-1.43.81-1.98.53-.55 1.25-.84 1.98-.84.25 0 .48.03.68.06.2.03.35.06.43.06.11 0 .28-.06.38.16.1.22.38.81.44.93.06.13.09.28.06.41s-.16.28-.35.43c-.19.16-.35.25-.48.34-.13.09-.23.16-.31.25-.09.09-.16.19-.19.28-.03.09-.03.16 0 .28.03.13.23.58.58 1.08.34.5.75.93 1.23 1.31.48.38.88.63 1.21.75.34.13.58.19.78.19.2 0 .34-.03.48-.09.13-.06.43-.28.69-.58.25-.3.44-.55.58-.75.14-.2.25-.33.38-.34.13-.02.31 0 .5.09.19.09.81.38.98.44.17.06.28.09.34.16.05.06.06.13.06.23zm-4.5-11.96c-6.63 0-12 5.37-12 12s5.37 12 12 12 12-5.37 12-12-5.37-12-12-12zm.01 21.75c-2.07 0-4.04-.58-5.71-1.61l-5.99 1.86 1.9-5.83c-1.1-1.7-1.7-3.7-1.7-5.83 0-5.37 4.38-9.75 9.75-9.75s9.75 4.38 9.75 9.75-4.38 9.75-9.75 9.75z"/></svg>
            </a>
             <a href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-blue-600 text-white rounded-full hover:bg-blue-700" aria-label="Kongsi di Facebook">
               <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M12 2.04c-5.5 0-9.96 4.46-9.96 9.96s4.46 9.96 9.96 9.96c5.5 0 9.96-4.46 9.96-9.96S17.5 2.04 12 2.04zm2.85 9.54h-2.1v6.8h-2.83v-6.8h-1.4v-2.48h1.4v-1.7c0-1.21.62-2.25 2.25-2.25h1.8v2.48h-1.08c-.24 0-.42.2-.42.42v1.13h1.5l-.2 2.48z"/></svg>
            </a>
             <a href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}&url=${encodeURIComponent(shareUrl)}`} target="_blank" rel="noopener noreferrer" className="p-3 bg-sky-500 text-white rounded-full hover:bg-sky-600" aria-label="Kongsi di Twitter">
              <svg className="w-6 h-6" viewBox="0 0 24 24" fill="currentColor"><path d="M22.46 6c-.77.35-1.6.58-2.46.67.88-.53 1.56-1.37 1.88-2.38-.83.49-1.75.85-2.72 1.05C18.37 4.5 17.26 4 16 4c-2.35 0-4.27 1.92-4.27 4.29 0 .34.04.67.11.98-3.56-.18-6.73-1.89-8.84-4.48-.37.63-.58 1.37-.58 2.15 0 1.49.75 2.81 1.91 3.58-.7-.02-1.37-.21-1.95-.5v.03c0 2.08 1.48 3.82 3.44 4.21a4.22 4.22 0 0 1-1.94.07 4.28 4.28 0 0 0 4 2.98 8.521 8.521 0 0 1-5.33 1.84c-.34 0-.68-.02-1.02-.06C3.44 20.29 5.7 21 8.12 21c7.34 0 11.35-6.08 11.35-11.35 0-.17 0-.34-.01-.51.78-.57 1.45-1.28 1.99-2.09z"/></svg>
            </a>
          </div>
        </div>
        
        <div className="flex justify-end pt-2">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors duration-150">Tutup</button>
        </div>
      </div>
    </Modal>
  );
};

export default ShareModal;
