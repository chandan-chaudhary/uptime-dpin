import { useState, useEffect } from "react";
import axios from "axios";

export interface Invoice {
  id: string;
  amount: number;
  currency: string;
  status: string;
  paidAt?: string;
  txHash?: string;
  createdAt: string;
  paidByPublicKey?: string;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  metadata?: any;
}

export function useInvoices() {
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    const fetchInvoices = async () => {
      setLoading(true);
      try {
        const res = await axios.get("/api/invoices");
        setInvoices(res.data.invoices || []);
      } catch {
        setError("Failed to load invoices");
      } finally {
        setLoading(false);
      }
    };
    fetchInvoices();
  }, []);

  return { invoices, loading, error };
}
