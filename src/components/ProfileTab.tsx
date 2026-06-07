import React from "react";
import { User as UserIcon, Mail, ShieldAlert, Key, Globe, MapPin, User, Briefcase, Calendar, Fingerprint, Lock, ShieldCheck, LogOut, Building, Tag } from "lucide-react";
import { User as UserType } from "../types";

interface ProfileTabProps {
  user: UserType | null;
  onLogout: () => void;
}

export default function ProfileTab({ user, onLogout }: ProfileTabProps) {
  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center py-20 text-slate-500 font-medium">
        <UserIcon className="text-slate-300 animate-pulse mb-3" size={32} />
        <span className="text-xs">Accessing capital portfolio records...</span>
      </div>
    );
  }

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getFullStreetAddress = () => {
    let parts = [];
    if (user.full_address) parts.push(user.full_address);
    if (user.city) parts.push(user.city);
    if (user.state) parts.push(user.state);
    if (user.country) parts.push(user.country);
    return parts.length > 0 ? parts.join(", ") : "2205 Terrell Pl, Charlotte, North Carolina, USA";
  };

  const getFullName = () => {
    if (user.surname) {
      return `${user.surname} ${user.middle_name || ""} ${user.last_name || ""}`.trim();
    }
    return `${user.first_name} ${user.last_name}`;
  };

  return (
    <div id="profile-tab-viewport" className="flex-1 flex flex-col space-y-6 px-4 pb-12">
      {/* 1. Header Profile Banner Card */}
      <div className="bg-slate-900 text-white rounded-3xl p-6 relative overflow-hidden border border-slate-800 shadow-[0_12px_36px_rgba(10,35,66,0.14)]">
        {/* Absolute Background Pattern */}
        <div className="absolute right-[-40px] top-[-40px] w-48 h-48 bg-gradient-to-tr from-blue-600/20 to-indigo-500/10 rounded-full blur-3xl pointer-events-none"></div>
        <div className="absolute left-[-20px] bottom-[-20px] w-36 h-36 bg-slate-800/40 rounded-full blur-2xl pointer-events-none"></div>

        <div className="relative flex flex-col items-center text-center space-y-3 z-10">
          <div className="flex flex-col">
            <span className="text-lg font-black tracking-tight">{getFullName()}</span>
            <span className="text-[#a0aec0] text-xs font-bold tracking-wider uppercase mt-1">@ {user.username || "johncamo"}</span>
          </div>

          <div className="inline-flex items-center space-x-1.5 bg-[#1169ca]/30 border border-blue-500/20 py-1.5 px-3.5 rounded-full text-[10px] font-extrabold tracking-widest uppercase text-blue-200">
            <ShieldCheck size={12} className="text-blue-400" />
            <span>Wealth Management Tier • Private Client</span>
          </div>
        </div>
      </div>

      {/* 2. Key Metrics Block */}
      <div className="grid grid-cols-2 gap-3">
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.015)]">
          <span className="text-[#718096] text-[10px] font-black uppercase tracking-wider block">Available Balance</span>
          <span className="text-xl font-extrabold text-[#0a2342] mt-1.5 block">
            {formatMoney(user.balance || 1730000)}
          </span>
        </div>
        <div className="bg-white border border-slate-100 rounded-2xl p-4 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col justify-between">
          <div>
            <span className="text-[#718096] text-[10px] font-black uppercase tracking-wider block">Billing Message</span>
            <span className="text-xs font-bold text-slate-700 mt-1 block italic leading-tight">
              {user.billing_message || "Active and certified"}
            </span>
          </div>
        </div>
      </div>

      {/* 3. Details Sections Grid */}
      <div className="space-y-4">
        {/* Section: Accounts Registration Info (DEDICATED REQUIREMENT) */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#0a2342] border-b border-slate-50 pb-2.5 flex items-center space-x-1.5">
            <Building size={13} className="text-[#1169ca]" />
            <span>Banking Registry Info</span>
          </h3>

          <div className="space-y-3.5 text-xs">
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400 font-semibold">Fix Deposit Account No.</span>
              <span className="text-slate-800 font-mono font-bold">{user.account_number}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400 font-semibold">Checking Account No.</span>
              <span className="text-slate-800 font-mono font-bold">{user.second_account_number || "9513637590"}</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400 font-semibold">Account Type</span>
              <span className="text-[#1169ca] font-extrabold uppercase tracking-wide text-[11px]">Private Trust Portfolio</span>
            </div>
            <div className="flex justify-between border-b border-slate-50 pb-2">
              <span className="text-slate-400 font-semibold">Branch Information</span>
              <span className="text-slate-800 font-bold text-right max-w-[190px] truncate">Charlotte NC Downtown Private Branch</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-400 font-semibold">Date Joined</span>
              <span className="text-slate-800 font-bold">January 14, 2018</span>
            </div>
          </div>
        </div>

        {/* Section: Personal Registry */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#0a2342] border-b border-slate-50 pb-2.5 flex items-center space-x-1.5">
            <User size={13} className="text-[#1169ca]" />
            <span>Profile Registry Details</span>
          </h3>

          <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-xs">
            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">Surname</span>
              <span className="text-slate-800 font-extrabold">{user.surname || "John"}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">Middle Name</span>
              <span className="text-slate-800 font-extrabold">{user.middle_name || "camo"}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">Last Name</span>
              <span className="text-slate-800 font-extrabold">{user.last_name || "smith"}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold mb-0.5">Gender</span>
              <span className="text-slate-800 font-extrabold">{user.gender || "Male"}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold mb-0.5 flex items-center space-x-1">
                <Calendar size={11} />
                <span>Date of Birth</span>
              </span>
              <span className="text-slate-800 font-extrabold">{user.date_of_birth || "January 14, 1971"}</span>
            </div>
            <div>
              <span className="text-slate-400 block font-semibold mb-0.5 flex items-center space-x-1">
                <Briefcase size={11} />
                <span>Occupation</span>
              </span>
              <span className="text-slate-800 font-extrabold">{user.occupation || "contractor"}</span>
            </div>
          </div>
        </div>

        {/* Section: Contact & Geography */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#0a2342] border-b border-slate-50 pb-2.5 flex items-center space-x-1.5">
            <Globe size={13} className="text-[#1169ca]" />
            <span>Contact & Geography</span>
          </h3>

          <div className="space-y-4 text-xs">
            <div className="grid grid-cols-2 gap-2">
              <div>
                <span className="text-slate-400 block font-semibold mb-0.5 flex items-center space-x-1">
                  <Mail size={11} />
                  <span>Email Address</span>
                </span>
                <span className="text-slate-800 font-mono font-bold truncate block">{user.email}</span>
              </div>
              <div>
                <span className="text-slate-400 block font-semibold mb-0.5">Phone Number</span>
                <span className="text-slate-800 font-mono font-bold">{user.phone || "+1 (704) 583-9102"}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 block font-semibold mb-0.5 flex items-center space-x-1">
                <MapPin size={11} />
                <span>Full Street Address</span>
              </span>
              <span className="text-slate-800 font-bold bg-slate-50 border border-slate-100 rounded-xl px-3 py-2 mt-1 block">
                {getFullStreetAddress()}
              </span>
            </div>
          </div>
        </div>

        {/* Section: Access Security Credentials */}
        <div className="bg-white border border-slate-100 rounded-3xl p-5 shadow-[0_4px_20px_rgba(0,0,0,0.015)] space-y-4">
          <h3 className="text-xs font-black uppercase tracking-widest text-[#0a2342] border-b border-slate-50 pb-2.5 flex items-center space-x-1.5">
            <Lock size={13} className="text-[#1169ca]" />
            <span>Vault Credentials</span>
          </h3>

          <div className="grid grid-cols-2 gap-3 text-xs">
            <div className="bg-slate-50/70 border border-slate-100/80 p-3 rounded-2xl flex items-center space-x-3">
              <Fingerprint className="text-emerald-500 shrink-0" size={18} />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Transaction PIN</span>
                <span className="text-slate-800 font-mono font-black text-sm tracking-widest mt-0.5 block">{user.pin || "2090"}</span>
              </div>
            </div>

            <div className="bg-slate-50/70 border border-slate-100/80 p-3 rounded-2xl flex items-center space-x-3">
              <Key className="text-amber-500 shrink-0" size={18} />
              <div>
                <span className="text-[10px] text-slate-400 block font-bold uppercase tracking-wider">Passphrase</span>
                <span className="text-slate-800 font-mono font-extrabold text-xs select-all mt-1 block">{user.password || "cupcake123456"}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Logout Button (EXPLICIT DIRECTIVE REQUIREMENT) */}
        <div className="pt-2">
          <button
            onClick={onLogout}
            type="button"
            className="w-full bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs tracking-widest uppercase py-3.5 rounded-2xl transition-all shadow-md shadow-red-100 flex items-center justify-center space-x-2 cursor-pointer"
          >
            <LogOut size={14} className="shrink-0" />
            <span>Secure Logout Profile</span>
          </button>
        </div>
      </div>
    </div>
  );
}
