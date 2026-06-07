import React, { useState, useEffect } from "react";
import { CreditCard, Landmark, CirclePlus, ChevronRight, Sparkles, Receipt, X, ArrowUpRight, ArrowDownLeft, Clock, AlertCircle, CheckCircle2 } from "lucide-react";
import { User, Transfer } from "../types";

interface AccountsTabProps {
  user: User | null;
  onSelectAccount: (acctType: "savings" | "checking") => void;
  onOpenApplyLoan: () => void;
  onOpenSubmitKyc: () => void;
  onOpenQuickTransfer?: () => void;
}

export default function AccountsTab({
  user,
  onSelectAccount,
  onOpenApplyLoan,
  onOpenSubmitKyc,
  onOpenQuickTransfer,
}: AccountsTabProps) {
  // Direct tracking of the persistent-blue dismissible cards
  const [showApplePay, setShowApplePay] = useState(true);
  const [showDeposit, setShowDeposit] = useState(true);
  const [showTransferCard, setShowTransferCard] = useState(true);

  // Dynamic state for recent ledger history
  const [transactions, setTransactions] = useState<Transfer[]>([]);
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);

  const token = localStorage.getItem("session_token") || "";

  useEffect(() => {
    if (!user) return;
    const fetchDashboardLedger = async () => {
      setLoading(true);
      try {
        // Fetch transaction history
        const txResponse = await fetch(`/api/v1/transactions/user/${user.id}`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const txData = await txResponse.json();
        if (txData.success) {
          setTransactions(txData.data.slice(0, 3)); // show top 3 recent transactions
        }

        // Fetch transfer history
        const tfResponse = await fetch(`/api/v1/transfers`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const tfData = await tfResponse.json();
        if (tfData.success) {
          setTransfers(tfData.data.slice(0, 3)); // show top 3 recent transfers
        }
      } catch (err) {
        console.error("Dashboard data sync error:", err);
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardLedger();
    const interval = setInterval(fetchDashboardLedger, 8000);
    return () => clearInterval(interval);
  }, [user]);

  // Offers data matching screenshots
  const offers = [
    {
      id: "cards",
      title: "Cards",
      sub: "Add to wallet",
      element: (
        <div className="flex flex-col items-center justify-center space-y-2 h-full text-[#1169ca]">
          <CreditCard size={28} className="stroke-[1.8]" />
          <span className="text-[11px] font-bold tracking-tight">Cards</span>
        </div>
      ),
      bg: "bg-white border border-slate-200/80 shadow-sm",
    },
    {
      id: "office-depot",
      title: "Office Depot",
      element: (
        <div className="flex flex-col items-center justify-center space-y-1 h-full text-white text-center px-1">
          <span className="text-[13px] font-black leading-none tracking-tighter uppercase">Office</span>
          <span className="text-[11px] font-bold leading-none tracking-wide text-rose-200">DEPOT</span>
          <span className="text-[9px] font-medium leading-none text-slate-100 uppercase opacity-90 mt-0.5">OfficeMax</span>
        </div>
      ),
      bg: "bg-[#bf2026] shadow-sm",
    },
    {
      id: "nfl",
      title: "NFL Network",
      element: (
        <div className="flex flex-col items-center justify-center space-y-1 h-full text-white text-center">
          <span className="text-[15px] font-black tracking-widest text-[#002244]">NFL</span>
          <span className="text-[9px] font-bold tracking-wider text-slate-300 uppercase">Network</span>
        </div>
      ),
      bg: "bg-[#0b1b3d] border border-[#16274e] shadow-sm",
    },
    {
      id: "dell",
      title: "Dell",
      element: (
        <div className="flex flex-col items-center justify-center h-full text-[#0076c0]">
          <span className="text-lg font-black italic tracking-tighter">Dell</span>
        </div>
      ),
      bg: "bg-white border border-slate-100 shadow-sm",
    },
    {
      id: "amazon",
      title: "Amazon",
      element: (
        <div className="flex flex-col items-center justify-center h-full text-slate-900 leading-none">
          <span className="text-sm font-black tracking-tighter lowercase">amazon</span>
          <span className="text-orange-500 text-xs font-bold leading-none">‾‾</span>
        </div>
      ),
      bg: "bg-[#ff9900]/10 border border-[#ff9900]/30 shadow-sm",
    },
  ];

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  const getSavingsBalance = () => {
    if (!user) return 865000.0;
    return user.savings_balance ?? user.balance * 0.5;
  };

  const getCheckingBalance = () => {
    if (!user) return 865000.0;
    return user.checking_balance ?? user.balance * 0.7;
  };

  const formatTxDate = (isoStr: string) => {
    try {
      const d = new Date(isoStr);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch (e) {
      return isoStr;
    }
  };

  return (
    <div id="accounts-tab-root" className="flex-1 flex flex-col space-y-6">
      {/* 1. BLUE PORTFOLIO DIRECT TRANSFER PROMPT / DISMISSIBLE TILES CARD */}
      <div className="bg-[#1169ca] px-4 pb-5 pt-0 -mt-2 rounded-b-3xl">
        <div className="flex items-center overflow-x-auto space-x-3.5 scrollbar-none pb-1.5 touch-pan-x">
          {showApplePay && (
            <div className="min-w-[136px] bg-white/10 hover:bg-white/15 border border-white/8 rounded-2xl p-4.5 text-white flex flex-col justify-between h-[126px] relative select-none">
              <button
                onClick={() => setShowApplePay(false)}
                className="absolute top-2.5 right-2.5 p-0.5 hover:bg-white/10 rounded-full cursor-pointer"
                title="Dismiss tile"
              >
                <X size={12} className="text-slate-300" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-white/12 flex items-center justify-center">
                <CreditCard size={18} className="text-blue-100" />
              </div>
              <div>
                <p className="text-[12px] font-semibold leading-tight mb-0.5">Set Up Apple Pay</p>
                <span className="text-[9px] text-blue-200">Instant checkout</span>
              </div>
            </div>
          )}

          {showDeposit && (
            <div className="min-w-[136px] bg-white/10 hover:bg-white/15 border border-white/8 rounded-2xl p-4.5 text-white flex flex-col justify-between h-[126px] relative select-none">
              <button
                onClick={() => setShowDeposit(false)}
                className="absolute top-2.5 right-2.5 p-0.5 hover:bg-white/10 rounded-full cursor-pointer"
                title="Dismiss tile"
              >
                <X size={12} className="text-slate-300" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-white/12 flex items-center justify-center">
                <Sparkles size={18} className="text-blue-100" />
              </div>
              <div>
                <p className="text-[12px] font-semibold leading-tight mb-0.5">Deposit Checks</p>
                <span className="text-[9px] text-blue-200">Mobile Scanner</span>
              </div>
            </div>
          )}

          {showTransferCard && (
            <div 
              onClick={onOpenQuickTransfer}
              className="min-w-[136px] bg-white/10 hover:bg-white/15 border border-white/8 rounded-2xl p-4.5 text-white flex flex-col justify-between h-[126px] relative select-none cursor-pointer"
            >
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setShowTransferCard(false);
                }}
                className="absolute top-2.5 right-2.5 p-0.5 hover:bg-white/10 rounded-full cursor-pointer"
                title="Dismiss tile"
              >
                <X size={12} className="text-slate-300" />
              </button>
              <div className="w-8 h-8 rounded-xl bg-white/12 flex items-center justify-center">
                <Receipt size={18} className="text-blue-100" />
              </div>
              <div>
                <p className="text-[12px] font-semibold leading-tight mb-0.5">Account Transfer</p>
                <span className="text-[9px] text-blue-200">Wire ledger funds</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 2. ACCOUNTS MAIN BLOCK - REPLICATING SCREENSHOT 1 */}
      <div className="px-4">
        <h2 className="text-[19px] font-extrabold text-[#0a2342] tracking-tight mb-3">
          Accounts
        </h2>

        {/* Big White Card containing Checking & Savings portfolio */}
        <div id="accounts-white-card" className="bg-white rounded-3xl p-5 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.03)] flex flex-col">
          {/* Savings Account row */}
          <div
            onClick={() => onSelectAccount("savings")}
            className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-1">
                <span className="text-[#1169ca] font-extrabold text-[13.5px] tracking-wide uppercase group-hover:underline">
                  FIX DEPOSIT
                </span>
                <ChevronRight size={13} className="text-[#1169ca] shrink-0" />
              </div>
              <span className="text-[#718096] text-[12px] font-medium tracking-wider">
                ** 9346
              </span>
            </div>
            <div className="text-[19px] font-extrabold text-[#0a2342] font-display">
              {formatMoney(getSavingsBalance())}
            </div>
          </div>

          <hr className="border-slate-100 my-0.5" />

          {/* Checking Account row */}
          <div
            onClick={() => onSelectAccount("checking")}
            className="flex items-center justify-between py-3.5 hover:bg-slate-50/50 rounded-xl transition-colors cursor-pointer group"
          >
            <div className="flex flex-col space-y-1">
              <div className="flex items-center space-x-1">
                <span className="text-[#1169ca] font-extrabold text-[13.5px] tracking-wide uppercase group-hover:underline">
                  TOTAL CHECKING
                </span>
                <ChevronRight size={13} className="text-[#1169ca] shrink-0" />
              </div>
              <span className="text-[#718096] text-[12px] font-medium tracking-wider">
                ** 7590
              </span>
            </div>
            <div className="text-[19px] font-extrabold text-[#0a2342] font-display">
              {formatMoney(getCheckingBalance())}
            </div>
          </div>

          <hr className="border-slate-100 my-0.5" />

          {/* Open an Account link */}
          <div
            onClick={onOpenApplyLoan}
            className="flex items-center space-x-2 py-3.5 text-[#1169ca] font-bold text-[13.5px] cursor-pointer hover:text-blue-800"
          >
            <CirclePlus size={16} className="shrink-0" />
            <span>Open an Account</span>
          </div>
        </div>
      </div>

      {/* NEW: RECENT TRANSACTIONS DASHBOARD VIEW */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-extrabold text-[#0a2342] tracking-tight">
            Recent Transactions
          </h2>
          <span 
            onClick={() => onSelectAccount("checking")}
            className="text-[#1169ca] text-xs font-bold hover:underline cursor-pointer"
          >
            View all
          </span>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-3">
          {transactions.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-4">No recent transactions recorded.</p>
          ) : (
            transactions.map((tx) => {
              const isCredit =
                tx.recipient_name.includes("Deposit") ||
                tx.recipient_name.includes("Disbursement") ||
                tx.recipient_name.includes("Credit");

              return (
                <div key={tx.id} className="flex items-center justify-between py-1">
                  <div className="flex items-center space-x-3 truncate">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${isCredit ? "bg-emerald-50 text-emerald-600" : "bg-rose-50 text-rose-500"}`}>
                      {isCredit ? <ArrowUpRight size={14} /> : <ArrowDownLeft size={14} />}
                    </div>
                    <div className="flex flex-col truncate">
                      <span className="text-[12.5px] font-bold text-slate-800 truncate">{tx.description}</span>
                      <span className="text-[10px] text-slate-400 font-medium">{formatTxDate(tx.created_at)} • {tx.status?.toLowerCase()}</span>
                    </div>
                  </div>
                  <span className={`text-[13px] font-extrabold pb-0.5 ${isCredit ? "text-emerald-600" : "text-rose-500"}`}>
                    {isCredit ? "+" : "-"}{formatMoney(tx.amount)}
                  </span>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* NEW: RECENT TRANSFERS DASHBOARD VIEW */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-[16px] font-extrabold text-[#0a2342] tracking-tight">
            Transfer History
          </h2>
        </div>

        <div className="bg-white rounded-3xl p-4 border border-slate-100 shadow-[0_4px_24px_rgba(0,0,0,0.02)] space-y-3">
          {transfers.length === 0 ? (
            <p className="text-center text-xs text-slate-400 py-4">No outbound transfers initiated.</p>
          ) : (
            transfers.map((tx) => {
              const isPending = tx.status === "PENDING";
              return (
                <div key={tx.id} className="flex items-center justify-between py-1">
                  <div className="flex flex-col truncate pr-2">
                    <span className="text-[12.5px] font-bold text-slate-800 truncate">{tx.recipient_name || "Self Transfer"}</span>
                    <span className="text-[10px] text-slate-400 font-medium">{formatTxDate(tx.created_at)} • {tx.recipient_account_number || "Internal"}</span>
                  </div>
                  <div className="flex flex-col items-end shrink-0">
                    <span className="text-[13px] font-extrabold text-slate-800">{formatMoney(tx.amount)}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.25 rounded mt-0.5 ${isPending ? "bg-amber-50 text-amber-500 border border-amber-100 animate-pulse" : "bg-emerald-50 text-emerald-600"}`}>
                      {tx.status}
                    </span>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* 3. CHASE OFFERS BLOCK - REPLICATING SCREENSHOT 1 */}
      <div className="px-4">
        <div className="flex items-center justify-between mb-0.5">
          <h2 className="text-[15.5px] font-extrabold text-[#0a2342] tracking-tight">
            Chase offers
          </h2>
          <span className="text-[#1169ca] text-xs font-bold hover:underline cursor-pointer">
            All offers &gt;
          </span>
        </div>
        <p className="text-[#718096] text-[11px] mb-3.5 font-medium">
          Add deals, shop and get money back.
        </p>

        {/* Scrollable Offers List */}
        <div className="flex items-center overflow-x-auto space-x-3.5 scrollbar-none pb-2 touch-pan-x">
          {offers.map((off) => (
            <div
              key={off.id}
              className={`min-w-[96px] w-[96px] h-[96px] rounded-2xl flex flex-col justify-between p-3 shrink-0 ${off.bg}`}
            >
              {off.element}
            </div>
          ))}
        </div>
      </div>

      {/* 4. CHASE INVESTMENTS INFO CTA */}
      <div className="px-4 pb-8">
        <div className="bg-gradient-to-r from-[#012244] to-[#043360] rounded-3xl p-5 text-white flex flex-col relative overflow-hidden shadow-md">
          {/* Geometric subtle details */}
          <div className="absolute right-[-40px] bottom-[-40px] w-36 h-36 rounded-full border border-white/5 bg-white/5"></div>
          <div className="absolute right-[-10px] top-[-20px] w-24 h-24 rounded-full border border-white/5 bg-white/5"></div>

          <div className="text-[10px] text-[#00ebff] font-bold tracking-widest uppercase mb-1">
            Personal Wealth Brokerage
          </div>
          <p className="text-[15px] font-extrabold tracking-tight mb-2 max-w-[210px] leading-tight">
            Invest dynamically with J.P. Morgan Advisors
          </p>
          <span className="text-[10.5px] text-slate-300 font-light mb-4.5 max-w-[220px]">
            Execute trades instantly on client-only sovereign notes or standard ETFs with zero transaction commissions.
          </span>

          <div className="flex items-center justify-between">
            <button
              onClick={onOpenApplyLoan}
              type="button"
              className="bg-sky-500 hover:bg-sky-600 text-slate-900 font-bold text-xs py-2 px-4 rounded-xl cursor-pointer"
            >
              Explore Markets
            </button>
            <span className="text-[10px] text-slate-400 font-semibold italic">Member SIPC</span>
          </div>
        </div>
      </div>
    </div>
  );
}
