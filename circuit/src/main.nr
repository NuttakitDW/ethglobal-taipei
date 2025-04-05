// main.nr

// 1) Import the hmac_sha1 module from "hmac_sha1.nr"
mod hmac_sha1;

// 3) The main circuit function, which takes key_block, time_high, time_low as inputs
fn main(
    // 16 Word32 elements => [[Field; 32]; 16]
    key_block_input: [[Field; 32]; 16],
    // Each Word32 => [Field; 32]
    time_high_input: [Field; 32],
    time_low_input: [Field; 32],
) {
    // 4) Call the HMAC-SHA1 function directly,
    //    since we already have them in the correct shape ([Word32; 16], Word32, Word32)
    let digest = hmac_sha1::hmac_sha1(key_block_input, time_high_input, time_low_input);

    // 5) digest is [Word32; 5] => each element is [Field; 32]
    //    Perform a simple sanity check.
    assert(digest.len() == 5);

    // (Optional) check each word is length 32:
    for i in 0..5 {
        assert(digest[i].len() == 32);
    }

    // If you have known test vectors, you could add:
    //   assert(digest[0][0] == some_expected_field_value);
    // etc.
}
