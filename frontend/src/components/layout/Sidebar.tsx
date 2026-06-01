"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import {
  LayoutDashboard,
  User,
  Settings,
  ChevronLeft,
  ChevronRight,
  LogOut,
  UserCircle,
  Menu,
  X,
} from "lucide-react";

interface SidebarProps {
  children: React.ReactNode;
}

export function Sidebar({ children }: SidebarProps) {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const pathname = usePathname();
  const { user, logout } = useAuth();

  // Set initial expanded state based on screen size
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 1024) {
        setIsExpanded(true);
        setIsMobileOpen(false);
      } else if (window.innerWidth >= 768) {
        setIsExpanded(false);
        setIsMobileOpen(false);
      } else {
        setIsMobileOpen(false);
      }
    };

    // Set initial state
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Close mobile menu when route changes
  useEffect(() => {
    setIsMobileOpen(false);
    setIsProfileOpen(false);
  }, [pathname]);

  const menuItems = [
    {
      name: "Dashboard",
      icon: LayoutDashboard,
      href: "/dashboard",
    },
    {
      name: "Settings",
      icon: Settings,
      href: "/settings",
    },
  ];

  const isActive = (href: string) => pathname === href;

  return (
    <div className="flex h-screen bg-neutral-50 dark:bg-neutral-950 overflow-hidden">
      {/* Mobile Menu Button */}
      <button
        onClick={() => setIsMobileOpen(!isMobileOpen)}
        className="md:hidden fixed top-4 left-4 z-50 p-2 rounded-lg bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 shadow-lg hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
        aria-label={isMobileOpen ? "Close menu" : "Open menu"}
      >
        {isMobileOpen ? (
          <X className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
        ) : (
          <Menu className="w-6 h-6 text-neutral-600 dark:text-neutral-400" />
        )}
      </button>

      {/* Mobile Overlay */}
      {isMobileOpen && (
        <div
          className="md:hidden fixed inset-0 bg-black/50 z-30 backdrop-blur-sm"
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`
          ${isExpanded ? "w-64" : "w-20"}
          bg-white dark:bg-neutral-900 border-r border-neutral-200 dark:border-neutral-800 
          transition-all duration-300 ease-in-out flex flex-col flex-shrink-0
          
          /* Mobile: Fixed overlay sidebar */
          fixed md:relative inset-y-0 left-0 z-40
          ${isMobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-neutral-200 dark:border-neutral-800 flex-shrink-0">
          <Link
            href="/dashboard"
            className={`font-bold text-xl bg-gradient-to-r from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 bg-clip-text text-transparent transition-all duration-300 ${
              isExpanded ? "opacity-100 w-auto" : "opacity-0 w-0 overflow-hidden"
            }`}
          >
            RestT
          </Link>
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="hidden md:block p-2 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors flex-shrink-0"
            aria-label={isExpanded ? "Collapse sidebar" : "Expand sidebar"}
          >
            {isExpanded ? (
              <ChevronLeft className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            ) : (
              <ChevronRight className="w-5 h-5 text-neutral-600 dark:text-neutral-400" />
            )}
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto overflow-x-hidden">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.href);

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  active
                    ? "bg-neutral-900 dark:bg-neutral-100 text-white dark:text-neutral-900"
                    : "text-neutral-700 dark:text-neutral-300 hover:bg-neutral-100 dark:hover:bg-neutral-800"
                }`}
                title={!isExpanded ? item.name : undefined}
              >
                <Icon className="w-5 h-5 flex-shrink-0" />
                <span
                  className={`font-medium whitespace-nowrap transition-all duration-300 ${
                    isExpanded
                      ? "opacity-100 w-auto"
                      : "opacity-0 w-0 overflow-hidden"
                  }`}
                >
                  {item.name}
                </span>
              </Link>
            );
          })}
        </nav>

        {/* Profile Section */}
        <div className="border-t border-neutral-200 dark:border-neutral-800 p-3 flex-shrink-0">
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors ${
                isProfileOpen ? "bg-neutral-100 dark:bg-neutral-800" : ""
              }`}
            >
              <div className="w-8 h-8 rounded-full bg-gradient-to-br from-neutral-900 to-neutral-600 dark:from-neutral-100 dark:to-neutral-400 flex items-center justify-center flex-shrink-0">
                <span className="text-white dark:text-neutral-900 font-semibold text-sm">
                  {user?.firstName?.[0]}{user?.lastName?.[0]}
                </span>
              </div>
              <div
                className={`flex-1 text-left min-w-0 transition-all duration-300 ${
                  isExpanded
                    ? "opacity-100 w-auto"
                    : "opacity-0 w-0 overflow-hidden"
                }`}
              >
                <p className="text-sm font-medium text-neutral-900 dark:text-neutral-100 truncate">
                  {user?.firstName} {user?.lastName}
                </p>
                <p className="text-xs text-neutral-500 dark:text-neutral-400 truncate">
                  {user?.email}
                </p>
              </div>
            </button>

            {/* Profile Dropdown */}
            {isProfileOpen && (
              <div
                className={`absolute bottom-full left-0 right-0 mb-2 bg-white dark:bg-neutral-900 border border-neutral-200 dark:border-neutral-800 rounded-lg shadow-lg overflow-hidden ${
                  isExpanded ? "" : "left-auto right-auto w-48 md:ml-3"
                }`}
              >
                <Link
                  href="/profile"
                  className="flex items-center gap-3 px-4 py-3 hover:bg-neutral-50 dark:hover:bg-neutral-800 transition-colors"
                  onClick={() => setIsProfileOpen(false)}
                >
                  <UserCircle className="w-4 h-4 text-neutral-600 dark:text-neutral-400" />
                  <span className="text-sm font-medium text-neutral-700 dark:text-neutral-300">
                    View Profile
                  </span>
                </Link>
                <button
                  onClick={() => {
                    setIsProfileOpen(false);
                    logout();
                  }}
                  className="w-full flex items-center gap-3 px-4 py-3 hover:bg-red-50 dark:hover:bg-red-950/30 transition-colors text-left border-t border-neutral-200 dark:border-neutral-800"
                >
                  <LogOut className="w-4 h-4 text-red-600 dark:text-red-400" />
                  <span className="text-sm font-medium text-red-600 dark:text-red-400">
                    Logout
                  </span>
                </button>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-y-auto w-full md:w-auto">
        {/* Mobile: Add padding to prevent content from being hidden under menu button */}
        <div className="md:hidden h-16" />
        {children}
      </main>
    </div>
  );
}
