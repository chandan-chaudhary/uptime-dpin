import { HttpClient, Logger } from "../interfaces/core";
import {
  ValidationResult,
  ValidationTask,
  ValidatorError,
} from "../interfaces/validation";
import {
  VALIDATION_STATUS,
  HTTP_SUCCESS_STATUS,
  VALIDATION_TIMEOUT,
} from "../constants";

/**
 * Service for performing website uptime validation
 */
export class ValidationService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly logger: Logger,
    private readonly proxyUrl?: string
  ) {}

  /**
   * Validate a website's uptime and response time
   */
  async validateWebsite(task: ValidationTask): Promise<ValidationResult> {
    const startTime = Date.now();

    try {
      const targetUrl = this.proxyUrl
        ? `${this.proxyUrl}?url=${encodeURIComponent(task.url)}`
        : task.url;

      const response = await this.httpClient.get(targetUrl);
      const latency = Date.now() - startTime;

      // If using proxy, response.data contains the actual status
      const actualStatus =
        this.proxyUrl && response.data?.status
          ? response.data.status
          : response.status;

      const status =
        actualStatus === HTTP_SUCCESS_STATUS
          ? VALIDATION_STATUS.GOOD
          : VALIDATION_STATUS.BAD;

      this.logger.info(
        `${task.url}: ${actualStatus}, ${latency}ms, in Validator`
      );

      return {
        status,
        latency,
        actualStatus,
      };
    } catch (error: any) {
      const latency = Date.now() - startTime;
      this.logger.warn(
        `Validation failed for ${task.url}: ${error?.message || error}`
      );

      return {
        status: VALIDATION_STATUS.BAD,
        latency,
        actualStatus: 0, // Error status
      };
    }
  }
}
