import { X, UserPlus, Search, Check, Calculator } from "lucide-react";
import { VisitSaveData } from "../../types";
import { useVisitForm } from "../../hooks/useVisitForm";
import { formatCurrency } from "../../utils/format";

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: VisitSaveData) => Promise<boolean>;
  initialData?: (VisitSaveData & { id: string }) | null;
}

export default function VisitModal({ isOpen, onClose, onSave, initialData }: Props) {
  const {
    services,
    selectedCustomer,
    searchedCustomers,
    customerId,
    setCustomerId,
    visitedAt,
    setVisitedAt,
    paymentAmount,
    setPaymentAmount,
    paymentMethod,
    setPaymentMethod,
    selectedServices,
    memo,
    setMemo,
    pointsEarned,
    setPointsEarned,
    pointsUsed,
    setPointsUsed,
    serviceTotal,
    setServiceTotal,
    isNewCustomerMode,
    setIsNewCustomerMode,
    newCustomerName,
    setNewCustomerName,
    newCustomerPhone,
    setNewCustomerPhone,
    isSubmitting,
    searchQuery,
    setSearchQuery,
    isDropdownOpen,
    setIsDropdownOpen,
    searchContainerRef,
    toggleService,
    handleSubmit,
  } = useVisitForm({ isOpen, initialData, onSave, onClose });

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm transition-opacity">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl flex flex-col max-h-[90vh] overflow-hidden transform transition-all scale-100">
        {/* 헤더 */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between shrink-0">
          <div className="flex items-center space-x-3">
            <div className="p-2 bg-blue-50 rounded-xl">
              <UserPlus className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-gray-900">
                {initialData ? "방문 기록 수정" : "방문 기록 추가"}
              </h3>
              <p className="text-xs text-gray-400 mt-0.5 font-medium">
                서비스 내역과 결제 정보를 기록합니다.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form
          onSubmit={handleSubmit}
          className="px-6 py-6 space-y-7 overflow-y-auto custom-scrollbar"
        >
          {/* 고객 선택 섹션 */}
          <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-3">
              <label className="text-sm font-bold text-gray-700 tracking-tight">고객 정보 *</label>
              {!initialData && (
                <button
                  type="button"
                  onClick={() => setIsNewCustomerMode(!isNewCustomerMode)}
                  className={`text-[10px] font-black uppercase tracking-widest px-2 py-1 rounded transition-all ${
                    isNewCustomerMode
                      ? "bg-blue-600 text-white"
                      : "bg-blue-50 text-blue-600 hover:bg-blue-100"
                  }`}
                >
                  {isNewCustomerMode ? "기존 고객 찾기" : "신규 고객으로 등록"}
                </button>
              )}
            </div>

            {!isNewCustomerMode ? (
              <div className="relative">
                {selectedCustomer && !isDropdownOpen ? (
                  <div className="flex items-center justify-between p-3 bg-white border border-blue-100 rounded-xl shadow-sm">
                    <div className="flex items-center">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-black mr-3 shadow-inner">
                        {selectedCustomer.name[0]}
                      </div>
                      <div>
                        <div className="text-sm font-bold text-gray-900">
                          {selectedCustomer.name}
                        </div>
                        <div className="text-[10px] text-gray-400 font-medium">
                          {selectedCustomer.phone || "연락처 없음"}
                        </div>
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
                        className="text-xs text-blue-500 font-bold hover:underline"
                      >
                        변경
                      </button>
                    )}
                  </div>
                ) : (
                  <div ref={searchContainerRef} className="relative">
                    <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      className="w-full pl-10 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium shadow-sm"
                      placeholder="고객 이름 또는 연락처 검색..."
                      value={searchQuery}
                      onChange={(e) => {
                        setSearchQuery(e.target.value);
                        setIsDropdownOpen(true);
                      }}
                      onFocus={() => setIsDropdownOpen(true)}
                    />
                    {isDropdownOpen && (
                      <div className="absolute z-50 w-full mt-2 bg-white border border-gray-100 rounded-xl shadow-xl overflow-hidden animate-in fade-in zoom-in-95">
                        {searchedCustomers.length > 0 ? (
                          <div className="max-h-56 overflow-y-auto">
                            {searchedCustomers.map((c) => (
                              <button
                                key={c.id}
                                type="button"
                                className="w-full px-4 py-3 text-left hover:bg-blue-50 flex items-center justify-between group transition-colors border-b border-gray-50 last:border-0"
                                onClick={() => {
                                  setCustomerId(c.id);
                                  setIsDropdownOpen(false);
                                  setSearchQuery("");
                                }}
                              >
                                <div>
                                  <div className="text-sm font-bold text-gray-900 group-hover:text-blue-600">
                                    {c.name}
                                  </div>
                                  <div className="text-[10px] text-gray-400 font-medium">
                                    {c.phone}
                                  </div>
                                </div>
                                {customerId === c.id && (
                                  <Check className="w-4 h-4 text-blue-600" />
                                )}
                              </button>
                            ))}
                          </div>
                        ) : (
                          <div className="px-4 py-6 text-center text-xs text-gray-400 font-medium">
                            검색 결과가 없습니다.
                          </div>
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
                  className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  value={newCustomerName}
                  onChange={(e) => setNewCustomerName(e.target.value)}
                />
                <input
                  type="tel"
                  placeholder="연락처"
                  className="px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none shadow-sm"
                  value={newCustomerPhone}
                  onChange={(e) => setNewCustomerPhone(e.target.value)}
                />
              </div>
            )}
          </div>

          {/* 시술 항목 */}
          <div className="space-y-3">
            <label className="text-sm font-bold text-gray-700 tracking-tight flex items-center">
              시술 내역
            </label>
            <div className="flex flex-wrap gap-2">
              {services.map((s) => {
                const isSelected = selectedServices.some((sel) => sel.id === s.id);
                return (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => toggleService(s)}
                    className={`inline-flex items-center px-4 py-2 rounded-full text-xs font-bold border transition-all ${
                      isSelected
                        ? "bg-blue-600 text-white border-blue-600 shadow-md shadow-blue-100"
                        : "bg-white text-gray-600 border-gray-200 hover:border-blue-400 hover:text-blue-600"
                    }`}
                  >
                    {s.name}
                    <span
                      className={`ml-1.5 opacity-50 ${isSelected ? "text-white" : "text-gray-400"}`}
                    >
                      {formatCurrency(s.price)}
                    </span>
                  </button>
                );
              })}
            </div>
            {selectedServices.length > 0 && (
              <p className="text-[11px] font-bold text-blue-600 animate-in fade-in slide-in-from-left-1">
                항목 합계:{" "}
                {formatCurrency(selectedServices.reduce((acc, s) => acc + s.price, 0))}{" "}
                (자동 반영됨)
              </p>
            )}
          </div>

          {/* 결제 정보 섹션 */}
          <div className="p-5 bg-blue-50/30 rounded-3xl border border-blue-100/50 space-y-4 shadow-sm">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-black text-gray-400 mb-1.5 tracking-widest uppercase flex items-center">
                  <Calculator className="w-3 h-3 mr-1" />
                  총 시술 정가
                </label>
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-4 py-2.5 bg-white border border-gray-100 rounded-xl text-sm font-bold text-gray-600 shadow-sm transition-all focus:ring-2 focus:ring-blue-500 outline-none"
                  value={serviceTotal}
                  onChange={(e) => setServiceTotal(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-[10px] font-black text-rose-500 mb-1.5 tracking-widest uppercase flex items-center">
                  <Check className="w-3 h-3 mr-1" />
                  포인트 사용 (보유: {(selectedCustomer?.total_points || 0).toLocaleString()}P)
                </label>
                <input
                  type="number"
                  className="w-full px-4 py-2.5 bg-white border border-rose-50 rounded-xl text-sm font-bold text-rose-600 shadow-sm transition-all focus:ring-2 focus:ring-rose-500 outline-none"
                  value={pointsUsed}
                  onChange={(e) => setPointsUsed(e.target.value)}
                />
                {parseInt(pointsUsed) > (selectedCustomer?.total_points || 0) && (
                  <p className="text-[9px] text-rose-500 mt-1 font-black animate-pulse">
                    잔액이 부족합니다.
                  </p>
                )}
              </div>
            </div>

            <div className="pt-2 border-t border-blue-100/30">
              <label className="block text-[10px] font-black text-blue-600 mb-1.5 tracking-widest uppercase">
                최종 실 결제 금액 *
              </label>
              <div className="relative">
                <input
                  type="number"
                  placeholder="0"
                  className="w-full px-5 py-3 bg-white border-2 border-blue-500/20 rounded-2xl text-lg font-black text-blue-700 shadow-md shadow-blue-50 outline-none focus:ring-2 focus:ring-blue-500 transition-all pl-12"
                  value={paymentAmount}
                  onChange={(e) => setPaymentAmount(e.target.value)}
                  required
                />
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-blue-300 font-black text-base">
                  ₩
                </span>
              </div>
              {parseInt(serviceTotal) > 0 && (
                <p className="mt-2.5 text-[10px] font-bold text-blue-900/40 text-center bg-white/50 py-1 rounded-full border border-blue-100/10">
                  {parseInt(serviceTotal).toLocaleString()}원(정가) -{" "}
                  {parseInt(pointsUsed || "0").toLocaleString()}P(사용) ={" "}
                  <span className="text-blue-600">
                    {parseInt(paymentAmount).toLocaleString()}원
                  </span>
                </p>
              )}
            </div>
          </div>

          {/* 방문 결과 섹션 */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="p-4 bg-indigo-50/50 rounded-2xl border border-indigo-100/50">
                <label className="block text-[10px] font-black text-indigo-700 mb-1.5 tracking-widest uppercase">
                  ✨ 이번 적립 포인트
                </label>
                <input
                  type="number"
                  className="w-full px-3 py-2 bg-white border border-indigo-100 rounded-lg text-sm font-bold focus:ring-2 focus:ring-indigo-500 outline-none transition-all shadow-sm"
                  value={pointsEarned}
                  onChange={(e) => setPointsEarned(e.target.value)}
                />
              </div>
              <div>
                <label className="block text-xs font-bold text-gray-500 mb-1.5 tracking-tight uppercase">
                  방문 날짜 *
                </label>
                <input
                  type="date"
                  className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium transition-all shadow-sm"
                  value={visitedAt}
                  onChange={(e) => setVisitedAt(e.target.value)}
                  required
                />
              </div>
            </div>

            <div className="space-y-4">
              <div className="h-full flex flex-col">
                <label className="block text-xs font-bold text-gray-500 mb-1.5 tracking-tight uppercase">
                  결제 수단 *
                </label>
                <div className="grid grid-rows-2 gap-2 h-full">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("card")}
                    className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center ${
                      paymentMethod === "card"
                        ? "bg-indigo-600 text-white shadow-md shadow-indigo-100"
                        : "bg-white text-gray-400 border border-gray-100 hover:bg-gray-50"
                    }`}
                  >
                    💳 카드
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod("cash")}
                    className={`py-2 text-[11px] font-bold rounded-xl transition-all flex items-center justify-center ${
                      paymentMethod === "cash"
                        ? "bg-emerald-600 text-white shadow-md shadow-emerald-100"
                        : "bg-white text-gray-400 border border-gray-200 hover:bg-gray-50"
                    }`}
                  >
                    💵 현금 / 계좌
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2 tracking-tight">
              메모 (선택)
            </label>
            <textarea
              className="w-full px-4 py-3 bg-gray-50 border border-transparent rounded-2xl focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none resize-none text-sm font-medium transition-all"
              placeholder="특이사항이나 세부 요청 사항을 입력하세요."
              rows={2}
              value={memo}
              onChange={(e) => setMemo(e.target.value)}
            />
          </div>
        </form>

        {/* 하단 버튼 */}
        <div className="px-6 py-4 border-t border-gray-100 flex space-x-3 bg-white shrink-0">
          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex-1 py-3 border border-gray-200 text-gray-400 font-bold rounded-xl hover:bg-gray-50 transition-all active:scale-95 disabled:opacity-50 text-sm"
          >
            취소
          </button>
          <button
            type="submit"
            disabled={
              isSubmitting || parseInt(pointsUsed) > (selectedCustomer?.total_points || 0)
            }
            onClick={handleSubmit}
            className="flex-[2] py-3 bg-blue-600 text-white font-black rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-100 active:scale-95 disabled:opacity-50 disabled:shadow-none text-sm"
          >
            {isSubmitting ? "저장 중..." : initialData ? "수정 완료" : "방문 기록 저장"}
          </button>
        </div>
      </div>
    </div>
  );
}
