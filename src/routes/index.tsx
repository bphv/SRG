import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { useState } from 'react'
import SmartInputBar from '#/app/components/SmartInputBar'
import { useAskSrgRuntimeContext } from '#/app/contexts/AskSrgRuntimeContext'

export const Route = createFileRoute('/')({
  component: HomePage,
})

function HomePage() {
  const navigate = useNavigate()
  const askSrgRuntime = useAskSrgRuntimeContext()
  const [input, setInput] = useState('')

  return (
    <main className="srg-hero-stage relative min-h-screen overflow-hidden text-white">
      <div className="srg-hero-overlay" aria-hidden />
      <div className="srg-hero-stars" aria-hidden />
      <div className="srg-hero-water" aria-hidden />
      <div className="srg-hero-splashes" aria-hidden />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-6xl flex-col px-6 pb-10 pt-10">
        <header className="-mt-2 flex items-start gap-4 sm:-mt-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-[linear-gradient(145deg,#1252ff,#00b8ff)] shadow-[0_18px_44px_rgba(14,88,255,0.35)]">
            <span className="text-2xl font-black text-white">S</span>
          </div>
          <div>
            <p className="text-5xl font-extrabold tracking-tight text-white">SRG</p>
            <p className="-mt-1 text-lg text-blue-100/95">Smart Report Generator</p>
          </div>
        </header>

        <section className="mx-auto mt-10 flex w-full max-w-4xl flex-1 flex-col items-center justify-center text-center">
          <button
            type="button"
            className="ask-orb-button mb-7"
            aria-label="Ouvrir la conversation Ask SRG"
            onClick={() => navigate({ to: '/chat' })}
          >
            <span className="ask-orb-wrap" aria-hidden>
              <span className="ask-orb-halo" />
              <span className="ask-orb-wave" />
              <span className="ask-orb-core" />
            </span>
          </button>

          <h1 className="text-balance text-4xl font-bold tracking-tight text-white sm:text-5xl">
            Bonjour.
            <br />
            Je suis Ask SRG.
          </h1>
          <p className="mt-5 max-w-3xl text-base leading-relaxed text-blue-50/95 sm:text-xl">
            Je peux vous accompagner dans toutes les activites de votre entreprise: projets, maintenance, reunions,
            expertises, documents, finances, ressources humaines, analyses, automatisation et knowledge center.
            <br className="hidden sm:block" />
            Que souhaitez-vous faire aujourd'hui ?
          </p>

          <div className="srg-home-universal mt-8 w-full max-w-[58rem] rounded-[2rem] border border-white/35 bg-white/90 p-3 shadow-[0_28px_80px_rgba(4,20,68,0.35)] backdrop-blur-xl sm:p-4">
            <SmartInputBar
              value={input}
              onValueChange={setInput}
              onSubmit={(value) => {
                const command = value.trim() || 'Ask SRG universal input'
                askSrgRuntime.pushRecentCommand(command)
                navigate({ to: '/chat' })
              }}
              placeholder="Que souhaitez-vous faire aujourd'hui ?"
              persistKey="home-universal-input"
              mode="conversation"
              submitLabel="▶"
              ariaLabel="Champ universel Ask SRG"
              suggestions={[
                'Lance un suivi projet prioritaire',
                'Prepare un rapport maintenance hebdomadaire',
                'Analyse mes depenses du mois',
                'Trouve les contrats fournisseurs en retard',
                'Ouvre le workflow de validation de devis',
              ]}
              showDropzone={false}
              showModeSelector={false}
              showLanguageSelector={false}
              showAuxiliaryPanel={false}
            />
          </div>

          <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
            <Link
              to="/auth"
              className="rounded-2xl bg-[#1f4fff] px-6 py-3 text-sm font-semibold text-white no-underline shadow-[0_14px_28px_rgba(20,72,255,0.42)] transition hover:bg-[#123fe0]"
            >
              Creer un compte
            </Link>
            <Link
              to="/auth"
              className="rounded-2xl border border-white/70 bg-white/90 px-6 py-3 text-sm font-semibold text-[#0f254f] no-underline transition hover:bg-white"
            >
              Se connecter
            </Link>
          </div>
        </section>
      </div>
    </main>
  )
}
