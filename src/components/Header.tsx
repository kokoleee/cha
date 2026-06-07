import React from "react";
import { Search, Bell, Plus } from "lucide-react";
import { User } from "../types";

interface HeaderProps {
  user: User | null;
  onOpenQuickTransfer?: () => void;
  onNavigateToProfile?: () => void;
}

export default function Header({ user, onOpenQuickTransfer, onNavigateToProfile }: HeaderProps) {
  const getInitials = () => {
    if (!user) return "AM";
    const first = user.first_name?.[0] || "";
    const last = user.last_name?.[0] || "";
    return (first + last).toUpperCase();
  };

  const getGreetingName = () => {
    if (!user) return "Annie Maibach Mary";
    return `${user.first_name} ${user.last_name}`;
  };

  return (
    <div id="jpm-app-header" className="bg-[#1169ca] text-white pt-4 pb-6 px-4 flex flex-col space-y-5 rounded-b-3xl shadow-md border-b border-blue-600/30">
      {/* Top Search & Controls Row */}
      <div className="flex items-center justify-between space-x-3">
        {/* Search Input Pillow */}
        <div className="flex-1 bg-white/12 hover:bg-white/18 rounded-full py-2.5 px-4 flex items-center space-x-2.5 transition-colors border border-white/5">
          <Search size={16} className="text-blue-100 shrink-0" />
          <input
            type="text"
            placeholder="Search in the app"
            className="bg-transparent border-none text-white placeholder-blue-100 text-[13px] outline-none w-full font-light"
            readOnly
          />
        </div>

        {/* Action Circles */}
        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            type="button"
            className="w-10 h-10 select-none bg-white/12 hover:bg-white/18 border border-white/5 transition-colors rounded-full flex items-center justify-center relative cursor-pointer"
            title="Notifications"
          >
            <Bell size={18} className="text-white" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-rose-500 rounded-full"></span>
          </button>

          <button
            onClick={onNavigateToProfile}
            type="button"
            className="w-10 h-10 bg-white/12 hover:bg-white/20 border border-white/10 text-white rounded-full flex items-center justify-center text-[13px] font-bold tracking-wider cursor-pointer transition-all"
            title="Profile details"
          >
            {getInitials()}
          </button>
        </div>
      </div>

      {/* Brand & Personal Greeting Row */}
      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center space-x-3">
          {/* Mini Image Logo (User will edit the picture later) */}
          <img
            src="https://picsum.photos/seed/mini-logo-placeholder/80/80"
            alt="App Logo"
            className="w-10 h-10 rounded-full object-cover border border-white/20 shrink-0"
            referrerPolicy="no-referrer"
          />

          {/* Dynamic Personalized Name */}
          <span className="text-[17px] font-semibold text-blue-50 tracking-tight leading-none ml-1 select-none">
            Hi, {getGreetingName()}
          </span>
        </div>

        {/* Plus Quick Action Indicator */}
        <button
          onClick={onOpenQuickTransfer}
          type="button"
          className="w-8 h-8 rounded-full bg-white/12 hover:bg-white/20 active:scale-95 transition-all flex items-center justify-center cursor-pointer"
          title="New Transfer Action"
        >
          <Plus size={18} className="text-white" />
        </button>
      </div>
    </div>
  );
}
