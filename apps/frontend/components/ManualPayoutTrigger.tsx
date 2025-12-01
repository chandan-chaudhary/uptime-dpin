import React, { useState } from "react";
import axios from "axios";
import { Button } from "@/components/ui/button";

export function ManualPayoutTrigger() {
  const [validatorId, setValidatorId] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<string>("");

  async function handlePayout() {
    setLoading(true);
    setResult("");
    try {
      const res = await axios.post(`/api/payments/payout/${validatorId}`);
      if (res.data.success) {
        setResult("Payout successful! TxHash: " + res.data.payout.txHash);
      } else {
        setResult("Error: " + (res.data.error || "Unknown error"));
      }
    } catch (err) {
      setResult(
        "Request failed: " + (err instanceof Error ? err.message : String(err))
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-md mx-auto p-6 bg-slate-800 rounded-lg shadow">
      <h2 className="text-xl font-bold text-white mb-4">
        Manual Payout Trigger
      </h2>
      <input
        type="text"
        className="w-full px-3 py-2 rounded bg-slate-900 text-white border border-slate-700 mb-4"
        placeholder="Enter Validator ID"
        value={validatorId}
        onChange={(e) => setValidatorId(e.target.value)}
      />
      <Button
        className="w-full"
        onClick={handlePayout}
        disabled={loading || !validatorId}
      >
        {loading ? "Processing..." : "Trigger Payout"}
      </Button>
      {result && (
        <div className="mt-4 text-emerald-400 text-center">{result}</div>
      )}
    </div>
  );
}
