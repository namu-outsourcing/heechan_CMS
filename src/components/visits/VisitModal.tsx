import React, { useState, useEffect } from "react";
import { useCustomerStore } from "../../hooks/useCustomers";
import { useServiceStore } from "../../hooks/useServices";
import { X, UserPlus } from "lucide-react";
import { ServiceCategory } from "../../types";

// VisitWithCustomer 타입 재구성 (순환 import 방지를 위해 로컬 정의)
interface VisitSaveData {
  customer_id: string;
  visited_at: string;
  payment_amount: number;
  payment_method: "card" | "cash";
  services?: string[];
  memo?: string;
}

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VisitSaveData) => Promise<boolean>;
  initialData?: (VisitSaveData & { id: string }) | null;
}

export default function VisitModal({
  isOpen,
  onClose,
  onSave,
  initialData,
}: Props) {
  const { customers, fetchCustomers } = useCustomerStore();
  const { services, fetchServices } = useServiceStore();

  const [customerId, setCustomerId] = useState(initialData?.customer_id || "");
  const [visitedAt, setVisitedAt] = useState(
    initialData?.visited_at || new Date().toISOString().split("T")[0],
  );
  const [paymentAmount, setPaymentAmount] = useState(
    initialData?.payment_amount?.toString() || "",
  );
  const [paymentMethod, setPaymentMethod] = useState<"card" | "cash">(
    initialData?.payment_method || "card",
  );
  const [selectedServices, setSelectedServices] = useState<ServiceCategory[]>(
    [],
  );
  const [memo, setMemo] = useState(initialData?.memo || "");

  // 신규 고객 등록 모드
  const [isNewCustomerMode, setIsNewCustomerMode] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isOpen) {
      if (customers.length === 0) fetchCustomers();
      fetchServices();
      setCustomerId(initialData?.customer_id || "");
      setVisitedAt(
        initialData?.visited_at || new Date().toISOString().split("T")[0],
      );
      setPaymentAmount(initialData?.payment_amount?.toString() || "");
      setPaymentMethod(initialData?.payment_method || "card");
      setSelectedServices([]);
      setMemo(initialData?.memo || "");
      setIsNewCustomerMode(false);
    }
  }, [isOpen, initialData]);

  if (!isOpen) return null;

  // 칩 토글 + 금액 자동합산
  const toggleService = (service: ServiceCategory) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      const updated = exists
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service];
      // 자동 합산 업데이트
      const total = updated.reduce((acc, s) => acc + s.price, 0);
      setPaymentAmount(total > 0 ? total.toString() : "");
      return updated;
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!paymentAmount) return alert("결제 금액을 입력해주세요.");
    setIsSubmitting(true);
    let finalCustomerId = customerId;

    if (isNewCustomerMode && !initialData) {
      if (!newCustomerName || !newCustomerPhone) {
        setIsSubmitting(false);
        return alert("신규 고객 이름과 연락처를 입력해주세요.");
      }
      const { supabase } = await import("../../lib/supabase");
      const { data, error } = await supabase
        .from("customers")
        .insert({ name: newCustomerName, phone: newCustomerPhone })
        .select()
        .single();
      if (error || !data) {
        setIsSubmitting(false);
        return alert("신규 고객 등록에 실패했습니다.");
      }
      finalCustomerId = data.id;
      fetchCustomers();
    }

    if (!finalCustomerId) {
      setIsSubmitting(false);
      return alert("고객을 선택해주세요.");
    }

    const success = await onSave({
      customer_id: finalCustomerId,
      visited_at: visitedAt,
      payment_amount: parseInt(paymentAmount),
      payment_method: paymentMethod,
      services: selectedServices.map((s) => s.name),
      memo,
    });
    setIsSubmitting(false);
    if (success) {
      fetchCustomers();
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg overflow-hidden max-h-[92vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-100 shrink-0">
          <h3 className="text-lg font-bold text-gray-800">
            {initialData ? "방문 기록 수정" : "새 방문 기록"}
          </h3>
          <button
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="overflow-y-auto flex-1 p-5 space-y-5"
        >
          {/* 고객 선택 */}
          <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
            <div className="flex justify-between items-center mb-2">
              <label className="text-sm font-medium text-gray-700">
                고객 선택 *
              </label>
              {!initialData && (
                <button
                  type="button"
                  onClick={() => setIsNewCustomerMode(!isNewCustomerMode)}
                  className="text-xs font-medium text-blue-600 flex items-center hover:text-blue-800"
                >
                  <UserPlus className="w-3 h-3 mr-1" />
                  {isNewCustomerMode ? "기존 고객 검색" : "신규 고객 등록"}
                </button>
              )}
            </div>
            {!isNewCustomerMode ? (
              <select
                title="고객명 선택"
                className="w-full p-2.5 border border-gray-300 bg-white rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={customerId}
                onChange={(e) => setCustomerId(e.target.value)}
                disabled={!!initialData}
                required={!isNewCustomerMode}
              >
                <option value="">고객을 선택하세요</option>
                {customers.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name} ({c.phone})
                  </option>
                ))}
              </select>
            ) : (
              <div className="space-y-2 pt-2 border-t border-gray-200 mt-2">
                <div className="grid grid-cols-2 gap-2">
                  <input
                    type="text"
                    placeholder="이름"
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={newCustomerName}
                    onChange={(e) => setNewCustomerName(e.target.value)}
                    required={isNewCustomerMode}
                  />
                  <input
                    type="tel"
                    placeholder="연락처"
                    className="w-full p-2 border border-gray-300 rounded-lg outline-none focus:ring-2 focus:ring-blue-500"
                    value={newCustomerPhone}
                    onChange={(e) => setNewCustomerPhone(e.target.value)}
                    required={isNewCustomerMode}
                  />
                </div>
              </div>
            )}
          </div>

          {/* 시술 선택 칩 */}
          {services.length > 0 && (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                시술 선택 (복수 선택 가능)
              </label>
              <div className="flex flex-wrap gap-2">
                {services.map((s) => {
                  const isSelected = selectedServices.some(
                    (sel) => sel.id === s.id,
                  );
                  return (
                    <button
                      type="button"
                      key={s.id}
                      onClick={() => toggleService(s)}
                      className={`inline-flex items-center px-3.5 py-1.5 rounded-full text-sm font-medium border transition-all
                        ${
                          isSelected
                            ? "bg-blue-600 text-white border-blue-600 shadow-sm shadow-blue-200"
                            : "bg-white text-gray-600 border-gray-300 hover:border-blue-400 hover:text-blue-600"
                        }`}
                    >
                      {s.name}
                      <span
                        className={`ml-1.5 text-xs ${isSelected ? "text-blue-100" : "text-gray-400"}`}
                      >
                        {s.price.toLocaleString()}원
                      </span>
                    </button>
                  );
                })}
              </div>
              {selectedServices.length > 0 && (
                <p className="mt-2 text-xs text-blue-600 font-medium">
                  선택 합계:{" "}
                  {selectedServices
                    .reduce((acc, s) => acc + s.price, 0)
                    .toLocaleString()}
                  원 (금액은 아래에서 수정 가능)
                </p>
              )}
            </div>
          )}

          {/* 날짜 + 결제 금액 */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                방문 날짜 *
              </label>
              <input
                type="date"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                value={visitedAt}
                onChange={(e) => setVisitedAt(e.target.value)}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                결제 금액 (원) *
              </label>
              <input
                type="number"
                className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none"
                placeholder="직접 입력 또는 자동 합산"
                value={paymentAmount}
                onChange={(e) => setPaymentAmount(e.target.value)}
                required
              />
            </div>
          </div>

          {/* 결제 수단 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              결제 수단 *
            </label>
            <div className="flex space-x-3">
              <label
                className={`flex-1 py-2 border rounded-lg text-center cursor-pointer transition-colors ${paymentMethod === "card" ? "bg-blue-50 border-blue-500 text-blue-700 font-medium" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  value="card"
                  checked={paymentMethod === "card"}
                  onChange={() => setPaymentMethod("card")}
                  className="sr-only"
                />
                💳 카드
              </label>
              <label
                className={`flex-1 py-2 border rounded-lg text-center cursor-pointer transition-colors ${paymentMethod === "cash" ? "bg-emerald-50 border-emerald-500 text-emerald-700 font-medium" : "border-gray-200 text-gray-600 hover:bg-gray-50"}`}
              >
                <input
                  type="radio"
                  value="cash"
                  checked={paymentMethod === "cash"}
                  onChange={() => setPaymentMethod("cash")}
                  className="sr-only"
                />
                💵 현금 / 계좌
              </label>
            </div>
          </div>

          {/* 메모 */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              메모 (선택)
            </label>
            <textarea
              className="w-full p-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 outline-none resize-none"
              placeholder="시술 특이사항, 추가 요청 사항 등"
              rows={2}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </form>

        {/* 하단 버튼 */}
        <div className="flex space-x-3 p-4 border-t border-gray-100 shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-2.5 border border-gray-300 text-gray-700 font-medium rounded-lg hover:bg-gray-50 transition-colors"
          >
            취소
          </button>
          <button
            form=""
            type="submit"
            disabled={isSubmitting}
            onClick={handleSubmit}
            className="flex-1 py-2.5 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? "저장 중..." : "기록 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
