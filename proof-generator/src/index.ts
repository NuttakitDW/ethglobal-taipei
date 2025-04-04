import express from "express";

const app = express();
app.use(express.json());

// ✅ Correct (with path string)
app.post('/generate-proof', (req, res) => {
    res.send('Hello world');
});
app.listen(3000, () => {
    console.log("Proof Generator listening on port 3000");
});
