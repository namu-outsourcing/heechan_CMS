import React, { useState } from "react";
import { CustomerWithLastVisit } from "../../types";
import { X } from "lucide-react";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (
    data: Omit<
      CustomerWithLastVisit,
      "id" | "created_at" | "visits" | "last_visited_at"
    >,
  ) => Promise<boolean>;
  initialData?: CustomerWithLastVisit | null;
}

export default function CustomerModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: Props) {
  const [name, setName] = useState(initialData?.name || "");
  const [phone, setPhone] = useState(initialData?.phone || "");
  const [memo, setMemo] = useState(initialData?.memo || "");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // 모달 열릴때 초기화 (여기선 생략하고, 렌더링 키 리셋 방식 권장)
  React.useEffect(() => {
    if (isOpen) {
      setName(initialData?.name || "");
      setPhone(initialData?.phone || "");
      setMemo(initialData?.memo || "");
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim())
      return alert("이름과 연락처를 입력해주세요.");

    setIsSubmitting(true);
    const success = await onSave({ name, phone, memo });
    setIsSubmitting(false);

    if (success) onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b border-gray-100">
          <h3 className="text-lg font-bold text-gray-800">
            {initialData ? "고객 정보 수정" : "새 고객 등록"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              성함 *
            </label>
            <input
              type="text"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="예: 홍길동"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              연락처 *
            </label>
            <input
              type="tel"
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 outline-none transition-colors"
              placeholder="예: 010-1234-5678"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              고객 메모 (선택)
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="알레르기, 선호 스타일 등 고객 특이사항 메모"
              rows={3}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>

          <div className="pt-4 flex space-x-3">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2 px-4 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              취소
            </button>
            <button
              type="submit"
              className="flex-1 py-2 px-4 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              disabled={isSubmitting}
            >
              {isSubmitting ? "저장 중..." : "저장"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
