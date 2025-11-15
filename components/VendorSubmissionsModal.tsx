
import React from 'react';
import Modal from './Modal';
import { VendorSubmission } from '../types';
import { TrashIcon } from './Icons';

interface VendorSubmissionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  submissions: VendorSubmission[];
  onProcess: (submission: VendorSubmission) => void;
  onDelete: (submissionId: string) => void;
}

const VendorSubmissionsModal: React.FC<VendorSubmissionsModalProps> = ({ isOpen, onClose, submissions, onProcess, onDelete }) => {
  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Penyerahan Vendor">
      <div className="space-y-3 max-h-96 overflow-y-auto">
        {submissions.length > 0 ? (
          submissions
            .sort((a, b) => b.submittedAt - a.submittedAt)
            .map(sub => (
              <div key={sub.id} className="p-3 bg-slate-100 dark:bg-slate-700 rounded-lg flex items-center justify-between gap-4">
                <div>
                  <p className="font-bold text-slate-800 dark:text-slate-100">{sub.name}</p>
                  <p className="text-sm text-slate-600 dark:text-slate-400">
                    Oleh: {sub.vendor} - <span className="font-semibold">RM{sub.costPrice.toFixed(2)}</span>
                  </p>
                  <p className="text-xs text-slate-500 dark:text-slate-500">
                    Dihantar pada: {new Date(sub.submittedAt).toLocaleString('ms-MY')}
                  </p>
                </div>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <button
                    onClick={() => onDelete(sub.id)}
                    className="p-2 text-slate-500 hover:text-red-600 dark:text-slate-400 dark:hover:text-red-500 transition-colors"
                    aria-label={`Padam penyerahan ${sub.name}`}
                  >
                    <TrashIcon />
                  </button>
                  <button
                    onClick={() => onProcess(sub)}
                    className="px-3 py-1.5 theme-bg-primary text-white text-sm font-semibold rounded-md theme-bg-primary-hover transition"
                  >
                    Semak
                  </button>
                </div>
              </div>
            ))
        ) : (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">Tiada penyerahan baharu.</p>
        )}
      </div>
       <div className="flex justify-end pt-4 mt-4 border-t dark:border-slate-700">
          <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors duration-150">Tutup</button>
        </div>
    </Modal>
  );
};

export default VendorSubmissionsModal;
