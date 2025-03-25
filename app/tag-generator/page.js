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
import { Badge } from "@/components/ui/badge";
import { useSubscription } from "../hooks/useSubscription";
import Link from "next/link";

export default function TagGenerator() {
  const [productName, setProductName] = useState("");
  const [productDescription, setProductDescription] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [generatedTags, setGeneratedTags] = useState(null);
  const { subscription } = useSubscription();

  // 이 페이지는 기능 로직 구현 없이 UI만 있는 상태입니다.
  const handleSubmit = (e) => {
    e.preventDefault();
    // 태그 생성 로직은 구현되지 않았습니다.
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      // 임시 태그 데이터
      setGeneratedTags({
        primary: ["여름옷", "반팔티", "캐주얼"],
        secondary: ["면티셔츠", "데일리룩", "심플디자인", "20대여성", "유니크"],
        trending: ["여름신상", "데일리", "오피스룩", "세일"],
      });
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

          {/* 페이지 제목 */}
          <div className="mb-8 text-center">
            <h1 className="text-3xl font-bold mb-2">AI 태그 생성</h1>
            <p className="text-gray-600 max-w-3xl mx-auto">
              상품 정보를 입력하면 AI가 최적화된 검색 태그를 생성해 드립니다.
              검색 노출을 극대화하여 판매량을 높이세요.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            {/* 입력 폼 */}
            <Card>
              <CardHeader>
                <CardTitle>태그 생성</CardTitle>
                <CardDescription>
                  상품 정보를 입력하면 최적화된 검색 태그를 생성합니다 (소요
                  토큰: 2개)
                </CardDescription>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="productName">상품명</Label>
                    <Input
                      id="productName"
                      placeholder="예: 여름용 오버핏 코튼 반팔 티셔츠"
                      value={productName}
                      onChange={(e) => setProductName(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="productDescription">상품 설명</Label>
                    <Textarea
                      id="productDescription"
                      placeholder="상품의 특징, 장점, 소재, 사용법 등을 자세히 입력하세요..."
                      className="min-h-[120px]"
                      value={productDescription}
                      onChange={(e) => setProductDescription(e.target.value)}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="imageUrl">상품 이미지 URL (선택사항)</Label>
                    <Input
                      id="imageUrl"
                      placeholder="https://example.com/image.jpg"
                      value={imageUrl}
                      onChange={(e) => setImageUrl(e.target.value)}
                    />
                    <p className="text-xs text-gray-500">
                      이미지 URL을 입력하면 이미지 분석을 통해 더 정확한 태그를
                      생성합니다
                    </p>
                  </div>

                  <div className="pt-4">
                    <Button
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
              </CardContent>
            </Card>

            {/* 결과 영역 */}
            <Card>
              <CardHeader>
                <CardTitle>생성된 태그</CardTitle>
                <CardDescription>
                  AI가 생성한 최적화된 검색 태그입니다
                </CardDescription>
              </CardHeader>
              <CardContent>
                {!generatedTags && !isLoading ? (
                  <div className="flex items-center justify-center h-60 text-gray-400 text-center">
                    <div>
                      <p>왼쪽의 상품 정보를 입력하고</p>
                      <p>태그 생성하기 버튼을 클릭하세요</p>
                    </div>
                  </div>
                ) : isLoading ? (
                  <div className="flex items-center justify-center h-60 text-gray-400">
                    <div className="text-center">
                      <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                      <p>태그를 생성 중입니다...</p>
                      <p className="text-sm mt-2">잠시만 기다려주세요</p>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        주요 태그
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {generatedTags.primary.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="default"
                            className="px-3 py-1"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        보조 태그
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {generatedTags.secondary.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="px-3 py-1 bg-blue-50"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <h3 className="text-sm font-medium text-gray-500 mb-2">
                        인기 태그
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {generatedTags.trending.map((tag, index) => (
                          <Badge
                            key={index}
                            variant="outline"
                            className="px-3 py-1 bg-green-50"
                          >
                            {tag}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div className="pt-4">
                      <Button variant="outline" className="w-full">
                        모든 태그 복사하기
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </ProtectedRoute>
    </main>
  );
}
