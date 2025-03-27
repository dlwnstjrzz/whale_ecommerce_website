"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useSubscription } from "@/app/hooks/useSubscription";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function ProtectedRoute({ children }) {
  const { user, loading: authLoading } = useAuth();
  const { subscription, loading: subscriptionLoading } = useSubscription();
  const router = useRouter();

  // 인증 로딩 중일 때만 로딩 스피너 표시
  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    );
  }

  // 사용자가 없으면 로그인 페이지로 리다이렉션
  if (!user) {
    router.push("/login");
    return null;
  }

  // 구독 정보 로딩 중이면 children을 렌더링 (깜빡임 방지)
  if (subscriptionLoading) {
    return children;
  }

  // 구독 정보가 없거나 토큰 부족 시 리다이렉션
  if (!subscription || subscription.tokens < 2) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full p-6 bg-white rounded-lg shadow-md">
          <h2 className="text-2xl font-bold mb-4">토큰이 부족합니다</h2>
          <p className="text-gray-600 mb-6">
            태그 생성에는 2개의 토큰이 필요합니다. 현재 토큰이 부족합니다.
          </p>
          <Link href="/subscription/add-tokens">
            <Button className="w-full">추가 토큰 구매하기</Button>
          </Link>
        </div>
      </div>
    );
  }

  return children;
}
