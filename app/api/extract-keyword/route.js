import OpenAI from "openai";
import { NextResponse } from "next/server";

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

export async function POST(request) {
  try {
    const { productName, imageUrl } = await request.json();

    if (!productName) {
      return NextResponse.json(
        { error: "제품명이 필요합니다." },
        { status: 400 }
      );
    }

    if (!imageUrl) {
      return NextResponse.json(
        { error: "이미지 URL이 필요합니다." },
        { status: 400 }
      );
    }

    const messages = [
      {
        role: "system",
        content: `
          당신은 제품명과 이미지를 종합적으로 분석하여 가장 핵심적인 검색 키워드를 추출하는 전문가입니다. 
          제품의 본질적인 카테고리와 핵심적인 용도를 정확히 파악하여 소비자들이 실제 검색할 가능성이 가장 높은 메인 키워드를 도출해야 합니다. 
          
          **중요한 지침:**
          1. **제품을 대표하는 가장 일반적인 키워드를 선택하세요.**  
             - 브랜드명, 감성적인 표현, 수식어(예: '고급', '귀여운', '모던한')는 배제합니다.  
             - 제품의 본질적인 카테고리를 반영하는 단어만 선택하세요.  
             - 예: '네스프레소 커피머신' → '커피머신', '휴대용 미니 선풍기' → '선풍기'
          
          2. **제품명이 모호하거나 다양한 의미를 가질 경우, 이미지도 참고하여 적절한 키워드를 선택하세요.**  
             - 예: '스마트한 수납 아이템' → 이미지가 '책상 정리함'이면 '책상정리함'을 선택.  
             - 단, 이미지와 제품명이 불일치할 경우 제품명을 우선 고려하되, 이미지에서 보이는 특징을 보완적으로 반영하세요.  
          
          3. **검색 가능성을 고려하여 가장 보편적인 키워드를 도출하세요.**  
             - 사람들이 실제 검색할 가능성이 높은 단어를 선택해야 합니다.  
             - 너무 구체적인 키워드보다는 널리 쓰이는 대표 키워드를 우선합니다.  
             - 예: '게이밍용 LED 기계식 키보드' → '기계식키보드'  
          
          4. **하나의 단어 또는 짧은 단어 조합만 반환하세요.**  
             - 띄어쓰기 없이 하나의 단어 또는 핵심 단어 조합만 출력하세요.  
             - 예: '전자레인지', '무선청소기', '여행가방', '노트북거치대'  
          
          이제 제공된 제품명과 이미지를 분석하여 가장 핵심적인 메인 키워드 하나만 출력하세요.
        `,
      },
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `다음 제품명과 이미지를 분석하여 가장 핵심적인 메인 키워드 하나만 띄어쓰기 없이 추출해주세요.\n\n제품명: "${productName}"`,
          },
          {
            type: "image_url",
            image_url: {
              url: imageUrl,
            },
          },
        ],
      },
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages,
      temperature: 0.2,
      max_tokens: 500,
    });

    const extractedKeyword = response.choices[0].message.content.trim();

    return NextResponse.json({ keyword: extractedKeyword });
  } catch (error) {
    console.error("키워드 추출 오류:", error);
    return NextResponse.json(
      {
        error: `키워드 추출 중 오류가 발생했습니다: ${error.message}`,
        details: error.toString(),
      },
      { status: 500 }
    );
  }
}
