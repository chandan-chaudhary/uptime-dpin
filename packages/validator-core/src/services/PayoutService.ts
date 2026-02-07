import { HttpClient, Logger } from "../interfaces/core";
import {
  PendingPayoutResponse,
  PayoutHistoryResponse,
  PayoutRequestResponse,
  ApiErrorResponse,
} from "../interfaces/api";
import { ApiError, ValidatorError } from "../interfaces/validation";
import { ERROR_MESSAGES } from "../constants";

/**
 * Service for handling payout-related API operations
 */
export class PayoutService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly logger: Logger
  ) {}

  /**
   * Get pending payout information
   */
  async getPendingPayout(
    apiUrl: string,
    validatorId: string
  ): Promise<PendingPayoutResponse> {
    this.ensureValidatorRegistered(validatorId);

    try {
      const response = await this.httpClient.get<PendingPayoutResponse>(
        `${apiUrl}/api/payments/payout/${validatorId}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleApiError(error, "Failed to fetch pending payout");
    }
  }

  /**
   * Get payout history
   */
  async getPayoutHistory(
    apiUrl: string,
    validatorId: string
  ): Promise<PayoutHistoryResponse> {
    this.ensureValidatorRegistered(validatorId);

    try {
      const response = await this.httpClient.get<PayoutHistoryResponse>(
        `${apiUrl}/api/payments/payout/${validatorId}/history`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleApiError(error, "Failed to fetch payout history");
    }
  }

  /**
   * Request a payout
   */
  async requestPayout(
    apiUrl: string,
    validatorId: string
  ): Promise<PayoutRequestResponse> {
    this.ensureValidatorRegistered(validatorId);

    try {
      const response = await this.httpClient.post<PayoutRequestResponse>(
        `${apiUrl}/api/payments/payout/${validatorId}`
      );
      return response.data;
    } catch (error: any) {
      throw this.handleApiError(error, "Failed to request payout");
    }
  }

  private ensureValidatorRegistered(validatorId: string): void {
    if (!validatorId) {
      throw new ValidatorError(ERROR_MESSAGES.NOT_REGISTERED, "NOT_REGISTERED");
    }
  }

  private handleApiError(error: any, defaultMessage: string): Error {
    if (error.response) {
      const apiError = error.response.data as ApiErrorResponse;
      return new ApiError(
        apiError.error || `${defaultMessage}: ${error.response.status}`,
        error.response.status,
        error
      );
    } else if (error.request) {
      return new ApiError(ERROR_MESSAGES.API_UNREACHABLE, undefined, error);
    }
    return new ApiError(
      `${defaultMessage}: ${error?.message || "Unknown error"}`,
      undefined,
      error
    );
  }
}
