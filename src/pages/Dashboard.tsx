import { useEffect, useState } from "react";
import { useVisitStore } from "../hooks/useVisits";
import SalesSummaryCard from "../components/dashboard/SalesSummaryCard";
import { downloadSalesExcel } from "../utils/excel";
import { Calendar, Download, TrendingUp, Filter } from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
} from "date-fns";

export default function Dashboard() {
  const { visits, isLoading, fetchVisits } = useVisitStore();
  const [filterMonth, setFilterMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // 날짜 기준 필터링
  const today = new Date();
  const filterDate = new Date(filterMonth + "-01");
  const monthStart = startOfMonth(filterDate);
  const monthEnd = endOfMonth(filterDate);

  // 1. 선택한 "이 달의 매출" (이번달/과거달 등)
  const monthlyVisits = visits.filter((v) => {
    const vDate = parseISO(v.visited_at);
    return isWithinInterval(vDate, { start: monthStart, end: monthEnd });
  });

  // 2. "오늘의 매출" (무조건 실제 오늘 날짜 기준)
  const todayVisits = visits.filter((v) => {
    return isSameDay(parseISO(v.visited_at), today);
  });

  // 통계 계산 헬퍼 함수
  const calcStats = (targetVisits: typeof visits) => {
    return targetVisits.reduce(
      (acc, v) => {
        acc.total += v.payment_amount;
        if (v.payment_method === "card") acc.card += v.payment_amount;
        else acc.cash += v.payment_amount;
        return acc;
      },
      { total: 0, card: 0, cash: 0 },
    );
  };

  const todayStats = calcStats(todayVisits);
  const monthlyStats = calcStats(monthlyVisits);

  const handleExportExcel = () => {
    if (monthlyVisits.length === 0)
      return alert("다운로드할 데이터가 없습니다.");
    downloadSalesExcel(
      monthlyVisits,
      `매출내역_${filterMonth.replace("-", "")}`,
    );
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">매출 대시보드</h2>
          <p className="text-sm text-gray-500 mt-1">
            방문 기록을 바탕으로 오늘과 이달의 자동 집계된 매출 현황을
            확인합니다.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <SalesSummaryCard
          title="오늘 매출"
          total={todayStats.total}
          cardAmount={todayStats.card}
          cashAmount={todayStats.cash}
          icon={<TrendingUp className="w-6 h-6" />}
        />
        <SalesSummaryCard
          title="이 달의 매출"
          total={monthlyStats.total}
          cardAmount={monthlyStats.card}
          cashAmount={monthlyStats.cash}
          icon={<Calendar className="w-6 h-6" />}
        />
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-gray-100 bg-gray-50/50">
          <div className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-gray-400" />
            <span className="font-medium text-gray-700">조회 월 선택</span>
            <input
              type="month"
              className="ml-2 p-2 px-3 bg-white border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
            />
          </div>
          <button
            onClick={handleExportExcel}
            className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white font-medium rounded-lg hover:bg-emerald-700 transition-colors shadow-sm focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
          >
            <Download className="w-5 h-5 mr-2" />
            엑셀 내보내기
          </button>
        </div>

        <div className="p-6">
          <p className="text-gray-500 mb-4 font-medium">
            선택한 달({filterMonth})의 총 방문 건수:{" "}
            <span className="text-blue-600 font-bold">
              {monthlyVisits.length}건
            </span>
          </p>
          <p className="text-sm text-gray-400">
            상세 내역은 [방문 기록] 탭에서 확인하거나 엑셀 파일을 다운로드하여
            대조할 수 있습니다.
          </p>
        </div>
      </div>
    </div>
  );
}
