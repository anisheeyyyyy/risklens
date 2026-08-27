import React, { useState, useMemo } from 'react';
import {
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Search,
  Filter,
  Layers,
  Inbox,
} from 'lucide-react';

export interface Column<T> {
  key: string;
  header: string;
  render?: (row: T) => React.ReactNode;
  sortable?: boolean;
  className?: string;
}

interface DataTableProps<T> {
  data: T[];
  columns: Column<T>[];
  searchPlaceholder?: string;
  filterOptions?: {
    key: keyof T;
    label: string;
    options: { label: string; value: string }[];
  };
  isLoading?: boolean;
  pageSize?: number;
}

export function DataTable<T extends Record<string, any>>({
  data = [],
  columns,
  searchPlaceholder = 'Filter records...',
  filterOptions,
  isLoading = false,
  pageSize = 10,
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilter, setSelectedFilter] = useState('ALL');
  const [sortKey, setSortKey] = useState<string | null>(null);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');
  const [currentPage, setCurrentPage] = useState(1);

  // Search & Filter
  const filteredData = useMemo(() => {
    return data.filter((row) => {
      // Filter dropdown check
      if (filterOptions && selectedFilter !== 'ALL') {
        const val = String(row[filterOptions.key] || '');
        if (val !== selectedFilter) return false;
      }

      // Search term check
      if (!searchTerm) return true;
      const term = searchTerm.toLowerCase();
      return Object.values(row).some((val) => {
        if (typeof val === 'string' || typeof val === 'number') {
          return String(val).toLowerCase().includes(term);
        }
        if (Array.isArray(val)) {
          return val.some((v) => String(v).toLowerCase().includes(term));
        }
        return false;
      });
    });
  }, [data, searchTerm, selectedFilter, filterOptions]);

  // Sorting
  const sortedData = useMemo(() => {
    if (!sortKey) return filteredData;
    return [...filteredData].sort((a, b) => {
      const valA = a[sortKey];
      const valB = b[sortKey];

      if (valA === valB) return 0;
      if (valA == null) return 1;
      if (valB == null) return -1;

      const comp = String(valA).localeCompare(String(valB), undefined, { numeric: true });
      return sortOrder === 'asc' ? comp : -comp;
    });
  }, [filteredData, sortKey, sortOrder]);

  // Pagination
  const totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  const paginatedData = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedData.slice(start, start + pageSize);
  }, [sortedData, currentPage, pageSize]);

  const handleSort = (key: string) => {
    if (sortKey === key) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortKey(key);
      setSortOrder('asc');
    }
  };

  return (
    <div className="rounded-2xl bg-[#111827]/90 backdrop-blur-md border border-slate-800/90 shadow-card overflow-hidden">
      {/* Table Header Controls */}
      <div className="p-4 border-b border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 bg-slate-950/40">
        <div className="relative w-full sm:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value);
              setCurrentPage(1);
            }}
            placeholder={searchPlaceholder}
            className="w-full bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder-slate-500 rounded-lg pl-9 pr-4 py-2 focus:outline-none focus:border-cyan-500 font-mono"
          />
        </div>

        {filterOptions && (
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={selectedFilter}
              onChange={(e) => {
                setSelectedFilter(e.target.value);
                setCurrentPage(1);
              }}
              className="bg-slate-900 border border-slate-800 text-xs text-slate-300 rounded-lg px-3 py-2 focus:outline-none focus:border-cyan-500 font-mono"
            >
              <option value="ALL">All {filterOptions.label}</option>
              {filterOptions.options.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Table Body */}
      <div className="overflow-x-auto min-h-[300px]">
        <table className="w-full text-left text-xs">
          <thead className="bg-slate-950/80 text-slate-400 uppercase font-mono tracking-wider border-b border-slate-800 sticky top-0 z-10 text-[11px]">
            <tr>
              {columns.map((col) => (
                <th
                  key={col.key}
                  className={`px-4 py-3.5 font-semibold ${col.className || ''} ${
                    col.sortable ? 'cursor-pointer select-none hover:text-cyan-400' : ''
                  }`}
                  onClick={() => col.sortable && handleSort(col.key)}
                >
                  <div className="flex items-center gap-1.5">
                    <span>{col.header}</span>
                    {col.sortable && <ArrowUpDown className="w-3 h-3 text-slate-500" />}
                  </div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/80 font-mono">
            {isLoading ? (
              // Skeleton rows
              Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="animate-pulse">
                  {columns.map((col) => (
                    <td key={col.key} className="px-4 py-4">
                      <div className="h-3.5 bg-slate-800 rounded w-3/4"></div>
                    </td>
                  ))}
                </tr>
              ))
            ) : paginatedData.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-16 text-center text-slate-500">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <Inbox className="w-8 h-8 text-slate-600" />
                    <span className="text-sm font-semibold text-slate-400">No records found</span>
                    <span className="text-xs text-slate-500 font-sans">
                      Try adjusting your search query or filter parameters.
                    </span>
                  </div>
                </td>
              </tr>
            ) : (
              paginatedData.map((row, idx) => (
                <tr
                  key={row.id || idx}
                  className="hover:bg-slate-800/40 transition-colors group text-slate-200"
                >
                  {columns.map((col) => (
                    <td key={col.key} className={`px-4 py-3.5 text-xs ${col.className || ''}`}>
                      {col.render ? col.render(row) : String(row[col.key] ?? '—')}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {/* Pagination Footer */}
      <div className="p-4 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400 bg-slate-950/40 font-mono">
        <div>
          Showing{' '}
          <span className="text-white font-bold">
            {sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1}
          </span>{' '}
          to{' '}
          <span className="text-white font-bold">
            {Math.min(currentPage * pageSize, sortedData.length)}
          </span>{' '}
          of <span className="text-white font-bold">{sortedData.length}</span> records
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="px-2.5 py-1 text-xs">
            Page {currentPage} of {totalPages}
          </span>
          <button
            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-1.5 rounded-lg bg-slate-900 border border-slate-800 hover:bg-slate-800 disabled:opacity-40 disabled:cursor-not-allowed text-slate-300"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}
