# Audit Findings Remediation Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Resolve the high- and medium-priority findings from `AUDIT-REPORT.md`, restore the blog-web lint gate, and verify the current architecture with tests.

**Architecture:** Keep the existing Spring Boot, Next.js, Docker Compose, Redis, and WebSocket architecture. Apply targeted fixes at trust boundaries and configuration edges, then add focused tests instead of introducing a framework migration or multi-instance messaging layer.

**Tech Stack:** Spring Boot 3.4, Java 21, MyBatis-Plus, Redis Lua scripts, Spring WebSocket, Next.js 16, React 19, TypeScript, pnpm, GitHub Actions.

---

### Task 1: Establish Baseline and Test Targets

**Files:**
- Modify: `AUDIT-REPORT.md` only if verification results change
- Test: existing `blog-service/src/test`, `blog-admin`, and `blog-web` lint commands

- [x] Run `blog-service: ./gradlew test`, `blog-admin: pnpm run lint`, and `blog-web: pnpm run lint`; record the baseline without changing source.
- [x] Locate existing Java test conventions for filters, interceptors, plugin factories, and configuration parsing before adding tests.
- [x] Locate existing blog-web test infrastructure; no frontend test runner was added, so TypeScript/lint/build remain the frontend gates.

### Task 2: Harden Revalidate and Deployment Configuration

**Files:**
- Modify: `blog-web/src/app/api/revalidate/route.ts`
- Modify: `blog-service/src/main/resources/application-docker.yml`
- Modify: `docker-compose.yml`
- Modify: `README.md` and deployment docs containing required environment variables

- [x] Make the route accept only `POST` and `x-revalidate-token`; reject query-string secrets and unsupported methods.
- [x] Remove the weak `change-me` default and make Docker startup require a non-empty shared `REVALIDATE_TOKEN` for both `blog-service` and `blog-web`.
- [x] Preserve tag validation and return explicit 400/401/405/503 responses.
- [x] Add explicit Compose/env documentation proving both services receive the same variable; Docker runtime validation remains pending because Compose is unavailable locally.

### Task 3: Fix Trusted Client IP and Rate-Limit Counting

**Files:**
- Modify: `blog-service/src/main/java/com/blog/shared/util/IpUtil.java`
- Modify: `blog-service/src/main/java/com/blog/infrastructure/filter/GlobalRateLimitFilter.java` if configuration wiring is required
- Modify: `blog-service/src/main/java/com/blog/infrastructure/security/RateLimitManager.java`
- Modify: relevant `application*.yml` security settings
- Test: focused Java tests for trusted proxy parsing and same-millisecond requests

- [x] Add an explicit trusted-proxy condition before accepting forwarded headers; otherwise use `request.getRemoteAddr()`.
- [x] Keep the current proxy deployment usable by documenting/configuring the trusted proxy network rather than trusting arbitrary headers.
- [x] Add a unique request member to the Redis sliding-window Lua call so two requests in one millisecond cannot overwrite one another.
- [x] Test direct untrusted headers and trusted proxy headers; Redis integration for same-timestamp additions remains unexecuted.

### Task 4: Secure WebSocket Sessions and Authentication Boundaries

**Files:**
- Modify: `blog-service/src/main/java/com/blog/infrastructure/interceptor/WebSocketHandshakeInterceptor.java`
- Modify: `blog-service/src/main/java/com/blog/bootstrap/config/WebSocketConfig.java`
- Modify: `blog-service/src/main/java/com/blog/infrastructure/websocket/NotificationWebSocketHandler.java`
- Modify: `blog-service/src/main/java/com/blog/bootstrap/config/SaTokenConfig.java`
- Modify: `blog-service/src/main/java/com/blog/infrastructure/interceptor/ApiPermissionInterceptor.java`
- Test: WebSocket/session and `/api/monitoring` authorization tests

- [x] Stop logging complete WebSocket URIs and keep only safe metadata such as session ID and user ID.
- [x] Replace wildcard origins with configurable allowed origins and a local-only default.
- [x] Change user session storage to support multiple sessions and remove only the closing session.
- [x] Add `/api/monitoring/**` to the intended authentication policy and make missing `UserContext` return an authentication error rather than a null-pointer 500.
- [x] Test duplicate-session and close-order behavior; unauthenticated/role HTTP tests remain a deployment follow-up.

### Task 5: Add SSR Request Limits and Safer Server Sanitization

**Files:**
- Modify: `blog-web/src/lib/api/server.ts`
- Modify: `blog-web/src/lib/utils/sanitize.ts` or add a server-only sanitizer module if the existing client bundle must remain unchanged
- Modify: `blog-web/package.json` and `blog-web/pnpm-lock.yaml` only if a server-only allowlist package is required
- Test: focused TypeScript tests or executable sanitizer fixtures if the repository already supports them

- [x] Add a default SSR timeout with caller override and preserve an already-aborted external signal.
- [x] Keep client-side DOM sanitization separate from server-only sanitization so the Node allowlist implementation is not bundled into the browser unnecessarily.
- [ ] Add dedicated sanitizer fixtures; build, TypeScript, and lint validation pass.

### Task 6: Restore blog-web Lint Without Behavior Regressions

**Files:**
- Modify only files reported by `blog-web pnpm run lint`
- Test: `cd blog-web && pnpm run lint`

- [x] Replace `any` with the narrowest existing domain types or `unknown` plus runtime guards.
- [x] Move render-time `Math.random()` calls to stable initialization or event-time calculation.
- [x] Refactor synchronous effect state updates where possible; preserve localStorage/theme/navigation behavior.
- [x] Fix hook dependency and declaration-order errors, then remove unused variables/imports.
- [x] Re-run lint until zero errors and zero warnings under the repository command.

### Task 7: Make Schema, Pool, Metrics, and CI Gates Accurate

**Files:**
- Modify: `blog-service/src/main/resources/schema.sql`
- Modify: `blog-service/src/main/resources/application-docker.yml`
- Modify: `blog-service/src/main/java/com/blog/infrastructure/metrics/BlogMetrics.java`
- Modify: article command service call sites and monitoring configuration as needed
- Modify: `.github/workflows/ci.yml`
- Test: backend tests, schema/config checks, and CI YAML inspection

- [x] Replace the duplicate-column `ALTER TABLE` behavior with a database-compatible conditional migration and disable global error swallowing.
- [x] Reduce or explicitly coordinate the Docker Hikari pool against MySQL `max-connections=20`, leaving operational headroom.
- [x] Add article update/delete counters and connect production article flows; distinguish test-controller metrics from production metrics.
- [x] Upgrade/fix Action versions, pin Trivy to the v0.28.0 commit SHA, and configure Trivy `exit-code` plus severity policy.

### Task 8: Verify and Update the Audit Report

**Files:**
- Modify: `AUDIT-REPORT.md`
- Test: backend tests, both frontend lint commands, configuration checks, and any new focused tests

- [x] Run all available verification commands from the current worktree and capture exact outcomes.
- [x] Update issue statuses, scores, current architecture/function status, and release criteria based only on fresh evidence.
- [x] Ensure all report links remain repository-relative and all issue counts match their tables.
- [x] Run `git diff --check` and confirm no unrelated generated files changed; Docker Compose runtime validation is unavailable locally.
