"use client";

import { useAuth } from "@/lib/authContext";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { FcGoogle } from "react-icons/fc";

export default function LoginPage() {
  const { user, signInWithGoogle } = useAuth();
  const router = useRouter();

  // 이미 로그인한 사용자는 메인 페이지로 리디렉션
  useEffect(() => {
    if (user) {
      router.push("/");
    }
  }, [user, router]);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
      router.push("/");
    } catch (error) {
      console.error("로그인 오류:", error);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-8 bg-white rounded-lg shadow-md">
        <div className="text-center">
          <h1 className="text-3xl font-bold">로그인</h1>
          <p className="mt-2 text-gray-600">
            상품명 제작 서비스를 이용하려면 로그인이 필요합니다.
          </p>
        </div>

        <div className="mt-8 space-y-6">
          <Button
            onClick={handleGoogleSignIn}
            className="w-full flex items-center justify-center gap-2 py-6"
            variant="outline"
          >
            <FcGoogle className="w-6 h-6" />
            <span>구글로 로그인하기</span>
          </Button>
        </div>
      </div>
    </div>
  );
}
