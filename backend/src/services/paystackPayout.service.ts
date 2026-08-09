import axios from "axios";

const PAYSTACK_API = process.env.PAYSTACK_API || "https://api.paystack.co";

const authHeaders = () => ({
  Authorization: `Bearer ${process.env.PAYSTACK_SECRET_KEY}`,
  "Content-Type": "application/json",
});

/** Platform commission (percent the main account keeps from each vendor sale). */
export const platformCommissionPercent = (): number => {
  const v = Number(process.env.PLATFORM_COMMISSION_PERCENT);
  return Number.isFinite(v) && v >= 0 && v <= 100 ? v : 10;
};

/** List Nigerian banks (for the vendor bank-select dropdown). */
export const listBanks = async () => {
  const { data } = await axios.get(`${PAYSTACK_API}/bank?country=nigeria`, {
    headers: authHeaders(),
  });
  return (data?.data ?? []).map((b: any) => ({ name: b.name, code: b.code }));
};

/** Verify an account number resolves at the given bank; returns the account name. */
export const resolveAccount = async (
  accountNumber: string,
  bankCode: string
): Promise<string> => {
  const { data } = await axios.get(
    `${PAYSTACK_API}/bank/resolve?account_number=${accountNumber}&bank_code=${bankCode}`,
    { headers: authHeaders() }
  );
  return data?.data?.account_name as string;
};

/** Create a subaccount so payments can be split to this vendor automatically. */
export const createSubaccount = async (params: {
  businessName: string;
  bankCode: string;
  accountNumber: string;
}): Promise<string> => {
  const { data } = await axios.post(
    `${PAYSTACK_API}/subaccount`,
    {
      business_name: params.businessName,
      settlement_bank: params.bankCode,
      account_number: params.accountNumber,
      percentage_charge: platformCommissionPercent(),
    },
    { headers: authHeaders() }
  );
  return data?.data?.subaccount_code as string;
};
