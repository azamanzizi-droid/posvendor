
import React, { useState } from 'react';
import useLocalStorage from '../hooks/useLocalStorage';
import { VendorSubmission } from '../types';

const InputField: React.FC<{
  label: string;
  type: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  step?: string;
  required?: boolean;
}> = ({ label, type, value, onChange, step, required = true }) => (
  <div>
    <label className="block text-sm font-medium text-slate-600 dark:text-slate-300 mb-1">{label}</label>
    <input
      type={type}
      value={value}
      onChange={onChange}
      step={step}
      required={required}
      className="w-full px-3 py-2 border border-slate-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-400 focus:border-blue-400 dark:bg-slate-700 dark:border-slate-600 dark:text-slate-200 dark:placeholder-slate-400 transition-colors duration-300"
    />
  </div>
);

const VendorEntryScreen = () => {
    const [vendor, setVendor] = useState('');
    const [name, setName] = useState('');
    const [costPrice, setCostPrice] = useState('');
    const [submissions, setSubmissions] = useLocalStorage<VendorSubmission[]>('vendorSubmissions', []);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        const newSubmission: VendorSubmission = {
            id: `sub-${Date.now()}`,
            vendor,
            name,
            costPrice: parseFloat(costPrice) || 0,
            submittedAt: Date.now(),
        };
        setSubmissions([...submissions, newSubmission]);
        
        // Reset form and show success message
        setVendor('');
        setName('');
        setCostPrice('');
        setIsSubmitted(true);

        setTimeout(() => setIsSubmitted(false), 5000); // Hide message after 5 seconds
    };

    return (
        <div className="min-h-screen bg-slate-200 dark:bg-slate-900 font-sans transition-colors duration-300 flex items-center justify-center p-4">
            <div className="w-full max-w-lg">
                <header className="text-center mb-8">
                    <h1 className="text-3xl font-bold text-slate-800 dark:text-slate-100">Portal Kemasukan Menu Vendor</h1>
                    <p className="text-slate-600 dark:text-slate-400 mt-2">Sila masukkan butiran untuk menu baharu anda di bawah.</p>
                </header>
                <main className="bg-white dark:bg-slate-800 rounded-lg shadow-xl p-6 md:p-8">
                    {isSubmitted ? (
                        <div className="text-center p-8 bg-green-50 dark:bg-green-900/50 rounded-lg">
                            <h2 className="text-2xl font-bold text-green-700 dark:text-green-300">Terima Kasih!</h2>
                            <p className="text-slate-600 dark:text-slate-300 mt-2">Penyerahan anda telah diterima dan akan disemak tidak lama lagi.</p>
                            <button 
                                onClick={() => setIsSubmitted(false)} 
                                className="mt-6 px-6 py-2 bg-blue-500 text-white font-semibold rounded-lg shadow hover:bg-blue-600 transition"
                            >
                                Hantar Lagi
                            </button>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <InputField label="Nama Vendor / Syarikat Anda" type="text" value={vendor} onChange={e => setVendor(e.target.value)} />
                            <InputField label="Nama Menu Baharu" type="text" value={name} onChange={e => setName(e.target.value)} />
                            <InputField label="Harga Kos (RM)" type="number" value={costPrice} onChange={e => setCostPrice(e.target.value)} step="0.01" />
                            <button type="submit" className="w-full px-4 py-3 bg-blue-500 text-white font-bold rounded-lg hover:bg-blue-600 transition-colors duration-150 text-lg">
                                Hantar Menu
                            </button>
                        </form>
                    )}
                </main>
                 <footer className="text-center mt-8">
                    <p className="text-sm text-slate-500 dark:text-slate-500">Dikuasakan oleh Sistem POS Vendor</p>
                </footer>
            </div>
        </div>
    );
};

export default VendorEntryScreen;
