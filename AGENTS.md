<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

## Architecture
- Demo fixtures live in `src/lib/demo-data.ts`; `src/lib/repository.ts` defines the typed read/mutation contract and in-memory adapter, while the React store only binds that contract so pages stay persistence-independent.
- Business logic is centralised: `src/lib/workflow.ts` (bundles, status mapping), `src/lib/validation.ts` (Zod input schemas), `src/lib/templates.ts` (versioned checklist templates), `src/lib/activity.ts` (typed activity events), `src/lib/types.ts` (org/user/role model — the four roles are a deliberate placeholder).
- Overdue/upcoming calculations in `src/lib/metrics.ts` use the real current date with an injectable `today` for tests; `DEMO_TODAY` is fixture-only.
- Workflow progress must never be presented as legal compliance; requirement applicability is never inferred automatically.
- Project creation computes a validated project/checklist/task bundle before one store state transition; editing never regenerates existing checklist work.
- Checklist templates and Pre-Approval step labels are configured with demo data; Pre-Approval steps use the shared task model so all views read the same status and assignment.
- Administrative suggestions use ID-linked district/taluka/village records through the location module; dataset provenance must remain visible and only Maharashtra-scoped suggestions may be selected.
- Application workflow mapping is centralized: dashboard counts application records and project-only tracking rows only when no application exists; unknown values remain unmapped rather than defaulting to In Process.
