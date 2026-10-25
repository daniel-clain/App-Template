import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";

const stubs = [".next/types/routes.d.ts", ".next/types/root-params.d.ts"];

for (const relativePath of stubs) {
  const target = path.join(process.cwd(), relativePath);
  await mkdir(path.dirname(target), { recursive: true });
  try {
    await writeFile(target, "export {};\n", { flag: "wx" });
  } catch (error) {
    if (error && typeof error === "object" && "code" in error && error.code === "EEXIST") {
      continue;
    }
    throw error;
  }
}
