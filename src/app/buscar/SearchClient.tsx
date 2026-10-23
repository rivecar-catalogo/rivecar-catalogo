"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import MiniSearch from "minisearch";
import { track } from "@/lib/analytics";
import Img from "@/components/Img";

type Row = { c: string; d: string; m: string; b: string; f: string; r: string; i: string; p: number };
const clp = (n: number) => "$" + n.toLocaleString("es-CL");

const norm = (s: string) =>
  (s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
/** Para códigos: quita puntos, guiones y espacios. "006.888.08.03" → "0068880803" */
const code = (s: string) => norm(s).replace(/[^a-z0-9]/g, "");

let cache: { rows: Row[]; ms: MiniSearch<Row & { id: number; codes: string }> } | null = null;

async function load() {
  if (cache) return cache;
  const rows: Row[] = await fetch("/data/index.json").then((r) => r.json());
  const ms = new MiniSearch<Row & { id: number; codes: string }>({
    fields: ["d", "m", "b", "f", "codes"],
    storeFields: ["c"],
    processTerm: (t) => norm(t),
    searchOptions: { prefix: true, fuzzy: 0.15, combineWith: "AND", boost: { codes: 4, d: 2 } },
  });
  ms.addAll(rows.map((r, id) => ({ ...r, id, codes: [r.c, r.r].filter(Boolean).join(" ") })));
  cache = { rows, ms };
  return cache;
}

export default function SearchClient() {
  const sp = useSearchParams();
  const q = sp.get("q") ?? "";
  const [data, setData] = useState<typeof cache>(null);
  const [fam, setFam] = useState<string>("");
  const [shown, setShown] = useState(48);
  const tracked = useRef("");

  useEffect(() => {
    load().then(setData);
  }, []);
  useEffect(() => {
    setShown(48);
    setFam("");
  }, [q]);

  const results = useMemo(() => {
    if (!data || !q.trim()) return [] as Row[];
    const { rows, ms } = data;
    const cq = code(q);
    // 1) coincidencia por código exacta o por prefijo/contenido, en cualquier campo de código
    const byCode = cq.length >= 3
      ? rows.filter((r) => [r.c, r.r].some((x) => x && code(x).includes(cq)))
      : [];
    const seen = new Set(byCode.map((r) => r.c));
    // 2) búsqueda por texto
    const byText = ms.search(q).map((h) => rows[h.id as number]).filter((r) => r && !seen.has(r.c));
    return [...byCode, ...byText];
  }, [data, q]);

  useEffect(() => {
    if (!data || !q.trim() || tracked.current === q) return;
    tracked.current = q;
    track(results.length ? "busqueda" : "busqueda_sin_resultado", { q, n: results.length });
  }, [data, q, results.length]);

  const fams = useMemo(() => {
    const c = new Map<string, number>();
    results.forEach((r) => c.set(r.f, (c.get(r.f) || 0) + 1));
    return [...c.entries()].sort((a, b) => b[1] - a[1]);
  }, [results]);
  const filtered = fam ? results.filter((r) => r.f === fam) : results;

  if (!q.trim()) return <p className="text-muted">Escribe un número de parte, código o nombre para buscar.</p>;
  if (!data) return <p className="text-muted">Cargando catálogo…</p>;

  return (
    <div>
      <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
        <h1 className="text-2xl font-extrabold text-navy">
          {results.length.toLocaleString("es-CL")} resultado{results.length === 1 ? "" : "s"} para <span className="text-red">“{q}”</span>
        </h1>
      </div>
      {results.length === 0 ? (
        <div className="card p-6 bg-pink">
          <p className="font-semibold text-navy">No encontramos ese código en el catálogo publicado.</p>
          <p className="text-sm text-ink mt-1">Revisa puntos y guiones (la búsqueda los ignora), o envíanos el código por WhatsApp: muchas piezas se pueden pedir aunque no estén en la ficha pública.</p>
          <a className="btn-red mt-4" href={`https://wa.me/${process.env.NEXT_PUBLIC_WHATSAPP || ""}?text=${encodeURIComponent(`Hola Rivecar, busco el repuesto: ${q}`)}`} target="_blank" rel="noopener">Consultar por WhatsApp</a>
        </div>
      ) : (
        <>
          {fams.length > 1 && (
            <div className="flex flex-wrap gap-2 mb-5">
              <button className={`chip ${!fam ? "on" : ""}`} onClick={() => setFam("")}>Todas · {results.length}</button>
              {fams.slice(0, 12).map(([f, n]) => (
                <button key={f} className={`chip ${fam === f ? "on" : ""}`} onClick={() => setFam(f)}>{f.toLowerCase()} · {n}</button>
              ))}
            </div>
          )}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {filtered.slice(0, shown).map((r) => (
              <Link key={r.c} href={`/producto/${encodeURIComponent(r.c)}`} className="card overflow-hidden hover:shadow-md transition flex flex-col">
                <div className="aspect-[4/3] bg-tint grid place-items-center overflow-hidden">
                  <Img src={r.i || null} alt={r.d} className="w-full h-full object-contain p-2" />
                </div>
                <div className="p-3 flex flex-col gap-1">
                  <div className="text-[11px] text-muted uppercase tracking-wider">{r.f}</div>
                  <div className="font-semibold text-navy leading-snug">{r.d}</div>
                  <div className="mono text-sm">{r.c}{r.r ? <span className="text-muted"> · {r.r.split(" ")[0]}</span> : null}</div>
                  {r.m ? <div className="text-xs text-muted line-clamp-2">{r.m}</div> : null}
                  {r.p ? <div className="pt-1 font-bold text-navy">{clp(r.p)} <span className="text-xs text-muted font-normal">IVA incl.</span></div> : null}
                </div>
              </Link>
            ))}
          </div>
          {filtered.length > shown && (
            <div className="text-center mt-6">
              <button className="btn-ghost" onClick={() => setShown(shown + 48)}>Mostrar más ({filtered.length - shown} restantes)</button>
            </div>
          )}
        </>
      )}
    </div>
  );
}
