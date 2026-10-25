"use client";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main id="main">
      <h1>Something went wrong</h1>
      <p>This page could not be displayed.</p>
      {error.digest ? <p>Reference: {error.digest}</p> : null}
      <button type="button" onClick={() => reset()}>
        Try again
      </button>
    </main>
  );
}
