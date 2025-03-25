"use client";

import { useState } from "react";
import { ProductForm } from "./components/ProductForm";
import { ResultSection } from "./components/ResultSection";
import { ErrorMessage } from "./components/ErrorMessage";
import { useProductGenerator } from "./hooks/useProductGenerator";
import { useSubscription } from "./hooks/useSubscription";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import Navbar from "@/components/Navbar";
import ProtectedRoute from "@/components/ProtectedRoute";

export default function Home() {
  const {
    productNames,
    setProductNames,
    imageUrls,
    setImageUrls,
    isLoading,
    error,
    handleSubmit,
    results,
    processingIndexes,
  } = useProductGenerator();

  const { subscription } = useSubscription();

  const featureCards = [
    {
      title: "상세페이지 분석",
      description: "상품 상세페이지를 AI가 분석하여 개선점을 찾아드립니다.",
      path: "/detail-analysis",
      tokenCost: "3 토큰",
      icon: "🔍",
    },
    {
      title: "태그 생성",
      description:
        "상품 이미지와 설명을 기반으로 최적화된 검색 태그를 생성합니다.",
      path: "/tag-generator",
      tokenCost: "2 토큰",
      icon: "🏷️",
    },
  ];

  return (
    <main className="min-h-screen bg-gray-50">
      <Navbar />
      <ProtectedRoute>
        {/* 구독 알림 섹션 */}
        {(!subscription || subscription.status !== "active") && (
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <div className="p-5 bg-blue-50 border border-blue-100 rounded-lg flex flex-col sm:flex-row justify-between items-center">
              <div className="mb-4 sm:mb-0">
                <h3 className="text-lg font-semibold text-gray-900 mb-1">
                  AI 상품명 생성을 시작하세요
                </h3>
                <p className="text-gray-600">
                  더 좋은 상품명으로 판매율을 높이세요. 구독하시면 바로 사용할
                  수 있습니다.
                </p>
              </div>
              <Link href="/subscription">
                <Button
                  size="lg"
                  className="shadow-sm rounded-full px-6 bg-primary hover:bg-primary/90"
                >
                  구독 시작하기
                </Button>
              </Link>
            </div>
          </div>
        )}

        {/* 토큰 부족 알림 */}
        {subscription &&
          subscription.status === "active" &&
          subscription.tokens <= 0 && (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
              <div className="p-5 bg-yellow-50 border border-yellow-200 rounded-lg flex flex-col sm:flex-row justify-between items-center">
                <div className="mb-4 sm:mb-0">
                  <h3 className="text-lg font-semibold text-yellow-800 mb-1">
                    토큰을 모두 사용하셨습니다
                  </h3>
                  <p className="text-yellow-700">
                    추가 토큰을 구매하시면 계속해서 서비스를 이용하실 수
                    있습니다.
                  </p>
                </div>
                <Link href="/subscription/add-tokens">
                  <Button
                    size="lg"
                    className="shadow-sm rounded-full px-6 bg-yellow-600 hover:bg-yellow-700 text-white"
                  >
                    토큰 충전하기
                  </Button>
                </Link>
              </div>
            </div>
          )}

        {/* 메인 콘텐츠 영역 */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* 입력 폼 섹션 */}
          <div className="py-6">
            <div
              className={
                results.length > 0 ? "max-w-7xl mx-auto" : "max-w-2xl mx-auto"
              }
            >
              {results.length === 0 && (
                <div className="text-center mb-8">
                  <h1 className="text-3xl font-bold text-gray-900 mb-4">
                    AI로 최적화된 상품명을 만들어 보세요
                  </h1>
                  <p className="text-lg text-gray-600">
                    상품 이미지와 기본 정보를 입력하면 판매율을 높이는 상품명을
                    AI가 생성해 드립니다
                  </p>
                </div>
              )}

              <div
                className={`bg-white rounded-xl ${
                  results.length === 0 ? "shadow-sm border border-gray-200" : ""
                }`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-6">
                    <h2 className="text-lg font-bold text-gray-900">
                      상품 정보 입력
                    </h2>
                    {subscription && subscription.status === "active" && (
                      <div className="bg-blue-50 px-4 py-2 rounded-full border border-blue-100 text-sm flex items-center">
                        <span className="mr-1">1회 생성:</span>
                        <span className="font-bold text-primary text-base">
                          1 토큰
                        </span>
                        {subscription.tokens > 0 && (
                          <span className="ml-2 bg-white px-2 py-0.5 rounded-full text-xs">
                            남은 토큰:{" "}
                            <span className="font-bold text-primary">
                              {subscription.tokens}개
                            </span>
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                  <ProductForm
                    productNames={productNames}
                    imageUrls={imageUrls}
                    isLoading={isLoading}
                    onProductNamesChange={setProductNames}
                    onImageUrlsChange={setImageUrls}
                    onSubmit={handleSubmit}
                  />
                  {error && <ErrorMessage message={error} />}
                </div>
              </div>
            </div>
          </div>

          {/* 결과 섹션 */}
          {(results.length > 0 || isLoading) && (
            <div className="py-6 border-t border-gray-200">
              {isLoading ? (
                <div className="bg-white p-8 rounded-lg border border-gray-200 text-center">
                  <div className="space-y-4">
                    <p className="text-lg font-medium">상품명 생성 중...</p>
                    <div className="space-y-2">
                      {productNames.map((_, index) => (
                        <div
                          key={index}
                          className="flex items-center justify-center space-x-2"
                        >
                          <span className="text-sm">상품 #{index + 1}:</span>
                          {processingIndexes.includes(index) ? (
                            <span className="text-blue-500">처리 중...</span>
                          ) : results[index] ? (
                            <span className="text-green-500">완료!</span>
                          ) : (
                            <span className="text-gray-400">대기 중...</span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              ) : (
                <ResultSection
                  results={results}
                  originalProductNames={productNames}
                  imageUrls={imageUrls}
                />
              )}
            </div>
          )}
        </div>

        {/* 다른 기능 카드 섹션 */}
        <div>
          <h2 className="text-2xl font-bold mb-6">
            다른 AI 기능도 사용해 보세요
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {featureCards.map((card, index) => (
              <div
                key={index}
                className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-shadow group"
              >
                <div className="p-6">
                  <div className="flex items-start mb-4">
                    <div className="w-10 h-10 bg-primary/10 rounded-full flex items-center justify-center text-xl mr-3">
                      {card.icon}
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1 text-gray-900">
                        {card.title}
                      </h3>
                      <p className="text-gray-600">{card.description}</p>
                    </div>
                  </div>
                  <div className="flex items-center justify-between mt-6">
                    <div className="px-3 py-1 bg-blue-50 rounded-full text-sm font-medium text-primary">
                      {card.tokenCost}
                    </div>
                    <Link href={card.path}>
                      <Button
                        variant="outline"
                        className="rounded-full group-hover:bg-primary group-hover:text-white transition-colors"
                      >
                        사용해보기
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </ProtectedRoute>
    </main>
  );
}
