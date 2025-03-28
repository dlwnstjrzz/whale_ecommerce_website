import {
  HiOutlineDownload,
  HiClipboardCopy,
  HiCheck,
  HiRefresh,
} from "react-icons/hi";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ChevronRight } from "lucide-react";
import { HelpCircle } from "lucide-react";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Slider } from "@/components/ui/slider";
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
  const [searchVolumeRange, setSearchVolumeRange] = useState([0, 0]);
  const inputRef = useRef(null);

  // 검색 광고 키워드의 최대 검색량을 계산하는 함수
  const getMaxSearchVolume = (keywords) => {
    const searchAdKeywords = keywords.filter(
      (keyword) => keyword.sourceDetails?.[0]?.source === "searchad"
    );
    return searchAdKeywords.length > 0
      ? Math.max(
          ...searchAdKeywords.map((keyword) => getMonthlySearchVolume(keyword))
        )
      : 0;
  };

  // 초기 검색량 범위 설정
  useEffect(() => {
    if (results && results.length > 0) {
      const maxVolume = getMaxSearchVolume(results[0].relatedKeywords);
      setSearchVolumeRange([0, maxVolume]);
    }
  }, [results]);

  console.log("results", results);
  if (!results || results.length === 0) return null;

  const handleCopy = (text, index) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  // 문자열의 바이트 수 계산 (현재 방식)
  const getByteLength = (str) => {
    const encoder = new TextEncoder();
    return encoder.encode(str).length;
  };

  // LENB 방식의 바이트 수 계산
  const getLENBByteLength = (str) => {
    let len = 0;
    for (let i = 0; i < str.length; i++) {
      const charCode = str.charCodeAt(i);
      // 한글, 한자, 특수문자 등은 2바이트로 계산
      if (charCode > 0x7f) {
        len += 2;
      } else {
        len += 1;
      }
    }
    return len;
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
    if (keyword.sourceDetails?.[0]?.source === "titleKeyword") {
      return keyword.sourceDetails[0].count;
    }
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
        ...newProductName,
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

    // 검색 광고 키워드만 필터링
    const searchAdKeywords = sortedKeywords.filter(
      (keyword) => keyword.sourceDetails?.[0]?.source === "searchad"
    );

    // 최대 검색량 계산
    const maxSearchVolume = getMaxSearchVolume(result.relatedKeywords);

    // 필터링된 키워드
    const filteredKeywords = searchAdKeywords.filter((keyword) => {
      const volume = getMonthlySearchVolume(keyword);
      return volume >= searchVolumeRange[0] && volume <= searchVolumeRange[1];
    });

    const currentProductName =
      editedProductName || result.generatedProductNames[0];
    const byteLength = getByteLength(currentProductName);
    const lenbByteLength = getLENBByteLength(currentProductName);

    return (
      <div className="space-y-6">
        {/* 카테고리 */}
        <div className="bg-white p-4 rounded-lg border border-gray-200">
          <div className="flex items-center gap-2 mb-2">
            <h2 className="text-lg font-bold text-blue-600">카테고리</h2>
            <span className="text-base text-gray-500">
              (네이버 카테고리 ID: {result.categoryId})
            </span>
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
                  <ChevronRight className="h-5 w-5 mx-1 text-gray-400" />
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
                    <h2 className="text-xl font-bold text-blue-400">
                      추천 상품명
                    </h2>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-base">
                        <span className="text-white font-bold">
                          {byteLength} bytes
                        </span>
                      </div>
                      <div className="flex items-center gap-1 bg-white/10 px-3 py-1 rounded-full text-base">
                        <span className="text-white font-bold">
                          {lenbByteLength} bytes
                        </span>
                        <span className="text-gray-400 ml-1">
                          *엑셀 LENB 함수 기준
                        </span>
                      </div>
                    </div>
                  </div>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => handleCopy(currentProductName, 0)}
                    className="h-9 px-3 text-base text-white hover:bg-white/10"
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
                  className="w-full text-3xl font-bold text-white bg-transparent border-0 border-b border-white/20 focus:ring-0 focus:border-white transition-colors px-0 placeholder-white/50"
                />
                <div className="flex items-center gap-2 text-base text-gray-400">
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
                    <CardTitle className="text-lg font-bold text-blue-600">
                      메인 키워드
                    </CardTitle>
                    <TooltipProvider>
                      <Tooltip>
                        <TooltipTrigger>
                          <HelpCircle className="h-5 w-5 text-gray-400" />
                        </TooltipTrigger>
                        <TooltipContent>
                          <p className="w-[280px] text-base">
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
                    className="h-9 px-3 text-base hover:bg-gray-100"
                  >
                    <HiRefresh
                      className={`h-5 w-5 mr-1 ${
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
                  <CardTitle className="text-lg font-bold text-blue-600">
                    이미지 특징
                  </CardTitle>
                  <TooltipProvider>
                    <Tooltip>
                      <TooltipTrigger>
                        <HelpCircle className="h-5 w-5 text-gray-400" />
                      </TooltipTrigger>
                      <TooltipContent>
                        <p className="w-[280px] text-base">
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
              <CardTitle className="text-lg font-bold text-blue-600">
                연관 키워드
              </CardTitle>
              <span className="text-base text-gray-500">
                월간 검색량 기준으로 정렬됩니다
              </span>
            </div>
          </CardHeader>
          <CardContent className="pt-4">
            {/* 검색 광고 키워드 */}
            <div className="mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-medium text-gray-500">
                  검색 광고 키워드
                </h3>
                <div className="flex items-center gap-4">
                  <span className="text-sm text-gray-500">
                    {searchVolumeRange[0].toLocaleString()} ~{" "}
                    {searchVolumeRange[1].toLocaleString()} 회/월
                  </span>
                  <div className="w-[200px]">
                    <Slider
                      value={searchVolumeRange}
                      onValueChange={setSearchVolumeRange}
                      min={0}
                      max={maxSearchVolume}
                      step={100}
                      className="w-full"
                    />
                  </div>
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {filteredKeywords.map((keyword, idx) => (
                  <div
                    key={idx}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors cursor-pointer"
                    onClick={() => insertKeyword(keyword.keyword)}
                  >
                    <span className="text-base font-medium text-gray-900">
                      {keyword.keyword}
                    </span>
                    <Badge
                      variant="outline"
                      className="bg-white border-gray-200 text-sm"
                    >
                      {getMonthlySearchVolume(keyword).toLocaleString()}
                      <span className="text-gray-500 ml-1">회/월</span>
                    </Badge>
                  </div>
                ))}
              </div>
            </div>

            {/* 제목 키워드 */}
            <div>
              <h3 className="text-base font-medium text-gray-500 mb-3">
                제목 키워드
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-2">
                {sortedKeywords
                  .filter(
                    (keyword) =>
                      keyword.sourceDetails?.[0]?.source === "titleKeyword"
                  )
                  .map((keyword, idx) => (
                    <div
                      key={idx}
                      className="flex items-center justify-between p-3 bg-gray-50 rounded-lg group hover:bg-gray-100 transition-colors cursor-pointer"
                      onClick={() => insertKeyword(keyword.keyword)}
                    >
                      <span className="text-base font-medium text-gray-900">
                        {keyword.keyword}
                      </span>
                      <Badge
                        variant="outline"
                        className="bg-white border-gray-200 text-sm"
                      >
                        {getMonthlySearchVolume(keyword).toLocaleString()}
                        <span className="text-gray-500 ml-1">회</span>
                      </Badge>
                    </div>
                  ))}
              </div>
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
            className="flex-1 rounded-none border-b-2 border-transparent data-[state=active]:border-gray-900 data-[state=active]:text-gray-900 data-[state=active]:bg-transparent text-base"
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
