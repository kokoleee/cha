export interface User {
  id: number;
  account_number: string;
  second_account_number?: string;
  first_name: string;
  last_name: string;
  surname?: string;
  middle_name?: string;
  username: string;
  email: string;
  phone: string;
  kyc_status: "PENDING" | "VERIFIED" | "REJECTED";
  preferred_currency: string;
  balance: number;
  savings_balance: number;
  checking_balance: number;
  role: "USER" | "ADMIN";
  status: "ACTIVE" | "INACTIVE";
  date_of_birth?: string;
  country?: string;
  state?: string;
  city?: string;
  gender?: string;
  occupation?: string;
  full_address?: string;
  billing_message?: string;
  password?: string;
  pin?: string;
  picture?: string;
}

export interface Transfer {
  id: number;
  user_id: number;
  transfer_type: "INTERNAL" | "EXTERNAL";
  amount: number;
  recipient_name: string;
  recipient_bank?: string;
  recipient_account_number: string;
  description: string;
  status: "PENDING" | "COMPLETED" | "REJECTED" | "FAILED";
  created_at: string;
  from_account: "savings" | "checking";
}

export interface Loan {
  id: number;
  user_id: number;
  requested_amount: number;
  purpose: string;
  repayment_months: number;
  monthly_payment: number;
  interest_rate: number;
  status: "PENDING" | "APPROVED" | "AWAITING_DISBURSEMENT_FEE" | "READY_FOR_DISBURSEMENT" | "DISBURSED" | "REJECTED";
  disbursement_fee: number;
  disbursement_fee_paid: boolean;
  disbursed: boolean;
  created_at: string;
}

export interface Activity {
  id: number;
  user_id: number;
  action: string;
  ip: string;
  timestamp: string;
}
