import Link from "next/link";
import type { Product } from "@/lib/catalog";
import { clp, SHOW_PRICES } from "@/lib/catalog";
import Img from "./Img";

export default function ProductCard({ p }: { p: Product }) {
  return (
    <Link href={`/producto/${encodeURIComponent(p.codigo)}`} className="card overflow-hidden hover:shadow-md transition flex flex-col">
      <div className="aspect-[4/3] bg-tint grid place-items-center overflow-hidden">
        <Img src={p.img} alt={p.descripcion} className="w-full h-full object-contain p-2" />
      </div>
      <div className="p-3 flex-1 flex flex-col gap-1">
        <div className="text-[11px] text-muted uppercase tracking-wider">{p.cat2 || p.cat1}</div>
        <div className="font-semibold text-navy leading-snug">{p.descripcion}</div>
        <div className="mono text-sm text-ink">{p.codigo}{p.refs[0] ? <span className="text-muted"> · {p.refs[0]}</span> : null}</div>
        {p.modelo ? <div className="text-xs text-muted line-clamp-2">{p.modelo}</div> : null}
        {SHOW_PRICES && p.precio ? <div className="mt-auto pt-1 font-bold text-navy">{clp(p.precio)} <span className="text-xs text-muted font-normal">IVA incl.</span></div> : null}
      </div>
    </Link>
  );
}
