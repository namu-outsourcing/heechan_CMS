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

export const useServiceStore = create<ServiceState>((set) => ({
  services: [],
  isLoading: false,

  fetchServices: async () => {
    set({ isLoading: true });
    const { data, error } = await supabase
      .from("service_categories")
      .select("*")
      .order("created_at");
    if (!error && data) set({ services: data as ServiceCategory[] });
    set({ isLoading: false });
  },

  addService: async (serviceData) => {
    const { error } = await supabase
      .from("service_categories")
      .insert(serviceData);
    if (error) {
      console.error(error);
      return false;
    }
    return true;
  },

  updateService: async (id, updated) => {
    const { error } = await supabase
      .from("service_categories")
      .update({ name: updated.name, price: updated.price })
      .eq("id", id);
    if (error) {
      console.error(error);
      return false;
    }
    return true;
  },

  deleteService: async (id) => {
    const { error } = await supabase
      .from("service_categories")
      .delete()
      .eq("id", id);
    if (error) {
      console.error(error);
      return false;
    }
    return true;
  },
}));
