import { NextResponse } from "next/server";

// 네이버 API 클라이언트 ID와 시크릿
const NAVER_CLIENT_ID = process.env.NAVER_CLIENT_ID;
const NAVER_CLIENT_SECRET = process.env.NAVER_CLIENT_SECRET;

export async function GET(request) {
  try {
    // URL에서 쿼리 파라미터 추출
    const { searchParams } = new URL(request.url);
    const query = searchParams.get("query");
    const display = searchParams.get("display") || 50; // 기본값 10
    const start = searchParams.get("start") || 1; // 기본값 1
    const sort = searchParams.get("sort") || "sim"; // 기본값 정확도순
    const filter = searchParams.get("filter") || ""; // 기본값 없음

    if (!query) {
      return NextResponse.json(
        { error: "검색어가 필요합니다." },
        {
          status: 400,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    // 네이버 API 키가 설정되어 있는지 확인
    if (!NAVER_CLIENT_ID || !NAVER_CLIENT_SECRET) {
      return NextResponse.json(
        { error: "네이버 API 키가 설정되어 있지 않습니다." },
        {
          status: 500,
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        }
      );
    }

    // 네이버 쇼핑 검색 API URL 생성
    const encodedQuery = encodeURIComponent(query);
    const naverApiUrl = `https://openapi.naver.com/v1/search/shop.json?query=${encodedQuery}&display=${display}&start=${start}&sort=${sort}`;

    // filter 파라미터가 있는 경우 URL에 추가
    const apiUrl = filter ? `${naverApiUrl}&filter=${filter}` : naverApiUrl;

    // 네이버 쇼핑 검색 API 호출
    const response = await fetch(apiUrl, {
      headers: {
        "X-Naver-Client-Id": process.env.NAVER_CLIENT_ID,
        "X-Naver-Client-Secret": process.env.NAVER_CLIENT_SECRET,
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) {
      throw new Error(`네이버 API 응답 오류: ${response.status}`);
    }

    const data = await response.json();
    console.log("쇼핑 데이터", data);
    // 응답 반환
    return NextResponse.json(data, {
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    });
  } catch (error) {
    console.error("네이버 쇼핑 검색 API 오류:", error);

    // 오류 발생 시 기본 데이터 반환
    return NextResponse.json(
      {
        error: `네이버 쇼핑 검색 API 호출 중 오류가 발생했습니다: ${error.message}`,
        // 서버리스 환경에서 오류 발생 시 기본 데이터 제공
        defaultData: {
          total: 0,
          items: [],
        },
      },
      {
        status: 200, // 클라이언트 측 오류 방지를 위해 200 반환
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type, Authorization",
        },
      }
    );
  }
}

export function OPTIONS() {
  return NextResponse.json(
    {},
    {
      status: 200,
      headers: {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type, Authorization",
      },
    }
  );
}
