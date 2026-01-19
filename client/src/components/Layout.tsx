import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { Plane, Upload, List, Mail, User, Menu, X, Github, Heart } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";
import { useState } from "react";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("로그아웃되었습니다");
      window.location.href = "/";
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header - Modern Navigation */}
      <header className="sticky top-0 z-50 border-b border-white/10 bg-white/5 backdrop-blur-md">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity group">
                <div className="relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-purple-500 rounded-lg blur opacity-0 group-hover:opacity-100 transition-opacity" />
                  <div className="relative bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
                    <Plane className="h-5 w-5 text-white" />
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Flight Livery Hub
                  </span>
                  <span className="text-xs text-gray-500">BETA</span>
                </div>
              </div>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center gap-8">
              <Link href="/liveries">
                <span className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors cursor-pointer relative group">
                  리버리 목록
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
              <Link href="/upload">
                <span className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors cursor-pointer relative group">
                  업로드
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
              <Link href="/contact">
                <span className="text-sm font-medium text-gray-700 hover:text-blue-600 transition-colors cursor-pointer relative group">
                  문의/신고
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-gradient-to-r from-blue-600 to-purple-600 group-hover:w-full transition-all duration-300" />
                </span>
              </Link>
            </nav>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="h-9 w-20 bg-gray-200 animate-pulse rounded-lg" />
              ) : isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button className="gap-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      <div className="h-5 w-5 rounded-full bg-white/20 flex items-center justify-center">
                        <User className="h-3 w-3" />
                      </div>
                      {user.name || "사용자"}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-48">
                    <Link href="/my-liveries">
                      <DropdownMenuItem className="cursor-pointer">
                        <List className="h-4 w-4 mr-2" />
                        내 리버리
                      </DropdownMenuItem>
                    </Link>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem
                      className="cursor-pointer text-red-600"
                      onClick={() => logoutMutation.mutate()}
                    >
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <div className="hidden sm:flex items-center gap-2">
                  <Link href="/login">
                    <Button size="sm" variant="outline" className="border-gray-300 hover:bg-gray-50">
                      로그인
                    </Button>
                  </Link>
                  <Link href="/register">
                    <Button size="sm" className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                      회원가입
                    </Button>
                  </Link>
                </div>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="h-5 w-5 text-gray-700" />
                ) : (
                  <Menu className="h-5 w-5 text-gray-700" />
                )}
              </button>
            </div>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <div className="md:hidden pb-4 border-t border-gray-200">
              <nav className="flex flex-col gap-3 pt-4">
                <Link href="/liveries">
                  <span className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    리버리 목록
                  </span>
                </Link>
                <Link href="/upload">
                  <span className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    업로드
                  </span>
                </Link>
                <Link href="/contact">
                  <span className="block px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 rounded-lg cursor-pointer transition-colors">
                    문의/신고
                  </span>
                </Link>
                {!isAuthenticated && (
                  <div className="flex gap-2 pt-2">
                    <Link href="/login" className="flex-1">
                      <Button size="sm" variant="outline" className="w-full">
                        로그인
                      </Button>
                    </Link>
                    <Link href="/register" className="flex-1">
                      <Button size="sm" className="w-full bg-gradient-to-r from-blue-600 to-purple-600 text-white">
                        회원가입
                      </Button>
                    </Link>
                  </div>
                )}
              </nav>
            </div>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer - Modern Design */}
      <footer className="border-t border-gray-200 bg-gradient-to-b from-white to-gray-50 mt-auto">
        <div className="container mx-auto px-4 py-16">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            {/* Brand Section */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-2">
                  <Plane className="h-5 w-5 text-white" />
                </div>
                <span className="font-bold text-gray-900">MSFS Livery Hub</span>
              </div>
              <p className="text-sm text-gray-600 leading-relaxed">
                Microsoft Flight Simulator 리버리를 공유하고 다운로드하는 현대적 커뮤니티 플랫폼
              </p>
              <div className="flex gap-3 mt-4">
                <a href="#" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Github className="h-5 w-5 text-gray-600" />
                </a>
                <a href="#" className="p-2 hover:bg-gray-200 rounded-lg transition-colors">
                  <Heart className="h-5 w-5 text-gray-600" />
                </a>
              </div>
            </div>

            {/* Quick Links */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">빠른 링크</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <Link href="/liveries">
                    <span className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">리버리 목록</span>
                  </Link>
                </li>
                <li>
                  <Link href="/upload">
                    <span className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">업로드</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <span className="text-gray-600 hover:text-blue-600 transition-colors cursor-pointer">문의/신고</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Resources */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">리소스</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    설치 가이드
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    FAQ
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    커뮤니티 규칙
                  </a>
                </li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="font-semibold text-gray-900 mb-4">법적 고지</h3>
              <ul className="space-y-3 text-sm">
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    이용약관
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    개인정보처리방침
                  </a>
                </li>
                <li>
                  <a href="#" className="text-gray-600 hover:text-blue-600 transition-colors">
                    저작권 정책
                  </a>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row items-center justify-between gap-4">
              <p className="text-sm text-gray-600">
                © 2026 MSFS Livery Hub. All rights reserved.
              </p>
              <p className="text-sm text-gray-600">
                본 사이트는 현재 베타 서비스 중입니다. 버그, 오류, 저작권 문제, 개선 제안은 문의 페이지를 통해 보내주세요.
              </p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
