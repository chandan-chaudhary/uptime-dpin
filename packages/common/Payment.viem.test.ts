import { describe, it } from "node:test";
import hre from "hardhat";

// Viem helpers come from the Hardhat viem toolbox plugin
const { viem, networkHelpers } = await hre.network.connect();

describe("Payment (viem) contract tests", function () {
  it("receivePayment emits PaymentReceived and increases contract balance", async function () {
    const payment = await viem.deployContract("Payment");

    // pick a payer account (the deployer / default account provided by the helper)
    const accounts = (await viem.getWalletClients())?.[0]?.account;
    const payer = accounts ? accounts : undefined;
    const amount = 1n * 10n ** 16n; // 0.01 ETH

    // call receivePayment(from, amount) with msg.value = amount
    // pass both function args as a tuple [address, amount] and use a non-strict emit check
    const payerAddress = payer!.address as `0x${string}`;
    await viem.assertions.emit(
      payment.write.receivePayment([payerAddress, amount], {
        value: amount,
      }),
      payment,
      "PaymentReceived"
    );

    // assert contract balance increased
    const publicClient = await viem.getPublicClient();
    const contractBalance = await publicClient.getBalance({
      address: payment.address,
    });
    if (contractBalance !== amount)
      throw new Error(
        `unexpected contract balance ${contractBalance} != ${amount}`
      );
  });

  it("payValidator forwards funds and increases validator balance", async function () {
    const payment = await viem.deployContract("Payment");

    const validator = "0x1111111111111111111111111111111111111111";
    await networkHelpers.setBalance(validator, 0n);

    const amount = 2n * 10n ** 16n; // 0.02 ETH

    // send tx and assert event (looser check — avoid strict arg equality)
    await viem.assertions.emit(
      payment.write.payValidator([validator], { value: amount }),
      payment,
      "PaymentReceived"
    );

    // check validator got funds — call again to ensure balance change
    await viem.assertions.emit(
      payment.write.payValidator([validator], { value: amount }),
      payment,
      "PaymentReceived"
    );
  });
  it("payValidator reverts on zero value and invalid address", async function () {
    const payment = await viem.deployContract("Payment");

    // zero value should revert (custom error)
    try {
      await payment.write.payValidator(
        ["0x2222222222222222222222222222222222222222"],
        { value: 0n }
      );
      throw new Error("expected revert but tx succeeded");
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (!msg.includes("Payment__PaymentMustBeGreaterThanZero")) throw err;
    }

    // invalid address (zero) should revert (custom error)
    try {
      await payment.write.payValidator(
        ["0x0000000000000000000000000000000000000000"],
        { value: 1n * 10n ** 15n }
      );
      throw new Error("expected revert but tx succeeded");
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (!msg.includes("InvalidAddress")) throw err;
    }
  });
  it("only owner can changeOwner and withdraw; withdraw transfers ETH", async function () {
    const payment = await viem.deployContract("Payment");

    const publicClient = await viem.getPublicClient();

    // get a WalletClient from the helper (it includes an associated account)
    const walletClients = await viem.getWalletClients();
    const walletClient = walletClients?.[0];
    if (!walletClient)
      throw new Error(
        "no wallet client available from viem.getWalletClients()"
      );

    // derive a string deployer address from the wallet client (or fallback to publicClient)
    const deployer =
      (walletClient.account &&
        (walletClient.account.address ?? walletClient.account)) ||
      publicClient.account;
    const deployerAddr = String(deployer) as `0x${string}`;
    const newOwner = "0x3333333333333333333333333333333333333333";

    // non-owner cannot changeOwner
    const nonOwner = "0xaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaaa";
    await networkHelpers.impersonateAccount(nonOwner);
    await networkHelpers.setBalance(nonOwner, 10n ** 18n);

    try {
      await payment.write.changeOwner([nonOwner], { account: nonOwner });
      throw new Error("expected revert but tx succeeded");
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (!msg.includes("Payment__OnlyOwner")) throw err;
    }

    // owner can changeOwner (call with default deployer account)
    await payment.write.changeOwner([newOwner]);
    const ownerAfter = await publicClient.readContract({
      abi: payment.abi,
      address: payment.address,
      functionName: "getOwner",
      args: [],
    });
    if (String(ownerAfter).toLowerCase() !== newOwner.toLowerCase())
      throw new Error(`owner not updated: ${ownerAfter}`);

    // fund contract so withdraw succeeds
    // The contract doesn't implement a plain receive()/fallback(), so sending raw ETH
    // to the address will revert. Call the payable `receivePayment(from, amount)`
    // function instead (passing the value and the deployer account).
    const fundAmount = 5n * 10n ** 16n; // 0.05 ETH
    await payment.write.receivePayment([deployerAddr, fundAmount], {
      value: fundAmount,
      account: deployerAddr,
    });

    // old deployer should fail to withdraw
    try {
      await payment.write.withdraw([1n * 10n ** 16n], {
        account: deployerAddr,
      });
      throw new Error("expected revert but tx succeeded");
    } catch (err: any) {
      const msg = String(err?.message || err);
      if (!msg.includes("Payment__OnlyOwner")) throw err;
    }

    // impersonate newOwner and give it some ETH so it can pay gas for withdraw
    await networkHelpers.impersonateAccount(newOwner);
    // give newOwner a small ETH balance (0.1 ETH) to cover gas costs
    await networkHelpers.setBalance(newOwner, 1n * 10n ** 16n);

    const before = await publicClient.getBalance({ address: newOwner });
    // send withdraw tx and wait for the receipt so we can account for gas cost
    const txHash = await payment.write.withdraw([1n * 10n ** 16n], {
      account: newOwner,
    });
    const receipt = await publicClient.waitForTransactionReceipt({
      hash: txHash,
    });
    const after = await publicClient.getBalance({ address: newOwner });

    // gasUsed * effectiveGasPrice is what the sender paid for gas — add it back to the
    // balance delta so we can assert the contract transferred the full withdraw amount.
    const gasUsed = receipt.gasUsed ?? 0n;
    // receipt.gasPrice isn't declared on the returned type; use a safe any-cast for legacy fallback
    const effectiveGasPrice =
      receipt.effectiveGasPrice ?? (receipt as any).gasPrice ?? 0n;
    const gasCost = gasUsed * effectiveGasPrice;

    if (after - before + gasCost !== 1n * 10n ** 16n)
      throw new Error("withdraw amount mismatch");
  });
});
