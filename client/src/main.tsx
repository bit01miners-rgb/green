import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { QueryClientProvider } from "@tanstack/react-query";
import { queryClient } from "./lib/queryClient";
import { Toaster } from "sonner";
import App from "./App";
import { Web3ModalProvider } from "./context/Web3ModalProvider";
import { ErrorBoundary } from "./components/ErrorBoundary";
import "./index.css";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Web3ModalProvider>
      <QueryClientProvider client={queryClient}>
        <ErrorBoundary>
          <App />
          <Toaster position="bottom-right" richColors />
        </ErrorBoundary>
      </QueryClientProvider>
    </Web3ModalProvider>
  </StrictMode>
);
