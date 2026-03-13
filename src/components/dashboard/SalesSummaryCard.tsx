import { TrendingUp, TrendingDown, Minus } from "lucide-react";
import { formatCurrency } from "../../utils/format";

interface Props {
  title: string;
  total: number;
  cardAmount: number;
  cashAmount: number;
  icon: React.ReactNode;
  change?: number; // 전일/전월 대비 증감율 (%)
  trend?: "up" | "down" | "neutral";
  cardLabel?: string;
  cashLabel?: string;
  pointAmount?: number;
  pointLabel?: string;
}

export default function SalesSummaryCard({
  title,
  total,
  cardAmount,
  cashAmount,
  icon,
  change,
  trend = "neutral",
  cardLabel = "카드 결제",
  cashLabel = "현금 / 계좌",
  pointAmount,
  pointLabel = "포인트 차감",
}: Props) {
  const isUp = trend === "up";
  const isDown = trend === "down";

  return (
    <div className="bg-white/80 dark:bg-slate-900/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 dark:border-slate-800 p-6 flex flex-col h-full hover:shadow-md transition-all duration-300">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400 rounded-xl transition-colors">{icon}</div>
        {change !== undefined && (
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold transition-colors ${
              isUp
                ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-600 dark:text-emerald-400"
                : isDown
                ? "bg-rose-50 dark:bg-rose-500/10 text-rose-600 dark:text-rose-400"
                : "bg-gray-50 dark:bg-slate-800 text-gray-500 dark:text-slate-400"
            }`}
          >
            {isUp && <TrendingUp className="w-3 h-3" />}
            {isDown && <TrendingDown className="w-3 h-3" />}
            {!isUp && !isDown && <Minus className="w-3 h-3" />}
            <span>{Math.abs(change).toFixed(1)}%</span>
            <span className="font-medium text-[10px] opacity-70 ml-0.5">
              {isUp ? "↑" : isDown ? "↓" : "-"}
            </span>
          </div>
        )}
      </div>

      <div className="mb-1">
        <h3 className="text-sm font-semibold text-gray-400 dark:text-slate-500 uppercase tracking-wider">
          {title}
        </h3>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-extrabold text-gray-900 dark:text-white tracking-tight">
          {formatCurrency(total)}
        </div>
      </div>

      <div className="mt-auto space-y-2.5 pt-4 border-t border-gray-50 dark:border-slate-800 transition-colors">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400 dark:text-slate-500 flex items-center font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
            {cardLabel}
          </span>
          <span className="font-bold text-gray-700 dark:text-slate-300">
            {formatCurrency(cardAmount)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400 dark:text-slate-500 flex items-center font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
            {cashLabel}
          </span>
          <span className="font-bold text-gray-700 dark:text-slate-300">
            {formatCurrency(cashAmount)}
          </span>
        </div>
        {pointAmount !== undefined && pointAmount > 0 && (
          <div className="flex justify-between items-center text-xs border-t border-gray-50/50 dark:border-slate-800/50 pt-2.5 mt-2.5">
            <span className="text-gray-400 dark:text-slate-500 flex items-center font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-rose-400 mr-2"></span>
              {pointLabel}
            </span>
            <span className="font-bold text-rose-500 dark:text-rose-400">
              -{formatCurrency(pointAmount)}
            </span>
          </div>
        )}
      </div>
    </div>
  );
}
