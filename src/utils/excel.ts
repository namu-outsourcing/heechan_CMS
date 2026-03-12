import * as XLSX from "xlsx";
import { VisitWithCustomer } from "../hooks/useVisits";
import { format } from "date-fns";

export function downloadSalesExcel(
  visits: VisitWithCustomer[],
  fileName: string = "매출내역",
) {
  // 1. 엑셀로 변환할 데이터 배열 포맷팅
  const data = visits.map((v) => ({
    날짜: format(new Date(v.visited_at), "yyyy-MM-dd"),
    고객명: v.customers?.name || "알수없음",
    연락처: v.customers?.phone || "-",
    결제수단: v.payment_method === "card" ? "카드" : "현금",
    결제금액: v.payment_amount,
    메모: v.memo || "",
  }));

  // 2. 워크시트 생성
  const worksheet = XLSX.utils.json_to_sheet(data);

  // 컬럼 너비 설정 (옵션)
  const wscols = [
    { wch: 12 }, // 날짜
    { wch: 10 }, // 고객명
    { wch: 15 }, // 연락처
    { wch: 10 }, // 결제수단
    { wch: 12 }, // 결제금액
    { wch: 30 }, // 메모
  ];
  worksheet["!cols"] = wscols;

  // 3. 워크북 생성 및 첨부
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Sales");

  // 4. 파일 다운로드
  XLSX.writeFile(
    workbook,
    `${fileName}_${format(new Date(), "yyyyMMdd")}.xlsx`,
  );
}
