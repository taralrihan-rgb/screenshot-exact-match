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
