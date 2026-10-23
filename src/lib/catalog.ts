import products from "@/data/products.json";
import categorias from "@/data/categorias.json";
import modelos from "@/data/modelos.json";

export type Product = {
  id: number; codigo: string; descripcion: string; modelo: string;
  cat1: string; cat1Slug: string; cat2: string; cat2Slug: string; marca: string;
  refs: string[]; img: string | null; imgLocal: boolean; precio: number | null;
  modelos: string[]; sivo: string; aplicacionOld: string;
};
export type Sub = { slug: string; nombre: string; n: number };
export type Categoria = { slug: string; nombre: string; n: number; sub: Sub[] };
export type Modelo = { slug: string; nombre: string; n: number };

export const PRODUCTS = products as Product[];
export const CATEGORIAS = categorias as Categoria[];
export const MODELOS = modelos as Modelo[];
export const SHOW_PRICES = process.env.NEXT_PUBLIC_SHOW_PRICES !== "0";
export const TIENDA = process.env.NEXT_PUBLIC_TIENDA_URL || "https://rivecar.sivo.cl";

const byCodigo = new Map(PRODUCTS.map((p) => [p.codigo, p]));
export function getProduct(codigo: string) { return byCodigo.get(decodeURIComponent(codigo)); }
export function getCategoria(slug: string) { return CATEGORIAS.find((c) => c.slug === slug); }
export function getSub(cat: string, sub: string) { return getCategoria(cat)?.sub.find((s) => s.slug === sub); }
export function getModelo(slug: string) { return MODELOS.find((m) => m.slug === slug); }
export function productsByCat(slug: string, sub?: string) {
  return PRODUCTS.filter((p) => p.cat1Slug === slug && (!sub || p.cat2Slug === sub));
}
export function productsByModelo(slug: string) { return PRODUCTS.filter((p) => p.modelos.includes(slug)); }
export function related(p: Product, limit = 8): Product[] {
  const same = PRODUCTS.filter((q) => q.codigo !== p.codigo && q.cat2Slug === p.cat2Slug && q.cat1Slug === p.cat1Slug);
  const shared = same.filter((q) => q.modelos.some((m) => p.modelos.includes(m)));
  const pool = shared.length >= limit ? shared : [...shared, ...same.filter((q) => !shared.includes(q))];
  return pool.slice(0, limit);
}
export function clp(n: number | null) {
  return n == null ? "" : "$" + n.toLocaleString("es-CL");
}
export const STATS = {
  fichas: PRODUCTS.length,
  oem: PRODUCTS.filter((p) => p.refs.length).length,
  fotos: PRODUCTS.filter((p) => p.img).length,
  modelos: MODELOS.length,
  categorias: CATEGORIAS.length,
};
export const SUCURSALES = [
  { nombre: "Maipú · Casa Matriz", direccion: "Primo de Rivera #733 C, Américo Vespucio", ciudad: "Maipú, Santiago", telefono: "(56-2) 2323 2139" },
  { nombre: "Talagante", direccion: "21 de Mayo #1430", ciudad: "Talagante, Santiago", telefono: "(56-2) 2838 2193 / 2815 5641" },
  { nombre: "Talca", direccion: "Avenida 2 Sur #1610", ciudad: "Talca, Región del Maule", telefono: "(56-71) 259 3406" },
  { nombre: "Coquimbo", direccion: "Avenida Miraflores #685", ciudad: "Coquimbo", telefono: "(56-2) 2312 5793" },
  { nombre: "Concepción", direccion: "Camino a Penco, calle 1 lote 10, Fundo Landa", ciudad: "Concepción", telefono: "+56 9 5013 2901 / +56 9 4919 6910" },
];
export const HORARIO = "Lunes a viernes 9:00 a 17:45 · Sábado 9:45 a 13:00";
