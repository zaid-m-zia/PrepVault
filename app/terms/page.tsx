export default function TermsPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:px-10">
      <div className="rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Legal</p>
        <h1 className="mt-3 text-3xl font-display font-semibold text-slate-900 dark:text-white">Terms of Service</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
          These terms describe the basic rules for using PrepVault as a platform for academic resources, community collaboration, and opportunity discovery.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-6 text-slate-600 dark:text-slate-400">
          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Acceptable use</h2>
            <p className="mt-2">Users must use the platform responsibly, keep account credentials secure, and avoid posting harmful, unlawful, or misleading content.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Content and ownership</h2>
            <p className="mt-2">Users retain ownership of content they submit, while granting PrepVault permission to host and display that content as needed to operate the service.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Service availability</h2>
            <p className="mt-2">PrepVault may update, modify, or suspend parts of the service to improve reliability, maintain security, or address operational needs.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Support</h2>
            <p className="mt-2">For legal or service-related questions, contact hello@prepvault.app.</p>
          </section>
        </div>
      </div>
    </section>
  )
}