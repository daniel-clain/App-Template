import type { Metadata } from "next";
import { loadAppConfig } from "../config";

export function generateMetadata(): Metadata {
  const { APP_NAME } = loadAppConfig();

  return {
    description: `${APP_NAME} is a new application.`,
    title: APP_NAME,
  };
}

export default function HomePage() {
  const { APP_NAME } = loadAppConfig();

  return (
    <>
      <header className="site-header">
        <p className="site-name">{APP_NAME}</p>
      </header>
      <main id="main">
        <h1>{APP_NAME}</h1>
        <p>This is a new application. It is ready for its own features.</p>
        <details>
          <summary>About this application</summary>
          <p>The first page is static. Add the behaviour this application needs here.</p>
        </details>
      </main>
      <footer className="site-footer">
        <p>Application starter</p>
      </footer>
    </>
  );
}
