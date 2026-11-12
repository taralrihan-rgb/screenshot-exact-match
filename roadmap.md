# Roadmap

## Pilot implementation
- [x] Centralized application status cards, filters, and editable tracking statuses
- [x] Required demo Taluka/Village autocomplete and safe project editing
- [x] Atomic template checklist creation and ordered Pre-Approval task workflow
- [x] Automated and browser verification; document data and persistence limitations

- [x] Projects: create-project form with validation (already working)
- [x] Dashboard: counts derived from shared demo data (already working)
- [x] Checklist: edit requirement workflow status and responsible person (applicability stays separate)
- [x] Tasks: change responsible person, add project filter, keep overdue logic untouched
- [x] Verify: 20 tests pass, automatic build OK, lint 0 errors / 7 warnings, browser pilot flows pass
- [x] Report: configuration, simulation, mapping and persistence limitations recorded in PILOT-NOTES.md

## Status after polish pass
- [x] Checklist: status + responsible editable, verified in browser
- [x] Tasks: reassign + project filter, verified in browser
- [x] Create project validation + success, verified in browser
- [x] Tests (1/1), tsgo typecheck, build OK

## Frontend hardening & backend readiness
- [x] Data-access layer (repository.ts), Zod validation, versioned templates, typed activity events, org/user model
- [x] Real-date overdue metrics with injected-today tests; DEMO_TODAY fixture-only
- [x] Honest document register: fake upload removed, metadata-only registration
- [x] .env git-ignore + .env.example; no credentials in repo
- [x] 31 tests pass, typecheck clean, lint 0 errors, browser verification of core flows
- [ ] Deferred to backend: persistence, auth, RLS, real file storage, four-role permission model
