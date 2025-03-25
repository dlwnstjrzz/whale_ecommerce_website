"use client";

import { useState } from "react";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useSubscription } from "../hooks/useSubscription";
import Link from "next/link";

export default function DetailAnalysis() {
  const [url, setUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { subscription } = useSubscription();

  // 이 페이지는 기능 로직 구현 없이 UI만 있는 상태입니다.
  const handleSubmit = (e) => {
    e.preventDefault();
    // 분석 로직은 구현되지 않았습니다.
    setIsLoading(true);
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
                AI 상세페이지 분석을 위해서는 구독이 필요합니다.
              </p>
              <Link href="/subscription">
                <Button size="sm">구독 플랜 선택하기</Button>
              </Link>
            </div>
          )}

          {subscription &&
            subscription.status === "active" &&
            subscription.tokens < 3 && (
              <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <p className="text-yellow-700 mb-2">
                  상세페이지 분석에는 3개의 토큰이 필요합니다. 현재 토큰이
                  부족합니다.
                </p>
                <Link href="/subscription/add-tokens">
                  <Button size="sm">추가 토큰 구매하기</Button>
                </Link>
              </div>
            )}

          {/* 페이지 제목 */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">AI 상세페이지 분석</h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              상품 상세페이지의 URL을 입력하면 AI가 판매 페이지를 분석하여
              개선점을 찾아드립니다. 구매 전환율을 높이는 팁과 경쟁사 대비
              차별점을 발견하세요.
            </p>
          </div>

          {/* 분석 입력 폼 */}
          <Card className="max-w-3xl mx-auto">
            <CardHeader>
              <CardTitle>상세페이지 분석</CardTitle>
              <CardDescription>
                상품 URL을 입력하시거나 상세페이지 내용을 직접 붙여넣기 하세요
                (소요 토큰: 3개)
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="url">상품 URL</Label>
                  <Input
                    id="url"
                    placeholder="https://www.example.com/product/123"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                  />
                  <p className="text-xs text-gray-500">
                    분석할 상품 상세페이지의 URL을 입력하세요
                  </p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="content">
                    또는 상세페이지 내용 직접 입력
                  </Label>
                  <Textarea
                    id="content"
                    placeholder="상세페이지 내용을 복사하여 붙여넣으세요..."
                    className="min-h-[200px]"
                  />
                </div>

                <div className="pt-4">
                  <Button
                    type="submit"
                    disabled={
                      isLoading ||
                      !subscription ||
                      subscription.status !== "active" ||
                      subscription.tokens < 3
                    }
                    className="w-full"
                  >
                    {isLoading ? "분석 중..." : "상세페이지 분석하기"}
                  </Button>
                </div>
              </form>
            </CardContent>
          </Card>

          {/* 분석 결과는 기능 구현 시 추가될 예정입니다 */}
        </div>
      </ProtectedRoute>
    </main>
  );
}
