
import React, { useState, useEffect } from 'react';
import useLocalStorage from './hooks/useLocalStorage';
import { Page, MenuItem, Sale } from './types';
import Navbar from './components/Navbar';
import SalesScreen from './components/SalesScreen';
import InventoryScreen from './components/InventoryScreen';
import ReportsScreen from './components/ReportsScreen';
import SettingsScreen from './components/SettingsScreen';

function App() {
  const [page, setPage] = useState<Page>('jualan');
  const [inventory, setInventory] = useLocalStorage<MenuItem[]>('inventory', []);
  const [sales, setSales] = useLocalStorage<Sale[]>('sales', []);
  const [theme, setTheme] = useLocalStorage<string>('theme', 'light');
  const [brandName, setBrandName] = useLocalStorage<string>('brandName', 'Kedai Saya');

  useEffect(() => {
    const root = window.document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
      // Proactively correct any invalid theme value found in storage.
      if (theme !== 'light') {
        setTheme('light');
      }
    }
  }, [theme, setTheme]);

  const toggleTheme = () => {
    setTheme(prevTheme => (prevTheme === 'light' ? 'dark' : 'light'));
  };

  const addSale = (sale: Sale) => {
    setSales(prevSales => [...prevSales, sale]);
  };
  
  const renderPage = () => {
    switch (page) {
      case 'jualan':
        return <SalesScreen inventory={inventory} setInventory={setInventory} addSale={addSale} brandName={brandName} />;
      case 'inventori':
        return <InventoryScreen inventory={inventory} setInventory={setInventory} />;
      case 'laporan':
        return <ReportsScreen sales={sales} inventory={inventory} brandName={brandName} />;
      case 'tetapan':
        return <SettingsScreen sales={sales} setInventory={setInventory} setSales={setSales} theme={theme} toggleTheme={toggleTheme} brandName={brandName} setBrandName={setBrandName} />;
      default:
        return <SalesScreen inventory={inventory} setInventory={setInventory} addSale={addSale} brandName={brandName} />;
    }
  };

  const getPageTitle = () => {
    switch (page) {
      case 'jualan': return 'Sistem Jualan';
      case 'inventori': return 'Pengurusan Inventori';
      case 'laporan': return 'Laporan';
      case 'tetapan': return 'Tetapan';
      default: return 'Sistem POS';
    }
  };

  return (
    <div className="min-h-screen bg-slate-200 dark:bg-slate-900 font-sans transition-colors duration-300">
        <header className="bg-slate-800 dark:bg-slate-950 shadow-md sticky top-0 z-30 transition-colors duration-300">
            <div className="max-w-4xl mx-auto px-4 py-3">
                <h1 className="text-xl font-bold text-white">{getPageTitle()}</h1>
            </div>
        </header>
        <main className="max-w-4xl mx-auto p-4 pb-24">
            {renderPage()}
        </main>
        <Navbar activePage={page} setPage={setPage} />
    </div>
  );
}

export default App;