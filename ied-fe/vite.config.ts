import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";

// https://vitejs.dev/config/
export default defineConfig({
	plugins: [react()],
	build: {
		outDir: "dist",
		sourcemap: false,
		target: "esnext",
	},
	server: {
		allowedHosts: ["ied-baza.xyz", "bs-baza.xyz"],
	},
});
