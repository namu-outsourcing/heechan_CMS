import { create } from "zustand";
import { supabase } from "../lib/supabase";
import { ServiceCategory } from "../types";

interface ServiceState {
  services: ServiceCategory[];
  isLoading: boolean;
  fetchServices: () => Promise<void>;
  addService: (
    data: Omit<ServiceCategory, "id" | "created_at">,
  ) => Promise<boolean>;
  updateService: (
    id: string,
    data: Partial<ServiceCategory>,
  ) => Promise<boolean>;
  deleteService: (id: string) => Promise<boolean>;
}

export const useServiceStore = create<ServiceState>((set, get) => ({
  services: [],
  isLoading: false,

  fetchServices: async () => {
    set({ isLoading: true });
    try {
      const { data, error } = await supabase
        .from("service_categories")
        .select("*")
        .order("created_at");
      if (!error && data) set({ services: data as ServiceCategory[] });
    } finally {
      set({ isLoading: false });
    }
  },

  addService: async (serviceData) => {
    try {
      const { error } = await supabase
        .from("service_categories")
        .insert(serviceData);
      if (error) throw error;
      await get().fetchServices();
      return true;
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
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
    } catch (error) {
      console.error(error);
      return false;
    }
  },
}));
