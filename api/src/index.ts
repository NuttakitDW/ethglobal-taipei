import { serve } from "bun";
import { prove } from "./proof";  // We'll implement `prove` below

serve({
    port: 3000,
    fetch(req) {
        const url = new URL(req.url);
        if (url.pathname === "/prove" && req.method === "POST") {
            return handleProveRequest(req);
        }
        return new Response("Not Found", { status: 404 });
    },
});

async function handleProveRequest(req: Request) {
    try {
        const { x, y, z } = await req.json();
        // Generate proof using the Noir WASM
        const proofData = await prove(x, y, z);

        // Return proof as JSON
        return new Response(JSON.stringify({ proof: proofData }), {
            status: 200,
            headers: { "Content-Type": "application/json" },
        });
    } catch (err) {
        console.error(err);
        return new Response(JSON.stringify({ error: (err instanceof Error ? err.message : String(err)) }), { status: 500 });
    }
}
