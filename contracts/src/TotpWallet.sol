// SPDX-License-Identifier: MIT
pragma solidity ^0.8.17;

// An interface for your ZK verifier contract:
interface IZKVerifier {
    function verifyProof(
        bytes calldata proofData,
        uint256 timeStep,
        bytes32 hashedSecretFromProof,
        bytes32 actionHash,
        uint256 txNonce
    ) external view returns (bool);
}

contract TOTPWallet {
    // ------------------
    // State Variables
    // ------------------

    // The hash of the TOTP secret (Poseidon or Keccak hash)
    bytes32 public hashedSecret;

    // Keep track of used nonces to prevent replay
    mapping(uint256 => bool) public usedNonces;

    // The address of your ZK verifier contract
    IZKVerifier public verifier;

    // The owner of this wallet (could be a single user or a multi-sig, etc.)
    address public owner;

    // -------------
    // Events
    // -------------

    event WalletInitialized(bytes32 hashedSecret);
    event ExecutedAction(bytes32 actionHash, address caller);

    // --------------
    // Constructor
    // --------------

    constructor(address _verifier) {
        verifier = IZKVerifier(_verifier);
        owner = msg.sender;
    }

    // -------------
    // Modifiers
    // -------------

    modifier onlyOwner() {
        require(msg.sender == owner, "Not owner");
        _;
    }

    // -------------
    // Public Functions
    // -------------

    /**
     * @notice Initialize or reset the wallet with a new hashed secret
     * @param _hashedSecret  The hash of the user's TOTP secret
     */
    function initializeWallet(bytes32 _hashedSecret) external onlyOwner {
        // Typically set once, or you could allow changing hashedSecret if your logic demands it
        hashedSecret = _hashedSecret;
        emit WalletInitialized(_hashedSecret);
    }

    /**
     * @notice Execute an action if the TOTP-based proof is valid
     * @param proofData  The serialized ZK proof
     * @param timeStep   floor(block.timestamp / 30)
     * @param hashedSecretFromProof  Must match 'hashedSecret' on-chain
     * @param actionHash Some unique identifier (keccak of the real action data)
     * @param txNonce    A unique nonce to prevent replay
     *
     * Example:
     *   user -> circuit:
     *       private: (secret, otp_code)
     *       public: (hashedSecret, timeStep, actionHash, txNonce)
     */
    function executeAction(
        bytes calldata proofData,
        uint256 timeStep,
        bytes32 hashedSecretFromProof,
        bytes32 actionHash,
        uint256 txNonce
    ) external {
        // 1. Check replay
        require(!usedNonces[txNonce], "Nonce already used");

        // 2. Check hashed secret
        require(hashedSecretFromProof == hashedSecret, "Invalid hashed secret");

        // 3. Verify the proof with the external ZK Verifier
        bool valid = verifier.verifyProof(
            proofData,
            timeStep,
            hashedSecretFromProof,
            actionHash,
            txNonce
        );
        require(valid, "Invalid ZK proof");

        // 4. Mark nonce used
        usedNonces[txNonce] = true;

        // 5. Perform the action (for demo, we just emit an event)
        // In a real wallet, you'd decode actionHash or store pending actions
        emit ExecutedAction(actionHash, msg.sender);

        // Example:
        // if(actionHash == keccak256(abi.encode("transferFunds", to, amount))) {
        //    _transferFunds(to, amount);
        // }
        // else if(actionHash == keccak256(...)) { ... }
    }

    /**
     * @notice Optionally let the owner change the owner address
     */
    function updateOwner(address newOwner) external onlyOwner {
        require(newOwner != address(0), "Zero address not allowed");
        owner = newOwner;
    }

    function updateHashedSecret(bytes32 newHashedSecret) external onlyOwner {
        require(newHashedSecret != bytes32(0), "Empty bytes32 not allowed");
        hashedSecret = newHashedSecret;
    }
}
