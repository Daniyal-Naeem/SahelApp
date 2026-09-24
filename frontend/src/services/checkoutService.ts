import axios from './axios';
import {createOrder, OrderItemInput, ShippingAddress} from './orderService';
import {clearCartApi} from './cartService';

/**
 * Full credit checkout:
 * 1) create order
 * 2) apply credit reservation
 * 3) complete with paymentStatus=paid (debits wallet)
 * 4) clear server cart
 */
export const checkoutWithCredits = async (payload: {
  items: OrderItemInput[];
  shippingAddress?: ShippingAddress;
  totalAmount: number;
  creditAmount: number;
  notes?: string;
}) => {
  const orderResult = await createOrder({
    items: payload.items,
    shippingAddress: payload.shippingAddress,
    paymentMethod: 'credit',
    notes: payload.notes,
  });

  const order = orderResult.order || orderResult;
  const orderId = order._id;

  const applyRes = await axios.post('/v1/checkout/apply-credit', {
    orderId,
    creditAmount: payload.creditAmount,
    totalAmount: payload.totalAmount,
  });

  const reservationTxId = applyRes.data?.reservation?.txId;

  const completeRes = await axios.post('/v1/checkout/complete', {
    orderId,
    reservationTxId,
    paymentMethod: 'credit',
    paymentStatus: 'paid',
  });

  try {
    await clearCartApi();
  } catch {
    // Non-fatal if cart clear fails after payment
  }

  return {
    order: completeRes.data?.order || order,
    balance: completeRes.data?.balance,
    reservation: applyRes.data?.reservation,
  };
};

export const getWalletBalance = async (): Promise<number> => {
  const res = await axios.get('/credits/balance');
  return res.data.balance ?? res.data.credits ?? 0;
};
