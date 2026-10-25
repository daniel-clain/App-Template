import Link from "next/link";

export default function NotFound() {
  return (
    <main id="main">
      <h1>Page not found</h1>
      <p>That page is not part of this application.</p>
      <p>
        <Link href="/">Back to the start</Link>
      </p>
    </main>
  );
}
