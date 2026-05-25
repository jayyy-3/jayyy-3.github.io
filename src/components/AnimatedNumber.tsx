import { useReducedMotion } from 'framer-motion';
import CountUp from 'react-countup';

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

function parseNumberValue(
  value: number | string,
  prefix = '',
  suffix = '',
  decimals?: number,
): ParsedNumber | null {
  if (typeof value === 'number') {
    const resolvedDecimals = decimals ?? (Number.isInteger(value) ? 0 : 1);
    const formattedNumber = value.toLocaleString(undefined, {
      minimumFractionDigits: resolvedDecimals,
      maximumFractionDigits: resolvedDecimals,
    });

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
  const formattedNumber = Number(normalizedValue).toLocaleString(undefined, {
    minimumFractionDigits: resolvedDecimals,
    maximumFractionDigits: resolvedDecimals,
  });

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
  const shouldReduceMotion = useReducedMotion();
  const parsed = parseNumberValue(value, prefix, suffix, decimals);

  if (!parsed) {
    return <span className={className}>{value}</span>;
  }

  if (shouldReduceMotion) {
    return (
      <span className={className} aria-label={parsed.displayValue}>
        <span aria-hidden="true">
          {parsed.prefix ? <span className={prefixClassName}>{parsed.prefix}</span> : null}
          {parsed.formattedNumber}
          {parsed.suffix ? <span className={suffixClassName}>{parsed.suffix}</span> : null}
        </span>
      </span>
    );
  }

  return (
    <span className={className} aria-label={parsed.displayValue}>
      <span aria-hidden="true">
        {parsed.prefix ? <span className={prefixClassName}>{parsed.prefix}</span> : null}
        <CountUp
          end={parsed.end}
          duration={duration}
          decimals={parsed.decimals}
          separator=","
          preserveValue
          enableScrollSpy={scrollSpy}
          scrollSpyOnce
        />
        {parsed.suffix ? <span className={suffixClassName}>{parsed.suffix}</span> : null}
      </span>
    </span>
  );
}
