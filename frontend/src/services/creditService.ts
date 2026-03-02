import axios from './axios';

export interface CreditBalance {
  credits: number;
  balance: number;
  currency: string;
  user: {
    name?: string;
    email?: string;
  };
}

export interface CreditTransaction {
  _id: string;
  txId?: string;
  type: 'topup' | 'transfer' | 'consume' | 'refund' | 'adjust' | 'earned' | 'spent' | 'bonus';
  amount: number;
  balanceAfter: number;
  description: string;
  status: 'pending' | 'completed' | 'failed' | 'cancelled';
  receiverId?: string;
  receiverEmail?: string;
  receiverPhone?: string;
  senderId?: string;
  hideSender?: boolean;
  note?: string;
  paymentIntentId?: string;
  paymentMethod?: string;
  relatedEntity?: string;
  relatedEntityId?: string;
  createdAt: string;
  completedAt?: string;
}

export interface TransferLimits {
  minAmount: number;
  maxAmount: number;
  dailyLimit: number;
  hourlyLimit: number;
  dailyUsed: number;
  hourlyUsed: number;
}

export interface TopupRequest {
  amount: number;
  paymentMethod?: string;
  idempotencyKey?: string;
}

export interface TransferRequest {
  receiverId?: string;
  receiverEmail?: string;
  receiverPhone?: string;
  amount: number;
  hideSender?: boolean;
  note?: string;
  idempotencyKey?: string;
}

// Get user's credit balance
export const getCreditBalance = async (): Promise<CreditBalance> => {
  try {
    const res = await axios.get('/credits/balance');
    return res.data;
  } catch (error: any) {
    console.error('Error fetching credit balance:', error);
    throw error;
  }
};

// Get credit transaction history
export const getCreditTransactions = async (
  type?: string,
  limit: number = 50
): Promise<CreditTransaction[]> => {
  try {
    const params: any = { limit };
    if (type) params.type = type;
    
    const res = await axios.get('/credits/transactions', { params });
    return res.data || [];
  } catch (error: any) {
    console.error('Error fetching credit transactions:', error);
    return [];
  }
};

// Initiate credit top-up
export const initiateTopup = async (data: TopupRequest): Promise<any> => {
  try {
    const res = await axios.post('/v1/credits/topup', data);
    return res.data;
  } catch (error: any) {
    console.error('Error initiating top-up:', error);
    throw error;
  }
};

// Get top-up status
export const getTopupStatus = async (paymentIntentId: string): Promise<any> => {
  try {
    const res = await axios.get(`/v1/credits/topup/${paymentIntentId}`);
    return res.data;
  } catch (error: any) {
    console.error('Error fetching top-up status:', error);
    throw error;
  }
};

// Transfer credits to another user
export const transferCredits = async (data: TransferRequest): Promise<any> => {
  try {
    const res = await axios.post('/v1/credits/transfer', data);
    return res.data;
  } catch (error: any) {
    console.error('Error transferring credits:', error);
    throw error;
  }
};

// Get transfer limits
export const getTransferLimits = async (): Promise<TransferLimits> => {
  try {
    const res = await axios.get('/v1/credits/transfer/limits');
    return res.data;
  } catch (error: any) {
    console.error('Error fetching transfer limits:', error);
    throw error;
  }
};

// Format transaction type for display
export const formatTransactionType = (type: string): string => {
  const typeMap: Record<string, string> = {
    topup: 'Top-up',
    transfer: 'Transfer',
    consume: 'Purchase',
    refund: 'Refund',
    adjust: 'Adjustment',
    earned: 'Earned',
    spent: 'Spent',
    bonus: 'Bonus',
  };
  return typeMap[type] || type;
};

// Format transaction status
export const formatTransactionStatus = (status: string): string => {
  const statusMap: Record<string, string> = {
    pending: 'Pending',
    completed: 'Completed',
    failed: 'Failed',
    cancelled: 'Cancelled',
  };
  return statusMap[status] || status;
};

// Format currency
export const formatCurrency = (amount: number, currency: string = 'SAR'): string => {
  return `${currency} ${amount.toFixed(2)}`;
};

// Format date
export const formatTransactionDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};
