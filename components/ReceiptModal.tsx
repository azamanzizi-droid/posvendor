
import React from 'react';
import { Sale } from '../types';
import { PrintIcon } from './Icons';

interface ReceiptModalProps {
  sale: Sale | null;
  onClose: () => void;
  brandName: string;
}

const ReceiptModal: React.FC<ReceiptModalProps> = ({ sale, onClose, brandName }) => {
  if (!sale) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4">
      <div id="receipt-modal" className="bg-white dark:bg-slate-800 rounded-lg shadow-xl w-full max-w-sm transition-colors duration-300">
        <div className="p-4 border-b dark:border-slate-700 flex justify-between items-center print:hidden">
          <h2 className="text-xl font-bold text-slate-700 dark:text-slate-200">Resit Jualan</h2>
          <button onClick={onClose} className="text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 text-2xl">&times;</button>
        </div>
        
        <div id="receipt-content" className="p-6 text-sm font-mono text-black bg-white">
            <div className="text-center mb-4">
                <h3 className="font-bold text-lg">{brandName}</h3>
                <p>Terima Kasih</p>
                <p className="text-xs">Sila datang lagi</p>
            </div>
            <p><span className="font-semibold">ID:</span> {sale.id}</p>
            <p><span className="font-semibold">Tarikh:</span> {new Date(sale.timestamp).toLocaleString('ms-MY')}</p>
            <hr className="my-3 border-dashed border-slate-400" />
            <table className="w-full">
                <tbody>
                    {sale.items.map(item => (
                        <tr key={item.id}>
                            <td className="align-top pr-2 py-1">
                                <p>{item.name}</p>
                                <p className="text-slate-600">{item.quantity} x @{item.sellingPrice.toFixed(2)}</p>
                            </td>
                            <td className="text-right align-top py-1">{(item.quantity * item.sellingPrice).toFixed(2)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
            <hr className="my-3 border-dashed border-slate-400" />
            <div className="flex justify-between font-bold text-base my-2">
                <p>JUMLAH</p>
                <p>RM{sale.total.toFixed(2)}</p>
            </div>
            {sale.paymentMethod === 'Tunai' && sale.amountReceived && sale.change !== undefined && (
              <>
                <div className="flex justify-between text-xs">
                    <p>TUNAI DITERIMA</p>
                    <p>RM{sale.amountReceived.toFixed(2)}</p>
                </div>
                <div className="flex justify-between text-xs">
                    <p>BAKI</p>
                    <p>RM{sale.change.toFixed(2)}</p>
                </div>
              </>
            )}
            <p className="mt-2"><span className="font-semibold">Bayaran:</span> {sale.paymentMethod}</p>
        </div>

        <div className="p-4 bg-slate-50 dark:bg-slate-700 rounded-b-lg flex justify-end gap-3 print:hidden transition-colors duration-300">
            <button onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors duration-150">Tutup</button>
            <button onClick={handlePrint} className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors duration-150">
                <PrintIcon /> Cetak
            </button>
        </div>
      </div>
    </div>
  );
};

export default ReceiptModal;