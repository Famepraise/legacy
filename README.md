# Mini AI V8

## Deploy on Render

1. Push this folder to a GitHub repository.
2. Create a **Node.js Web Service** on Render using this repo.
3. Render will automatically run `npm install` and `npm start`.
4. Set environment variables:
   - `HF_TOKEN` → your HuggingFace API token
   - `MODEL` → optional, defaults to `deepseek-ai/DeepSeek-V3`
5. Access routes:
   - Modern devices: `/chat`
   - Legacy phones: `/legacy` (proxy for legacy compatibility)
6. Legacy phones may use **HTTP** if TLS 1.0 is not supported.
