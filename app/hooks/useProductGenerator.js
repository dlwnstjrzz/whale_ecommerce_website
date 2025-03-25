import { useState } from "react";
import * as productService from "../services/product";
import { useSubscription } from "./useSubscription";
import { useRouter } from "next/navigation";

export function useProductGenerator() {
  const [productNames, setProductNames] = useState([""]);
  const [imageUrls, setImageUrls] = useState([""]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [results, setResults] = useState([]);
  const [processingIndexes, setProcessingIndexes] = useState([]);
  const { useToken, hasActiveSubscription, remainingTokens } =
    useSubscription();
  const router = useRouter();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (
      productNames.some((name) => !name.trim()) ||
      imageUrls.some((url) => !url.trim())
    ) {
      setError("모든 제품명과 이미지 URL을 입력해주세요.");
      return;
    }

    // 구독 상태 확인
    if (!hasActiveSubscription) {
      setError("상품명 생성을 위해 구독이 필요합니다.");
      router.push("/subscription");
      return;
    }

    // 토큰 수량 확인
    if (remainingTokens < productNames.length) {
      setError("사용 가능한 토큰이 부족합니다. 추가 토큰을 구매해주세요.");
      router.push("/subscription/add-tokens");
      return;
    }

    setIsLoading(true);
    setError(null);
    setResults([]);
    setProcessingIndexes([]);

    try {
      // 각 상품을 개별적으로 처리
      productNames.forEach(async (name, index) => {
        setProcessingIndexes((prev) => [...prev, index]);

        try {
          // 토큰 사용
          await useToken();

          // 상품명 생성
          const result = await productService.generateProductName(
            name,
            imageUrls[index]
          );

          // 결과 추가
          setResults((prev) => {
            const newResults = [...prev];
            newResults[index] = result;
            return newResults;
          });
        } catch (err) {
          setError(`상품 #${index + 1} 처리 중 오류: ${err.message}`);
        } finally {
          setProcessingIndexes((prev) => prev.filter((i) => i !== index));
          if (index === productNames.length - 1) {
            setIsLoading(false);
          }
        }
      });
    } catch (err) {
      setError(err.message);
      setIsLoading(false);
    }
  };

  const handleDownload = () => {
    productService.generateExcelFile(results);
  };

  return {
    productNames,
    setProductNames,
    imageUrls,
    setImageUrls,
    isLoading,
    error,
    results,
    processingIndexes,
    handleSubmit,
    handleDownload,
    remainingTokens,
  };
}
