"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import platformSettings from "./mockSettings";
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

export default function Page() {
  const [settings, setSettings] = React.useState(() =>
    platformSettings.map((s) => ({ ...s })),
  );

  function updateSetting(id: string, nextValue: any) {
    setSettings((prev) =>
      prev.map((p) => (p.id === id ? { ...p, value: nextValue } : p)),
    );
  }

  function saveAll() {
    // For now just log — real implementation would call an API route.
    console.log("Saving settings:", settings);
    alert("Settings saved (mock)");
  }

  function exportCsv() {
    const rows = settings.map((s) => ({
      key: s.key,
      value: Array.isArray(s.value) ? s.value.join(",") : String(s.value),
    }));
    const headers = ["key", "value"];
    const csv = [headers.join(",")]
      .concat(
        rows.map((r) =>
          headers.map((h) => JSON.stringify((r as any)[h] ?? "")).join(","),
        ),
      )
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "platform-settings.csv";
    a.click();
    URL.revokeObjectURL(url);
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
                    <h2 className="text-lg font-semibold">Platform Settings</h2>
                    <p className="text-sm text-muted-foreground">
                      Global platform configuration and feature flags.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="outline" onClick={exportCsv}>
                      Export
                    </Button>
                    <Button size="sm" variant="default" onClick={saveAll}>
                      Save Changes
                    </Button>
                  </div>
                </div>

                <div className="grid gap-4">
                  {settings.map((s) => (
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
                              value={s.value}
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
                              value={(s.value || []).join(",")}
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
