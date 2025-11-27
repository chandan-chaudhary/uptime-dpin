"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CheckCircle2, BarChart3, Globe, Clock } from "lucide-react";
import { useRouter } from "next/navigation";
import PricingSection from "@/components/PricingSection";
import Features from "@/components/Features";
import Footer from "@/components/Footer";

export default function Home() {
  const router = useRouter();

  return (
    <div className="min-h-screen to-slate-800 text-slate-100">
      <section className="pb-20 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <Badge className="mb-4 bg-emerald-900 text-emerald-200">
                99.9% Uptime Guaranteed
              </Badge>
              <h1 className="text-5xl md:text-6xl font-bold text-slate-100 mb-6 leading-tight">
                Monitor Your Websites
                <span className="block text-emerald-300">
                  24/7 Uptime Tracking
                </span>
              </h1>
              <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                Get instant alerts when your website goes down. Real-time
                monitoring with detailed analytics to keep your online presence
                always available.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Button
                  onClick={() => router.push("/dashboard")}
                  size="lg"
                  className="bg-emerald-500 text-white hover:bg-emerald-600"
                >
                  Start Monitoring Free
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="text-base text-slate-200 border-slate-700"
                >
                  View Demo
                </Button>
              </div>
              <p className="mt-4 text-sm text-slate-400">
                No credit card required • 14-day free trial
              </p>
            </div>

            {/* Analytics Dashboard Mockup */}
            <div className="relative">
              <div className="absolute inset-0 bg-linear-to-r from-emerald-600 to-blue-700 blur-3xl opacity-10 rounded-full"></div>
              <Card className="relative border border-slate-700 bg-slate-800 overflow-hidden shadow-lg">
                <CardHeader className="bg-linear-to-r from-slate-800 to-slate-900 border-b border-slate-700 text-slate-100">
                  <CardTitle className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-emerald-600" />
                    Uptime Analytics
                  </CardTitle>
                  <CardDescription>Last 30 days performance</CardDescription>
                </CardHeader>
                <CardContent className="p-6">
                  {/* Simulated Chart */}
                  <div className="space-y-6">
                    {/* Status Bar */}
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse"></div>
                        <span className="text-sm font-medium text-slate-100">
                          All Systems Operational
                        </span>
                      </div>
                      <Badge className="bg-emerald-100 text-emerald-700">
                        99.9%
                      </Badge>
                    </div>

                    {/* Line Chart - Stock Style */}
                    <div className="relative h-48 bg-linear-to-b from-slate-800 to-transparent rounded-lg p-4">
                      {/* Y-axis labels */}
                      <div className="absolute left-0 top-0 bottom-0 flex flex-col justify-between text-xs text-slate-400">
                        <span>100%</span>
                        <span>99.5%</span>
                        <span>99.0%</span>
                        <span>98.5%</span>
                      </div>

                      {/* Chart Area */}
                      <div className="ml-12 h-full relative">
                        {/* Grid lines */}
                        <div className="absolute inset-0 flex flex-col justify-between">
                          <div className="border-t border-slate-700"></div>
                          <div className="border-t border-slate-700"></div>
                          <div className="border-t border-slate-700"></div>
                          <div className="border-t border-slate-700"></div>
                        </div>

                        {/* Line Chart SVG */}
                        <svg
                          className="w-full h-full"
                          viewBox="0 0 400 160"
                          preserveAspectRatio="none"
                        >
                          {/* Gradient fill under the line */}
                          <defs>
                            <linearGradient
                              id="chartGradient"
                              x1="0"
                              x2="0"
                              y1="0"
                              y2="1"
                            >
                              <stop
                                offset="0%"
                                stopColor="#34D399"
                                stopOpacity="0.28"
                              />
                              <stop
                                offset="100%"
                                stopColor="#34D399"
                                stopOpacity="0"
                              />
                            </linearGradient>
                          </defs>

                          {/* Area under the line */}
                          <path
                            d="M 0 20 L 30 15 L 60 18 L 90 10 L 120 25 L 150 12 L 180 8 L 210 15 L 240 5 L 270 12 L 300 8 L 330 10 L 360 5 L 400 8 L 400 160 L 0 160 Z"
                            fill="url(#chartGradient)"
                          />

                          {/* The line itself */}
                          <path
                            d="M 0 20 L 30 15 L 60 18 L 90 10 L 120 25 L 150 12 L 180 8 L 210 15 L 240 5 L 270 12 L 300 8 L 330 10 L 360 5 L 400 8"
                            fill="none"
                            stroke="#34D399"
                            strokeWidth="3"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />

                          {/* Data points */}
                          <circle
                            cx="0"
                            cy="20"
                            r="4"
                            fill="rgb(16, 185, 129)"
                            className="opacity-0 hover:opacity-100 transition-opacity"
                          />
                          <circle
                            cx="60"
                            cy="18"
                            r="4"
                            fill="rgb(16, 185, 129)"
                            className="opacity-0 hover:opacity-100 transition-opacity"
                          />
                          <circle
                            cx="120"
                            cy="25"
                            r="4"
                            fill="#F87171"
                            className="opacity-100"
                          />
                          <circle
                            cx="180"
                            cy="8"
                            r="4"
                            fill="rgb(16, 185, 129)"
                            className="opacity-0 hover:opacity-100 transition-opacity"
                          />
                          <circle
                            cx="240"
                            cy="5"
                            r="4"
                            fill="rgb(16, 185, 129)"
                            className="opacity-0 hover:opacity-100 transition-opacity"
                          />
                          <circle
                            cx="300"
                            cy="8"
                            r="4"
                            fill="rgb(16, 185, 129)"
                            className="opacity-0 hover:opacity-100 transition-opacity"
                          />
                          <circle
                            cx="400"
                            cy="8"
                            r="4"
                            fill="rgb(16, 185, 129)"
                          />
                        </svg>

                        {/* Current value indicator */}
                        <div className="absolute top-2 right-0 bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded shadow-lg">
                          99.9%
                        </div>
                      </div>

                      {/* X-axis labels */}
                      <div className="ml-12 mt-2 flex justify-between text-xs text-slate-400">
                        <span>7d ago</span>
                        <span>5d ago</span>
                        <span>3d ago</span>
                        <span>1d ago</span>
                        <span>Now</span>
                      </div>
                    </div>

                    {/* Metrics Grid */}
                    <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-700">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-slate-100">
                          245ms
                        </div>
                        <div className="text-xs text-slate-400">
                          Avg Response
                        </div>
                      </div>
                      <div className="text-center border-x border-slate-700">
                        <div className="text-2xl font-bold text-slate-100">
                          99.9%
                        </div>
                        <div className="text-xs text-slate-400">Uptime</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-emerald-300">
                          1
                        </div>
                        <div className="text-xs text-slate-400">Incidents</div>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </section>

      <section className="py-16 px-4 sm:px-6 lg:px-8 bg-slate-900">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="border hover:border-emerald-600 transition-all hover:shadow-lg bg-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-emerald-900 rounded-lg">
                    <CheckCircle2 className="h-6 w-6 text-emerald-200" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100">
                      99.9%
                    </div>
                    <div className="text-sm text-slate-300">Average Uptime</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border hover:border-blue-600 transition-all hover:shadow-lg bg-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-blue-900 rounded-lg">
                    <Clock className="h-6 w-6 text-blue-200" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100">
                      &lt;30s
                    </div>
                    <div className="text-sm text-slate-300">Check Interval</div>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border hover:border-orange-600 transition-all hover:shadow-lg bg-slate-800">
              <CardContent className="pt-6">
                <div className="flex items-center gap-4 mb-4">
                  <div className="p-3 bg-orange-900 rounded-lg">
                    <Globe className="h-6 w-6 text-orange-200" />
                  </div>
                  <div>
                    <div className="text-2xl font-bold text-slate-100">15+</div>
                    <div className="text-sm text-slate-300">
                      Global Locations
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      <section id="features" className="py-20 px-4 sm:px-6 lg:px-8">
        <Features />
      </section>

      <section id="pricing" className="py-20 px-4 sm:px-6 lg:px-8">
        <PricingSection />
      </section>

      <section className="py-20 px-4 sm:px-6 lg:px-8 bg-linear-to-br from-emerald-600 to-emerald-700">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className="text-4xl font-bold text-white mb-6">
            Start Monitoring Your Websites Today
          </h2>
          <p className="text-xl text-emerald-100 mb-8">
            Join thousands of businesses that trust UptimeGuard to keep their
            websites online
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" variant="secondary" className="text-base">
              Start Free Trial
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="text-base bg-transparent text-white border-white hover:bg-white hover:text-emerald-600"
            >
              Schedule Demo
            </Button>
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
}
