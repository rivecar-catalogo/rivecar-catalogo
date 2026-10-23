import Link from "next/link";
import { notFound } from "next/navigation";
import type { Metadata } from "next";
import { getProduct, related, MODELOS, clp, SHOW_PRICES } from "@/lib/catalog";
import ProductCard from "@/components/ProductCard";
import QuoteButton from "@/components/QuoteButton";
import Img from "@/components/Img";

type Props = { params: Promise<{ codigo: string }> };

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const p = getProduct((await params).codigo);
  if (!p) return { title: "Producto no encontrado" };
  return {
    title: `${p.descripcion} · ${p.codigo}${p.refs[0] ? ` · ${p.refs[0]}` : ""}`,
    description: `${p.descripcion}. ${p.cat2 || p.cat1}. ${p.modelo ? `Aplicación: ${p.modelo}.` : ""} Repuesto Mercedes-Benz en Rivecar.`,
  };
}

export default async function ProductoPage({ params }: Props) {
  const p = getProduct((await params).codigo);
  if (!p) notFound();
  const rel = related(p);
  const modelos = MODELOS.filter((m) => p.modelos.includes(m.slug));
  return (
    <div className="mx-auto max-w-6xl px-4 py-8">
      <nav className="text-xs text-muted mb-4 flex flex-wrap gap-1">
        <Link href="/" className="hover:text-navy">Inicio</Link><span>›</span>
        <Link href={`/categoria/${p.cat1Slug}`} className="hover:text-navy">{p.cat1}</Link>
        {p.cat2 ? <><span>›</span><Link href={`/categoria/${p.cat1Slug}/${p.cat2Slug}`} className="hover:text-navy">{p.cat2}</Link></> : null}
        <span>›</span><span className="text-ink">{p.codigo}</span>
      </nav>
      <div className="grid gap-8 md:grid-cols-[1fr_1.1fr]">
        <div className="card aspect-square bg-tint grid place-items-center overflow-hidden">
          <Img src={p.img} alt={p.descripcion} className="w-full h-full object-contain p-4" />
        </div>
        <div>
          <div className="eyebrow text-red">{p.cat2 || p.cat1}</div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-navy mt-1">{p.descripcion}</h1>
          <dl className="mt-5 grid grid-cols-[auto_1fr] gap-x-4 gap-y-2 text-sm">
            <dt className="text-muted">Código Rivecar</dt><dd className="mono font-semibold">{p.codigo}</dd>
            {p.refs.length > 0 && (<><dt className="text-muted">Número de parte / referencias</dt><dd className="mono font-semibold">{p.refs.join(" · ")}</dd></>)}
            {p.marca && (<><dt className="text-muted">Marca / origen</dt><dd>{p.marca}</dd></>)}
            {p.modelo && (<><dt className="text-muted">Modelo / aplicación</dt><dd>{p.modelo}</dd></>)}
            {!p.modelo && p.aplicacionOld && (<><dt className="text-muted">Aplicación (catálogo histórico)</dt><dd>{p.aplicacionOld}</dd></>)}
          </dl>
          {modelos.length > 0 && (
            <div className="mt-4 flex flex-wrap gap-2">
              {modelos.map((m) => <Link key={m.slug} href={`/modelo/${m.slug}`} className="chip">{m.nombre}</Link>)}
            </div>
          )}
          <div className="mt-6 card p-4 bg-tint">
            <div className="flex items-baseline justify-between gap-3 flex-wrap">
              {SHOW_PRICES && p.precio ? (
                <span className="text-2xl font-extrabold text-navy">{clp(p.precio)} <span className="text-sm text-muted font-normal">IVA incl.</span></span>
              ) : (
                <span className="font-semibold text-navy">Precio y disponibilidad</span>
              )}
              <span className="text-sm text-muted">Disponibilidad se confirma en la tienda o por cotización</span>
            </div>
            <p className="text-sm text-muted mt-1">Retiro en cualquiera de las 5 sucursales o despacho a todo Chile.</p>
            <div className="mt-4 flex flex-wrap gap-3 items-center">
              <a className="btn-red h-11" href={`${p.sivo}?utm_source=catalogo&utm_medium=ficha&utm_campaign=prototipo`} target="_blank" rel="noopener">Comprar en la tienda Rivecar</a>
              <QuoteButton codigo={p.codigo} descripcion={p.descripcion} oem={p.refs[0] || ""} />
            </div>
          </div>
        </div>
      </div>
      {rel.length > 0 && (
        <section className="mt-12">
          <h2 className="text-xl font-extrabold text-navy mb-4">Relacionados en {(p.cat2 || p.cat1).toLowerCase()}</h2>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {rel.map((r) => <ProductCard key={r.codigo} p={r} />)}
          </div>
        </section>
      )}
    </div>
  );
}
