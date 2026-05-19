import { createFileRoute, Navigate } from "@tanstack/react-router";
import { useApp } from "@/lib/app-store";

export const Route = createFileRoute("/")({
  component: () => {
    const { user } = useApp();
    return <Navigate to={user ? "/dashboard" : "/login"} />;
  },
});
