import express from "express";

const app = express();
app.use(express.json());

app.post("/generate-proof", (req, res) => {
    // ...
    return res.json({ proof: "dummy-proof", publicInputs: {} });
});

app.listen(3000, () => {
    console.log("Proof Generator listening on port 3000");
});
