import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { ServiceCategory } from "../types";

interface ServiceState {
  services: ServiceCategory[];
  isLoading: boolean;
  error: string | null;
  fetchServices: () => Promise<void>;
  addService: (data: Omit<ServiceCategory, "id" | "created_at">) => Promise<boolean>;
  updateService: (id: string, data: Partial<ServiceCategory>) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  isLoading: false,
  error: null,

  fetchServices: async () => {
    set({ isLoading: true, error: null });
    try {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("created_at");
      if (error) throw error;
      if (data) set({ services: data as ServiceCategory[] });
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
      set({ error: message });
    } finally {
      set({ isLoading: false });
    }
  },

  addService: async (serviceData) => {
    try {
      const { error } = await supabase.from("service_categories").insert(serviceData);
      if (error) throw error;
      await get().fetchServices();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
      set({ error: message });
      return false;
    }
  },

  updateService: async (id, updated) => {
    try {
      const { error } = await supabase
        .from("service_categories")
        .update({ name: updated.name, price: updated.price })
        .eq("id", id);
      if (error) throw error;
      await get().fetchServices();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
      set({ error: message });
      return false;
    }
  },

  deleteService: async (id) => {
    try {
      const { error } = await supabase
        .from("service_categories")
        .delete()
        .eq("id", id);
      if (error) throw error;
      await get().fetchServices();
      return true;
    } catch (err) {
      const message = err instanceof Error ? err.message : "오류가 발생했습니다.";
      set({ error: message });
      return false;
    }
  },
}));
