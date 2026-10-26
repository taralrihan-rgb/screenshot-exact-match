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
- All demo records live in `src/lib/demo-data.ts` and are served through the in-memory `StoreProvider` (`src/lib/store.tsx`); swap the store internals for backend calls later so pages stay unchanged.
- Workflow progress must never be presented as legal compliance; requirement applicability is never inferred automatically.
- Project creation computes a validated project/checklist/task bundle before one store state transition; editing never regenerates existing checklist work.
- Checklist templates and Pre-Approval step labels are configured with demo data; Pre-Approval steps use the shared task model so all views read the same status and assignment.
- Administrative suggestions use ID-linked district/taluka/village records through the location module; dataset provenance must remain visible and only Maharashtra-scoped suggestions may be selected.
- Application workflow mapping is centralized: dashboard counts application records and project-only tracking rows only when no application exists; unknown values remain unmapped rather than defaulting to In Process.
