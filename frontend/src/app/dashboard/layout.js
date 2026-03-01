"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CreditCard,
  LayoutDashboard,
  Settings,
  ShieldCheck,
  Key,
  BrainCircuit,
  List,
  BarChart2,
  Bell,
  BookOpen,
} from "lucide-react";
import { UserButton, useUser } from "@clerk/nextjs";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();

  const navigation = [
    { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
    { name: "Transactions", href: "/dashboard/transactions", icon: List },
    { name: "Analytics", href: "/dashboard/analytics", icon: BarChart2 },
    { name: "Alerts", href: "/dashboard/alerts", icon: Bell },
    {
      name: "Predict Transaction",
      href: "/dashboard/predict",
      icon: BrainCircuit,
    },
    { name: "API Keys", href: "/dashboard/apikeys", icon: Key },
    { name: "Policy Settings", href: "/dashboard/policy", icon: Settings },
    { name: "Billing", href: "/dashboard/billing", icon: CreditCard },
    { name: "Documentation", href: "/docs", icon: BookOpen },
  ];

  const isActive = (href) =>
    href === "/dashboard"
      ? pathname === "/dashboard"
      : pathname.startsWith(href);

  return (
    <div className="min-h-screen relative flex bg-background">
      {/* Sidebar */}
      <aside className="w-64 fixed left-0 top-0 bottom-0 bg-black/40 backdrop-blur-md border-r border-border hidden md:flex flex-col z-50">
        <div className="h-16 flex items-center px-6 border-b border-border">
          <Link
            href="/"
            className="flex items-center gap-2 hover:bg-white/5 px-2 py-1 -ml-2 rounded-md transition-colors"
          >
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold text-white">SecureFlow</span>
          </Link>
        </div>

        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-md text-sm font-medium transition-colors ${
                  active
                    ? "bg-white/10 text-white"
                    : "text-gray-400 hover:bg-white/5 hover:text-white"
                }`}
              >
                <item.icon
                  className={`h-4.5 w-4.5 shrink-0 ${active ? "text-white" : "text-gray-500"}`}
                />
                {item.name}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border flex items-center shrink-0">
          <UserButton
            afterSignOutUrl="/"
            showName
            appearance={{
              elements: {
                userButtonBox: "flex-row-reverse w-full justify-between gap-3",
                userButtonOuterIdentifier: "text-white font-medium text-sm",
              },
            }}
          />
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 flex flex-col min-h-screen w-full md:pl-64">
        <header className="h-16 bg-black/40 backdrop-blur-md border-b border-border flex items-center px-6 md:hidden sticky top-0 z-40">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold text-white">SecureFlow</span>
          </Link>
        </header>
        <div className="flex-1 p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
