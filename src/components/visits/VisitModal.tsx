import React, { useState, useEffect, useMemo, useRef } from "react";
import { useCustomerStore } from "../../hooks/useCustomers";
import { useServiceStore } from "../../hooks/useServices";
import { X, UserPlus, Search, Check, Calculator } from "lucide-react";
import { ServiceCategory } from "../../types";
import { formatCurrency } from "../../utils/format";

interface VisitSaveData {
  customer_id: string;
  visited_at: string;
  payment_amount: number;
  payment_method: "card" | "cash";
  services?: string[];
  memo?: string;
  points_earned?: number;
  points_used?: number;
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
  const [pointsEarned, setPointsEarned] = useState(initialData?.points_earned?.toString() || "0");
  const [pointsUsed, setPointsUsed] = useState(initialData?.points_used?.toString() || "0");
  const [serviceTotal, setServiceTotal] = useState(initialData ? (initialData.payment_amount + (initialData.points_used || 0)).toString() : "0");

  const [isNewCustomerMode, setIsNewCustomerMode] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };
    if (isDropdownOpen) {
      document.addEventListener("mousedown", handleClickOutside);
    }
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, [isDropdownOpen]);

  const selectedCustomer = useMemo(() => 
    customers.find(c => c.id === customerId),
    [customers, customerId]
  );

  const searchedCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers.slice(0, 10);
    const lowerQuery = searchQuery.toLowerCase().replace(/-/g, "");
    return customers.filter(c => 
      c.name.toLowerCase().includes(lowerQuery) || 
      (c.phone || "").replace(/-/g, "").includes(lowerQuery)
    ).slice(0, 15);
  }, [customers, searchQuery]);

  useEffect(() => {
    if (isOpen) {
      if (customers.length === 0) fetchCustomers();
      fetchServices();
      setCustomerId(initialData?.customer_id || "");
      setSearchQuery("");
      setVisitedAt(initialData?.visited_at || new Date().toISOString().split("T")[0]);
      setPaymentAmount(initialData?.payment_amount?.toString() || "");
      setPaymentMethod(initialData?.payment_method || "card");
      setSelectedServices([]);
      setMemo(initialData?.memo || "");
      setPointsEarned(initialData?.points_earned?.toString() || "0");
      setPointsUsed(initialData?.points_used?.toString() || "0");
      setServiceTotal(initialData?.payment_amount ? (initialData.payment_amount + (initialData.points_used || 0)).toString() : "0");
      setIsNewCustomerMode(false);
    }
  }, [isOpen, initialData]);

  // 시술 금액 - 포인트 사용 = 실 결제 금액 자동 계산 (의존성: serviceTotal, pointsUsed)
  useEffect(() => {
    const total = parseInt(serviceTotal) || 0;
    const used = parseInt(pointsUsed) || 0;
    // 포인트 사용 금액이 변경되었거나, 정가가 변경되었을 때만 강제 업데이트
    setPaymentAmount((total - used).toString());
  }, [serviceTotal, pointsUsed]);

  // 시술 선택 제어 + 금액 자동 반영
  const toggleService = (service: ServiceCategory) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      const updated = exists ? prev.filter((s) => s.id !== service.id) : [...prev, service];
      
      // 자동 금액 업데이트 (사용자가 수동으로 고치기 전까지는 선택항목을 따름)
      const total = updated.reduce((acc, s) => acc + s.price, 0);
      setServiceTotal(total > 0 ? total.toString() : "");
      
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
      points_earned: parseInt(pointsEarned) || 0,
      points_used: parseInt(pointsUsed) || 0,
    });
    setIsSubmitting(false);
    if (success) {
      fetchCustomers();
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all border border-gray-100 dark:border-slate-800">
        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between shrink-0 transition-colors">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-xl transition-colors">
              <UserPlus className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-slate-100">
                {initialData ? "방문 기록 수정" : "방문 기록 추가"}
              </h3>
              <p className="text-xs text-gray-400 dark:text-slate-500 mt-0.5 font-medium">서비스 내역과 결제 정보를 기록합니다.</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 dark:text-slate-500 hover:text-gray-600 dark:hover:text-slate-300 hover:bg-gray-100 dark:hover:bg-slate-800 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-7 overflow-y-auto custom-scrollbar transition-colors">
          {/* 고객 선택 섹션 */}
          <div className="bg-gray-50 dark:bg-slate-800/40 p-4 rounded-2xl border border-gray-100 dark:border-slate-800 transition-colors">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-700 dark:text-slate-300 tracking-tight">고객 정보 *</label>
              {!initialData && (
                <button
                  type="button"
                  onClick={() => setIsNewCustomerMode(!isNewCustomerMode)}
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded transition-all ${
                    isNewCustomerMode 
                      ? "bg-blue-600 dark:bg-blue-500 text-white" 
                      : "bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50"
                  }`}
                >
                  {isNewCustomerMode ? "기존 고객 찾기" : "신규 고객으로 등록"}
                </button>
              )}
            </div>

            {!isNewCustomerMode ? (
              <div className="relative">
                {selectedCustomer && !isDropdownOpen ? (
                  <div className="flex items-center justify-between p-3 bg-white dark:bg-slate-800 border border-blue-100 dark:border-blue-900/30 rounded-xl shadow-sm transition-colors">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 dark:bg-blue-500 flex items-center justify-center text-white font-black mr-3 shadow-inner">
                        {selectedCustomer.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900 dark:text-slate-100">{selectedCustomer.name}</div>
                        <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">{selectedCustomer.phone || "연락처 없음"}</div>
                      </div>
                    </div>
                    {!initialData && (
                      <button
                        type="button"
                        onClick={() => {
                          setCustomerId("");
                          setSearchQuery("");
                          setIsDropdownOpen(true);
                        }}
                        className="text-xs text-blue-500 dark:text-blue-400 font-bold hover:underline"
                      >
                        변경
                      </button>
                    )}
                  </div>
                ) : (
                  <div ref={searchContainerRef} className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-slate-500" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium shadow-sm text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600"
                      placeholder="고객 이름 또는 연락처 검색..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                    />
                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95 transition-colors">
                        {searchedCustomers.length > 0 ? (
                          <div className="max-h-56 overflow-y-auto">
                            {searchedCustomers.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 dark:hover:bg-blue-900/20 flex items-center justify-between group transition-colors border-b border-gray-50 dark:border-slate-700 last:border-0"
                                onClick={() => {
                                  setCustomerId(c.id);
                                  setIsDropdownOpen(false);
                                  setSearchQuery("");
                                }}
                              >
                                <div>
                                  <div className="text-sm font-bold text-gray-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400">{c.name}</div>
                                  <div className="text-[10px] text-gray-400 dark:text-slate-500 font-medium">{c.phone}</div>
                                </div>
                                {customerId === c.id && <Check className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-6 text-center text-xs text-gray-400 dark:text-slate-500 font-medium">검색 결과가 없습니다.</div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-3 mt-2 animate-in fade-in slide-in-from-top-2">
                <input
                  type="text"
                  placeholder="고객 이름"
                  className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 dark:text-slate-100 transition-colors"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="연락처"
                  className="px-3 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-gray-900 dark:text-slate-100 transition-colors"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* 시술 항목 */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 dark:text-slate-300 tracking-tight flex items-center">시술 내역</label>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => {
                const isSelected = selectedServices.some((sel) => sel.id === s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleService(s)}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold border transition-all
                      ${isSelected 
                        ? "bg-blue-600 dark:bg-blue-500 text-white border-blue-600 dark:border-blue-500 shadow-md shadow-blue-100 dark:shadow-none" 
                        : "bg-white dark:bg-slate-800 text-gray-600 dark:text-slate-400 border-gray-200 dark:border-slate-700 hover:border-blue-400 dark:hover:border-blue-500 hover:text-blue-600 dark:hover:text-blue-400"}`}
                  >
                    {s.name}
                    <span className={`ml-1.5 opacity-50 ${isSelected ? "text-white" : "text-gray-400 dark:text-slate-500"}`}>{formatCurrency(s.price)}</span>
                  </button>
                );
              })}
            </div>
            {selectedServices.length > 0 && (
              <p className="text-[11px] font-bold text-blue-600 dark:text-blue-400 animate-in fade-in slide-in-from-left-1 transition-colors">
                항목 합계: {formatCurrency(selectedServices.reduce((acc, s) => acc + s.price, 0))} (자동 반영됨)
              </p>
            )}
          </div>

          {/* 결제 정보 섹션 (차감 로직 중심) */}
          <div className="p-5 bg-blue-50/30 dark:bg-blue-900/10 rounded-3xl border border-blue-100/50 dark:border-blue-900/20 space-y-4 shadow-sm transition-colors">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 dark:text-slate-500 mb-1.5 tracking-widest uppercase flex items-center transition-colors">
                  <Calculator className="w-3 h-3 mr-1" />
                  총 시술 정가
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-100 dark:border-slate-700 rounded-xl text-sm font-bold text-gray-600 dark:text-slate-300 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 outline-none"
                  value={serviceTotal}
                  onChange={(e) => setServiceTotal(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-rose-500 dark:text-rose-400 mb-1.5 tracking-widest uppercase flex items-center transition-colors">
                  <Check className="w-3 h-3 mr-1" />
                  포인트 사용 (보유: {(selectedCustomer?.total_points || 0).toLocaleString()}P)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-rose-50 dark:border-rose-900/30 rounded-xl text-sm font-bold text-rose-600 dark:text-rose-400 shadow-sm transition-all focus:ring-2 focus:ring-rose-500 outline-none"
                  value={pointsUsed}
                  onChange={(e) => setPointsUsed(e.target.value)}
                />
                {parseInt(pointsUsed) > (selectedCustomer?.total_points || 0) && (
                  <p className="text-[9px] text-rose-500 font-black animate-pulse transition-colors mt-1">잔액이 부족합니다.</p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-blue-100/30 dark:border-blue-900/30 transition-colors">
              <label className="block text-[10px] font-black text-blue-600 dark:text-blue-400 mb-1.5 tracking-widest uppercase">최종 실 결제 금액 *</label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-5 py-3 bg-white dark:bg-slate-800 border-2 border-blue-500/20 dark:border-blue-500/30 rounded-2xl text-lg font-black text-blue-700 dark:text-blue-400 shadow-md shadow-blue-50 dark:shadow-none outline-none focus:ring-2 focus:ring-blue-500 transition-all pl-12"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 dark:text-blue-600/50 font-black text-base">₩</span>
              </div>
              
              {parseInt(serviceTotal) > 0 && (
                <p className="mt-2.5 text-[10px] font-bold text-blue-900/40 dark:text-slate-500 text-center bg-white/50 dark:bg-slate-800/50 py-1 rounded-full border border-blue-100/10 dark:border-slate-700/50 transition-colors">
                   {parseInt(serviceTotal).toLocaleString()}원(정가) - {parseInt(pointsUsed || "0").toLocaleString()}P(사용) = <span className="text-blue-600 dark:text-blue-400 font-black transition-colors">{parseInt(paymentAmount).toLocaleString()}원</span>
                </p>
              )}
            </div>
          </div>

          {/* 방문 결과 섹션 (적립, 수단, 날짜) */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 dark:bg-indigo-900/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/20 transition-colors">
                <label className="block text-[10px] font-black text-indigo-700 dark:text-indigo-400 mb-1.5 tracking-widest uppercase transition-colors">✨ 이번 적립 포인트</label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-indigo-100 dark:border-slate-700 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm text-gray-900 dark:text-slate-100"
                  value={pointsEarned}
                  onChange={(e) => setPointsEarned(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-500 mb-1.5 tracking-tight uppercase transition-colors">방문 날짜 *</label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 bg-white dark:bg-slate-800 border border-gray-200 dark:border-slate-700 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all shadow-sm text-gray-900 dark:text-slate-100"
                  value={visitedAt}
                  onChange={(e) => setVisitedAt(e.target.value)}
                  required
                />
              </div>
            </div>
            
            <div className="space-y-4">
              <div className="h-full flex flex-col">
                <label className="block text-xs font-bold text-gray-500 dark:text-slate-500 mb-1.5 tracking-tight uppercase transition-colors">결제 수단 *</label>
                <div className="grid grid-rows-2 gap-2 h-full">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center ${
                      paymentMethod === "card" 
                        ? "bg-indigo-600 dark:bg-indigo-500 text-white shadow-md shadow-indigo-100 dark:shadow-none" 
                        : "bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-500 border border-gray-100 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    💳 카드
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center ${
                      paymentMethod === "cash" 
                        ? "bg-emerald-600 dark:bg-emerald-500 text-white shadow-md shadow-emerald-100 dark:shadow-none" 
                        : "bg-white dark:bg-slate-800 text-gray-400 dark:text-slate-500 border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-700/50"
                    }`}
                  >
                    💵 현금 / 계좌
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 dark:text-slate-300 mb-2 tracking-tight transition-colors">메모 (선택)</label>
            <textarea
              className="w-full px-4 py-3 bg-gray-50 dark:bg-slate-800 border border-transparent dark:border-slate-700 rounded-2xl focus:bg-white dark:focus:bg-slate-700 focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm font-medium transition-all text-gray-900 dark:text-slate-100 placeholder:text-gray-400 dark:placeholder:text-slate-600"
              placeholder="특이사항이나 세부 요청 사항을 입력하세요."
              rows={2}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </form>

        {/* 하단 버튼 */}
        <div className="px-6 py-4 border-t border-gray-100 dark:border-slate-800 flex space-x-3 bg-white dark:bg-slate-900 shrink-0 transition-colors">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 border border-gray-200 dark:border-slate-700 text-gray-400 dark:text-slate-500 font-bold rounded-xl hover:bg-gray-50 dark:hover:bg-slate-800 transition-all active:scale-95 disabled:opacity-50 text-sm"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={isSubmitting || (parseInt(pointsUsed) > (selectedCustomer?.total_points || 0))}
            onClick={handleSubmit}
            className="flex-[2] py-3 bg-blue-600 dark:bg-blue-500 text-white font-black rounded-xl hover:bg-blue-700 dark:hover:bg-blue-600 transition-all shadow-lg shadow-blue-100 dark:shadow-none active:scale-95 disabled:opacity-50 disabled:shadow-none text-sm"
          >
            {isSubmitting ? "저장 중..." : (initialData ? "수정 완료" : "방문 기록 저장")}
          </button>
        </div>
      </div>
    </div>
  );
}
