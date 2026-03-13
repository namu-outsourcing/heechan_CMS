import { CustomerWithLastVisit } from "../../types";
import { Edit2, Trash2 } from "lucide-react";
import { formatDate, formatPhone } from "../../utils/format";

interface Props {
  customers: CustomerWithLastVisit[];
  onEdit: (customer: CustomerWithLastVisit) => void;
  onDelete: (id: string) => void;
  onCustomerClick: (customer: CustomerWithLastVisit) => void;
}

export default function CustomerTable({
  customers,
  onEdit,
  onDelete,
  onCustomerClick,
}: Props) {
  if (customers.length === 0) {
    return (
      <div className="text-center py-12 text-gray-500 dark:text-slate-500 border border-gray-200 dark:border-slate-800 border-dashed rounded-lg bg-gray-50/50 dark:bg-slate-900/50">
        등록된 고객이 없습니다. 첫 고객을 등록해보세요.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 dark:border-slate-800 rounded-lg transition-colors">
      <table className="min-w-full divide-y divide-gray-200 dark:divide-slate-800 text-sm text-left">
        <thead className="bg-gray-50 dark:bg-slate-900/80 text-gray-600 dark:text-slate-400 font-medium">
          <tr>
            <th className="px-4 py-3">고객 정보</th>
            <th className="px-4 py-3">메모</th>
            <th className="px-4 py-3">최근 방문일</th>
            <th className="px-4 py-3">보유 포인트</th>
            <th className="px-4 py-3 text-right">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 dark:divide-slate-800 bg-white dark:bg-slate-900 transition-colors">
          {customers.map((c) => (
            <tr
              key={c.id}
              className="hover:bg-blue-50/40 dark:hover:bg-blue-900/10 transition-colors cursor-pointer group/row"
              onClick={() => onCustomerClick(c)}
            >
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 dark:text-slate-100 group-hover/row:text-blue-600 dark:group-hover/row:text-blue-400 transition-colors">
                  {c.name}
                </div>
                <div className="text-xs text-gray-400 dark:text-slate-500 font-medium">{formatPhone(c.phone)}</div>
              </td>
              <td className="px-4 py-3">
                {c.memo ? (
                  <div
                    className="text-sm text-gray-600 dark:text-slate-400 truncate max-w-[300px]"
                    title={c.memo}
                  >
                    {c.memo}
                  </div>
                ) : (
                  <span className="text-gray-300 dark:text-slate-700">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500 dark:text-slate-400">
                {c.last_visited_at
                   ? formatDate(c.last_visited_at)
                  : "기록 없음"}
              </td>
              <td className="px-4 py-3">
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-bold bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30 transition-colors">
                  {(c.total_points || 0).toLocaleString()}P
                </span>
              </td>
              <td
                className="px-4 py-3 border-t-0 text-right whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="flex justify-end gap-1">
                  <button
                    onClick={() => onEdit(c)}
                    className="p-1.5 text-gray-400 dark:text-slate-500 hover:text-blue-600 dark:hover:text-blue-400 transition-all rounded-md hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    aria-label="수정"
                  >
                    <Edit2 className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => {
                      if (
                        window.confirm(
                          "정말 삭제하시겠습니까? 관련 방문 기록도 모두 삭제됩니다.",
                        )
                      ) {
                        onDelete(c.id);
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
