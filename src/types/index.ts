export interface Customer {
  id: string;
  name: string;
  phone?: string;
  memo?: string;
  created_at?: string;
}

export interface Visit {
  id: string;
  customer_id: string;
  visited_at: string;
  payment_amount: number;
  payment_method: "card" | "cash";
  services?: string[];
  memo?: string;
  points_earned?: number;
  points_used?: number;
  created_at?: string;
}

export interface CustomerWithLastVisit extends Customer {
  visits?: { visited_at: string; points_earned: number; points_used: number }[];
  last_visited_at?: string;
  total_points?: number;
}

export interface ServiceCategory {
  id: string;
  name: string;
  price: number;
  created_at?: string;
}

export interface VisitSaveData {
  customer_id: string;
  visited_at: string;
  payment_amount: number;
  payment_method: "card" | "cash";
  services?: string[];
  memo?: string;
  points_earned?: number;
  points_used?: number;
}

export type CustomerSaveData = Omit<
  CustomerWithLastVisit,
  "id" | "created_at" | "visits" | "last_visited_at" | "total_points"
>;

export interface NaverExcelRow {
  "예약자명"?: string;
  "주문자명"?: string;
  "연락처"?: string;
  "상품명"?: string;
  "서비스명"?: string;
  "이용완료일시"?: string;
  "방문일시"?: string;
  "결제금액"?: string | number;
}
