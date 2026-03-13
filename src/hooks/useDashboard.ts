import { useState, useMemo } from "react";
import { useVisitStore } from "./useVisits";
import { VisitWithCustomer } from "./useVisits";
import { downloadSalesExcel } from "../utils/excel";
import {
  startOfMonth,
  endOfMonth,
  isSameDay,
  isWithinInterval,
  parseISO,
  format,
  subMonths,
  subDays,
  eachMonthOfInterval,
  startOfToday,
} from "date-fns";
import { ko } from "date-fns/locale";

export interface SalesStats {
  total: number;
  card: number;
  cash: number;
  points: number;
  gross: number;
}

function calcStats(targetVisits: VisitWithCustomer[]): SalesStats {
  return targetVisits.reduce(
    (acc, v) => {
      const amount = v.payment_amount || 0;
      const used = v.points_used || 0;
      acc.total += amount;
      acc.points += used;
      acc.gross += amount + used;
      if (v.payment_method === "card") acc.card += amount;
      else acc.cash += amount;
      return acc;
    },
    { total: 0, card: 0, cash: 0, points: 0, gross: 0 },
  );
}

export function useDashboard() {
  const { visits } = useVisitStore();

  const [filterMonth, setFilterMonth] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
  });

  const today = useMemo(() => startOfToday(), []);
  const filterDate = useMemo(() => new Date(filterMonth + "-01"), [filterMonth]);
  const monthStart = useMemo(() => startOfMonth(filterDate), [filterDate]);
  const monthEnd = useMemo(() => endOfMonth(filterDate), [filterDate]);

  const monthlyVisits = useMemo(
    () =>
      visits.filter((v) =>
        isWithinInterval(parseISO(v.visited_at), {
          start: monthStart,
          end: monthEnd,
        }),
      ),
    [visits, monthStart, monthEnd],
  );

  const todayVisits = useMemo(
    () => visits.filter((v) => isSameDay(parseISO(v.visited_at), today)),
    [visits, today],
  );

  const yesterdayVisits = useMemo(() => {
    const yest = subDays(today, 1);
    return visits.filter((v) => isSameDay(parseISO(v.visited_at), yest));
  }, [visits, today]);

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
        points: mVisits.reduce((sum, v) => sum + (v.points_used || 0), 0),
        count: mVisits.length,
      };
    });
  }, [visits, today]);

  const serviceStats = useMemo(() => {
    const stats: Record<string, { value: number; count: number }> = {};
    monthlyVisits.forEach((v) => {
      if (v.services && v.services.length > 0) {
        v.services.forEach((s) => {
          if (!stats[s]) stats[s] = { value: 0, count: 0 };
          stats[s].count += 1;
          stats[s].value += v.payment_amount / v.services!.length;
        });
      } else {
        if (!stats["기타"]) stats["기타"] = { value: 0, count: 0 };
        stats["기타"].value += v.payment_amount;
        stats["기타"].count += 1;
      }
    });
    const list = Object.entries(stats)
      .map(([name, data]) => ({ name, value: data.value, count: data.count }))
      .sort((a, b) => b.value - a.value);
    const totalValue = list.reduce((sum, item) => sum + item.value, 0);
    return list.map((item) => ({
      ...item,
      percent: totalValue > 0 ? item.value / totalValue : 0,
    }));
  }, [monthlyVisits]);

  const lastMonthStats = useMemo(() => {
    const lastMonthDate = subMonths(filterDate, 1);
    const mStart = startOfMonth(lastMonthDate);
    const mEnd = endOfMonth(lastMonthDate);
    const lastMVisits = visits.filter((v) =>
      isWithinInterval(parseISO(v.visited_at), { start: mStart, end: mEnd }),
    );
    return calcStats(lastMVisits);
  }, [visits, filterDate]);

  const todayStats = calcStats(todayVisits);
  const monthlyStats = calcStats(monthlyVisits);
  const yesterdayStats = calcStats(yesterdayVisits);

  const todayGrowth =
    yesterdayStats.total === 0
      ? 100
      : ((todayStats.total - yesterdayStats.total) / yesterdayStats.total) * 100;

  const monthGrowth =
    lastMonthStats.total === 0
      ? 100
      : ((monthlyStats.total - lastMonthStats.total) / lastMonthStats.total) * 100;

  const topServices = serviceStats.slice(0, 3);

  const paymentMethodData = [
    { name: "카드", value: monthlyStats.card },
    { name: "현금/계좌", value: monthlyStats.cash },
  ];

  const handleExportExcel = () => {
    if (monthlyVisits.length === 0) return alert("다운로드할 데이터가 없습니다.");
    downloadSalesExcel(monthlyVisits, `매출내역_${filterMonth.replace("-", "")}`);
  };

  return {
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
  };
}
