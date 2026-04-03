import AuthBrand from './AuthBrand';

type ShowcaseMetric = {
  value: string;
  label: string;
};

type AuthShowcaseProps = {
  title: string;
  description: string;
  chips: string[];
  metrics: ShowcaseMetric[];
};

export default function AuthShowcase({
  title,
  description,
  chips,
  metrics,
}: AuthShowcaseProps) {
  return (
    <aside className="relative hidden min-h-[620px] overflow-hidden bg-[#080808] p-7 text-white lg:flex lg:flex-col lg:justify-between xl:p-9">
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,_rgba(255,255,255,0.08),_transparent_34%),linear-gradient(135deg,_rgba(255,255,255,0.03),_transparent_42%)]" />
        <div className="absolute -right-20 top-[-4%] h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,_rgba(201,187,167,0.2),_transparent_62%)]" />
        <div className="absolute bottom-16 left-[-80px] h-px w-80 rotate-[24deg] bg-gradient-to-r from-transparent via-white/18 to-transparent" />
        <div className="absolute right-6 top-10 h-[1px] w-52 rotate-[-44deg] bg-gradient-to-r from-transparent via-white/35 to-transparent" />
        <div className="absolute right-20 top-24 h-[1px] w-80 rotate-[-44deg] bg-gradient-to-r from-transparent via-white/25 to-transparent" />
        <div className="absolute right-0 top-0 h-56 w-56 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.1),_transparent_60%)]" />
      </div>

      <div className="relative">
        <AuthBrand tone="dark" caption="Acesso comercial" className="mb-10 text-white/90" />

        <div className="relative mb-10 flex h-52 items-center justify-center overflow-hidden rounded-[30px] border border-white/8 bg-[linear-gradient(145deg,rgba(255,255,255,0.06),rgba(255,255,255,0.01))]">
          <div className="absolute left-[22%] top-[8%] h-44 w-14 origin-bottom rotate-[33deg] rounded-[28px] bg-[linear-gradient(180deg,#3b3839_0%,#1e1d1d_100%)] shadow-[0_20px_50px_rgba(0,0,0,0.45)]" />
          <div className="absolute right-[27%] top-[8%] h-44 w-14 origin-bottom rotate-[-33deg] rounded-[28px] bg-[linear-gradient(180deg,#3b3839_0%,#1e1d1d_100%)] shadow-[0_20px_50px_rgba(0,0,0,0.45)]" />
          <div className="absolute top-[36%] h-9 w-9 rotate-45 bg-[linear-gradient(180deg,#8d6f5d_0%,#4f4038_100%)] opacity-85 shadow-[0_12px_20px_rgba(0,0,0,0.4)]" />
          <div className="absolute bottom-8 left-12 h-16 w-28 rounded-full bg-black/40 blur-2xl" />
        </div>

        <div className="max-w-md">
          <p className="text-sm uppercase tracking-[0.18em] text-white/42">Menos ruido, mais foco</p>
          <h2 className="mt-4 max-w-md text-[2.45rem] font-semibold leading-[0.98] tracking-[-0.05em] text-white">
            {title}
          </h2>
          <p className="mt-4 max-w-sm text-sm leading-7 text-white/56">{description}</p>
        </div>
      </div>

      <div className="relative overflow-hidden rounded-[30px] border border-white/10 bg-white/[0.08] p-6 shadow-[0_18px_40px_rgba(0,0,0,0.35)] backdrop-blur">
        <div className="absolute -right-8 top-0 h-20 w-28 rounded-bl-[28px] rounded-tr-[28px] bg-black/30" />

        <div className="relative space-y-5">
          <div className="flex flex-wrap gap-2.5">
            {chips.map((chip) => (
              <span
                key={chip}
                className="rounded-full border border-white/10 bg-white/[0.04] px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-white/58"
              >
                {chip}
              </span>
            ))}
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            {metrics.map((item) => (
              <div
                key={item.label}
                className="rounded-[20px] border border-white/8 bg-black/20 px-4 py-4"
              >
                <p className="text-[11px] uppercase tracking-[0.26em] text-white/35">{item.label}</p>
                <p className="mt-2 text-2xl font-semibold tracking-[-0.04em] text-white">{item.value}</p>
              </div>
            ))}
          </div>

          <p className="max-w-sm text-sm leading-7 text-white/52">
            Um acesso mais objetivo para voce entrar rapido e seguir direto para o trabalho.
          </p>
        </div>
      </div>
    </aside>
  );
}
