import { NextResponse } from "next/server";
import puppeteer from "puppeteer";

export async function GET() {
  try {
    const browser = await puppeteer.launch({
      headless: "new",
      args: [
        "--no-sandbox",
        "--disable-setuid-sandbox",
        "--disable-dev-shm-usage",
        "--disable-accelerated-2d-canvas",
        "--disable-gpu",
      ],
    });

    const page = await browser.newPage();

    // User-Agent 설정
    await page.setUserAgent(
      "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/122.0.0.0 Safari/537.36"
    );

    // 뷰포트 설정
    await page.setViewport({ width: 1920, height: 1080 });

    // 쿠키 및 로컬 스토리지 초기화
    await page.deleteCookie();

    // 페이지 로드 타임아웃 설정
    await page.setDefaultNavigationTimeout(30000);

    // 페이지 이동
    await page.goto(
      "https://smartstore.naver.com/rosablu/products/10739218263",
      { waitUntil: "networkidle0" }
    );

    // 상품 정보 크롤링
    const productData = await page.evaluate(() => {
      // 모든 데이터를 수집
      const data = {
        // 기본 정보
        title: document.querySelector("h3._3XamX")?.textContent,
        price: document.querySelector("strong._3XamX")?.textContent,
        description: document.querySelector("div._2XZQT")?.textContent,

        // 추가 정보
        images: Array.from(document.querySelectorAll("img._3QDEeS")).map(
          (img) => img.src
        ),
        options: Array.from(document.querySelectorAll("div._2XZQT")).map(
          (div) => div.textContent
        ),
        reviews: Array.from(document.querySelectorAll("div._2XZQT")).map(
          (div) => div.textContent
        ),

        // HTML 구조 확인을 위한 전체 HTML
        html: document.documentElement.outerHTML,
      };

      return data;
    });

    await browser.close();

    return NextResponse.json(productData);
  } catch (error) {
    console.error("크롤링 에러:", error);
    return NextResponse.json(
      { error: "크롤링 중 오류가 발생했습니다." },
      { status: 500 }
    );
  }
}
