
import React from 'react';
import { Sale } from '../types';

interface SettingsScreenProps {
  sales: Sale[];
  setInventory: React.Dispatch<React.SetStateAction<any[]>>;
  setSales: React.Dispatch<React.SetStateAction<Sale[]>>;
}

const SettingsScreen: React.FC<SettingsScreenProps> = ({ sales, setInventory, setSales }) => {
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
  };
  
  const resetData = () => {
    if (window.confirm("AMARAN: Tindakan ini akan memadam semua data jualan dan inventori secara kekal. Adakah anda pasti?")) {
        setInventory([]);
        setSales([]);
        window.localStorage.removeItem('inventory');
        window.localStorage.removeItem('sales');
        alert("Semua data telah dipadam.");
    }
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 mb-6">Tetapan</h2>
      <div className="space-y-4">
        <div className="bg-white p-4 rounded-lg shadow">
          <h3 className="font-bold text-lg mb-2">Eksport Data</h3>
          <p className="text-slate-600 text-sm mb-4">Eksport laporan jualan harian anda dalam format CSV.</p>
          <button onClick={exportDailySales} className="bg-green-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-green-700 transition">
            Eksport Laporan Jualan Harian
          </button>
        </div>
        <div className="bg-white p-4 rounded-lg shadow border border-red-200">
          <h3 className="font-bold text-lg mb-2 text-red-700">Zon Bahaya</h3>
          <p className="text-slate-600 text-sm mb-4">Padam semua data inventori dan jualan. Tindakan ini tidak boleh diubah.</p>
          <button onClick={resetData} className="bg-red-600 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-red-700 transition">
            Reset Semua Data
          </button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
