import React from "react";
import { X, Calendar, ClipboardList } from "lucide-react";
import { format } from "date-fns";
import { CustomerWithLastVisit } from "../../types";
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
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-2xl overflow-hidden flex flex-col max-h-[85vh]">
        {/* 헤더 */}
        <div className="flex justify-between items-center p-5 border-b border-gray-100 shrink-0 bg-gray-50/50">
          <div>
            <h3 className="text-xl font-bold text-gray-900">
              <span className="text-blue-600">{customer.name}</span> 고객님 방문
              히스토리
            </h3>
            <p className="text-sm text-gray-500 mt-0.5">{customer.phone}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* 본문 */}
        <div className="flex-1 overflow-y-auto p-6">
          {customerVisits.length > 0 ? (
            <div className="space-y-6 relative before:absolute before:inset-0 before:ml-5 before:-translate-x-px before:h-full before:w-0.5 before:bg-gradient-to-b before:from-blue-200 before:to-gray-100">
              {customerVisits.map((v) => (
                <div key={v.id} className="relative flex items-start group">
                  {/* 타임라인 불렛 */}
                  <div className="absolute left-0 w-10 h-10 flex items-center justify-center rounded-full bg-white border-2 border-blue-500 z-10 shadow-sm group-hover:scale-110 transition-transform">
                    <Calendar className="w-4 h-4 text-blue-600" />
                  </div>

                  <div className="ml-14 flex-1 bg-white border border-gray-100 rounded-xl p-4 shadow-sm group-hover:border-blue-200 transition-colors">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 mb-3">
                      <span className="text-lg font-bold text-gray-800">
                        {format(new Date(v.visited_at), "yyyy년 MM월 dd일")}
                      </span>
                      <span
                        className={`px-2 py-1 text-xs font-semibold rounded-md ${v.payment_method === "card" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}
                      >
                        {v.payment_method === "card" ? "💳 카드" : "💵 현금"} ·{" "}
                        {v.payment_amount.toLocaleString()}원
                      </span>
                    </div>

                    {/* 시술 칩 */}
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {v.services && v.services.length > 0 ? (
                        v.services.map((s, i) => (
                          <span
                            key={i}
                            className="px-2 py-1 text-xs font-medium bg-blue-50 text-blue-600 rounded-md border border-blue-100"
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

                    {/* 메모 */}
                    {v.memo && (
                      <div className="bg-gray-50 rounded-lg p-3 text-sm text-gray-600 flex items-start gap-2 border border-gray-100">
                        <ClipboardList className="w-4 h-4 text-gray-400 mt-0.5 shrink-0" />
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
            <div className="text-center py-12">
              <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-gray-50 text-gray-300 mb-4">
                <ClipboardList className="w-8 h-8" />
              </div>
              <p className="text-gray-500 font-medium">
                아직 방문 기록이 없습니다.
              </p>
            </div>
          )}
        </div>

        {/* 푸터 */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50 flex justify-end shrink-0">
          <button
            onClick={onClose}
            className="px-6 py-2 bg-white border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors shadow-sm"
          >
            닫기
          </button>
        </div>
      </div>
    </div>
  );
}
