import React, { useState } from "react";
import { NavLink } from "react-router-dom";
import {
  LayoutDashboard, Upload, FileText, Receipt,
  FileCheck, Briefcase, Users, Settings, Menu, X,
} from "lucide-react";
import { cn } from "../../utils/helpers";

const navigation = [
  { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
  { name: "Upload",    href: "/upload",    icon: Upload },
  { name: "Invoices",  href: "/invoices",  icon: FileText },
  { name: "Receipts",  href: "/receipts",  icon: Receipt },
  { name: "Resumes",   href: "/resumes",   icon: Users },
  { name: "Contracts", href: "/contracts", icon: FileCheck },
  { name: "Jobs",      href: "/jobs",      icon: Briefcase },
  { name: "Settings",  href: "/settings",  icon: Settings },
];

const Sidebar: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <>
      {/* Mobile toggle */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="lg:hidden fixed top-4 left-4 z-50 p-2 rounded-md bg-[#0A0A0A] text-white border border-[#222] shadow-lg hover:border-white/20 transition-all"
      >
        {isOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
      </button>

      {/* Backdrop */}
      {isOpen && (
        <div
          className="lg:hidden fixed inset-0 bg-black/70 backdrop-blur-sm z-30"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={cn(
          "fixed top-0 left-0 h-full z-40 transition-transform duration-300 ease-in-out",
          "w-64 flex flex-col bg-[#000000] border-r border-[#111111]",
          isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
        )}
      >
        {/* Logo */}
        <div className="h-16 flex items-center px-6 border-b border-[#111111]">
          <div className="w-8 h-8 bg-white rounded-md flex items-center justify-center mr-3 flex-shrink-0">
            <FileText className="w-4 h-4 text-black" />
          </div>
          <span className="text-lg font-bold text-white tracking-tight font-heading">DocuFlow</span>
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 py-5 space-y-0.5 overflow-y-auto scrollbar-hide">
          {navigation.map((item) => (
            <NavLink
              key={item.name}
              to={item.href}
              onClick={() => setIsOpen(false)}
              className={({ isActive }) =>
                cn(
                  "group flex items-center px-3 py-2.5 text-sm font-semibold rounded-md transition-all duration-200 relative",
                  isActive
                    ? "bg-white text-black"
                    : "text-[#555555] hover:bg-[#0F0F0F] hover:text-white",
                )
              }
            >
              {({ isActive }) => (
                <>
                  <item.icon
                    className={cn(
                      "w-4 h-4 mr-3 flex-shrink-0 transition-all duration-200",
                      isActive ? "text-black" : "text-[#444444] group-hover:text-white",
                    )}
                  />
                  <span className="tracking-tight">{item.name}</span>
                  {/* Active indicator dot */}
                  {isActive && (
                    <span className="ml-auto w-1.5 h-1.5 rounded-full bg-black" />
                  )}
                </>
              )}
            </NavLink>
          ))}
        </nav>

        {/* Footer */}
        <div className="p-4 border-t border-[#111111]">
          <div className="flex items-center gap-2 px-3">
            <div className="w-1.5 h-1.5 rounded-full bg-[#4ADE80] animate-pulse" />
            <p className="text-[10px] text-[#333333] uppercase tracking-widest font-bold">
              DocuFlow v1.0
            </p>
          </div>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
