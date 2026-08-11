export function SectionHeading({
  eyebrow,
  title,
  intro,
  align = "left",
}: {
  eyebrow: string;
  title: string;
  intro?: string;
  align?: "left" | "center";
}) {
  const centered = align === "center";
  return (
    <div className={centered ? "mx-auto max-w-2xl text-center" : "max-w-2xl"}>
      <span className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.18em] text-brick">
        <span className="h-px w-5 bg-brick/60" />
        {eyebrow}
      </span>
      <h2 className="mt-3 text-balance font-display text-3xl font-semibold tracking-tight text-ink sm:text-4xl">
        {title}
      </h2>
      {intro && <p className="mt-4 text-pretty text-lg leading-relaxed text-ink/70">{intro}</p>}
    </div>
  );
}
