"use client";

import * as React from "react";
import { AppSidebar } from "@/components/app-sidebar";
import { SiteHeader } from "@/components/site-header";
import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar";
import { Button } from "@/components/ui/button";
import docs from "./mockDocs";
import siteHeaderData from "../constants/siteheaderdata";
import sidebarData from "../constants/sidebardata";

export default function Page() {
  const [query, setQuery] = React.useState("");
  const [selectedDoc, setSelectedDoc] = React.useState(docs[0] ?? null);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    return docs.filter((d) => {
      if (!q) return true;
      return (
        d.title.toLowerCase().includes(q) ||
        d.summary.toLowerCase().includes(q) ||
        d.author.toLowerCase().includes(q)
      );
    });
  }, [query]);

  const formatDate = (ts: string) => {
    const d = new Date(ts);
    const pad = (n: number) => n.toString().padStart(2, "0");
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  };

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
                    <h2 className="text-lg font-semibold">Platform Docs</h2>
                    <p className="text-sm text-muted-foreground">
                      Internal documentation for platform operators.
                    </p>
                  </div>
                </div>

                <div className="flex flex-col gap-3 mb-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-2 w-full md:w-1/2">
                    <input
                      className="w-full rounded-md border border-input px-3 py-2"
                      placeholder="Search docs, title or author..."
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                </div>

                <div className="grid gap-4">
                  {filtered.map((d) => (
                    <div key={d.id} className="rounded-md border bg-card p-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium">{d.title}</div>
                          <div className="text-xs text-muted-foreground">
                            {d.summary}
                          </div>
                          <div className="text-xs text-muted-foreground">
                            By {d.author} • {formatDate(d.updatedAt)}
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => setSelectedDoc(d)}
                          >
                            View
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                <div className="mt-6 space-y-4 rounded-lg border p-4">
                  <h3 className="text-base font-semibold">Document Viewer</h3>
                  {selectedDoc ? (
                    <div className="space-y-2">
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold">Title:</span>{" "}
                        {selectedDoc.title}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold">Author:</span>{" "}
                        {selectedDoc.author}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        <span className="font-semibold">Last updated:</span>{" "}
                        {formatDate(selectedDoc.updatedAt)}
                      </div>
                      <p className="text-sm text-muted-foreground">
                        {selectedDoc.summary}
                      </p>
                      <div className="rounded-md bg-muted/30 p-3 text-sm">
                        {selectedDoc.content}
                      </div>
                    </div>
                  ) : (
                    <p className="text-sm text-muted-foreground">
                      Select a document to view its details and content.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
}
