import SentryFilter from '../utils/SentryErrorFilter';

const testError =
  'Error: the dogs have been let loose accidentally. Please go home and get the leashes.';

const throttleConfig = {
  tokensPerInterval: 150,
  interval: 1000 * 60 * 5,
};

const similarErrorConfig = {
  maxSimilarErrors: 50,
  maxSimilarCharLength: 30,
};

describe('checking capturing binary error in sentry logic', () => {
  test(`checking under global throttle with different errors`, async () => {
    const sentryFilter = new SentryFilter(throttleConfig, similarErrorConfig);
    const runUnderThrottle = jest.fn((inputString) => {
      const sentryResponse = sentryFilter.getSentryError(inputString);
      if (sentryResponse !== inputString) {
        throw new Error('strings must match');
      }
    });

    for (let i = 0; i < 150; i += 1) {
      runUnderThrottle(i + testError);
    }

    expect(runUnderThrottle).toHaveReturnedTimes(150);
  });

  test(`checking global throttle limit text`, async () => {
    const sentryFilter = new SentryFilter(throttleConfig, similarErrorConfig);
    for (let i = 0; i < 150; i += 1) {
      sentryFilter.getSentryError(i + testError);
    }

    expect(sentryFilter.getSentryError(testError)).toBe(
      sentryFilter.throttleMessage(testError)
    );
  });

  test(`checking exceeded global throttle limit`, async () => {
    const sentryFilter = new SentryFilter(throttleConfig, similarErrorConfig);
    for (let i = 0; i < 151; i += 1) {
      sentryFilter.getSentryError(i + testError);
    }

    expect(sentryFilter.getSentryError(testError)).toBe(undefined);
  });

  test(`checking under similar error limit with different errors`, async () => {
    const sentryFilter = new SentryFilter(throttleConfig, similarErrorConfig);
    const runUnderThrottle = jest.fn((inputString) => {
      const sentryResponse = sentryFilter.getSentryError(inputString);
      if (sentryResponse !== inputString) {
        throw new Error('strings must match');
      }
    });

    for (let i = 0; i < similarErrorConfig.maxSimilarErrors; i += 1) {
      runUnderThrottle(testError);
    }

    expect(runUnderThrottle).toHaveReturnedTimes(
      similarErrorConfig.maxSimilarErrors
    );
  });

  test(`checking similar error limit text`, async () => {
    const sentryFilter = new SentryFilter(throttleConfig, similarErrorConfig);
    for (let i = 0; i < similarErrorConfig.maxSimilarErrors; i += 1) {
      sentryFilter.getSentryError(testError);
    }

    expect(sentryFilter.getSentryError(testError)).toBe(
      sentryFilter.similarErrorMessage(testError)
    );
  });

  test(`checking exceeded similar error limit`, async () => {
    const sentryFilter = new SentryFilter(throttleConfig, similarErrorConfig);
    for (let i = 0; i < similarErrorConfig.maxSimilarErrors + 1; i += 1) {
      sentryFilter.getSentryError(testError);
    }

    expect(sentryFilter.getSentryError(testError)).toBe(undefined);
  });
});
