#!/usr/bin/env node

const circomlibjs = require("circomlibjs");
require('dotenv').config();


// BN254 prime, in case you want to reduce your input mod the field
const BN254_PRIME_STR = "21888242871839275222246405745257275088548364400416034343698204186575808495617";
const BN254_PRIME = BigInt(BN254_PRIME_STR);

// 16×32 bit array
const secretBitsJson = process.env.SECRET_BITS_JSON;
if (!secretBitsJson) {
    throw new Error("SECRET_BITS_JSON not found in .env");
}

// Parse JSON into a 2D array
const secret_bits = JSON.parse(secretBitsJson);

console.log("Loaded secret_bits from .env:");
console.log(secret_bits);

// Flatten 16x32 => array of 512 bits (LSB-first)
function flatten512(twoD) {
    const out = [];
    for (let i = 0; i < 16; i++) {
        for (let j = 0; j < 32; j++) {
            out.push(twoD[i][j]);
        }
    }
    return out; // length 512
}

// Convert 512 LSB-first bits => BigInt mod BN254
function bitsToBn254Field(lsbBits) {
    let x = 0n;
    for (let i = 0; i < lsbBits.length; i++) {
        if (lsbBits[i] === 1) {
            x |= (1n << BigInt(i));
        }
    }
    return x % BN254_PRIME;
}

async function main() {
    // 1) Build Poseidon instance
    const poseidon = await circomlibjs.buildPoseidon();

    // 2) Flatten bits => a single BigInt
    const flatBits = flatten512(secret_bits);
    const fieldElem = bitsToBn254Field(flatBits);

    // 3) Compute Poseidon hash on [fieldElem]
    const hashVal = poseidon([fieldElem]);

    // 4) Convert to decimal
    const hashDec = poseidon.F.toObject(hashVal).toString();
    console.log("Poseidon hash (decimal) =", hashDec);
}

main();
