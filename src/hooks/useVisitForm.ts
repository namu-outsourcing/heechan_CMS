import { useState, useEffect, useMemo, useRef } from "react";
import type { FormEvent } from "react";
import { supabase } from "../lib/supabase";
import { useCustomerStore } from "./useCustomers";
import { useServiceStore } from "./useServices";
import { ServiceCategory, VisitSaveData } from "../types";

interface UseVisitFormOptions {
  isOpen: boolean;
  initialData?: (VisitSaveData & { id: string }) | null;
  onSave: (data: VisitSaveData) => Promise<boolean>;
  onClose: () => void;
}

export function useVisitForm({
  isOpen,
  initialData,
  onSave,
  onClose,
}: UseVisitFormOptions) {
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
  const [selectedServices, setSelectedServices] = useState<ServiceCategory[]>([]);
  const [memo, setMemo] = useState(initialData?.memo || "");
  const [pointsEarned, setPointsEarned] = useState(
    initialData?.points_earned?.toString() || "0",
  );
  const [pointsUsed, setPointsUsed] = useState(
    initialData?.points_used?.toString() || "0",
  );
  const [serviceTotal, setServiceTotal] = useState(
    initialData
      ? (initialData.payment_amount + (initialData.points_used || 0)).toString()
      : "0",
  );
  const [isNewCustomerMode, setIsNewCustomerMode] = useState(false);
  const [newCustomerName, setNewCustomerName] = useState("");
  const [newCustomerPhone, setNewCustomerPhone] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const searchContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        searchContainerRef.current &&
        !searchContainerRef.current.contains(event.target as Node)
      ) {
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

  const selectedCustomer = useMemo(
    () => customers.find((c) => c.id === customerId),
    [customers, customerId],
  );

  const searchedCustomers = useMemo(() => {
    if (!searchQuery.trim()) return customers.slice(0, 10);
    const lowerQuery = searchQuery.toLowerCase().replace(/-/g, "");
    return customers
      .filter(
        (c) =>
          c.name.toLowerCase().includes(lowerQuery) ||
          (c.phone || "").replace(/-/g, "").includes(lowerQuery),
      )
      .slice(0, 15);
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
      setServiceTotal(
        initialData?.payment_amount
          ? (initialData.payment_amount + (initialData.points_used || 0)).toString()
          : "0",
      );
      setIsNewCustomerMode(false);
    }
  }, [isOpen, initialData]);

  // 총 정가 - 포인트 사용 = 실 결제 금액 자동 계산
  useEffect(() => {
    const total = parseInt(serviceTotal) || 0;
    const used = parseInt(pointsUsed) || 0;
    setPaymentAmount((total - used).toString());
  }, [serviceTotal, pointsUsed]);

  const toggleService = (service: ServiceCategory) => {
    setSelectedServices((prev) => {
      const exists = prev.find((s) => s.id === service.id);
      const updated = exists
        ? prev.filter((s) => s.id !== service.id)
        : [...prev, service];
      const total = updated.reduce((acc, s) => acc + s.price, 0);
      setServiceTotal(total > 0 ? total.toString() : "");
      return updated;
    });
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!paymentAmount) return alert("결제 금액을 입력해주세요.");
    setIsSubmitting(true);
    let finalCustomerId = customerId;

    if (isNewCustomerMode && !initialData) {
      if (!newCustomerName || !newCustomerPhone) {
        setIsSubmitting(false);
        return alert("신규 고객 이름과 연락처를 입력해주세요.");
      }
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

  return {
    // 데이터
    customers,
    services,
    selectedCustomer,
    searchedCustomers,
    // 폼 상태
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
    // 핸들러
    toggleService,
    handleSubmit,
  };
}
