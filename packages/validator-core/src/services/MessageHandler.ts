import { Logger, EventEmitter, UUIDGenerator } from "../interfaces/core";
import { ValidationService } from "./ValidationService";
import { SignatureService } from "./SignatureService";
import { LocationService } from "./LocationService";
import { ValidationTask } from "../interfaces/validation";
import { MESSAGE_TYPES } from "../constants";
import {
  IncomingMessage,
  OutgoingMessage,
  SignupOutgoingMessage,
  ValidateOutgoingMessage,
} from "@common/index";

/**
 * Handles incoming and outgoing messages for the validator
 */
export class MessageHandler {
  private callbacks: {
    [callbackId: string]: (data: SignupOutgoingMessage) => void;
  } = {};

  constructor(
    private readonly validationService: ValidationService,
    private readonly signatureService: SignatureService,
    private readonly locationService: LocationService,
    private readonly uuidGenerator: UUIDGenerator,
    private readonly logger: Logger,
    private readonly eventEmitter: EventEmitter
  ) {}

  /**
   * Handle incoming message from hub
   */
  async handleMessage(message: OutgoingMessage): Promise<void> {
    switch (message.type) {
      case MESSAGE_TYPES.SIGNUP:
        await this.handleSignup(message.data);
        break;
      case MESSAGE_TYPES.VALIDATE:
        await this.handleValidate(message.data);
        break;
      default:
        // message is narrowed to 'never' here when all union members are handled,
        // so cast to any to safely access the type for logging.
        this.logger.warn(`Unknown message type: ${(message as any).type}`);
    }
  }

  /**
   * Create signup message data
   */
  async createSignupData(publicKey: string): Promise<{
    message: any;
    callbackId: string;
  }> {
    const callbackId = this.uuidGenerator.generate();

    this.callbacks[callbackId] = (data: SignupOutgoingMessage) => {
      this.eventEmitter.emit("registered", data);
    };

    const { ip, location } = await this.locationService.getLocation();
    this.logger.info(`📍 Validator location: ${location} (${ip})`);

    const signedMessage = await this.signatureService.signMessage(
      `This is signed message for ${publicKey}, ${callbackId}`
    );

    const message = {
      type: MESSAGE_TYPES.SIGNUP,
      data: {
        ip,
        location,
        publicKey,
        signedMessage,
        callbackId,
      },
    };

    return { message, callbackId };
  }

  private async handleSignup(data: SignupOutgoingMessage): Promise<void> {
    const { callbackId, validatorId } = data;
    this.logger.info(`✅ Registered with hub. Validator ID: ${validatorId}`);

    const callback = this.callbacks[callbackId];
    if (callback) {
      callback(data);
      delete this.callbacks[callbackId];
    }
  }

  private async handleValidate(data: ValidateOutgoingMessage): Promise<void> {
    const task: ValidationTask = {
      url: data.url,
      websiteId: data.websiteId,
      callbackId: data.callbackId,
    };

    const result = await this.validationService.validateWebsite(task);

    // TODO: Implement proper signing
    const signedMessage = "should-sign-message-here";

    const response = {
      type: MESSAGE_TYPES.VALIDATE,
      data: {
        callbackId: data.callbackId,
        status: result.status,
        latency: result.latency,
        websiteId: data.websiteId,
        validatorId: await this.signatureService.getPublicKey(),
        signedMessage,
      },
    };

    this.eventEmitter.emit("validationResponse", response);
  }
}
