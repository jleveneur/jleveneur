"use client"

import { useActionState, useState } from "react"

import { sendContactMessage } from "@/app/[locale]/contact/actions"
import type { Dictionary } from "@/i18n/dictionaries"
import { type ContactField, type ContactFormState, initialContactState } from "@/lib/contact"

type FormDict = Dictionary["contact"]["form"]

/** Remounts the form after a message is sent, so a second one starts clean. */
export function ContactForm({ dict }: { dict: FormDict }) {
  const [round, setRound] = useState(0)
  return <ContactFormRound key={round} dict={dict} onReset={() => setRound(round + 1)} />
}

function ContactFormRound({ dict, onReset }: { dict: FormDict; onReset: () => void }) {
  const [state, formAction, pending] = useActionState(sendContactMessage, initialContactState)

  if (state.status === "sent") {
    return (
      <div role="status" className="grid gap-4">
        <p className="font-mono text-xs tracking-widest text-signal uppercase">
          ✓ {dict.reference} {state.reference}
        </p>
        <h2 className="font-stretch-75% text-4xl leading-none font-extrabold uppercase">
          {dict.sentTitle}
        </h2>
        <p className="text-lg text-ink-muted">{dict.sentBody}</p>
        <div>
          <button
            type="button"
            onClick={onReset}
            className="mt-2 border border-ink px-5 py-3 text-sm font-bold tracking-wide uppercase transition-colors hover:bg-ink hover:text-paper"
          >
            {dict.another}
          </button>
        </div>
      </div>
    )
  }

  const formError = state.status === "error" ? state.formError : undefined

  return (
    <form action={formAction} noValidate className="grid gap-8">
      <div className="grid gap-8 sm:grid-cols-2">
        <Field
          state={state}
          dict={dict}
          name="name"
          code="01"
          label={dict.name}
          autoComplete="name"
          required
        />
        <Field
          state={state}
          dict={dict}
          name="email"
          code="02"
          label={dict.email}
          type="email"
          autoComplete="email"
          required
        />
      </div>
      <Field
        state={state}
        dict={dict}
        name="company"
        code="03"
        label={`${dict.company} (${dict.optional})`}
        autoComplete="organization"
      />
      <Field
        state={state}
        dict={dict}
        name="message"
        code="04"
        label={dict.message}
        placeholder={dict.messagePlaceholder}
        multiline
        required
      />

      {/* Hidden from people and assistive technology; bots fill it in. */}
      <div aria-hidden="true" className="sr-only">
        <label>
          {dict.honeypot}
          <input type="text" name="website" tabIndex={-1} autoComplete="off" />
        </label>
      </div>

      {formError === undefined ? null : (
        <p role="alert" className="border border-danger px-4 py-3 text-danger">
          {dict.errors[formError]}
        </p>
      )}

      <div>
        <button
          type="submit"
          disabled={pending}
          className="inline-flex items-center gap-3 bg-signal px-6 py-3.5 text-sm font-bold tracking-wide text-signal-ink uppercase transition-colors hover:bg-ink disabled:cursor-wait disabled:opacity-70"
        >
          {pending ? dict.submitting : dict.submit}
          <span aria-hidden="true">→</span>
        </button>
      </div>
    </form>
  )
}

type FieldProps = {
  state: ContactFormState
  dict: FormDict
  name: ContactField
  code: string
  label: string
  type?: "text" | "email"
  autoComplete?: string
  placeholder?: string
  multiline?: boolean
  required?: boolean
}

function Field({
  state,
  dict,
  name,
  code,
  label,
  type = "text",
  autoComplete,
  placeholder,
  multiline = false,
  required = false
}: FieldProps) {
  const error = state.status === "error" ? state.fieldErrors[name] : undefined
  const value = state.status === "error" ? state.values[name] : undefined
  const id = `contact-${name}`
  const errorId = `${id}-error`
  const shared = {
    id,
    name,
    required,
    placeholder,
    defaultValue: value,
    "aria-invalid": error === undefined ? undefined : true,
    "aria-describedby": error === undefined ? undefined : errorId
  }

  return (
    <div className="grid gap-2">
      <label htmlFor={id} className="flex items-baseline gap-3">
        <span aria-hidden="true" className="font-mono text-xs text-ink-muted">
          {code}
        </span>
        <span className="text-sm font-bold tracking-wide uppercase">{label}</span>
      </label>
      {multiline ? (
        <textarea
          {...shared}
          rows={7}
          className="w-full resize-y border border-line bg-paper-deep/60 px-4 py-3 text-lg placeholder:text-ink-muted/60 focus:border-signal focus:outline-none aria-invalid:border-danger"
        />
      ) : (
        <input
          {...shared}
          type={type}
          autoComplete={autoComplete}
          className="w-full border border-line bg-paper-deep/60 px-4 py-3 text-lg placeholder:text-ink-muted/60 focus:border-signal focus:outline-none aria-invalid:border-danger"
        />
      )}
      {error === undefined ? null : (
        <p id={errorId} className="text-sm text-danger">
          {dict.errors[error]}
        </p>
      )}
    </div>
  )
}
