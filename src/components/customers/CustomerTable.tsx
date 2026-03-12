import { CustomerWithLastVisit } from "../../types";
import { format } from "date-fns";
import { Edit2, Trash2 } from "lucide-react";

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
      <div className="text-center py-12 text-gray-500 border border-gray-200 border-dashed rounded-lg bg-gray-50/50">
        등록된 고객이 없습니다. 첫 고객을 등록해보세요.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto border border-gray-200 rounded-lg">
      <table className="min-w-full divide-y divide-gray-200 text-sm text-left">
        <thead className="bg-gray-50 text-gray-600 font-medium">
          <tr>
            <th className="px-4 py-3">고객 정보</th>
            <th className="px-4 py-3">메모</th>
            <th className="px-4 py-3">최근 방문일</th>
            <th className="px-4 py-3 text-right">관리</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-200 bg-white">
          {customers.map((c) => (
            <tr
              key={c.id}
              className="hover:bg-blue-50/40 transition-colors cursor-pointer group/row"
              onClick={() => onCustomerClick(c)}
            >
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 group-hover/row:text-blue-600 transition-colors">
                  {c.name}
                </div>
                <div className="text-xs text-gray-500">{c.phone}</div>
              </td>
              <td className="px-4 py-3">
                {c.memo ? (
                  <div
                    className="text-sm text-gray-600 truncate max-w-[300px]"
                    title={c.memo}
                  >
                    {c.memo}
                  </div>
                ) : (
                  <span className="text-gray-300">-</span>
                )}
              </td>
              <td className="px-4 py-3 text-gray-500">
                {c.last_visited_at
                  ? format(new Date(c.last_visited_at), "yyyy.MM.dd")
                  : "기록 없음"}
              </td>
              <td
                className="px-4 py-3 border-t-0 text-right whitespace-nowrap"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={() => onEdit(c)}
                  className="p-1.5 text-gray-400 hover:text-blue-600 transition-colors mr-2 rounded-md hover:bg-blue-50"
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
                  className="p-1.5 text-gray-400 hover:text-red-600 transition-colors rounded-md hover:bg-red-50"
                  aria-label="삭제"
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
