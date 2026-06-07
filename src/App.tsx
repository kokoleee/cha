import React, { useState, useEffect } from "react";
import { Wallet, ArrowLeftRight, FileText, Landmark, ShieldCheck, User as UserIcon, Settings, LogOut } from "lucide-react";
import { User } from "./types";
import Login from "./components/Login";
import Header from "./components/Header";
import AccountsTab from "./components/AccountsTab";
import TransactionsTab from "./components/TransactionsTab";
import PayCollectTab from "./components/PayCollectTab";
import ProfileTab from "./components/ProfileTab";

export default function App() {
  const [token, setToken] = useState<string | null>(localStorage.getItem("session_token"));
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  
  // Navigation layout state matching screenshot bottom bar
  // Selection modes: "accounts" | "pay" | "transactions" | "profile"
  const [activeTab, setActiveTab] = useState<"accounts" | "pay" | "transactions" | "profile">("accounts");
  
  // Carousel selector alignment between screens
  const [selectedAccountType, setSelectedAccountType] = useState<"all" | "savings" | "checking">("savings");

  const syncProfile = async (sessionToken: string) => {
    setLoading(true);
    try {
      const response = await fetch("/api/v1/auth/me", {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      
      const contentType = response.headers.get("content-type");
      if (response.ok && contentType && contentType.includes("application/json")) {
        const data = await response.json();
        if (data.success) {
          setUser(data.data);
          return;
        }
      }
      
      // Fallback if not successful, not JSON, or explicit failure
      handleSignOut();
    } catch (err) {
      console.error("Error syncing session profile:", err);
      handleSignOut();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (token) {
      syncProfile(token);
    }
  }, [token]);

  const handleLoginSuccess = (newToken: string) => {
    localStorage.setItem("session_token", newToken);
    setToken(newToken);
    setActiveTab("accounts");
  };

  const handleSignOut = async () => {
    try {
      await fetch("/api/v1/auth/logout", {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });
    } catch (e) {
      // Ignored
    }
    localStorage.removeItem("session_token");
    setToken(null);
    setUser(null);
  };

  const handleSelectAccountFromDashboard = (acctType: "savings" | "checking") => {
    setSelectedAccountType(acctType);
    setActiveTab("transactions");
  };

  // Trigger state refreshes on dynamic activities
  const handleStateRefresh = () => {
    if (token) {
      syncProfile(token);
    }
  };

  if (!token) {
    return <Login onLoginSuccess={handleLoginSuccess} />;
  }

  return (
    <div 
      className="min-h-screen bg-white flex flex-col font-sans text-[#0a2342] antialiased selection:bg-blue-500 selection:text-white pb-24"
    >
      {/* 1. TOP HEADER BRAND & GRATING EMBED */}
      <Header
        user={user}
        onOpenQuickTransfer={() => setActiveTab("pay")}
        onNavigateToProfile={() => setActiveTab("profile")}
      />

      {/* 2. DYNAMIC WORKSPACE RENDERER */}
      <main id="app-main-viewports" className="flex-1 max-w-lg mx-auto w-full pt-6">
        {loading && !user ? (
          <div className="text-center py-16 text-xs text-slate-400">Syncing sovereign accounting ledger...</div>
        ) : (
          <>
            {activeTab === "accounts" && (
              <AccountsTab
                user={user}
                onSelectAccount={handleSelectAccountFromDashboard}
                onOpenApplyLoan={() => alert("This request is currently offline for geographic routing check.")}
                onOpenSubmitKyc={() => alert("KYC check is manually locked for this Private Account. Please contact support.")}
              />
            )}

            {activeTab === "transactions" && (
              <TransactionsTab
                user={user}
                selectedAccountType={selectedAccountType}
                onAccountTypeChange={(type) => setSelectedAccountType(type)}
              />
            )}

            {activeTab === "pay" && (
              <PayCollectTab
                user={user}
                onTransferSuccess={handleStateRefresh}
              />
            )}

            {activeTab === "profile" && (
              <ProfileTab
                user={user}
                onLogout={handleSignOut}
              />
            )}

          </>
        )}
      </main>

      {/* 4. BOTTOM MOBILE NAVIGATION RAIL - EXACT MATCH OF SCREENSHOTS */}
      <nav id="bottom-navigation-rail" className="fixed bottom-0 inset-x-0 bg-white border-t border-slate-100 py-2 px-3 z-40 shadow-[0_-8px_30px_rgba(0,0,0,0.03)] selection:bg-transparent">
        <div className="max-w-lg mx-auto flex justify-between items-center px-1">
          {/* Tab 1: Accounts */}
          <button
            type="button"
            onClick={() => setActiveTab("accounts")}
            className="flex-1 flex flex-col items-center justify-center pt-1.5 pb-1 relative cursor-pointer"
          >
            <Wallet
              size={20}
              className={`transition-colors shrink-0 ${
                activeTab === "accounts" ? "text-[#1169ca] stroke-[2.2]" : "text-slate-400"
              }`}
            />
            <span
              className={`text-[10px] font-bold mt-1 tracking-tight leading-none ${
                activeTab === "accounts" ? "text-[#1169ca]" : "text-[#718096] font-medium"
              }`}
            >
              Accounts
            </span>
            {/* Selected Blue Dot Underneath select block */}
            {activeTab === "accounts" && (
              <span className="w-1.5 h-1.5 bg-[#1169ca] rounded-full absolute bottom-[-8px]"></span>
            )}
          </button>

          {/* Tab 2: Pay & Collect */}
          <button
            type="button"
            onClick={() => setActiveTab("pay")}
            className="flex-1 flex flex-col items-center justify-center pt-1.5 pb-1 relative cursor-pointer"
          >
            <ArrowLeftRight
              size={20}
              className={`transition-colors shrink-0 ${
                activeTab === "pay" ? "text-[#1169ca] stroke-[2.2]" : "text-slate-400"
              }`}
            />
            <span
              className={`text-[10px] font-bold mt-1 tracking-tight leading-none ${
                activeTab === "pay" ? "text-[#1169ca]" : "text-[#718096] font-medium"
              }`}
            >
              Pay & Collect
            </span>
            {activeTab === "pay" && (
              <span className="w-1.5 h-1.5 bg-[#1169ca] rounded-full absolute bottom-[-8px]"></span>
            )}
          </button>

          {/* Tab 3: Transactions */}
          <button
            type="button"
            onClick={() => setActiveTab("transactions")}
            className="flex-1 flex flex-col items-center justify-center pt-1.5 pb-1 relative cursor-pointer"
          >
            <FileText
              size={20}
              className={`transition-colors shrink-0 ${
                activeTab === "transactions" ? "text-[#1169ca] stroke-[2.2]" : "text-slate-400"
              }`}
            />
            <span
              className={`text-[10px] font-bold mt-1 tracking-tight leading-none ${
                activeTab === "transactions" ? "text-[#1169ca]" : "text-[#718096] font-medium"
              }`}
            >
              Transactions
            </span>
            {activeTab === "transactions" && (
              <span className="w-1.5 h-1.5 bg-[#1169ca] rounded-full absolute bottom-[-8px]"></span>
            )}
          </button>

          {/* Tab 4: Profile */}
          <button
            type="button"
            onClick={() => setActiveTab("profile")}
            className="flex-1 flex flex-col items-center justify-center pt-1.5 pb-1 relative cursor-pointer"
          >
            <UserIcon
              size={20}
              className={`transition-colors shrink-0 ${
                activeTab === "profile" ? "text-[#1169ca] stroke-[2.2]" : "text-slate-400"
              }`}
            />
            <span
              className={`text-[10px] font-bold mt-1 tracking-tight leading-none ${
                activeTab === "profile" ? "text-[#1169ca]" : "text-[#718096] font-medium"
              }`}
            >
              Profile
            </span>
            {activeTab === "profile" && (
              <span className="w-1.5 h-1.5 bg-[#1169ca] rounded-full absolute bottom-[-8px]"></span>
            )}
          </button>


        </div>
      </nav>
    </div>
  );
}
