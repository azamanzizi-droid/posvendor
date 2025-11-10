
import React from 'react';
import { Page } from '../types';
import { PosIcon, InventoryIcon, ReportIcon, SettingsIcon } from './Icons';

interface NavbarProps {
  activePage: Page;
  setPage: (page: Page) => void;
}

const NavButton: React.FC<{
  label: string;
  // Fix: Changed JSX.Element to React.ReactElement to resolve namespace issue.
  icon: React.ReactElement;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => {
  const activeClasses = 'text-white';
  const inactiveClasses = 'text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-300';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      {icon}
      <span className="text-xs font-medium">{label}</span>
    </button>
  );
};


const Navbar: React.FC<NavbarProps> = ({ activePage, setPage }) => {
  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-slate-800 dark:bg-slate-950 border-t border-slate-700 dark:border-slate-800 h-16 z-40 transition-colors duration-300">
      <div className="flex justify-around items-center h-full max-w-lg mx-auto">
        <NavButton
          label="Jualan"
          icon={<PosIcon />}
          isActive={activePage === 'jualan'}
          onClick={() => setPage('jualan')}
        />
        <NavButton
          label="Inventori"
          icon={<InventoryIcon />}
          isActive={activePage === 'inventori'}
          onClick={() => setPage('inventori')}
        />
        <NavButton
          label="Laporan"
          icon={<ReportIcon />}
          isActive={activePage === 'laporan'}
          onClick={() => setPage('laporan')}
        />
        <NavButton
          label="Tetapan"
          icon={<SettingsIcon />}
          isActive={activePage === 'tetapan'}
          onClick={() => setPage('tetapan')}
        />
      </div>
    </nav>
  );
};

export default Navbar;