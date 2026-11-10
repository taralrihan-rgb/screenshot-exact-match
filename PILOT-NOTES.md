# Realtify pilot configuration and limitations

## Delivered
- Six approval workflow cards filter a shared application/project-tracking list, with an Unmapped filter and a clear action. Project and approval filters use the same mapping. Status changes update shared counts and activity.
- Required Taluka/Village selections, keyboard-searchable suggestions, validation, and a location edit dialog preserve the existing Location field and checklist progress.
- Creation generates the project, configured checklist, Pre-Approval tasks, and activity in one in-memory state transition. Checklist applicability remains Needs review and status starts Needs verification; nothing is automatically legally satisfied.
- Pre-Approval has the exact four ordered tracking steps. Status, assignee, and target date use the shared task store. Later-stage projects are not restarted.

## Application status mapping
The six exact labels are separate, especially Rejected and Rejected Proposal. Under review maps to In Process as an internal workflow equivalence only. Draft, Submitted, Query raised, Granted (recorded), missing and unknown values remain Unmapped; they are displayed with their raw value. Counts include each approval record, plus one project-only tracking row for projects without approvals. A project with two applications can therefore appear in two status groups. No government application records were invented and there is no BPMS connection.

## Location data
No reliable administrative dataset existed or was supplied. `src/lib/locations.ts` exposes a schema and search functions for district -> taluka -> village IDs. Fixtures are a small **fictional** test dataset, not real administrative names, not official and not exhaustive. Only Maharashtra-scoped records are returned. District is derived from the selected Taluka and is not a third mandatory field. Replace the fixture dataset with a verified source and keep stable IDs and provenance; no geocoding subscription or runtime external service is needed.

## Checklist configuration
`CHECKLIST_TEMPLATES` in `src/lib/demo-data.ts` is the small configuration mechanism. Residential (title/site plan), Commercial (title/zoning), and Plotted development (layout/drainage) are different fictional templates adapted from existing demo examples. None is customer-authoritative. Mixed-use intentionally has no template and displays Checklist needs configuration. Each template item supports a key, name, category, notes, optional stage, and required/optional template flag. The project owner is the default assignee. Required-for-template never means legally required. Existing projects are never backfilled automatically. Project type editing is intentionally unavailable rather than silently rewriting completed work; only location editing was added.

## Persistence and security
All records remain in React memory. Navigation and editing preserve them; refresh restores original demo records, so newly created projects disappear rather than duplicate. This is not permanent storage and does not meet a durable real pilot's data-retention needs. There is no authentication, access control or trustworthy identity audit; activity is You (demo), with the existing fixed demo date 2026-10-19. No sensitive data should be entered. Documents remain simulated metadata only; signatures, payments, submissions and government verification are not performed. No new services, subscriptions, database, authentication, upload facility, or deployment were introduced.

## Information required from the consultancy
1. Verified Maharashtra District/Taluka/Village source with IDs, relationships, geographic scope, provenance, date and reuse permission.
2. Actual project types and each type's document list: stable item key, exact label, notes, applicable stages, required versus optional, default responsible role/person, and official source references.
3. Confirmed meanings for the six application statuses and how existing Draft, Submitted, Query raised and Granted records should map, if at all.
4. Review rules for any future project-type change and how existing completed checklist items must be retained.

## Verification
Available Vitest tests and lint were executed; detailed final results are recorded in the completion report. Production build/typecheck are performed by the platform automatically, not manually invoked. Browser verification covered immediate checklist creation, no-template creation, validation, no-match/keyboard location selection, location edit readback, no duplicate checklist after navigation/editing, step completion/blockers/target dates, shared checklist/tasks/reports, all six card counts/filters, status-change propagation, reload reset, all eight existing pages, and mobile width. No browser page errors occurred. The supplied BPMS screenshot was not available in this upload, so the written visual brief guided the existing-style cards.