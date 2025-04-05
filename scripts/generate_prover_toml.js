#!/usr/bin/env node

/**
 * Node.js script that replicates your Python example:
 *  1) Decode Base32 TOTP secret
 *  2) Build secret_bits (512 bits, LSB-first)
 *  3) Compute time_step
 *  4) Compute TOTP code (6-digit HMAC-SHA1)
 *  5) Hash secret_raw with Poseidon BN254 (circomlibjs)
 *  6) Write Prover.toml
 */

const fs = require("fs");
const base32 = require("base32.js");  // from 'base32.js'
const crypto = require("crypto");
const circomlibjs = require("circomlibjs");
require('dotenv').config();

async function main() {
    // ---------------------------
    // 1) Base32 decode
    // ---------------------------
    const b32_secret = process.env.SECRET;

    const b32_secret_padded = padBase32(b32_secret);
    // decode with base32.js
    const secret_bytes = base32Decode(b32_secret_padded);

    // Convert those bytes into a big integer (big-endian)
    const secret_int = bytesToBigIntBE(secret_bytes);

    // ---------------------------
    // 2) Build `secret_raw` (decimal string for Noir)
    // ---------------------------
    const secret_raw_str = secret_int.toString();

    // ---------------------------
    // 3) Build `secret_bits` as 16 blocks × 32 bits each (512 bits total),
    //    LSB-first, zero-padded if < 512 bits
    // ---------------------------
    const secret_bits_array = buildSecretBitsArray(secret_int, secret_bytes.length);

    // ---------------------------
    // 4) Compute `time_step` = floor(Date.now()/1000 / 30)
    // ---------------------------
    const time_step_val = Math.floor(Date.now() / 1000 / 30);

    // ---------------------------
    // 5) Compute TOTP code (6-digit) via HMAC-SHA1
    // ---------------------------
    const otp_code_val = computeTOTP6(secret_bytes, time_step_val);

    // ---------------------------
    // 6) Poseidon BN254 hash of `secret_raw`
    //    using circomlibjs
    // ---------------------------
    const hashed_secret_str = await computePoseidonHash(secret_int);

    // placeholders (if needed)
    const action_hash_str = "0";
    const tx_nonce_str = "0";

    // ---------------------------
    // 7) Write Prover.toml
    // ---------------------------
    const proverToml = buildProverToml({
        secret_raw_str,
        secret_bits_array,
        otp_code_val,
        hashed_secret_str,
        time_step_val,
        action_hash_str,
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

// -----------------------------------------------------------------------------
// Helpers
// -----------------------------------------------------------------------------

/** 
 * Adds '=' padding so length is multiple of 8.
 */
function padBase32(s) {
    const missing = (8 - (s.length % 8)) % 8;
    return s + "=".repeat(missing);
}

/**
 * Decode base32 using base32.js 
 * Returns a Uint8Array of bytes
 */
function base32Decode(b32str) {
    const decoder = new base32.Decoder();
    return new Uint8Array(decoder.write(b32str).finalize());
}

/**
 * Convert bytes (big-endian) to BigInt
 */
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
 */
function buildSecretBitsArray(secretInt, byteLen) {
    // actual bits of the secret
    const totalBits = byteLen * 8;

    // We'll store bits in a single array of 512, LSB at index 0
    const bits512 = [];
    for (let i = 0; i < 512; i++) {
        if (i < totalBits) {
            const bit = (secretInt >> BigInt(i)) & 1n;
            bits512.push(bit.toString()); // "0" or "1"
        } else {
            bits512.push("0");
        }
    }

    // Now chunk into 16 x 32
    const out = [];
    for (let chunk_i = 0; chunk_i < 16; chunk_i++) {
        const start = chunk_i * 32;
        const end = start + 32;
        out.push(bits512.slice(start, end));
    }
    return out;
}

/**
 * TOTP 6-digit HMAC-SHA1
 */
function computeTOTP6(secretBytes, timeStep) {
    const msg = Buffer.alloc(8);
    msg.writeBigUInt64BE(BigInt(timeStep), 0);

    // HMAC-SHA1
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
 * Compute Poseidon hash of the secret_raw (as a BigInt) using circomlibjs 
 * We do: hashed_secret = poseidon([x mod prime]).
 * 
 * Returns a decimal string.
 */
async function computePoseidonHash(secretBigInt) {
    const poseidon = await circomlibjs.buildPoseidon();
    // reduce mod BN254
    const BN254_PRIME = BigInt("21888242871839275222246405745257275088548364400416034343698204186575808495617");
    const xField = secretBigInt % BN254_PRIME;

    const hVal = poseidon([xField]);
    // Convert from F to a normal BigInt
    const hBig = poseidon.F.toObject(hVal);
    return hBig.toString(); // decimal
}

/**
 * Build the Prover.toml text
 */
function buildProverToml({
    secret_raw_str,
    secret_bits_array,
    otp_code_val,
    hashed_secret_str,
    time_step_val,
    action_hash_str,
    tx_nonce_str
}) {
    let lines = [];
    lines.push("[private]");
    // secret_raw
    lines.push(`secret_raw = "${secret_raw_str}"\n`);

    // secret_bits
    lines.push("secret_bits = [");
    for (const row of secret_bits_array) {
        lines.push(`  [${row.join(", ")}],`);
    }
    lines.push("]\n");

    // otp_code
    lines.push(`otp_code = "${otp_code_val}"\n`);

    lines.push("[public]");
    lines.push(`hashed_secret = "${hashed_secret_str}"`);
    lines.push(`time_step = "${time_step_val}"`);
    lines.push(`action_hash = "${action_hash_str}"`);
    lines.push(`tx_nonce = "${tx_nonce_str}"\n`);

    return lines.join("\n");
}
