import { Bell, BarChart3, Shield, Zap, Globe, Activity } from "lucide-react";
import { Card, CardHeader, CardTitle, CardDescription } from "./ui/card";

export default function Features() {
    return (
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-slate-100 mb-4">
              Powerful Features
            </h2>
            <p className="text-xl text-slate-300">
              Everything you need to keep your websites running smoothly
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-emerald-100 rounded-lg w-fit mb-4">
                  <Activity className="h-6 w-6 text-emerald-600" />
                </div>
                <CardTitle>Real-Time Monitoring</CardTitle>
                <CardDescription>
                  Monitor your websites every 30 seconds from multiple locations
                  around the world.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-blue-100 rounded-lg w-fit mb-4">
                  <Bell className="h-6 w-6 text-blue-600" />
                </div>
                <CardTitle>Instant Alerts</CardTitle>
                <CardDescription>
                  Get notified immediately via email, SMS, Slack, or webhook
                  when downtime is detected.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-purple-100 rounded-lg w-fit mb-4">
                  <BarChart3 className="h-6 w-6 text-purple-600" />
                </div>
                <CardTitle>Detailed Analytics</CardTitle>
                <CardDescription>
                  View comprehensive reports with response times, uptime
                  percentages, and historical data.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-orange-100 rounded-lg w-fit mb-4">
                  <Shield className="h-6 w-6 text-orange-600" />
                </div>
                <CardTitle>SSL Monitoring</CardTitle>
                <CardDescription>
                  Track SSL certificate expiration and get alerted before your
                  certificates expire.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-red-100 rounded-lg w-fit mb-4">
                  <Zap className="h-6 w-6 text-red-600" />
                </div>
                <CardTitle>Performance Tracking</CardTitle>
                <CardDescription>
                  Monitor page load times and performance metrics to optimize
                  user experience.
                </CardDescription>
              </CardHeader>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="p-3 bg-teal-100 rounded-lg w-fit mb-4">
                  <Globe className="h-6 w-6 text-teal-600" />
                </div>
                <CardTitle>Global Coverage</CardTitle>
                <CardDescription>
                  Monitor from 15+ locations worldwide to ensure global
                  availability and performance.
                </CardDescription>
              </CardHeader>
            </Card>
          </div>
        </div>
    );
}