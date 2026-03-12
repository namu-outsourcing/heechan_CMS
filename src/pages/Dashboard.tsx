import { useEffect, useState, useMemo } from "react";
import { useVisitStore } from "../hooks/useVisits";
import SalesSummaryCard from "../components/dashboard/SalesSummaryCard";
import { downloadSalesExcel } from "../utils/excel";
import {
  Calendar,
  Download,
  TrendingUp,
  Filter,
  BarChart3,
  PieChart as PieIcon,
} from "lucide-react";
import {
  startOfMonth,
  endOfMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
  format,
  subMonths,
  eachMonthOfInterval,
  startOfToday,
} from "date-fns";
import { ko } from "date-fns/locale";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#3b82f6",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
];

export default function Dashboard() {
  const { visits, isLoading, fetchVisits } = useVisitStore();
  const [filterMonth, setFilterMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

  // 날짜 기준 필터링 데이터 준비
  const today = startOfToday();
  const filterDate = new Date(filterMonth + "-01");
  const monthStart = startOfMonth(filterDate);
  const monthEnd = endOfMonth(filterDate);

  // 1. 선택한 "이 달의 매출"
  const monthlyVisits = visits.filter((v) => {
    const vDate = parseISO(v.visited_at);
    return isWithinInterval(vDate, { start: monthStart, end: monthEnd });
  });

  // 2. "오늘의 매출"
  const todayVisits = visits.filter((v) =>
    isSameDay(parseISO(v.visited_at), today),
  );

  // 3. 최근 6개월 추이 데이터 가공
  const trendData = useMemo(() => {
    const last6Months = eachMonthOfInterval({
      start: subMonths(today, 5),
      end: today,
    });

    return last6Months.map((month) => {
      const mStart = startOfMonth(month);
      const mEnd = endOfMonth(month);
      const mVisits = visits.filter((v) =>
        isWithinInterval(parseISO(v.visited_at), { start: mStart, end: mEnd }),
      );

      return {
        name: format(month, "MMM", { locale: ko }),
        total: mVisits.reduce((sum, v) => sum + v.payment_amount, 0),
        count: mVisits.length,
      };
    });
  }, [visits, today]);

  // 4. 시술별 결과 집계 (이번 달 기준)
  const serviceStats = useMemo(() => {
    const stats: Record<string, { value: number; count: number }> = {};
    monthlyVisits.forEach((v) => {
      if (v.services && v.services.length > 0) {
        v.services.forEach((s) => {
          if (!stats[s]) stats[s] = { value: 0, count: 0 };
          stats[s].count += 1;
          // 결제 금액을 시술 개수로 나눠서 대략적인 비중 산출 (간이 방식)
          stats[s].value += v.payment_amount / v.services!.length;
        });
      } else {
        if (!stats["기타"]) stats["기타"] = { value: 0, count: 0 };
        stats["기타"].value += v.payment_amount;
        stats["기타"].count += 1;
      }
    });

    return Object.entries(stats)
      .map(([name, data]) => ({ name, value: data.value, count: data.count }))
      .sort((a, b) => b.value - a.value);
  }, [monthlyVisits]);

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
    <div className="space-y-8 pb-12">
      <div>
        <h2 className="text-2xl font-bold text-gray-900">매출 대시보드</h2>
        <p className="text-sm text-gray-500 mt-1">
          헤어샵의 매출 흐름과 인기 시술을 시각적으로 파악합니다.
        </p>
      </div>

      {/* 요약 카드 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <SalesSummaryCard
          title="오늘 매출"
          total={todayStats.total}
          cardAmount={todayStats.card}
          cashAmount={todayStats.cash}
          icon={<TrendingUp className="w-5 h-5 text-blue-600" />}
        />
        <SalesSummaryCard
          title={`${format(filterDate, "L월")} 매출`}
          total={monthlyStats.total}
          cardAmount={monthlyStats.card}
          cashAmount={monthlyStats.cash}
          icon={<Calendar className="w-5 h-5 text-indigo-600" />}
        />
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col justify-center">
          <div className="flex items-center space-x-3 mb-2 text-gray-400">
            <BarChart3 className="w-5 h-5" />
            <span className="text-sm font-semibold text-gray-500 uppercase tracking-wider">
              이 달의 고객수
            </span>
          </div>
          <p className="text-3xl font-extrabold text-gray-900">
            {monthlyVisits.length}
            <span className="text-lg font-medium text-gray-400 ml-1">건</span>
          </p>
          <div className="mt-3 flex items-center text-xs">
            <span className="text-gray-400">
              평균 객단가:{" "}
              {monthlyVisits.length > 0
                ? (monthlyStats.total / monthlyVisits.length).toLocaleString()
                : 0}
              원
            </span>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* 월별 매출 추이 차트 */}
        <div className="lg:col-span-2 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
            최근 6개월 매출 추이
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid
                  strokeDasharray="3 3"
                  vertical={false}
                  stroke="#f1f5f9"
                />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 12 }}
                  tickFormatter={(val) => `${val / 10000}만`}
                />
                <Tooltip
                  contentStyle={{
                    backgroundColor: "#fff",
                    border: "1px solid #e2e8f0",
                    borderRadius: "12px",
                    boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                  }}
                  formatter={(value: any) => [
                    `${value.toLocaleString()}원`,
                    "매출액",
                  ]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={3}
                  dot={{
                    r: 4,
                    fill: "#3b82f6",
                    strokeWidth: 2,
                    stroke: "#fff",
                  }}
                  activeDot={{ r: 6 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 필터 및 엑셀 다운로드 사이드 섹션 */}
        <div className="flex flex-col gap-6">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex-1">
            <h3 className="text-lg font-bold text-gray-800 mb-4 flex items-center">
              <Filter className="w-5 h-5 mr-2 text-gray-400" />
              상세 분석 필터
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
                  분석 월 선택
                </label>
                <input
                  type="month"
                  className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg outline-none focus:ring-2 focus:ring-blue-500 font-medium text-gray-700"
                  value={filterMonth}
                  onChange={(e) => setFilterMonth(e.target.value)}
                />
              </div>
              <button
                onClick={handleExportExcel}
                className="w-full inline-flex items-center justify-center px-4 py-2.5 bg-emerald-600 text-white font-semibold rounded-lg hover:bg-emerald-700 transition-colors shadow-sm"
              >
                <Download className="w-5 h-5 mr-2" />
                {format(filterDate, "L월")} 매출 엑셀 다운로드
              </button>
            </div>
            <div className="mt-6 pt-6 border-t border-gray-100 italic text-xs text-gray-400">
              * 상단 카드의 "이 달의 매출" 스탯은 여기서 선택한 월을 기준으로
              집계됩니다.
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 서비스 비중 차트 */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <PieIcon className="w-5 h-5 mr-2 text-indigo-500" />
            {format(filterDate, "L월")} 시술 카테고리별 비중
          </h3>
          <div className="h-64 w-full">
            {serviceStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={serviceStats}
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {serviceStats.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: any) =>
                      `${Math.round(value).toLocaleString()}원`
                    }
                  />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                이번 달 시술 데이터가 부족합니다.
              </div>
            )}
          </div>
        </div>

        {/* 서비스별 횟수 분석 (Bar Chart) */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <h3 className="text-lg font-bold text-gray-800 mb-6 flex items-center">
            <BarChart3 className="w-5 h-5 mr-2 text-emerald-500" />
            {format(filterDate, "L월")} 시술 항목별 횟수
          </h3>
          <div className="h-64 w-full">
            {serviceStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <BarChart
                  data={serviceStats}
                  layout="vertical"
                  margin={{ left: 20 }}
                >
                  <CartesianGrid
                    strokeDasharray="3 3"
                    horizontal={true}
                    vertical={false}
                    stroke="#f1f5f9"
                  />
                  <XAxis type="number" hide />
                  <YAxis
                    dataKey="name"
                    type="category"
                    axisLine={false}
                    tickLine={false}
                    width={80}
                  />
                  <Tooltip cursor={{ fill: "#f8fafc" }} />
                  <Bar
                    dataKey="count"
                    fill="#10b981"
                    radius={[0, 4, 4, 0]}
                    barSize={24}
                  />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                데이터가 없습니다.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
