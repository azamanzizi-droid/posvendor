
import React, { useState, useMemo } from 'react';
import { Sale, MenuItem } from '../types';
import { ChevronDownIcon, ChevronUpIcon, PrintIcon } from './Icons';
import ReceiptModal from './ReceiptModal';

interface ReportsScreenProps {
  sales: Sale[];
  inventory: MenuItem[];
  brandName: string;
}

const StatCard: React.FC<{ title: string; value: string; }> = ({ title, value }) => (
    <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow transition-colors duration-300">
        <h3 className="text-sm font-medium text-slate-600 dark:text-slate-400">{title}</h3>
        <p className="text-2xl font-bold text-slate-800 dark:text-slate-100">{value}</p>
    </div>
);

const ReportsScreen: React.FC<ReportsScreenProps> = ({ sales, inventory, brandName }) => {
  const [activeTab, setActiveTab] = useState('dailySales');
  const [isTransactionsVisible, setIsTransactionsVisible] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  const todaySales = useMemo(() => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return sales.filter(sale => sale.timestamp >= today.getTime());
  }, [sales]);

  const dailyReport = useMemo(() => {
    const totalRevenue = todaySales.reduce((sum, sale) => sum + sale.total, 0);
    const totalProfit = todaySales.reduce((sum, sale) => sum + sale.profit, 0);
    const totalTransactions = todaySales.length;
    const byPaymentMethod = todaySales.reduce((acc, sale) => {
        acc[sale.paymentMethod] = (acc[sale.paymentMethod] || 0) + sale.total;
        return acc;
    }, {} as Record<'Tunai'|'E-Wallet', number>);
    const totalCost = totalRevenue - totalProfit;

    return { totalRevenue, totalProfit, totalTransactions, byPaymentMethod, totalCost };
  }, [todaySales]);

  const stockReportGroupedByVendor = useMemo(() => {
    const soldItems = todaySales.flatMap(sale => sale.items).reduce((acc, item) => {
        acc[item.id] = (acc[item.id] || 0) + item.quantity;
        return acc;
    }, {} as Record<string, number>);

    const grouped: Record<string, {
        id: string;
        name: string;
        sold: number;
        openingStock: number;
        balance: number;
    }[]> = {};

    inventory.forEach(item => {
        const vendorName = item.vendor || 'Tiada Vendor';
        if (!grouped[vendorName]) {
            grouped[vendorName] = [];
        }

        const sold = soldItems[item.id] || 0;
        const openingStock = item.stock + sold;

        grouped[vendorName].push({
            id: item.id,
            name: item.name,
            sold,
            openingStock,
            balance: item.stock
        });
    });

    return Object.entries(grouped).sort(([vendorA], [vendorB]) => vendorA.localeCompare(vendorB));
      
  }, [inventory, todaySales]);


  const vendorReport = useMemo(() => {
    const salesByVendor: Record<string, { totalCost: number; items: { name: string; quantity: number; cost: number; }[] }> = {};

    todaySales.forEach(sale => {
      sale.items.forEach(soldItem => {
        const inventoryItem = inventory.find(i => i.id === soldItem.id);
        const vendorName = inventoryItem?.vendor || 'Tiada Vendor';

        if (!salesByVendor[vendorName]) {
          salesByVendor[vendorName] = { totalCost: 0, items: [] };
        }

        const cost = soldItem.costPrice * soldItem.quantity;
        salesByVendor[vendorName].totalCost += cost;

        const existingItem = salesByVendor[vendorName].items.find(i => i.name === soldItem.name);
        if (existingItem) {
          existingItem.quantity += soldItem.quantity;
          existingItem.cost += cost;
        } else {
          salesByVendor[vendorName].items.push({
            name: soldItem.name,
            quantity: soldItem.quantity,
            cost: cost,
          });
        }
      });
    });

    return Object.entries(salesByVendor).map(([vendor, data]) => ({
      vendor,
      ...data
    })).sort((a, b) => b.totalCost - a.totalCost);
  }, [todaySales, inventory]);

  const cashFlowData = useMemo(() => {
    const data: { [key: string]: { date: Date; revenue: number; profit: number } } = {};
    const today = new Date();
    today.setHours(23, 59, 59, 999);

    for (let i = 0; i < 7; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() - i);
      const dateString = date.toISOString().split('T')[0];
      data[dateString] = { date: date, revenue: 0, profit: 0 };
    }
    
    sales.forEach(sale => {
      const saleDate = new Date(sale.timestamp);
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      sevenDaysAgo.setHours(0, 0, 0, 0);

      if (saleDate >= sevenDaysAgo) {
        const dateString = saleDate.toISOString().split('T')[0];
        if (data[dateString]) {
          data[dateString].revenue += sale.total;
          data[dateString].profit += sale.profit;
        }
      }
    });

    return Object.values(data).sort((a, b) => a.date.getTime() - b.date.getTime());
  }, [sales]);

  const searchResults = useMemo(() => {
    if (!searchQuery.trim()) {
        return [];
    }
    return sales.filter(sale => {
        const query = searchQuery.toLowerCase().trim();
        if (sale.id.toLowerCase().includes(query)) {
            return true;
        }
        return sale.items.some(item => item.name.toLowerCase().includes(query));
    }).sort((a, b) => b.timestamp - a.timestamp); // Show most recent first
  }, [sales, searchQuery]);

  const TabButton: React.FC<{ tabName: string, label: string }> = ({ tabName, label }) => (
      <button 
        onClick={() => setActiveTab(tabName)} 
        className={`px-4 py-2 font-semibold rounded-md text-sm transition-colors duration-150 ${activeTab === tabName ? 'bg-blue-500 text-white' : 'text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'}`}
      >
        {label}
      </button>
  );
  
  const tunaiAmount = dailyReport.byPaymentMethod['Tunai'] || 0;
  const ewalletAmount = dailyReport.byPaymentMethod['E-Wallet'] || 0;
  const tunaiPercentage = dailyReport.totalRevenue > 0 ? (tunaiAmount / dailyReport.totalRevenue) * 100 : 0;
  const ewalletPercentage = dailyReport.totalRevenue > 0 ? (ewalletAmount / dailyReport.totalRevenue) * 100 : 0;

  const CashFlowChart: React.FC<{ data: typeof cashFlowData }> = ({ data }) => {
    const chartHeight = 250;
    const chartWidth = 500;
    const maxValue = Math.max(...data.map(d => d.revenue), 10);
    const barWidth = chartWidth / data.length / 2.5;

    const yAxisLabels = [0, maxValue / 2, maxValue].map(val => ({
      value: `RM${Math.round(val)}`,
      y: chartHeight - (val / maxValue) * chartHeight
    }));

    return (
      <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow transition-colors duration-300">
        <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Aliran Tunai 7 Hari Terakhir</h3>
        <div className="flex justify-end gap-4 text-xs mb-2">
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-blue-500"></div>
                <span className="text-slate-600 dark:text-slate-400">Jualan</span>
            </div>
            <div className="flex items-center gap-1.5">
                <div className="w-3 h-3 rounded-sm bg-green-500"></div>
                <span className="text-slate-600 dark:text-slate-400">Untung</span>
            </div>
        </div>
        <div className="w-full overflow-x-auto">
          <svg viewBox={`-40 0 ${chartWidth + 50} ${chartHeight + 30}`} className="min-w-[500px]">
            {yAxisLabels.map(label => (
              <text key={label.value} x="-10" y={label.y + 4} textAnchor="end" className="text-xs fill-current text-slate-500 dark:text-slate-400">
                {label.value}
              </text>
            ))}
            {data.map((day, index) => {
              const revenueHeight = (day.revenue / maxValue) * chartHeight;
              const profitHeight = (day.profit / maxValue) * chartHeight;
              const xPos = (index * (chartWidth / data.length)) + (chartWidth / data.length / 2);

              return (
                <g key={day.date.toISOString()}>
                  <rect
                    x={xPos - barWidth}
                    y={chartHeight - revenueHeight}
                    width={barWidth}
                    height={revenueHeight}
                    className="fill-current text-blue-500"
                    rx="2"
                  />
                  <rect
                    x={xPos}
                    y={chartHeight - profitHeight}
                    width={barWidth}
                    height={profitHeight}
                    className="fill-current text-green-500"
                    rx="2"
                  />
                  <text
                    x={xPos - barWidth/2}
                    y={chartHeight + 15}
                    textAnchor="middle"
                    className="text-xs fill-current text-slate-600 dark:text-slate-300"
                  >
                    {day.date.toLocaleDateString('ms-MY', { day: '2-digit', month: 'short' })}
                  </text>
                </g>
              );
            })}
            <line x1="0" y1={chartHeight} x2={chartWidth} y2={chartHeight} className="stroke-current text-slate-300 dark:text-slate-600" />
          </svg>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2 className="text-2xl font-bold text-slate-800 dark:text-slate-200 mb-4">Laporan</h2>
      <div className="flex space-x-2 border-b dark:border-slate-700 mb-4 overflow-x-auto pb-2">
          <TabButton tabName="dailySales" label="Jualan Harian" />
          <TabButton tabName="cashFlow" label="Aliran Tunai" />
          <TabButton tabName="stockBalance" label="Baki Stok" />
          <TabButton tabName="vendorSales" label="Jualan Vendor" />
          <TabButton tabName="dayClosing" label="Penutupan Hari" />
          <TabButton tabName="receiptSearch" label="Carian Resit" />
      </div>

      {activeTab === 'dailySales' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard title="Jumlah Jualan (RM)" value={dailyReport.totalRevenue.toFixed(2)} />
              <StatCard title="Jumlah Keuntungan (RM)" value={dailyReport.totalProfit.toFixed(2)} />
              <StatCard title="Jumlah Transaksi" value={dailyReport.totalTransactions.toString()} />
          </div>
          
          <div className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow transition-colors duration-300">
              <h3 className="text-lg font-bold text-slate-800 dark:text-slate-100 mb-4">Pecahan Bayaran</h3>
              {dailyReport.totalRevenue > 0 ? (
                  <div className="flex flex-col md:flex-row items-center gap-6">
                      <div className="w-32 h-32 rounded-full flex-shrink-0" style={{
                           background: `conic-gradient(#3b82f6 0% ${tunaiPercentage}%, #94a3b8 ${tunaiPercentage}% 100%)`
                      }}></div>
                      <div className="w-full flex-grow space-y-3">
                          <div>
                              <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                      <span className="w-4 h-4 rounded bg-blue-500"></span>
                                      <span className="font-semibold text-slate-700 dark:text-slate-200">Tunai</span>
                                  </div>
                                  <span className="font-bold text-slate-800 dark:text-slate-100">RM{tunaiAmount.toFixed(2)}</span>
                              </div>
                              <p className="text-right text-sm text-slate-500 dark:text-slate-400">{tunaiPercentage.toFixed(1)}%</p>
                          </div>
                          <div>
                              <div className="flex justify-between items-center">
                                  <div className="flex items-center gap-2">
                                      <span className="w-4 h-4 rounded bg-slate-400"></span>
                                      <span className="font-semibold text-slate-700 dark:text-slate-200">E-Wallet</span>
                                  </div>
                                  <span className="font-bold text-slate-800 dark:text-slate-100">RM{ewalletAmount.toFixed(2)}</span>
                              </div>
                              <p className="text-right text-sm text-slate-500 dark:text-slate-400">{ewalletPercentage.toFixed(1)}%</p>
                          </div>
                      </div>
                  </div>
              ) : (
                  <p className="text-center text-slate-500 dark:text-slate-400 py-4">Tiada data jualan untuk dipaparkan.</p>
              )}
          </div>

           <div className="bg-white dark:bg-slate-800 rounded-lg shadow mt-4 transition-colors duration-300">
            <div className="flex justify-between items-center p-4 border-b dark:border-slate-700">
              <h3 className="font-bold text-lg dark:text-slate-100">Transaksi Hari Ini</h3>
              <button onClick={() => setIsTransactionsVisible(!isTransactionsVisible)} className="flex items-center gap-1 text-sm text-blue-500 font-semibold hover:text-blue-700">
                {isTransactionsVisible ? 'Sembunyikan' : 'Tunjukkan'}
                {isTransactionsVisible ? <ChevronUpIcon /> : <ChevronDownIcon />}
              </button>
            </div>
            {isTransactionsVisible && (
              <div className="overflow-x-auto">
                <table className="w-full text-sm dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                      <th className="p-3 text-left">Masa</th>
                      <th className="p-3 text-left">Item</th>
                      <th className="p-3 text-right">Jumlah (RM)</th>
                      <th className="p-3 text-center">Bayaran</th>
                    </tr>
                  </thead>
                  <tbody>
                    {todaySales.map(sale => (
                      <tr key={sale.id} className="border-b dark:border-slate-700">
                        <td className="p-3">{new Date(sale.timestamp).toLocaleTimeString()}</td>
                        <td className="p-3">{sale.items.map(i => `${i.name} (x${i.quantity})`).join(', ')}</td>
                        <td className="p-3 text-right">{sale.total.toFixed(2)}</td>
                        <td className="p-3 text-center">{sale.paymentMethod}</td>
                      </tr>
                    ))}
                    {todaySales.length === 0 && <tr><td colSpan={4} className="p-4 text-center text-slate-500 dark:text-slate-400">Tiada jualan hari ini.</td></tr>}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'cashFlow' && (
        <div className="space-y-4">
          <CashFlowChart data={cashFlowData} />
        </div>
      )}

      {activeTab === 'stockBalance' && (
        <div className="space-y-4">
          {stockReportGroupedByVendor.length > 0 ? stockReportGroupedByVendor.map(([vendor, items]) => (
            <div key={vendor} className="bg-white dark:bg-slate-800 rounded-lg shadow overflow-hidden transition-colors duration-300">
              <h3 className="font-bold text-lg p-4 bg-slate-50 dark:bg-slate-700/50 border-b dark:border-slate-700 dark:text-slate-100">{vendor}</h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm dark:text-slate-300">
                  <thead className="bg-slate-50 dark:bg-slate-700">
                    <tr>
                      <th className="p-3 text-left">Nama Produk</th>
                      <th className="p-3 text-center">Stok Awal</th>
                      <th className="p-3 text-center">Terjual Hari Ini</th>
                      <th className="p-3 text-center">Baki Stok</th>
                    </tr>
                  </thead>
                  <tbody>
                    {items.map(item => (
                      <tr key={item.id} className="border-b dark:border-slate-700 last:border-b-0">
                        <td className="p-3 font-semibold">{item.name}</td>
                        <td className="p-3 text-center">{item.openingStock}</td>
                        <td className="p-3 text-center">{item.sold}</td>
                        <td className="p-3 text-center">{item.balance}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )) : (
            <div className="bg-white dark:bg-slate-800 rounded-lg shadow p-4 text-center text-slate-500 dark:text-slate-400 transition-colors duration-300">
                Tiada item dalam inventori.
            </div>
          )}
        </div>
      )}

      {activeTab === 'vendorSales' && (
        <div className="space-y-4">
          <StatCard title="Jumlah Jualan Harga Vendor (RM)" value={dailyReport.totalCost.toFixed(2)} />
          <p className="text-slate-600 dark:text-slate-400 text-sm">Ini adalah jumlah kos bagi semua item yang telah dijual hari ini, dipecahkan mengikut vendor. Gunakan jumlah ini untuk pembayaran kepada vendor.</p>
          
          <div className="space-y-4">
            {vendorReport.length > 0 ? vendorReport.map(({ vendor, totalCost, items }) => (
              <div key={vendor} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow transition-colors duration-300">
                <div className="flex justify-between items-center mb-2">
                  <h4 className="font-bold text-lg text-slate-800 dark:text-slate-100">{vendor}</h4>
                  <p className="font-bold text-blue-500">Jumlah: RM{totalCost.toFixed(2)}</p>
                </div>
                <ul className="text-sm space-y-1 text-slate-600 dark:text-slate-400">
                  {items.map(item => (
                    <li key={item.name} className="flex justify-between">
                      <span>{item.name} (x{item.quantity})</span>
                      <span>RM{item.cost.toFixed(2)}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )) : <p className="text-center text-slate-500 dark:text-slate-400 py-4 bg-white dark:bg-slate-800 rounded-lg shadow transition-colors duration-300">Tiada jualan vendor untuk dilaporkan hari ini.</p>}
          </div>
        </div>
      )}

      {activeTab === 'dayClosing' && (
        <div>
            <div className="flex justify-between items-center mb-4 print:hidden">
                <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Laporan Penutupan Hari</h3>
                <button onClick={() => window.print()} className="flex items-center gap-2 bg-blue-500 text-white font-semibold px-4 py-2 rounded-lg shadow hover:bg-blue-600 transition">
                    <PrintIcon /> Cetak Laporan
                </button>
            </div>

            <div id="day-end-report-printable" className="space-y-6 bg-white dark:bg-slate-800 p-4 rounded-lg shadow transition-colors duration-300">
                <div className="hidden print:block text-center mb-4">
                    <h1 className="text-3xl font-bold">{brandName}</h1>
                    <h2 className="text-2xl font-bold">Laporan Penutupan Hari</h2>
                    <p>{new Date().toLocaleDateString('ms-MY', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</p>
                </div>

                <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200 border-b dark:border-slate-700 pb-2">Ringkasan Jualan</h4>
                <div className="grid grid-cols-3 gap-4">
                    <StatCard title="Jumlah Jualan (RM)" value={dailyReport.totalRevenue.toFixed(2)} />
                    <StatCard title="Jumlah Keuntungan (RM)" value={dailyReport.totalProfit.toFixed(2)} />
                    <StatCard title="Jumlah Transaksi" value={dailyReport.totalTransactions.toString()} />
                </div>

                <h4 className="text-lg font-bold text-slate-700 dark:text-slate-200 border-b dark:border-slate-700 pb-2 mt-6">Ringkasan Baki Stok</h4>
                <div className="space-y-4">
                    {stockReportGroupedByVendor.length > 0 ? stockReportGroupedByVendor.map(([vendor, items]) => (
                        <div key={vendor} className="overflow-hidden break-inside-avoid border dark:border-slate-700 rounded-lg">
                            <h3 className="font-bold text-md p-3 bg-slate-100 dark:bg-slate-700 border-b dark:border-slate-600 dark:text-slate-100">{vendor}</h3>
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm dark:text-slate-300">
                                    <thead className="bg-slate-50 dark:bg-slate-600">
                                        <tr>
                                            <th className="p-3 text-left">Nama Produk</th>
                                            <th className="p-3 text-center">Stok Awal</th>
                                            <th className="p-3 text-center">Terjual</th>
                                            <th className="p-3 text-center">Baki Stok</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {items.map(item => (
                                            <tr key={item.id} className="border-b dark:border-slate-700 last:border-b-0">
                                                <td className="p-3 font-semibold">{item.name}</td>
                                                <td className="p-3 text-center">{item.openingStock}</td>
                                                <td className="p-3 text-center">{item.sold}</td>
                                                <td className="p-3 text-center font-bold">{item.balance}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )) : (
                        <div className="p-4 text-center text-slate-500 dark:text-slate-400">
                            Tiada item dalam inventori.
                        </div>
                    )}
                </div>
            </div>
        </div>
      )}

      {activeTab === 'receiptSearch' && (
        <div className="space-y-4">
          <h3 className="text-xl font-bold text-slate-800 dark:text-slate-100">Cari Resit Jualan</h3>
          <input
            type="text"
            placeholder="Cari mengikut ID resit atau nama item..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400 transition-colors duration-300"
          />
          <div className="space-y-3">
            {searchQuery.trim() === '' ? (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">Sila masukkan ID resit atau nama item untuk memulakan carian.</p>
            ) : searchResults.length > 0 ? (
              searchResults.map(sale => (
                <div key={sale.id} className="bg-white dark:bg-slate-800 p-4 rounded-lg shadow flex justify-between items-center transition-colors duration-300">
                  <div>
                    <p className="font-bold text-slate-800 dark:text-slate-100">ID: {sale.id}</p>
                    <p className="text-sm text-slate-600 dark:text-slate-400">{new Date(sale.timestamp).toLocaleString('ms-MY')}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-300 truncate max-w-xs sm:max-w-sm md:max-w-md">{sale.items.map(i => i.name).join(', ')}</p>
                  </div>
                  <div className="text-right flex-shrink-0 ml-4">
                      <p className="font-bold text-blue-500">RM{sale.total.toFixed(2)}</p>
                      <button 
                        onClick={() => setSelectedSale(sale)}
                        className="mt-1 text-sm text-blue-500 hover:underline font-semibold"
                      >
                        Lihat Resit
                      </button>
                  </div>
                </div>
              ))
            ) : (
              <p className="text-center text-slate-500 dark:text-slate-400 py-8">Tiada resit ditemui untuk "{searchQuery}".</p>
            )}
          </div>
        </div>
      )}

      {selectedSale && <ReceiptModal sale={selectedSale} onClose={() => setSelectedSale(null)} brandName={brandName} />}
    </div>
  );
};

export default ReportsScreen;
