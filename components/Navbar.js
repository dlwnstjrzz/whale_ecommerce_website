"use client";

import { useAuth } from "@/lib/authContext";
import { useSubscription } from "@/app/hooks/useSubscription";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { usePathname } from "next/navigation";

export default function Navbar() {
  const { user, logOut } = useAuth();
  const { subscription } = useSubscription();
  const pathname = usePathname();

  const handleLogout = async () => {
    try {
      await logOut();
    } catch (error) {
      console.error("로그아웃 오류:", error);
    }
  };

  // 내비게이션 링크 정의
  const navLinks = [
    { name: "AI 상품명 가공", path: "/" },
    { name: "상세페이지 분석", path: "/detail-analysis" },
    { name: "태그 생성", path: "/tag-generator" },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* 로고 영역 */}
          <div className="flex items-center">
            <Link href="/" className="flex items-center">
              <span className="text-xl font-bold bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                AI 상품 도우미
              </span>
            </Link>
          </div>

          {/* 메인 네비게이션 */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "px-4 py-2 font-medium rounded-full transition-all duration-200",
                  pathname === link.path
                    ? "bg-primary text-white shadow-sm"
                    : "text-gray-700 hover:bg-gray-100"
                )}
              >
                {link.name}
              </Link>
            ))}
          </nav>

          {/* 사용자 영역 */}
          <div className="flex items-center space-x-3">
            {user && subscription && (
              <div className="hidden sm:flex items-center space-x-2">
                <div className="px-3 py-1.5 bg-blue-100 rounded-full text-sm font-medium text-primary border border-blue-200">
                  <span className="font-bold text-lg">
                    {subscription.tokens || 0}
                  </span>{" "}
                  토큰
                </div>
                <Link href="/subscription">
                  <Button
                    size="sm"
                    variant="outline"
                    className="rounded-full border-blue-200 text-primary hover:bg-blue-50"
                  >
                    충전하기
                  </Button>
                </Link>
              </div>
            )}

            {user ? (
              <div className="flex items-center space-x-2">
                {user.photoURL ? (
                  <img
                    src={user.photoURL}
                    alt={user.displayName || "사용자"}
                    className="w-8 h-8 rounded-full ring-2 ring-gray-100"
                  />
                ) : (
                  <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-primary font-bold">
                    {user.displayName?.[0] || "U"}
                  </div>
                )}
                <div className="hidden sm:block">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="rounded-full border-gray-200"
                  >
                    로그아웃
                  </Button>
                </div>
              </div>
            ) : (
              <Link href="/login">
                <Button className="rounded-full shadow-sm">로그인</Button>
              </Link>
            )}
          </div>
        </div>
      </div>

      {/* 모바일 네비게이션 */}
      <div className="md:hidden border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-4">
          <div className="flex justify-between">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={cn(
                  "flex-1 py-2 text-center text-xs font-medium",
                  pathname === link.path
                    ? "text-primary border-t-2 border-primary"
                    : "text-gray-600"
                )}
              >
                {link.name}
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* 모바일 토큰 표시 */}
      {user && subscription && subscription.tokens > 0 && (
        <div className="md:hidden border-t border-gray-100 bg-blue-50 p-2">
          <div className="flex justify-center items-center">
            <div className="px-3 py-1 bg-white rounded-full text-sm font-medium text-primary border border-blue-200">
              <span className="font-bold">{subscription.tokens || 0}</span> 토큰
              보유 중
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
