import { VisitWithCustomer } from "../../hooks/useVisits";
import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";

interface Props {
  visits: VisitWithCustomer[];
  onEdit: (visit: VisitWithCustomer) => void;
  onDelete: (id: string) => void;
}

export default function VisitTable({ visits, onEdit, onDelete }: Props) {
  if (visits.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 border border-gray-200 border-dashed rounded-lg bg-gray-50/50">
        등록된 방문 기록이 없습니다.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
        <thead className="bg-gray-50 text-gray-600 font-medium">
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
        <tbody className="divide-y divide-gray-200 bg-white">
          {visits.map((v) => (
            <tr key={v.id} className="hover:bg-gray-50/50 transition-colors">
              <td className="px-4 py-3 text-gray-900 font-medium pb-2">
                {format(new Date(v.visited_at), "yyyy.MM.dd")}
              </td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900">
                  {v.customers.name}
                </div>
                <div className="text-xs text-gray-500">{v.customers.phone}</div>
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-wrap gap-1">
                  {v.services && v.services.length > 0 ? (
                    v.services.map((s, idx) => (
                      <span
                        key={idx}
                        className="inline-flex px-1.5 py-0.5 text-[10px] font-medium bg-gray-100 text-gray-600 rounded"
                      >
                        {s}
                      </span>
                    ))
                  ) : (
                    <span className="text-gray-400">-</span>
                  )}
                </div>
                {v.memo && (
                  <div
                    className="text-[11px] text-gray-400 mt-1 truncate max-w-[150px]"
                    title={v.memo}
                  >
                    📝 {v.memo}
                  </div>
                )}
              </td>
              <td className="px-4 py-3">
                <span
                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-md ${v.payment_method === "card" ? "bg-blue-50 text-blue-700" : "bg-emerald-50 text-emerald-700"}`}
                >
                  {v.payment_method === "card" ? "카드" : "현금"}
                </span>
              </td>
              <td className="px-4 py-3 text-gray-900 font-medium">
                {v.payment_amount.toLocaleString()}원
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col items-center gap-1">
                  {(v.points_earned ?? 0) > 0 && (
                    <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold bg-blue-50 text-blue-600 rounded border border-blue-100 whitespace-nowrap">
                      +{(v.points_earned ?? 0).toLocaleString()}P
                    </span>
                  )}
                  {(v.points_used ?? 0) > 0 && (
                    <span className="inline-flex px-1.5 py-0.5 text-[10px] font-bold bg-red-50 text-red-600 rounded border border-red-100 whitespace-nowrap">
                      -{(v.points_used ?? 0).toLocaleString()}P
                    </span>
                  )}
                  {(!v.points_earned && !v.points_used) && <span className="text-gray-300 text-[10px]">-</span>}
                </div>
              </td>
              <td className="px-4 py-3 border-t-0 text-right whitespace-nowrap">
                <button
                  onClick={() => onEdit(v)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors mr-2 rounded-md hover:bg-blue-50"
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
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
