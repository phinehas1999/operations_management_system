"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import helpItems, { helpTopics } from "./mockHelp";
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

export default function Page() {
  const [query, setQuery] = React.useState("");

  const filteredItems = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return helpItems.filter((h) => {
      if (!q) return true;
      return (
        (h.title || "").toLowerCase().includes(q) ||
        (h.summary || "").toLowerCase().includes(q) ||
        (h.details || "").toLowerCase().includes(q)
      );
    });
  }, [query]);

  const filteredTopics = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return helpTopics.filter((t) => {
      if (!q) return true;
      return (
        t.title.toLowerCase().includes(q) ||
        t.category.toLowerCase().includes(q) ||
        t.summary.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const formatDate = (ts?: string) => {
    if (!ts) return "";
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

  function openTopic(link: string) {
    window.location.href = link;
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
                    <h2 className="text-lg font-semibold">Get Help</h2>
                    <p className="text-sm text-muted-foreground">
                      Support channels, quick topics and docs for platform
                      operators.
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Button size="sm" variant="default">
                      New Support Ticket
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        (window.location.href = "/superadmin/platform_docs")
                      }
                    >
                      View Docs
                    </Button>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 w-full md:w-1/2">
                    <input
                      className="w-full rounded-md border border-input px-3 py-2"
                      placeholder="Search help..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2">
                  <div>
                    <h3 className="text-sm font-medium mb-2">
                      Support & Tickets
                    </h3>
                    <div className="grid gap-4">
                      {filteredItems.map((h) => (
                        <div
                          key={h.id}
                          className="rounded-md border bg-card p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{h.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {h.summary || h.details}
                              </div>
                              <div className="text-xs text-muted-foreground">
                                {h.type} {h.status ? `• ${h.status}` : ""}{" "}
                                {h.updatedAt
                                  ? `• ${formatDate(h.updatedAt)}`
                                  : ""}
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {h.type === "contact" && (
                                <Button size="sm" variant="outline">
                                  Email
                                </Button>
                              )}
                              {h.type === "ticket" && (
                                <Button size="sm" variant="ghost">
                                  View
                                </Button>
                              )}
                              {h.type === "faq" && (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() =>
                                    openTopic(
                                      h.slug
                                        ? `/superadmin/platform_docs/${h.slug}`
                                        : "/superadmin/platform_docs",
                                    )
                                  }
                                >
                                  Open
                                </Button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium mb-2">Quick Topics</h3>
                    <div className="grid gap-4">
                      {filteredTopics.map((t) => (
                        <div
                          key={t.id}
                          className="rounded-md border bg-card p-4"
                        >
                          <div className="flex items-center justify-between">
                            <div>
                              <div className="font-medium">{t.title}</div>
                              <div className="text-xs text-muted-foreground">
                                {t.category} • {formatDate(t.updatedAt)}
                              </div>
                              <div className="text-sm mt-2">{t.summary}</div>
                            </div>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => openTopic(t.link)}
                              >
                                Open
                              </Button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
