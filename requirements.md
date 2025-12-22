# Project Requirements — PrepVault

This file lists the exact dependencies and a safe initialization script used to bootstrap the project environment.

Node / Runtime
- Node.js >= 18.x (LTS recommended)

Primary packages (pinned in package.json)
- next ^14.0.0
- react ^18.2.0
- react-dom ^18.2.0
- typescript ^5.6.0
- tailwindcss ^3.5.0
- postcss ^8.4.0
- autoprefixer ^10.4.0
- eslint ^8.45.0
- eslint-config-next ^14.0.0
- prettier ^3.0.0
- vitest ^1.2.0
- @testing-library/react ^14.0.0
- @playwright/test ^1.40.0
- prisma ^5.10.0
- @prisma/client ^5.10.0

Why this file exists
- It documents the packages and versions to keep installs reproducible.
- It is used alongside `package.json` so new contributors can inspect versions and rationale before running installs.

Safe initialization
- Use `scripts/setup.sh` (provided) to perform an idempotent, muted setup (this script is tolerant of missing optional components and designed to be safe to run more than once).

Notes
- No auth, database, or AI libraries are included in the scaffold to keep the foundation clean and focused on frontend-first development.
- Versions were chosen to balance stability and modern features; they can be revised later if required.
