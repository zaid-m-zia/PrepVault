export default function PrivacyPage() {
  return (
    <section className="mx-auto max-w-4xl px-6 py-12 sm:px-8 lg:px-10">
      <div className="rounded-3xl border border-gray-200 bg-white/90 p-8 shadow-sm dark:border-slate-800 dark:bg-slate-900/70 sm:p-10">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-indigo-600 dark:text-indigo-400">Privacy</p>
        <h1 className="mt-3 text-3xl font-display font-semibold text-slate-900 dark:text-white">Privacy Policy</h1>
        <p className="mt-4 text-sm leading-6 text-slate-600 dark:text-slate-400">
          PrepVault is built to help engineering students discover resources, opportunities, and collaborators. This page explains, at a high level, how platform data is handled.
        </p>

        <div className="mt-8 space-y-6 text-sm leading-6 text-slate-600 dark:text-slate-400">
          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">What we collect</h2>
            <p className="mt-2">Account details, profile information, saved activity, and usage signals needed to operate product features such as recommendations, messaging, and search.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">How data is used</h2>
            <p className="mt-2">We use collected data to deliver core product functionality, improve discovery, personalize the experience, and maintain platform security.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Data sharing</h2>
            <p className="mt-2">PrepVault does not sell personal information. Data may be processed by service providers required to host, secure, and operate the platform.</p>
          </section>

          <section>
            <h2 className="text-base font-semibold text-slate-900 dark:text-white">Contact</h2>
            <p className="mt-2">Questions about privacy can be sent to hello@prepvault.app.</p>
          </section>
        </div>
      </div>
    </section>
  )
}