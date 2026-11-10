export type Recipe = {
  /** 레시피를 구분하는 고유 ID */
  id: number;
  /** 레시피 이름 */
  name: string;
  /** 요리에 필요한 재료 목록 */
  ingredients: string[];
  /** 요리 순서 목록 */
  instructions: string[];
  /** 준비 시간(분) */
  prepTimeMinutes: number;
  /** 조리 시간(분) */
  cookTimeMinutes: number;
  /** 몇 인분인지 나타내는 값 */
  servings: number;
  /** 요리 난이도 */
  difficulty: "Easy" | "Medium" | "Hard";
  /** 요리의 국가 또는 지역 스타일 */
  cuisine: string;
  /** 1인분 기준 칼로리 */
  caloriesPerServing: number;
  /** 레시피를 분류하는 태그 목록 */
  tags: string[];
  /** 레시피를 작성한 사용자의 ID */
  userId: number;
  /** 레시피 이미지 URL */
  image: string;
  /** 사용자 평점 */
  rating: number;
  /** 리뷰 개수 */
  reviewCount: number;
  /** 아침·점심·저녁 등 식사 유형 목록 */
  mealType: string[];
};
