"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useSubscription } from "@/app/hooks/useSubscription";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function AddTokensPage() {
  const { user } = useAuth();
  const { subscription, loading, addTokensForDebug } = useSubscription();
  const [processingPackage, setProcessingPackage] = useState(null);
  const router = useRouter();

  // 실제 구현에서는 결제 시스템과 연동
  const handlePurchase = async (tokenPackage) => {
    setProcessingPackage(tokenPackage);

    try {
      // 디버깅 모드: 즉시 토큰 추가
      await addTokensForDebug(tokenPackage.tokens);

      alert(`${tokenPackage.tokens}개의 토큰이 추가되었습니다.`);

      // 메인 페이지로 이동
      router.push("/");
    } catch (error) {
      console.error("토큰 구매 오류:", error);
      alert(`토큰 구매 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setProcessingPackage(null);
    }
  };

  const tokenPackages = [
    {
      id: "small",
      tokens: 50,
      price: "5,000원",
      description: "소량 패키지",
    },
    {
      id: "medium",
      tokens: 100,
      price: "9,000원",
      description: "중량 패키지",
      discount: "10% 할인",
    },
    {
      id: "large",
      tokens: 250,
      price: "20,000원",
      description: "대량 패키지",
      discount: "20% 할인",
    },
  ];

  return (
    <div>
      <Navbar />
      <ProtectedRoute>
        <div className="container mx-auto py-8 px-4">
          <h1 className="text-3xl font-bold mb-2">추가 토큰 구매</h1>
          <p className="text-gray-600 mb-8">
            상품명 제작 서비스를 계속 이용하기 위한 추가 토큰을 구매하세요.
          </p>

          {subscription && (
            <div className="mb-8 p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <h2 className="font-semibold text-blue-700 text-lg">
                현재 토큰 정보
              </h2>
              <p>플랜: {subscription.plan || "구독 없음"}</p>
              <p>남은 토큰: {subscription.tokens || 0}개</p>
              {subscription.status === "active" && (
                <p>
                  다음 결제일:{" "}
                  {subscription.endDate
                    ? new Date(subscription.endDate).toLocaleDateString()
                    : "정보 없음"}
                </p>
              )}
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-6">
            {tokenPackages.map((pkg) => (
              <Card
                key={pkg.id}
                className={
                  pkg.id === "medium" ? "border-primary shadow-md" : ""
                }
              >
                <CardHeader>
                  <CardTitle>{pkg.description}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-3xl font-bold mb-2">{pkg.price}</p>
                  <p className="text-lg mb-2">토큰 {pkg.tokens}개</p>
                  {pkg.discount && (
                    <p className="text-green-600 text-sm">{pkg.discount}</p>
                  )}
                </CardContent>
                <CardFooter>
                  <Button
                    className="w-full"
                    variant={pkg.id === "medium" ? "default" : "outline"}
                    onClick={() => handlePurchase(pkg)}
                    disabled={
                      processingPackage !== null ||
                      !subscription ||
                      subscription.status !== "active"
                    }
                  >
                    {processingPackage === pkg ? "처리 중..." : "구매하기"}
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>

          {(!subscription || subscription.status !== "active") && (
            <div className="mt-8 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700">
                추가 토큰을 구매하기 전에 먼저 구독 플랜을 선택해주세요.
              </p>
              <Button
                className="mt-4"
                onClick={() => router.push("/subscription")}
              >
                구독 플랜 선택하기
              </Button>
            </div>
          )}
        </div>
      </ProtectedRoute>
    </div>
  );
}
