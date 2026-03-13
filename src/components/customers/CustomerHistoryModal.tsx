import React from "react";
import { X, Calendar, ClipboardList } from "lucide-react";
import { CustomerWithLastVisit } from "../../types";
import { formatFullDate, formatCurrency } from "../../utils/format";
import { useVisitStore } from "../../hooks/useVisits";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  customer: CustomerWithLastVisit | null;
}

export default function CustomerHistoryModal({
  isOpen,
  onClose,
  customer,
}: Props) {
  const { visits } = useVisitStore();

  // 해당 고객의 내역만 필터링하여 최신순 정렬
  const customerVisits = React.useMemo(() => {
    if (!customer) return [];
    return visits
      .filter((v) => v.customer_id === customer.id)
      .sort(
        (a, b) =>
          new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
      );
  }, [customer, visits]);

  if (!isOpen || !customer) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 transition-all">
      <div className="bg-white dark:bg-slate-900 rounded-2xl shadow-2xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh] border border-gray-100 dark:border-slate-800 transition-colors">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-6 border-b border-gray-100 dark:border-slate-800 shrink-0 bg-gray-50/50 dark:bg-slate-800/40 transition-colors">
          <div>
            <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">
              <span className="text-blue-600 dark:text-blue-400">{customer.name}</span> 고객님 방문
              히스토리
            </h3>
            <p className="text-sm text-gray-500 dark:text-slate-400 mt-0.5">{customer.phone}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 dark:hover:text-slate-200 rounded-full hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-gray-200 dark:scrollbar-thumb-slate-800">
          {customerVisits.length > 0 ? (
            <div className="space-y-8 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-200 dark:before:from-blue-900/50 before:to-gray-100 dark:before:to-slate-800">
              {customerVisits.map((v) => (
                <div key={v.id} className="relative flex items-start group">
                  {/* 타임라인 불렛 */}
                  <div className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-white dark:bg-slate-900 border-2 border-blue-500 z-10 shadow-sm group-hover:scale-110 transition-transform">
                    <Calendar className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                  </div>

                  <div className="ml-14 flex-1 bg-white dark:bg-slate-800/50 border border-gray-100 dark:border-slate-800 rounded-2xl p-5 shadow-sm group-hover:border-blue-200 dark:group-hover:border-blue-900 transition-all">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-4">
                      <span className="text-lg font-black text-gray-800 dark:text-slate-100">
                        {formatFullDate(v.visited_at)}
                      </span>
                      <span
                        className={`px-3 py-1 text-xs font-bold rounded-lg ${v.payment_method === "card" ? "bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400" : "bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400"}`}
                      >
                        {v.payment_method === "card" ? "💳 카드" : "💵 현금"} ·{" "}
                        {formatCurrency(v.payment_amount)}
                      </span>
                    </div>

                    {/* 시술 칩 */}
                    <div className="flex flex-wrap gap-2 mb-4">
                      {v.services && v.services.length > 0 ? (
                        v.services.map((s, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 text-[11px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-md border border-blue-100 dark:border-blue-900/30"
                          >
                            {s}
                          </span>
                        ))
                      ) : (
                        <span className="text-xs text-gray-400 italic">
                          기록된 시술 정보 없음
                        </span>
                      )}
                    </div>

                    {/* 포인트 내역 */}
                    <div className="flex gap-2 mb-4 text-[10px] font-black uppercase tracking-tight">
                      {(v.points_earned ?? 0) > 0 && (
                        <span className="px-2 py-0.5 bg-blue-50 dark:bg-blue-500/10 text-blue-600 dark:text-blue-400 rounded border border-blue-100 dark:border-blue-500/20">
                          💰 +{(v.points_earned ?? 0).toLocaleString()}P 적립
                        </span>
                      )}
                      {(v.points_used ?? 0) > 0 && (
                        <span className="px-2 py-0.5 bg-red-50 dark:bg-rose-500/10 text-red-600 dark:text-rose-400 rounded border border-red-100 dark:border-rose-500/20">
                          🎫 -{(v.points_used ?? 0).toLocaleString()}P 사용
                        </span>
                      )}
                    </div>

                    {/* 메모 */}
                    {v.memo && (
                      <div className="bg-gray-50 dark:bg-slate-900/50 rounded-xl p-4 text-sm text-gray-600 dark:text-slate-400 flex items-start gap-3 border border-gray-100 dark:border-slate-800">
                        <ClipboardList className="w-4 h-4 text-gray-400 dark:text-slate-600 mt-0.5 shrink-0" />
                        <span className="leading-relaxed whitespace-pre-wrap">
                          {v.memo}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-gray-50 dark:bg-slate-800/50 text-gray-300 dark:text-slate-700 mb-4 transition-colors">
                <ClipboardList className="w-10 h-10" />
              </div>
              <p className="text-gray-500 dark:text-slate-500 font-bold transition-colors">
                아직 방문 기록이 없습니다.
              </p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-5 border-t border-gray-100 dark:border-slate-800 bg-gray-50/50 dark:bg-slate-800/40 flex justify-end shrink-0 transition-colors">
          <button
            onClick={onClose}
            className="px-8 py-2.5 bg-white dark:bg-slate-800 border border-gray-300 dark:border-slate-700 text-gray-700 dark:text-slate-300 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-700 transition-all shadow-sm active:scale-95"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
