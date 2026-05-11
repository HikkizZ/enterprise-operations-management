import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./context/AuthContext";
import { router } from "@/routes/router";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

const queryclient = new QueryClient();

export default function App() {
  return (
    <QueryClientProvider client={queryclient}>
      <AuthProvider>
        <RouterProvider router={router} />
      </AuthProvider>
    </QueryClientProvider>
  )
}