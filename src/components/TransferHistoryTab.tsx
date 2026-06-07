import React, { useState, useEffect } from "react";
import { ArrowLeftRight, Calendar, Search, RefreshCw, FileText, CheckCircle2, AlertCircle, Clock } from "lucide-react";
import { User, Transfer } from "../types";

interface TransferHistoryTabProps {
  user: User | null;
}

export default function TransferHistoryTab({ user }: TransferHistoryTabProps) {
  const [transfers, setTransfers] = useState<Transfer[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");

  const token = localStorage.getItem("session_token") || "";

  const fetchTransfers = async () => {
    if (!user) return;
    setLoading(true);
    try {
      const response = await fetch(`/api/v1/transfers`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = await response.json();
      if (data.success) {
        // Sort newest first
        const sorted = data.data.sort(
          (a: Transfer, b: Transfer) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );
        setTransfers(sorted);
      }
    } catch (err) {
      console.error("Error loading transfers:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchTransfers();
    const interval = setInterval(fetchTransfers, 10000);
    return () => clearInterval(interval);
  }, [user]);

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
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      };
      return d.toLocaleDateString("en-US", options);
    } catch (e) {
      return isoStr;
    }
  };

  const filteredTransfers = transfers.filter((t) => {
    const text = (t.recipient_name + " " + t.recipient_account_number + " " + t.description).toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <div id="transfer-history-viewport" className="flex-1 flex flex-col space-y-5 px-4 pb-12">
      {/* Title Header */}
      <div className="flex flex-col space-y-1">
        <h2 className="text-[22px] font-extrabold text-[#0a2342] tracking-tight">
          Transfer History
        </h2>
        <p className="text-slate-500 text-xs">
          Comprehensive ledger records of both incoming and outgoing asset transmissions.
        </p>
      </div>

      {/* Filter / Search Bar */}
      <div className="flex items-center space-x-2 bg-white rounded-2xl border border-slate-150 p-2 shadow-xs">
        <Search size={16} className="text-slate-400 shrink-0 ml-2" />
        <input
          type="text"
          placeholder="Filter transfers by recipient or account..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-transparent border-none text-xs outline-none text-slate-800 placeholder-slate-400 py-1.5"
        />
        {searchTerm && (
          <button
            onClick={() => setSearchTerm("")}
            className="text-[10px] text-slate-400 hover:text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-full px-2 py-0.5 font-bold shrink-0 cursor-pointer"
          >
            Clear
          </button>
        )}
      </div>

      {loading && transfers.length === 0 ? (
        <div className="text-center py-12 text-xs text-slate-400 flex items-center justify-center space-x-2">
          <RefreshCw className="animate-spin text-[#1169ca]" size={14} />
          <span>Syncing transfers vault...</span>
        </div>
      ) : filteredTransfers.length === 0 ? (
        <div className="bg-white border border-dashed border-slate-200 rounded-3xl p-10 text-center text-slate-500 flex flex-col items-center shadow-xs">
          <ArrowLeftRight className="text-slate-300 mb-3" size={32} />
          <p className="text-sm font-extrabold text-slate-700">No transfers logged</p>
          <p className="text-xs text-slate-400 mt-1 max-w-[220px] mx-auto">
            You haven't initiated or received any local or international transfers yet.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {filteredTransfers.map((tx) => {
            const isPending = tx.status === "PENDING";
            const isFailed = tx.status === "FAILED" || tx.status === "REJECTED";

            return (
              <div
                key={tx.id}
                className="bg-white border border-slate-100 rounded-2xl p-4.5 shadow-[0_4px_16px_rgba(0,0,0,0.015)] flex flex-col space-y-3 hover:border-blue-100 transition-colors"
              >
                {/* Top Row: Destination Name and Status pill */}
                <div className="flex items-start justify-between">
                  <div className="flex flex-col min-w-0 pr-2">
                    <span className="text-[13.5px] font-extrabold text-[#0a2342] truncate tracking-wide">
                      {tx.recipient_name || "Self Portfolio Transfer"}
                    </span>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5">
                      Account: {tx.recipient_account_number || "Internal Account"}
                    </span>
                  </div>

                  <span
                    className={`text-[9.5px] font-extrabold px-2.5 py-0.75 rounded-full uppercase tracking-wider flex items-center space-x-1 shrink-0 ${
                      isPending
                        ? "bg-amber-50 text-amber-600 border border-amber-100 animate-pulse"
                        : isFailed
                        ? "bg-red-50 text-red-600 border border-red-100"
                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                    }`}
                  >
                    {isPending ? (
                      <>
                        <Clock size={10} className="mr-0.5 inline shrink-0" />
                        <span>Pending</span>
                      </>
                    ) : isFailed ? (
                      <>
                        <AlertCircle size={10} className="mr-0.5 inline shrink-0" />
                        <span>Failed</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={10} className="mr-0.5 inline shrink-[#0]" />
                        <span>Completed</span>
                      </>
                    )}
                  </span>
                </div>

                <hr className="border-slate-50" />

                {/* Bottom Row: Date, Source Account, and Amount */}
                <div className="flex items-center justify-between text-xs pt-0.5">
                  <div className="flex flex-col space-y-0.5 text-slate-500 font-medium">
                    <span className="flex items-center space-x-1">
                      <Calendar size={11} className="text-slate-400 shrink-0" />
                      <span className="text-[10.5px]">{formatDate(tx.created_at)}</span>
                    </span>
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider font-bold">
                      Source: {tx.from_account} account
                    </span>
                  </div>

                  <span
                    className={`text-base font-extrabold tracking-tight font-display ${
                      isFailed ? "text-slate-400 line-through" : isPending ? "text-amber-500 font-bold" : "text-[#0a2342]"
                    }`}
                  >
                    {formatMoney(tx.amount)}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
