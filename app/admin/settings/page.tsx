"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import settings from "./mockSettings";
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

export default function Page() {
  type Setting = {
    id: string;
    label: string;
    description?: string;
    type: "text" | "boolean" | "list";
    value: string | boolean | string[];
  };

  const [form, setForm] = React.useState<Setting[]>(() =>
    settings.map((s) => ({ ...s }) as Setting),
  );

  function updateSetting(id: string, nextValue: any) {
    setForm((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value: nextValue } : p)),
    );
  }

  function saveAll() {
    console.log("Saving settings:", form);
    alert("Settings saved (mock)");
  }

  return (
    <SidebarProvider
      style={
        {
          "--sidebar-width": "calc(var(--spacing) * 72)",
          "--header-height": "calc(var(--spacing) * 12)",
        } as React.CSSProperties
      }
    >
      <AppSidebar variant="inset" sidedebardata={sidebarData} />
      <SidebarInset>
        <SiteHeader siteheaderdata={siteHeaderData} />
        <div className="flex flex-1 flex-col">
          <div className="@container/main flex flex-1 flex-col gap-2">
            <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
              <div className="px-4 lg:px-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h2 className="text-lg font-semibold">Settings</h2>
                    <p className="text-sm text-muted-foreground">
                      Tenant configuration and preferences.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="default" onClick={saveAll}>
                      Save Changes
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {form.map((s) => (
                    <div key={s.id} className="rounded-md border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{s.label}</div>
                          <div className="text-xs text-muted-foreground">
                            {s.description}
                          </div>
                        </div>
                        <div className="w-1/2 md:w-1/3">
                          {s.type === "text" && (
                            <input
                              className="w-full rounded-md border border-input px-3 py-2"
                              value={
                                typeof s.value === "string"
                                  ? s.value
                                  : String(s.value ?? "")
                              }
                              onChange={(e) =>
                                updateSetting(s.id, e.target.value)
                              }
                            />
                          )}
                          {s.type === "boolean" && (
                            <label className="inline-flex items-center gap-2">
                              <input
                                type="checkbox"
                                checked={Boolean(s.value)}
                                onChange={(e) =>
                                  updateSetting(s.id, e.target.checked)
                                }
                              />
                              <span className="text-sm">
                                {s.value ? "Enabled" : "Disabled"}
                              </span>
                            </label>
                          )}
                          {s.type === "list" && (
                            <input
                              className="w-full rounded-md border border-input px-3 py-2"
                              value={
                                Array.isArray(s.value)
                                  ? s.value.join(",")
                                  : String(s.value ?? "")
                              }
                              onChange={(e) =>
                                updateSetting(
                                  s.id,
                                  e.target.value
                                    .split(",")
                                    .map((v) => v.trim()),
                                )
                              }
                            />
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
