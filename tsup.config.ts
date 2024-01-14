import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["src/main.ts"],
  splitting: false,
  target: "esnext",
  format: ["esm", "cjs"],
  dts: true,
  treeshake: true,
});
