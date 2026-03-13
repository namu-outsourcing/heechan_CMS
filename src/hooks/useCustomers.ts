import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { CustomerWithLastVisit } from "../types";

interface CustomerState {
  customers: CustomerWithLastVisit[];
  isLoading: boolean;
  error: string | null;
  fetchCustomers: () => Promise<void>;
  addCustomer: (
    data: Omit<
      CustomerWithLastVisit,
      "id" | "created_at" | "visits" | "last_visited_at"
    >,
  ) => Promise<boolean>;
  updateCustomer: (
    id: string,
    data: Partial<CustomerWithLastVisit>,
  ) => Promise<boolean>;
  deleteCustomer: (id: string) => Promise<boolean>;
}

export const useCustomerStore = create<CustomerState>((set) => ({
  customers: [],
  isLoading: false,
  error: null,

  fetchCustomers: async () => {
    set({ isLoading: true, error: null });
    try {
      // visits(visited_at)를 조인하여 최근 방문일 기준 내림차순 정렬 후 1개 제한
      const { data, error } = await supabase
        .from("customers")
        .select(
          `
          *,
          visits(visited_at)
        `,
        )
        .order("name");

      if (error) throw error;

      // 데이터 정제
      const formattedData = data.map((c: any) => {
        const sortedVisits = c.visits?.sort(
          (a: any, b: any) =>
            new Date(b.visited_at).getTime() - new Date(a.visited_at).getTime(),
        );

        const last_visited_at =
          sortedVisits && sortedVisits.length > 0
            ? sortedVisits[0].visited_at
            : undefined;

        const total_points = (c.visits || []).reduce(
          (acc: number, v: any) => acc + (v.points_earned || 0) - (v.points_used || 0),
          0
        );

        return {
          ...c,
          last_visited_at,
          total_points,
        };
      }) as CustomerWithLastVisit[];

      set({ customers: formattedData });
    } catch (err: any) {
      set({ error: err.message });
    } finally {
      set({ isLoading: false });
    }
  },

  addCustomer: async (customerData) => {
    try {
      const { error } = await supabase.from("customers").insert(customerData);

      if (error) throw error;
      set((state) => ({ ...state })); // 재호출 유도를 위해 상태만 변경
      return true;
    } catch (err: any) {
      set({ error: err.message || "An error occurred" });
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
      return true;
    } catch (err: any) {
      set({ error: err.message || "An error occurred" });
      return false;
    }
  },

  deleteCustomer: async (id) => {
    try {
      const { error } = await supabase.from("customers").delete().eq("id", id);

      if (error) throw error;
      return true;
    } catch (err: any) {
      console.error(err);
      return false;
    }
  },
}));
