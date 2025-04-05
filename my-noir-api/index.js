import express from "express";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// -- Fix for __dirname in ESM --
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// -- Noir + Barretenberg Imports --
import { UltraHonkBackend } from '@aztec/bb.js';
import { Noir } from '@noir-lang/noir_js';
import { compile, createFileManager } from "@noir-lang/noir_wasm";

const app = express();
app.use(express.json());

async function compileCircuit() {
    // Instead of pointing to 'main.nr' as the first argument,
    // point to the *directory* that has Nargo.toml and the src/ folder.

    const projectPath = path.join(__dirname, "circuit");

    const nargoTomlPath = path.join(__dirname, "circuit", "Nargo.toml");
    const mainNrPath = path.join(__dirname, "circuit", "src", "main.nr");

    const mainNr = fs.readFileSync(mainNrPath, "utf8");
    const nargoToml = fs.readFileSync(nargoTomlPath, "utf8");

    const fileManager = createFileManager({
        readFile: async (filePath) => {
            if (filePath.endsWith("main.nr")) return mainNr;
            if (filePath.endsWith("Nargo.toml")) return nargoToml;
            throw new Error(`File not found: ${filePath}`);
        },
    });

    return await compile(fileManager, projectPath);
}


async function generateProof() {
    const { program } = await compileCircuit();
    const noir = new Noir(program);
    const backend = new UltraHonkBackend(program.bytecode);

    // Example input => adapt to your real circuit
    const input = {
        secret: "8908205071745768956754940712577663823191824575165388703111402954146780104548",
        otp_code: "209115",
        hashed_secret:
            "15590790710182840606832013891373017168266054012021149761087856963999545435767",
        hashed_otp:
            "9296871482664815829572350227731615859613671321798777421412185744492749055678",
        time_step: "58128707",
        action_hash: "0",
        tx_nonce: "0",
    };

    // Execute circuit => get witness
    const { witness } = await noir.execute(input);

    // Generate proof => returns { proof: Uint8Array, publicInputs: string[] } (typical shape)
    const { proof, publicInputs } = await backend.generateProof(witness);

    // Convert proof to hex
    const proofHex = "0x" + Buffer.from(proof).toString("hex");
    console.log("Got public inputs:", publicInputs);

    // Return both fields in an object
    return { proofHex, publicInputs };
}


app.post("/prove", async (req, res) => {
    try {
        const { proofHex, publicInputs } = await generateProof();
        res.json({ proofHex, publicInputs });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: err.message });
    }
});


app.listen(3000, () => {
    console.log("Server listening on http://localhost:3000");
});
