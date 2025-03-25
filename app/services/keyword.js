import NAVER_CATEGORY_DATA from "@/data/naver_category_data";
export default async function searchRelatedKeywords(
  productName,
  extractedKeyword
) {
  try {
    // 1. 네이버 쇼핑 검색 API 호출
    const shoppingItems = await fetchShoppingItems(productName);
    console.log("shoppingItems", shoppingItems);
    if (!shoppingItems || shoppingItems.length === 0) {
      throw new Error("쇼핑 아이템을 찾을 수 없습니다.");
    }
    const categoryArray = getCategoryArray(shoppingItems[0]);
    // 2. 카테고리 ID 찾기
    const [categoryId, categoryName] = findCategoryId(shoppingItems[0]);

    if (!categoryId) {
      throw new Error("카테고리 ID를 찾을 수 없습니다.");
    }
    // 3. 키워드 묶음 가져오기
    // 3.1. 쇼핑 아이템 제목에서 키워드 추출
    const extractedKeywordResults = await fetchSearchAdKeywords(
      extractedKeyword
    );
    const extractedShoppingItems = await fetchShoppingItems(extractedKeyword);
    const titleKeywords = extractTitleKeywords(extractedShoppingItems);
    const combinedKeywords = [...extractedKeywordResults];

    titleKeywords.forEach((titleKeyword) => {
      const existingIndex = combinedKeywords.findIndex(
        (k) => k.keyword === titleKeyword.keyword
      );
      if (existingIndex === -1) {
        // 중복되지 않는 키워드는 추가
        combinedKeywords.push(titleKeyword);
      }
    });

    // 합쳐진 키워드로 sortedKeywords 생성
    const finalKeywords = combinedKeywords.map((keyword) => ({
      keyword: keyword.keyword,
      sources: new Set(["searchad"]),
      sourceDetails: [keyword],
      overlapCount: 1,
    }));
    // await enrichKeywordsWithSearchAdData(finalKeywords);
    console.log("finalKeywords", finalKeywords);

    return {
      categoryName: categoryArray,
      mainKeyword: extractedKeyword,
      categoryId,
      sortedKeywords: finalKeywords,
      titleKeywords,
    };
  } catch (error) {
    console.error("키워드 분석 중 오류 발생:", error);
    throw error;
  }
}

/**
 * 네이버 쇼핑 검색 API 호출
 * @param {string} keyword - 검색 키워드
 * @returns {Promise<Array>} - 검색 결과 아이템 배열
 */
async function fetchShoppingItems(keyword) {
  try {
    const response = await fetch(
      `/api/naver-shopping-search-api?query=${keyword}`
    );
    const data = await response.json();
    console.log("쇼핑 검색 결과", data);
    if (data.error) {
      throw new Error(data.error);
    }

    return data.items || [];
  } catch (error) {
    console.error("쇼핑 검색 API 호출 오류:", error);
    return [];
  }
}

/**
 * 쇼핑 아이템에서 카테고리 ID 찾기
 * @param {Object} item - 쇼핑 아이템
 * @returns {string|null} - 카테고리 ID 또는 null
 */
function findCategoryId(item) {
  try {
    // 카테고리 우선순위: category4 > category3 > category2
    const categoryName = item.category4 || item.category3 || item.category2;
    if (!categoryName) return null;

    // 카테고리 데이터에서 ID 찾기
    const categoryEntry = NAVER_CATEGORY_DATA.find(
      (entry) =>
        entry.specific_category === categoryName ||
        entry.detail_category === categoryName ||
        entry.sub_category === categoryName
    );

    return categoryEntry ? [categoryEntry.category_id, categoryName] : null;
  } catch (error) {
    console.error("카테고리 ID 찾기 오류:", error);
    return null;
  }
}

/**
 * 네이버 검색광고 키워드 API 호출
 * @param {string} keyword - 검색 키워드
 * @returns {Promise<Array>} - 검색 결과 키워드 배열
 */
async function fetchSearchAdKeywords(keyword) {
  try {
    const response = await fetch(
      `/api/naver-searchad-keywords?q=${encodeURIComponent(keyword)}`
    );
    const data = await response.json();

    if (data.error) {
      throw new Error(data.error);
    }

    return (data.suggestions || []).slice(0, 50).map((item) => ({
      keyword: item.text,
      monthlyPcQcCnt: item.monthlyPcQcCnt,
      monthlyMobileQcCnt: item.monthlyMobileQcCnt,
      compIdx: item.compIdx,
      source: "searchad",
    }));
  } catch (error) {
    console.error("검색광고 키워드 API 호출 오류:", error);
    return [];
  }
}

/**
 * 쇼핑 아이템 제목에서 키워드 추출
 * @param {Array} items - 쇼핑 아이템 배열
 * @returns {Array} - 추출된 키워드 배열
 */
function extractTitleKeywords(items) {
  try {
    // 모든 제목을 합치고 HTML 태그 제거
    const allTitles = items
      .map((item) => item.title.replace(/<[^>]*>/g, ""))
      .join(" ");

    // 단어 분리 및 빈도수 계산
    const words = allTitles.split(/\s+/);
    const wordCount = {};

    words.forEach((word) => {
      // 2글자 이상인 단어만 카운트하고 영어로만 된 키워드나 제품코드, 수량 관련 키워드 제외
      if (
        word.length >= 2 &&
        !/^[a-zA-Z]+$/.test(word) && // 영어로만 이루어진 단어 제외
        !/^[a-zA-Z0-9]+$/.test(word) && // 영어와 숫자로만 이루어진 제품코드 제외
        !/\d+개$/.test(word) // 수량 관련 키워드 제외 (예: 1개, 2개 등)
      ) {
        wordCount[word] = (wordCount[word] || 0) + 1;
      }
    });

    // 2번 이상 20번 이하로 등장한 단어만 필터링
    return Object.entries(wordCount)
      .filter(([_, count]) => count >= 2 && count <= 20)
      .map(([word, count]) => ({
        keyword: word,
        count,
        source: "titleKeyword",
      }));
  } catch (error) {
    console.error("제목 키워드 추출 오류:", error);
    return [];
  }
}

/**
 * 검색광고 API 데이터가 없는 키워드들에 대해 추가 정보 가져오기
 * @param {Array} keywords - 정렬된 키워드 배열 (상위 40개)
 * @returns {Promise<void>}
 */
async function enrichKeywordsWithSearchAdData(keywords) {
  try {
    // 검색광고 데이터가 없는 키워드 필터링
    const keywordsWithoutSearchAdData = keywords.filter(
      (item) =>
        !item.sourceDetails.some((detail) => detail.source === "searchad")
    );

    if (keywordsWithoutSearchAdData.length === 0) return;

    console.log(
      `상위 40개 중 검색광고 데이터가 없는 키워드 ${keywordsWithoutSearchAdData.length}개에 대해 추가 정보를 가져옵니다.`
    );

    // 검색광고 데이터가 없는 키워드들에 대해 배치 처리 (최대 5개씩)
    const batchSize = 5;
    const batches = [];

    for (let i = 0; i < keywordsWithoutSearchAdData.length; i += batchSize) {
      batches.push(keywordsWithoutSearchAdData.slice(i, i + batchSize));
    }

    // 각 배치에 대해 순차적으로 처리
    for (const batch of batches) {
      try {
        // 키워드를 콤마로 구분하여 하나의 문자열로 만듦
        const keywordsString = batch.map((item) => item.keyword).join(",");
        console.log(`검색광고 API 호출: ${keywordsString}`);

        // 검색광고 API 호출 (콤마로 구분된 여러 키워드 전달)
        const response = await fetch(
          `/api/naver-searchad-keywords?q=${keywordsString}`
        );
        const data = await response.json();

        if (data.error) {
          console.warn(
            `키워드 '${keywordsString}' 검색광고 데이터 가져오기 실패:`,
            data.error
          );
          continue;
        }

        // 각 키워드에 대해 일치하는 결과 찾아 데이터 추가
        for (const item of batch) {
          const matchingKeyword = data.suggestions?.find(
            (suggestion) => suggestion.text === item.keyword
          );

          if (matchingKeyword) {
            // 검색광고 데이터 추가
            item.sourceDetails.push({
              keyword: item.keyword,
              monthlyPcQcCnt: matchingKeyword.monthlyPcQcCnt,
              monthlyMobileQcCnt: matchingKeyword.monthlyMobileQcCnt,
              compIdx: matchingKeyword.compIdx,
              source: "searchad",
            });
            console.log(`키워드 '${item.keyword}'에 검색광고 데이터 추가 완료`);
          } else {
            console.log(
              `키워드 '${item.keyword}'에 대한 검색광고 데이터를 찾을 수 없습니다.`
            );
          }
        }

        // API 호출 간 짧은 지연 추가 (API 제한 방지)
        await new Promise((resolve) => setTimeout(resolve, 200));
      } catch (error) {
        console.warn(`키워드 배치 검색광고 데이터 가져오기 오류:`, error);
      }
    }
  } catch (error) {
    console.error("키워드 검색광고 데이터 보강 중 오류 발생:", error);
  }
}

export function getCategoryArray(product) {
  const categories = [];

  if (product.category1) categories.push(product.category1);
  if (product.category2) categories.push(product.category2);
  if (product.category3) categories.push(product.category3);
  if (product.category4) categories.push(product.category4);

  return categories;
}
