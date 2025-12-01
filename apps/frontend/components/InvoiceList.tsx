"use client";

import { useInvoices } from "@/hooks/useInvoices";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Download,
  FileText,
  ExternalLink,
  Calendar,
  DollarSign,
  CheckCircle2,
  XCircle,
  Clock,
  Receipt,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import type { Invoice } from "@/hooks/useInvoices";
import { useUser } from "@clerk/nextjs";

export function InvoiceList() {
  const { invoices, loading, error } = useInvoices();
  const { user } = useUser();

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      Paid: {
        variant: "default" as const,
        className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
        icon: CheckCircle2,
      },
      Pending: {
        variant: "secondary" as const,
        className: "bg-orange-500/10 text-orange-400 border-orange-500/30",
        icon: Clock,
      },
      Failed: {
        variant: "destructive" as const,
        className: "bg-red-500/10 text-red-400 border-red-500/30",
        icon: XCircle,
      },
      Refunded: {
        variant: "outline" as const,
        className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
        icon: Receipt,
      },
    };

    const config =
      statusConfig[status as keyof typeof statusConfig] || statusConfig.Pending;
    const Icon = config.icon;

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3" />
        {status}
      </Badge>
    );
  };

  const generatePDF = async (invoice: Invoice) => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();

    // Set colors
    const emeraldGreen = [16, 185, 129];
    const darkGray = [31, 41, 55];
    const lightGray = [107, 114, 128];

    // Header
    doc.setFillColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
    doc.rect(0, 0, 210, 40, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(28);
    doc.text("UptimeGuard", 105, 20, { align: "center" });
    doc.setFontSize(12);
    doc.text("Decentralized Website Monitoring", 105, 30, { align: "center" });

    // Invoice Title and Customer Info
    doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
    doc.setFontSize(20);
    doc.text("INVOICE", 20, 55);

    // Invoice ID
    doc.setFontSize(10);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text(`Invoice #${invoice.id.slice(0, 8)}`, 20, 65);

    // Customer Information Box (Right side)
    if (user) {
      const customerName = user.fullName || user.firstName || "Customer";
      const customerEmail =
        user.primaryEmailAddress?.emailAddress || "No email";

      doc.setFillColor(249, 250, 251);
      doc.roundedRect(110, 50, 80, 25, 2, 2, "F");

      doc.setFontSize(9);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text("BILLED TO", 115, 57);

      doc.setFontSize(11);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(customerName, 115, 64);

      doc.setFontSize(9);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(customerEmail, 115, 70, { maxWidth: 70 });
    }

    // Details section
    let yPos = 85;

    // Helper function to add detail row
    const addDetail = (label: string, value: string, x = 20) => {
      doc.setFontSize(9);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text(label.toUpperCase(), x, yPos);

      doc.setFontSize(11);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(value, x, yPos + 6);

      yPos += 20;
    };

    // Left column
    addDetail("Invoice ID", invoice.id);
    addDetail("Plan", invoice.metadata?.planId || "N/A");
    addDetail("Created Date", new Date(invoice.createdAt).toLocaleDateString());

    // Right column
    yPos = 80;
    addDetail("Status", invoice.status, 110);
    addDetail("Currency", invoice.currency, 110);
    if (invoice.paidAt) {
      addDetail(
        "Paid Date",
        new Date(invoice.paidAt).toLocaleDateString(),
        110
      );
    }

    // Amount section (highlighted box)
    yPos += 10;
    doc.setFillColor(emeraldGreen[0], emeraldGreen[1], emeraldGreen[2]);
    doc.roundedRect(20, yPos, 170, 35, 5, 5, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(12);
    doc.text("TOTAL AMOUNT", 105, yPos + 12, { align: "center" });
    doc.setFontSize(24);
    doc.text(`${invoice.amount} ${invoice.currency}`, 105, yPos + 27, {
      align: "center",
    });

    // Transaction Hash (if available)
    if (invoice.txHash) {
      yPos += 45;
      doc.setFontSize(9);
      doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
      doc.text("TRANSACTION HASH", 20, yPos);
      doc.setFontSize(9);
      doc.setTextColor(darkGray[0], darkGray[1], darkGray[2]);
      doc.text(invoice.txHash, 20, yPos + 6, { maxWidth: 170 });
    }

    // Footer
    doc.setDrawColor(229, 231, 235);
    doc.line(20, 270, 190, 270);

    doc.setFontSize(9);
    doc.setTextColor(lightGray[0], lightGray[1], lightGray[2]);
    doc.text("Thank you for choosing UptimeGuard!", 105, 280, {
      align: "center",
    });
    doc.text(`Generated on ${new Date().toLocaleDateString()}`, 105, 286, {
      align: "center",
    });

    // Save the PDF
    doc.save(`invoice-${invoice.id.slice(0, 8)}.pdf`);
  };

  if (loading) {
    return (
      <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Card className="bg-slate-900/50 border-slate-800">
          <CardContent className="pt-6">
            <div className="flex items-center justify-center py-12">
              <FileText className="h-6 w-6 animate-pulse text-emerald-500 mr-3" />
              <span className="text-slate-300">Loading invoices...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (error) {
    return (
      <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        <Card className="bg-red-500/10 border-red-500/50">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-red-400">
              <XCircle className="h-6 w-6" />
              <span>{error}</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mt-8 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
      <Card className="bg-slate-900/50 border-slate-800">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Receipt className="h-6 w-6 text-emerald-500" />
              <CardTitle className="text-2xl font-bold text-slate-100">
                Your Invoices
              </CardTitle>
            </div>
            <Badge className="bg-slate-800/50 text-slate-300 border-slate-700">
              {invoices.length} total
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          {invoices.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="h-16 w-16 text-slate-700 mx-auto mb-4" />
              <h3 className="text-xl font-semibold text-slate-300 mb-2">
                No invoices yet
              </h3>
              <p className="text-slate-400">
                Your payment history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {invoices.map((invoice) => (
                <Card
                  key={invoice.id}
                  className="bg-slate-950/50 border-slate-800 hover:border-emerald-500/30 transition-all"
                >
                  <CardContent className="pt-6">
                    <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                      {/* Invoice Icon & ID */}
                      <div className="md:col-span-3 flex items-center gap-3">
                        <div className="p-2 bg-emerald-500/10 rounded-lg">
                          <FileText className="h-5 w-5 text-emerald-500" />
                        </div>
                        <div>
                          <p className="text-xs text-slate-500">Invoice ID</p>
                          <p className="text-sm font-mono text-slate-300">
                            {invoice.id.slice(0, 8)}...
                          </p>
                        </div>
                      </div>

                      {/* Plan */}
                      <div className="md:col-span-2">
                        <p className="text-xs text-slate-500 mb-1">Plan</p>
                        <Badge className="bg-blue-500/10 text-blue-400 border-blue-500/30">
                          {invoice.metadata?.planId || "N/A"}
                        </Badge>
                      </div>

                      {/* Amount */}
                      <div className="md:col-span-2">
                        <p className="text-xs text-slate-500 mb-1">Amount</p>
                        <div className="flex items-center gap-1">
                          <DollarSign className="h-4 w-4 text-emerald-400" />
                          <span className="text-sm font-semibold text-slate-100">
                            {invoice.amount} {invoice.currency}
                          </span>
                        </div>
                      </div>

                      {/* Date */}
                      <div className="md:col-span-2">
                        <p className="text-xs text-slate-500 mb-1">Date</p>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-4 w-4 text-slate-400" />
                          <span className="text-sm text-slate-300">
                            {invoice.paidAt
                              ? new Date(invoice.paidAt).toLocaleDateString()
                              : new Date(
                                  invoice.createdAt
                                ).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {/* Status */}
                      <div className="md:col-span-2">
                        <p className="text-xs text-slate-500 mb-1">Status</p>
                        {getStatusBadge(invoice.status)}
                      </div>

                      {/* Actions */}
                      <div className="md:col-span-1 flex gap-2 justify-end">
                        {invoice.txHash && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="bg-slate-800/50 border-slate-700 hover:bg-slate-800 hover:border-slate-600"
                            onClick={() =>
                              window.open(
                                `https://etherscan.io/tx/${invoice.txHash}`,
                                "_blank"
                              )
                            }
                          >
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        )}
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-emerald-500/10 border-emerald-500/30 hover:bg-emerald-500/20 hover:border-emerald-500/50 text-emerald-400"
                          onClick={() => generatePDF(invoice)}
                        >
                          <Download className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
