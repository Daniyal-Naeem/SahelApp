import axios from './axios';

export const demoTopupCredits = async (amount: number) => {
  const res = await axios.post('/v1/credits/topup/demo', {amount});
  return res.data;
};

export const getMyGiftCards = async () => {
  const res = await axios.get('/gift-cards');
  return Array.isArray(res.data) ? res.data : [];
};

export const redeemGiftCode = async (code: string) => {
  const res = await axios.post(`/gift-cards/${encodeURIComponent(code)}/redeem`, {});
  return res.data;
};

export const sendGiftToEmail = async (payload: {
  email: string;
  amount: number;
  message?: string;
}) => {
  const res = await axios.post('/gift-cards/send', payload);
  return res.data;
};
