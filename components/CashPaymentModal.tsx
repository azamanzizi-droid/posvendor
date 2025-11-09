
import React, { useState, useMemo, useEffect } from 'react';
import Modal from './Modal';

interface CashPaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  totalAmount: number;
  onConfirm: (amountReceived: number) => void;
}

const CashPaymentModal: React.FC<CashPaymentModalProps> = ({ isOpen, onClose, totalAmount, onConfirm }) => {
  const [amountReceived, setAmountReceived] = useState('');

  const change = useMemo(() => {
    const received = parseFloat(amountReceived);
    if (!isNaN(received) && received >= totalAmount) {
      return received - totalAmount;
    }
    return null;
  }, [amountReceived, totalAmount]);

  useEffect(() => {
    if (isOpen) {
      setAmountReceived('');
    }
  }, [isOpen]);

  const handleConfirm = () => {
    const received = parseFloat(amountReceived);
    if (change !== null && !isNaN(received)) {
      onConfirm(received);
    }
  };

  const nextSensibleNote = (total: number) => {
    if (total <= 5) return 5;
    if (total <= 10) return 10;
    if (total <= 20) return 20;
    if (total <= 50) return 50;
    if (total <= 100) return 100;
    return Math.ceil(total / 10) * 10;
  };

  const suggestedNotes = Array.from(new Set([
    nextSensibleNote(totalAmount),
    ...[10, 20, 50, 100].filter(v => v > totalAmount)
  ])).sort((a, b) => a - b).slice(0, 4);

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Bayaran Tunai">
      <div className="space-y-4">
        <div className="p-4 bg-blue-100 rounded-lg text-center">
          <p className="text-lg text-slate-700">Jumlah Perlu Dibayar</p>
          <p className="text-4xl font-bold text-blue-500">RM{totalAmount.toFixed(2)}</p>
        </div>
        
        <div>
          <label htmlFor="amount-received" className="block text-sm font-medium text-slate-700 mb-1">
            Jumlah Diterima (RM)
          </label>
          <input
            id="amount-received"
            type="number"
            value={amountReceived}
            onChange={(e) => setAmountReceived(e.target.value)}
            placeholder="0.00"
            className="w-full px-4 py-3 text-lg border-2 border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400"
            autoFocus
            onKeyDown={(e) => { if (e.key === 'Enter') handleConfirm(); }}
          />
        </div>
        
        <div className="grid grid-cols-4 gap-2">
          {suggestedNotes.map(value => (
            <button 
              key={value}
              onClick={() => setAmountReceived(String(value))}
              className="py-2 bg-slate-200 text-slate-700 font-semibold rounded-md hover:bg-slate-300 transition"
            >
              RM{value}
            </button>
          ))}
        </div>

        {change !== null && (
          <div className="p-4 bg-green-50 rounded-lg text-center">
            <p className="text-lg text-slate-600">Baki</p>
            <p className="text-4xl font-bold text-green-600">RM{change.toFixed(2)}</p>
          </div>
        )}
        
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={onClose} className="px-6 py-3 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 font-semibold">
            Batal
          </button>
          <button 
            type="button" 
            onClick={handleConfirm}
            disabled={change === null}
            className="px-6 py-3 bg-blue-500 text-white rounded-md hover:bg-blue-600 font-semibold disabled:bg-slate-400 disabled:cursor-not-allowed"
          >
            Sahkan Bayaran
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default CashPaymentModal;