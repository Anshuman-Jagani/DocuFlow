import React, { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router-dom";
import { registerSchema, type RegisterFormData } from "../utils/validation";
import { useToast } from "../components/ui/Toast";
import api from "../services/api";
import Input from "../components/ui/Input";
import Button from "../components/ui/Button";
import { FileText, ShieldCheck, Zap, ArrowRight, Eye, EyeOff } from "lucide-react";

const Register: React.FC = () => {
  const navigate = useNavigate();
  const { showToast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password", "");

  // Password strength indicator
  const getPasswordStrength = (pwd: string) => {
    if (!pwd) return { strength: 0, label: "", color: "" };
    let strength = 0;
    if (pwd.length >= 6) strength++;
    if (pwd.length >= 10) strength++;
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++;
    if (/\d/.test(pwd)) strength++;
    if (/[^a-zA-Z\d]/.test(pwd)) strength++;

    const labels = ["Weak", "Fair", "Good", "Strong", "Very Strong"];
    const colors = [
      "bg-danger",
      "bg-warning",
      "bg-warning",
      "bg-success",
      "bg-success",
    ];

    return {
      strength: (strength / 5) * 100,
      label: labels[Math.min(strength - 1, 4)] || "",
      color: colors[Math.min(strength - 1, 4)] || "",
    };
  };

  const passwordStrength = getPasswordStrength(password);

  const onSubmit = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      await api.post("/api/auth/register", {
        full_name: data.full_name,
        email: data.email,
        password: data.password,
      });

      showToast("Registration successful! Please login.", "success");
      setTimeout(() => navigate("/login"), 1500);
    } catch (error: any) {
      showToast(
        error.response?.data?.error?.message ||
          "Registration failed. Please try again.",
        "error",
      );
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 md:p-8 bg-black relative overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-gradient-to-tr from-black via-black to-black" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_10%_20%,rgba(245,197,66,0.05),transparent)]" />
      </div>

      <div className="relative z-10 w-full max-w-[1000px] flex flex-col md:flex-row items-stretch gap-0 bg-[#0A0A0A] border border-[#111111] rounded-3xl shadow-2xl overflow-hidden">
        {/* Branding Side */}
        <div className="hidden md:flex md:w-[45%] flex-col justify-between p-12 lg:p-16 relative bg-black">
          <div className="absolute right-0 top-1/4 bottom-1/4 w-[1px] bg-gradient-to-b from-transparent via-[#282828] to-transparent" />

          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="w-10 h-10 bg-[#0A0A0A] rounded-xl flex items-center justify-center border border-white/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold tracking-tight text-white">
                DocuFlow
              </span>
            </Link>
          </div>

          <div className="space-y-8">
            <h2 className="text-4xl lg:text-5xl font-bold leading-tight text-white">
              Unlock <span className="text-white">Intelligence</span> in
              seconds.
            </h2>
            <p className="text-lg text-[#444444] leading-relaxed">
              Sign up today and start automating your document workflows with
              our enterprise-grade AI engine.
            </p>

            <div className="space-y-6">
              {[
                {
                  icon: Zap,
                  label: "Smart Extraction",
                  sub: "Automatic data pick-up",
                },
                {
                  icon: ShieldCheck,
                  label: "Advanced Security",
                  sub: "Encrypted and private",
                },
              ].map((item, idx) => (
                <div key={idx} className="flex items-center gap-4 group">
                  <div className="w-10 h-10 rounded-xl bg-[#0A0A0A] flex items-center justify-center border border-[#111111] group-hover:border-white/30 transition-all">
                    <item.icon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="font-semibold text-white group-hover:text-white transition-colors">
                      {item.label}
                    </p>
                    <p className="text-xs text-[#444444]">{item.sub}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between text-[10px] text-[#444444] uppercase tracking-widest font-semibold">
            <span>© 2026 DocuFlow</span>
            <div className="flex gap-4">
              <Link
                to="/terms"
                className="hover:text-white transition-colors"
              >
                Terms
              </Link>
              <Link
                to="/privacy"
                className="hover:text-white transition-colors"
              >
                Privacy
              </Link>
            </div>
          </div>
        </div>

        {/* Form Side */}
        <div className="flex-1 flex flex-col justify-center p-8 lg:p-16 bg-[#0A0A0A] overflow-y-auto">
          <div className="w-full max-w-sm mx-auto">
            {/* Mobile Logo */}
            <div className="md:hidden flex items-center justify-center gap-3 mb-10">
              <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center border border-white/20">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <span className="text-2xl font-bold text-white tracking-tight">
                DocuFlow
              </span>
            </div>

            <div className="mb-10">
              <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">
                Create Account
              </h1>
            </div>

            <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
              <Input
                label="Full Name"
                type="text"
                placeholder="John Doe"
                error={errors.full_name?.message}
                {...register("full_name")}
              />

              <Input
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                error={errors.email?.message}
                {...register("email")}
              />

              <div className="space-y-3">
                <div className="relative">
                  <label className="block text-[10px] font-bold text-[#333333] tracking-[0.15em] uppercase mb-1.5">Password</label>
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
                  </div>
                  {errors.password && <p className="mt-1.5 text-[11px] text-[#F87171]">{errors.password.message}</p>}
                </div>

                <div className="relative">
                  <label className="block text-[10px] font-bold text-[#333333] tracking-[0.15em] uppercase mb-1.5">Confirm Password</label>
                  <div className="relative">
                    <input
                      type={showConfirmPassword ? 'text' : 'password'}
                      placeholder="••••••••"
                      {...register('confirmPassword')}
                      className="w-full px-3 py-2.5 pr-10 bg-[#0A0A0A] border rounded-md text-white placeholder-[#333333] outline-none transition-all duration-200 text-sm focus:border-white/30 focus:shadow-glow-white-sm border-[#1A1A1A]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(v => !v)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#444444] hover:text-white transition-colors focus:outline-none"
                      tabIndex={-1}
                      aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    >
                      {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  {errors.confirmPassword && <p className="mt-1.5 text-[11px] text-[#F87171]">{errors.confirmPassword.message}</p>}
                </div>

                {password && (
                  <div className="bg-[#0A0A0A] p-4 rounded-xl border border-[#111111] transition-all animate-fade-in">
                    <div className="flex items-center justify-between text-[10px] mb-2 uppercase tracking-wide">
                      <span className="text-[#444444] font-bold">
                        Security Level
                      </span>
                      <span
                        className={`font-bold ${passwordStrength.color.replace("bg-", "text-")}`}
                      >
                        {passwordStrength.label}
                      </span>
                    </div>
                    <div className="w-full bg-black rounded-full h-1.5 overflow-hidden">
                      <div
                        className={`h-full transition-all duration-500 ${passwordStrength.color}`}
                        style={{ width: `${passwordStrength.strength}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

              <div className="pt-4">
                <Button
                  type="submit"
                  variant="gray"
                  className="w-full py-4 h-14 font-bold rounded-xl uppercase tracking-widest text-sm shadow-glow-white-sm/10"
                  isLoading={isLoading}
                >
                  Initialize Account
                  <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </div>

              <p className="text-[10px] text-[#444444] text-center leading-relaxed px-4 uppercase tracking-tight font-bold">
                By clicking "Initialize Account", you agree to our{" "}
                <a href="#" className="underline hover:text-white">
                  Terms
                </a>{" "}
                and{" "}
                <a href="#" className="underline hover:text-white">
                  Privacy
                </a>
              </p>
            </form>

            <p className="text-center text-sm text-[#444444] mt-10 font-medium">
              Already have an account?{" "}
              <Link
                to="/login"
                className="text-white hover:underline font-bold transition-colors"
              >
                Sign In
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
