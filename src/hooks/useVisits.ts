import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { Visit } from "../types";
import { useCustomerStore } from "./useCustomers";

export interface VisitWithCustomer extends Visit {
  customers: { name: string; phone: string };
}

interface VisitState {
  visits: VisitWithCustomer[];
  isLoading: boolean;
  error: string | null;
  fetchVisits: () => Promise<void>;
  addVisit: (data: Omit<Visit, "id" | "created_at">) => Promise<boolean>;
  updateVisit: (id: string, data: Partial<Visit>) => Promise<boolean>;
  deleteVisit: (id: string) => Promise<boolean>;
}

export const useVisitStore = create<VisitState>((set, get) => ({
  visits: [],
  isLoading: false,
  error: null,

  fetchVisits: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("visits")
        // customers의 이름, 연락처 정보를 함께 조인
        .select(
          `
          *,
          customers(name, phone)
        `,
        )
        .order("visited_at", { ascending: false });

      if (error) throw error;
      set({ visits: data as VisitWithCustomer[] });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addVisit: async (visitData) => {
    try {
      const { error } = await supabase.from("visits").insert(visitData);

      if (error) throw error;
      
      // 관련 상태 모두 최신화
      await get().fetchVisits();
      await useCustomerStore.getState().fetchCustomers();
      
      return true;
    } catch (err: any) {
      set({ error: err.message || "An error occurred" });
      return false;
    }
  },

  updateVisit: async (id, updatedData) => {
    try {
      const { error } = await supabase
        .from("visits")
        .update({
          customer_id: updatedData.customer_id,
          visited_at: updatedData.visited_at,
          payment_amount: updatedData.payment_amount,
          payment_method: updatedData.payment_method,
          services: updatedData.services,
          memo: updatedData.memo,
          points_earned: updatedData.points_earned,
          points_used: updatedData.points_used,
        })
        .eq("id", id);

      if (error) throw error;
      
      await get().fetchVisits();
      await useCustomerStore.getState().fetchCustomers();
      
      return true;
    } catch (err: any) {
      set({ error: err.message || "An error occurred" });
      return false;
    }
  },

  deleteVisit: async (id) => {
    try {
      const { error } = await supabase.from("visits").delete().eq("id", id);

      if (error) throw error;
      
      await get().fetchVisits();
      await useCustomerStore.getState().fetchCustomers();
      
      return true;
    } catch (err: any) {
      set({ error: err.message || "An error occurred" });
      return false;
    }
  },
}));
