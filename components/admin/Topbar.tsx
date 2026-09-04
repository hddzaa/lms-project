import { Search, Bell } from "lucide-react";

export default function Topbar() {
  return (
    <header className="flex items-center justify-end gap-4 border-b border-white/5 px-8 py-4">
      <div className="relative">
        <Search
          size={16}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500"
        />
        <input
          type="text"
          placeholder="Cari assessment..."
          className="w-64 rounded-full bg-white/5 py-2 pl-9 pr-4 text-sm text-gray-300 placeholder-gray-500 outline-none focus:ring-1 focus:ring-cyan-400/50"
        />
      </div>
      <button className="text-gray-400 hover:text-gray-200">
        <Bell size={20} />
      </button>
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-indigo-400 to-purple-500" />
    </header>
  );
}