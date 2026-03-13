import { useEffect, useState } from "react";
import { useVisitStore } from "../hooks/useVisits";
import { useDashboard } from "../hooks/useDashboard";
import SalesSummaryCard from "../components/dashboard/SalesSummaryCard";
import {
  Calendar,
  Download,
  TrendingUp,
  Filter,
  PieChart as PieIcon,
  Trophy,
  Users,
  Percent,
  ChevronRight,
} from "lucide-react";
import { format } from "date-fns";
import { formatCurrency } from "../utils/format";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

const COLORS = [
  "#6366f1",
  "#0ea5e9",
  "#10b981",
  "#f59e0b",
  "#ef4444",
  "#8b5cf6",
  "#ec4899",
  "#14b8a6",
];

const ChartGradients = () => (
  <defs>
    {COLORS.map((color, i) => (
      <linearGradient key={`grad-${i}`} id={`grad-${i}`} x1="0" y1="0" x2="0" y2="1">
        <stop offset="0%" stopColor={color} stopOpacity={1} />
        <stop offset="100%" stopColor={color} stopOpacity={0.7} />
      </linearGradient>
    ))}
    <linearGradient id="grad-card" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#6366f1" stopOpacity={1} />
      <stop offset="100%" stopColor="#4f46e5" stopOpacity={0.8} />
    </linearGradient>
    <linearGradient id="grad-cash" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stopColor="#10b981" stopOpacity={1} />
      <stop offset="100%" stopColor="#059669" stopOpacity={0.8} />
    </linearGradient>
  </defs>
);

export default function Dashboard() {
  const { isLoading, fetchVisits } = useVisitStore();
  const {
    filterMonth,
    setFilterMonth,
    filterDate,
    monthlyVisits,
    todayStats,
    monthlyStats,
    trendData,
    serviceStats,
    topServices,
    paymentMethodData,
    todayGrowth,
    monthGrowth,
    handleExportExcel,
  } = useDashboard();

  const [activeServiceIdx, setActiveServiceIdx] = useState(-1);
  const [activePaymentIdx, setActivePaymentIdx] = useState(-1);

  useEffect(() => {
    fetchVisits();
  }, [fetchVisits]);

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
          title="오늘 매출액"
          total={todayStats.total}
          cardAmount={todayStats.card}
          cashAmount={todayStats.cash}
          pointAmount={todayStats.points}
          icon={<TrendingUp className="w-5 h-5 text-emerald-600" />}
          change={todayGrowth}
          trend={todayGrowth > 0 ? "up" : todayGrowth < 0 ? "down" : "neutral"}
        />
        <SalesSummaryCard
          title={`${format(filterDate, "L월")} 매출 요약`}
          total={monthlyStats.total}
          cardAmount={monthlyStats.card}
          cashAmount={monthlyStats.cash}
          pointAmount={monthlyStats.points}
          icon={<Calendar className="w-5 h-5 text-indigo-600" />}
          change={monthGrowth}
          trend={monthGrowth > 0 ? "up" : monthGrowth < 0 ? "down" : "neutral"}
        />
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-all">
          <div className="flex items-center justify-between mb-4">
            <div className="p-2.5 bg-gray-50 text-gray-400 rounded-xl">
              <Users className="w-5 h-5 ml-0" />
            </div>
            <div className="px-2 py-1 bg-indigo-50 text-indigo-600 rounded-full text-[10px] font-bold uppercase tracking-wider">
              Monthly Active
            </div>
          </div>
          <div className="mb-1">
            <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
              이 달의 고객수
            </h3>
          </div>
          <p className="text-3xl font-extrabold text-gray-900 tracking-tight">
            {monthlyVisits.length}
            <span className="text-base font-medium text-gray-400 ml-1">건</span>
          </p>
          <div className="mt-auto pt-4 border-t border-gray-50">
            <div className="flex items-center justify-between pb-3 border-b border-gray-50">
              <span className="text-xs text-gray-400 font-medium tracking-tight">포인트 사용액</span>
              <span className="text-sm font-bold text-rose-600">
                {formatCurrency(monthlyStats.points)}
              </span>
            </div>
            <div className="flex items-center justify-between pt-3">
              <span className="text-xs text-gray-400 font-medium">평균 객단가 (실매출 기준)</span>
              <span className="text-sm font-bold text-gray-700">
                {monthlyVisits.length > 0
                  ? formatCurrency(Math.round(monthlyStats.total / monthlyVisits.length))
                  : "0원"}
              </span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 월별 매출 추이 차트 */}
        <div className="lg:col-span-3 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <TrendingUp className="w-5 h-5 mr-2 text-blue-500" />
              최근 6개월 매출 추이
            </h3>
            <div className="hidden sm:flex space-x-2">
              <span className="flex items-center text-xs text-gray-400">
                <span className="w-2 h-2 rounded-full bg-blue-500 mr-1.5"></span>
                매출 하이라이트
              </span>
            </div>
          </div>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={trendData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.1} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis
                  dataKey="name"
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                  dy={10}
                />
                <YAxis
                  axisLine={false}
                  tickLine={false}
                  tick={{ fill: "#94a3b8", fontSize: 11, fontWeight: 500 }}
                  tickFormatter={(val: number) => `${val / 10000}만`}
                />
                <Tooltip
                  cursor={{ stroke: "#e2e8f0", strokeWidth: 1 }}
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.9)",
                    backdropFilter: "blur(8px)",
                    border: "1px solid #f1f5f9",
                    borderRadius: "16px",
                    boxShadow: "0 10px 15px -3px rgb(0 0 0 / 0.1)",
                    padding: "12px",
                  }}
                  itemStyle={{ fontSize: "13px", fontWeight: "bold" }}
                  formatter={(value) => [formatCurrency(typeof value === "number" ? value : 0), "매출액"]}
                />
                <Line
                  type="monotone"
                  dataKey="total"
                  stroke="#3b82f6"
                  strokeWidth={4}
                  dot={{ r: 5, fill: "#3b82f6", strokeWidth: 3, stroke: "#fff" }}
                  activeDot={{ r: 8, strokeWidth: 0 }}
                  animationDuration={1500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 상세 분석 필터 카드 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col">
          <div className="p-2.5 bg-gray-50 text-gray-400 rounded-xl w-fit mb-4">
            <Filter className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-bold text-gray-800 mb-1">데이터 필터</h3>
          <p className="text-xs text-gray-500 mb-6">원하시는 월의 상세 데이터를 확인하세요.</p>

          <div className="space-y-5">
            <div>
              <label className="block text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-2 ml-1">
                분석 기준월
              </label>
              <input
                type="month"
                className="w-full px-4 py-3 bg-white border border-gray-100 rounded-xl outline-none focus:ring-2 focus:ring-blue-500 shadow-sm font-bold text-gray-700 transition-all cursor-pointer"
                value={filterMonth}
                onChange={(e) => setFilterMonth(e.target.value)}
              />
            </div>
            <button
              onClick={handleExportExcel}
              className="w-full flex items-center justify-center space-x-2 px-4 py-3 bg-gray-900 text-white font-bold rounded-xl hover:bg-black transition-all shadow-lg active:scale-95"
            >
              <Download className="w-4 h-4" />
              <span>보고서 추출</span>
            </button>
          </div>
          <div className="mt-auto pt-6 text-[10px] text-gray-400 leading-relaxed font-medium">
            * 선택된 월({format(filterDate, "yyyy년 L월")})의 모든 방문 기록과 통계 데이터가 하단 차트에 반영됩니다.
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* 서비스 비중 차트 (도넛) */}
        <div className="lg:col-span-2 bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-8">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <PieIcon className="w-5 h-5 mr-2 text-indigo-500" />
              분석 월 시술 카테고리 비중
            </h3>
            <div className="px-2.5 py-1 bg-indigo-50 text-indigo-600 rounded-lg text-[10px] font-bold uppercase tracking-wider">
              Service Share
            </div>
          </div>
          <div className="h-80 w-full relative">
            <div className="absolute top-1/2 left-[30%] -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
              <div className="text-[10px] font-bold text-gray-400 uppercase tracking-tighter">Total</div>
              <div className="text-xl font-black text-gray-800 leading-none">
                {Math.round(serviceStats.reduce((sum, s) => sum + s.value, 0) / 10000)}
                <span className="text-xs font-bold text-gray-400 ml-0.5">만</span>
              </div>
            </div>

            {serviceStats.length > 0 ? (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <ChartGradients />
                  <Pie
                    data={serviceStats}
                    innerRadius={70}
                    outerRadius={95}
                    paddingAngle={6}
                    dataKey="value"
                    stroke="none"
                    cornerRadius={8}
                    onMouseEnter={(_, index) => setActiveServiceIdx(index)}
                    onMouseLeave={() => setActiveServiceIdx(-1)}
                  >
                    {serviceStats.map((_, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={`url(#grad-${index % COLORS.length})`}
                        style={{
                          filter:
                            activeServiceIdx === index
                              ? "drop-shadow(0px 8px 12px rgba(0,0,0,0.15))"
                              : "none",
                          transition: "all 0.3s ease",
                          transform: activeServiceIdx === index ? "scale(1.05)" : "scale(1)",
                          transformOrigin: "center",
                        }}
                      />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.9)",
                      backdropFilter: "blur(8px)",
                      border: "none",
                      borderRadius: "12px",
                      boxShadow: "0 4px 6px -1px rgb(0 0 0 / 0.1)",
                    }}
                    formatter={(value) => `${Math.round(typeof value === "number" ? value : 0).toLocaleString()}원`}
                  />
                  <Legend
                    verticalAlign="middle"
                    align="right"
                    layout="vertical"
                    iconType="circle"
                    wrapperStyle={{
                      paddingLeft: "20px",
                      maxHeight: "100%",
                      overflowY: "auto",
                      scrollbarWidth: "none",
                      msOverflowStyle: "none",
                    }}
                    formatter={(value: string, entry: { payload?: { percent?: number } }) => {
                      const percent = entry.payload?.percent;
                      const displayPercent = isNaN(percent ?? NaN) ? 0 : Math.round((percent ?? 0) * 100);
                      return (
                        <span
                          className={`text-[11px] font-bold transition-colors inline-block pb-1 ${
                            activeServiceIdx === serviceStats.findIndex((s) => s.name === value)
                              ? "text-indigo-600"
                              : "text-gray-500"
                          }`}
                        >
                          {value} ({displayPercent}%)
                        </span>
                      );
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-full flex items-center justify-center text-gray-400 text-sm italic">
                이번 달 시술 데이터가 부족합니다.
              </div>
            )}
          </div>
        </div>

        {/* 결제 수단 비중 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Percent className="w-5 h-5 mr-2 text-emerald-500" />
              결제 수단 비중
            </h3>
          </div>
          <div className="h-52 w-full mt-2 relative">
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-[60%] pointer-events-none">
              <Percent className="w-6 h-6 text-gray-100" />
            </div>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <ChartGradients />
                <Pie
                  data={paymentMethodData}
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={8}
                  dataKey="value"
                  stroke="none"
                  cornerRadius={6}
                  onMouseEnter={(_, index) => setActivePaymentIdx(index)}
                  onMouseLeave={() => setActivePaymentIdx(-1)}
                >
                  <Cell
                    fill="url(#grad-card)"
                    style={{
                      transition: "all 0.3s ease",
                      transform: activePaymentIdx === 0 ? "scale(1.08)" : "scale(1)",
                      transformOrigin: "center",
                    }}
                  />
                  <Cell
                    fill="url(#grad-cash)"
                    style={{
                      transition: "all 0.3s ease",
                      transform: activePaymentIdx === 1 ? "scale(1.08)" : "scale(1)",
                      transformOrigin: "center",
                    }}
                  />
                </Pie>
                <Tooltip formatter={(value) => `${(typeof value === "number" ? value : 0).toLocaleString()}원`} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex items-center justify-between text-xs px-1">
              <div
                className={`flex items-center font-bold transition-colors ${
                  activePaymentIdx === 0 ? "text-blue-600" : "text-gray-400"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
                카드 결제
              </div>
              <span
                className={`font-extrabold transition-colors ${
                  activePaymentIdx === 0 ? "text-blue-600" : "text-gray-900"
                }`}
              >
                {monthlyStats.total > 0
                  ? Math.round((monthlyStats.card / monthlyStats.total) * 100)
                  : 0}
                %
              </span>
            </div>
            <div className="flex items-center justify-between text-xs px-1">
              <div
                className={`flex items-center font-bold transition-colors ${
                  activePaymentIdx === 1 ? "text-emerald-600" : "text-gray-400"
                }`}
              >
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
                현금 / 계좌
              </div>
              <span
                className={`font-extrabold transition-colors ${
                  activePaymentIdx === 1 ? "text-emerald-600" : "text-gray-900"
                }`}
              >
                {monthlyStats.total > 0
                  ? Math.round((monthlyStats.cash / monthlyStats.total) * 100)
                  : 0}
                %
              </span>
            </div>
          </div>
        </div>

        {/* 인기 시술 TOP 3 */}
        <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-lg font-bold text-gray-800 flex items-center">
              <Trophy className="w-5 h-5 mr-2 text-amber-500" />
              인기 시술 TOP 3
            </h3>
          </div>
          <div className="space-y-4">
            {topServices.length > 0 ? (
              topServices.map((service, idx) => (
                <div
                  key={service.name}
                  className="relative overflow-hidden p-4 bg-gray-50/50 rounded-xl border border-gray-50 group hover:bg-white hover:shadow-sm transition-all"
                >
                  <div className="flex items-center justify-between relative z-10">
                    <div className="flex items-center">
                      <div
                        className={`w-6 h-6 rounded-lg flex items-center justify-center text-[10px] font-black mr-3 ${
                          idx === 0
                            ? "bg-amber-100 text-amber-600"
                            : idx === 1
                              ? "bg-slate-100 text-slate-500"
                              : "bg-orange-100 text-orange-600"
                        }`}
                      >
                        {idx + 1}
                      </div>
                      <div>
                        <div className="text-sm font-extrabold text-gray-800">{service.name}</div>
                        <div className="text-[10px] text-gray-400 font-bold uppercase tracking-tight">
                          수행 횟수: {service.count}회
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-colors" />
                  </div>
                  <div className="mt-2.5 h-1.5 w-full bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full ${idx === 0 ? "bg-amber-400" : "bg-blue-400"}`}
                      style={{ width: `${(service.count / topServices[0].count) * 100}%` }}
                    />
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-xs text-gray-400 font-medium">
                데이터 대기 중...
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
