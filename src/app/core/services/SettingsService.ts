// ============================================================
//  SettingsService  –  App settings CRUD
// ============================================================

import { SupabaseClient } from "@supabase/supabase-js";
import type {
  AppSettings,
  CustomColumn,
  ServiceResult,
} from "../../shared/types";
import { supabase } from "../supabase/client";

const TABLE = "app_settings";

const DEFAULTS: Omit<AppSettings, "id" | "farm_id" | "updated_at"> = {
  app_name: "Chriselle Ice Cream",
  low_stock_threshold: 15,
  currency: "PHP",
  custom_columns: [],
  login_image_url: null,
};

export class SettingsService {
  private readonly client: SupabaseClient;

  constructor(client: SupabaseClient = supabase) {
    this.client = client;
  }

  async getOrCreate(farmId: string): Promise<ServiceResult<AppSettings>> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("farm_id", farmId)
      .maybeSingle();

    if (error) return { data: null, error: error.message };
    if (data) return { data: data as AppSettings, error: null };

    // First-time: seed default settings row
    const { data: created, error: createErr } = await this.client
      .from(TABLE)
      .insert({ farm_id: farmId, ...DEFAULTS })
      .select()
      .single();

    if (createErr) return { data: null, error: createErr.message };
    return { data: created as AppSettings, error: null };
  }

  async update(
    farmId: string,
    patch: Partial<Omit<AppSettings, "id" | "farm_id" | "updated_at">>,
  ): Promise<ServiceResult<AppSettings>> {
    const { data, error } = await this.client
      .from(TABLE)
      .update(patch)
      .eq("farm_id", farmId)
      .select()
      .single();

    if (error) return { data: null, error: error.message };
    return { data: data as AppSettings, error: null };
  }

  async addCustomColumn(
    farmId: string,
    currentColumns: CustomColumn[],
    name: string,
  ): Promise<ServiceResult<AppSettings>> {
    const key = name.toLowerCase().replace(/\s+/g, "_");
    if (currentColumns.some((c) => c.key === key)) {
      return { data: null, error: `Column "${name}" already exists` };
    }
    return this.update(farmId, {
      custom_columns: [...currentColumns, { name, key }],
    });
  }

  async removeCustomColumn(
    farmId: string,
    currentColumns: CustomColumn[],
    key: string,
  ): Promise<ServiceResult<AppSettings>> {
    return this.update(farmId, {
      custom_columns: currentColumns.filter((c) => c.key !== key),
    });
  }
}

export const settingsService = new SettingsService();
