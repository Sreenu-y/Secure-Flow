"use client";
import { Pricing } from "@/components/Pricing";
import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  ShieldCheck,
  Zap,
  Database,
  Lock,
  Star,
  ChevronDown,
} from "lucide-react";
import Link from "next/link";

import {
  SignedIn,
  SignedOut,
  SignInButton,
  SignUpButton,
  UserButton,
} from "@clerk/nextjs";
import React, { useEffect, useRef, useState } from "react";
import Image from "next/image";

export default function Home() {
  const imageRef = useRef(null);

  useEffect(() => {
    const imageElement = imageRef.current;

    if (!imageElement) return;

    let ticking = false;
    const scrollThreshold = 100;

    const handleScroll = () => {
      const scrollPosition = window.scrollY || window.pageYOffset;

      if (!ticking) {
        window.requestAnimationFrame(() => {
          if (scrollPosition > scrollThreshold) {
            imageElement.classList.add("scrolled");
          } else {
            imageElement.classList.remove("scrolled");
          }
          ticking = false;
        });
        ticking = true;
      }
    };

    window.addEventListener("scroll", handleScroll, { passive: true });

    handleScroll();

    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, []);

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden">
      {/* Navbar */}
      <header className="fixed top-0 w-full border-b border-border bg-background/80 backdrop-blur-md z-50">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between max-w-6xl">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-8 w-8 text-white" />
            <span className="text-xl font-bold gradient-title">SecureFlow</span>
          </div>
          <nav className="hidden md:flex gap-8">
            <Link
              href="#how-it-works"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              How it Works
            </Link>
            <Link
              href="#pricing"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Pricing
            </Link>
            <Link
              href="#faq"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              FAQ
            </Link>
            <Link
              href="#reviews"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Reviews
            </Link>
            <Link
              href="/dashboard"
              className="text-sm font-medium text-gray-300 hover:text-white transition-colors"
            >
              Dashboard
            </Link>
          </nav>
          <div className="flex gap-4 z-10">
            <SignedOut>
              <SignInButton mode="modal">
                <Button
                  variant="ghost"
                  className="hidden md:inline-flex text-gray-200 hover:text-white hover:bg-gray-800"
                >
                  Log in
                </Button>
              </SignInButton>
              <SignUpButton mode="modal">
                <Button className="bg-white hover:bg-gray-200 text-black font-semibold">
                  Get Started
                </Button>
              </SignUpButton>
            </SignedOut>
            <SignedIn>
              <UserButton afterSignOutUrl="/" />
            </SignedIn>
          </div>
        </div>
      </header>

      <main className="w-full pt-16 relative z-10">
        {/* Hero Section */}
        <section className="relative pt-24">
          <div className="grid-background" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gray-800 rounded-full blur-[120px] opacity-20 pointer-events-none"></div>

          <div className="container mx-auto max-w-5xl relative z-10 text-center space-y-6">
            <h1 className="text-5xl md:text-6xl lg:text-7xl gradient-title">
              Stay ahead of fraud
              <br />
              using SecureFlow.
            </h1>

            <p className="mx-auto max-w-[600px] text-muted-foreground md:text-xl">
              Advanced machine learning for high-transaction businesses.
              <br />
              Quick integration. Lasting revenue protection.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button size="lg" className="px-8 text-lg">
                    Start Free Trial <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button size="lg" className="px-8 text-lg">
                    Go to Dashboard <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                </Link>
              </SignedIn>
              <Link href="/docs">
                <Button size="lg" variant="outline" className="px-8 text-lg ">
                  View Documentation
                </Button>
              </Link>
            </div>
          </div>
          <div className="hero-image-wrapper mt-5 md:mt-0 flex justify-center">
            <div ref={imageRef} className="hero-image">
              <Image
                src="/herosection.png"
                height={720}
                width={1200}
                alt="Banner Sensai"
                className="rounded-lg shadow-2xl border mx-auto"
                priority
              />
            </div>
          </div>
        </section>

        {/* How it Works Section */}
        <section
          id="how-it-works"
          className="py-24 bg-black/40 border-y border-white/5"
        >
          <div className="container mx-auto px-4 max-w-6xl">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold gradient-title pb-2">
                How SecureFlow Works
              </h2>
              <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                Integration is seamless. Our intelligence engine analyzes
                transactions in milliseconds.
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-8">
              <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                  <Database className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  1. Send Transaction Data
                </h3>
                <p className="text-gray-400">
                  Pass payload data via our secure REST API during the checkout
                  process.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 flex flex-col items-center text-center relative">
                <div className="hidden md:block absolute top-14 -left-4 w-8 border-t-2 border-dashed border-gray-700"></div>
                <div className="hidden md:block absolute top-14 -right-4 w-8 border-t-2 border-dashed border-gray-700"></div>
                <div className="h-14 w-14 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                  <Zap className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  2. Millisecond Analysis
                </h3>
                <p className="text-gray-400">
                  Our machine learning models score the risk based on 100+
                  distinct datapoints.
                </p>
              </div>

              <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800 flex flex-col items-center text-center">
                <div className="h-14 w-14 rounded-full bg-gray-800 flex items-center justify-center mb-6">
                  <Lock className="h-6 w-6 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-3">
                  3. Block or Approve
                </h3>
                <p className="text-gray-400">
                  Receive a real-time decision to either block the fraudster or
                  approve the customer.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* Pricing Section */}
        <Pricing />

        {/* Reviews / Testimonials Section */}
        <section id="reviews" className="py-24 bg-transparent relative">
          <div className="grid-background"></div>
          <div className="absolute right-0 top-0 w-[500px] h-[500px] bg-gray-800 rounded-full blur-[100px] opacity-10 pointer-events-none"></div>
          <div className="container mx-auto px-4 max-w-6xl relative z-10">
            <div className="text-center mb-16">
              <h2 className="text-3xl md:text-5xl font-bold gradient-title pb-2">
                Trusted by Engineering Teams
              </h2>
              <p className="mt-4 text-lg text-gray-400 max-w-2xl mx-auto">
                See why payment providers and global SaaS companies trust
                SecureFlow.
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
              <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-white text-white" />
                  ))}
                </div>
                <p className="text-lg text-gray-300 italic mb-6">
                  "SecureFlow cut our manual review time by 90% in just two
                  weeks. The false-positive rate is the lowest we've ever seen,
                  letting us capture more revenue securely."
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                    JD
                  </div>
                  <div>
                    <h4 className="font-bold text-white">John Doe</h4>
                    <p className="text-sm text-gray-500">
                      VP of Risk, Global Payments Co.
                    </p>
                  </div>
                </div>
              </div>

              <div className="p-8 rounded-2xl bg-gray-900/50 border border-gray-800">
                <div className="flex items-center gap-1 mb-6">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="h-5 w-5 fill-white text-white" />
                  ))}
                </div>
                <p className="text-lg text-gray-300 italic mb-6">
                  "The REST API is a joy to work with. We integrated the entire
                  risk-scoring engine over a weekend. The dashboard provides
                  transparent insights into why a transaction was flagged."
                </p>
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-full bg-gray-700 flex items-center justify-center text-white font-bold">
                    AS
                  </div>
                  <div>
                    <h4 className="font-bold text-white">Alice Smith</h4>
                    <p className="text-sm text-gray-500">
                      CTO, E-Commerce ScaleUp
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <FAQ />

        {/* CTA Banner Section */}
        <section className="w-full">
          <div className="mx-auto py-24 gradient rounded-lg">
            <div className="flex flex-col items-center justify-center space-y-4 text-center max-w-3xl mx-auto">
              <h2 className="text-3xl font-bold tracking-tighter text-primary-foreground sm:text-4xl md:text-5xl">
                Ready to Protect Your Revenue?
              </h2>
              <p className="mx-auto max-w-[600px] text-primary-foreground/80 md:text-xl">
                Join thousands of businesses that trust SecureFlow to stop fraud
                in real-time before it impacts their bottom line.
              </p>
              <SignedOut>
                <SignUpButton mode="modal">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-11 mt-5 animate-bounce"
                  >
                    Start Free Trial <ArrowRight className="ml-2 size-4" />
                  </Button>
                </SignUpButton>
              </SignedOut>
              <SignedIn>
                <Link href="/dashboard">
                  <Button
                    size="lg"
                    variant="secondary"
                    className="h-11 mt-5 animate-bounce"
                  >
                    Back to Dashboard <ArrowRight className="ml-2 size-4" />
                  </Button>
                </Link>
              </SignedIn>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-white/10 bg-black/50 py-12 relative z-10">
        <div className="container mx-auto px-4 max-w-6xl flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-white" />
            <span className="font-bold text-white">SecureFlow</span>
          </div>
          <p className="text-gray-500 text-sm">
            © 2026 SecureFlow Inc. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  );
}

const faqs = [
  {
    question: "What is SecureFlow and how does it work?",
    answer:
      "SecureFlow is a real-time fraud detection API powered by machine learning. You send us transaction data via our REST API during your payment flow, and we return a risk score in milliseconds — letting you block fraudulent transactions before they complete.",
  },
  {
    question: "How quickly can I integrate SecureFlow into my platform?",
    answer:
      "Most teams complete integration in under a day. We provide client SDKs for Node.js, Python, and Go, along with comprehensive documentation and sandbox environment for testing before you go live.",
  },
  {
    question: "How accurate is the fraud detection model?",
    answer:
      "Our ensemble model achieves an AUPRC of over 0.95 on benchmark datasets. It is continuously retrained on new fraud patterns, and our false-positive rates are industry-leading — so legitimate customers are rarely impacted.",
  },
  {
    question: "Is my transaction data secure?",
    answer:
      "Yes. All data is encrypted in transit (TLS 1.3) and at rest (AES-256). We are SOC 2 Type II certified and GDPR compliant. We never sell or share your data with third parties.",
  },
  {
    question: "What transaction types does SecureFlow support?",
    answer:
      "SecureFlow supports a wide range of transaction types including CASH-IN, CASH-OUT, DEBIT, PAYMENT, and TRANSFER. The model is trained on high-volume mobile money and card-not-present e-commerce scenarios.",
  },
  {
    question: "Can I customize the risk thresholds for my business?",
    answer:
      "Absolutely. Via the dashboard you can configure custom risk score thresholds, set rules per transaction type or geography, and tune the sensitivity of the model to match your unique risk appetite.",
  },
];

function FAQ() {
  const [openIndex, setOpenIndex] = useState(null);

  return (
    <section id="faq" className="py-24 bg-black/40 border-y border-white/5">
      <div className="container mx-auto px-4 max-w-3xl">
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-5xl font-bold gradient-title pb-2">
            Frequently Asked Questions
          </h2>
          <p className="mt-4 text-lg text-gray-400">
            Find answers to common questions about our platform
          </p>
        </div>

        <div className="divide-y divide-white/10">
          {faqs.map((faq, i) => (
            <div key={i}>
              <button
                onClick={() => setOpenIndex(openIndex === i ? null : i)}
                className="w-full flex items-center justify-between py-5 text-left gap-4 group"
              >
                <span className="text-gray-100 font-medium group-hover:text-white transition-colors">
                  {faq.question}
                </span>
                <ChevronDown
                  className={`h-5 w-5 text-gray-400 shrink-0 transition-transform duration-300 ${
                    openIndex === i ? "rotate-180 text-white" : ""
                  }`}
                />
              </button>
              <div
                className={`overflow-hidden transition-all duration-300 ease-in-out ${
                  openIndex === i ? "max-h-64 pb-5" : "max-h-0"
                }`}
              >
                <p className="text-gray-400 leading-relaxed">{faq.answer}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
