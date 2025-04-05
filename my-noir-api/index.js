const express = require("express");
const fs = require("fs");
const path = require("path");

// ------------------ Noir + Barretenberg Imports ------------------
import { UltraHonkBackend } from '@aztec/bb.js';
import { Noir } from '@noir-lang/noir_js';
import initNoirC from "@noir-lang/noirc_abi";
import initACVM from "@noir-lang/acvm_js";
import acvm from "@noir-lang/acvm_js/web/acvm_js_bg.wasm?url";
import noirc from "@noir-lang/noirc_abi/web/noirc_abi_wasm_bg.wasm?url";
await Promise.all([initACVM(fetch(acvm)), initNoirC(fetch(noirc))]);

// We'll need Node's `fs/promises` for reading the wasm files:
const { readFile } = require("fs/promises");

// ------------------ Express Setup ------------------
const app = express();
app.use(express.json());

// We wrap the WASM initialization in a function so we can await it once at startup.
async function initNoirWasm() {
    const acvmBytes = await readFile(acvmWasm);
    const noircBytes = await readFile(noircWasm);

    // The init functions accept an async function returning the .wasm bytes.
    await Promise.all([
        initACVM(async () => acvmBytes),
        initNoirC(async () => noircBytes),
    ]);

    console.log("[Noir] ACVM & noirc_abi modules initialized (Node)!");
}

// Function to compile the circuit from local disk
async function compileCircuit() {
    // Read main.nr and Nargo.toml
    const mainNr = fs.readFileSync(path.join(__dirname, "circuit", "src", "main.nr"), "utf8");
    const nargoToml = fs.readFileSync(path.join(__dirname, "circuit", "Nargo.toml"), "utf8");

    const fileManager = createFileManager({
        readFile: async (filePath) => {
            if (filePath.endsWith("main.nr")) {
                return mainNr;
            }
            if (filePath.endsWith("Nargo.toml")) {
                return nargoToml;
            }
            // If you have multiple files, handle them similarly. 
            throw new Error(`File not found: ${filePath}`);
        },
    });

    // Compile: references "main.nr" as the entry file 
    return await compile("main.nr", fileManager);
}

// This function runs the circuit with the user input, generates proof, and verifies it
async function generateProof(ageInput) {
    // 1) Compile circuit => { program }
    const { program } = await compileCircuit();

    // 2) Create Noir instance & Barretenberg backend
    const noir = new Noir(program);
    const backend = new UltraHonkBackend(program.bytecode);

    // 3) Execute circuit => get witness
    //    The circuit's main function: fn main(age: u8)
    const { witness } = await noir.execute({ age: ageInput });

    // 4) Generate proof
    const proofUint8 = await backend.generateProof(witness);
    // Convert to hex for easier usage
    const proofHex = "0x" + Buffer.from(proofUint8).toString("hex");

    // 5) (Optional) Verify locally
    const isValid = await backend.verifyProof(proofUint8);
    console.log(`[ZK] Proof verification => ${isValid ? "SUCCESS" : "FAIL"}`);

    // Return
    return {
        proofHex,
        isValid,
    };
}

// ------------------ HTTP Routes ------------------
app.post("/prove", async (req, res) => {
    try {
        const { age } = req.body;
        if (age === undefined) {
            return res.status(400).json({ error: "Missing 'age' in request body" });
        }

        console.log("[API] Received age:", age);

        // Generate the proof
        const { proofHex, isValid } = await generateProof(age);

        // Return JSON
        return res.json({
            age,
            proofHex,
            isValid,
        });
    } catch (err) {
        console.error("[ERROR]", err);
        return res.status(500).json({ error: err.message });
    }
});

// ------------------ Start Server ------------------
const PORT = 3000;

(async () => {
    // Initialize ACVM + noirc_abi WASMs once at server startup
    await initNoirWasm();
    app.listen(PORT, () => {
        console.log(`Server listening on http://localhost:${PORT}`);
    });
})();
