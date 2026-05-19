import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { useEffect } from "react";
import { getUsuario, homeForRole } from "@/lib/auth";

export const Route = createFileRoute("/")({
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  useEffect(() => {
    const u = getUsuario();
    navigate({ to: u ? homeForRole(u.rol) : "/login" });
  }, [navigate]);
  return null;
}
