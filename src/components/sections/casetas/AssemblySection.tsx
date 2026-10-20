import { casetasAssembly } from '@/content/casetas';
import { posters } from '@/components/three/posters';
import { InlineStyle } from '@/components/three/InlineStyle';
import { threeCss } from '@/components/three/styles';
import { AssemblyStage } from './three/AssemblyStage';
import { assemblyCss } from './three/assemblyStyles';

/**
 * S3 de /casetas: montaje despiezado en 3D sincronizado con el scroll (fondo
 * tinta). Con movimiento reducido o sin WebGL no se fija: poster de la caseta
 * montada y los tres pasos en lista.
 */
export function AssemblySection() {
  const a = casetasAssembly;
  const p = posters.assembly;
  return (
    <>
      <InlineStyle id="caseta-3d" css={threeCss} />
      <InlineStyle id="caseta-montaje" css={assemblyCss} />
      <AssemblyStage
        steps={a.steps}
        sceneDescription={a.sceneDescription}
        intro={
          <div>
            <p className="label">{a.label}</p>
            <h2 id="montaje-titulo" className="assembly__title text-h2 mt-6">
              {a.title}
            </h2>
            <p className="assembly__text text-lead mt-6 text-mist">{a.text}</p>
          </div>
        }
        poster={
          p ? (
            <picture>
              <source
                type="image/avif"
                srcSet={`${p.srcSm} ${p.smWidth}w, ${p.src} ${p.width}w`}
                sizes="(min-width: 1024px) 55vw, 92vw"
              />
              <img
                src={p.webp}
                srcSet={`${p.webpSm} ${p.smWidth}w, ${p.webp} ${p.width}w`}
                sizes="(min-width: 1024px) 55vw, 92vw"
                width={p.width}
                height={p.height}
                alt=""
                loading="lazy"
                decoding="async"
              />
            </picture>
          ) : null
        }
      />
    </>
  );
}
