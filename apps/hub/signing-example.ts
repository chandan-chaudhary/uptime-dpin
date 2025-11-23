// Example: How to sign messages on validator side
// File: apps/validator/src/signing-example.ts

import { ethers } from "ethers";

/**
 * Example: Validator signs a message with their private key
 */
async function signMessage() {
  // 1. Create wallet from private key (validator has this)
  const privateKey = "0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef";
  const wallet = new ethers.Wallet(privateKey);

  console.log("Validator Address (Public Key):", wallet.address);

  // 2. Create message to sign (same format hub expects)
  const callbackId = "callback_123";
  const message = `This is signed message for ${wallet.address}, ${callbackId}`;

  console.log("Message to sign:", message);

  // 3. Sign the message
  const signature = await wallet.signMessage(message);

  console.log("Signature:", signature);

  // 4. Send to hub via WebSocket
  const signupMessage = {
    type: "signup",
    data: {
      publicKey: wallet.address,
      signedMessage: signature,
      callbackId: callbackId,
      ip: "192.168.1.1" // Optional
    }
  };

  console.log("\nSend this to hub:", JSON.stringify(signupMessage, null, 2));

  // 5. Verify locally (hub will do this)
  const recoveredAddress = ethers.verifyMessage(message, signature);
  console.log("\n✅ Verification:", recoveredAddress === wallet.address);
  console.log("Recovered address:", recoveredAddress);
}

signMessage();

/**
 * Output example:
 * 
 * Validator Address (Public Key): 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
 * Message to sign: This is signed message for 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266, callback_123
 * Signature: 0x123abc...def
 * 
 * Send this to hub:
 * {
 *   "type": "signup",
 *   "data": {
 *     "publicKey": "0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266",
 *     "signedMessage": "0x123abc...def",
 *     "callbackId": "callback_123",
 *     "ip": "192.168.1.1"
 *   }
 * }
 * 
 * ✅ Verification: true
 * Recovered address: 0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266
 */
