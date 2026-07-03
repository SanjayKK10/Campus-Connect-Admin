interface ThunderLogoProps {
  size?: 'sm' | 'md' | 'lg';
  showText?: boolean;
  subtitle?: string;
}

const sizeMap = {
  sm: { icon: 'text-xl', title: 'text-lg', subtitle: 'text-xs' },
  md: { icon: 'text-2xl', title: 'text-xl', subtitle: 'text-sm' },
  lg: { icon: 'text-4xl', title: 'text-3xl', subtitle: 'text-base' },
};

export default function ThunderLogo({
  size = 'md',
  showText = true,
  subtitle,
}: ThunderLogoProps) {
  const styles = sizeMap[size];

  return (
    <div className="flex items-center gap-3">
      <span
        className={`${styles.icon} drop-shadow-[0_0_12px_rgba(156,124,255,0.24)]`}
        aria-hidden
      >
        ⚡
      </span>
      {showText && (
        <div>
          <h1
            className={`${styles.title} font-bold`}
            style={{ color: 'var(--color-cc-text)' }}
          >
            CampusConnect
          </h1>
          {subtitle && (
            <p
              className={styles.subtitle}
              style={{ color: 'var(--color-cc-muted)', fontStyle: 'italic' }}
            >
              {subtitle}
            </p>
          )}
        </div>
      )}
    </div>
  );
}