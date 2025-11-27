import { buildModule } from "@nomicfoundation/hardhat-ignition/modules";

export default buildModule("PaymentsModule", (m) => {
  const payment = m.contract("Payment");

  // removed initialize call because the Payments contract doesn't implement initialize
  // m.call(payments, "initialize", []);

  return { payment };
});
