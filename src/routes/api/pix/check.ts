import { createFileRoute } from "@tanstack/react-router";
import { handlePixCheck } from "@/lib/flevopay.server";

export const Route = createFileRoute("/api/pix/check")({
  server: { handlers: { POST: ({ request }) => handlePixCheck(request) } },
});
