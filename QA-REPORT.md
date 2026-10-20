# Informe de QA

Estado: en curso. Este informe se completa al final de la fase 6 con los resultados de las dos pasadas completas.

## Método

- **Automático** (`pnpm qa`): lint, typecheck, tests unitarios, build de QA (con las redirecciones y cabeceras de `vercel.json` aplicadas en local), e2e, matriz de capturas (8 rutas × 18 tamaños), axe, enlaces y Lighthouse en móvil y escritorio.
- **Visual**: revisión de todas las capturas a página completa y de las capturas de estados (`tests/qa/output/states`): header, menú móvil, foco, aviso de cookies, acordeón, lightbox, hero de día y de noche, formulario y footer.
