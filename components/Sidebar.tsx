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
      bg-white 
      border-t md:border-t-0 md:border-r border-ag-border 
      flex md:flex-col 
      shrink-0 
      transition-all duration-300
      z-30
    ">
      {/* Brand - Desktop Only */}
      <div className="hidden md:flex h-16 items-center px-6 border-b border-ag-border shrink-0">
        <div className="w-8 h-8 bg-gradient-to-br from-indigo-600 to-indigo-500 rounded-lg flex items-center justify-center text-white shadow-md shadow-indigo-200">
           <Home size={18} />
        </div>
        <span className="ml-3 font-bold text-lg text-ag-text tracking-tight">Nexus</span>
      </div>

      {/* Navigation Items */}
      <nav className="flex-1 flex md:flex-col justify-around md:justify-start items-center md:items-stretch md:p-3 md:space-y-1">
        
        <a href="#" className="flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-3 md:py-2.5 rounded-lg text-indigo-700 bg-indigo-50 font-medium transition-colors group">
            <MessageSquare size={24} className="md:w-5 md:h-5 text-indigo-600 group-hover:text-indigo-700" />
            <span className="text-[10px] md:text-sm mt-1 md:mt-0">对话</span>
        </a>

        <a href="#" className="flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-3 md:py-2.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors group">
            <PieChart size={24} className="md:w-5 md:h-5 group-hover:text-gray-900" />
            <span className="text-[10px] md:text-sm mt-1 md:mt-0">概览</span>
        </a>

        <a href="#" className="flex flex-col md:flex-row items-center md:gap-3 p-2 md:px-3 md:py-2.5 rounded-lg text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition-colors group md:hidden">
            <Settings size={24} className="md:w-5 md:h-5 group-hover:text-gray-900" />
            <span className="text-[10px] md:text-sm mt-1 md:mt-0">设置</span>
        </a>
      </nav>

      {/* Footer - Desktop Only */}
      <div className="hidden md:block p-4 border-t border-ag-border shrink-0">
        <button className="flex items-center gap-3 text-gray-500 hover:text-gray-900 transition-colors w-full px-2 py-2 rounded-lg hover:bg-gray-100">
          <Settings size={20} />
          <span className="text-sm font-medium">设置</span>
        </button>
      </div>
    </div>
  );
};