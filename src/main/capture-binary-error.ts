import { captureException as sentryCaptureException } from '@sentry/electron';
import SentryFilter from 'utils/SentryErrorFilter';
import { trackEvent } from './analytics';

const sentryFilter = new SentryFilter();

const captureBinaryError = (stringifiedError: string) => {
  const sentryError = sentryFilter.getSentryError(stringifiedError);
  if (sentryError) {
    sentryCaptureException(sentryError);
  }
  trackEvent('binaryError', { stringifiedError });
};

export default captureBinaryError;
