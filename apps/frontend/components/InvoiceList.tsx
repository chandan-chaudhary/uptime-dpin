import React from "react";
import { useInvoices } from "@/hooks/useInvoices";

export function InvoiceList() {
  const { invoices, loading, error } = useInvoices();

  return (
    <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <h2 className="text-2xl font-bold text-slate-100 mb-4">Your Invoices</h2>
      {loading ? (
        <div className="text-slate-300">Loading invoices...</div>
      ) : error ? (
        <div className="text-red-400">{error}</div>
      ) : invoices.length === 0 ? (
        <div className="text-slate-400">No invoices found.</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full bg-slate-800 border border-slate-700 rounded-lg">
            <thead>
              <tr>
                <th className="px-4 py-2 text-left text-slate-300">Amount</th>
                <th className="px-4 py-2 text-left text-slate-300">Amount</th>
                <th className="px-4 py-2 text-left text-slate-300">Currency</th>
                <th className="px-4 py-2 text-left text-slate-300">Status</th>
                <th className="px-4 py-2 text-left text-slate-300">Paid At</th>
                <th className="px-4 py-2 text-left text-slate-300">Tx Hash</th>
              </tr>
            </thead>
            <tbody>
              {invoices.map((inv) => (
                <tr key={inv.id} className="border-t border-slate-700">
                  <td className="px-4 py-2 text-slate-100">{inv.metadata.planId}</td>
                  <td className="px-4 py-2 text-slate-100">{inv.amount}</td>
                  <td className="px-4 py-2 text-slate-100">{inv.currency}</td>
                  <td className="px-4 py-2 text-slate-100">{inv.status}</td>
                  <td className="px-4 py-2 text-slate-100">
                    {inv.paidAt ? new Date(inv.paidAt).toLocaleString() : "-"}
                  </td>
                  <td className="px-4 py-2 text-slate-100">
                    {inv.txHash ? (
                      <a
                        href={`https://etherscan.io/tx/${inv.txHash}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-400 underline"
                      >
                        {inv.txHash.slice(0, 10)}...
                      </a>
                    ) : (
                      "-"
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
