export default function HomePage() {
  return (
    <main className="max-w-3xl mx-auto px-6 py-24">
      <h1 className="text-4xl font-bold text-zinc-900">WhatsApp MCP for macOS</h1>
      <p className="mt-4 text-lg text-zinc-600">
        MCP server that drives the native WhatsApp desktop app through macOS accessibility APIs.
      </p>
      <ul className="mt-8 space-y-2 text-teal-700">
        <li>
          <a href="/t/npm-how-to-update-package">
            Guide: updating the npm package the right way
          </a>
        </li>
      </ul>
    </main>
  );
}
