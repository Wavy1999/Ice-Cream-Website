// ============================================================
//  AppProvider  –  Root initializer
//  Subscribes to Supabase auth state; loads farm + settings.
// ============================================================

import React, { useEffect, useRef } from "react";
import { authService } from "../services/AuthService";
import { settingsService } from "../services/SettingsService";
import { supabase } from "../supabase/client";
import { useAppStore } from "./AppStore";

interface AppProviderProps {
  children: React.ReactNode;
}

export const AppProvider: React.FC<AppProviderProps> = ({ children }) => {
  const { setUser, setFarm, setSettings, setLoading, darkMode } = useAppStore(
    (s) => ({
      setUser: s.setUser,
      setFarm: s.setFarm,
      setSettings: s.setSettings,
      setLoading: s.setLoading,
      darkMode: s.darkMode,
    }),
  );

  // Sync dark-mode class to <body> whenever the store value changes
  useEffect(() => {
    document.body.classList.toggle("dark-mode", darkMode);
  }, [darkMode]);

  // Bootstrap: resolve session → load farm + settings
  useEffect(() => {
    // useRef so the closure inside onAuthStateChange always sees the
    // latest value without adding it to the dependency array
    const mountedRef = { current: true };

    async function loadFarmContext(userId: string) {
      const { data: farms } = await supabase
        .from("farms")
        .select("*")
        .eq("owner_id", userId)
        .limit(1);

      let farm = farms?.[0] ?? null;

      if (!farm) {
        const { data: newFarm } = await supabase
          .from("farms")
          .insert({ name: "My Farm", owner_id: userId })
          .select()
          .single();
        farm = newFarm;
      }

      if (farm) {
        setFarm(farm);
        const settingsResult = await settingsService.getOrCreate(farm.id);
        if (settingsResult.data) setSettings(settingsResult.data);
      }
    }

    async function bootstrap() {
      setLoading(true);
      const user = await authService.getCurrentUser();
      if (!mountedRef.current) return;

      setUser(user);
      if (user) await loadFarmContext(user.id);

      setLoading(false);
    }

    const { data: listener } = authService.onAuthStateChange(async (user) => {
      if (!mountedRef.current) return;
      setUser(user);

      if (user) {
        await loadFarmContext(user.id);
      } else {
        setFarm(null);
        setSettings(null);
      }
    });

    bootstrap();

    return () => {
      mountedRef.current = false;
      listener.subscription.unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <>{children}</>;
};

export default AppProvider;
