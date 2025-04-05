// hmac_sha1.nr

type Word32 = [Field; 32];

pub fn hmac_sha1(key_block: [Word32; 16], time_high: Word32, time_low: Word32) -> [Word32; 5] {
    // 1) XOR key with ipad (0x36 repeated)
    let key_xor_ipad = xor_block_with_byte(key_block, 0x36);

    // 2) Build the two blocks for the inner HMAC
    let (inner_block1, inner_block2) = build_inner_blocks(key_xor_ipad, time_high, time_low);

    // 3) Perform the inner SHA1 over those 2 blocks
    //    Start with standard SHA-1 IV
    let iv = [
        to_word32(0x67452301),
        to_word32(0xEFCDAB89),
        to_word32(0x98BADCFE),
        to_word32(0x10325476),
        to_word32(0xC3D2E1F0),
    ];
    let inner_state = sha1_compress(sha1_compress(iv, inner_block1), inner_block2);
    // `inner_state` is a [Word32; 5] = 20-byte hash

    // 4) XOR key with opad (0x5C repeated)
    let key_xor_opad = xor_block_with_byte(key_block, 0x5C);

    // 5) Build the two blocks for the outer HMAC:
    //    block1 = (key ^ opad),
    //    block2 = inner_hash + padding
    let (outer_block1, outer_block2) = build_outer_blocks(key_xor_opad, inner_state);

    // 6) Final SHA1 over the outer blocks
    let final_hash = sha1_compress(sha1_compress(iv, outer_block1), outer_block2);

    final_hash
}

/// XOR a 512-bit block ([Word32; 16]) with a single byte (e.g., 0x36 for ipad or 0x5C for opad)
fn xor_block_with_byte(block: [Word32; 16], byte: u8) -> [Word32; 16] {
    let mut result = [[0; 32]; 16];
    // Convert the byte to a Word32. That means the 32-bit word has that byte repeated in bits?
    // Actually, we want to XOR each of the 32 bits in `block[i]` with the bits of `byte`.
    // But in HMAC, we XOR each of the key's BYTES with ipad's or opad's BYTES.
    // For simplicity, we treat each Word32 in the block as 4 bytes, each to be XORed with 'byte'.
    // A simpler approach is to interpret "byte" as the lower 8 bits repeated across all 32 bits
    // (0x36 => 0x36363636). This is common in many HMAC implementations.
    let byte_word32 = to_word32((byte as u32) * 0x01010101);
    for i in 0..16 {
        result[i] = xor_word32(block[i], byte_word32);
    }
    result
}

/// Build the two 512-bit blocks for the inner HMAC:
///  - Block1 = first 512 bits = (key ^ ipad) (64 bytes)
///  - Block2 = next 512 bits = 8 bytes of time + 0x80 + ... + length=576
///
///   total = 72 bytes => 576 bits => 2 blocks of 512 bits each.
fn build_inner_blocks(
    key_xor_ipad: [Word32; 16],
    time_high: Word32,
    time_low: Word32,
) -> ([Word32; 16], [Word32; 16]) {
    // Block1 is just the key (64 bytes) already XORed with ipad
    let block1 = key_xor_ipad;

    // Block2 layout:
    //   [0]   = time_high (4 bytes)
    //   [1]   = time_low  (4 bytes)
    //   [2]   = 0x80...   (1 byte set to 0x80, rest 0)
    //   [3..14] = zeros
    //   [15]  = length in bits (72 * 8 = 576)
    let mut block2 = [[0; 32]; 16];
    block2[0] = time_high;
    block2[1] = time_low;

    // Put the 0x80 bit at the start of the next byte => 0x80_00_00_00
    block2[2] = to_word32(0x80_00_00_00);

    // The final 32-bit word for block2 is the message length in bits: 72 bytes * 8 = 576
    block2[15] = to_word32(576);

    (block1, block2)
}

/// Convert a simple u32 into a Word32 for constants, if needed
fn to_word32(x: u32) -> Word32 {
    let mut w: Word32 = [0; 32];
    for i in 0..32 {
        let shift = 31 - i;
        let bit = (x >> shift) & 1;
        // convert (0 or 1) to Field
        w[i] = if bit == 1 { 1 } else { 0 };
    }
    w
}

/// Single-round compress for a single 512-bit block
pub fn sha1_compress(
    state: [Word32; 5], // [h0, h1, h2, h3, h4]
    block: [Word32; 16], // 512 bits => 16 x Word32
) -> [Word32; 5] {
    // 1. Prepare message schedule W[0..79]
    let mut w: [Word32; 80] = [[0; 32]; 80];
    for i in 0..16 {
        w[i] = block[i];
    }
    for i in 16..80 {
        let temp1 = xor_word32(w[i - 3], w[i - 8]);
        let temp2 = xor_word32(w[i - 14], w[i - 16]);
        let temp3 = xor_word32(temp1, temp2);
        w[i] = rotate_left(temp3, 1);
    }

    // 2. Initialize working vars
    let mut a = state[0];
    let mut b = state[1];
    let mut c = state[2];
    let mut d = state[3];
    let mut e = state[4];

    // 3. Constants
    // We'll define them as Word32:
    let k1 = to_word32(0x5A827999);
    let k2 = to_word32(0x6ED9EBA1);
    let k3 = to_word32(0x8F1BBCDC);
    let k4 = to_word32(0xCA62C1D6);

    // 4. 80 Rounds
    for i in 0..80 {
        // Determine f and k
        let (f, k) = if i < 20 {
            (f1(b, c, d), k1)
        } else if i < 40 {
            (f2(b, c, d), k2)
        } else if i < 60 {
            (f3(b, c, d), k3)
        } else {
            (f2(b, c, d), k4)
        };

        // temp = rotate_left(a, 5) + f + e + w[i] + k
        let temp1 = rotate_left(a, 5);
        let temp2 = add_word32(temp1, f);
        let temp3 = add_word32(temp2, e);
        let temp4 = add_word32(temp3, w[i]);
        let temp5 = add_word32(temp4, k);

        // e = d
        e = d;
        // d = c
        d = c;
        // c = rotate_left(b, 30)
        c = rotate_left(b, 30);
        // b = a
        b = a;
        // a = temp
        a = temp5;
    }

    // 5. Add chunk result to original state
    let new0 = add_word32(state[0], a);
    let new1 = add_word32(state[1], b);
    let new2 = add_word32(state[2], c);
    let new3 = add_word32(state[3], d);
    let new4 = add_word32(state[4], e);

    [new0, new1, new2, new3, new4]
}

/// Build the two 512-bit blocks for the outer HMAC:
///  - Block1 = (key ^ opad) (64 bytes)
///  - Block2 = 20-byte inner-hash + 0x80 + ... + length= (64 + 20) * 8 = 672
fn build_outer_blocks(
    key_xor_opad: [Word32; 16],
    inner_hash: [Word32; 5],
) -> ([Word32; 16], [Word32; 16]) {
    // Outer block1 is just key ^ opad
    let block1 = key_xor_opad;

    // Outer block2 is the 20-byte (5 Word32) inner hash + 0x80 + ... + length
    // total bytes = 64 (opad block) + 20 (inner hash) = 84 bytes => 672 bits
    let mut block2 = [[0; 32]; 16];
    // place inner hash in the first 5 Word32 positions
    for i in 0..5 {
        block2[i] = inner_hash[i];
    }

    // Next Word32 has the 0x80 bit
    block2[5] = to_word32(0x80_00_00_00);

    // The final 32-bit word for block2 is the message length in bits: 84 bytes * 8 = 672
    block2[15] = to_word32(672);

    (block1, block2)
}

// Single-bit ops

fn and_bit(a: Field, b: Field) -> Field {
    // a & b = a * b if bits
    a * b
}

fn xor_bit(a: Field, b: Field) -> Field {
    // a ^ b = a + b - 2ab
    a + b - (2 * a * b)
}

fn not_bit(a: Field) -> Field {
    // ~a = 1 - a
    1 - a
}

// For completeness, or_bit => a OR b = a + b - a*b
fn or_bit(a: Field, b: Field) -> Field {
    a + b - (a * b)
}

// 32-bit ops

fn xor_word32(a: Word32, b: Word32) -> Word32 {
    let mut r: Word32 = [0; 32];
    for i in 0..32 {
        r[i] = xor_bit(a[i], b[i]);
    }
    r
}

fn and_word32(a: Word32, b: Word32) -> Word32 {
    let mut r: Word32 = [0; 32];
    for i in 0..32 {
        r[i] = and_bit(a[i], b[i]);
    }
    r
}

fn not_word32(a: Word32) -> Word32 {
    let mut r: Word32 = [0; 32];
    for i in 0..32 {
        r[i] = not_bit(a[i]);
    }
    r
}

fn or_word32(a: Word32, b: Word32) -> Word32 {
    let not_a = not_word32(a);
    let not_b = not_word32(b);
    let temp = and_word32(not_a, not_b); // ~(a OR b) = ~a & ~b
    not_word32(temp) // a OR b = ~(~a & ~b)
}

// rotate_left(a, shift): index i -> (i + shift) % 32
fn rotate_left(a: Word32, shift: u32) -> Word32 {
    let mut r: Word32 = [0; 32];
    for i in 0..32 {
        let new_i = (i + shift) % 32;
        r[i] = a[new_i];
    }
    r
}

// 32-bit addition mod 2^32
fn add_word32(a: Word32, b: Word32) -> Word32 {
    let mut r: Word32 = [0; 32];
    let mut carry = 0; // a bit in {0,1}

    // index 31 is the least significant bit
    for i in 0..32 {
        let idx = 31 - i;
        let (sum_bit, new_carry) = add_bits(a[idx], b[idx], carry);
        r[idx] = sum_bit;
        carry = new_carry;
    }

    r
}

fn add_bits(x: Field, y: Field, cin: Field) -> (Field, Field) {
    // sum_bit = x ^ y ^ cin
    // carry_out = (x & y) | (x & cin) | (y & cin)
    let xy = and_bit(x, y);
    let xcin = and_bit(x, cin);
    let ycin = and_bit(y, cin);

    let temp = xor_bit(x, y);
    let sum_bit = xor_bit(temp, cin);

    // or_3_bits => a | b | c
    let ab = or_bit(xy, xcin);
    let carry_out = or_bit(ab, ycin);

    (sum_bit, carry_out)
}

/// These are small helper "f" functions used in SHA-1 rounds
pub fn f1(b: Word32, c: Word32, d: Word32) -> Word32 {
    // (b & c) | ((~b) & d)
    // We'll define ~b using a function from bitops
    let not_b = not_word32(b);
    let bc = and_word32(b, c);
    let nbd = and_word32(not_b, d);
    or_word32(bc, nbd)
}

pub fn f2(b: Word32, c: Word32, d: Word32) -> Word32 {
    // b ^ c ^ d
    let bc = xor_word32(b, c);
    xor_word32(bc, d)
}

pub fn f3(b: Word32, c: Word32, d: Word32) -> Word32 {
    // (b & c) | (b & d) | (c & d)
    let bc = and_word32(b, c);
    let bd = and_word32(b, d);
    let cd = and_word32(c, d);
    let temp = or_word32(bc, bd);
    or_word32(temp, cd)
}

/// One-shot SHA-1 for a single 512-bit block.
/// This sets the initial state to the standard IV and calls sha1_compress.
pub fn sha1_single_block(block: [Word32; 16]) -> [Word32; 5] {
    // Standard SHA-1 initial values
    let iv: [Word32; 5] = [
        to_word32(0x67452301), // h0
        to_word32(0xEFCDAB89), // h1
        to_word32(0x98BADCFE), // h2
        to_word32(0x10325476), // h3
        to_word32(0xC3D2E1F0), // h4
    ];

    sha1_compress(iv, block)
}

// Helper: convert Word32 -> u32
pub fn from_word32(w: Word32) -> u32 {
    let mut val = 0;
    for i in 0..32 {
        val <<= 1;
        let bit_u32 = if w[i] == 1 { 1 } else { 0 };
        val |= bit_u32;
    }
    val
}

#[test]
fn test_hmac_sha1_zero_key_time_1() {
    // 1) Key = 64 zero bytes => [Word32; 16] of all zero
    let key_block: [Word32; 16] = [[0; 32]; 16];

    // 2) time = 1 => time_high = 0, time_low = 1
    let time_high: Word32 = [0; 32];
    let mut time_low: Word32 = [0; 32];
    // Set the least significant bit in time_low
    time_low[31] = 1;

    // 3) Compute HMAC-SHA1
    let result = hmac_sha1(key_block, time_high, time_low);

    // 4) Compare each Word32 against the known reference
    //    'from_word32' converts a Word32 -> u32
    assert(from_word32(result[0]) == 0xeeb00b0b);
    assert(from_word32(result[1]) == 0xcc864679);
    assert(from_word32(result[2]) == 0xff2d8dd3);
    assert(from_word32(result[3]) == 0x0bec495c);
    assert(from_word32(result[4]) == 0xb5f2ee9e);

    // If all asserts pass, the test is successful!
}
