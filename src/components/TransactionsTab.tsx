import React, { useState, useEffect } from "react";
import { Copy, Check, Filter, Calendar, Receipt, Landmark, User, FileText, ArrowDownLeft, ArrowUpRight, ArrowLeftRight, Clock, AlertCircle } from "lucide-react";
import { User as UserType, Transfer } from "../types";

interface TransactionsTabProps {
  user: UserType | null;
  selectedAccountType: "all" | "savings" | "checking";
  onAccountTypeChange: (type: "all" | "savings" | "checking") => void;
}

export default function TransactionsTab({
  user,
  selectedAccountType,
  onAccountTypeChange,
}: TransactionsTabProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Advanced filters state as requested: Date, Status, and Type
  const [dateFilter, setDateFilter] = useState<"all" | "today" | "week" | "month">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "PENDING" | "COMPLETED" | "FAILED" | "REJECTED">("all");
  const [typeFilter, setTypeFilter] = useState<"all" | "credit" | "debit">("all");

  // Selected receipt trigger
  const [selectedReceipt, setSelectedReceipt] = useState<Transfer | null>(null);

  const token = localStorage.getItem("session_token") || "";

  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/transactions/user/${user.id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        // Sort newest first
        setTransfers(
          data.data.sort(
            (a: Transfer, b: Transfer) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
          )
        );
      }
    } catch (err) {
      console.error("Error loading transactions:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransactions();
    const interval = setInterval(fetchTransactions, 8000);
    return () => clearInterval(interval);
  }, [user]);

  const copyToClipboard = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const getActiveBalance = () => {
    if (!user) return 1730000.0;
    if (selectedAccountType === "savings") return user.savings_balance ?? 865000.0;
    if (selectedAccountType === "checking") return user.checking_balance ?? 865000.0;
    return user.balance; // All
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const formatDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      const options: Intl.DateTimeFormatOptions = {
        month: "short",
        day: "numeric",
        year: "numeric",
      };
      const datePart = d.toLocaleDateString("en-US", options);
      const timePart = d.toLocaleTimeString("en-US", {
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      });
      return `${datePart} at ${timePart}`;
    } catch (e) {
      return isoStr;
    }
  };

  const getAccountEndingValue = () => {
    if (selectedAccountType === "checking") return "TOTAL CHECKING ending in **7590";
    if (selectedAccountType === "savings") return "FIX DEPOSIT ending in **9346";
    return "All Combined Portfolios";
  };

  const getDetailsNumbers = () => {
    const defaultRouting = "021000021"; // Standard JP Morgan Chase Routing
    if (selectedAccountType === "checking") {
      const checkingAcctNo = user?.second_account_number || "9513637590";
      return {
        acct: checkingAcctNo,
        route: defaultRouting,
        ach: checkingAcctNo,
      };
    }
    const savingsAcctNo = user?.account_number || "9513639346";
    return {
      acct: savingsAcctNo,
      route: defaultRouting,
      ach: savingsAcctNo,
    };
  };

  // Filter transfers dynamically using multi-filters: Date, Status, and Transaction Type
  const filteredTransfers = transfers.filter((t) => {
    // 1. Account selection filter
    if (selectedAccountType === "savings" && t.from_account !== "savings") return false;
    if (selectedAccountType === "checking" && t.from_account !== "checking") return false;

    // Credit vs Debit determination
    const isCredit =
      t.recipient_name.includes("Deposit") ||
      t.recipient_name.includes("Disbursement") ||
      t.recipient_name.includes("Credit");

    // 2. Transaction Type Filter
    if (typeFilter === "credit" && !isCredit) return false;
    if (typeFilter === "debit" && isCredit) return false;

    // 3. Status Filter
    if (statusFilter !== "all") {
      if (statusFilter === "PENDING" && t.status !== "PENDING") return false;
      if (statusFilter === "FAILED" && t.status !== "FAILED" && t.status !== "REJECTED") return false;
      if (statusFilter === "COMPLETED" && t.status !== "COMPLETED") return false;
    }

    // 4. Date Filter
    if (dateFilter !== "all") {
      const txDate = new Date(t.created_at);
      const now = new Date();
      const diffTime = Math.abs(now.getTime() - txDate.getTime());
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (dateFilter === "today") {
        const isToday =
          txDate.getDate() === now.getDate() &&
          txDate.getMonth() === now.getMonth() &&
          txDate.getFullYear() === now.getFullYear();
        if (!isToday) return false;
      } else if (dateFilter === "week" && diffDays > 7) {
        return false;
      } else if (dateFilter === "month" && diffDays > 30) {
        return false;
      }
    }

    return true;
  });

  const specs = getDetailsNumbers();

  return (
    <div id="transactions-tab-root" className="flex-1 flex flex-col space-y-6">
      {/* 1. HORIZONTAL ACCOUNT CAROUSEL SELECTOR - EXACT REPLICA OF SCREENSHOT 2 */}
      <div id="account-selection-carousel" className="px-4 py-2 bg-[#1169ca] -mt-2 pb-6 rounded-b-3xl">
        <div className="flex items-center overflow-x-auto space-x-3.5 scrollbar-none pb-1 touch-pan-x">
          {/* Card 1: All accounts overview */}
          <div
            onClick={() => onAccountTypeChange("all")}
            className={`min-w-[172px] w-[172px] h-[98px] rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer ${
              selectedAccountType === "all"
                ? "bg-white text-slate-900 shadow-md ring-2 ring-white/40"
                : "bg-white/12 text-white border border-white/8 hover:bg-white/18"
            }`}
          >
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedAccountType === "all" ? "text-slate-500" : "text-blue-100"}`}>
                All Accounts
              </p>
              <span className={`text-[9px] ${selectedAccountType === "all" ? "text-slate-400" : "text-blue-200"}`}>Overview</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-extrabold tracking-tight leading-tight">
                {formatMoney(user?.balance || 1730000.0)}
              </span>
              <span className="text-[9px] flex items-center mt-0.5 font-medium text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1"></span>
                Active
              </span>
            </div>
          </div>

          {/* Card 2: Chase Savings */}
          <div
            onClick={() => onAccountTypeChange("savings")}
            className={`min-w-[172px] w-[172px] h-[98px] rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer ${
              selectedAccountType === "savings"
                ? "bg-white text-slate-900 shadow-md ring-2 ring-white select-none"
                : "bg-white/12 text-white border border-white/8 hover:bg-white/18"
            }`}
          >
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedAccountType === "savings" ? "text-slate-500" : "text-blue-100"}`}>
                FIX DEPOSIT
              </p>
              <span className={`text-[9px] ${selectedAccountType === "savings" ? "text-slate-400" : "text-blue-200"}`}>**9346</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-extrabold tracking-tight leading-tight">
                {formatMoney(user?.savings_balance ?? 865000.0)}
              </span>
              <span className="text-[9px] flex items-center mt-0.5 font-medium text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1"></span>
                Active
              </span>
            </div>
          </div>

          {/* Card 3: Total Checking */}
          <div
            onClick={() => onAccountTypeChange("checking")}
            className={`min-w-[172px] w-[172px] h-[98px] rounded-2xl p-4 flex flex-col justify-between transition-all cursor-pointer ${
              selectedAccountType === "checking"
                ? "bg-white text-slate-900 shadow-md ring-2 ring-white select-none"
                : "bg-white/12 text-white border border-white/8 hover:bg-white/18"
            }`}
          >
            <div>
              <p className={`text-[10px] font-bold uppercase tracking-wider ${selectedAccountType === "checking" ? "text-slate-500" : "text-blue-100"}`}>
                TOTAL CHECKING
              </p>
              <span className={`text-[9px] ${selectedAccountType === "checking" ? "text-slate-400" : "text-blue-200"}`}>**7590</span>
            </div>
            <div className="flex flex-col">
              <span className="text-[15px] font-extrabold tracking-tight leading-tight">
                {formatMoney(user?.checking_balance ?? 865000.0)}
              </span>
              <span className="text-[9px] flex items-center mt-0.5 font-medium text-emerald-500">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 inline-block mr-1"></span>
                Active
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* 2. SPECIFIC ACCOUNT DETAIL METRICS & COPIABLE DETAILS CARD - REPLICATING SCREENSHOT 2 */}
      <div className="px-4">
        {/* Current Balance text blocks */}
        <div className="flex justify-between items-start mb-1.5">
          <div className="flex flex-col">
            <span className="text-[10.5px] font-black uppercase tracking-widest text-[#718096]">
              CURRENT BALANCE
            </span>
            <div className="flex items-baseline space-x-1.5 mt-0.5">
              <span className="text-[32px] font-display font-extrabold text-[#0a2342] leading-none">
                {formatMoney(getActiveBalance())}
              </span>
              <span className="text-[10.5px] font-extrabold bg-blue-50 text-[#1169ca] px-2 py-0.5 rounded-md tracking-wider">
                USD
              </span>
            </div>
            <p className="text-[#a0aec0] text-[11px] font-medium mt-1">
              {getAccountEndingValue()}
            </p>
          </div>
        </div>

        {/* Detailed specs table (Account No, Routing, ACH) */}
        <div id="copiable-credentials-card" className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] mt-3">
          <div className="space-y-4">
            {/* Row 1: Account Number */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#718096] capitalize font-medium">Account Number</span>
              <button
                onClick={() => copyToClipboard(specs.acct, "acct")}
                className="flex items-center space-x-1 text-[#1169ca] hover:text-blue-800 transition-colors font-bold cursor-pointer"
              >
                <span className="font-mono">{specs.acct}</span>
                {copiedField === "acct" ? (
                  <Check size={12} className="text-emerald-500 ml-1.5 shrink-0" />
                ) : (
                  <Copy size={11} className="opacity-60 ml-1.5 shrink-0" />
                )}
              </button>
            </div>

            <hr className="border-slate-100" />

            {/* Row 2: Routing Number */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#718096] capitalize font-medium">Routing Number</span>
              <button
                onClick={() => copyToClipboard(specs.route, "route")}
                className="flex items-center space-x-1 text-[#1169ca] hover:text-blue-800 transition-colors font-bold cursor-pointer"
              >
                <span className="font-mono">{specs.route}</span>
                {copiedField === "route" ? (
                  <Check size={12} className="text-emerald-500 ml-1.5 shrink-0" />
                ) : (
                  <Copy size={11} className="opacity-60 ml-1.5 shrink-0" />
                )}
              </button>
            </div>

            <hr className="border-slate-100" />

            {/* Row 3: ACH Number */}
            <div className="flex items-center justify-between text-xs font-semibold">
              <span className="text-[#718096] capitalize font-medium">ACH Number</span>
              <button
                onClick={() => copyToClipboard(specs.ach, "ach")}
                className="flex items-center space-x-1 text-[#1169ca] hover:text-blue-800 transition-colors font-bold cursor-pointer"
              >
                <span className="font-mono">{specs.ach}</span>
                {copiedField === "ach" ? (
                  <Check size={12} className="text-emerald-500 ml-1.5 shrink-0" />
                ) : (
                  <Copy size={11} className="opacity-60 ml-1.5 shrink-0" />
                )}
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* 3. TRANSACTION HISTORY SECTION - REPLICATING SCREENSHOT 2 WITH MULTI-FILTERS */}
      <div className="px-4 pb-12">
        <div className="flex flex-col space-y-3 mb-4">
          <h2 className="text-[17px] font-extrabold text-[#0a2342] tracking-tight">
            Transaction History
          </h2>

          {/* Filtering Bars as requested: Date, Status, type */}
          <div className="grid grid-cols-3 gap-2 bg-slate-50 border border-slate-100 p-2.5 rounded-2xl w-full">
            {/* Status Select */}
            <div className="flex flex-col space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Status</span>
              <select
                value={statusFilter}
                onChange={(e: any) => setStatusFilter(e.target.value)}
                className="bg-white border border-slate-200 outline-none rounded-lg p-1 text-[11px] font-bold text-slate-700 cursor-pointer"
              >
                <option value="all">All</option>
                <option value="COMPLETED">Completed</option>
                <option value="PENDING">Pending</option>
                <option value="FAILED">Failed</option>
              </select>
            </div>

            {/* Date Select */}
            <div className="flex flex-col space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Date Frame</span>
              <select
                value={dateFilter}
                onChange={(e: any) => setDateFilter(e.target.value)}
                className="bg-white border border-slate-200 outline-none rounded-lg p-1 text-[11px] font-bold text-slate-700 cursor-pointer"
              >
                <option value="all">All times</option>
                <option value="today">Today</option>
                <option value="week">7 Days</option>
                <option value="month">30 Days</option>
              </select>
            </div>

            {/* Type Select */}
            <div className="flex flex-col space-y-1">
              <span className="text-[9px] font-black uppercase text-slate-400 tracking-wider">Type</span>
              <select
                value={typeFilter}
                onChange={(e: any) => setTypeFilter(e.target.value)}
                className="bg-white border border-slate-200 outline-none rounded-lg p-1 text-[11px] font-bold text-slate-700 cursor-pointer"
              >
                <option value="all">All Types</option>
                <option value="credit">Credit (In)</option>
                <option value="debit">Debit (Out)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Transactions List */}
        {loading && filteredTransfers.length === 0 ? (
          <div className="text-center py-8 text-xs text-slate-400">Syncing ledger records...</div>
        ) : filteredTransfers.length === 0 ? (
          <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-8 text-center text-slate-500">
            <Calendar className="mx-auto text-slate-300 mb-2" size={24} />
            <p className="text-xs font-semibold">No transactions found matching filters</p>
            <p className="text-[10px] text-slate-400 mt-0.5">Try widening your ledger search parameters.</p>
          </div>
        ) : (
          <div id="transactions-list-container" className="space-y-3.5">
            {filteredTransfers.map((tx) => {
              const isCredit =
                tx.recipient_name.includes("Deposit") ||
                tx.recipient_name.includes("Disbursement") ||
                tx.recipient_name.includes("Credit");

              const isPending = tx.status === "PENDING";
              const isFailed = tx.status === "FAILED" || tx.status === "REJECTED";

              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedReceipt(tx)}
                  className="bg-white hover:bg-slate-50/50 hover:shadow-xs rounded-2xl p-4 border border-slate-100 flex items-center justify-between cursor-pointer transition-all active:scale-[0.99] select-none"
                >
                  <div className="flex items-center space-x-3.5 flex-1 min-w-0">
                    <div
                      className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 ${
                        isCredit ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"
                      }`}
                    >
                      {isCredit ? (
                        <ArrowUpRight size={18} className="stroke-[2.5]" />
                      ) : (
                        <ArrowDownLeft size={18} className="stroke-[2.5]" />
                      )}
                    </div>

                    <div className="flex flex-col min-w-0">
                      <span className="text-[13px] font-bold text-slate-800 truncate tracking-wide">
                        {tx.description}
                      </span>
                      <span className="text-[10.5px] text-[#a0aec0] font-medium tracking-wide mt-0.5 truncate flex items-center space-x-1">
                        <span>{formatDate(tx.created_at)}</span>
                        <span>•</span>
                        <span
                          className={`font-semibold uppercase text-[9.5px] ${
                            isPending
                              ? "text-amber-500 animate-pulse font-bold"
                              : isFailed
                              ? "text-red-500 font-bold"
                              : "text-slate-400"
                          }`}
                        >
                          {tx.status}
                        </span>
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3 text-right">
                    <div className="flex flex-col">
                      <span
                        className={`text-[13.5px] font-extrabold tracking-tight font-display ${
                          isCredit ? "text-emerald-600" : isFailed ? "text-slate-400 line-through" : "text-rose-500"
                        }`}
                      >
                        {isCredit ? "+" : "-"}
                        {formatMoney(tx.amount)}
                      </span>
                      <span className="text-[9.5px] text-slate-400 font-medium">
                        Bal:{" "}
                        {formatMoney(
                          tx.from_account === "checking"
                            ? user?.checking_balance ?? 865000.0
                            : user?.savings_balance ?? 865000.0
                        )}
                      </span>
                    </div>

                    <FileText size={15} className="text-slate-300 shrink-0 select-none" />
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* 4. RECEIPT DETAILS LIGHTBOX DIALOG */}
      {selectedReceipt && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 border border-slate-100 shadow-2xl flex flex-col relative">
            <div className="flex justify-between items-center mb-4">
              <span className="text-[11px] uppercase tracking-widest font-black text-slate-400">
                LTD LEDGER RECEIPT
              </span>
              <button
                onClick={() => setSelectedReceipt(null)}
                className="text-xs bg-slate-100 hover:bg-slate-200 text-slate-500 font-bold px-2.5 py-1 rounded-full cursor-pointer"
              >
                Close
              </button>
            </div>

            <div className="text-center py-4 bg-slate-50 rounded-2xl border border-slate-100/80 mb-6 flex flex-col items-center">
              <span className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mb-1.5 shadow-sm">
                <Receipt size={22} className="stroke-[1.8]" />
              </span>
              <h3 className="text-slate-800 text-[15px] font-black tracking-tight">{selectedReceipt.description}</h3>
              <span className="text-[26px] font-extrabold text-slate-900 mt-1 font-display">
                {formatMoney(selectedReceipt.amount)}
              </span>
              <span className="text-[9px] text-[#1169ca] font-bold border border-blue-200 bg-blue-100/10 rounded-full px-2.5 py-0.5 mt-2 uppercase tracking-widest">
                {selectedReceipt.transfer_type}
              </span>
            </div>

            {/* Audit metrics table */}
            <div className="space-y-3.5 text-xs text-slate-700">
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Receipt ID</span>
                <span className="font-mono font-bold text-slate-800">#JPM-{selectedReceipt.id}109</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Timestamp</span>
                <span className="font-semibold text-slate-800">{formatDate(selectedReceipt.created_at)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Source Account</span>
                <span className="font-bold uppercase text-slate-800">
                  {selectedReceipt.from_account} (**
                  {selectedReceipt.from_account === "checking" ? "7590" : "9346"})
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Recipient Name</span>
                <span className="font-semibold text-slate-800">{selectedReceipt.recipient_name}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Institution Bank</span>
                <span className="font-semibold text-[#1169ca]">{selectedReceipt.recipient_bank || "JPM Bank"}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400 font-medium">Target Account</span>
                <span className="font-mono font-bold text-slate-800">
                  {selectedReceipt.recipient_account_number || "Internal Ledger"}
                </span>
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-slate-100">
                <span className="text-slate-400 font-medium">Transfer Status</span>
                <span
                  className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full border uppercase tracking-widest ${
                    selectedReceipt.status === "PENDING"
                      ? "bg-amber-50 text-amber-600 border-amber-150 animate-pulse"
                      : "bg-emerald-50 text-emerald-600 border-emerald-100"
                  }`}
                >
                  {selectedReceipt.status}
                </span>
              </div>
            </div>

            <p className="text-[9.5px] text-slate-400 text-center mt-6 uppercase tracking-widest font-bold">
              Digitally Audited JPM Core Ledger
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
