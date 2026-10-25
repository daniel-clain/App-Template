import { defineConfig, loadPublicConfig, type EnvSource } from "@app-framework/app-config";

export const appConfig = defineConfig({
  public: {
    APP_NAME: { kind: "string", default: "Application" },
  },
});

export function loadAppConfig(env: EnvSource = process.env) {
  return loadPublicConfig(appConfig, env);
}
