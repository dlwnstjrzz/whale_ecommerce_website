import {
  HiOutlineDownload,
  HiClipboardCopy,
  HiCheck,
  HiRefresh,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useRef } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import * as productService from "../services/product";

export function ResultSection({
  results: initialResults,
  originalProductNames,
  imageUrls,
}) {
  const [copiedIndex, setCopiedIndex] = useState(null);
  const [activeTab, setActiveTab] = useState("0");
  const [editedProductName, setEditedProductName] = useState("");
  const [editedMainKeywords, setEditedMainKeywords] = useState({});
  const [isRegenerating, setIsRegenerating] = useState(false);
  const [results, setResults] = useState(initialResults);
  const inputRef = useRef(null);
  console.log("results", results);
  if (!results || results.length === 0) return null;

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 문자열의 바이트 수 계산
  const getByteLength = (str) => {
    const encoder = new TextEncoder();
    return encoder.encode(str).length;
  };

  // 키워드 삽입 처리
  const insertKeyword = (keyword) => {
    if (!inputRef.current) return;

    const input = inputRef.current;
    const currentValue =
      editedProductName ||
      results[parseInt(activeTab)].generatedProductNames[0];
    const selectionStart = input.selectionStart;
    const selectionEnd = input.selectionEnd;

    // 커서 위치에 키워드 삽입
    const newValue =
      currentValue.slice(0, selectionStart) +
      keyword +
      currentValue.slice(selectionEnd);
    setEditedProductName(newValue);

    // 다음 입력을 위해 커서 위치 조정
    setTimeout(() => {
      input.focus();
      const newPosition = selectionStart + keyword.length;
      input.setSelectionRange(newPosition, newPosition);
    }, 0);
  };

  // 연관 키워드의 월 검색량 계산
  const getMonthlySearchVolume = (keyword) => {
    const pcVolume = keyword.sourceDetails?.[0]?.monthlyPcQcCnt || 0;
    const mobileVolume = keyword.sourceDetails?.[0]?.monthlyMobileQcCnt || 0;

    if (pcVolume === "< 10") return parseInt(mobileVolume);
    if (mobileVolume === "< 10") return parseInt(pcVolume);
    return parseInt(pcVolume) + parseInt(mobileVolume);
  };

  const handleMainKeywordChange = (index, value) => {
    setEditedMainKeywords((prev) => ({
      ...prev,
      [index]: value,
    }));

    // results 상태도 함께 업데이트
    const updatedResults = [...results];
    updatedResults[index] = {
      ...updatedResults[index],
      mainKeyword: value,
    };
    setResults(updatedResults);
  };

  const handleRegenerate = async (index) => {
    if (isRegenerating) return;

    const mainKeyword = editedMainKeywords[index] || results[index].mainKeyword;
    setIsRegenerating(true);

    try {
      const newProductName = await productService.generateProductName(
        originalProductNames[index],
        imageUrls[index],
        mainKeyword
      );
      console.log("newProductName", newProductName);
      // 전체 results 배열을 복사하고 특정 인덱스의 결과만 업데이트
      const updatedResults = [...results];
      updatedResults[index] = {
        ...updatedResults[index],
        generatedProductNames: [newProductName],
        mainKeyword,
      };
      setResults(updatedResults);

      // 현재 탭의 편집된 상품명 초기화
      if (activeTab === index.toString()) {
        setEditedProductName("");
      }

      // 수정된 메인 키워드 상태 초기화
      setEditedMainKeywords((prev) => ({
        ...prev,
        [index]: "",
      }));
    } catch (error) {
      console.error("Failed to regenerate product name:", error);
    } finally {
      setIsRegenerating(false);
    }
  };

  const renderResult = (result, index) => {
    if (!result) return null;

    const sortedKeywords = [...result.relatedKeywords].sort(
      (a, b) => getMonthlySearchVolume(b) - getMonthlySearchVolume(a)
    );

    const currentProductName =
      editedProductName || result.generatedProductNames[0];
    const byteLength = getByteLength(currentProductName);

    return (
      <div className="space-y-6">
        {/* 카테고리 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-base font-bold text-blue-600">카테고리</h2>
          </div>
          <div className="flex items-center flex-wrap gap-2">
            {result.categoryName.map((category, idx) => (
              <div key={idx} className="flex items-center">
                <span
                  className="text-base font-medium text-gray-900 cursor-pointer hover:text-blue-600"
                  onClick={() => insertKeyword(category)}
                >
                  {category}
                </span>
                {idx < result.categoryName.length - 1 && (
                  <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 메인 콘텐츠 영역 */}
        <div className="grid grid-cols-12 gap-6">
          {/* 왼쪽: 추천 상품명 + 메인 키워드 */}
          <div className="col-span-12 lg:col-span-8 space-y-6">
            {/* 추천 상품명 */}
            <div className="bg-[#2A2A2A] p-6 rounded-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-blue-400">
                      추천 상품명
                    </h2>
                    <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-sm">
                      <span className="text-white font-bold">{byteLength}</span>
                      <span className="text-gray-400">/100</span>
                      <span className="text-gray-400 ml-0.5">bytes</span>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(currentProductName, 0)}
                    className="h-8 px-3 text-sm text-white hover:bg-white/10"
                  >
                    {copiedIndex === 0 ? (
                      <HiCheck className="h-5 w-5 mr-1" />
                    ) : (
                      <HiClipboardCopy className="h-5 w-5 mr-1" />
                    )}
                    복사하기
                  </Button>
                </div>
                <input
                  ref={inputRef}
                  type="text"
                  value={currentProductName}
                  onChange={(e) => setEditedProductName(e.target.value)}
                  className="w-full text-2xl font-bold text-white bg-transparent border-0 border-b border-white/20 focus:ring-0 focus:border-white transition-colors px-0 placeholder-white/50"
                />
                <div className="flex items-center gap-2 text-sm text-gray-400">
                  <span>원본:</span>
                  <span className="text-gray-300">
                    {originalProductNames[index]}
                  </span>
                </div>
              </div>
            </div>

            {/* 메인 키워드 */}
            <Card className="border-gray-200">
              <CardHeader className="pb-3 border-b border-gray-200">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CardTitle className="text-base font-bold text-blue-600">
                      메인 키워드
                    </CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-4 w-4 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[280px] text-sm">
                            메인 키워드는 상품의 원본명과 상세 페이지를 AI가
                            분석해 추출한 대표 키워드이며, 연관 키워드 추출에도
                            활용됩니다. 추출된 연관 키워드가 부적절할 경우, 메인
                            키워드를 수정해보세요.
                          </p>
                        </TooltipContent>
                      </Tooltip>
                    </TooltipProvider>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleRegenerate(index)}
                    disabled={isRegenerating}
                    className="h-8 px-3 text-sm hover:bg-gray-100"
                  >
                    <HiRefresh
                      className={`h-4 w-4 mr-1 ${
                        isRegenerating ? "animate-spin" : ""
                      }`}
                    />
                    재생성
                  </Button>
                </div>
              </CardHeader>
              <CardContent className="pt-4">
                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    value={results[index].mainKeyword}
                    onChange={(e) =>
                      handleMainKeywordChange(index, e.target.value)
                    }
                    className="flex-1 text-xl font-bold text-gray-900 bg-transparent border-0 border-b border-gray-200 focus:ring-0 focus:border-gray-400 transition-colors px-0"
                    placeholder="메인 키워드를 입력하세요"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 오른쪽: 이미지 특징 */}
          <div className="col-span-12 lg:col-span-4">
            <Card className="border-gray-200 h-full">
              <CardHeader className="pb-3 border-b border-gray-200">
                <div className="flex items-center gap-2">
                  <CardTitle className="text-base font-bold text-blue-600">
                    이미지 특징
                  </CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-4 w-4 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[280px] text-sm">
                          AI가 이미지 속 제품을 분석해 재질, 형태, 기능, 사용
                          용도 등 8가지 핵심 특징을 자동 추출합니다.
                        </p>
                      </TooltipContent>
                    </Tooltip>
                  </TooltipProvider>
                </div>
              </CardHeader>
              <CardContent className="pt-4 h-[calc(100%-57px)] overflow-y-auto">
                <div className="flex flex-wrap content-start gap-2">
                  {result.imageAnalysis.features.map((feature, idx) => (
                    <Badge
                      key={idx}
                      variant="outline"
                      className="text-base py-1.5 px-3 bg-gray-50 text-gray-900 border-gray-200 hover:bg-gray-100 transition-colors whitespace-nowrap cursor-pointer"
                      onClick={() => insertKeyword(feature)}
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* 하단 섹션: 연관 키워드 */}
        <Card className="border-gray-200">
          <CardHeader className="pb-3 border-b border-gray-200">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base font-bold text-blue-600">
                연관 키워드
              </CardTitle>
              <span className="text-sm text-gray-500">
                월간 검색량 기준으로 정렬됩니다
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              {sortedKeywords.map((keyword, idx) => (
                <div
                  key={idx}
                  className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors cursor-pointer"
                  onClick={() => insertKeyword(keyword.keyword)}
                >
                  <span className="text-sm font-medium text-gray-900">
                    {keyword.keyword}
                  </span>
                  <Badge
                    variant="outline"
                    className="bg-white border-gray-200 text-xs"
                  >
                    {getMonthlySearchVolume(keyword).toLocaleString()}
                    <span className="text-gray-500 ml-1">회/월</span>
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
      <TabsList className="mb-6 w-full justify-start bg-white border-b border-gray-200 rounded-none p-0">
        {results.map((_, index) => (
          <TabsTrigger
            key={index}
            value={index.toString()}
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent"
          >
            상품 #{index + 1}
          </TabsTrigger>
        ))}
      </TabsList>
      {results.map((result, index) => (
        <TabsContent key={index} value={index.toString()}>
          {renderResult(result, index)}
        </TabsContent>
      ))}
    </Tabs>
  );
}
