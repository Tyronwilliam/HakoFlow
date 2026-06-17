"use client";

import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export function useUnreadCount() {
  const [count, setCount] = useState<number | null>(null);

  useEffect(() => {
    const supabase = createClient();
    let workspaceId: string | null = null;

    const fetchCount = async () => {
      if (!workspaceId) return;
      const { count } = await supabase
        .from("conversations")
        .select("*", { count: "exact", head: true })
        .eq("workspace_id", workspaceId)
        .gt("unread_count", 0)
        .eq("is_archived", false);
      setCount(count ?? 0);
    };

    const init = async () => {
      const { data: workspace } = await supabase
        .from("workspaces")
        .select("id")
        .eq("is_default", true)
        .single();

      if (!workspace) return;
      workspaceId = workspace.id;

      await fetchCount();

      supabase
        .channel("unread-count")
        .on(
          "postgres_changes",
          {
            event: "UPDATE",
            schema: "public",
            table: "conversations",
            filter: `workspace_id=eq.${workspaceId}`,
          },
          fetchCount,
        )
        .subscribe();
    };

    init();

    return () => {
      supabase.removeAllChannels();
    };
  }, []);

  return { count };
}
