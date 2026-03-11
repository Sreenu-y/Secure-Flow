"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
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
  Menu,
  X,
} from "lucide-react";
import { UserButton } from "@clerk/nextjs";

export default function DashboardLayout({ children }) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

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

  const NavLinks = ({ onNavigate }) => (
    <>
      {navigation.map((item) => {
        const active = isActive(item.href);
        return (
          <Link
            key={item.name}
            href={item.href}
            onClick={onNavigate}
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
    </>
  );

  return (
    <div className="min-h-screen relative flex bg-background">
      {/* Desktop Sidebar */}
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
          <NavLinks onNavigate={undefined} />
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

      {/* Mobile overlay */}
      {mobileOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm md:hidden"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Mobile Drawer */}
      <aside
        className={`fixed top-0 left-0 bottom-0 w-72 bg-black/95 border-r border-border flex flex-col z-50 transform transition-transform duration-300 md:hidden ${
          mobileOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-border">
          <Link
            href="/"
            className="flex items-center gap-2"
            onClick={() => setMobileOpen(false)}
          >
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold text-white">SecureFlow</span>
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="p-1.5 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex-1 p-4 space-y-0.5 overflow-y-auto">
          <NavLinks onNavigate={() => setMobileOpen(false)} />
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
        {/* Mobile top bar */}
        <header className="h-16 bg-black/40 backdrop-blur-md border-b border-border flex items-center justify-between px-4 md:hidden sticky top-0 z-40">
          <Link href="/" className="flex items-center gap-2">
            <ShieldCheck className="h-6 w-6 text-primary" />
            <span className="font-bold text-white">SecureFlow</span>
          </Link>
          <button
            onClick={() => setMobileOpen(true)}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            aria-label="Open navigation menu"
          >
            <Menu className="h-5 w-5" />
          </button>
        </header>

        <div className="flex-1 p-6 md:p-10">{children}</div>
      </main>
    </div>
  );
}
