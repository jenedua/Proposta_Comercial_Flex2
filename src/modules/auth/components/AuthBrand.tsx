import {cn} from '../../../shared/lib/utils';

type AuthBrandProps = {
  tone?: 'light' | 'dark';
  caption?: string;
  className?: string;
  centered?: boolean;
};

export default function AuthBrand({
  tone = 'light',
  caption = 'Workspace comercial premium',
  className,
  centered = false,
}: AuthBrandProps) {
  const isDark = tone === 'dark';

  return (
    <div
      className={cn(
        'flex items-center gap-3',
        centered && 'justify-center text-center',
        className,
      )}
    >
      <div
        className={cn(
          'relative flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl border shadow-[0_14px_30px_rgba(17,17,17,0.18)]',
          isDark ? 'border-white/12 bg-white/5' : 'border-black/8 bg-[#111111]',
        )}
      >
        <div
          className={cn(
            'absolute h-7 w-7 rotate-45 border',
            isDark ? 'border-[#9fc3ff]/65' : 'border-white/55',
          )}
        />
        <div
          className={cn(
            'h-3 w-3 rotate-45 bg-[linear-gradient(180deg,#7fb7ff_0%,#6981ff_100%)]',
            !isDark && 'shadow-[0_6px_14px_rgba(115,144,255,0.35)]',
          )}
        />
      </div>

      <div>
        <p
          className={cn(
            'text-xs font-semibold uppercase tracking-[0.28em]',
            isDark ? 'text-white/58' : 'text-black/45',
          )}
        >
          Proposta Flex
        </p>
        <p className={cn('text-sm', isDark ? 'text-white/42' : 'text-black/55')}>
          {caption}
        </p>
      </div>
    </div>
  );
}
