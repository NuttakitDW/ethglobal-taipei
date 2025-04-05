// src/index.ts

import { serve } from "bun";

// Noir / Aztec libs
import { compile, createFileManager } from "@noir-lang/noir_wasm";
import { Noir } from "@noir-lang/noir_js";
import { UltraHonkBackend } from "@aztec/bb.js";

// ACVM / noirc_abi
import initNoirC from "@noir-lang/noirc_abi";
import initACVM from "@noir-lang/acvm_js";

// WebAssembly modules needed
import acvm from "@noir-lang/acvm_js/web/acvm_js_bg.wasm?url";
import noirc from "@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url";

// If you prefer local file reading in Bun, you can do that instead of "?url" approach:
import fs from "fs";
import path from "path";

/**
 * toBytes32
 * - Zero-pad hex string to length 66 (0x + 64 hex) for bytes32.
 */
function toBytes32(hexStr: string): string {
  let clean = hexStr.replace(/^0x/, "");
  while (clean.length < 64) {
    clean = "0" + clean;
  }
  return "0x" + clean;
}

/**
 * Break a (potentially large) hex string into 32-byte chunks as `bytes32[]`.
 */
function toBytes32Array(hexStr: string): string[] {
  const clean = hexStr.replace(/^0x/, "");
  const chunkSize = 64; // 32 bytes = 64 hex characters
  const result: string[] = [];

  for (let i = 0; i < clean.length; i += chunkSize) {
    const chunk = clean.slice(i, i + chunkSize);
    result.push("0x" + chunk);
  }

  return result;
}

// -------------------- WASM INIT --------------------
(async () => {
  await Promise.all([
    initACVM(fetch(acvm)),
    initNoirC(fetch(noirc))
  ]);
  console.log("[Noir] ACVM & noirc_abi modules initialized!");
})();

// Example function to compile the circuit from disk
// (Assuming main.nr is at './circuit/src/main.nr')
async function getCompiledCircuit() {
  // Simple approach: read file contents from local disk
  const mainCircuitSource = fs.readFileSync(
    path.join(__dirname, "circuit", "src", "main.nr"),
    "utf8"
  );

  // For the compile call, we need a "fileManager"
  const fileManager = createFileManager({
    readFile: async (pathStr: string) => {
      // If Noir requests "main.nr", return the string
      if (pathStr.endsWith("main.nr")) {
        return mainCircuitSource;
      }
      // If circuit references additional .nr files, handle them similarly
      // If references Nargo.toml, read that
      if (pathStr.endsWith("Nargo.toml")) {
        return fs.readFileSync(
          path.join(__dirname, "circuit", "Nargo.toml"),
          "utf8"
        );
      }
      throw new Error(`File not found: ${pathStr}`);
    },
  });

  const compiled = await compile("main.nr", fileManager);
  return compiled;
}

// A helper to generate the proof from fixed inputs
async function generateProofFromCircuit() {
  // 1) Compile circuit
  const { program } = await getCompiledCircuit();

  // 2) Create Noir + backend
  const noir = new Noir(program);
  const backend = new UltraHonkBackend(program.bytecode);

  // 3) Hardcode your example inputs
  // You said in your example:
  // action_hash = "0"
  // hashed_otp   = "9296871482664815829572350227731615859613671321798777421412185744492749055678"
  // hashed_secret= "15590790710182840606832013891373017168266054012021149761087856963999545435767"
  // otp_code     = "209115"
  // secret       = "8908205071745768956754940712577663823191824575165388703111402954146780104548"
  // time_step    = "58128707"
  // tx_nonce     = "0"
  const input = {
    action_hash:  "0",
    hashed_otp:   "9296871482664815829572350227731615859613671321798777421412185744492749055678",
    hashed_secret:"15590790710182840606832013891373017168266054012021149761087856963999545435767",
    otp_code:     "209115",
    secret:       "8908205071745768956754940712577663823191824575165388703111402954146780104548",
    time_step:    "58128707",
    tx_nonce:     "0",
  };

  // 4) Execute circuit -> get witness
  const { witness } = await noir.execute(input);

  // 5) Generate proof (Uint8Array)
  const proofBytes = await backend.generateProof(witness);

  // Convert proof to hex
  const proofHex = "0x" + Buffer.from(proofBytes).toString("hex");

  // If your on-chain verifier expects a chunked bytes32 array:
  const proofBytes32Array = toBytes32Array(proofHex);

  console.log("[ZK] proofHex =>", proofHex);
  console.log("[ZK] proofBytes32Array =>", proofBytes32Array);

  // The public inputs typically are the circuit’s public variables.
  // For demonstration, let's assume these 7 fields are all "public".
  // Convert them to bytes32 if your contract uses that pattern.
  const publicInputs = Object.entries(input).map(([_, val]) => toBytes32(BigInt(val).toString(16)));

  console.log("[ZK] Public Inputs (bytes32[]) =>", publicInputs);

  return {
    proofHex,
    proofBytes32Array,
    publicInputs,
  };
}

// -------------------- Bun Server --------------------
serve({
  port: 3000,
  async fetch(request) {
    const url = new URL(request.url);
    if (url.pathname === "/proof" && request.method === "GET") {
      try {
        // Generate proof from your example input
        const result = await generateProofFromCircuit();

        // Return JSON
        return new Response(JSON.stringify(result, null, 2), {
          status: 200,
          headers: { "Content-Type": "application/json" },
        });
      } catch (err: any) {
        console.error("[ERROR]", err);
        return new Response(JSON.stringify({ error: err.message }), {
          status: 500,
          headers: { "Content-Type": "application/json" },
        });
      }
    }

    return new Response("Not Found", { status: 404 });
  },
});
