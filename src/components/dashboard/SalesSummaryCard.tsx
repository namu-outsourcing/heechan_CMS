interface Props {
  title: string;
  total: number;
  cardAmount: number;
  cashAmount: number;
  icon: React.ReactNode;
}

export default function SalesSummaryCard({
  title,
  total,
  cardAmount,
  cashAmount,
  icon,
}: Props) {
  return (
    <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 flex flex-col h-full">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-gray-500 font-medium">{title}</h3>
        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">{icon}</div>
      </div>

      <div className="mb-6">
        <div className="text-3xl font-bold text-gray-900">
          {total.toLocaleString()}
          <span className="text-lg font-normal text-gray-500 ml-1">원</span>
        </div>
      </div>

      <div className="mt-auto space-y-3 pt-4 border-t border-gray-50">
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 flex items-center">
            <span className="w-2 h-2 rounded-full bg-blue-500 mr-2"></span>
            카드 결제
          </span>
          <span className="font-medium text-gray-900">
            {cardAmount.toLocaleString()}원
          </span>
        </div>
        <div className="flex justify-between items-center text-sm">
          <span className="text-gray-500 flex items-center">
            <span className="w-2 h-2 rounded-full bg-emerald-500 mr-2"></span>
            현금 / 계좌
          </span>
          <span className="font-medium text-gray-900">
            {cashAmount.toLocaleString()}원
          </span>
        </div>
      </div>
    </div>
  );
}
