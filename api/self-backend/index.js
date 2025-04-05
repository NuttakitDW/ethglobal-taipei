// index.js
const express = require('express');
const { SelfBackendVerifier, getUserIdentifier } = require('@selfxyz/core');

const app = express();

// Parse JSON bodies
app.use(express.json());

// POST /verify -> the route your front-end will call
app.post('/verify', async (req, res) => {
    try {
        const { proof, publicSignals } = req.body;

        if (!proof || !publicSignals) {
            return res.status(400).json({ message: 'Missing proof or publicSignals' });
        }

        // Optionally, extract a user identifier from the publicSignals
        const userId = await getUserIdentifier(publicSignals);
        console.log("Extracted userId:", userId);

        // Create and configure the Self verifier
        // NOTE: 'my-application-scope' must match the scope in your front-end's SelfAppBuilder
        // and the second argument is the endpoint for your deployed server (not localhost in production).
        const selfBackendVerifier = new SelfBackendVerifier(
            'zkotp-wallet-auth',
            'https://16fd-111-235-226-130.ngrok-free.app'
        );

        // Verify the proof from the front-end
        const result = await selfBackendVerifier.verify(proof, publicSignals);

        if (result.isValid) {
            return res.status(200).json({
                status: 'success',
                result: true,
                credentialSubject: result.credentialSubject
            });
        } else {
            return res.status(500).json({
                status: 'error',
                result: false,
                message: 'Verification failed',
                details: result.isValidDetails
            });
        }
    } catch (error) {
        console.error('Error verifying proof:', error);
        return res.status(500).json({
            status: 'error',
            result: false,
            message: error.message || 'Unknown error'
        });
    }
});

// Start listening
const PORT = 8080;
app.listen(PORT, () => {
    console.log(`Self verification server running on http://localhost:${PORT}`);
});
