import { VisitWithCustomer } from "../../hooks/useVisits";
import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";

interface Props {
  visits: VisitWithCustomer[];
  onEdit: (visit: VisitWithCustomer) => void;
  onDelete: (id: string) => void;
}

export default function VisitTable({ visits, onEdit, onDelete }: Props) {
  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-lg transition-colors">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 text-sm text-left">
        <thead className="bg-gray-50 dark:bg-slate-900/80 text-gray-600 dark:text-slate-400 font-medium">
          <tr>
            <th className="px-4 py-3">방문일</th>
            <th className="px-4 py-3">고객명</th>
            <th className="px-4 py-3">시술 내용</th>
            <th className="px-4 py-3">결제 수단</th>
            <th className="px-4 py-3">결제 금액</th>
            <th className="px-4 py-3 text-center">포인트</th>
            <th className="px-4 py-3 text-right">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
          {visits.map((v) => (
            <tr key={v.id} className="hover:bg-gray-50/50 dark:hover:bg-slate-800/40 transition-colors">
              <td className="px-4 py-3 text-gray-900 dark:text-slate-300 font-medium pb-2">
                {format(new Date(v.visited_at), "yyyy.MM.dd")}
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 dark:text-slate-100">
                  {v.customers.name}
                </div>
                <div className="text-xs text-gray-500 dark:text-slate-500">{v.customers.phone}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {v.services && v.services.length > 0 ? (
                    v.services.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-400 rounded transition-colors"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400 dark:text-slate-600">-</span>
                  )}
                </div>
                {v.memo && (
                  <div
                    className="text-[11px] text-gray-400 dark:text-slate-500 mt-1 truncate max-w-[150px]"
                    title={v.memo}
                  >
                    📝 {v.memo}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-bold rounded-md transition-colors ${
                    v.payment_method === "card" 
                      ? "bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400" 
                      : "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-400"
                  }`}
                >
                  {v.payment_method === "card" ? "카드" : "현금"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-900 dark:text-slate-100 font-medium">
                {v.payment_amount.toLocaleString()}원
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col items-center gap-1">
                  {(v.points_earned ?? 0) > 0 && (
                    <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded border border-blue-100 dark:border-blue-900/30 whitespace-nowrap transition-colors">
                      +{(v.points_earned ?? 0).toLocaleString()}P
                    </span>
                  )}
                  {(v.points_used ?? 0) > 0 && (
                    <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold bg-red-50 dark:bg-rose-900/20 text-red-600 dark:text-rose-400 rounded border border-red-100 dark:border-rose-900/30 whitespace-nowrap transition-colors">
                      -{(v.points_used ?? 0).toLocaleString()}P
                    </span>
                  )}
                  {(!v.points_earned && !v.points_used) && <span className="text-gray-300 dark:text-slate-700 text-[10px]">-</span>}
                </div>
              </td>
              <td className="px-4 py-3 border-t-0 text-right whitespace-nowrap">
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onEdit(v)}
                    className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    aria-label="수정"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm("정말 이 방문 기록을 삭제하시겠습니까?")
                      ) {
                        onDelete(v.id);
                      }
                    }}
                    className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-red-600 dark:hover:text-red-400 transition-all rounded-md hover:bg-red-50 dark:hover:bg-red-900/20"
                    aria-label="삭제"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
