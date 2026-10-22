import { casetasAssembly } from '@/content/casetas';
import { InlineStyle } from '@/components/three/InlineStyle';
import { threeCss } from '@/components/three/styles';
import { AssemblyStage } from './three/AssemblyStage';
import { assemblyCss } from './three/assemblyStyles';

/**
 * S3 de /casetas: montaje interactivo sobre fondo tinta. Un control pliega y
 * monta la caseta; los pasos la llevan a cada estado.
 */
export function AssemblySection() {
  const a = casetasAssembly;
  return (
    <>
      <InlineStyle id="caseta-3d" css={threeCss} />
      <InlineStyle id="caseta-montaje" css={assemblyCss} />
      <AssemblyStage
        steps={a.steps}
        labels={a.controls}
        sceneDescription={a.sceneDescription}
        intro={
          <div>
            <p className="label">{a.label}</p>
            <h2 id="montaje-titulo" className="assembly__title text-h2 mt-6">
              {a.title.map((line) => (
                <span key={line} className="block">
                  {line}{' '}
                </span>
              ))}
            </h2>
            <p className="assembly__text text-lead mt-6 text-mist">{a.text}</p>
          </div>
        }
      />
    </>
  );
}
