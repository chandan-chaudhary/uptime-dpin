import { HttpClient, Logger } from "../interfaces/core";
import {
  LocationInfo,
  IpApiResponse,
  IpApiFallbackResponse,
} from "../interfaces/api";
import { IP_API_ENDPOINTS, ERROR_MESSAGES } from "../constants";

/**
 * Service for detecting validator's IP address and location
 */
export class LocationService {
  constructor(
    private readonly httpClient: HttpClient,
    private readonly logger: Logger
  ) {}

  /**
   * Get IP address and location information
   */
  async getLocation(): Promise<LocationInfo> {
    // Try primary IP API
    try {
      this.logger.info("🔍 Fetching IP/location from ipapi.co...");
      const response = await this.httpClient.get<IpApiResponse>(
        IP_API_ENDPOINTS.primary
      );

      if (response.status === 200 && response.data?.ip) {
        const location = this.formatLocation(response.data);
        this.logger.info(`✅ IP/Location: ${location} (${response.data.ip})`);
        return { ip: response.data.ip, location };
      }
    } catch (error: any) {
      this.logger.warn(
        `⚠️ ipapi.co failed: ${error?.message || "Unknown error"}`
      );
    }

    // Try fallback IP API
    try {
      this.logger.info("🔍 Trying fallback: ip-api.com...");
      const response = await this.httpClient.get<IpApiFallbackResponse>(
        IP_API_ENDPOINTS.fallback
      );

      if (response.status === 200 && response.data?.query) {
        const location = this.formatLocationFallback(response.data);
        this.logger.info(
          `✅ IP/Location (fallback): ${location} (${response.data.query})`
        );
        return { ip: response.data.query, location };
      }
    } catch (error: any) {
      this.logger.warn(
        `⚠️ ip-api.com failed: ${error?.message || "Unknown error"}`
      );
    }

    // Return defaults if all methods fail
    this.logger.error("❌ All IP detection methods failed, using defaults");
    return { ip: "0.0.0.0", location: "Unknown" };
  }

  private formatLocation(data: IpApiResponse): string {
    const { city, region, country_name, country_code } = data;
    return (
      [city, region, country_name || country_code].filter(Boolean).join(", ") ||
      "Unknown"
    );
  }

  private formatLocationFallback(data: IpApiFallbackResponse): string {
    const { city, regionName, country, countryCode } = data;
    return (
      [city, regionName, country || countryCode].filter(Boolean).join(", ") ||
      "Unknown"
    );
  }
}
