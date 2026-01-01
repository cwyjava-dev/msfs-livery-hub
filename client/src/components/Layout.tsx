import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/_core/hooks/useAuth";
import { getLoginUrl } from "@/const";
import { Plane, Upload, List, Mail, User } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { trpc } from "@/lib/trpc";
import { toast } from "sonner";

interface LayoutProps {
  children: React.ReactNode;
}

export default function Layout({ children }: LayoutProps) {
  const { user, isAuthenticated, loading } = useAuth();
  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      toast.success("로그아웃되었습니다");
      window.location.href = "/";
    },
  });

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <header className="border-b bg-card">
        <div className="container mx-auto">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <Link href="/">
              <div className="flex items-center gap-2 cursor-pointer hover:opacity-80 transition-opacity">
                <Plane className="h-6 w-6 text-primary" />
                <span className="text-xl font-bold text-foreground">Flight Livery Hub</span>
                <span className="text-xs bg-primary/10 text-primary px-2 py-1 rounded-md">BETA</span>
              </div>
            </Link>

            {/* Navigation */}
            <nav className="hidden md:flex items-center gap-6">
              <Link href="/liveries">
                <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                  리버리 목록
                </span>
              </Link>
              <Link href="/upload">
                <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                  업로드
                </span>
              </Link>
              <Link href="/contact">
                <span className="text-sm font-medium text-foreground hover:text-primary transition-colors cursor-pointer">
                  문의/신고
                </span>
              </Link>
            </nav>

            {/* Auth Section */}
            <div className="flex items-center gap-3">
              {loading ? (
                <div className="h-9 w-20 bg-muted animate-pulse rounded-md" />
              ) : isAuthenticated && user ? (
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm" className="gap-2">
                      <User className="h-4 w-4" />
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
                      className="cursor-pointer text-destructive"
                      onClick={() => logoutMutation.mutate()}
                    >
                      로그아웃
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              ) : (
                <Button size="sm" asChild>
                  <a href={getLoginUrl()}>로그인</a>
                </Button>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="border-t bg-card mt-auto">
        <div className="container mx-auto py-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div>
              <div className="flex items-center gap-2 mb-3">
                <Plane className="h-5 w-5 text-primary" />
                <span className="font-bold text-foreground">MSFS Livery Hub</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Microsoft Flight Simulator 리버리 공유 커뮤니티 플랫폼
              </p>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">빠른 링크</h3>
              <ul className="space-y-2 text-sm text-muted-foreground">
                <li>
                  <Link href="/liveries">
                    <span className="hover:text-primary transition-colors cursor-pointer">리버리 목록</span>
                  </Link>
                </li>
                <li>
                  <Link href="/upload">
                    <span className="hover:text-primary transition-colors cursor-pointer">업로드</span>
                  </Link>
                </li>
                <li>
                  <Link href="/contact">
                    <span className="hover:text-primary transition-colors cursor-pointer">문의/신고</span>
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold text-foreground mb-3">안내</h3>
              <p className="text-sm text-muted-foreground">
                본 사이트는 현재 베타 서비스 중입니다. 버그, 오류, 저작권 문제, 개선 제안은 문의 페이지를 통해 보내주세요.
              </p>
            </div>
          </div>
          <div className="mt-8 pt-8 border-t text-center text-sm text-muted-foreground">
            © 2026 MSFS Livery Hub. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
}
