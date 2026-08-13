import { createFileRoute } from "@tanstack/react-router";

/** Serves teacher profile photos from private storage as public, cacheable images. */
export const Route = createFileRoute("/api/public/teacher-photo/$")({
  server: {
    handlers: {
      GET: async ({ params }) => {
        const path = (params as { _splat?: string })._splat ?? "";
        if (!path || path.includes("..")) {
          return new Response("Not found", { status: 404 });
        }
        const { supabaseAdmin } = await import("@/integrations/supabase/client.server");
        const { data, error } = await supabaseAdmin.storage.from("teacher-photos").download(path);
        if (error || !data) {
          return new Response("Not found", { status: 404 });
        }
        return new Response(await data.arrayBuffer(), {
          headers: {
            "content-type": data.type || "image/jpeg",
            "cache-control": "public, max-age=3600",
          },
        });
      },
    },
  },
});
