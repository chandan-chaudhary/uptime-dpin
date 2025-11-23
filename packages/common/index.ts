import { WebsiteStatus } from "@prisma/client";

export interface SignupIncomingMessage {
  ip: string;
  callbackId: string;
  publicKey: string;
  signedMessage: string;
}

export interface ValidateIncomingMessage {
  callbackId: string;
  status: WebsiteStatus;
  latency: number;
  websiteId: string;
  validatorId: string;
  signedMessage: string;
}

export interface SignupOutgoingMessage {
  callbackId: string;
  validatorId: string;
}
export interface ValidateOutgoingMessage {
  url: string;
  websiteId: string;
  callbackId: string;
}

export type IncomingMessage =
  | {
      type: "signup";
      data: SignupIncomingMessage;
    }
  | {
      type: "validate";
      data: ValidateIncomingMessage;
    };

export type OutgoingMessage =
  | {
      type: "signup";
      data: SignupOutgoingMessage;
    }
  | {
      type: "validate";
      data: ValidateOutgoingMessage;
    };
