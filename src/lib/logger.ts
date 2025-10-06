// Sentry configuration for error tracking
// Only initialize in production builds

export const SENTRY_DSN = import.meta.env.VITE_SENTRY_DSN || '';
export const ENVIRONMENT = import.meta.env.MODE || 'development';

interface SentryConfig {
  enabled: boolean;
  dsn: string;
  environment: string;
  tracesSampleRate: number;
  beforeSend?: (event: unknown) => unknown;
}

export const sentryConfig: SentryConfig = {
  enabled: ENVIRONMENT === 'production' && !!SENTRY_DSN,
  dsn: SENTRY_DSN,
  environment: ENVIRONMENT,
  tracesSampleRate: 0.1, // 10% of transactions

  // Filter out sensitive data
  beforeSend(event: any) {
    // Remove any potential private keys, seed phrases, or passwords
    if (event.extra) {
      delete event.extra.privateKey;
      delete event.extra.seedPhrase;
      delete event.extra.mnemonic;
      delete event.extra.password;
    }

    // Scrub URLs that might contain sensitive data
    if (event.request?.url) {
      event.request.url = event.request.url.replace(
        /0x[a-fA-F0-9]{40}/g,
        '0x[REDACTED]'
      );
    }

    return event;
  },
};

// Initialize Sentry (call this in main entry points)
export async function initSentry() {
  if (!sentryConfig.enabled) {
    console.log('Sentry disabled in', ENVIRONMENT);
    return;
  }

  try {
    // Dynamically import Sentry to avoid bundling in dev
    // eslint-disable-next-line @typescript-eslint/ban-ts-comment
    // @ts-ignore - Sentry will be installed separately
    const Sentry = await import('@sentry/browser');

    Sentry.init({
      dsn: sentryConfig.dsn,
      environment: sentryConfig.environment,
      tracesSampleRate: sentryConfig.tracesSampleRate,
      beforeSend: sentryConfig.beforeSend,

      integrations: [
        // new Sentry.BrowserTracing(),
        // new Sentry.Replay(),
      ],

      // Don't send errors during development
      enabled: sentryConfig.enabled,
    });

    console.log('Sentry initialized');
  } catch (error) {
    console.error('Failed to initialize Sentry:', error);
  }
}

// Custom error logger with Sentry integration
export class ErrorLogger {
  static log(error: Error, context?: Record<string, unknown>) {
    console.error('Error:', error, context);

    if (sentryConfig.enabled) {
      // Send to Sentry in production
      // Sentry.captureException(error, { extra: context });
    }
  }

  static logWarning(message: string, context?: Record<string, unknown>) {
    console.warn('Warning:', message, context);

    if (sentryConfig.enabled) {
      // Sentry.captureMessage(message, { level: 'warning', extra: context });
    }
  }

  static logInfo(message: string, context?: Record<string, unknown>) {
    console.log('Info:', message, context);
  }
}

export default ErrorLogger;
