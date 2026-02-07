"use client";

import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useValidatorServices } from "@/hooks/useValidatorServices";
import {
  Wallet,
  Play,
  Square,
  DollarSign,
  Activity,
  Zap,
  Shield,
  Globe,
} from "lucide-react";

export default function ValidatorMobilePage() {
  const {
    isConnected,
    validatorId,
    walletAddress,
    status,
    logs,
    connectWallet,
    startValidator,
    stopValidator,
    getPendingPayout,
  } = useValidatorServices();

  const getStatusColor = (status: string) => {
    switch (status) {
      case "connected":
        return "bg-green-500/20 text-green-400 border-green-500/30";
      case "connecting":
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case "error":
        return "bg-red-500/20 text-red-400 border-red-500/30";
      default:
        return "bg-gray-500/20 text-gray-400 border-gray-500/30";
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-900 via-slate-800 to-slate-900">
      <div className="container mx-auto p-6 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="p-3 bg-linear-to-r from-blue-500 to-purple-600 rounded-xl">
              <Shield className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl font-bold bg-linear-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
              Uptime Validator
            </h1>
          </div>
          <p className="text-slate-400 text-lg">
            Decentralized website monitoring powered by blockchain
          </p>
        </div>

        {/* Status Grid */}
        <div className="grid gap-6 md:grid-cols-2 mb-8">
          {/* Wallet Status */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/20 rounded-lg">
                <Wallet className="w-5 h-5 text-blue-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Wallet Connection
                </h3>
                <p className="text-slate-400 text-sm">MetaMask integration</p>
              </div>
            </div>

            {!walletAddress ? (
              <Button
                onClick={connectWallet}
                className="w-full bg-linear-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium py-3 rounded-lg transition-all duration-200"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect MetaMask
              </Button>
            ) : (
              <div className="space-y-3">
                <Badge className="bg-green-500/20 text-green-400 border-green-500/30 px-3 py-1">
                  <Zap className="w-3 h-3 mr-1" />
                  Connected
                </Badge>
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-600">
                  <p className="text-xs text-slate-500 mb-1">Address</p>
                  <p className="text-sm text-slate-300 font-mono">
                    {walletAddress.slice(0, 12)}...{walletAddress.slice(-8)}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Validator Status */}
          <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-purple-500/20 rounded-lg">
                <Globe className="w-5 h-5 text-purple-400" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white">
                  Validator Status
                </h3>
                <p className="text-slate-400 text-sm">Network connection</p>
              </div>
            </div>

            <div className="space-y-3">
              <Badge className={`${getStatusColor(status)} px-3 py-1 border`}>
                <Activity className="w-3 h-3 mr-1" />
                {status.toUpperCase()}
              </Badge>

              {validatorId && (
                <div className="bg-slate-900/50 rounded-lg p-3 border border-slate-600">
                  <p className="text-xs text-slate-500 mb-1">Validator ID</p>
                  <p className="text-sm text-slate-300 font-mono">
                    {validatorId.slice(0, 16)}...{validatorId.slice(-8)}
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Controls */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6 mb-8">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-blue-400" />
            Validator Controls
          </h3>

          <div className="flex gap-3 flex-wrap">
            <Button
              onClick={startValidator}
              disabled={!walletAddress || isConnected}
              className="bg-linear-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Play className="w-4 h-4 mr-2" />
              Start Validator
            </Button>

            <Button
              onClick={stopValidator}
              disabled={!isConnected}
              variant="destructive"
              className="bg-linear-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white font-medium px-6 py-3 rounded-lg transition-all duration-200"
            >
              <Square className="w-4 h-4 mr-2" />
              Stop Validator
            </Button>

            <Button
              onClick={getPendingPayout}
              disabled={!isConnected}
              variant="outline"
              className="border-slate-600 text-slate-700 hover:bg-slate-700 hover:text-white font-medium px-6 py-3 rounded-lg transition-all duration-200"
            >
              <DollarSign className="w-4 h-4 mr-2" />
              Check Payout
            </Button>
          </div>
        </div>

        {/* Activity Log */}
        <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700 rounded-xl p-6">
          <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Activity className="w-5 h-5 text-green-400" />
            Activity Log
          </h3>

          <div className="bg-slate-900/80 border border-slate-600 rounded-lg p-4 h-80 overflow-y-auto font-mono text-sm">
            {logs.length === 0 ? (
              <div className="text-slate-500 text-center py-8">
                <Activity className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No activity yet...</p>
                <p className="text-xs mt-1">
                  Connect your wallet and start validating
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {logs.map((log, i) => (
                  <div
                    key={i}
                    className="text-green-400 hover:bg-slate-800/50 px-2 py-1 rounded transition-colors"
                  >
                    {log}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Info Alert */}
        <Alert className="mt-6 bg-blue-500/10 border-blue-500/20 text-blue-300">
          <AlertDescription className="flex items-start gap-2">
            <Shield className="w-4 h-4 mt-0.5 shrink-0" />
            <div>
              <strong className="text-blue-200">Pro Tip:</strong> This validator
              runs in your browser. For best results, keep this tab open and
              your device connected to the internet. For 24/7 operation,
              consider running the CLI validator on a dedicated server.
            </div>
          </AlertDescription>
        </Alert>
      </div>
    </div>
  );
}
