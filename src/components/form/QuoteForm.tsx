'use client';

import { useCallback, useEffect, useId, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react';
import { FormProvider, useForm, type FieldError, type Resolver } from 'react-hook-form';
import { ArrowLeft, LoaderCircle, TriangleAlert } from 'lucide-react';
import { Button, ButtonAnchor } from '@/components/ui/Button';
import { WhatsAppIcon } from '@/components/layout/WhatsAppFloat';
import { getConsentState, trackEvent } from '@/components/consent/trackEvent';
import { whatsappHref } from '@/content/site';
import { detectDevice, prefersReducedMotion } from '@/lib/device';
import { collectAttribution } from '@/lib/utm';
import {
  EMPTY_DRAFT,
  LIMITS,
  STEP_COUNT,
  STEP_FIELDS,
  draftToLeadRequest,
  eventFromSlug,
  stepOfField,
  type DraftField,
  type LeadResponse,
  type QuoteDraft,
} from '@/lib/quote-data';
import { FORM_COPY, STEPS } from './copy';
import { ACTIONS_CLASS, FormProgress, NEXT_BUTTON_CLASS, NoScriptContact, PANEL_CLASS, ROOT_CLASS } from './frame';
import { firstName } from './format';
import { clearDraft, createId, loadDraft, saveDraft } from './storage';
import { StepContact } from './StepContact';
import { StepEvent } from './StepEvent';
import { StepQuantity } from './StepQuantity';
import { StepWhenWhere } from './StepWhenWhere';
import { Success } from './Success';
import { bannerOverlap, useBottomInset } from './useBottomInset';

const ENDPOINT = '/api/presupuesto';
const CLIENT_TIMEOUT_MS = 25_000;
const AUTO_ADVANCE_MS = 250;

type Status = 'idle' | 'sending' | 'error' | 'success';
type Notice = { text: string; retry: boolean } | null;

/*
 * Las reglas (zod) se cargan aparte, justo después de hidratar: así zod no
 * forma parte del JavaScript inicial de la página.
 */
type ValidationModule = typeof import('@/lib/validation');
let validationModule: Promise<ValidationModule> | null = null;

function loadValidation(): Promise<ValidationModule> {
  validationModule ??= import('@/lib/validation').catch((error: unknown) => {
    validationModule = null;
    throw error;
  });
  return validationModule;
}

/** Valida solo los pasos de los campos que pide react-hook-form. */
const draftResolver: Resolver<QuoteDraft> = async (values, _context, options) => {
  const { validateStep } = await loadValidation();
  const names = (options.names ?? []) as string[];
  const steps = names.length > 0 ? [...new Set(names.map(stepOfField))] : [0, 1, 2, 3];
  const errors: Record<string, FieldError> = {};
  for (const step of steps) {
    for (const [field, message] of Object.entries(validateStep(step, values))) {
      errors[field] = { type: 'validate', message };
    }
  }
  return Object.keys(errors).length > 0 ? { values: {}, errors } : { values, errors: {} };
};

function parseCasetas(value: string | null): number | null {
  if (!value || !/^\d{1,4}$/.test(value)) return null;
  const n = Number(value);
  return Math.min(Math.max(n, LIMITS.casetasMin), LIMITS.casetasMax);
}

const sleep = (ms: number) => new Promise<void>((resolve) => window.setTimeout(resolve, ms));

async function postLead(body: unknown): Promise<{ status: number; data: LeadResponse | null }> {
  const controller = new AbortController();
  const timer = window.setTimeout(() => controller.abort(), CLIENT_TIMEOUT_MS);
  try {
    const res = await fetch(ENDPOINT, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
      signal: controller.signal,
      cache: 'no-store',
    });
    const data = (await res.json().catch(() => null)) as LeadResponse | null;
    return { status: res.status, data };
  } finally {
    window.clearTimeout(timer);
  }
}

/**
 * Formulario de presupuesto en cuatro pasos. Sin props: lee ?evento=<slug> y
 * ?casetas=<n> de la URL al montarse, guarda el borrador en sessionStorage y
 * envía la solicitud a /api/presupuesto con un id estable para los reintentos.
 */
export function QuoteForm() {
  const idPrefix = `cmq${useId().replace(/[^a-zA-Z0-9]/g, '')}`;
  const methods = useForm<QuoteDraft>({
    defaultValues: EMPTY_DRAFT,
    mode: 'onChange',
    reValidateMode: 'onChange',
    resolver: draftResolver,
    shouldFocusError: false,
  });
  const { getValues, reset, setError, setFocus, subscribe, trigger, getFieldState } = methods;

  const [step, setStep] = useState(0);
  // 0 hasta el primer cambio de paso: el primer paso no se anima al cargar
  const [direction, setDirection] = useState<0 | 1 | -1>(0);
  const [attempted, setAttempted] = useState<readonly boolean[]>([false, false, false, false]);
  const [status, setStatus] = useState<Status>('idle');
  const [notice, setNotice] = useState<Notice>(null);
  const [result, setResult] = useState({ numero: 0, nombre: '' });
  const [announcement, setAnnouncement] = useState('');

  const rootRef = useRef<HTMLDivElement>(null);
  const meta = useRef<{ id: string; startedAt: number } | null>(null);
  const stepRef = useRef(0);
  const busy = useRef(false);
  const sending = useRef(false);
  const pendingFocus = useRef(false);
  const focusSubmit = useRef(false);
  const advanceTimer = useRef<number | undefined>(undefined);
  const inset = useBottomInset(rootRef);

  const persist = useCallback((values: QuoteDraft, atStep: number) => {
    if (!meta.current) return;
    saveDraft({ id: meta.current.id, startedAt: meta.current.startedAt, step: atStep, values });
  }, []);

  // Restaurar el borrador y aplicar la precarga por URL (?evento= y ?casetas=)
  useEffect(() => {
    let cancelled = false;
    const stored = loadDraft();
    const params = new URLSearchParams(window.location.search);
    const evento = eventFromSlug(params.get('evento'));
    const casetas = parseCasetas(params.get('casetas'));
    const values: QuoteDraft = { ...(stored?.values ?? EMPTY_DRAFT) };
    if (evento) values.tipoEvento = evento;
    if (casetas) values.casetas = String(casetas);
    meta.current = { id: stored?.id ?? createId(), startedAt: stored?.startedAt ?? Date.now() };
    reset(values);
    persist(values, 0);

    // Señal para tests y depuración: hidratado, restaurado y con las reglas cargadas
    const ready = () => {
      if (rootRef.current) rootRef.current.dataset.ready = 'true';
    };
    loadValidation()
      .then(({ firstInvalidStep }) => {
        if (cancelled) return;
        let target = 0;
        if (stored && stored.step > 0) {
          const invalid = firstInvalidStep(values, stored.step - 1);
          target = invalid === -1 ? stored.step : invalid;
        }
        stepRef.current = target;
        persist(values, target);
        if (target > 0) setStep(target);
        ready();
      })
      .catch(ready);
    return () => {
      cancelled = true;
    };
  }, [reset, persist]);

  // Guardar cada cambio en sessionStorage
  useEffect(
    () =>
      subscribe({
        formState: { values: true },
        callback: ({ values }) => persist(values, stepRef.current),
      }),
    [subscribe, persist],
  );

  useEffect(() => () => window.clearTimeout(advanceTimer.current), []);

  const markAttempted = (index: number) =>
    setAttempted((prev) => (prev[index] ? prev : prev.map((v, i) => (i === index ? true : v))));

  const revealTop = () => {
    const el = rootRef.current;
    if (!el || el.getBoundingClientRect().top >= 80) return;
    el.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  };

  const goTo = (target: number) => {
    window.clearTimeout(advanceTimer.current);
    if (target === stepRef.current) return;
    setDirection(target > stepRef.current ? 1 : -1);
    stepRef.current = target;
    pendingFocus.current = true;
    focusSubmit.current = false;
    setStep(target);
    setNotice(null);
    setStatus((s) => (s === 'error' ? 'idle' : s));
    setAnnouncement(`${FORM_COPY.stepOf(target + 1, STEP_COUNT)}. ${STEPS[target].title}`);
    persist(getValues(), target);
    revealTop();
  };

  /**
   * Con el aviso de cookies abierto en móvil (una hoja inferior de 260 a 350 px)
   * el botón de enviar podría quedar debajo. Al marcar la casilla de privacidad
   * o al enfocar el botón, se desplaza la página lo justo para dejarlo encima.
   */
  const revealActions = () => {
    const place = (behavior: ScrollBehavior) => {
      const actions = rootRef.current?.querySelector('[data-quote-actions]');
      if (!actions) return;
      const overlap = bannerOverlap(rootRef.current);
      if (overlap === 0) return;
      const limit = window.innerHeight - overlap - 16;
      const bottom = actions.getBoundingClientRect().bottom;
      if (bottom > limit) window.scrollBy({ top: bottom - limit, behavior });
    };
    place(prefersReducedMotion() ? 'auto' : 'smooth');
    // Si otro desplazamiento interrumpe el suave, se corrige al terminar
    window.setTimeout(() => place('auto'), 700);
  };

  const focusFirstError = (index: number) => {
    const field = STEP_FIELDS[index].find((name) => getFieldState(name).error);
    if (!field) return;
    // Tras pintar el mensaje, para que el lector lo lea con el campo
    requestAnimationFrame(() => setFocus(field));
  };

  const submit = async () => {
    if (sending.current) return;
    const values = getValues();
    let invalid: number;
    try {
      invalid = (await loadValidation()).firstInvalidStep(values);
    } catch {
      setStatus('error');
      setNotice({ text: FORM_COPY.networkError, retry: true });
      return;
    }
    if (invalid !== -1) {
      markAttempted(invalid);
      goTo(invalid);
      await trigger([...STEP_FIELDS[invalid]]);
      return;
    }

    sending.current = true;
    setStatus('sending');
    setNotice(null);
    try {
      const info = meta.current ?? { id: createId(), startedAt: Date.now() - LIMITS.minFillMs };
      meta.current = info;
      // Nadie rellena cuatro pasos en 4 s, pero si ocurre se espera en vez de perder la solicitud
      const wait = LIMITS.minFillMs + 200 - (Date.now() - info.startedAt);
      if (wait > 0) await sleep(wait);

      const consent = getConsentState();
      const attribution = collectAttribution(consent.analytics);
      const body = draftToLeadRequest(values, {
        id: info.id,
        startedAt: info.startedAt,
        sentAt: Date.now(),
        pagina: window.location.pathname,
        landing: attribution.landing,
        referrer: attribution.referrer,
        utm: attribution.utm,
        dispositivo: detectDevice(),
      });

      const { status: code, data } = await postLead(body);
      if (data?.ok) {
        clearDraft();
        trackEvent('lead_submit', { tipo_evento: values.tipoEvento, casetas: Number(values.casetas) });
        pendingFocus.current = true;
        setResult({ numero: data.numero, nombre: firstName(values.nombre) });
        setStatus('success');
        setAnnouncement(FORM_COPY.successTitle);
        return;
      }

      if (code === 400 && data && !data.ok && data.fields) {
        const fields = Object.entries(data.fields).filter(([name]) => name in EMPTY_DRAFT) as [DraftField, string][];
        if (fields.length > 0) {
          const first = Math.min(...fields.map(([name]) => stepOfField(name)));
          markAttempted(first);
          goTo(first);
          for (const [name, message] of fields) setError(name, { type: 'server', message });
          setStatus('error');
          setNotice({ text: FORM_COPY.serverValidation, retry: false });
          return;
        }
      }
      setStatus('error');
      setNotice({ text: code === 429 ? FORM_COPY.rateLimited : FORM_COPY.networkError, retry: code !== 429 });
    } catch {
      setStatus('error');
      setNotice({ text: FORM_COPY.networkError, retry: true });
    } finally {
      sending.current = false;
    }
  };

  const next = async () => {
    if (busy.current || sending.current) return;
    busy.current = true;
    window.clearTimeout(advanceTimer.current);
    try {
      const index = stepRef.current;
      let valid: boolean;
      try {
        valid = await trigger([...STEP_FIELDS[index]]);
      } catch {
        // Sin conexión no se han podido cargar las reglas de validación
        setNotice({ text: FORM_COPY.networkError, retry: false });
        return;
      }
      if (!valid) {
        markAttempted(index);
        focusFirstError(index);
        return;
      }
      if (index < STEP_COUNT - 1) goTo(index + 1);
      else await submit();
    } finally {
      busy.current = false;
    }
  };

  const onPointerPick = (value: string) => {
    window.clearTimeout(advanceTimer.current);
    if (value === 'Otro') return;
    advanceTimer.current = window.setTimeout(() => void next(), AUTO_ADVANCE_MS);
  };

  const onKeyDown = (event: KeyboardEvent<HTMLFormElement>) => {
    if (event.key !== 'Enter' || event.nativeEvent.isComposing) return;
    if (event.target instanceof HTMLInputElement) {
      event.preventDefault();
      void next();
    }
  };

  // Foco en el primer campo del paso nuevo (nunca al cargar la página)
  const onStepMount = useCallback((el: HTMLDivElement | null) => {
    if (!el || !pendingFocus.current) return;
    pendingFocus.current = false;
    const target =
      el.querySelector<HTMLElement>('input[type="radio"]:checked, [data-autofocus]') ??
      el.querySelector<HTMLElement>('input:not([type="hidden"]), select, textarea');
    target?.focus({ preventScroll: true });
  }, []);

  /*
   * Tras un fallo de red solo hay una acción principal: Reintentar, en el aviso.
   * El botón de enviar se retira mientras tanto; si tenía el foco, el foco pasa
   * a Reintentar y, al reintentar, vuelve al botón de enviar ("Enviando").
   */
  const onRetryMount = useCallback((el: HTMLButtonElement | null) => {
    if (el && (!document.activeElement || document.activeElement === document.body)) el.focus({ preventScroll: true });
  }, []);

  const onSubmitMount = useCallback((el: HTMLButtonElement | null) => {
    if (!el || !focusSubmit.current) return;
    focusSubmit.current = false;
    el.focus({ preventScroll: true });
  }, []);

  const onSuccessHeading = useCallback((el: HTMLHeadingElement | null) => {
    if (!el || !pendingFocus.current) return;
    pendingFocus.current = false;
    el.focus({ preventScroll: true });
    const top = rootRef.current?.getBoundingClientRect().top ?? 0;
    if (top < 80)
      rootRef.current?.scrollIntoView({ block: 'start', behavior: prefersReducedMotion() ? 'auto' : 'smooth' });
  }, []);

  const isSending = status === 'sending';
  const canRetry = notice?.retry === true;
  const isLast = step === STEP_COUNT - 1;
  const showErrors = attempted[step] ?? false;
  const rootStyle = { '--quote-inset': `${inset}px` } as CSSProperties;

  return (
    <>
      <div ref={rootRef} data-quote-form="" style={rootStyle} className={ROOT_CLASS}>
        <p className="sr-only" aria-live="polite" aria-atomic="true">
          {announcement}
        </p>
        <div className={PANEL_CLASS}>
          {status === 'success' ? (
            <div key="success" className="q-enter">
              <Success nombre={result.nombre} numero={result.numero} headingRef={onSuccessHeading} />
            </div>
          ) : (
            <div key="form">
              <FormProvider {...methods}>
                <form
                  noValidate
                  aria-label={FORM_COPY.formLabel}
                  onSubmit={(event) => {
                    event.preventDefault();
                    void next();
                  }}
                  onKeyDown={onKeyDown}
                >
                  <FormProgress step={step} />

                  <div key={step} ref={onStepMount} className="q-step" data-dir={direction}>
                    {step === 0 ? (
                      <StepEvent idPrefix={idPrefix} showErrors={showErrors} onPointerPick={onPointerPick} />
                    ) : step === 1 ? (
                      <StepWhenWhere idPrefix={idPrefix} showErrors={showErrors} />
                    ) : step === 2 ? (
                      <StepQuantity idPrefix={idPrefix} showErrors={showErrors} />
                    ) : (
                      <StepContact
                        idPrefix={idPrefix}
                        showErrors={showErrors}
                        onEdit={goTo}
                        onConsent={revealActions}
                      />
                    )}
                  </div>

                  {notice ? (
                    <div role="alert" className="mt-8 rounded-sm border border-error/25 bg-cream px-4 py-4 sm:px-5">
                      <p className="flex items-start gap-3 text-[0.9375rem] leading-snug text-ink">
                        <TriangleAlert
                          aria-hidden="true"
                          strokeWidth={1.5}
                          className="mt-px size-5 flex-none text-error"
                        />
                        <span>{notice.text}</span>
                      </p>
                      <div className="mt-4 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:pl-8">
                        {notice.retry ? (
                          <Button
                            ref={onRetryMount}
                            arrow
                            onClick={() => {
                              focusSubmit.current = true;
                              void submit();
                            }}
                            className="max-sm:w-full"
                          >
                            {FORM_COPY.retry}
                          </Button>
                        ) : null}
                        <ButtonAnchor
                          href={whatsappHref()}
                          target="_blank"
                          rel="noopener noreferrer"
                          variant="outline"
                          magnetic={false}
                          className="max-sm:w-full"
                          icon={<WhatsAppIcon className="size-5" />}
                          onClick={() => trackEvent('click_whatsapp', { ubicacion: 'formulario_error' })}
                        >
                          WhatsApp
                        </ButtonAnchor>
                      </div>
                    </div>
                  ) : null}

                  <div data-quote-actions="" style={{ scrollMarginBottom: inset + 16 }} className={ACTIONS_CLASS}>
                    {step > 0 ? (
                      <button
                        type="button"
                        onClick={() => goTo(step - 1)}
                        className="group inline-flex min-h-[52px] items-center gap-2 rounded-sm pr-3 pl-1 text-[0.9375rem] font-semibold text-stone transition-colors duration-300 ease-brand hover:text-ink"
                      >
                        <ArrowLeft
                          aria-hidden="true"
                          strokeWidth={1.5}
                          className="size-[18px] transition-transform duration-500 ease-brand group-hover:-translate-x-1"
                        />
                        {FORM_COPY.back}
                      </button>
                    ) : null}
                    {canRetry ? null : (
                      <Button
                        ref={onSubmitMount}
                        type="submit"
                        arrow={!isSending}
                        aria-disabled={isSending || undefined}
                        aria-busy={isSending || undefined}
                        icon={
                          isSending ? (
                            <LoaderCircle aria-hidden="true" strokeWidth={1.75} className="size-5 animate-spin" />
                          ) : undefined
                        }
                        className={NEXT_BUTTON_CLASS}
                        onFocus={inset > 0 ? revealActions : undefined}
                      >
                        {isLast ? (isSending ? FORM_COPY.sending : FORM_COPY.submit) : FORM_COPY.next}
                      </Button>
                    )}
                  </div>

                  <div aria-hidden="true" className="sr-only">
                    <label htmlFor={`${idPrefix}-website`}>{FORM_COPY.honeypot}</label>
                    <input
                      id={`${idPrefix}-website`}
                      type="text"
                      tabIndex={-1}
                      autoComplete="off"
                      {...methods.register('website')}
                    />
                  </div>
                </form>
              </FormProvider>
            </div>
          )}
        </div>
      </div>
      <NoScriptContact />
    </>
  );
}
