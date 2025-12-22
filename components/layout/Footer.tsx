// Footer component (presentational)
// Purpose: Reusable footer aligned with PrepVault design system

export default function Footer() {
  return (
    <footer className="py-6 px-6">
      <div className="max-w-6xl mx-auto text-sm text-secondary-text">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-3">
          <div className="font-display font-bold text-white">PrepVault</div>
          <div className="text-sm text-secondary-text">Curated exam-focused resources — placeholder tagline</div>
        </div>
      </div>
    </footer>
  );
}
