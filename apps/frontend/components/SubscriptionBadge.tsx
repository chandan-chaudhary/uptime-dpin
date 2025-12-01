import { Crown, Zap, Rocket } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface SubscriptionBadgeProps {
  plan: "free" | "starter" | "professional" | "enterprise";
  showIcon?: boolean;
  className?: string;
}

export function SubscriptionBadge({
  plan,
  showIcon = true,
  className,
}: SubscriptionBadgeProps) {
  const config = {
    free: {
      label: "Free Tier",
      icon: Zap,
      className: "bg-slate-800/50 text-slate-400 border-slate-700",
    },
    starter: {
      label: "Starter",
      icon: Zap,
      className: "bg-blue-500/10 text-blue-400 border-blue-500/30",
    },
    professional: {
      label: "Professional",
      icon: Rocket,
      className: "bg-emerald-500/10 text-emerald-400 border-emerald-500/30",
    },
    enterprise: {
      label: "Enterprise",
      icon: Crown,
      className: "bg-purple-500/10 text-purple-400 border-purple-500/30",
    },
  };

  const { label, icon: Icon, className: planClassName } = config[plan];

  return (
    <Badge className={cn(planClassName, className)}>
      {showIcon && <Icon />}
      {label}
    </Badge>
  );
}
