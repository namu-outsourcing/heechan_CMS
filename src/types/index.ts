export interface Customer {
  id: string;
  name: string;
  phone?: string;
  memo?: string; // 고객 메모 (신규 추가)
  created_at?: string;
}

export interface Visit {
  id: string;
  customer_id: string;
  visited_at: string;
  payment_amount: number;
  payment_method: "card" | "cash";
  services?: string[]; // 시술 칩 선택 목록 (신규 추가)
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
