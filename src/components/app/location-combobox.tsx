import { useId, useState } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export function LocationCombobox({ label, value, options, onSelect, onQuery, disabled, error }: {
  label: string; value: string; options: { id: string; name: string }[];
  onSelect: (id: string, name: string) => void; onQuery: (query: string) => void; disabled?: boolean; error?: string;
}) {
  const id = useId();
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const choose = (index: number) => {
    const option = options[index];
    if (!option) return;
    onSelect(option.id, option.name);
    setOpen(false);
  };
  return <div className="relative grid gap-1.5">
    <label htmlFor={id} className="text-sm font-medium">{label} *</label>
    <Input id={id} role="combobox" aria-autocomplete="list" aria-expanded={open} aria-controls={`${id}-list`} aria-activedescendant={open && options[active] ? `${id}-${active}` : undefined} aria-invalid={Boolean(error)} aria-describedby={error ? `${id}-error` : undefined}
      disabled={disabled} value={value} onFocus={() => setOpen(true)} onBlur={() => setOpen(false)}
      onChange={(e) => { onQuery(e.target.value); setActive(0); setOpen(true); }}
      onKeyDown={(e) => {
        if (e.key === "ArrowDown" || e.key === "ArrowUp") { e.preventDefault(); setOpen(true); setActive((i) => Math.max(0, Math.min(options.length - 1, i + (e.key === "ArrowDown" ? 1 : -1)))); }
        if (e.key === "Enter" && open) { e.preventDefault(); choose(active); }
        if (e.key === "Escape") { e.preventDefault(); e.stopPropagation(); setOpen(false); }
      }} />
    {open && <div id={`${id}-list`} role="listbox" aria-label={`${label} suggestions`} className="absolute top-full z-50 mt-1 max-h-40 w-full overflow-y-auto rounded-md border bg-popover p-1 shadow-sm">
      {options.length ? options.map((o, i) => <Button key={o.id} id={`${id}-${i}`} role="option" aria-selected={i === active} variant={i === active ? "secondary" : "ghost"} className="h-auto w-full justify-start whitespace-normal text-left text-xs" onMouseDown={(e) => e.preventDefault()} onClick={() => choose(i)}>{o.name}</Button>) : <p className="p-2 text-xs text-muted-foreground">No matching locations. Select another demo suggestion; verified data is not loaded.</p>}
    </div>}
    {error && <p id={`${id}-error`} role="alert" className="text-xs text-destructive">{error}</p>}
  </div>;
}