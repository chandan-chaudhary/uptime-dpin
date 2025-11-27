// SPDX-License-Identifier: UNLICENSED
pragma solidity ^0.8.28;

error Payment__OnlyOwner();
error Payment__PaymentMustBeGreaterThanZero();
error InvalidAddress();
error TransactionFailed();

contract Payment {
    event PaymentReceived(address indexed from, uint256 amount);
    event SentPayment_validator(address indexed to, uint256 amount);

    address private owner;
    constructor() {
        owner = msg.sender;
    }

    function changeOwner(address newOwner) external onlyOwner {
        if (msg.sender != owner) {
            revert Payment__OnlyOwner();
        }
        if (newOwner == address(0)) {
            revert InvalidAddress();
        }
        owner = newOwner;
    }

    function withdraw(uint256 amount) external onlyOwner {
        if (amount > address(this).balance) {
            revert Payment__PaymentMustBeGreaterThanZero();
        }
        payable(owner).transfer(amount);
        emit PaymentReceived(owner, amount);
    }

    function receivePayment(address from, uint256 amount) external payable {
        if (amount <= 0) {
            revert Payment__PaymentMustBeGreaterThanZero();
        }
        if (from == address(0)) {
            revert InvalidAddress();
        }
        emit PaymentReceived(payable(from), msg.value);
    }

    function payValidator(address validator) external payable {
        if (msg.value <= 0) {
            revert Payment__PaymentMustBeGreaterThanZero();
        }
        if (validator == address(0)) {
            revert InvalidAddress();
        }
        (bool success, ) = validator.call{value: msg.value}("");
        if (!success) {
            revert TransactionFailed();
        }
        emit PaymentReceived(validator, msg.value);
    }

    modifier onlyOwner() {
        if (msg.sender != owner) {
            revert Payment__OnlyOwner();
        }
        _;
    }

    // GETTER FUNCTION

    function getOwner() external view returns (address) {
        return owner;
    }
}
