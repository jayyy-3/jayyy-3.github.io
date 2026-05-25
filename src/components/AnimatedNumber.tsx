import { useEffect, useMemo, useRef, useState } from 'react';

interface AnimatedNumberProps {
  value: number | string;
  className?: string;
  duration?: number;
  prefix?: string;
  suffix?: string;
  prefixClassName?: string;
  suffixClassName?: string;
  decimals?: number;
  scrollSpy?: boolean;
}

interface ParsedNumber {
  end: number;
  decimals: number;
  displayValue: string;
  formattedNumber: string;
  prefix: string;
  suffix: string;
}

const NUMERIC_VALUE_PATTERN = /^([^0-9-]*)(-?\d[\d,]*(?:\.\d+)?)(.*)$/;
const VIEW_TRIGGER_THRESHOLD = 0.05;

function formatNumber(value: number, decimals: number): string {
  return value.toLocaleString(undefined, {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

function easeOutCubic(progress: number): number {
  return 1 - Math.pow(1 - progress, 3);
}

function parseNumberValue(
  value: number | string,
  prefix = '',
  suffix = '',
  decimals?: number,
): ParsedNumber | null {
  if (typeof value === 'number') {
    const resolvedDecimals = decimals ?? (Number.isInteger(value) ? 0 : 1);
    const formattedNumber = formatNumber(value, resolvedDecimals);

    return {
      end: value,
      decimals: resolvedDecimals,
      displayValue: `${prefix}${formattedNumber}${suffix}`,
      formattedNumber,
      prefix,
      suffix,
    };
  }

  const match = value.trim().match(NUMERIC_VALUE_PATTERN);

  if (!match) {
    return null;
  }

  const [, parsedPrefix, numericValue, parsedSuffix] = match;
  const normalizedValue = numericValue.replace(/,/g, '');
  const end = Number(normalizedValue);

  if (!Number.isFinite(end)) {
    return null;
  }

  const resolvedDecimals =
    decimals ?? (normalizedValue.includes('.') ? normalizedValue.split('.')[1]?.length ?? 0 : 0);
  const resolvedPrefix = `${prefix}${parsedPrefix}`;
  const resolvedSuffix = `${parsedSuffix}${suffix}`;
  const formattedNumber = formatNumber(Number(normalizedValue), resolvedDecimals);

  return {
    end,
    decimals: resolvedDecimals,
    displayValue: `${resolvedPrefix}${formattedNumber}${resolvedSuffix}`,
    formattedNumber,
    prefix: resolvedPrefix,
    suffix: resolvedSuffix,
  };
}

export default function AnimatedNumber({
  value,
  className,
  duration = 1.7,
  prefix,
  suffix,
  prefixClassName,
  suffixClassName,
  decimals,
  scrollSpy = true,
}: AnimatedNumberProps) {
  const numberRef = useRef<HTMLSpanElement | null>(null);
  const parsed = useMemo(
    () => parseNumberValue(value, prefix, suffix, decimals),
    [decimals, prefix, suffix, value],
  );
  const [animatedValue, setAnimatedValue] = useState(0);

  useEffect(() => {
    if (!parsed) {
      return;
    }

    let animationFrame = 0;
    let hasStarted = false;

    setAnimatedValue(0);

    const startAnimation = () => {
      if (hasStarted) {
        return;
      }

      hasStarted = true;
      const startTime = performance.now();
      const durationMs = Math.max(duration, 0.1) * 1000;

      const tick = (now: number) => {
        const progress = Math.min((now - startTime) / durationMs, 1);
        setAnimatedValue(parsed.end * easeOutCubic(progress));

        if (progress < 1) {
          animationFrame = window.requestAnimationFrame(tick);
          return;
        }

        setAnimatedValue(parsed.end);
      };

      animationFrame = window.requestAnimationFrame(tick);
    };

    if (!scrollSpy) {
      startAnimation();

      return () => {
        window.cancelAnimationFrame(animationFrame);
      };
    }

    const target = numberRef.current;

    if (!target || !('IntersectionObserver' in window)) {
      startAnimation();

      return () => {
        window.cancelAnimationFrame(animationFrame);
      };
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry?.isIntersecting) {
          observer.disconnect();
          startAnimation();
        }
      },
      {
        rootMargin: '0px',
        threshold: VIEW_TRIGGER_THRESHOLD,
      },
    );

    observer.observe(target);

    return () => {
      observer.disconnect();
      window.cancelAnimationFrame(animationFrame);
    };
  }, [duration, parsed, scrollSpy]);

  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  const visibleNumber = formatNumber(animatedValue, parsed.decimals);

  return (
    <span ref={numberRef} className={className} aria-label={parsed.displayValue}>
      <span aria-hidden="true">
        {parsed.prefix ? <span className={prefixClassName}>{parsed.prefix}</span> : null}
        {visibleNumber}
        {parsed.suffix ? <span className={suffixClassName}>{parsed.suffix}</span> : null}
      </span>
    </span>
  );
}
