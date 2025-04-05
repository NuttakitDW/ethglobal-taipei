import { serve } from "bun";
import crypto from "crypto";
import { buildPoseidon } from "circomlibjs";

/**
 * We'll lazily initialize Poseidon to avoid re-building it on every request.
 */
let poseidonInstance: any = null;
async function getPoseidon() {
    if (!poseidonInstance) {
        poseidonInstance = await buildPoseidon();
    }
    return poseidonInstance;
}

/**
 * Compute Poseidon hash (BN254) for an array of BigInt inputs, returns decimal string.
 */
async function computePoseidonHash(inputs: BigInt[]): Promise<string> {
    const poseidon = await getPoseidon();
    const hashVal = poseidon(inputs);
    const hashBig = poseidon.F.toObject(hashVal);
    return hashBig.toString(); // decimal string
}

/**
 * Generate a random 32-byte hex, or use BigInt if you need a numeric type.
 */
function generateRandomNonce(): string {
    const randomBytes = crypto.randomBytes(32); // 32 bytes = 256 bits
    return "0x" + randomBytes.toString("hex");  // or convert to BigInt if you prefer
}

// ------------------ Bun Server ------------------
serve({
    port: 3000,
    async fetch(req: Request) {
        try {
            const url = new URL(req.url);

            if (url.pathname === "/generate" && req.method === "POST") {
                const { otp_code, secret } = await req.json();

                if (!otp_code || !secret) {
                    return new Response(
                        JSON.stringify({ error: "Missing otp_code or secret" }),
                        { status: 400, headers: { "Content-Type": "application/json" } }
                    );
                }

                // 1. Compute time_step from current timestamp (floor of now/30)
                const time_step_val = Math.floor(Date.now() / 1000 / 30);

                // 2. Generate a random tx_nonce
                const tx_nonce_str = generateRandomNonce();

                // 3. Hash the secret
                //    If 'secret' is in decimal, or you need to parse it to BigInt:
                //    For example, if secret = "8908205...", do:
                const secretBig = BigInt(secret);
                const hashed_secret_str = await computePoseidonHash([secretBig]);

                // 4. Hash the otp_code
                //    Typically an integer up to 6 digits, parse it to BigInt as well:
                const otpCodeBig = BigInt(otp_code);
                const hashed_otp_str = await computePoseidonHash([otpCodeBig]);

                // Compose the final object
                const result = {
                    // Mirror the fields from your script or circuit
                    action_hash: "0",          // or fill as needed
                    hashed_otp: hashed_otp_str,
                    hashed_secret: hashed_secret_str,
                    otp_code,                  // original code
                    secret,                    // original secret
                    time_step: time_step_val.toString(),
                    tx_nonce: tx_nonce_str
                };

                // Log for debugging
                console.log("[API] Generated Data =>", result);

                // Return JSON
                return new Response(JSON.stringify(result, null, 2), {
                    status: 200,
                    headers: { "Content-Type": "application/json" }
                });
            }

            // Fallback
            return new Response("Not Found", { status: 404 });
        } catch (err: any) {
            console.error(err);
            return new Response(JSON.stringify({ error: err.message }), {
                status: 500,
                headers: { "Content-Type": "application/json" }
            });
        }
    },
});
