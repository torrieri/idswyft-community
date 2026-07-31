import * as Sentry from '@sentry/node';
import { scrubSentryEvent } from '@idswyft/shared';

const isProduction = process.env.NODE_ENV === 'production';
const sentryDsn = process.env.SENTRY_DSN;

// Re-export from shared so tests in this package can import from a stable
// path without depending on @idswyft/shared dist resolution at test time.
export { scrubSentryEvent, redactPII, scrubText } from '@idswyft/shared';

let profilingIntegration: ReturnType<typeof import('@sentry/profiling-node').nodeProfilingIntegration> | undefined;
try {
  const profiling = await import('@sentry/profiling-node');
  profilingIntegration = profiling.nodeProfilingIntegration();
} catch {
  // Native profiler may not be available for this Node version (e.g. Node 25).
  // Sentry still works without profiling.
}

if (isProduction && sentryDsn) {
  const integrations: any[] = [];
  if (profilingIntegration) {
    integrations.push(profilingIntegration);
  }

  Sentry.init({
    dsn: sentryDsn,
    integrations,
    enableLogs: true,
    tracesSampleRate: 1.0,
    profileSessionSampleRate: 1.0,
    profileLifecycle: 'trace',
    sendDefaultPii: false,
    beforeSend(event, hint) {
      // Drop VE_FLOW (SessionFlowError) captures — these fire when a client
      // POSTs a step that's already been processed (typical cause: client read
      // timeout shorter than OCR latency, retry races our state transition).
      // The route already maps these to a useful 409 response, and the
      // idempotency guard in /front-document returns 200 on the common retry
      // path. The Sentry events were noise, not bugs. See NODE-EXPRESS-7.
      const err = hint?.originalException;
      if (err && typeof err === 'object' &&
          (('code' in err && (err as { code?: string }).code === 'VE_FLOW') ||
           ('name' in err && (err as { name?: string }).name === 'SessionFlowError'))) {
        return null;
      }
      return scrubSentryEvent(event);
    },
  });
}
