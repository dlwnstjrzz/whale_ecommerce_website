"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSubscription } from "../hooks/useSubscription";
import Link from "next/link";

export default function TagGenerator() {
  const [tagProductName, setTagProductName] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { subscription } = useSubscription();

  const handleSubmit = (e) => {
    e.preventDefault();
    setIsLoading(true);
    // 태그 생성 로직은 구현되지 않았습니다.
    setTimeout(() => {
      setIsLoading(false);
    }, 1500);
  };

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <ProtectedRoute>
        <div className="max-w-7xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
          {/* 알림 섹션 */}
          {(!subscription || subscription.status !== "active") && (
            <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <p className="text-yellow-700 mb-2">
                AI 태그 생성을 위해서는 구독이 필요합니다.
              </p>
              <Link href="/subscription">
                <Button size="sm">구독 플랜 선택하기</Button>
              </Link>
            </div>
          )}

          {subscription &&
            subscription.status === "active" &&
            subscription.tokens < 2 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 mb-2">
                  태그 생성에는 2개의 토큰이 필요합니다. 현재 토큰이 부족합니다.
                </p>
                <Link href="/subscription/add-tokens">
                  <Button size="sm">추가 토큰 구매하기</Button>
                </Link>
              </div>
            )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="tagProductName">상품명</Label>
              <Input
                id="tagProductName"
                placeholder="예: 여름용 오버핏 코튼 반팔 티셔츠"
                value={tagProductName}
                onChange={(e) => setTagProductName(e.target.value)}
              />
            </div>

            <div className="pt-4">
              <Button
                id="naver-scrape-btn"
                type="submit"
                disabled={
                  isLoading ||
                  !subscription ||
                  subscription.status !== "active" ||
                  subscription.tokens < 2
                }
                className="w-full"
              >
                {isLoading ? "태그 생성 중..." : "태그 생성하기"}
              </Button>
            </div>
          </form>
        </div>
      </ProtectedRoute>
    </main>
  );
}
