import React from 'react';
import { 
  Home,
  MessageSquare, 
  Settings, 
  PieChart,
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  return (
    <div className="
      w-full md:w-64 
      h-16 md:h-full 
      bg-ag-bg 
      border-t md:border-t-0 md:border-r border-ag-border 
      flex md:flex-col 
      shrink-0 
      transition-all duration-300
      z-30
    ">
      {/* Brand - Desktop Only */}
      <div className="hidden md:flex h-16 items-center px-6 border-b border-ag-border shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-lg flex items-center justify-center text-white shadow-md">
           <Home size={18} />
        </div>
        <span className="ml-3 font-bold text-lg text-white tracking-tight">Nexus</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex md:flex-col justify-around md:justify-start items-center md:items-stretch md:p-3 md:space-y-1">
        
        <a href="#" className="flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-3 md:py-2.5 rounded-lg text-white md:bg-ag-card font-medium transition-colors group">
            <MessageSquare size={24} className="md:w-5 md:h-5 text-indigo-400 group-hover:text-indigo-300" />
            <span className="text-[10px] md:text-sm mt-1 md:mt-0">Chat</span>
        </a>

        <a href="#" className="flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-3 md:py-2.5 rounded-lg text-ag-muted hover:text-white md:hover:bg-ag-card transition-colors group">
            <PieChart size={24} className="md:w-5 md:h-5 group-hover:text-indigo-300" />
            <span className="text-[10px] md:text-sm mt-1 md:mt-0">Overview</span>
        </a>

        <a href="#" className="flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-3 md:py-2.5 rounded-lg text-ag-muted hover:text-white md:hover:bg-ag-card transition-colors group md:hidden">
            <Settings size={24} className="md:w-5 md:h-5 group-hover:text-indigo-300" />
            <span className="text-[10px] md:text-sm mt-1 md:mt-0">Settings</span>
        </a>
      </nav>

      {/* Footer - Desktop Only */}
      <div className="hidden md:block p-4 border-t border-ag-border shrink-0">
        <button className="flex items-center gap-3 text-ag-muted hover:text-white transition-colors w-full px-2 py-2 rounded-lg hover:bg-ag-card">
          <Settings size={20} />
          <span className="text-sm font-medium">Settings</span>
        </button>
      </div>
    </div>
  );
};