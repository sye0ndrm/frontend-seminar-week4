import type { Recipe } from "../types/recipe";

const recipeImage = (seed: number) =>
  `https://picsum.photos/seed/${seed}/800/600`;

const recipeNames = [
  "트러플 크림 파스타",
  "아보카도 에그 토스트",
  "해산물 토마토 스튜",
  "바질 치킨 샐러드",
  "버터 치킨 커리",
  "연어 포케 볼",
  "클래식 프렌치토스트",
  "버섯 리소토",
  "비프 타코",
  "딸기 요거트 파르페",
  "매콤한 두부 덮밥",
  "레몬 마들렌",
  "토마토 바질 브루스케타",
  "허니 갈릭 윙",
  "새우 알리오 올리오",
  "그릭 샐러드",
  "불고기 비빔밥",
  "단호박 수프",
  "라따뚜이",
  "치즈 오믈렛",
  "바나나 팬케이크",
  "매콤한 닭갈비",
  "참치 마요 덮밥",
  "오렌지 치킨",
  "까르보나라",
  "연근 칩",
  "가지 라자냐",
  "치킨 퀘사디아",
  "소고기 쌀국수",
  "시금치 프리타타",
  "초콜릿 브라우니",
  "고구마 그라탱",
  "유자 드레싱 샐러드",
  "버섯 된장국",
  "로제 떡볶이",
  "연어 스테이크",
  "마파두부",
  "에그 베네딕트",
  "애플 크럼블",
  "바질 페스토 파스타",
  "치킨 시저 샐러드",
  "김치 볶음밥",
  "새우 크림 리소토",
  "레몬 치킨 구이",
  "크로크무슈",
  "참깨 소바",
  "블루베리 머핀",
  "타코 샐러드",
  "돼지고기 타코",
  "버섯 크림 수프",
  "떡갈비",
  "바나나 스무디",
  "두부 스테이크",
  "프렌치 어니언 수프",
  "치킨 파마산",
  "망고 찹쌀 푸딩",
  "해물 파에야",
  "아스파라거스 키쉬",
  "말차 티라미수",
  "갈릭 버터 새우",
] as const;

const cuisines = [
  "Korean",
  "Italian",
  "French",
  "Mexican",
  "Japanese",
  "American",
];
const mealTypes = ["Breakfast", "Lunch", "Dinner", "Dessert", "Snack"];
const tagSets = [
  ["간편요리", "집밥", "인기"],
  ["홈파티", "특별한날", "따뜻한요리"],
  ["건강식", "고단백", "한그릇요리"],
  ["브런치", "주말요리", "15분요리"],
  ["디저트", "노오븐", "아이간식"],
] as const;

const ingredientSets = [
  ["주재료 200g", "신선한 채소", "올리브 오일 1큰술", "소금", "후추"],
  ["닭가슴살 200g", "양파 1/2개", "마늘 2쪽", "버터", "허브"],
  ["밥 1공기", "제철 채소", "달걀 1개", "간장", "참기름"],
  ["생크림 150ml", "파마산 치즈", "버섯 100g", "파스타면", "후추"],
  ["그릭 요거트", "제철 과일", "그래놀라", "꿀", "민트"],
] as const;

const instructions = [
  "재료를 깨끗이 손질합니다.",
  "팬을 예열하고 주재료를 조리합니다.",
  "채소와 양념을 넣어 맛을 더합니다.",
  "접시에 담아 따뜻할 때 제공합니다.",
];

export const recipes: Recipe[] = recipeNames.map((name, index) => {
  const id = index + 1;

  return {
    id,
    name,
    ingredients: [...ingredientSets[index % ingredientSets.length]],
    instructions,
    prepTimeMinutes: 10 + (index % 4) * 5,
    cookTimeMinutes: 10 + (index % 5) * 5,
    servings: (index % 4) + 1,
    difficulty: index % 7 === 0 ? "Hard" : index % 3 === 0 ? "Medium" : "Easy",
    cuisine: cuisines[index % cuisines.length],
    caloriesPerServing: 250 + (index % 8) * 55,
    tags: [...tagSets[index % tagSets.length]],
    userId: 101 + index,
    image: recipeImage(id),
    rating: Number((4.2 + (index % 8) * 0.1).toFixed(1)),
    reviewCount: 24 + index * 7,
    mealType: [mealTypes[index % mealTypes.length]],
  };
});
