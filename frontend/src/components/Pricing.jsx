import { Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export function Pricing() {
  const tiers = [
    {
      name: "Free",
      price: "$0",
      description: "Perfect for testing and small projects.",
      features: [
        "Up to 10,000 API calls/mo",
        "Basic fraud detection",
        "Community support",
      ],
      buttonText: "Start for Free",
      isPopular: false,
    },
    {
      name: "Pro",
      price: "$49",
      description: "For scaling businesses needing real-time protection.",
      features: [
        "Up to 100,000 API calls/mo",
        "Advanced ML models",
        "Priority email support",
        "Data export",
      ],
      buttonText: "Get Pro",
      isPopular: true,
    },
    {
      name: "Enterprise",
      price: "Custom",
      description: "Dedicated support and unlimited scale.",
      features: [
        "Unlimited API calls",
        "Custom model training",
        "24/7 phone support",
        "Dedicated Account Manager",
      ],
      buttonText: "Contact Sales",
      isPopular: false,
    },
  ];

  return (
    <section
      id="pricing"
      className="py-24 bg-transparent relative border-y border-white/5"
    >
      <div className="absolute left-0 top-0 w-[500px] h-[500px] bg-gray-800 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
      <div className="container mx-auto px-4 max-w-6xl relative z-10">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold gradient-title pb-2">
            Simple, transparent pricing
          </h2>
          <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
            Choose the perfect plan to secure your transactions. No hidden fees
            or surprises.
          </p>
        </div>

        <div className="grid md:grid-cols-3 gap-8">
          {tiers.map((tier) => (
            <Card
              key={tier.name}
              className={`relative flex flex-col justify-between bg-black/40 backdrop-blur-sm ${tier.isPopular ? "border-white shadow-2xl shadow-white/10" : "border-gray-800"}`}
            >
              {tier.isPopular && (
                <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2">
                  <Badge className="bg-white hover:bg-gray-200 text-black px-3 py-1 text-sm rounded-full font-semibold border-none">
                    Most Popular
                  </Badge>
                </div>
              )}
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-white">
                  {tier.name}
                </CardTitle>
                <div className="mt-4 flex items-baseline text-5xl font-extrabold text-white">
                  {tier.price}
                  {tier.price !== "Custom" && (
                    <span className="ml-1 text-xl font-medium text-gray-400">
                      /mo
                    </span>
                  )}
                </div>
                <CardDescription className="mt-4 text-base text-gray-400">
                  {tier.description}
                </CardDescription>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-4">
                  {tier.features.map((feature, idx) => (
                    <li key={idx} className="flex items-center gap-3">
                      <Check className="h-5 w-5 text-gray-300 shrink-0" />
                      <span className="text-gray-300">{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className={`w-full text-lg py-6 font-semibold ${tier.isPopular ? "bg-white hover:bg-gray-200 text-black" : "bg-gray-800 text-white hover:bg-gray-700 border border-gray-700"}`}
                  variant={tier.isPopular ? "default" : "outline"}
                >
                  {tier.buttonText}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
