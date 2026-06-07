import express from "express";
import path from "path";
import { createServer as createViteServer } from "vite";
import dotenv from "dotenv";
import fs from "fs";

dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json());

// In-Memory Database State
const users: any[] = [
  {
    id: 1,
    account_number: "1000000001",
    first_name: "Admin",
    last_name: "Staff",
    username: "adminia",
    email: "admin@example.com",
    phone: "+1000000000",
    kyc_status: "VERIFIED",
    preferred_currency: "USD",
    balance: 500000.0,
    role: "ADMIN",
    status: "ACTIVE",
    pin: "9999",
    password: "Password123",
  },
  {
    id: 2,
    account_number: "9513639346", // Chase Savings
    second_account_number: "9513637590", // Total Checking
    first_name: "John",
    last_name: "smith",
    surname: "John",
    middle_name: "camo",
    username: "John camo",
    email: "johnprivate677i@gmail.com",
    phone: "",
    kyc_status: "VERIFIED",
    preferred_currency: "USD", // Balance and values should default to USD ($)
    balance: 1730000.0, // Savings + Checking
    savings_balance: 865000.0,
    checking_balance: 865000.0,
    role: "USER",
    status: "ACTIVE",
    pin: "2090",
    password: "cupcake123456",
    date_of_birth: "January 14, 1971",
    country: "United States of America",
    state: "North Carolina",
    city: "charlotte",
    billing_message: "",
    gender: "Male",
    occupation: "contractor",
    full_address: "2205 Terrell Pl",
    picture: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&q=80&w=400",
  },
];

const DATA_FILE = path.join(process.cwd(), "database_state.json");

function saveDatabaseState() {
  try {
    const state = {
      users,
      transfers,
      loans,
      tokens,
      activities,
      transferSimulationMode
    };
    fs.writeFileSync(DATA_FILE, JSON.stringify(state, null, 2), "utf-8");
  } catch (e) {
    console.error("Failed to persist database state:", e);
  }
}

// Seed activities log
let activities = [
  { id: 1, user_id: 2, action: "User Logged In", ip: "192.168.1.50", timestamp: "2026-06-05T10:00:00.000Z" },
  { id: 2, user_id: 2, action: "Viewed Account Summary", ip: "192.168.1.50", timestamp: "2026-06-05T10:15:00.000Z" },
  { id: 3, user_id: 1, action: "System Health Checks", ip: "127.0.0.1", timestamp: "2026-06-05T11:00:00.000Z" },
];

let transfers = [
  {
    id: 99,
    user_id: 2,
    transfer_type: "EXTERNAL",
    amount: 150000.00,
    recipient_name: "KIMBERLY STATZER",
    recipient_bank: "Wells Fargo CLT",
    recipient_account_number: "175920396482",
    description: "Escrow Transfer Verification Pending",
    status: "PENDING",
    created_at: new Date().toISOString(),
    from_account: "checking",
  },
  {
    id: 1,
    user_id: 2,
    transfer_type: "EXTERNAL",
    amount: 150000.00,
    recipient_name: "Sovereign Clearing Credit",
    recipient_bank: "Federal Reserve",
    recipient_account_number: "110294821",
    description: "Federal Contract Credit - John camo",
    status: "COMPLETED",
    created_at: "2026-06-05T09:30:00.000Z",
    from_account: "checking",
  },
  {
    id: 2,
    user_id: 2,
    transfer_type: "EXTERNAL",
    amount: 45000.00,
    recipient_name: "Charlotte Custom Homes",
    recipient_bank: "Bank of America",
    recipient_account_number: "982741029",
    description: "Downpayment - Charlotte Terrell Pl",
    status: "COMPLETED",
    created_at: "2026-06-04T14:20:00.000Z",
    from_account: "checking",
  },
  {
    id: 3,
    user_id: 2,
    transfer_type: "EXTERNAL",
    amount: 25000.00,
    recipient_name: "Escrow Deposit Release",
    recipient_bank: "Wells Fargo Bank",
    recipient_account_number: "721958210",
    description: "Escrow Balance Deposit",
    status: "COMPLETED",
    created_at: "2026-06-03T11:15:00.000Z",
    from_account: "savings",
  },
  {
    id: 4,
    user_id: 2,
    transfer_type: "EXTERNAL",
    amount: 1540.00,
    recipient_name: "Sovereign Tax Board",
    recipient_bank: "NC Treasury",
    recipient_account_number: "882710492",
    description: "Contractor License Settle",
    status: "COMPLETED",
    created_at: "2026-06-02T16:45:00.000Z",
    from_account: "checking",
  },
  {
    id: 5,
    user_id: 2,
    transfer_type: "EXTERNAL",
    amount: 85200.00,
    recipient_name: "JPM Bonus Credit",
    recipient_bank: "JP Morgan Chase",
    recipient_account_number: "9513637590",
    description: "Brokerage Welcome Deposit",
    status: "COMPLETED",
    created_at: "2026-06-01T10:00:00.000Z",
    from_account: "checking",
  },
  {
    id: 6,
    user_id: 2,
    transfer_type: "EXTERNAL",
    amount: 450.00,
    recipient_name: "North Carolina Energy Grid",
    recipient_bank: "Duke Energy",
    recipient_account_number: "662719582",
    description: "Energy Power Billing",
    status: "COMPLETED",
    created_at: "2026-05-30T19:20:00.000Z",
    from_account: "savings",
  },
  {
    id: 7,
    user_id: 2,
    transfer_type: "EXTERNAL",
    amount: 33240.00,
    recipient_name: "Wire Deposit Chase",
    recipient_bank: "Chase Business",
    recipient_account_number: "9513637590",
    description: "Contracting Project Settlement",
    status: "COMPLETED",
    created_at: "2026-05-28T08:15:00.000Z",
    from_account: "checking",
  },
  {
    id: 8,
    user_id: 2,
    transfer_type: "EXTERNAL",
    amount: 28500.00,
    recipient_name: "Equipment Depot LLC",
    recipient_bank: "PNC Bank",
    recipient_account_number: "555192842",
    description: "Steel & Timber Supplies CLT",
    status: "COMPLETED",
    created_at: "2026-05-26T12:00:00.000Z",
    from_account: "checking",
  },
  {
    id: 9,
    user_id: 2,
    transfer_type: "EXTERNAL",
    amount: 15000.00,
    recipient_name: "Federal Loan Disbursement",
    recipient_bank: "Chase Mobile",
    recipient_account_number: "9513637590",
    description: "Disbursement Principal Loan #892",
    status: "COMPLETED",
    created_at: "2026-05-25T14:00:00.000Z",
    from_account: "checking",
  },
  {
    id: 10,
    user_id: 2,
    transfer_type: "EXTERNAL",
    amount: 4250.00,
    recipient_name: "CLT Custom Freight",
    recipient_bank: "SunTrust Bank",
    recipient_account_number: "444210928",
    description: "Clearing Custom Broker Services",
    status: "COMPLETED",
    created_at: "2026-05-24T15:30:00.000Z",
    from_account: "checking",
  }
];

let loans = [
  {
    id: 1,
    user_id: 2,
    requested_amount: 15000.0,
    purpose: "Home Improvement",
    repayment_months: 12,
    monthly_payment: 1300.0,
    interest_rate: 5.5,
    status: "APPROVED",
    disbursement_fee: 100.0,
    disbursement_fee_paid: true,
    disbursed: true,
    created_at: "2026-05-15T14:00:00.000Z",
  },
];

let tokens: Record<string, number> = {
  "a1b2c3d4-e5f6-7a8b-9c0d-e1f2a3b4c5d6": 2, // Pre-seeded token for user 2
};

let transferSimulationMode = "COMPLETED"; // "COMPLETED" | "RESTRICTED" | "OTP_REQUIRED"

// Endpoint to fetch simulated mode
app.get("/api/v1/transfers/simulation-status", (req, res) => {
  res.json({ success: true, mode: transferSimulationMode });
});

// Endpoint to update simulated mode
app.post("/api/v1/transfers/simulation-status-update", (req, res) => {
  const { mode } = req.body;
  if (["COMPLETED", "RESTRICTED", "OTP_REQUIRED"].includes(mode)) {
    transferSimulationMode = mode;
    res.json({ success: true, mode: transferSimulationMode });
  } else {
    res.status(400).json({ success: false, message: "Invalid simulation mode" });
  }
});

// Helper middleware for Auth
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction) {
  try {
    const authHeader = req.headers["authorization"];
    const token = authHeader && authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({ success: false, message: "Missing token" });
    }

    const userId = tokens[token];
    if (!userId) {
      return res.status(403).json({ success: false, message: "Invalid or expired token" });
    }

    const user = users.find((u) => u.id === userId);
    if (!user) {
      return res.status(404).json({ success: false, message: "User not found" });
    }

    (req as any).user = user;
    next();
  } catch (error: any) {
    console.error("Error in authenticateToken middleware:", error);
    res.status(500).json({ success: false, message: "Authentication internal server error", error: String(error) });
  }
}

function requireAdmin(req: express.Request, res: express.Response, next: express.NextFunction) {
  const user = (req as any).user;
  if (user?.role !== "ADMIN") {
    return res.status(403).json({ success: false, message: "Access denied. Admins only." });
  }
  next();
}

// Ensure CORS Headers for preflight and standard requests
app.use((req, res, next) => {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Headers", "Authorization, Content-Type, Accept");
  res.header("Access-Control-Allow-Methods", "GET, POST, PUT, DELETE, PATCH, OPTIONS");
  if (req.method === "OPTIONS") {
    return res.sendStatus(200);
  }
  next();
});

// ========================
// API Endpoints
// ========================

// 🔑 Authentication Endpoints
app.post("/api/v1/auth/login", (req, res) => {
  const { email, password } = req.body;
  const user = users.find((u) => u.email === email && u.password === password);

  if (!user) {
    return res.status(400).json({ success: false, message: "Invalid email or password" });
  }

  const token = Math.random().toString(36).substring(2) + "-" + Math.random().toString(36).substring(2);
  tokens[token] = user.id;

  // Log activity
  activities.push({
    id: activities.length + 1,
    user_id: user.id,
    action: `User Logged In (${email})`,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: "Login successful",
    data: {
      token,
      expires_at: new Date(Date.now() + 3600000).toISOString(),
      user: {
        id: user.id,
        email: user.email,
        first_name: user.first_name,
        last_name: user.last_name,
        role: user.role,
        account_number: user.account_number,
      },
    },
  });
});

app.get("/api/v1/auth/me", authenticateToken, (req, res) => {
  const user = (req as any).user;
  res.json({
    success: true,
    message: "Current user fetched",
    data: {
      id: user.id,
      account_number: user.account_number,
      second_account_number: user.second_account_number || "9513637590",
      first_name: user.first_name,
      last_name: user.last_name,
      surname: user.surname,
      middle_name: user.middle_name,
      username: user.username,
      email: user.email,
      phone: user.phone,
      kyc_status: user.kyc_status,
      preferred_currency: user.preferred_currency,
      balance: user.balance,
      savings_balance: user.savings_balance ?? user.balance * 0.3,
      checking_balance: user.checking_balance ?? user.balance * 0.7,
      role: user.role,
      status: user.status,
      date_of_birth: user.date_of_birth,
      country: user.country,
      state: user.state,
      city: user.city,
      billing_message: user.billing_message,
      gender: user.gender,
      occupation: user.occupation,
      full_address: user.full_address,
      picture: user.picture,
      password: user.password,
      pin: user.pin,
    },
  });
});

app.post("/api/v1/auth/logout", authenticateToken, (req, res) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ")[1];
  if (token) {
    delete tokens[token];
  }
  res.json({
    success: true,
    message: "Logout successful",
    data: null,
  });
});

// 👤 User & Profile Endpoints
app.post("/api/v1/users/register", (req, res) => {
  const { first_name, last_name, username, email, phone, password } = req.body;

  if (!email || !password || !first_name || !last_name) {
    return res.status(400).json({ success: false, message: "Missing required fields" });
  }

  if (users.find((u) => u.email === email)) {
    return res.status(400).json({ success: false, message: "Email is already registered" });
  }

  const generatedAccountNumber = "9513" + Math.floor(100000 + Math.random() * 900000).toString();
  const generatedSecondAccountNumber = "9513" + Math.floor(100000 + Math.random() * 900000).toString();

  const newUser = {
    id: users.length + 1,
    account_number: generatedAccountNumber,
    second_account_number: generatedSecondAccountNumber,
    first_name,
    last_name,
    username: username || first_name.toLowerCase() + Math.floor(10 + Math.random() * 90),
    email,
    phone: phone || "+1" + Math.floor(1000000000 + Math.random() * 9000000000),
    kyc_status: "PENDING",
    preferred_currency: "USD",
    balance: 5000.0, // Free Seed Balance
    savings_balance: 1500.0,
    checking_balance: 3500.0,
    role: "USER",
    status: "ACTIVE",
    pin: "1234",
    password,
  };

  users.push(newUser);

  res.json({
    success: true,
    message: "User registered successfully",
    data: {
      id: newUser.id,
      account_number: newUser.account_number,
      second_account_number: newUser.second_account_number,
      first_name: newUser.first_name,
      last_name: newUser.last_name,
      email: newUser.email,
      username: newUser.username,
      phone: newUser.phone,
    },
  });
});

app.post("/api/v1/users/transfer-pin", authenticateToken, (req, res) => {
  const user = (req as any).user;
  const { pin } = req.body;
  if (!pin) {
    return res.status(400).json({ success: false, message: "PIN is required" });
  }
  user.pin = pin;

  activities.push({
    id: activities.length + 1,
    user_id: user.id,
    action: `Updated Transfer PIN`,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, message: "Transfer PIN updated successfully" });
});

app.post("/api/v1/users/kyc", authenticateToken, (req, res) => {
  const user = (req as any).user;
  const { government_id_number, id_front_image, id_back_image } = req.body;

  if (!government_id_number) {
    return res.status(400).json({ success: false, message: "Government ID number is required" });
  }

  user.kyc_status = "PENDING";
  user.government_id_number = government_id_number;
  user.kyc_submitted_at = new Date().toISOString();

  activities.push({
    id: activities.length + 1,
    user_id: user.id,
    action: `Submitted KYC Verification Documents`,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, message: "KYC details submitted successfully", status: "PENDING" });
});

app.patch("/api/v1/users/kyc/:userId", authenticateToken, requireAdmin, (req, res) => {
  const targetId = parseInt(req.params.userId || "");
  const { status } = req.body;

  if (!["PENDING", "VERIFIED", "REJECTED"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid status option" });
  }

  const targetUser = users.find((u) => u.id === targetId);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  targetUser.kyc_status = status;

  activities.push({
    id: activities.length + 1,
    user_id: (req as any).user.id,
    action: `Admin updated User ID ${targetId} KYC Status to ${status}`,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, message: `KYC Status successfully updated to ${status}` });
});

app.patch("/api/v1/users/:userId", authenticateToken, requireAdmin, (req, res) => {
  const targetId = parseInt(req.params.userId || "");
  const { balance } = req.body;

  if (balance === undefined || isNaN(balance)) {
    return res.status(400).json({ success: false, message: "Valid balance value is required" });
  }

  const targetUser = users.find((u) => u.id === targetId);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  targetUser.balance = parseFloat(balance);
  targetUser.checking_balance = targetUser.balance * 0.7;
  targetUser.savings_balance = targetUser.balance * 0.3;

  activities.push({
    id: activities.length + 1,
    user_id: (req as any).user.id,
    action: `Admin directly adjusted User ID ${targetId} wallet balance to $${balance}`,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, message: "User balance adjusted successfully", balance: targetUser.balance });
});

// 💸 Money Transfer Endpoints
app.post("/api/v1/transfers", authenticateToken, (req, res) => {
  const user = (req as any).user;
  const {
    transfer_type,
    recipient_account_number,
    amount,
    pin,
    description,
    recipient_name,
    recipient_bank,
    from_account, // "savings" or "checking"
  } = req.body;

  if (!transfer_type || !amount || !pin) {
    return res.status(400).json({ success: false, message: "Missing transfer details (type, amount, pin)" });
  }

  if (user.pin !== pin) {
    return res.status(403).json({ success: false, message: "Incorrect secure transaction PIN" });
  }

  const amtValue = parseFloat(amount || "0");

  const newTransfer = {
    id: transfers.length + 1,
    user_id: user.id,
    transfer_type: transfer_type || "EXTERNAL",
    amount: amtValue,
    recipient_name: recipient_name || recipient_account_number || "Self Transfer",
    recipient_bank: recipient_bank || "JPM Bank",
    recipient_account_number: recipient_account_number || "Internal Ledger",
    description: description || "Capital Outflow Wire",
    status: "PENDING",
    created_at: new Date().toISOString(),
    from_account: from_account || "checking",
  };

  transfers.push(newTransfer);
  saveDatabaseState();

  // Return restricted holding response with requested custom text message
  return res.status(200).json({
    success: false,
    status: "RESTRICTED",
    message: "Outbound Wire Restriction Active. Outgoing transfers from this account are restricted due to geographic and verification requirements.",
    error_code: "ERR-REG-GEO-902",
    details: "This account currently has transfer restrictions due to geographic verification requirements and additional account compliance reviews. To complete this transfer, please contact your assigned Account Officer or Customer Support for verification assistance."
  });
});

app.get("/api/v1/transfers", authenticateToken, (req, res) => {
  const user = (req as any).user;
  const userTransfers = transfers.filter((t) => t.user_id === user.id);
  res.json({
    success: true,
    message: "Transfers fetched successfully",
    data: userTransfers,
  });
});

app.get("/api/v1/transfers/:transferId/receipt", authenticateToken, (req, res) => {
  const tId = parseInt(req.params.transferId || "");
  const transfer = transfers.find((t) => t.id === tId);

  if (!transfer) {
    return res.status(404).json({ success: false, message: "Receipt record not found" });
  }

  res.json({
    success: true,
    message: "Receipt details found",
    data: transfer,
  });
});

app.patch("/api/v1/transfers/:transferId", authenticateToken, requireAdmin, (req, res) => {
  const tId = parseInt(req.params.transferId || "");
  const { status } = req.body;

  if (!["PENDING", "COMPLETED", "REJECTED", "FAILED"].includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid transfer status" });
  }

  const transfer = transfers.find((t) => t.id === tId);
  if (!transfer) {
    return res.status(404).json({ success: false, message: "Transfer not found" });
  }

  transfer.status = status;

  activities.push({
    id: activities.length + 1,
    user_id: (req as any).user.id,
    action: `Admin toggled Transfer ID ${tId} status to ${status}`,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, message: `Transfer status updated successfully to ${status}` });
});

// 📊 Transactions & Ledger Endpoints
app.post("/api/v1/transactions", authenticateToken, (req, res) => {
  // Directly write a debit or credit entry
  const { user_id, type, amount, category, description } = req.body;
  const targetId = parseInt(user_id || "");

  const targetUser = users.find((u) => u.id === targetId);
  if (!targetUser) {
    return res.status(404).json({ success: false, message: "User not found" });
  }

  const amt = parseFloat(amount);
  if (type === "CREDIT") {
    targetUser.balance += amt;
    targetUser.checking_balance = (targetUser.checking_balance || 0) + amt;
  } else {
    targetUser.balance -= amt;
    targetUser.checking_balance = (targetUser.checking_balance || 0) - amt;
  }

  const newTransfer = {
    id: transfers.length + 1,
    user_id: targetId,
    transfer_type: "INTERNAL",
    amount: amt,
    recipient_name: type === "CREDIT" ? "Credit Deposit Ledger" : "Debit Ledger",
    recipient_bank: "Chase Mobile",
    recipient_account_number: targetUser.account_number,
    description: description || `${category || "Ledger Entry"}`,
    status: "COMPLETED",
    created_at: new Date().toISOString(),
    from_account: "checking",
  };

  transfers.push(newTransfer);

  res.json({ success: true, message: "Transaction completed", data: newTransfer });
});

app.get("/api/v1/transactions/user/:userId", authenticateToken, (req, res) => {
  const targetId = parseInt(req.params.userId || "");
  const userTransfers = transfers.filter((t) => t.user_id === targetId);
  res.json({
    success: true,
    message: "User transactions fetched",
    data: userTransfers,
  });
});

app.post("/api/v1/transactions/batch", authenticateToken, requireAdmin, (req, res) => {
  const { transactions } = req.body;
  if (!Array.isArray(transactions)) {
    return res.status(400).json({ success: false, message: "Body must contain transactions array" });
  }

  transactions.forEach((tx: any) => {
    const target = users.find((u) => u.id === parseInt(tx.user_id));
    if (target) {
      const amt = parseFloat(tx.amount);
      if (tx.type === "CREDIT") {
        target.balance += amt;
        target.checking_balance = (target.checking_balance || 0) + amt;
      } else {
        target.balance -= amt;
        target.checking_balance = (target.checking_balance || 0) - amt;
      }

      transfers.push({
        id: transfers.length + 1,
        user_id: target.id,
        transfer_type: "INTERNAL",
        amount: amt,
        recipient_name: tx.type === "CREDIT" ? "Batch Deposit" : "Batch Debit",
        recipient_bank: "Chase Mobile",
        recipient_account_number: target.account_number,
        description: tx.description || "Batch Transaction",
        status: "COMPLETED",
        created_at: new Date().toISOString(),
        from_account: "checking",
      });
    }
  });

  res.json({ success: true, message: `Batch loaded successfully with ${transactions.length} entries` });
});

// 🏦 Loan Application Endpoints
app.post("/api/v1/loans", authenticateToken, (req, res) => {
  const user = (req as any).user;

  if (user.kyc_status !== "VERIFIED") {
    return res.status(403).json({
      success: false,
      message: "Loan applications require KYC verification status to be VERIFIED. Current: " + user.kyc_status,
    });
  }

  const { requested_amount, purpose, repayment_months, monthly_payment, interest_rate } = req.body;

  if (!requested_amount || !purpose || !repayment_months) {
    return res.status(400).json({ success: false, message: "Missing required loan application parameters" });
  }

  const newLoan = {
    id: loans.length + 1,
    user_id: user.id,
    requested_amount: parseFloat(requested_amount),
    purpose,
    repayment_months: parseInt(repayment_months),
    monthly_payment: parseFloat(monthly_payment) || (requested_amount * 1.05) / repayment_months,
    interest_rate: parseFloat(interest_rate) || 6.5,
    status: "AWAITING_DISBURSEMENT_FEE",
    disbursement_fee: 150.0,
    disbursement_fee_paid: false,
    disbursed: false,
    created_at: new Date().toISOString(),
  };

  loans.push(newLoan);

  activities.push({
    id: activities.length + 1,
    user_id: user.id,
    action: `Submitted Loan Application for $${requested_amount} (Auto-Approved, Awaiting Collateral Fee)`,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString(),
  });

  res.json({
    success: true,
    message: "Your loan application is approved! Please authorize the $150.00 administrative disbursement fee to release funds.",
    data: newLoan,
  });
});

app.get("/api/v1/loans/user/:userId", authenticateToken, (req, res) => {
  const targetId = parseInt(req.params.userId || "");
  const userLoans = loans.filter((l) => l.user_id === targetId);
  res.json({
    success: true,
    message: "Loans fetched successfully",
    data: userLoans,
  });
});

app.patch("/api/v1/loans/:loanId", authenticateToken, requireAdmin, (req, res) => {
  const loanId = parseInt(req.params.loanId || "");
  const { status } = req.body;

  const validStatuses = [
    "PENDING",
    "APPROVED",
    "AWAITING_DISBURSEMENT_FEE",
    "READY_FOR_DISBURSEMENT",
    "DISBURSED",
    "REJECTED",
  ];

  if (!validStatuses.includes(status)) {
    return res.status(400).json({ success: false, message: "Invalid loan status value" });
  }

  const loan = loans.find((l) => l.id === loanId);
  if (!loan) {
    return res.status(404).json({ success: false, message: "Loan application not found" });
  }

  loan.status = status;

  activities.push({
    id: activities.length + 1,
    user_id: (req as any).user.id,
    action: `Admin updated Loan ID ${loanId} status to ${status}`,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, message: `Loan status modernized to ${status}`, data: loan });
});

app.patch("/api/v1/loans/:loanId/fee", authenticateToken, requireAdmin, (req, res) => {
  const loanId = parseInt(req.params.loanId || "");
  const { disbursement_fee } = req.body;

  const loan = loans.find((l) => l.id === loanId);
  if (!loan) {
    return res.status(404).json({ success: false, message: "Loan not found" });
  }

  loan.disbursement_fee = parseFloat(disbursement_fee);
  loan.status = "AWAITING_DISBURSEMENT_FEE";

  res.json({ success: true, message: `Disbursement fee applied successfully`, data: loan });
});

app.patch("/api/v1/loans/:loanId/confirm-fee", authenticateToken, (req, res) => {
  const user = (req as any).user;
  const loanId = parseInt(req.params.loanId || "");

  const loan = loans.find((l) => l.id === loanId && l.user_id === user.id);
  if (!loan) {
    return res.status(404).json({ success: false, message: "Loan record not found for this authenticated session" });
  }

  // Deduct the disbursement fee from checking if they have enough, otherwise savings, or just approve it!
  const fee = loan.disbursement_fee || 150.00;
  if (user.checking_balance >= fee) {
    user.checking_balance -= fee;
    user.balance -= fee;
  } else if (user.savings_balance >= fee) {
    user.savings_balance -= fee;
    user.balance -= fee;
  } else {
    return res.status(400).json({ success: false, message: `Insufficient balance to cover administrative collateral fee of $${fee}.` });
  }

  loan.disbursement_fee_paid = true;
  loan.status = "READY_FOR_DISBURSEMENT";

  activities.push({
    id: activities.length + 1,
    user_id: user.id,
    action: `Paid Sovereign Loan #${loan.id} Administrative Clearance Fee`,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, message: "Administrative disbursement fee paid successfully! Your loan capital is ready to be released.", data: loan });
});

app.patch("/api/v1/loans/:loanId/disburse", authenticateToken, (req, res) => {
  const user = (req as any).user;
  const loanId = parseInt(req.params.loanId || "");

  const loan = loans.find((l) => l.id === loanId && l.user_id === user.id);
  if (!loan) {
    return res.status(404).json({ success: false, message: "Loan not found" });
  }

  if (loan.disbursed) {
    return res.status(400).json({ success: false, message: "Loan has already been disembarked into checking balance" });
  }

  // Credit the user
  user.checking_balance = (user.checking_balance || 0) + loan.requested_amount;
  user.balance += loan.requested_amount;

  // Log credit transaction
  transfers.push({
    id: transfers.length + 1,
    user_id: user.id,
    transfer_type: "INTERNAL",
    amount: loan.requested_amount,
    recipient_name: `${user.first_name} ${user.last_name}`,
    recipient_bank: "Chase Mobile",
    recipient_account_number: user.second_account_number || "9513637590",
    description: `Sovereign Loan Disbursement #${loan.id}: ${loan.purpose}`,
    status: "COMPLETED",
    created_at: new Date().toISOString(),
    from_account: "checking",
  });

  loan.disbursed = true;
  loan.status = "DISBURSED";

  activities.push({
    id: activities.length + 1,
    user_id: user.id,
    action: `Approved self-disbursement of Sovereign Loan #${loan.id} into checking portfolio`,
    ip: req.ip || "127.0.0.1",
    timestamp: new Date().toISOString(),
  });

  res.json({ success: true, message: "Loan capital successfully credited and cleared into your main checking account!", data: loan });
});

// 📈 Activity Logging Endpoints
app.get("/api/v1/activities", authenticateToken, (req, res) => {
  const user = (req as any).user;
  const userLogs = activities.filter((a) => a.user_id === user.id);
  res.json({
    success: true,
    message: "Activity log retrieved",
    data: userLogs.sort((a, b) => b.id - a.id),
  });
});

function loadDatabaseState() {
  try {
    if (fs.existsSync(DATA_FILE)) {
      const fileContent = fs.readFileSync(DATA_FILE, "utf-8");
      const state = JSON.parse(fileContent);
      if (state.users) {
        users.length = 0;
        users.push(...state.users);
      }
      if (state.transfers) {
        transfers.length = 0;
        transfers.push(...state.transfers);
      }
      if (state.loans) {
        loans.length = 0;
        loans.push(...state.loans);
      }
      if (state.tokens) {
        for (const key in tokens) delete tokens[key];
        Object.assign(tokens, state.tokens);
      }
      if (state.activities) {
        activities.length = 0;
        activities.push(...state.activities);
      }
      if (state.transferSimulationMode !== undefined) {
        transferSimulationMode = state.transferSimulationMode;
      }
      console.log("Database state successfully restored from local backup.");
    }
  } catch (e) {
    console.error("Failed to load initial database state:", e);
  }
}

// ========================
// Vite / Static Assets
// ========================
const isProd = process.env.NODE_ENV === "production";

async function setupApp() {
  loadDatabaseState();

  if (!isProd) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res, next) => {
      // Prevent mapping missed API routes to index.html SPA fallback
      if (req.path.startsWith("/api/")) {
        return res.status(404).json({ success: false, message: "API endpoint not found" });
      }
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  // Global Error Handler for API routes
  app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error("Global Express Error Caught:", err);
    if (res.headersSent) {
      return next(err);
    }
    // Check if the request is an API request
    if (req.path.startsWith("/api/")) {
      return res.status(err.status || 500).json({
        success: false,
        message: err.message || "An internal server error occurred.",
        error: String(err)
      });
    }
    next(err);
  });

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT}`);
  });
}

setupApp();
