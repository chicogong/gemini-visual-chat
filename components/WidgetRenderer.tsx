import React, { useState, useMemo } from 'react';
import { WidgetConfig } from '../types';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  AreaChart,
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { 
  AlertCircle, 
  BarChart2, 
  PieChart as PieIcon, 
  List,
  LayoutGrid,
  Download, 
  Search,
  Star,
  ArrowRight,
  ArrowUp,
  ArrowDown,
  Filter,
  ChefHat,
  Clock,
  Tag
} from 'lucide-react';

interface WidgetRendererProps {
  widget: WidgetConfig;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white text-gray-900 p-3 rounded-lg shadow-xl border border-gray-200 text-sm z-50">
        <p className="text-gray-500 text-xs mb-1">{label}</p>
        <p className="text-lg font-bold text-indigo-600">
          {payload[0].value}
        </p>
      </div>
    );
  }
  return null;
};

export const WidgetRenderer: React.FC<WidgetRendererProps> = ({ widget }) => {
  const { type, data, title, description } = widget;
  
  // State for Table interactions
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' } | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [showSearch, setShowSearch] = useState(false);

  // Sorting Handler
  const handleSort = (key: string) => {
    let direction: 'asc' | 'desc' = 'asc';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'asc') {
      direction = 'desc';
    }
    setSortConfig({ key, direction });
  };

  // CSV Export Handler
  const handleExport = () => {
    if (!Array.isArray(data) || data.length === 0) return;
    const headers = Object.keys(data[0]);
    // Add BOM for Excel Chinese characters support
    const bom = '\uFEFF'; 
    const csvContent = bom + [
        headers.join(','),
        ...data.map((row: any) => headers.map(fieldName => JSON.stringify(row[fieldName])).join(','))
    ].join('\n');
    
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Memoized Data Processing for Table
  const processedTableData = useMemo(() => {
    if (!Array.isArray(data)) return [];
    let processed = [...data];

    if (searchTerm) {
      const lowerTerm = searchTerm.toLowerCase();
      processed = processed.filter(row => 
        Object.values(row).some(val => String(val).toLowerCase().includes(lowerTerm))
      );
    }

    if (sortConfig) {
      processed.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) return sortConfig.direction === 'asc' ? -1 : 1;
        if (a[sortConfig.key] > b[sortConfig.key]) return sortConfig.direction === 'asc' ? 1 : -1;
        return 0;
      });
    }

    return processed;
  }, [data, sortConfig, searchTerm]);


  const renderContent = () => {
    switch (type) {
      case 'barChart':
        return (
          <div className="h-64 w-full p-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={data as any[]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} cursor={{fill: '#f3f4f6'}} />
                <Bar dataKey="value" fill="#6366f1" radius={[6, 6, 0, 0]} barSize={40} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        );

      case 'lineChart':
        return (
          <div className="h-64 w-full p-2">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data as any[]} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis dataKey="name" stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} dy={10} />
                <YAxis stroke="#9ca3af" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip content={<CustomTooltip />} />
                <Area 
                  type="monotone" 
                  dataKey="value" 
                  stroke="#6366f1" 
                  strokeWidth={3} 
                  fillOpacity={1} 
                  fill="url(#colorValue)" 
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        );

      case 'pieChart':
        return (
          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data as any[]}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  cornerRadius={6}
                >
                  {(data as any[]).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} stroke="transparent" />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
                <Legend 
                   verticalAlign="middle" 
                   align="right"
                   wrapperStyle={{ fontSize: '12px', color: '#6b7280' }} 
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        );

      case 'metricCard':
        return (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 p-4">
            {Array.isArray(data) ? data.map((item: any, idx: number) => (
              <div key={idx} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-200 transition-all">
                 <div className="text-gray-500 text-sm font-medium mb-2">{item.label}</div>
                 <div className="text-3xl text-gray-900 font-bold tracking-tight">{item.value}</div>
                 {item.trend && (
                   <div className={`text-sm mt-2 font-medium ${item.trend.includes('+') ? 'text-green-600' : 'text-red-500'}`}>
                      {item.trend}
                   </div>
                 )}
              </div>
            )) : (
              <div className="col-span-full bg-white rounded-xl p-6 border border-gray-200 shadow-sm text-center">
                 <div className="text-gray-500 text-sm font-medium mb-2">{data.label || 'Metric'}</div>
                 <div className="text-5xl text-indigo-600 font-bold tracking-tight">{data.value}</div>
                 {data.trend && <div className="text-sm text-gray-500 mt-2">{data.trend}</div>}
              </div>
            )}
          </div>
        );

      case 'cardGrid':
         if (!Array.isArray(data)) return null;
         return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 p-5 bg-gray-50/30">
               {data.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-2xl border border-gray-100 shadow-[0_2px_8px_-2px_rgba(0,0,0,0.05)] hover:shadow-[0_8px_16px_-4px_rgba(79,70,229,0.15)] hover:border-indigo-200 hover:-translate-y-1 transition-all duration-300 flex flex-col group overflow-hidden">
                     {/* Decorative Header Bar */}
                     <div className="h-1.5 w-full bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-80" />
                     
                     <div className="p-5 flex-1 flex flex-col relative">
                        {/* Top Metadata Row */}
                        <div className="flex justify-between items-start mb-3">
                           {item.category && (
                              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-indigo-50 text-indigo-700 border border-indigo-100">
                                 {item.category}
                              </span>
                           )}
                           {item.rating && (
                              <div className="flex items-center gap-1 text-amber-600 text-xs font-bold bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">
                                 {/* Dynamic Icon based on content context if possible, default to Star */}
                                 {item.rating.includes('难') ? <ChefHat size={12} /> : <Star size={12} fill="currentColor" />}
                                 <span>{item.rating}</span>
                              </div>
                           )}
                        </div>
                        
                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors leading-tight">
                            {item.title}
                        </h4>
                        
                        <p className="text-sm text-gray-600 line-clamp-3 mb-4 flex-1 leading-relaxed bg-gray-50 p-2.5 rounded-lg border border-gray-100/50">
                            {item.description}
                        </p>
                        
                        {/* Tags / Ingredients / Footer */}
                        <div className="pt-2 flex items-center justify-between mt-auto">
                           <div className="flex flex-wrap gap-1.5">
                              {item.tags && Array.isArray(item.tags) && item.tags.slice(0, 3).map((tag: string, tIdx: number) => (
                                 <span key={tIdx} className="flex items-center gap-0.5 text-[10px] text-gray-600 bg-white border border-gray-200 px-2 py-0.5 rounded-full font-medium shadow-sm">
                                    <Tag size={8} className="opacity-50"/> {tag}
                                 </span>
                              ))}
                              {item.tags && item.tags.length > 3 && (
                                  <span className="text-[10px] text-gray-400 pl-1">+{item.tags.length - 3}</span>
                              )}
                           </div>
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         );

      case 'dataTable':
        if (!Array.isArray(data) || data.length === 0) return <div className="text-gray-400 p-4 italic">暂无数据</div>;
        const keys = Object.keys(data[0]);
        return (
          <div className="flex flex-col bg-white">
            {/* Table Controls */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2 bg-gray-50/50">
                <button 
                  onClick={() => setShowSearch(!showSearch)}
                  className={`p-1.5 rounded-md transition-colors ${showSearch ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200 text-gray-500'}`}
                  title="筛选"
                >
                    <Filter size={16} />
                </button>
                <button 
                  onClick={handleExport}
                  className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
                  title="导出 CSV"
                >
                    <Download size={16} />
                </button>
                
                {showSearch && (
                  <div className="flex items-center gap-2 ml-2 bg-white rounded-md px-3 py-1.5 border border-gray-300 animate-fade-in w-full max-w-xs focus-within:ring-1 focus-within:ring-indigo-500">
                    <Search size={14} className="text-gray-400"/>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="输入关键词筛选..." 
                      className="bg-transparent border-none text-sm text-gray-800 outline-none w-full placeholder-gray-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                )}
                <div className="flex-1"></div>
                <div className="text-xs text-gray-500 font-mono bg-gray-100 px-2 py-0.5 rounded text-center min-w-[3rem]">
                    {processedTableData.length}
                </div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50/80 text-gray-500 font-medium">
                  <tr>
                    {keys.map((k) => (
                      <th 
                        key={k} 
                        onClick={() => handleSort(k)}
                        className="px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap group"
                      >
                        <div className="flex items-center gap-1.5">
                            <span className="capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                            <div className="flex flex-col opacity-0 group-hover:opacity-50 transition-opacity">
                                <ArrowUp size={8} className={sortConfig?.key === k && sortConfig.direction === 'asc' ? 'text-indigo-600 opacity-100' : ''} />
                                <ArrowDown size={8} className={sortConfig?.key === k && sortConfig.direction === 'desc' ? 'text-indigo-600 opacity-100' : ''} />
                            </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {processedTableData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-indigo-50/30 transition-colors">
                       {keys.map((k, i) => (
                         <td key={k} className={`px-4 py-3.5 text-gray-700 max-w-[300px] truncate ${i === 0 ? 'font-medium text-gray-900' : ''}`}>
                           {row[k]}
                         </td>
                       ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        );

      case 'alert':
        return (
           <div className="p-4 bg-red-50 text-red-700 border-l-4 border-red-500 flex items-start gap-3 m-4 rounded-r-lg shadow-sm">
             <AlertCircle className="w-5 h-5 shrink-0" />
             <div>
               <h4 className="font-bold text-sm uppercase mb-1">{data.title || '注意'}</h4>
               <p className="text-sm opacity-90">{data.message}</p>
             </div>
           </div>
        );

      default:
        return null;
    }
  };

  const getIcon = () => {
     if (title.includes('食谱') || title.includes('菜') || title.includes('Cook')) return <ChefHat size={18} className="text-indigo-600"/>;
     if (type.includes('Chart')) return <BarChart2 size={18} className="text-indigo-600"/>;
     if (type === 'pieChart') return <PieIcon size={18} className="text-indigo-600"/>;
     if (type === 'dataTable') return <List size={18} className="text-indigo-600"/>;
     if (type === 'cardGrid') return <LayoutGrid size={18} className="text-indigo-600"/>;
     return <Star size={18} className="text-indigo-600"/>;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-sm my-4 w-full group hover:border-indigo-200 hover:shadow-md transition-all duration-300">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
           <div className="p-2 bg-white border border-gray-100 rounded-xl shadow-sm group-hover:scale-110 transition-transform text-indigo-600">
             {getIcon()}
           </div>
           <div>
              <h3 className="text-sm font-bold text-gray-900">{title}</h3>
              {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
           </div>
        </div>
      </div>
      <div className="bg-white">
        {renderContent()}
      </div>
    </div>
  );
};