# Agents

Bun monorepo with packages: `client` (Vite+React), `server` (PartyKit), `shared`, `common` (shared React/Jotai code), `expo` (React Native / Expo SDK 54).

## Commands
Root typecheck: `bun run typecheck` (all packages)
Single package typecheck: `bun --filter @fake-goes-party/<name> typecheck`
Client dev/build/lint: `bun --filter @fake-goes-party/client dev|build|lint`
Server dev/deploy: `bun --filter @fake-goes-party/server dev|deploy`
Tests live in `packages/shared/src/__tests__` and `packages/client/src/__tests__` and use `bun:test`.
Run shared/client tests: `bun run test` from repo root (targets packages/shared and packages/client)
Run a single test file: `bun test packages/shared/src/__tests__/logic/scoring.test.ts`
Expo tests use jest (jest-expo preset): `bun run test:expo` from repo root

## Architecture
`packages/client`: React UI, Jotai atoms in `src/atoms`, UI flows in `src/components`.
`packages/server`: PartyKit rooms in `src/parties`, entry at `src/index.ts`.
`packages/shared`: game state machine, schemas, and scoring logic shared by client/server.
Shared APIs: `src/interfaces` and `src/remote`/`src/local` authorities.
No database layer; state is in-memory/PartyKit room state.

## Style
TypeScript ESM; favor named exports and explicit types in shared logic.
Prefer schema validation via Zod in `shared/src/schemas`.
Keep PartyKit handlers and machine transitions pure/deterministic.
Use Jotai atoms for client state; avoid ad-hoc global state.
