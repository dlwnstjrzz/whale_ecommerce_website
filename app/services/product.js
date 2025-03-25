import searchRelatedKeywords from "./keyword";

export async function extractKeyword(productName, imageUrl) {
  const response = await fetch("/api/extract-keyword", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ productName, imageUrl }),
  });

  if (!response.ok) {
    throw new Error("키워드 추출 중 오류가 발생했습니다.");
  }

  return response.json();
}

export async function analyzeImage(imageUrl) {
  const response = await fetch("/api/analyze-image", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ imageUrl }),
  });

  if (!response.ok) {
    throw new Error("이미지 분석 중 오류가 발생했습니다.");
  }

  return response.json();
}

export async function generateProductName(
  productName,
  imageUrl,
  newKeyword = null
) {
  try {
    let extractedKeyword;
    if (newKeyword) {
      extractedKeyword = newKeyword;
    } else {
      // 1. 키워드 추출
      const keywordResult = await extractKeyword(productName, imageUrl);
      extractedKeyword = keywordResult.keyword;
    }
    // 2. 연관 키워드 검색
    const { sortedKeywords, categoryName, categoryId, titleKeywords } =
      await searchRelatedKeywords(productName, extractedKeyword);
    // 3. 이미지 분석
    const imageAnalysis = await analyzeImage(imageUrl);
    console.log("imageAnalysis", imageAnalysis);
    // 4. 키워드 선택 및 제품명 생성
    const response = await fetch("/api/generate-product-name", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        productName,
        imageUrl,
        mainKeyword: extractedKeyword,
        relatedKeywords: sortedKeywords,
        categoryName,
        categoryId,
        imageAnalysis,
        titleKeywords,
      }),
    });

    if (!response.ok) {
      throw new Error("제품명 생성 중 오류가 발생했습니다.");
    }

    return response.json();
  } catch (error) {
    console.error("제품명 생성 오류:", error);
    throw error;
  }
}
