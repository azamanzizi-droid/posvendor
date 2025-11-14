
import React, { useState } from 'react';
import { Sale } from '../types';

interface SettingsScreenProps {
  sales: Sale[];
  setInventory: React.Dispatch<React.SetStateAction<any[]>>;
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
  theme: string;
  toggleTheme: () => void;
  brandName: string;
  setBrandName: (name: string) => void;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ sales, setInventory, setSales, theme, toggleTheme, brandName, setBrandName }) => {
  const [isDataExported, setIsDataExported] = useState(false);
  const [copyStatus, setCopyStatus] = useState('Salin Pautan');
  
  const vendorEntryUrl = `${window.location.origin}/vendor-entry`;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(vendorEntryUrl).then(() => {
      setCopyStatus('Disalin!');
      setTimeout(() => setCopyStatus('Salin Pautan'), 2000);
    }, () => {
      setCopyStatus('Gagal');
      setTimeout(() => setCopyStatus('Salin Pautan'), 2000);
    });
  };

  const exportDailySales = () => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const todaySales = sales.filter(sale => sale.timestamp >= today.getTime());

    if (todaySales.length === 0) {
      alert("Tiada jualan untuk dieksport hari ini.");
      return;
    }
    
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "ID,Masa,Item,Kuantiti,Harga Seunit,Jumlah,Cara Bayaran\r\n";

    todaySales.forEach(sale => {
      sale.items.forEach(item => {
        const row = [
          sale.id,
          new Date(sale.timestamp).toLocaleString('ms-MY'),
          item.name,
          item.quantity,
          item.sellingPrice.toFixed(2),
          (item.quantity * item.sellingPrice).toFixed(2),
          sale.paymentMethod
        ].join(",");
        csvContent += row + "\r\n";
      });
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    const dateStr = new Date().toISOString().split('T')[0];
    link.setAttribute("download", `laporan_jualan_${dateStr}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    alert("Laporan jualan harian telah berjaya dieksport!");
    setIsDataExported(true);
  };
  
  const resetData = () => {
    if (window.confirm("AMARAN: Tindakan ini akan memadam semua data jualan dan inventori secara kekal. Adakah anda pasti?")) {
        setInventory([]);
        setSales([]);
        window.localStorage.removeItem('inventory');
        window.localStorage.removeItem('sales');
        window.localStorage.removeItem('vendorSubmissions');
        alert("Semua data telah dipadam.");
        setIsDataExported(false); // Reset export status after data reset
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-6">Tetapan</h2>
      <div className="space-y-4">
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow transition-colors duration-300">
          <h3 className="font-bold text-lg mb-2 dark:text-slate-100">Jenama Perniagaan</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Masukkan nama perniagaan atau jenama anda. Ia akan dipaparkan di skrin jualan dan resit.</p>
          <input
            type="text"
            value={brandName}
            onChange={(e) => setBrandName(e.target.value)}
            placeholder="Contoh: Kopi Padu"
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400 transition-colors duration-300"
          />
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow transition-colors duration-300">
          <h3 className="font-bold text-lg mb-2 dark:text-slate-100">Pautan Kemasukan Vendor</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">
              Kongsi pautan ini dengan vendor anda untuk membolehkan mereka menyerahkan butiran menu baru. Penyerahan akan muncul di halaman Inventori untuk anda semak dan luluskan.
          </p>
          <div className="flex">
              <input 
                  type="text" 
                  readOnly 
                  value={vendorEntryUrl} 
                  className="w-full px-3 py-2 border border-r-0 border-slate-300 rounded-l-md bg-slate-50 focus:outline-none dark:bg-slate-900 dark:border-slate-600 dark:text-slate-300 transition-colors duration-300" 
              />
              <button 
                  onClick={handleCopyLink}
                  className="px-4 py-2 bg-slate-600 text-white font-semibold rounded-r-md hover:bg-slate-700 transition-colors whitespace-nowrap"
              >
                  {copyStatus}
              </button>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow transition-colors duration-300">
          <h3 className="font-bold text-lg mb-2 dark:text-slate-100">Tema</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Pilih antara mod terang atau mod gelap.</p>
          <div className="flex items-center justify-between">
            <span className="font-semibold dark:text-slate-200">Mod Gelap</span>
            <button 
              onClick={toggleTheme} 
              className={`relative inline-flex items-center h-6 rounded-full w-11 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-slate-800 ${theme === 'dark' ? 'bg-blue-500' : 'bg-slate-300 dark:bg-slate-600'}`}
              aria-label={`Tukar ke mod ${theme === 'dark' ? 'terang' : 'gelap'}`}
            >
              <span className={`inline-block w-4 h-4 transform bg-white rounded-full transition-transform ${theme === 'dark' ? 'translate-x-6' : 'translate-x-1'}`}/>
            </button>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow transition-colors duration-300">
          <h3 className="font-bold text-lg mb-2 dark:text-slate-100">Eksport Data</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Eksport laporan jualan harian anda dalam format CSV. Ini akan mengaktifkan butang Reset Data.</p>
          <button onClick={exportDailySales} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-green-700 transition">
            Eksport Laporan Jualan Harian
          </button>
        </div>
        <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow border border-red-200 dark:border-red-900/50 transition-colors duration-300">
          <h3 className="font-bold text-lg mb-2 text-red-700 dark:text-red-500">Zon Bahaya</h3>
          <p className="text-slate-600 dark:text-slate-400 text-sm mb-4">Padam semua data inventori dan jualan. Tindakan ini tidak boleh diubah.</p>
          <button 
            onClick={resetData} 
            disabled={!isDataExported}
            className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-red-700 transition disabled:bg-red-400 dark:disabled:bg-red-800 disabled:cursor-not-allowed"
            aria-describedby="reset-description"
          >
            Reset Semua Data
          </button>
          {!isDataExported && (
            <p id="reset-description" className="text-xs text-slate-500 dark:text-slate-400 mt-2">
              Sila eksport data jualan harian anda terlebih dahulu untuk mengaktifkan butang ini.
            </p>
          )}
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
