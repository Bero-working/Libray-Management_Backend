# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository status

- This repository is currently a NestJS starter scaffold plus product/design docs for a university library management system.
- The implemented runtime code is still the default hello-world flow in `src/`; most business behavior is documented, not built yet.
- Treat these docs as the source of truth for upcoming feature work:
  - `docs/SRS.md`
  - `docs/DATABASE_SCHEMA.md`
  - `docs/API_REFERENCE.md`
- The top-level `README.md` is the default Nest starter README and is useful for basic Nest commands, but not for domain behavior.

## Common commands

- Install dependencies: `npm install`
- Start once: `npm run start`
- Start in watch mode: `npm run start:dev`
- Start in debug watch mode: `npm run start:debug`
- Build: `npm run build`
- Run compiled app: `npm run start:prod`
- Lint with autofix: `npm run lint`
- Format TypeScript sources/tests: `npm run format`
- Run unit tests: `npm run test`
- Run unit tests in watch mode: `npm run test:watch`
- Run coverage: `npm run test:cov`
- Run e2e tests: `npm run test:e2e`
- Run a single unit test file: `npx jest src/app.controller.spec.ts`
- Run a single test by name: `npx jest src/app.controller.spec.ts -t "should return \"Hello World!\""`
- Run a single e2e spec file: `npx jest --config ./test/jest-e2e.json test/app.e2e-spec.ts`

## Current implemented structure

- `src/main.ts` bootstraps Nest and listens on `process.env.PORT ?? 3000`.
- `src/app.module.ts` wires a single controller and service.
- `src/app.controller.ts` exposes `GET /`.
- `src/app.service.ts` returns the hello-world response.
- `src/app.controller.spec.ts` is the starter unit test.
- `test/app.e2e-spec.ts` is the starter e2e test using `supertest`.

## Intended backend architecture from the docs

The product docs describe a university library management backend with these domain areas:

1. `auth`
2. `readers` (`DOC_GIA`)
3. `majors` (`CHUYEN_NGANH`)
4. `titles` (`DAU_SACH`)
5. `copies` (`BAN_SAO_SACH`)
6. `loans` (`PHIEU_MUON`)
7. `reports`
8. `staff` (`NHAN_VIEN`)
9. `accounts` (`TAI_KHOAN`)

The SRS explicitly recommends implementing modules in this order: `auth -> readers -> majors -> titles -> copies -> loans -> reports -> admin_users`.

## API shape and domain rules documented for future implementation

- Base API path should be `/api/v1`.
- Authentication is documented as Bearer token based.
- RBAC roles are `ADMIN`, `LIBRARIAN`, and `LEADER`.
- Success responses should use a consistent envelope with `success`, `data`, and optional `meta`.
- Error responses should use `success: false` plus a structured `error` object.
- `so_luong_sach` for a title is documented as a computed value derived from the number of copies, not a persisted canonical column in the current ERD.
- Loan creation and book return must update both `PHIEU_MUON` and `BAN_SAO_SACH` in the same transaction.
- Important business constraints from the docs:
  - a reader can have at most one active unreturned loan at a time
  - only copies in `SAN_SANG` status can be borrowed
  - deleting readers/titles/copies/staff must respect dependency/history rules
  - the docs repeatedly prefer deactivation/locking over hard delete for active business records

## Tooling and configuration notes

- Nest CLI uses `src` as `sourceRoot` and deletes `dist` on rebuild (`nest-cli.json`).
- TypeScript outputs to `dist`, uses `module`/`moduleResolution: nodenext`, enables decorators/metadata, and has `strictNullChecks` enabled (`tsconfig.json`).
- Build config excludes `test`, `dist`, and `**/*spec.ts` (`tsconfig.build.json`).
- Unit-test Jest config lives in `package.json` with `rootDir: "src"` and `testRegex: .*\.spec\.ts$`.
- E2E Jest config lives in `test/jest-e2e.json` and matches `.e2e-spec.ts`.
- ESLint is type-aware via `typescript-eslint` and includes Prettier integration; `npm run lint` modifies files because it runs with `--fix`.
- Prettier is configured for single quotes and trailing commas.

## Working assumptions for future Claude instances

- Do not assume the library-system modules, auth, persistence layer, or API endpoints already exist in code just because they are described in `docs/`.
- When implementing features, reconcile the current scaffold with the docs first; the docs are much more complete than the codebase.
- Keep the English API naming from `docs/API_REFERENCE.md` aligned with the Vietnamese business entities from `docs/SRS.md` and `docs/DATABASE_SCHEMA.md`.
