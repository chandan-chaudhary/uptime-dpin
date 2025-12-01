"use client";

import { Card, CardContent } from "@/components/ui/card";
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from "@/components/ui/accordion";
import {
  Activity,
  Globe,
  Clock,
  TrendingUp,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from "lucide-react";
import { useWebsites } from "@/hooks/useWebsites";
import { useProcessedWebsites } from "@/hooks/useProcessedWebsites";
import { AddWebsiteModal } from "@/components/AddWebsiteModal";
import { InvoiceList } from "@/components/InvoiceList";
import { SubscriptionBadge } from "@/components/SubscriptionBadge";
import { useSubscription } from "@/hooks/useSubscription";
import { getStatusColor, getRelativeTime } from "@/lib/dashboardUtils";

export default function DashboardPage() {
  const { websites, loading } = useWebsites();
  const { subscription } = useSubscription();
  const processedWebsites = useProcessedWebsites(websites);

  const getStatusIcon = (status: "Good" | "Bad") => {
    return status === "Good" ? (
      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
    ) : (
      <XCircle className="h-4 w-4 text-red-500" />
    );
  };

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        <div className="flex items-center justify-center h-64">
          <div className="flex items-center gap-3">
            <Activity className="h-6 w-6 animate-pulse text-emerald-500" />
            <span className="text-lg text-slate-300">Loading dashboard...</span>
          </div>
        </div>
      </div>
    );
  }

  //   if (error) {
  //     return (
  //       <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
  //         <Card className="bg-red-500/10 border-red-500/50">
  //           <CardContent className="pt-6">
  //             <div className="flex items-center gap-3">
  //               <AlertCircle className="h-6 w-6 text-red-400" />
  //               <div>
  //                 <h3 className="text-lg font-semibold text-red-400">Error</h3>
  //                 <p className="text-red-300">{error}</p>
  //               </div>
  //             </div>
  //           </CardContent>
  //         </Card>
  //       </div>
  //     );
  //   }

  return (
    <>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-3">
              <Activity className="h-8 w-8 text-emerald-500" />
              <h1 className="text-4xl font-bold text-slate-100">Dashboard</h1>
              {subscription && <SubscriptionBadge plan={subscription.plan} />}
            </div>
            <AddWebsiteModal />
          </div>
          <p className="text-slate-400">
            Monitor all your websites in one place
          </p>
          {subscription && !subscription.isActive && subscription.expiresAt && (
            <div className="mt-4 p-3 bg-orange-500/10 border border-orange-500/30 rounded-lg">
              <p className="text-sm text-orange-400">
                Your subscription expired on{" "}
                {new Date(subscription.expiresAt).toLocaleDateString()}. Please
                renew to continue monitoring.
              </p>
            </div>
          )}
        </div>

        {/* Stats Overview */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <Card className="bg-slate-900/50 border-slate-800 hover:border-blue-500/50 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Total Websites</p>
                  <p className="text-3xl font-bold text-slate-100">
                    {processedWebsites.length}
                  </p>
                </div>
                <Globe className="h-8 w-8 text-blue-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Operational</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {
                      processedWebsites.filter((w) => w.status === "Good")
                        .length
                    }
                  </p>
                </div>
                <CheckCircle2 className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-red-500/50 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Issues</p>
                  <p className="text-3xl font-bold text-red-400">
                    {
                      processedWebsites.filter(
                        (w) => w.status === "Bad" || w.status === "Degraded"
                      ).length
                    }
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-red-400" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/50 transition-all">
            <CardContent className="pt-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-slate-400">Avg Uptime</p>
                  <p className="text-3xl font-bold text-emerald-400">
                    {processedWebsites.length > 0
                      ? (
                          processedWebsites.reduce(
                            (acc, w) => acc + w.uptime,
                            0
                          ) / processedWebsites.length
                        ).toFixed(1)
                      : 0}
                    %
                  </p>
                </div>
                <TrendingUp className="h-8 w-8 text-emerald-400" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Websites List */}
        {processedWebsites.length === 0 ? (
          <Card className="bg-slate-900/50 border-slate-800">
            <CardContent className="pt-6 pb-6">
              <div className="text-center py-12">
                <Globe className="h-16 w-16 text-slate-700 mx-auto mb-4" />
                <h3 className="text-xl font-semibold text-slate-300 mb-2">
                  No websites yet
                </h3>
                <p className="text-slate-400 mb-6">
                  Start monitoring by adding your first website
                </p>
                <AddWebsiteModal />
              </div>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {processedWebsites.map((website) => (
              <Card
                key={website.id}
                className="bg-slate-900/50 border-slate-800 hover:border-emerald-500/30 transition-all"
              >
                <Accordion type="single" collapsible className="w-full">
                  <AccordionItem value={website.id} className="border-none">
                    <AccordionTrigger className="hover:no-underline px-6">
                      <div className="flex items-center justify-between w-full pr-4">
                        <div className="flex items-center gap-4">
                          {/* Status Circle */}
                          <div className="relative">
                            <div
                              className={`w-4 h-4 rounded-full ${getStatusColor(
                                website.status
                              )} ${
                                website.status === "Good" ? "animate-pulse" : ""
                              }`}
                            ></div>
                          </div>

                          {/* Website Info */}
                          <div className="flex-1 text-left">
                            <a
                              href={website.url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-lg font-semibold text-slate-100 hover:underline"
                            >
                              {website.url}
                            </a>
                          </div>
                        </div>

                        {/* Quick Stats */}
                        <div className="flex items-center gap-8">
                          <div className="text-right">
                            <p className="text-sm text-slate-400">Uptime</p>
                            <p className="text-lg font-semibold text-slate-100">
                              {website.uptime.toFixed(2)}%
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-400">
                              Avg Response
                            </p>
                            <p className="text-lg font-semibold text-slate-100">
                              {website.avgResponseTime.toFixed(0)}ms
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm text-slate-400">Checks</p>
                            <p className="text-lg font-semibold text-slate-100">
                              {website.totalChecks}
                            </p>
                          </div>
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-6">
                      {/* Visual Status Bar - 3 minute windows */}
                      <div>
                        <p className="text-xs text-slate-400 mb-2">
                          Status overview (last 30 minutes in 3-minute windows)
                        </p>
                        <div className="flex gap-1  overflow-hidden">
                          {website.tickWindows.map((status, index) => (
                            <div
                              key={`window-${index}`}
                              className={`flex-1 h-3 rounded-full  ${getStatusColor(
                                status
                              )} hover:opacity-80 transition-opacity cursor-pointer`}
                              title={
                                status === "Degraded"
                                  ? "No data for this window"
                                  : status === "Good"
                                    ? "Up - All checks passed"
                                    : "Down - Some checks failed"
                              }
                            />
                          ))}
                        </div>
                        <div className="flex justify-between items-center mt-2">
                          <p className="text-xs text-slate-500">
                            Last checked: {website.lastChecked}
                          </p>
                        </div>
                      </div>
                      {/* Status History */}
                      <div>
                        <div className="flex items-center justify-between mt-4">
                          <h4 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                            <Clock className="h-4 w-4" />
                            Last 10 Status Checks
                          </h4>
                          <span className="text-xs text-slate-500">
                            {website.recentTicks.length} recent checks
                          </span>
                        </div>

                        {website.recentTicks.length === 0 ? (
                          <div className="text-center py-8 text-slate-500">
                            No status checks available yet
                          </div>
                        ) : (
                          <div className="space-y-2">
                            {/* Status Timeline Grid */}
                            <div className="grid grid-cols-1 gap-2 max-h-96 overflow-y-auto pr-2">
                              {website.recentTicks.map((tick) => (
                                <div
                                  key={tick.id}
                                  className="flex items-center justify-between py-3 px-4 bg-slate-950/50 rounded-lg hover:bg-slate-950/70 transition-colors border border-slate-800/50"
                                >
                                  <div className="flex items-center gap-3">
                                    {getStatusIcon(tick.status)}
                                    <div>
                                      <p className="text-sm font-medium text-slate-200">
                                        {tick.status === "Good"
                                          ? "Operational"
                                          : "Down"}
                                      </p>
                                      <p className="text-xs text-slate-500">
                                        {tick.validator.location}
                                      </p>
                                    </div>
                                  </div>
                                  <div className="text-right">
                                    <p className="text-sm text-slate-300">
                                      {tick.latency.toFixed(0)}ms
                                    </p>
                                    <p className="text-xs text-slate-500">
                                      {getRelativeTime(
                                        tick.timestamp.toString()
                                      )}
                                    </p>
                                  </div>
                                </div>
                              ))}
                            </div>
                          </div>
                        )}
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>
              </Card>
            ))}
          </div>
        )}
      </div>
      <InvoiceList />
    </>
  );
}
