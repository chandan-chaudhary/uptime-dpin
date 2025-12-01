export interface PricingPlan {
  id: string;
  title: string;
  description: string;
  priceEth: number;
  isPopular?: boolean;
  features: string[];
}

export const pricingPlans: PricingPlan[] = [
  {
    id: "starter",
    title: "Starter",
    description: "Perfect for small projects",
    priceEth: 0.01,
    features: [
      "5 monitors",
      "1-minute checks",
      "Email alerts",
      "30-day history",
    ],
  },
  {
    id: "professional",
    title: "Professional",
    description: "For growing businesses",
    priceEth: 0.05,
    isPopular: true,
    features: [
      "25 monitors",
      "30-second checks",
      "All alert channels",
      "1-year history",
      "SSL monitoring",
    ],
  },
  {
    id: "enterprise",
    title: "Enterprise",
    description: "For large organizations",
    priceEth: 0.1,
    features: [
      "Unlimited monitors",
      "10-second checks",
      "Priority support",
      "Unlimited history",
      "Custom integrations",
    ],
  },
];
