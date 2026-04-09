# MAX AI Local Backend

This backend powers MAX AI chat with a secure server-side provider layer.

It now supports:
- Gemini via `GEMINI_API_KEY`
- Veo 3.1 Lite video generation via `GEMINI_VIDEO_API_KEY` (or fallback to `GEMINI_API_KEY`)
- Ollama fallback when Gemini is not configured
- ElevenLabs TTS via backend-only API keys
- persona-aware replies
- optional multi-turn history

## Folder structure

```text
MAX-AI/
  backend/
    app.py
    .env.example
    requirements.txt
  prompts/
    systemPrompt.txt
render.yaml
```

## Backend setup

1. Install dependencies:

```bash
pip install -r backend/requirements.txt
```

2. Create a backend env file:

```bash
cd backend
copy .env.example .env
```

3. Add your provider config in `backend/.env`.

Example Gemini config:

```env
AI_PROVIDER=gemini
GEMINI_MODEL=gemini-2.5-flash
GEMINI_API_KEY=your_key_here
```

Example Ollama config:

```env
AI_PROVIDER=ollama
OLLAMA_MODEL=llama3.2:1b
```

Example ElevenLabs voice config:

```env
ELEVENLABS_API_KEY_PRIMARY=your_primary_key
ELEVENLABS_API_KEY_SECONDARY=your_backup_key
ELEVENLABS_MODEL_ID=eleven_multilingual_v2
ELEVENLABS_OUTPUT_FORMAT=mp3_44100_128
```

Example Veo text-to-video config:

```env
GEMINI_VIDEO_API_KEY=your_key_here
VEO_MODEL=veo-3.1-lite-generate-preview
VEO_RESOLUTION=720p
VEO_ASPECT_RATIO=16:9
VEO_DURATION_SECONDS=8
```

4. If you use Ollama, make sure it is running:

```bash
ollama pull llama3.2:1b
ollama run llama3.2:1b
```

5. Start the API:

```bash
cd backend
python app.py
```

The backend runs on:

```text
http://127.0.0.1:5000
```

For Render, the same app automatically uses Render's `PORT` environment variable.
Render start command should bind publicly:

```bash
gunicorn app:app --bind 0.0.0.0:$PORT
```

## Frontend local dev

The frontend can call the backend locally with:

```env
VITE_CHAT_API_URL=http://127.0.0.1:5000/chat
```

Use `.env.development.local` for local Vite development so production hosting does not point to localhost.

## Endpoints

- `GET /`
- `GET /health`
- `POST /chat`
- `POST /voice/tts`
- `POST /video/generate`
- `GET /video/status?operation=...`
- `GET /video/file?uri=...`

## Request body

```json
{
  "message": "Explain recursion simply",
  "personaId": "mentor",
  "history": [
    {
      "role": "user",
      "content": "I am learning programming"
    }
  ]
}
```

`personaId` and `history` are optional. A plain `{ "message": "..." }` request still works.

## Example request

```bash
curl -X POST http://127.0.0.1:5000/chat ^
  -H "Content-Type: application/json" ^
  -d "{\"message\":\"Explain recursion simply\",\"personaId\":\"mentor\"}"
```

## Render deployment

This repo now includes a root [render.yaml](../render.yaml) Blueprint for a Python web service.

Important Render env vars:

- `GEMINI_API_KEY` = your secret Gemini key
- `ELEVENLABS_API_KEY_PRIMARY` = your main ElevenLabs secret key
- `ELEVENLABS_API_KEY_SECONDARY` = optional backup ElevenLabs key
- `ELEVENLABS_VOICE_ID` = optional shared voice id for both accounts
- `AI_PROVIDER` = `gemini`
- `GEMINI_MODEL` = `gemini-2.5-flash`
- `ALLOWED_ORIGINS` = `https://max-ai-a030a.web.app,https://max-ai-a030a.firebaseapp.com`

After Render gives you a public backend URL, set the frontend production env:

```env
VITE_CHAT_API_URL=https://your-render-service.onrender.com/chat
```

Then rebuild and redeploy Firebase Hosting so the live MAX AI site calls the Render backend.

Current live backend URL:

```text
https://max-ai-api.onrender.com
```
