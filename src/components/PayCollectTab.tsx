import React, { useState, useEffect } from "react";
import { ArrowLeftRight, HelpCircle, ShieldAlert, CheckCircle, Landmark, ShieldCheck, Wallet, ArrowRight, KeyRound, Check, RefreshCw, X, Download } from "lucide-react";
import { User } from "../types";

interface PayCollectTabProps {
  user: User | null;
  onTransferSuccess: () => void;
}

export default function PayCollectTab({ user, onTransferSuccess }: PayCollectTabProps) {
  const [transferType, setTransferType] = useState<"INTERNAL" | "EXTERNAL">("INTERNAL");
  const [fromAccount, setFromAccount] = useState<"savings" | "checking">("checking");
  const [amount, setAmount] = useState("");
  const [pin, setPin] = useState("");
  const [description, setDescription] = useState("");
  
  // Internal fields
  const [recipientAccountNumber, setRecipientAccountNumber] = useState("");
  
  // External fields
  const [recipientName, setRecipientName] = useState("");
  const [recipientBank, setRecipientBank] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const token = localStorage.getItem("session_token") || "";

  // Three transfer outcomes modals states matches design scope
  const [showCompletedModal, setShowCompletedModal] = useState(false);
  const [completedDetails, setCompletedDetails] = useState<any>(null);

  const [showRestrictedModal, setShowRestrictedModal] = useState(false);
  const [restrictedDetails, setRestrictedDetails] = useState<any>(null);

  const [showOtpRequiredModal, setShowOtpRequiredModal] = useState(false);
  const [otpRequiredDetails, setOtpRequiredDetails] = useState<any>(null);
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [otpSubmitting, setOtpSubmitting] = useState(false);

  // Helper presets to easily move money between Savings and Checking
  const setSelfTransferPreset = (toAcct: "savings" | "checking") => {
    setTransferType("INTERNAL");
    setFromAccount(toAcct === "savings" ? "checking" : "savings");
    setRecipientAccountNumber(
      toAcct === "savings"
        ? (user?.account_number || "9513639346")
        : (user?.second_account_number || "9513637590")
    );
    setDescription(`Move funds to self ${toAcct}`);
  };

  const handleTransferSubmit = async (e?: React.FormEvent, customOtp?: string) => {
    if (e) e.preventDefault();
    setError("");
    setSuccessMsg("");
    setOtpError("");

    if (!customOtp) {
      if (!amount || parseFloat(amount) <= 0) {
        setError("Please specify a valid transfer amount.");
        return;
      }

      if (!pin) {
        setError("Please configure the secure 4-digit transaction PIN.");
        return;
      }
      setLoading(true);
    } else {
      setOtpSubmitting(true);
    }

    const payload = {
      transfer_type: transferType,
      from_account: fromAccount,
      recipient_account_number: recipientAccountNumber,
      amount: parseFloat(amount),
      pin,
      description,
      recipient_name: transferType === "INTERNAL" ? "" : recipientName,
      recipient_bank: transferType === "INTERNAL" ? "Chase Mobile" : recipientBank,
      otp_code: customOtp || undefined
    };

    try {
      const response = await fetch("/api/v1/transfers", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      // Check for Custom Simulation Status holds first!
      if (resData.status === "RESTRICTED") {
        setRestrictedDetails({
          amount: parseFloat(amount),
          recipient: transferType === "INTERNAL" ? recipientAccountNumber : (recipientName || "External Wire Recipient"),
          code: resData.error_code,
          details: resData.details,
          message: resData.message
        });
        setShowRestrictedModal(true);
        setLoading(false);
        return;
      }

      if (resData.status === "OTP_REQUIRED") {
        setOtpRequiredDetails({
          challenge_code: resData.challenge_code,
          details: resData.details,
          message: resData.message
        });
        setShowOtpRequiredModal(true);
        setLoading(false);
        return;
      }

      if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Failed to process transfer.");
      }

      // SUCCESS!
      setCompletedDetails(resData.data);
      setShowCompletedModal(true);

      setSuccessMsg(`Transfer of $${parseFloat(amount).toFixed(2)} completed successfully!`);
      setAmount("");
      setPin("");
      setDescription("");
      setRecipientAccountNumber("");
      setRecipientName("");
      setRecipientBank("");
      onTransferSuccess();

      // Clear helper OTP dialog on verify success
      if (showOtpRequiredModal) {
        setShowOtpRequiredModal(false);
        setOtpInput("");
      }
    } catch (err: any) {
      if (customOtp) {
        setOtpError(err.message || "The authentication challenge failed to verify standard OTP.");
      } else {
        setError(err.message || "System error during wire transfer.");
      }
    } finally {
      setLoading(false);
      setOtpSubmitting(false);
    }
  };

  const getSourceLimit = () => {
    if (!user) return 0;
    return fromAccount === "checking" ? (user.checking_balance ?? 865000.0) : (user.savings_balance ?? 865000.0);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
    }).format(amount);
  };

  return (
    <div id="pay-collect-tab-root" className="flex-1 flex flex-col space-y-6 px-4 pb-12">
      {/* Title */}
      <div className="flex flex-col space-y-1">
        <h2 className="text-[22px] font-extrabold text-[#0a2342] tracking-tight">
          Pay & Collect
        </h2>
        <p className="text-slate-500 text-xs">
          Wire checking or savings capital instantly. Move assets internally to JPM cardholders or external institutions worldwide.
        </p>
      </div>


      {error && (
        <div className="p-4 bg-red-50 border-l-4 border-red-500 text-red-700 text-xs rounded-xl flex items-start space-x-2.5">
          <ShieldAlert className="shrink-0 text-red-500" size={16} />
          <span>{error}</span>
        </div>
      )}

      {successMsg && (
        <div className="p-4 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-800 text-xs rounded-xl flex items-start space-x-2.5">
          <CheckCircle className="shrink-[#0]" size={16} />
          <span>{successMsg}</span>
        </div>
      )}

      {/* Selector pills for INTERNAL (Chase network) vs EXTERNAL (External wire check/swift) */}
      <div className="grid grid-cols-2 gap-2 bg-slate-100 p-1 rounded-2xl">
        <button
          type="button"
          onClick={() => {
            setTransferType("INTERNAL");
            setError("");
          }}
          className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            transferType === "INTERNAL"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          Internal Transfer
        </button>
        <button
          type="button"
          onClick={() => {
            setTransferType("EXTERNAL");
            setError("");
          }}
          className={`py-2.5 rounded-xl font-bold text-xs transition-all cursor-pointer ${
            transferType === "EXTERNAL"
              ? "bg-white text-slate-800 shadow-sm"
              : "text-slate-500 hover:text-slate-800"
          }`}
        >
          External Wire
        </button>
      </div>

      <div className="bg-white rounded-3xl border border-slate-100 p-6 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
        <form onSubmit={handleTransferSubmit} className="space-y-5">
          
          {/* Section: Source Account Selection */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-extrabold text-[#718096] mb-2.5">
              Source Funding Account
            </label>
            <div className="grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setFromAccount("checking")}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between cursor-pointer ${
                  fromAccount === "checking"
                    ? "border-blue-600 bg-blue-50/25 ring-1 ring-blue-600"
                    : "border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-[11px] font-bold tracking-wide uppercase ${fromAccount === "checking" ? "text-blue-700" : "text-slate-600"}`}>
                    Checking portfolio
                  </span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${fromAccount === "checking" ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
                    {fromAccount === "checking" && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                </div>
                <span className="text-[14px] font-extrabold text-slate-800 mt-2">
                  {formatMoney(user?.checking_balance ?? 865000.0)}
                </span>
                <span className="text-[9px] text-slate-400 mt-1">ending in **7590</span>
              </button>

              <button
                type="button"
                onClick={() => setFromAccount("savings")}
                className={`p-3.5 rounded-2xl border text-left flex flex-col justify-between cursor-pointer ${
                  fromAccount === "savings"
                    ? "border-blue-600 bg-blue-50/25 ring-1 ring-blue-600"
                    : "border-slate-100 hover:bg-slate-50"
                }`}
              >
                <div className="flex justify-between items-center w-full">
                  <span className={`text-[11px] font-bold tracking-wide uppercase ${fromAccount === "savings" ? "text-blue-700" : "text-slate-600"}`}>
                    Fix Deposit portfolio
                  </span>
                  <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${fromAccount === "savings" ? "border-blue-600 bg-blue-600" : "border-slate-300"}`}>
                    {fromAccount === "savings" && <div className="w-1.5 h-1.5 bg-white rounded-full"></div>}
                  </div>
                </div>
                <span className="text-[14px] font-extrabold text-slate-800 mt-2">
                  {formatMoney(user?.savings_balance ?? 865000.0)}
                </span>
                <span className="text-[9px] text-slate-400 mt-1">ending in **9346</span>
              </button>
            </div>
          </div>

          <hr className="border-slate-100" />

          {/* Transfer Presets (Quick movement between Savings/Checking) */}
          {transferType === "INTERNAL" && (
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="block text-xs uppercase tracking-wider font-extrabold text-[#718096]">
                  Self Balance Transfer
                </label>
                <span className="text-[9px] text-slate-400 font-semibold uppercase">Quick Preset</span>
              </div>
              <div className="flex space-x-2">
                <button
                  type="button"
                  onClick={() => setSelfTransferPreset("savings")}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-3.5 py-2 rounded-xl text-[10.5px] font-bold text-slate-700 flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeftRight size={13} className="text-blue-600" />
                  <span>Transfer Checking ➔ Fix Deposit</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelfTransferPreset("checking")}
                  className="bg-slate-50 hover:bg-slate-100 border border-slate-200/60 px-3.5 py-2 rounded-xl text-[10.5px] font-bold text-slate-700 flex items-center space-x-1.5 cursor-pointer"
                >
                  <ArrowLeftRight size={13} className="text-blue-600" />
                  <span>Transfer Fix Deposit ➔ Checking</span>
                </button>
              </div>
            </div>
          )}

          {/* Form fields based on Internal vs External */}
          {transferType === "INTERNAL" ? (
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-[#718096] mb-2">
                Recipient Account Number / User Account No. *
              </label>
              <input
                type="text"
                required
                value={recipientAccountNumber}
                onChange={(e) => setRecipientAccountNumber(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-3 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono tracking-wider"
                placeholder="e.g. 9513637590"
              />
              <span className="text-[10px] text-slate-400 mt-1.5 block leading-tight">
                Instantly transfer funds to JPM Chase accounts. Valid checking account is ending in <span className="font-semibold text-slate-500">7590</span>, or fix deposit account in <span className="font-semibold text-slate-500">9346</span>.
              </span>
            </div>
          ) : (
            <div className="space-y-4">
              <div>
                <label className="block text-xs uppercase tracking-wider font-extrabold text-[#718096] mb-2">
                  Recipient Legal Name *
                </label>
                <input
                  type="text"
                  required
                  value={recipientName}
                  onChange={(e) => setRecipientName(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g. Recipient Name"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-[#718096] mb-2">
                    Recipient Bank Institutional Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientBank}
                    onChange={(e) => setRecipientBank(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="e.g. Global Finance Bank"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-extrabold text-[#718096] mb-2">
                    Recipient SWIFT / Account No. *
                  </label>
                  <input
                    type="text"
                    required
                    value={recipientAccountNumber}
                    onChange={(e) => setRecipientAccountNumber(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono"
                    placeholder="e.g. 9876543210"
                  />
                </div>
              </div>
            </div>
          )}

          <hr className="border-slate-100" />

          {/* Amount field */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-[#718096] mb-2">
                Transfer Amount ($) *
              </label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400 font-bold">$</span>
                <input
                  type="number"
                  step="0.01"
                  required
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 pl-7 pr-3 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 font-bold text-slate-800"
                  placeholder="0.00"
                />
              </div>
              <span className="text-[10px] text-slate-400 mt-1 block">
                Portfolio Limit: {formatMoney(getSourceLimit())}
              </span>
            </div>

            {/* PIN field */}
            <div>
              <label className="block text-xs uppercase tracking-wider font-extrabold text-[#718096] mb-2 flex items-center space-x-1">
                <span>Secure PIN *</span>
                <HelpCircle size={12} className="text-slate-400 shrink-0" title="The wire authorized transaction PIN." />
              </label>
              <input
                type="password"
                maxLength={6}
                required
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 text-center font-mono tracking-widest font-black"
                placeholder="••••"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">
                Authorized 4-digit Wire Clearance PIN.
              </span>
            </div>
          </div>

          {/* Description */}
          <div>
            <label className="block text-xs uppercase tracking-wider font-extrabold text-[#718096] mb-2">
              Transaction Memo / Description Note
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl py-2.5 px-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Invoice payment"
            />
          </div>

          {/* Secure Audit Notice */}
          <div className="bg-slate-50 border border-slate-100 p-3.5 rounded-2xl flex space-x-3">
            <ShieldCheck size={20} className="text-[#1169ca] shrink-0 mt-0.5" />
            <div className="flex flex-col">
              <span className="text-[11px] font-bold text-slate-800">TLS Ledger Verification Guard</span>
              <p className="text-[10px] text-[#718096] leading-normal mt-0.5">
                This transaction will undergo cryptographic auditing rules and register directly inside the matching counterparty accounting ledger block instantly.
              </p>
            </div>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-[#1169ca] hover:bg-blue-800 text-white font-bold py-3.5 px-4 rounded-xl text-xs transition-all shadow-md shadow-blue-100 flex items-center justify-center space-x-1.5 uppercase tracking-wider cursor-pointer select-none disabled:bg-slate-300"
          >
            {loading ? (
              <span>Confirming Ledger Transfer...</span>
            ) : (
              <>
                <span>Commit Wire Ledger</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </form>
      </div>

      {/* MODAL 1: TRANSACTION COMPLETED */}
      {showCompletedModal && completedDetails && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden border border-slate-100 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col">
            <div className="bg-[#1169ca] p-6 text-white flex flex-col items-center text-center space-y-2 relative">
              <button
                onClick={() => setShowCompletedModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <Check className="text-emerald-400" size={28} />
              </div>
              <h4 className="text-xs font-black tracking-wider uppercase">Ledger Transfer Confirmed</h4>
              <p className="text-[28px] font-black">{formatMoney(completedDetails.amount)}</p>
            </div>
            
            <div className="p-6 space-y-4 text-xs font-medium text-slate-600 flex-1">
              <div className="flex justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-400">Recipient</span>
                <span className="font-bold text-slate-800">{completedDetails.recipient_name || "Internal Portfolio Transfer"}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-400">Recipient Bank</span>
                <span className="font-bold text-slate-800">{completedDetails.recipient_bank}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-400">Destination SWIFT/Acct</span>
                <span className="font-mono font-bold text-slate-800">{completedDetails.recipient_account_number}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-400">Transaction ID</span>
                <span className="font-mono text-slate-500">#TXN-{(completedDetails.id * 1891 + 7215)}</span>
              </div>
              <div className="flex justify-between border-b border-slate-100 pb-2.5">
                <span className="text-slate-400">Cleared Date</span>
                <span className="text-slate-800 font-bold">{new Date(completedDetails.created_at).toLocaleString()}</span>
              </div>

              <div className="bg-slate-50 border border-slate-200/50 p-3 rounded-2xl flex items-center space-x-3 mt-2">
                <Landmark size={20} className="text-[#1169ca] shrink-0" />
                <div className="flex flex-col text-[10px]">
                  <span className="font-black text-slate-800 uppercase tracking-wider">J.P. Morgan & Co.</span>
                  <span className="text-[#718096] mt-0.5 font-medium leading-normal">Federal Wire Clearing Certificate Authorized. Local currency liquid matching.</span>
                </div>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  alert("Receipt PDF file generated in simulated local workspace directory.");
                }}
                className="flex-1 bg-slate-900 hover:bg-slate-950 text-white font-bold py-2.5 rounded-xl text-xs transition-colors flex items-center justify-center space-x-1 cursor-pointer"
              >
                <Download size={13} />
                <span>Save Receipt</span>
              </button>
              <button
                type="button"
                onClick={() => setShowCompletedModal(false)}
                className="flex-1 bg-[#1169ca] hover:bg-blue-800 text-white font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: TRANSACTION RESTRICTED */}
      {showRestrictedModal && restrictedDetails && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden border border-slate-100 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col">
            <div className="bg-red-600 p-6 text-white flex flex-col items-center text-center space-y-2 relative">
              <button
                onClick={() => setShowRestrictedModal(false)}
                className="absolute top-4 right-4 text-white/70 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="w-12 h-12 bg-white/15 rounded-full flex items-center justify-center">
                <ShieldAlert className="text-white" size={28} />
              </div>
              <h4 className="text-sm font-black tracking-wider uppercase">Transaction Restricted</h4>
              <p className="text-[10px] font-black text-red-100 uppercase tracking-wide">COMPLIANCE COMPROMISE DETECTED</p>
            </div>
            
            <div className="p-6 space-y-4 text-xs font-semibold leading-relaxed">
              <div className="p-3.5 bg-red-50 border border-red-100 rounded-2xl text-red-800 font-medium">
                <p className="font-extrabold uppercase text-[10px] tracking-wide mb-1 text-red-900">Security Warning Notice</p>
                {restrictedDetails.message || "The Counterparty Compliance Office has locked transmission assets for this ledger wire request."}
              </div>

              <div className="space-y-2 text-slate-600 font-medium">
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Intended Transfer</span>
                  <span className="font-bold text-slate-800">{formatMoney(restrictedDetails.amount)}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Recipient Target</span>
                  <span className="font-mono font-bold text-slate-800 truncate max-w-[150px]">{restrictedDetails.recipient}</span>
                </div>
                <div className="flex justify-between border-b border-slate-100 pb-2">
                  <span className="text-slate-400">Code/Reference</span>
                  <span className="font-mono text-red-600 font-extrabold">{restrictedDetails.code}</span>
                </div>
              </div>

              <p className="text-[10px] text-slate-400 font-medium leading-normal bg-slate-50 p-3 rounded-xl border border-slate-100">
                {restrictedDetails.details || "Federal regulations require dual KYC clearance procedures before executing large or uncertified counterparty transmissions. Click below to submit identity documents to bypass restriction holds."}
              </p>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex flex-col gap-2">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() => {
                    alert("A notification has been logged to your assigned Private Account Officer. They will reach out to you directly at your active email: johnprivate677i@gmail.com.");
                  }}
                  className="flex-1 bg-red-600 hover:bg-red-700 text-white font-black py-2.5 rounded-xl text-[9.5px] tracking-wide transition-all shadow-md shadow-red-100 uppercase cursor-pointer"
                >
                  Contact Officer
                </button>
                <button
                  type="button"
                  onClick={() => {
                    alert("Opening immediate priority support ticket with Compliance Intercept Desk (Reference: ERR-REG-GEO-902). Our average response is under 5 minutes.");
                  }}
                  className="flex-1 bg-slate-900 hover:bg-slate-950 text-white font-black py-2.5 rounded-xl text-[9.5px] tracking-wide transition-colors uppercase cursor-pointer"
                >
                  Contact Support
                </button>
              </div>
              <button
                type="button"
                onClick={() => setShowRestrictedModal(false)}
                className="w-full bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: OTP VERIFICATION CHALLENGE */}
      {showOtpRequiredModal && otpRequiredDetails && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-xs flex items-center justify-center z-50 p-4 animate-fade-in">
          <div className="bg-white rounded-3xl w-full max-w-sm overflow-hidden border border-slate-100 shadow-[0_12px_44px_rgba(0,0,0,0.18)] flex flex-col">
            <div className="bg-[#0a2342] p-6 text-white flex flex-col items-center text-center space-y-2 relative">
              <button
                onClick={() => {
                  setShowOtpRequiredModal(false);
                  setOtpInput("");
                }}
                className="absolute top-4 right-4 text-white/70 hover:text-white cursor-pointer"
              >
                <X size={18} />
              </button>
              <div className="w-12 h-12 bg-white/10 rounded-full flex items-center justify-center">
                <KeyRound className="text-amber-400" size={24} />
              </div>
              <h4 className="text-sm font-black tracking-wider uppercase">Security Verification Required</h4>
              <p className="text-[10.5px] font-medium text-slate-300">Escrow holding verification challenge.</p>
            </div>
            
            <div className="p-6 space-y-4">
              <p className="text-slate-600 text-xs font-semibold leading-normal">
                {otpRequiredDetails.message || "An active dual-authorization ledger release has been initiated. In order to clear counterparty holdings, enter the 6-digit confirmation PIN."}
              </p>

              <div className="bg-blue-50 border border-blue-100/60 p-3 rounded-2xl flex flex-col text-xs leading-normal">
                <span className="font-extrabold text-blue-950 text-[10px] uppercase tracking-wide">Secure SMS Transmission</span>
                <p className="text-blue-900 font-medium mt-0.5 leading-snug">
                  Please match the security challenge by inputting the pre-verified OTP clearance key:
                </p>
                <div className="font-mono text-center font-black text-[#1169ca] bg-white border border-blue-100 mt-2 py-2 rounded-xl tracking-widest text-[16px] select-all cursor-pointer" title="Double click to copy">
                  729511
                </div>
              </div>

              {otpError && (
                <div className="p-3 bg-red-50 border-l-4 border-red-500 text-red-700 text-[10.5px] rounded-xl flex items-start space-x-1.5 font-bold leading-snug">
                  <ShieldAlert className="shrink-0 text-red-500 mt-0.5" size={13} />
                  <span>{otpError}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="block text-[10px] font-black uppercase tracking-wider text-slate-500 text-center">
                  6-Digit OTP Security Code
                </label>
                <input
                  type="text"
                  maxLength={6}
                  value={otpInput}
                  onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))}
                  placeholder="••••••"
                  className="w-full bg-slate-50 border-2 border-slate-200 focus:border-blue-600 rounded-xl py-2.5 px-4 text-center font-mono text-[18px] tracking-widest font-black focus:outline-none"
                />
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setShowOtpRequiredModal(false);
                  setOtpInput("");
                }}
                className="flex-1 bg-slate-200 hover:bg-slate-300 text-slate-800 font-bold py-2.5 rounded-xl text-xs transition-colors cursor-pointer"
              >
                Abort
              </button>
              <button
                type="button"
                disabled={otpSubmitting || otpInput.length < 6}
                onClick={() => handleTransferSubmit(undefined, otpInput)}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-bold py-2.5 rounded-xl text-xs transition-all shadow-md shadow-blue-100 uppercase tracking-wider cursor-pointer disabled:bg-slate-200 disabled:shadow-none disabled:text-slate-400 flex items-center justify-center space-x-1"
              >
                {otpSubmitting ? "Verifying..." : "Auth Release"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
