import { Search, RefreshCw, PlusCircle, Download } from "lucide-react";
import { Link } from "react-router-dom";

export const RefreshButton = ({ handleRefresh, refreshing }) => (
  <button
    onClick={handleRefresh}
    disabled={refreshing}
    className="px-3 py-2 rounded-md font-medium transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl text-[14px] bg-yellow-500 hover:scale-105 text-stone-700"
  >
    <RefreshCw
      size={18}
      className={`mr-2 ${refreshing ? "animate-spin" : ""}`}
    />
    {refreshing ? "Refreshing..." : "Refresh"}
  </button>
);

export const ExportCsvButton = ({ handleExport, term }) => (
  <button
    onClick={handleExport}
    disabled={term}
    className="px-3 py-2 text-[14px] rounded-md font-medium transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl disabled:opacity-50 hover:scale-105 bg-blue-700 text-stone-200"
  >
    <Download size={18} className="mr-2" />
    Export CSV
  </button>
);

export const AddButton = ({ url, text }) => (
  <Link
    to={url}
    className="px-3 py-2 text-[14px] rounded-md font-medium transition-all duration-200 inline-flex items-center shadow-lg hover:shadow-xl transform hover:scale-105 bg-green-600 text-stone-200"
  >
    <PlusCircle size={20} className="mr-2" />
    {text}
  </Link>
);

export const SearchInput = ({ value, onChange, text, ...props }) => (
  <div className="relative">
    <Search size={18} className="absolute left-3 top-3 text-gray-400" />
    <input
      type="text"
      placeholder={text}
      value={value}
      onChange={onChange}
      className="w-full pl-10 pr-4 py-2 border-none outline-none rounded-lg bg-card-sub h-[40px]"
      {...props}
    />
  </div>
);

export const SearchSelect = ({ value, onChange, list, ...props }) => (
  <select
    value={value}
    onChange={onChange}
    className="w-full px-4 text-slate-400 border-none outline-none rounded-lg bg-card-sub appearance-none h-[40px]"
    {...props}
  >
    {list.map((li) => (
      <option key={li.value} value={li.value}>
        {li.label}
      </option>
    ))}
  </select>
);
