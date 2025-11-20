**Project**: Thumbnail Service

- **Description**: A small Node + TypeScript service that accepts user image uploads, stores the original, and generates 300x300 JPEG thumbnails in a background worker. Uses a lightweight SQLite-backed model layer and worker threads for asynchronous image processing.

- [Changelog](./docs/changelog.md)

**Tech Stack**
- **Language**: TypeScript
- **Runtime**: Node.js
- **Web framework**: Express
- **DB / ORM**: SQLite via `sequelize`
- **Image processing**: `sharp`
- **Workers**: `worker_threads` (used to run `src/scripts/resizeImage.ts`)
- **File upload**: `multer`
- **Task scheduling**: `node-cron` (in optional cron services)

**Repository Structure (relevant)**
- `index.ts` : App bootstrap and route mounting
- `src/routes/tasksRoutes.ts` : Upload route (`/api/tasks/upload-image`)
- `src/validators/userImgValidators.ts` : Validation for upload requests
- `src/controllers/*` : Controllers (handles request/response)
- `src/services/database.ts` : Small Sequelize wrapper (SQLite)
- `src/scripts/resizeImage.ts` : Image-resize worker logic
- `src/utils/` : helpers (background task queue, events)
- `src/assets/users/uploaded/` : saved uploaded images
- `src/assets/users/thumbnail/` : generated thumbnails
- `migrations/` and `seeders/` : DB schema + sample data

**How to run (development)**
- Install deps:
  - `npm install`
- Run with `ts-node` (development):
  - `npx ts-node index.ts`
  - or `npm run dev` (if configured)
- Build & run (production-like):
  - `npm run build` (compiles to `dist/`)
  - `npm start`

Environment
- The app reads `PORT` from env. Example: `PORT=3000 npx ts-node index.ts`

**Database**
- SQLite file lives at `sync_async_db.sqlite` (configured in `src/services/database.ts`).
- Migrations and seeders are in `migrations/` and `seeders/`.

**Notes & TODOs**
- Current filename generation omits the original extension — consider preserving extension using `path.extname(file.originalname)`.
- For production, compile TypeScript (`npm run build`) and run workers against compiled JS rather than using `ts-node` in workers.
- Consider strengthening upload validation by checking file signatures (using `file-type` or `sharp`), enforcing size limits, and storing only relative paths in DB.
- The events manager now supports subscribing with an instance context so handlers don't need manual `.bind(...)` at every call-site.

**Testing**
- Run unit tests (if present): `npm test` (this repo uses `jest` in `devDependencies`).

If you want, I can add an expanded example of the expected JSON responses, or patch the multer filename logic to preserve file extensions and use `crypto.randomUUID()` for unique names. Say which one you prefer.
