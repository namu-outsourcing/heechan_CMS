import { format } from "date-fns";

/**
 * 금액을 천 단위 콤마가 포함된 문자열로 변환합니다.
 */
export const formatCurrency = (amount: number): string => {
  return amount.toLocaleString() + "원";
};

/**
 * 날짜 객체 또는 문자열을 'yyyy.MM.dd' 형식으로 변환합니다.
 */
export const formatDate = (date: Date | string): string => {
  return format(new Date(date), "yyyy.MM.dd");
};

/**
 * 날짜 객체 또는 문자열을 'yyyy년 MM월 dd일' 형식으로 변환합니다.
 */
export const formatFullDate = (date: Date | string): string => {
  return format(new Date(date), "yyyy년 MM월 dd일");
};

/**
 * 전화번호 자릿수에 맞춰 하이픈을 추가합니다. (01012345678 -> 010-1234-5678)
 */
export const formatPhone = (phone?: string): string => {
  if (!phone) return "-";
  const cleaned = phone.replace(/\D/g, "");
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{3})(\d{4})(\d{4})/, "$1-$2-$3");
  }
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{3})(\d{3})(\d{4})/, "$1-$2-$3");
  }
  return phone;
};
