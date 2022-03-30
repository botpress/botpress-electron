import { RateLimiter } from 'limiter';

interface ThrottleConfig {
  tokensPerInterval: number;
  interval: number;
}

interface SimilarErrorConfig {
  maxSimilarErrors: number;
  maxSimilarCharLength: number;
}

export default class SentryFilter {
  lastXErrorStarts: string[] = [];

  filteredErrors: string[] = [];

  throttledFlag = false;

  similarErrorConfig: SimilarErrorConfig;

  throttleConfig: ThrottleConfig;

  binaryErrorLimiter: RateLimiter;

  constructor(
    throttleConfig?: ThrottleConfig,
    similarErrorConfig?: SimilarErrorConfig
  ) {
    this.throttleConfig = {
      ...{
        tokensPerInterval: 150,
        interval: 1000 * 60 * 5,
      },
      ...throttleConfig,
    };

    this.binaryErrorLimiter = new RateLimiter(this.throttleConfig);

    this.similarErrorConfig = {
      ...{
        maxSimilarErrors: 50,
        maxSimilarCharLength: 30,
      },
      ...similarErrorConfig,
    };
  }

  throttleMessage(stringifiedError: string): string {
    return `Hit error throttling limit | ${this.throttleConfig.tokensPerInterval}/${this.throttleConfig.interval} | ${stringifiedError}`;
  }

  similarErrorMessage(stringifiedError: string): string {
    return `Hit max error limit for single error | ${this.similarErrorConfig.maxSimilarErrors} | ${stringifiedError}`;
  }

  getSentryError(stringifiedError: string): string | undefined {
    if (this.throttledFlag) {
      return undefined; // we already sent a throttle exception to sentry
    }

    const throttleOkay = this.binaryErrorLimiter.tryRemoveTokens(1);

    if (throttleOkay === false) {
      this.throttledFlag = true;
      return this.throttleMessage(stringifiedError);
    }

    const shortFormException = stringifiedError.slice(
      0,
      this.similarErrorConfig.maxSimilarCharLength
    );

    if (this.filteredErrors.indexOf(shortFormException) > -1) {
      return undefined; // previously filtered, ignore
    }

    const amount = this.lastXErrorStarts.filter(
      (a) => a === shortFormException
    ).length;

    this.lastXErrorStarts.push(shortFormException);

    if (amount >= this.similarErrorConfig.maxSimilarErrors) {
      this.filteredErrors.push(shortFormException);
      return this.similarErrorMessage(stringifiedError);
    }
    return stringifiedError;
  }
}
