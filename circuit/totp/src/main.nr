// main.nr

use std::hash::poseidon;

fn main(
    // Private
    secret: Field, // 32-byte TOTP secret (for Poseidon check)
    otp_code: Field, // 6-digit code
    // Public
    hashed_secret: Field,
    hashed_otp: Field,
    time_step: Field,
    action_hash: Field,
    tx_nonce: Field,
) {
    let computed_hashed_secret = poseidon::bn254::hash_1([secret]);
    assert(computed_hashed_secret == hashed_secret);

    let computed_otp_hash = poseidon::bn254::hash_1([otp_code]);
    assert(computed_otp_hash == hashed_otp);

    let _unused1 = action_hash;
    let _unused2 = tx_nonce;
    let _unused3 = time_step;
}

