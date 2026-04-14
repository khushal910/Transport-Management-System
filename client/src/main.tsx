import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import { AppErrorBoundary } from "@/components/shared/AppErrorBoundary";

createRoot(document.getElementById("root")!).render(
	<AppErrorBoundary>
		<App />
	</AppErrorBoundary>
);
