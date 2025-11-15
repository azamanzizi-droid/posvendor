import React from 'react';
import { Page } from '../types';
import { PosIcon, InventoryIcon, ReportIcon, SettingsIcon } from './Icons';

interface NavbarProps {
  activePage: Page;
  setPage: (page: Page) => void;
}

const NavButton: React.FC<{
  label: string;
  icon: React.ReactElement;
  isActive: boolean;
  onClick: () => void;
  badgeCount?: number;
}> = ({ label, icon, isActive, onClick, badgeCount }) => {
  const activeClasses = 'theme-text-primary';
  const inactiveClasses = 'text-slate-400 dark:text-slate-500 hover:text-white dark:hover:text-slate-300';

  return (
    <button
      onClick={onClick}
      className={`flex flex-col items-center justify-center space-y-1 transition-colors duration-200 ${isActive ? activeClasses : inactiveClasses}`}
    >
      <div className="relative">
        {icon}
        {badgeCount && badgeCount > 0 && (
          <span className="absolute -top-1 -right-2 flex h-4 min-w-[1rem] items-center justify-center rounded-full bg-red-600 px-1 text-[10px] font-bold text-white ring-2 ring-slate-800 dark:ring-slate-950">
            {badgeCount > 99 ? '99+' : badgeCount}
          </span>
        )}
      </div>
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