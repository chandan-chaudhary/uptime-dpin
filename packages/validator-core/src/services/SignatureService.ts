import { ethers } from "ethers";
import { Logger } from "../interfaces/core";
import { ValidatorError } from "../interfaces/validation";
import { ERROR_MESSAGES } from "../constants";

/**
 * Service for cryptographic signing operations
 */
export class SignatureService {
  constructor(
    private readonly signer: ethers.Signer,
    private readonly logger: Logger
  ) {}

  /**
   * Sign a message with the validator's wallet
   */
  async signMessage(message: string): Promise<string> {
    try {
      const signature = await this.signer.signMessage(message);
      return signature;
    } catch (error: any) {
      this.logger.error(`❌ Error signing message: ${error?.message || error}`);
      throw new ValidatorError(
        ERROR_MESSAGES.SIGNATURE_FAILED,
        "SIGNATURE_ERROR",
        error
      );
    }
  }

  /**
   * Get the public key (address) of the signer
   */
  async getPublicKey(): Promise<string> {
    try {
      return await this.signer.getAddress();
    } catch (error: any) {
      this.logger.error(
        `❌ Error getting public key: ${error?.message || error}`
      );
      throw new ValidatorError(
        "Failed to get public key",
        "PUBLIC_KEY_ERROR",
        error
      );
    }
  }
}
