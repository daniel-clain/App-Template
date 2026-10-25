import { describe, expect, it } from "vitest";
import { loadAppConfig } from "./config";

describe("loadAppConfig", () => {
  it("uses the default application name when APP_NAME is absent", () => {
    expect(loadAppConfig({}).APP_NAME).toBe("Application");
  });
});
