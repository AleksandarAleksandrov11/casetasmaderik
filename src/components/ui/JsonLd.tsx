import type { Graph } from 'schema-dts';

/** Inserta JSON-LD escapando "<" para evitar inyecciones. */
export function JsonLd({ data }: { data: Graph }) {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
    />
  );
}
