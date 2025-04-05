// main.nr

use std::hash::poseidon;

// If your HMAC code uses Word32 = [Field; 32]
type Word32 = [Field; 32];

// e.g., if you have hmac_sha1(...) expecting [Word32; 16] for the key block
mod hmac_sha1;

fn main(
    // Private
    secret_raw: Field, // 32-byte TOTP secret (for Poseidon check)
    secret_bits: [[Field; 32]; 16], // 512-bit bitwise secret (for HMAC)
    otp_code: Field, // 6-digit code
    // Public
    hashed_secret: Field,
    time_step: u64,
    action_hash: Field,
    tx_nonce: Field,
) {
    // 1) Poseidon check: poseidon(secret_raw) == hashed_secret
    let computed_hash = poseidon::bn254::hash_1([secret_raw]);
    assert(computed_hash == hashed_secret);

    // ------------------------------------------------
    // STEP 2) Convert 'time_step' into (time_high, time_low) in big-endian
    // ------------------------------------------------
    let (time_high, time_low) = to_big_endian_64_words(time_step);

    // 2) TOTP logic: e.g., call hmac_sha1
    //    Returns 5 Word32 => 5 * 32 bits = 160 bits total
    let hmac_result = hmac_sha1::hmac_sha1(secret_bits, time_high, time_low);

    // ------------------------------------------------
    // STEP 3) Compare HMAC result to otp_code
    //         using standard TOTP dynamic truncation
    // ------------------------------------------------
    // 3a) Flatten [Word32; 5] => [Field; 160] bits
    let hmac_bits = flatten_word32_array(hmac_result);

    // 3b) Dynamic truncate => 6-digit code
    let computed_otp = dynamic_truncate_mod_1e6(hmac_bits);

    // 3c) Compare to user-provided otp_code
    assert(computed_otp == otp_code);

    // ------------------------------------------------
    // 4) Include action_hash & tx_nonce in the proof
    // (No additional code needed unless you want constraints on them)
    let _unused1 = action_hash;
    let _unused2 = tx_nonce;
}

/// Converts a 64-bit integer (in `time_step`) into two 32-bit Word32 values
/// in **big-endian** order: (time_high, time_low)
fn to_big_endian_64_words(time_step: u64) -> (Word32, Word32) {
    let be_bits_64 = to_big_endian_64(time_step);

    // Split them: high 32 bits and low 32 bits (both big-endian).
    let mut time_high = [0.into(); 32];
    let mut time_low = [0.into(); 32];

    // be_bits_64[0..32] => high 32 bits, be_bits_64[32..64] => low 32 bits
    for i in 0..32 {
        time_high[i] = be_bits_64[i];
        time_low[i] = be_bits_64[i + 32];
    }

    (time_high, time_low)
}

/// Converts a Field (< 2^64) into an array of 64 bits (big-endian).
fn to_big_endian_64(x: u64) -> [Field; 64] {
    // 1) Decompose into 64 bits in little-endian order
    let bits_le: [bool; 64] = u64_to_le_bits(x);

    // 2) Reverse them for big-endian
    let mut bits_be = [0.into(); 64];
    for i in 0..64 {
        let bit_bool = bits_le[63 - i]; // MSB goes at index 0
        bits_be[i] = if bit_bool { 1.into() } else { 0.into() };
    }
    bits_be
}

/// Flatten [Word32; 5] => [Field; 160] bit array
/// (Assumes each Word32 is 32 bits in ascending bit order.)
fn flatten_word32_array(words: [Word32; 5]) -> [Field; 160] {
    let mut out = [0.into(); 160];
    let mut idx = 0;
    for w in 0..5 {
        for b in 0..32 {
            out[idx] = words[w][b];
            idx += 1;
        }
    }
    out
}

/// Standard TOTP dynamic truncation for a 160-bit HMAC-SHA1 array:
/// 1) offset = last nibble => bits[156..160]
/// 2) read 32 bits from offset*8..(offset*8 + 32)
/// 3) mask out MSB => 31 bits
/// 4) mod 10^6 => 6-digit code
fn dynamic_truncate_mod_1e6(hmac_bits: [Field; 160]) -> Field {
    // 1) Extract the last nibble (4 bits) from hmac_bits[156..160]
    //    We'll place them into a [Field; 32] array, with bits[0] = LSB, etc.
    let mut nibble_array = [0.into(); 32];
    for i in 0..4 {
        nibble_array[i] = hmac_bits[156 + i];
    }
    // Convert those 4 bits to u32 => offset
    let offset: u32 = bits_to_u32(nibble_array);

    // 2) The data segment is 32 bits starting at offset * 8
    //    We'll copy those 32 bits into another [Field; 32].
    let start_bit = offset * 8;
    let mut segment_array = [0.into(); 32];
    for i in 0..32 {
        segment_array[i] = hmac_bits[start_bit + i];
    }

    // Convert those 32 bits to a u32
    let full_32: u32 = bits_to_u32(segment_array);

    // 3) Mask out the MSB => a 31-bit integer
    let truncated_31 = full_32 & 0x7FFF_FFFF;

    // 4) mod 10^6 => 6-digit TOTP code
    let totp_u32 = truncated_31 % 1_000_000;

    // Return as a Field
    totp_u32.into()
}

/// Converts 32 bits (each as Field 0 or 1) into a u32.
/// bits[0] is the LSB, bits[31] is the MSB.
fn bits_to_u32(bits: [Field; 32]) -> u32 {
    let mut acc: u32 = 0;

    // Loop through each bit
    for i in 0..32 {
        // 1) Enforce this bit is 0 or 1
        let bit_val = constrain_bit(bits[i]);
        // 2) Shift it into position i and accumulate
        acc += bit_val << i;
    }

    // The final result in [0..2^32)
    acc
}

fn constrain_bit(f: Field) -> u32 {
    // Step 1: Compare f to 0 and f to 1; each comparison yields a bool in Noir.
    let eq_zero: bool = f == 0.into();
    let eq_one: bool = f == 1.into();

    // Step 2: Enforce "f must be 0 or 1".
    // One quick way: check that exactly one is true:
    //   eq_zero + eq_one == 1
    // In Noir, 'true' can be used like 1, 'false' like 0 for addition.
    // 2) Convert those booleans into Field values (0 or 1)
    let eq_zero_field: Field = if eq_zero { 1.into() } else { 0.into() };
    let eq_one_field: Field = if eq_one { 1.into() } else { 0.into() };

    // 3) Enforce "exactly one is true" => eq_zero_field + eq_one_field == 1
    //    This ensures f must be 0 or 1.
    assert(eq_zero_field + eq_one_field == 1);

    // 4) Return 1 if eq_one is true (i.e. f == 1), else 0
    if eq_one {
        1
    } else {
        0
    }
}

/// Manually convert a u64 into 64 little-endian bits.
/// - bit 0 in the returned array is the LSB
/// - bit 63 is the MSB
fn u64_to_le_bits(x: u64) -> [bool; 64] {
    let mut bits = [false; 64];
    let mut tmp = x;
    for i in 0..64 {
        bits[i] = (tmp & 1) == 1;
        tmp = tmp >> 1;
    }
    bits
}
