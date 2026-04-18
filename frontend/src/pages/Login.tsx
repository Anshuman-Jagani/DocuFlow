import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { loginSchema, type LoginFormData } from "../utils/validation";
import { useAuthStore } from "../stores/authStore";
import { useToast } from "../components/ui/Toast";
import api from "../services/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { FileText, CheckCircle2, Zap, Eye, EyeOff } from "lucide-react";

const Login: React.FC = () => {
  const navigate = useNavigate();
  const { login } = useAuthStore();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const { register, handleSubmit, formState: { errors } } = useForm<LoginFormData>({ resolver: zodResolver(loginSchema) });

  const onSubmit = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const response = await api.post("/api/auth/login", data);
      const { accessToken, refreshToken, user } = response.data.data;
      login(accessToken, refreshToken, user);
      showToast("Login successful!", "success");
      navigate("/dashboard");
    } catch (error: any) {
      showToast(error.response?.data?.error?.message || "Login failed. Please try again.", "error");
    } finally { setIsLoading(false); }
  };

  const features = [
    { icon: Zap, text: "Lightning fast AI-powered extraction" },
    { icon: CheckCircle2, text: "99.9% accuracy for documents" },
  ];

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-black relative overflow-hidden">
      {/* Floating background icons */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <svg className="absolute opacity-[0.03] animate-float-slow" style={{ top: '10%', left: '8%', width: 80 }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.8">
          <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
        </svg>
        <svg className="absolute opacity-[0.025] animate-float-medium" style={{ bottom: '15%', left: '5%', width: 60 }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.8">
          <line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
        </svg>
        <svg className="absolute opacity-[0.02] animate-float-slow" style={{ top: '40%', right: '4%', width: 90 }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.7">
          <rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/>
        </svg>
        <svg className="absolute opacity-[0.025] animate-float-fast" style={{ bottom: '8%', right: '10%', width: 55 }} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="0.8">
          <line x1="4" y1="9" x2="20" y2="9"/><line x1="4" y1="15" x2="20" y2="15"/><line x1="10" y1="3" x2="8" y2="21"/><line x1="16" y1="3" x2="14" y2="21"/>
        </svg>
      </div>

      <div className="relative z-10 w-full max-w-[960px] flex flex-col md:flex-row items-stretch gap-0 bg-[#0A0A0A] border border-[#111111] rounded-2xl shadow-2xl overflow-hidden">
        {/* Branding side */}
        <div className="hidden md:flex md:w-[50%] flex-col justify-between p-10 relative bg-black border-r border-[#111111]">
          {/* Logo */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-white rounded-md flex items-center justify-center">
              <FileText className="w-5 h-5 text-black" />
            </div>
            <span className="text-xl font-bold tracking-tight text-white">DocuFlow</span>
          </div>

          {/* Copy */}
          <div className="space-y-8">
            <h2 className="text-3xl font-bold leading-tight text-white">
              <span className="whitespace-nowrap">Intelligent Document</span><br />
              Processing,<br />
              <span className="text-white/40">Atomated.</span>
            </h2>
            <p className="text-sm text-[#333333] leading-relaxed">
              The future of document workflows. AI-powered extraction, analysis, and insights — all in one platform.
            </p>
            <div className="space-y-4">
              {features.map(({ icon: Icon, text }, i) => (
                <div key={i} className="flex items-center gap-4 group hover-lift cursor-default">
                  <div className="w-9 h-9 rounded-md bg-[#0A0A0A] border border-[#111111] flex items-center justify-center group-hover:border-white/10 transition-all">
                    <Icon className="w-4 h-4 text-[#333333] group-hover:text-white transition-colors" />
                  </div>
                  <p className="text-sm text-[#444444] group-hover:text-white transition-colors">{text}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* Form side */}
        <div className="flex-1 flex flex-col justify-center p-8 lg:p-14">
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile logo */}
            <div className="md:hidden flex items-center gap-3 mb-10">
              <div className="w-9 h-9 bg-white rounded-md flex items-center justify-center">
                <FileText className="w-5 h-5 text-black" />
              </div>
              <span className="text-xl font-bold text-white tracking-tight">DocuFlow</span>
            </div>

            <div className="mb-8">
              <h1 className="text-2xl font-bold text-white mb-1 tracking-tight">Sign in</h1>
              <p className="text-xs text-[#333333]">Enter your credentials to continue</p>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
              <Input label="Email" type="email" placeholder="you@example.com" error={errors.email?.message} {...register("email")} />

              <div>
                <div className="flex justify-between items-center mb-1.5">
                  <label className="text-[10px] font-bold text-[#333333] tracking-[0.15em] uppercase">Password</label>
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="••••••••"
                    {...register('password')}
                    className="w-full px-3 py-2.5 pr-10 bg-[#0A0A0A] border rounded-md text-white placeholder-[#333333] outline-none transition-all duration-200 text-sm focus:border-white/30 focus:shadow-glow-white-sm border-[#1A1A1A]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(v => !v)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444444] hover:text-white transition-colors focus:outline-none"
                    tabIndex={-1}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                  {errors.password && <p className="mt-1.5 text-[11px] text-[#F87171]">{errors.password.message}</p>}
                </div>
              </div>

              <Button type="submit" variant="primary" className="w-full py-3 font-bold uppercase tracking-widest text-xs" isLoading={isLoading}>
                Sign In
              </Button>
            </form>

            <p className="text-center text-xs text-[#333333] mt-8">
              Don't have an account?{' '}
              <Link to="/register" className="text-white hover:underline font-bold transition-colors">Register</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;
