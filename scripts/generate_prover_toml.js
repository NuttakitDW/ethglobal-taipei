#!/usr/bin/env node

/**
 * Node.js script that:
 *  1) Loads SECRET from .env
 *  2) Decodes Base32 -> raw bytes
 *  3) Reduces secret to BN254 prime => secret_raw < prime
 *  4) Builds secret_bits (512 bits) from the *original* integer 
 *  5) time_step, TOTP code
 *  6) Poseidon hash of the modded secret
 *  7) Writes Prover.toml
 */

const fs = require("fs");
const base32 = require("base32.js");
const crypto = require("crypto");
const circomlibjs = require("circomlibjs");
require('dotenv').config();

async function main() {
    // 1) Load Base32 secret from .env
    const b32_secret = process.env.SECRET;
    if (!b32_secret) {
        throw new Error("No SECRET found in .env");
    }

    // Base32 decode
    const b32_secret_padded = padBase32(b32_secret);
    const secret_bytes = base32Decode(b32_secret_padded);

    // Convert raw bytes -> BigInt (big-endian)
    const secret_int_orig = bytesToBigIntBE(secret_bytes);

    // 2) Reduce to BN254 prime => this is your `secret_raw` that the circuit sees
    const BN254_PRIME = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
    const secret_int_mod = secret_int_orig % BN254_PRIME;
    const secret_str = secret_int_mod.toString();  // <--- store as decimal for Noir

    // 4) time_step = floor(UNIX_time / 30)
    const time_step_val = Math.floor(Date.now() / 1000 / 30);

    // 5) TOTP code via HMAC-SHA1 on the *original* secret bytes
    const otp_code_val = computeTOTP6(secret_bytes, time_step_val);

    // 6) Poseidon BN254 hash of the reduced `secret_raw`
    const hashed_secret_str = await computePoseidonHash(secret_int_mod);
    const hashed_otp_str = await computePoseidonHash([otp_code_val]);

    // placeholders
    const action_hash_str = "0";
    const tx_nonce_str = "0";

    // 7) Write Prover.toml
    const proverToml = buildProverToml({
        action_hash_str,
        hashed_otp_str,
        hashed_secret_str,
        otp_code_val,
        secret_str,
        time_step_val,
        tx_nonce_str
    });

    fs.writeFileSync("Prover.toml", proverToml, "utf8");
    console.log("Prover.toml generated successfully!");
    console.log("otp_code =", otp_code_val);
    console.log("hashed_secret =", hashed_secret_str);
}

main().catch(err => {
    console.error(err);
    process.exit(1);
});

// ---------------------------
// Helper Functions
// ---------------------------

function padBase32(s) {
    const missing = (8 - (s.length % 8)) % 8;
    return s + "=".repeat(missing);
}

function base32Decode(b32str) {
    const decoder = new base32.Decoder();
    return new Uint8Array(decoder.write(b32str).finalize());
}

function bytesToBigIntBE(bytes) {
    let x = 0n;
    for (const b of bytes) {
        x = (x << 8n) + BigInt(b);
    }
    return x;
}

/**
 * Build 512 bits in LSB-first order, chunked as 16 x 32
 * If actual bits < 512, zero-pad the top.
 * We do this from the *original* big int.
 */
function buildSecretBitsArray(secretInt, byteLen) {
    const totalBits = byteLen * 8;
    const bits512 = [];
    for (let i = 0; i < 512; i++) {
        if (i < totalBits) {
            const bit = (secretInt >> BigInt(i)) & 1n;
            bits512.push(bit.toString());
        } else {
            bits512.push("0");
        }
    }

    const out = [];
    for (let chunk_i = 0; chunk_i < 16; chunk_i++) {
        const start = chunk_i * 32;
        out.push(bits512.slice(start, start + 32));
    }
    return out;
}

/**
 * HMAC-SHA1 TOTP, returns a 6-digit code
 */
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

/**
 * Poseidon BN254 using circomlibjs
 * Hash single input: x mod prime => returns decimal string
 */
async function computePoseidonHash(xField) {
    const poseidon = await circomlibjs.buildPoseidon();
    const hVal = poseidon([xField]);
    const hBig = poseidon.F.toObject(hVal);
    return hBig.toString();
}

/**
 * Construct Prover.toml
 */
function buildProverToml({
    action_hash_str,
    hashed_otp_str,
    hashed_secret_str,
    otp_code_val,
    secret_str,
    time_step_val,
    tx_nonce_str
}) {
    let lines = [];
    lines.push(`action_hash = "${action_hash_str}"`);
    lines.push(`hashed_otp = "${hashed_otp_str}"`);
    lines.push(`hashed_secret = "${hashed_secret_str}"`);
    lines.push(`otp_code = "${otp_code_val}"\n`);
    lines.push(`secret = "${secret_str}"\n`);
    lines.push(`time_step = "${time_step_val}"`);
    lines.push(`tx_nonce = "${tx_nonce_str}"\n`);

    return lines.join("\n");
}
