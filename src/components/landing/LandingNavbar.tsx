import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "@/hooks/useAuth";
import {
  Menu,
  X,
  ArrowRight,
  LayoutDashboard,
} from "lucide-react";

import { BrandLogo } from "@/components/common/BrandLogo";

interface LandingNavbarProps {
  onOpenDemo?: () => void;
}

export function LandingNavbar({ onOpenDemo }: LandingNavbarProps) {
  const { user, isAuthenticated } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const navLinks = [
    { label: "Fitur", href: "#fitur" },
    { label: "Cara Pakai", href: "#cara-kerja" },
    { label: "Perbandingan", href: "#perbandingan" },
    { label: "Harga", href: "#harga" },
    { label: "FAQ", href: "#faq" },
  ];

  return (
    <header
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 backdrop-blur-md shadow-xs border-b border-slate-200/80 py-2.5"
          : "bg-transparent py-4 sm:py-5"
      }`}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between">
          {/* Logo Brand */}
          <Link
            to="/"
            className="group focus:outline-hidden hover:opacity-90 transition-opacity"
            id="brand-logo"
          >
            <BrandLogo size="md" showTagline={true} />
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden md:flex items-center gap-6">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                className="text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                {item.label}
              </a>
            ))}
          </nav>

          {/* Desktop Auth / Action Buttons */}
          <div className="hidden md:flex items-center gap-3">
            {onOpenDemo && (
              <button
                type="button"
                onClick={onOpenDemo}
                id="btn-nav-demo"
                className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              >
                Lihat Demo
              </button>
            )}

            {isAuthenticated ? (
              <Link
                to={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
                id="btn-nav-dashboard"
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
              >
                <LayoutDashboard className="w-3.5 h-3.5" />
                <span>Dashboard ({user?.fullName?.split(" ")[0] || "Saya"})</span>
              </Link>
            ) : (
              <>
                <Link
                  to="/login"
                  id="btn-nav-login"
                  className="px-3.5 py-2 text-xs font-semibold text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                >
                  Masuk
                </Link>
                <Link
                  to="/register"
                  id="btn-nav-register"
                  className="px-4 py-2 text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg shadow-xs flex items-center gap-1.5 transition-colors"
                >
                  <span>Buat Undangan</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </Link>
              </>
            )}
          </div>

          {/* Mobile Menu Toggle Button */}
          <div className="flex items-center gap-2 md:hidden">
            <button
              type="button"
              id="mobile-menu-toggle"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
              aria-label="Toggle Menu"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="md:hidden border-b border-slate-200 bg-white px-5 py-4 shadow-lg animate-in fade-in duration-150">
          <div className="flex flex-col gap-3">
            {navLinks.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileMenuOpen(false)}
                className="text-sm font-medium text-slate-700 py-1.5 hover:text-primary transition-colors"
              >
                {item.label}
              </a>
            ))}

            <div className="pt-3 mt-2 border-t border-slate-100 flex flex-col gap-2">
              {onOpenDemo && (
                <button
                  type="button"
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onOpenDemo();
                  }}
                  className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors"
                >
                  Lihat Demo Undangan
                </button>
              )}

              {isAuthenticated ? (
                <Link
                  to={user?.role === "ADMIN" ? "/admin/dashboard" : "/dashboard"}
                  onClick={() => setMobileMenuOpen(false)}
                  className="w-full py-2.5 text-center text-xs font-semibold text-white bg-slate-900 rounded-lg flex items-center justify-center gap-1.5"
                >
                  <LayoutDashboard className="w-3.5 h-3.5" />
                  Buka Dashboard
                </Link>
              ) : (
                <>
                  <Link
                    to="/login"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-semibold text-slate-700 hover:bg-slate-100 rounded-lg transition-colors"
                  >
                    Masuk
                  </Link>
                  <Link
                    to="/register"
                    onClick={() => setMobileMenuOpen(false)}
                    className="w-full py-2.5 text-center text-xs font-semibold text-white bg-primary hover:bg-primary-hover rounded-lg flex items-center justify-center gap-1.5"
                  >
                    <span>Buat Undangan Gratis</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
