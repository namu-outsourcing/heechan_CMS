import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { CustomerWithLastVisit, CustomerSaveData } from "../types";

interface VisitRow {
  visited_at: string;
  points_earned: number;
  points_used: number;
}

interface CustomerRow extends Omit<CustomerWithLastVisit, "visits"> {
  visits: VisitRow[];
}

interface CustomerState {
  customers: CustomerWithLastVisit[];
  isLoading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  addCustomer: (data: CustomerSaveData) => Promise<boolean>;
  updateCustomer: (id: string, data: Partial<CustomerWithLastVisit>) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
}

export const useCustomerStore = create<CustomerState>((set, get) => ({
  customers: [],
  isLoading: false,
  error: null,

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("customers")
        .select(`*, visits(visited_at, points_earned, points_used)`)
        .order("name");

      if (error) throw error;

      const formattedData = (data as CustomerRow[]).map((c) => {
        const sortedVisits = [...(c.visits ?? [])].sort(
          (a, b) =>
            new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
        );

        const last_visited_at =
          sortedVisits.length > 0 ? sortedVisits[0].visited_at : undefined;

        const total_points = (c.visits ?? []).reduce(
          (acc, v) => acc + (v.points_earned || 0) - (v.points_used || 0),
          0,
        );

        return { ...c, last_visited_at, total_points };
      });

      set({ customers: formattedData });
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  addCustomer: async (customerData) => {
    try {
      const { error } = await supabase.from("customers").insert(customerData);
      if (error) throw error;
      await get().fetchCustomers();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
      set({ error: message });
      return false;
    }
  },

  updateCustomer: async (id, updatedData) => {
    try {
      const { error } = await supabase
        .from("customers")
        .update({
          name: updatedData.name,
          phone: updatedData.phone,
          memo: updatedData.memo,
        })
        .eq("id", id);
      if (error) throw error;
      await get().fetchCustomers();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
      set({ error: message });
      return false;
    }
  },

  deleteCustomer: async (id) => {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);
      if (error) throw error;
      await get().fetchCustomers();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
      set({ error: message });
      return false;
    }
  },
}));
