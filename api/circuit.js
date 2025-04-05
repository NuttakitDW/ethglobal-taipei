import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import { ethers } from "ethers";
import base32 from "base32.js";
import crypto from "crypto";
import * as circomlibjs from "circomlibjs";

// -- Fix for __dirname in ESM --
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -- Noir + Barretenberg Imports --
import { UltraHonkBackend } from '@aztec/bb.js';
import { Noir } from '@noir-lang/noir_js';
import { compile, createFileManager } from "@noir-lang/noir_wasm";

const app = express();
app.use(express.json());

async function compileCircuit() {
    // Instead of pointing to 'main.nr' as the first argument,
    // point to the *directory* that has Nargo.toml and the src/ folder.

    const projectPath = path.join(__dirname, "circuit");

    const nargoTomlPath = path.join(__dirname, "circuit", "Nargo.toml");
    const mainNrPath = path.join(__dirname, "circuit", "src", "main.nr");

    const mainNr = fs.readFileSync(mainNrPath, "utf8");
    const nargoToml = fs.readFileSync(nargoTomlPath, "utf8");

    const fileManager = createFileManager({
        readFile: async (filePath) => {
            if (filePath.endsWith("main.nr")) return mainNr;
            if (filePath.endsWith("Nargo.toml")) return nargoToml;
            throw new Error(`File not found: ${filePath}`);
        },
    });

    return await compile(fileManager, projectPath);
}


/**
 * computeActionHash
 * Matches keccak256(abi.encode("transferFunds", to, amount)) in Solidity
 *
 * @param {string} to       - The receiver address (e.g. "0xAbCd1234...")
 * @param {string|number} amount - The ETH amount (in wei, as a string or BN)
 * @returns {string}        - A 32-byte hex string (0x...)
 */
function computeActionHash(to, amount) {
    // This matches keccak256(abi.encode("transferFunds", to, amount)) in Solidity
    return ethers.utils.solidityKeccak256(
        ["string", "address", "uint256"],
        ["transferFunds", to, amount]
    );
}

function computeTOTP6(secretBytes, timeStep) {
    const msg = Buffer.alloc(8);
    msg.writeBigUInt64BE(BigInt(timeStep), 0);

    const digest = crypto
        .createHmac("sha1", secretBytes)
        .update(msg)
        .digest();

    const offset = digest[19] & 0x0f;
    const binCode =
        ((digest[offset] & 0x7f) << 24) |
        ((digest[offset + 1] & 0xff) << 16) |
        ((digest[offset + 2] & 0xff) << 8) |
        (digest[offset + 3] & 0xff);
    return binCode % 1000000;
}

function bytesToBigIntBE(bytes) {
    let x = 0n;
    for (const b of bytes) {
        x = (x << 8n) + BigInt(b);
    }
    return x;
}

async function computePoseidonHash(xField) {
    const poseidon = await circomlibjs.buildPoseidon();
    const hVal = poseidon([xField]);
    const hBig = poseidon.F.toObject(hVal);
    return hBig.toString();
}

function padBase32(s) {
    const missing = (8 - (s.length % 8)) % 8;
    return s + "=".repeat(missing);
}

function base32Decode(b32str) {
    const decoder = new base32.Decoder();
    return new Uint8Array(decoder.write(b32str).finalize());
}


async function generateProof(secret_ori, otp_code, to, amount) {
    const tx_nonce = Math.floor(Math.random() * 1000000); // Generate a random number for tx_nonce
    const padBase32Secret = padBase32(secret_ori); // Pad the secret to be base32 compliant
    const secret_bytes = base32Decode(padBase32Secret);
    const secret_int_orig = bytesToBigIntBE(secret_bytes);

    const BN254_PRIME = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
    const secret_int_mod = secret_int_orig % BN254_PRIME;
    const secret = secret_int_mod.toString();


    // Hash the decodedSecret using Poseidon hash
    const time_step = Math.floor(Date.now() / 30000); // Compute time_step from the current timestamp
    const action_hash = computeActionHash(to, amount) // Hash 'to' and 'amount' using keccak256 for contract compatibility

    const otp_code_val = computeTOTP6(secret_bytes, time_step);

    const hashed_secret = await computePoseidonHash(secret_int_mod);
    const hashed_otp = await computePoseidonHash([otp_code_val]);


    const input = {
        secret,
        otp_code,
        hashed_secret,
        hashed_otp,
        time_step,
        action_hash,
        tx_nonce,
    };

    const { program } = await compileCircuit();
    const noir = new Noir(program);
    const backend = new UltraHonkBackend(program.bytecode);

    // Execute circuit => get witness
    const { witness } = await noir.execute(input);

    // Generate proof => returns { proof: Uint8Array, publicInputs: string[] } (typical shape)
    const { proof, publicInputs } = await backend.generateProof(witness);

    // Convert proof to hex
    const proofHex = "0x" + Buffer.from(proof).toString("hex");
    console.log("Got public inputs:", publicInputs);

    // Return both fields in an object
    return { proofHex, publicInputs };
}

app.post("/prove", async (req, res) => {
    try {
        const { secret, otp_code, to, amount } = req.body; // Get only required parameters from request body

        const { proofHex, publicInputs } = await generateProof(secret, otp_code, to, amount);

        res.json({ proofHex, publicInputs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.post("/prove", async (req, res) => {
    try {
        const { proofHex, publicInputs } = await generateProof(secret, otp_code, to, amount);
        res.json({ proofHex, publicInputs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.listen(3000, () => {
    console.log("Server listening on http://localhost:3000");
});
