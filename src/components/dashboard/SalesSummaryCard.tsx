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
}

export default function SalesSummaryCard({
  title,
  total,
  cardAmount,
  cashAmount,
  icon,
  change,
  trend = "neutral",
}: Props) {
  const isUp = trend === "up";
  const isDown = trend === "down";

  return (
    <div className="bg-white/80 backdrop-blur-md rounded-2xl shadow-sm border border-gray-100 p-6 flex flex-col h-full hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-4">
        <div className="p-2.5 bg-gray-50 text-gray-500 rounded-xl">{icon}</div>
        {change !== undefined && (
          <div
            className={`flex items-center space-x-1 px-2 py-1 rounded-full text-xs font-bold ${
              isUp
                ? "bg-emerald-50 text-emerald-600"
                : isDown
                ? "bg-rose-50 text-rose-600"
                : "bg-gray-50 text-gray-500"
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
        <h3 className="text-sm font-semibold text-gray-400 uppercase tracking-wider">
          {title}
        </h3>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-extrabold text-gray-900 tracking-tight">
          {formatCurrency(total)}
        </div>
      </div>

      <div className="mt-auto space-y-2.5 pt-4 border-t border-gray-50">
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400 flex items-center font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500 mr-2"></span>
            카드 결제
          </span>
          <span className="font-bold text-gray-700">
            {formatCurrency(cardAmount)}
          </span>
        </div>
        <div className="flex justify-between items-center text-xs">
          <span className="text-gray-400 flex items-center font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-2"></span>
            현금 / 계좌
          </span>
          <span className="font-bold text-gray-700">
            {formatCurrency(cashAmount)}
          </span>
        </div>
      </div>
    </div>
  );
}
