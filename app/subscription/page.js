"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/authContext";
import { useSubscription } from "@/app/hooks/useSubscription";
import Navbar from "@/components/Navbar";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from "@/components/ui/card";

export default function SubscriptionPage() {
  const { user } = useAuth();
  const { subscription, loading, activateSubscriptionForDebug } =
    useSubscription();
  const [processingPlan, setProcessingPlan] = useState(null);
  const router = useRouter();

  // 실제 구현에서는 결제 시스템과 연동
  const handleSubscribe = async (plan) => {
    setProcessingPlan(plan);

    try {
      // 디버깅 모드: 즉시 구독 활성화 및 토큰 제공
      await activateSubscriptionForDebug(plan.tokens, plan.id);

      alert(
        `${plan.name} 플랜 구독이 활성화되었습니다. ${plan.tokens}개의 토큰이 추가되었습니다.`
      );

      // 메인 페이지로 이동
      router.push("/");
    } catch (error) {
      console.error("구독 처리 오류:", error);
      alert(`구독 처리 중 오류가 발생했습니다: ${error.message}`);
    } finally {
      setProcessingPlan(null);
    }
  };

  const plans = [
    {
      id: "basic",
      name: "베이직",
      price: "10,000원",
      tokens: 100,
      features: ["월 100회 상품명 생성", "기본 지원", "매월 자동 갱신"],
    },
    {
      id: "pro",
      name: "프로",
      price: "25,000원",
      tokens: 300,
      features: ["월 300회 상품명 생성", "우선 지원", "매월 자동 갱신"],
    },
    {
      id: "business",
      name: "비즈니스",
      price: "70,000원",
      tokens: 1000,
      features: ["월 1000회 상품명 생성", "전용 지원", "매월 자동 갱신"],
    },
  ];

  return (
    <div>
      <Navbar />
      <div className="container mx-auto py-8 px-4">
        <h1 className="text-3xl font-bold mb-2">구독 플랜</h1>
        <p className="text-gray-600 mb-8">
          상품명 제작 서비스를 이용하기 위한 구독 플랜을 선택하세요.
        </p>

        {subscription && subscription.status === "active" && (
          <div className="mb-8 p-4 bg-green-50 border border-green-200 rounded-lg">
            <h2 className="font-semibold text-green-700 text-lg">
              현재 구독 중
            </h2>
            <p>플랜: {subscription.plan}</p>
            <p>남은 토큰: {subscription.tokens}개</p>
            <p>
              다음 결제일:{" "}
              {subscription.endDate
                ? new Date(subscription.endDate).toLocaleDateString()
                : "정보 없음"}
            </p>
          </div>
        )}

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <Card
              key={plan.id}
              className={plan.id === "pro" ? "border-primary shadow-md" : ""}
            >
              <CardHeader>
                <CardTitle>{plan.name}</CardTitle>
                <CardDescription>월 {plan.tokens}회 사용</CardDescription>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold mb-4">
                  {plan.price}
                  <span className="text-sm font-normal">/월</span>
                </p>
                <ul className="space-y-2">
                  {plan.features.map((feature, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button
                  className="w-full"
                  variant={plan.id === "pro" ? "default" : "outline"}
                  onClick={() => handleSubscribe(plan)}
                  disabled={
                    processingPlan !== null ||
                    (subscription?.status === "active" &&
                      subscription?.plan === plan.id)
                  }
                >
                  {processingPlan === plan
                    ? "처리 중..."
                    : subscription?.status === "active" &&
                      subscription?.plan === plan.id
                    ? "현재 플랜"
                    : "구독하기"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
