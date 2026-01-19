import { useState } from "react";
import { useLocation, Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { trpc } from "@/lib/trpc";
import Layout from "@/components/Layout";
import { UserPlus, Mail, Lock, User, Plane, Check } from "lucide-react";

export default function Register() {
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [, navigate] = useLocation();
  const registerMutation = trpc.auth.register.useMutation();

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username || !email || !password || !confirmPassword) {
      toast.error("모든 필드를 입력하세요.");
      return;
    }

    if (username.length < 3) {
      toast.error("사용자명은 최소 3자 이상이어야 합니다.");
      return;
    }

    if (password.length < 8) {
      toast.error("비밀번호는 최소 8자 이상이어야 합니다.");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("비밀번호가 일치하지 않습니다.");
      return;
    }

    setIsLoading(true);
    try {
      const result = await registerMutation.mutateAsync({
        username,
        email,
        password,
      });
      
      if (result.success) {
        toast.success("회원가입 성공! 로그인 페이지로 이동합니다.");
        navigate("/login");
      }
    } catch (error: any) {
      toast.error(error.message || "회원가입 실패");
    } finally {
      setIsLoading(false);
    }
  };

  const passwordStrength = password.length >= 8 ? "strong" : password.length >= 4 ? "medium" : "weak";

  return (
    <Layout>
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
        {/* Animated background elements */}
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-20 left-10 w-80 h-80 bg-blue-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse" />
          <div className="absolute top-40 right-10 w-80 h-80 bg-purple-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-2000" />
          <div className="absolute bottom-20 left-1/2 w-80 h-80 bg-pink-500 rounded-full mix-blend-multiply filter blur-3xl animate-pulse animation-delay-4000" />
        </div>

        <div className="w-full max-w-md relative z-10">
          {/* Logo Section */}
          <div className="text-center mb-10">
            <div className="flex justify-center mb-4">
              <div className="relative">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-full blur-lg opacity-75" />
                <div className="relative bg-gradient-to-br from-blue-600 to-purple-600 rounded-full p-4">
                  <Plane className="h-10 w-10 text-white" />
                </div>
              </div>
            </div>
            <h1 className="text-4xl font-bold text-white mb-2">Flight Livery Hub</h1>
            <p className="text-gray-300">커뮤니티에 가입하세요</p>
          </div>

          {/* Register Card */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-8 border border-white/20 shadow-2xl">
            <form onSubmit={handleRegister} className="space-y-5">
              {/* Username Field */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  사용자명
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="text"
                    value={username}
                    onChange={(e) => setUsername(e.target.value)}
                    placeholder="사용자명 (최소 3자)"
                    disabled={isLoading}
                    className="pl-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-400 h-12"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">3자 이상의 영문, 숫자, 언더스코어 조합</p>
              </div>

              {/* Email Field */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  이메일
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="이메일 주소"
                    disabled={isLoading}
                    className="pl-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-400 h-12"
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">유효한 이메일 주소를 입력하세요</p>
              </div>

              {/* Password Field */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  비밀번호
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="비밀번호 (최소 8자)"
                    disabled={isLoading}
                    className="pl-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-400 h-12"
                  />
                </div>
                {password && (
                  <div className="mt-2">
                    <div className="flex gap-1">
                      {[0, 1, 2].map((i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors ${
                            passwordStrength === "strong"
                              ? "bg-green-500"
                              : passwordStrength === "medium"
                              ? "bg-yellow-500"
                              : "bg-red-500"
                          } ${i > (passwordStrength === "weak" ? 0 : passwordStrength === "medium" ? 1 : 2) && "opacity-30"}`}
                        />
                      ))}
                    </div>
                    <p className="text-xs text-gray-400 mt-1">
                      강도: {passwordStrength === "strong" ? "강함" : passwordStrength === "medium" ? "중간" : "약함"}
                    </p>
                  </div>
                )}
              </div>

              {/* Confirm Password Field */}
              <div>
                <label className="block text-sm font-semibold text-white mb-2">
                  비밀번호 확인
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="비밀번호 확인"
                    disabled={isLoading}
                    className="pl-12 bg-white/5 border-white/20 text-white placeholder:text-gray-400 focus:bg-white/10 focus:border-blue-400 h-12"
                  />
                </div>
                {confirmPassword && password === confirmPassword && (
                  <div className="flex items-center gap-2 mt-2 text-green-400 text-xs">
                    <Check className="h-4 w-4" />
                    비밀번호가 일치합니다
                  </div>
                )}
                {confirmPassword && password !== confirmPassword && (
                  <p className="text-xs text-red-400 mt-1">비밀번호가 일치하지 않습니다</p>
                )}
              </div>

              {/* Register Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold text-base shadow-lg hover:shadow-xl transition-all duration-300 mt-6"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    가입 중...
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <UserPlus className="h-5 w-5" />
                    회원가입
                  </div>
                )}
              </Button>
            </form>

            {/* Divider */}
            <div className="relative my-8">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/20" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white/5 text-gray-400">또는</span>
              </div>
            </div>

            {/* Login Link */}
            <div className="text-center">
              <p className="text-gray-300 text-sm">
                이미 계정이 있으신가요?{" "}
                <Link href="/login" className="text-blue-400 hover:text-blue-300 font-semibold transition-colors">
                  로그인
                </Link>
              </p>
            </div>
          </div>

          {/* Footer Info */}
          <div className="mt-8 text-center text-xs text-gray-400">
            <p>가입하면 서비스 약관과 개인정보처리방침에 동의하는 것입니다.</p>
          </div>
        </div>
      </div>
    </Layout>
  );
}
