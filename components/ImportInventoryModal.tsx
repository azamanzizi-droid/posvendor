import React, { useState } from 'react';
import Modal from './Modal';
import { MenuItem } from '../types';

interface ImportInventoryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (items: MenuItem[]) => void;
}

const ImportInventoryModal: React.FC<ImportInventoryModalProps> = ({ isOpen, onClose, onConfirm }) => {
  const [file, setFile] = useState<File | null>(null);
  const [parsedData, setParsedData] = useState<MenuItem[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const resetState = () => {
    setFile(null);
    setParsedData([]);
    setError(null);
    setIsLoading(false);
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (selectedFile) {
      if (selectedFile.type !== 'text/csv') {
        setError('Sila muat naik fail format .csv sahaja.');
        resetState();
        return;
      }
      setFile(selectedFile);
      parseCSV(selectedFile);
    }
  };

  const parseCSV = (csvFile: File) => {
    setIsLoading(true);
    setError(null);
    setParsedData([]);
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const rows = text.split('\n').filter(row => row.trim() !== '');
      if (rows.length < 2) {
        setError('Fail CSV kosong atau hanya mempunyai baris pengepala.');
        setIsLoading(false);
        return;
      }

      const header = rows[0].split(',').map(h => h.trim());
      const requiredHeaders = ['id', 'name', 'costPrice', 'sellingPrice', 'stock'];
      const missingHeaders = requiredHeaders.filter(h => !header.includes(h));

      if (missingHeaders.length > 0) {
        setError(`Pengepala yang tiada: ${missingHeaders.join(', ')}.\nPengepala diperlukan: id, name, vendor, costPrice, sellingPrice, stock, imageUrl.`);
        setIsLoading(false);
        return;
      }

      const data: MenuItem[] = [];
      const errors: string[] = [];
      
      const idIndex = header.indexOf('id');
      const nameIndex = header.indexOf('name');
      const vendorIndex = header.indexOf('vendor');
      const imageUrlIndex = header.indexOf('imageUrl');
      const costPriceIndex = header.indexOf('costPrice');
      const sellingPriceIndex = header.indexOf('sellingPrice');
      const stockIndex = header.indexOf('stock');

      for (let i = 1; i < rows.length; i++) {
        const values = rows[i].split(',');
        const id = values[idIndex]?.trim();
        const name = values[nameIndex]?.trim();
        
        if (!id || !name) {
            errors.push(`Baris ${i + 1}: Lajur 'id' dan 'name' tidak boleh kosong.`);
            continue;
        }

        const costPrice = parseFloat(values[costPriceIndex]);
        const sellingPrice = parseFloat(values[sellingPriceIndex]);
        const stock = parseInt(values[stockIndex], 10);
        
        if (isNaN(costPrice) || isNaN(sellingPrice) || isNaN(stock)) {
            errors.push(`Baris ${i + 1}: Harga kos, harga jual, dan stok mesti dalam bentuk nombor.`);
            continue;
        }
        
        data.push({
            id,
            name,
            vendor: values[vendorIndex]?.trim() || '',
            imageUrl: values[imageUrlIndex]?.trim() || '',
            costPrice,
            sellingPrice,
            stock
        });
      }
      
      if (errors.length > 0) {
          setError(`Terdapat ralat dalam fail:\n${errors.slice(0, 5).join('\n')}`);
          setParsedData([]);
      } else {
          setParsedData(data);
      }
      setIsLoading(false);
    };

    reader.onerror = () => {
        setError('Gagal membaca fail.');
        setIsLoading(false);
    };

    reader.readAsText(csvFile);
  };
  
  const handleSubmit = () => {
    if (parsedData.length > 0) {
        if(window.confirm('Adakah anda pasti? Ini akan menggantikan SEMUA item inventori semasa anda.')){
            onConfirm(parsedData);
            handleClose();
        }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} title="Import Inventori">
      <div className="space-y-4">
        <div className="p-4 bg-red-50 dark:bg-red-900/50 border-l-4 border-red-500 text-red-700 dark:text-red-300 rounded-r-lg">
            <h4 className="font-bold">Amaran</h4>
            <p className="text-sm">Tindakan ini akan <span className="font-bold">menggantikan sepenuhnya</span> senarai inventori semasa anda. Pastikan anda mempunyai sandaran jika perlu.</p>
        </div>

        <div>
          <h4 className="font-semibold text-slate-700 dark:text-slate-200">Arahan:</h4>
          <ol className="list-decimal list-inside text-sm text-slate-600 dark:text-slate-400 space-y-1 mt-2 bg-slate-100 dark:bg-slate-700 p-3 rounded-md transition-colors duration-300">
            <li>Gunakan fail CSV yang dieksport dari sistem ini atau fail dengan format yang sama.</li>
            <li>Baris pertama (pengepala) mestilah: <code className="text-xs bg-slate-200 dark:bg-slate-600 p-1 rounded">id,name,vendor,costPrice,sellingPrice,stock,imageUrl</code></li>
            <li>Pastikan semua lajur wajib diisi. Elakkan penggunaan koma (,) dalam nama atau vendor.</li>
          </ol>
        </div>
        
        <div>
            <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">Pilih Fail CSV</label>
            <input 
                type="file" 
                accept=".csv" 
                onChange={handleFileChange} 
                className="block w-full text-sm text-slate-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100 dark:file:bg-blue-900/50 dark:file:text-blue-300 dark:hover:file:bg-blue-900"
            />
        </div>
        
        {isLoading && <p className="text-center text-slate-500 dark:text-slate-400">Memproses...</p>}
        {error && <p className="text-center text-red-600 dark:text-red-500 text-sm whitespace-pre-wrap">{error}</p>}
        
        {parsedData.length > 0 && (
            <div>
                <h4 className="font-semibold text-slate-700 dark:text-slate-200 mb-2">Pratonton Data ({parsedData.length} item ditemui)</h4>
                <div className="max-h-48 overflow-y-auto bg-slate-50 dark:bg-slate-900/50 p-2 rounded-md border dark:border-slate-700 transition-colors duration-300">
                    <table className="w-full text-xs text-left">
                        <thead className="sticky top-0 bg-slate-100 dark:bg-slate-700">
                            <tr>
                                <th className="p-2">Nama</th>
                                <th className="p-2">Harga Jual</th>
                                <th className="p-2">Stok</th>
                            </tr>
                        </thead>
                        <tbody className="dark:text-slate-300">
                            {parsedData.slice(0, 10).map((item, index) => (
                                <tr key={index} className="border-b dark:border-slate-700 last:border-0">
                                    <td className="p-2">{item.name}</td>
                                    <td className="p-2">RM{item.sellingPrice.toFixed(2)}</td>
                                    <td className="p-2">{item.stock}</td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                    {parsedData.length > 10 && <p className="text-center text-xs mt-2 text-slate-500">... dan {parsedData.length - 10} lagi.</p>}
                </div>
            </div>
        )}
        
        <div className="flex justify-end gap-3 pt-4">
          <button type="button" onClick={handleClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500">Batal</button>
          <button 
            type="button" 
            onClick={handleSubmit} 
            disabled={parsedData.length === 0 || isLoading}
            className="px-4 py-2 bg-purple-600 text-white rounded-md hover:bg-purple-700 disabled:bg-slate-400 dark:disabled:bg-slate-600 disabled:cursor-not-allowed"
          >
            Sahkan & Ganti {parsedData.length > 0 ? `(${parsedData.length} item)` : ''}
          </button>
        </div>
      </div>
    </Modal>
  );
};

export default ImportInventoryModal;
