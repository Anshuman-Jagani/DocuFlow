import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Bell, User, LogOut, Settings } from "lucide-react";
import { useAuthStore } from "../../stores/authStore";
import { useToast } from "../ui/Toast";

const Header: React.FC = () => {
  const navigate = useNavigate();
  const { user, logout } = useAuthStore();
  const { showToast } = useToast();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    logout();
    showToast("Logged out successfully", "success");
    navigate("/login");
  };

  return (
    <header className="h-14 bg-black border-b border-[#111111] flex items-center justify-between px-6 sticky top-0 z-20 backdrop-blur-sm">
      {/* Left */}
      <div className="flex-1">
        <p className="text-[10px] font-bold text-[#333333] uppercase tracking-[0.2em]">
          {user?.full_name ? `${user.full_name}'s Workspace` : "Workspace"}
        </p>
      </div>

      {/* Right */}
      <div className="flex items-center gap-3">
        {/* Bell */}
        <button className="relative p-2 text-[#333333] hover:text-white hover:bg-[#0A0A0A] rounded-md transition-all duration-200 group">
          <Bell className="w-4 h-4" />
          <span className="absolute top-2 right-2 w-1.5 h-1.5 bg-[#4ADE80] rounded-full" />
        </button>

        {/* User dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="flex items-center gap-2.5 px-3 py-1.5 hover:bg-[#0A0A0A] rounded-md border border-transparent hover:border-[#1A1A1A] transition-all duration-200 group"
          >
            <div className="w-7 h-7 bg-white rounded-md flex items-center justify-center flex-shrink-0">
              <User className="w-3.5 h-3.5 text-black" />
            </div>
            <div className="text-left hidden md:block">
              <p className="text-xs font-bold text-white tracking-tight leading-none">{user?.full_name}</p>
              <p className="text-[10px] text-[#333333] mt-0.5">{user?.email}</p>
            </div>
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute right-0 mt-2 w-44 bg-[#0A0A0A] rounded-md shadow-2xl border border-[#1A1A1A] py-1 z-50 animate-slide-up">
              <button
                onClick={() => { navigate("/settings"); setIsDropdownOpen(false); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#666666] hover:text-white hover:bg-[#111111] transition-colors"
              >
                <Settings className="w-3.5 h-3.5" />
                SETTINGS
              </button>
              <hr className="my-1 border-[#1A1A1A]" />
              <button
                onClick={handleLogout}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-bold text-[#F87171]/70 hover:text-[#F87171] hover:bg-[#F87171]/5 transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                SIGN OUT
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
};

export default Header;
