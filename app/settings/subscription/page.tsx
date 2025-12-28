"use client";

import { Check, Sparkles, Zap } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

type Plan = {
  name: string;
  price: string;
  description: string;
  features: string[];
  isCurrent?: boolean;
  isPopular?: boolean;
  buttonText: string;
  buttonDisabled?: boolean;
};

const plans: Plan[] = [
  {
    name: "Free",
    price: "$0",
    description: "Perfect for getting started",
    features: [
      "15 messages per day",
      "Access to all characters",
      "Basic AI models",
      "Conversation history",
    ],
    isCurrent: true,
    buttonText: "Current Plan",
    buttonDisabled: true,
  },
  {
    name: "Pro",
    price: "$9",
    description: "For power users who need more",
    features: [
      "Unlimited messages",
      "Access to all characters",
      "Priority AI models",
      "Priority support",
      "Early access to new features",
    ],
    isPopular: true,
    buttonText: "Coming Soon",
    buttonDisabled: true,
  },
];

export default function SubscriptionPage() {
  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h2 className="text-lg font-medium">Subscription</h2>
        <p className="text-muted-foreground text-sm">
          Choose the plan that works best for you
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {plans.map((plan) => (
          <div
            key={plan.name}
            className={cn(
              "bg-card relative flex flex-col rounded-xl border p-6 transition-all",
              plan.isPopular &&
                "border-primary/50 ring-primary/20 shadow-primary/5 shadow-lg ring-1"
            )}
          >
            {/* Badge - Inside card, top right */}
            {(plan.isPopular || plan.isCurrent) && (
              <div className="absolute top-4 right-4">
                {plan.isPopular ? (
                  <Badge className="gap-1 px-2 py-0.5 text-xs">
                    <Sparkles className="size-3" />
                    Popular
                  </Badge>
                ) : (
                  <Badge
                    variant="secondary"
                    className="px-2 py-0.5 text-xs opacity-70"
                  >
                    Current
                  </Badge>
                )}
              </div>
            )}

            {/* Plan Header */}
            <div className="mb-4 flex items-center gap-3">
              <div
                className={cn(
                  "flex size-10 items-center justify-center rounded-lg",
                  plan.isPopular
                    ? "bg-primary/10 text-primary"
                    : "bg-muted text-muted-foreground"
                )}
              >
                <Zap className="size-5" />
              </div>
              <div>
                <h3 className="font-semibold">{plan.name}</h3>
                <p className="text-muted-foreground text-xs">
                  {plan.description}
                </p>
              </div>
            </div>

            {/* Price */}
            <div className="mb-6">
              <span className="text-4xl font-bold tracking-tight">
                {plan.price}
              </span>
              <span className="text-muted-foreground text-sm">/month</span>
            </div>

            {/* Features */}
            <ul className="mb-6 flex-1 space-y-3">
              {plan.features.map((feature) => (
                <li key={feature} className="flex items-start gap-2.5 text-sm">
                  <Check
                    className={cn(
                      "mt-0.5 size-4 shrink-0",
                      plan.isPopular ? "text-primary" : "text-muted-foreground"
                    )}
                  />
                  <span>{feature}</span>
                </li>
              ))}
            </ul>

            {/* CTA Button */}
            <Button
              className="w-full"
              variant={plan.isPopular ? "default" : "outline"}
              disabled={plan.buttonDisabled}
            >
              {plan.buttonText}
            </Button>
          </div>
        ))}
      </div>

      {/* Info */}
      <p className="text-muted-foreground text-center text-xs">
        Subscription plans are coming soon. Stay tuned for updates!
      </p>
    </div>
  );
}
