import { createFileRoute } from "@tanstack/react-router";
import { handlePixCreate } from "@/lib/flevopay.server";

export const Route = createFileRoute("/api/pix/create")({
  server: { handlers: { POST: ({ request }) => handlePixCreate(request) } },
});
