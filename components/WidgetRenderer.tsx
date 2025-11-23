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
  Filter
} from 'lucide-react';

interface WidgetRendererProps {
  widget: WidgetConfig;
}

const COLORS = ['#6366f1', '#8b5cf6', '#ec4899', '#f43f5e', '#f59e0b', '#10b981'];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white text-gray-900 p-3 rounded-lg shadow-xl border border-gray-200 text-sm">
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
    const csvContent = [
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4">
               {data.map((item: any, idx: number) => (
                  <div key={idx} className="bg-white rounded-xl border border-gray-200 shadow-sm hover:shadow-md hover:border-indigo-300 transition-all duration-300 flex flex-col group overflow-hidden">
                     {/* Clean Card Header */}
                     <div className="p-5 flex-1 flex flex-col">
                        <div className="flex justify-between items-start mb-3">
                           {item.category && (
                              <span className="px-2.5 py-1 rounded-md text-[10px] font-semibold uppercase tracking-wider bg-gray-100 text-gray-600 border border-gray-200">
                                 {item.category}
                              </span>
                           )}
                           {item.rating && (
                              <div className="flex items-center gap-1 text-amber-500 text-xs font-bold bg-amber-50 px-2 py-1 rounded-md border border-amber-100">
                                 <Star size={12} fill="currentColor" />
                                 <span>{item.rating}</span>
                              </div>
                           )}
                        </div>
                        
                        <h4 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-indigo-600 transition-colors">{item.title}</h4>
                        <p className="text-sm text-gray-500 line-clamp-3 mb-4 flex-1 leading-relaxed">{item.description}</p>
                        
                        <div className="pt-4 border-t border-gray-100 flex items-center justify-between mt-auto">
                           <div className="flex flex-wrap gap-2">
                              {item.tags && Array.isArray(item.tags) && item.tags.slice(0,2).map((tag: string, tIdx: number) => (
                                 <span key={tIdx} className="text-[10px] text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded-full font-medium">#{tag}</span>
                              ))}
                           </div>
                           <ArrowRight size={16} className="text-gray-400 group-hover:text-indigo-500 transition-colors" />
                        </div>
                     </div>
                  </div>
               ))}
            </div>
         );

      case 'dataTable':
        if (!Array.isArray(data) || data.length === 0) return <div className="text-gray-400 p-4 italic">No data available</div>;
        const keys = Object.keys(data[0]);
        return (
          <div className="flex flex-col bg-white">
            {/* Table Controls */}
            <div className="px-4 py-3 border-b border-gray-200 flex items-center gap-2 bg-gray-50/50">
                <button 
                  onClick={() => setShowSearch(!showSearch)}
                  className={`p-1.5 rounded-md transition-colors ${showSearch ? 'bg-indigo-100 text-indigo-700' : 'hover:bg-gray-200 text-gray-500'}`}
                  title="Filter"
                >
                    <Filter size={16} />
                </button>
                <button 
                  onClick={handleExport}
                  className="p-1.5 rounded-md hover:bg-gray-200 text-gray-500 transition-colors"
                  title="Export CSV"
                >
                    <Download size={16} />
                </button>
                
                {showSearch && (
                  <div className="flex items-center gap-2 ml-2 bg-white rounded-md px-3 py-1.5 border border-gray-300 animate-fade-in w-full max-w-xs focus-within:ring-1 focus-within:ring-indigo-500">
                    <Search size={14} className="text-gray-400"/>
                    <input 
                      autoFocus
                      type="text" 
                      placeholder="Type to filter..." 
                      className="bg-transparent border-none text-sm text-gray-800 outline-none w-full placeholder-gray-400"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                    />
                  </div>
                )}
                <div className="flex-1"></div>
                <div className="text-xs text-gray-500">{processedTableData.length} items</div>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-gray-50 text-gray-500 font-medium">
                  <tr>
                    {keys.map((k) => (
                      <th 
                        key={k} 
                        onClick={() => handleSort(k)}
                        className="px-4 py-3 border-b border-gray-200 cursor-pointer hover:bg-gray-100 transition-colors whitespace-nowrap"
                      >
                        <div className="flex items-center gap-2">
                            <span className="capitalize">{k.replace(/([A-Z])/g, ' $1').trim()}</span>
                            {sortConfig?.key === k && (
                                sortConfig.direction === 'asc' ? <ArrowUp size={12} className="text-indigo-600"/> : <ArrowDown size={12} className="text-indigo-600"/>
                            )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {processedTableData.map((row: any, idx: number) => (
                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                       {keys.map((k, i) => (
                         <td key={k} className={`px-4 py-3 text-gray-700 max-w-[300px] truncate ${i === 0 ? 'font-medium text-gray-900' : ''}`}>
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
               <h4 className="font-bold text-sm uppercase mb-1">{data.title || 'Attention'}</h4>
               <p className="text-sm opacity-90">{data.message}</p>
             </div>
           </div>
        );

      default:
        return null;
    }
  };

  const getIcon = () => {
     if (type.includes('Chart')) return <BarChart2 size={16} className="text-indigo-600"/>;
     if (type === 'pieChart') return <PieIcon size={16} className="text-indigo-600"/>;
     if (type === 'dataTable') return <List size={16} className="text-indigo-600"/>;
     if (type === 'cardGrid') return <LayoutGrid size={16} className="text-indigo-600"/>;
     return <Star size={16} className="text-indigo-600"/>;
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl overflow-hidden shadow-sm my-4 w-full">
      <div className="px-5 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
        <div className="flex items-center gap-3">
           <div className="p-1.5 bg-indigo-50 rounded-lg">
             {getIcon()}
           </div>
           <div>
              <h3 className="text-sm font-bold text-gray-900">{title}</h3>
              {description && <p className="text-xs text-gray-500">{description}</p>}
           </div>
        </div>
      </div>
      <div className="bg-white">
        {renderContent()}
      </div>
    </div>
  );
};