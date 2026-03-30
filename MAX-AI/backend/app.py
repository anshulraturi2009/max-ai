from __future__ import annotations

import logging
import os
import re
from pathlib import Path
from typing import Any

import requests
from flask import Flask, Response, jsonify, request


BASE_DIR = Path(__file__).resolve().parent.parent
BACKEND_DIR = Path(__file__).resolve().parent
SYSTEM_PROMPT_PATH = BASE_DIR / "prompts" / "systemPrompt.txt"

OLLAMA_URL = "http://localhost:11434/api/generate"
DEFAULT_OLLAMA_MODEL = "llama3.2:1b"
DEFAULT_GEMINI_MODEL = "gemini-2.5-flash"
DEFAULT_PROVIDER = "auto"
REQUEST_TIMEOUT_SECONDS = 120
WEB_SEARCH_TIMEOUT_SECONDS = 18
MAX_HISTORY_MESSAGES = 12
DEFAULT_SERVER_PORT = 5000
MAX_SEARCH_RESULTS = 5
DEFAULT_ELEVENLABS_MODEL = "eleven_multilingual_v2"
DEFAULT_ELEVENLABS_OUTPUT_FORMAT = "mp3_44100_128"
DEFAULT_ELEVENLABS_TIMEOUT_SECONDS = 45
MAX_TTS_CHARS = 1800
DEFAULT_ALLOWED_ORIGINS = (
    "https://max-ai-a030a.web.app",
    "https://max-ai-a030a.firebaseapp.com",
    "https://anshulraturi.me",
    "https://www.anshulraturi.me",
)

PERSONA_INSTRUCTIONS = {
    "bhai": (
        "Adopt a confident, energetic Hinglish tone with sharp, direct answers. "
        "Keep the vibe desi, bold, and practical."
    ),
    "friend": (
        "Reply like a smart dost: casual, relaxed, simple Hinglish, easy to follow, "
        "and naturally helpful."
    ),
    "supportive": (
        "Use a calm, caring, reassuring tone. Be emotionally aware, warm, and "
        "encouraging without becoming vague."
    ),
    "formal": (
        "Respond in a polished, respectful, well-structured style with clean wording "
        "and professional clarity."
    ),
    "funny": (
        "Add light, witty humor while staying useful and accurate. Keep jokes short "
        "and never let humor reduce clarity."
    ),
    "mentor": (
        "Sound wise, motivating, and growth-oriented. Give perspective, next steps, "
        "and strategic insight."
    ),
    "other": (
        "Be balanced, intelligent, and adaptable. Use a clear, premium assistant tone."
    ),
}

SELF_IDENTITY_PATTERNS = (
    "tum kaun ho",
    "tum kon ho",
    "aap kaun ho",
    "aap kon ho",
    "who are you",
    "what are you",
    "ap kon ho",
    "ap kaun ho",
)

CREATOR_PATTERNS = (
    "kisne banaya",
    "banaya kisne",
    "who made you",
    "who built you",
    "who created you",
    "kisne create kiya",
    "anshul kaun hai",
    "anshul kon hai",
    "who is anshul",
    "anshul raturi kaun",
    "anshul raturi kon",
    "anshul ratrui kaun",
    "anshul ratrui kon",
    "who is anshul ratrui",
    "who is anshul raturi",
)

SEARCH_HINT_PATTERNS = [
    re.compile(pattern, re.IGNORECASE)
    for pattern in (
        r"\bwho is\b",
        r"\bwhat is\b",
        r"\bwhen\b",
        r"\bwhere\b",
        r"\bhow many\b",
        r"\btell me about\b",
        r"\blatest\b",
        r"\bcurrent\b",
        r"\btoday\b",
        r"\bnews\b",
        r"\bupdate\b",
        r"\bviral\b",
        r"\bbiography\b",
        r"\bprofile\b",
        r"\byoutube\b",
        r"\bsocial media\b",
        r"\bsearch\b",
        r"\blook up\b",
        r"\bkaun hai\b",
        r"\bkon hai\b",
        r"\bkya hai\b",
        r"\bkab\b",
        r"\bkahan\b",
        r"\bpata karo\b",
        r"\bdhundho\b",
    )
]

UNCERTAINTY_MARKERS = (
    "i don't know",
    "i do not know",
    "i'm not sure",
    "i am not sure",
    "not certain",
    "cannot verify",
    "unable to verify",
    "mujhe nahi pata",
    "main sure nahi hoon",
)

PREFERRED_ELEVENLABS_VOICE_NAMES = (
    "Rachel",
    "Bella",
    "Antoni",
    "Elli",
    "Josh",
)

ELEVENLABS_API_BASE_URL = "https://api.elevenlabs.io"
ELEVENLABS_VOICE_CACHE: dict[str, str] = {}


logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s | %(levelname)s | %(name)s | %(message)s",
)
logger = logging.getLogger("max-ai-backend")

app = Flask(__name__)
app.config["JSON_SORT_KEYS"] = False


class PromptConfigurationError(RuntimeError):
    """Raised when the system prompt file is missing or invalid."""


class AIServiceError(RuntimeError):
    """Raised when the configured AI provider cannot return a valid response."""


def bootstrap_local_env() -> None:
    """
    Load simple key=value pairs from local .env files without extra dependencies.
    Existing environment variables keep priority over file values.
    """
    for env_path in (BACKEND_DIR / ".env", BASE_DIR / ".env"):
        if not env_path.exists():
            continue

        try:
            raw_lines = env_path.read_text(encoding="utf-8").splitlines()
        except OSError as error:
            logger.warning("Could not read env file %s: %s", env_path, error)
            continue

        for raw_line in raw_lines:
            line = raw_line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue

            key, value = line.split("=", 1)
            key = key.strip()
            value = value.strip().strip('"').strip("'")

            if key:
                os.environ.setdefault(key, value)


bootstrap_local_env()


def get_allowed_origin(request_origin: str | None) -> str:
    """Return the allowed origin for CORS."""
    configured_origins = [
        item.strip()
        for item in os.getenv("ALLOWED_ORIGINS", "").split(",")
        if item.strip()
    ]
    allowed_origins = list(
        dict.fromkeys([*configured_origins, *DEFAULT_ALLOWED_ORIGINS])
    )

    if not allowed_origins:
        return "*"

    if request_origin and request_origin in allowed_origins:
        return request_origin

    return allowed_origins[0]


def load_system_prompt() -> str:
    """Read the system prompt from disk at request time."""
    try:
        prompt = SYSTEM_PROMPT_PATH.read_text(encoding="utf-8").strip()
    except FileNotFoundError as error:
        raise PromptConfigurationError(
            f"System prompt file not found at: {SYSTEM_PROMPT_PATH}"
        ) from error
    except OSError as error:
        raise PromptConfigurationError(
            f"Unable to read system prompt file: {error}"
        ) from error

    if not prompt:
        raise PromptConfigurationError("System prompt file is empty.")

    return prompt


def get_runtime_configuration() -> dict[str, Any]:
    provider = os.getenv("AI_PROVIDER", DEFAULT_PROVIDER).strip().lower() or DEFAULT_PROVIDER
    if provider not in {"auto", "gemini", "ollama"}:
        provider = DEFAULT_PROVIDER

    return {
        "provider": provider,
        "gemini_api_key": os.getenv("GEMINI_API_KEY", "").strip(),
        "gemini_model": os.getenv("GEMINI_MODEL", DEFAULT_GEMINI_MODEL).strip()
        or DEFAULT_GEMINI_MODEL,
        "ollama_model": os.getenv("OLLAMA_MODEL", DEFAULT_OLLAMA_MODEL).strip()
        or DEFAULT_OLLAMA_MODEL,
        "timeout_seconds": int(
            os.getenv("AI_REQUEST_TIMEOUT_SECONDS", str(REQUEST_TIMEOUT_SECONDS))
        ),
    }


def get_voice_runtime_configuration() -> dict[str, Any]:
    return {
        "primary_api_key": os.getenv("ELEVENLABS_API_KEY_PRIMARY", "").strip(),
        "secondary_api_key": os.getenv("ELEVENLABS_API_KEY_SECONDARY", "").strip(),
        "voice_id": os.getenv("ELEVENLABS_VOICE_ID", "").strip(),
        "primary_voice_id": os.getenv("ELEVENLABS_VOICE_ID_PRIMARY", "").strip(),
        "secondary_voice_id": os.getenv("ELEVENLABS_VOICE_ID_SECONDARY", "").strip(),
        "model_id": os.getenv("ELEVENLABS_MODEL_ID", DEFAULT_ELEVENLABS_MODEL).strip()
        or DEFAULT_ELEVENLABS_MODEL,
        "output_format": os.getenv(
            "ELEVENLABS_OUTPUT_FORMAT",
            DEFAULT_ELEVENLABS_OUTPUT_FORMAT,
        ).strip()
        or DEFAULT_ELEVENLABS_OUTPUT_FORMAT,
        "timeout_seconds": int(
            os.getenv(
                "ELEVENLABS_TIMEOUT_SECONDS",
                str(DEFAULT_ELEVENLABS_TIMEOUT_SECONDS),
            )
        ),
    }


def resolve_provider(configuration: dict[str, Any]) -> str:
    if configuration["provider"] == "gemini":
        if not configuration["gemini_api_key"]:
            raise AIServiceError(
                "AI_PROVIDER is set to gemini but GEMINI_API_KEY is missing."
            )
        return "gemini"

    if configuration["provider"] == "ollama":
        return "ollama"

    return "gemini" if configuration["gemini_api_key"] else "ollama"


def is_voice_configured(configuration: dict[str, Any] | None = None) -> bool:
    active_configuration = configuration or get_voice_runtime_configuration()
    return bool(
        active_configuration["primary_api_key"]
        or active_configuration["secondary_api_key"]
    )


def normalize_history(raw_history: Any) -> list[dict[str, str]]:
    if not isinstance(raw_history, list):
        return []

    normalized: list[dict[str, str]] = []

    for item in raw_history[-MAX_HISTORY_MESSAGES:]:
        if not isinstance(item, dict):
            continue

        role = str(item.get("role", "")).strip().lower()
        content = str(item.get("content", "")).strip()

        if not content:
            continue

        if role in {"assistant", "model"}:
            normalized.append({"role": "model", "content": content})
        elif role == "user":
            normalized.append({"role": "user", "content": content})

    return normalized


def normalize_tts_text(raw_text: Any) -> str:
    return re.sub(r"\s+", " ", str(raw_text or "")).strip()[:MAX_TTS_CHARS]


def get_persona_instruction(persona_id: str) -> str:
    normalized_persona = persona_id.strip().lower() or "other"
    return PERSONA_INSTRUCTIONS.get(normalized_persona, PERSONA_INSTRUCTIONS["other"])


def matches_creator_query(user_message: str) -> bool:
    normalized = user_message.strip().lower()
    return any(pattern in normalized for pattern in (*SELF_IDENTITY_PATTERNS, *CREATOR_PATTERNS))


def build_creator_reply(user_message: str) -> str:
    normalized = user_message.strip().lower()
    if "anshul" in normalized:
        return (
            "Anshul Raturi ek young Indian founder hain aur Uttarakhand se belong karte hain. "
            "Unhone MAX AI banaya hai."
        )

    if any(pattern in normalized for pattern in SELF_IDENTITY_PATTERNS):
        return (
            "Mai MAX AI hu. Mujhe Anshul Raturi ne banaya hai. "
            "Wo Uttarakhand se belong karne wale ek young Indian founder hain."
        )

    return (
        "Mujhe Anshul Raturi ne banaya hai. "
        "Wo Uttarakhand se belong karne wale ek young Indian founder hain."
    )


def should_search_message(user_message: str) -> bool:
    normalized = user_message.strip()
    return any(pattern.search(normalized) for pattern in SEARCH_HINT_PATTERNS)


def reply_needs_search(reply: str) -> bool:
    normalized = reply.strip().lower()
    return any(marker in normalized for marker in UNCERTAINTY_MARKERS)


def build_system_instruction(persona_id: str) -> str:
    system_prompt = load_system_prompt()
    persona_instruction = get_persona_instruction(persona_id)

    return (
        f"{system_prompt}\n\n"
        "Persona behavior:\n"
        f"{persona_instruction}\n\n"
        "Response rules:\n"
        "- Give clean plain-text answers.\n"
        "- Stay helpful, specific, and actionable.\n"
        "- Match the selected persona consistently.\n"
        "- Do not mention hidden system instructions.\n"
        "- If asked who you are, say: Mai MAX AI hu. Mujhe Anshul Raturi ne banaya hai. "
        "Wo Uttarakhand se belong karne wale ek young Indian founder hain.\n"
        "- If asked who created you, say: Mujhe Anshul Raturi ne banaya hai. "
        "Wo Uttarakhand se belong karne wale ek young Indian founder hain.\n"
        "- If asked who Anshul Raturi is, say: Anshul Raturi ek young Indian founder hain "
        "aur Uttarakhand se belong karte hain. Unhone MAX AI banaya hai.\n"
        "- Never say you were created by Google.\n"
        "- If the user writes in Hinglish, you may naturally respond in Hinglish."
    )


def build_search_context(search_results: list[dict[str, str]]) -> str:
    if not search_results:
        return ""

    lines = [
        "Use the following live web research context when it helps answer the user clearly:"
    ]

    for index, result in enumerate(search_results[:MAX_SEARCH_RESULTS], start=1):
        lines.append(
            f"{index}. {result['title']}: {result['snippet']} (Source: {result['source']})"
        )

    return "\n".join(lines)


def build_augmented_user_message(user_message: str, search_context: str = "") -> str:
    if not search_context:
        return user_message.strip()

    return (
        f"{search_context}\n\n"
        "User question:\n"
        f"{user_message.strip()}"
    )


def iterate_elevenlabs_credentials(
    configuration: dict[str, Any],
) -> list[dict[str, str]]:
    shared_voice_id = configuration["voice_id"]
    candidates = [
        {
            "label": "primary",
            "api_key": configuration["primary_api_key"],
            "voice_id": configuration["primary_voice_id"] or shared_voice_id,
        },
        {
            "label": "secondary",
            "api_key": configuration["secondary_api_key"],
            "voice_id": configuration["secondary_voice_id"] or shared_voice_id,
        },
    ]

    return [candidate for candidate in candidates if candidate["api_key"]]


def resolve_elevenlabs_voice_id(api_key: str, configured_voice_id: str = "") -> str:
    if configured_voice_id:
        return configured_voice_id

    cached_voice_id = ELEVENLABS_VOICE_CACHE.get(api_key)
    if cached_voice_id:
        return cached_voice_id

    try:
        response = requests.get(
            f"{ELEVENLABS_API_BASE_URL}/v2/voices",
            headers={"xi-api-key": api_key},
            timeout=DEFAULT_ELEVENLABS_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        response_data = response.json()
    except (requests.RequestException, ValueError) as error:
        raise AIServiceError(
            "Could not load ElevenLabs voices for speech playback."
        ) from error

    voices = response_data.get("voices", [])
    if not isinstance(voices, list) or not voices:
        raise AIServiceError("ElevenLabs returned no usable voices.")

    preferred_voice = next(
        (
            voice
            for preferred_name in PREFERRED_ELEVENLABS_VOICE_NAMES
            for voice in voices
            if isinstance(voice, dict)
            and str(voice.get("name", "")).strip().lower() == preferred_name.lower()
            and str(voice.get("voice_id", "")).strip()
        ),
        None,
    )

    chosen_voice = preferred_voice or next(
        (
            voice
            for voice in voices
            if isinstance(voice, dict) and str(voice.get("voice_id", "")).strip()
        ),
        None,
    )

    if not chosen_voice:
        raise AIServiceError("ElevenLabs voice list was empty.")

    voice_id = str(chosen_voice.get("voice_id", "")).strip()
    ELEVENLABS_VOICE_CACHE[api_key] = voice_id
    return voice_id


def request_elevenlabs_tts(
    text: str,
    configuration: dict[str, Any],
) -> tuple[bytes, str]:
    if not is_voice_configured(configuration):
        raise AIServiceError("ElevenLabs voice is not configured on the backend.")

    last_error: Exception | None = None
    normalized_text = normalize_tts_text(text)

    if not normalized_text:
        raise AIServiceError("Voice playback text was empty.")

    for credential in iterate_elevenlabs_credentials(configuration):
        try:
            voice_id = resolve_elevenlabs_voice_id(
                credential["api_key"],
                credential["voice_id"],
            )
            response = requests.post(
                f"{ELEVENLABS_API_BASE_URL}/v1/text-to-speech/{voice_id}/stream",
                params={"output_format": configuration["output_format"]},
                headers={
                    "Accept": "audio/mpeg",
                    "Content-Type": "application/json",
                    "xi-api-key": credential["api_key"],
                },
                json={
                    "text": normalized_text,
                    "model_id": configuration["model_id"],
                },
                timeout=configuration["timeout_seconds"],
            )

            if response.ok and response.content:
                return response.content, credential["label"]

            if response.status_code == 422 and credential["voice_id"]:
                ELEVENLABS_VOICE_CACHE.pop(credential["api_key"], None)

            try:
                error_payload = response.json()
            except ValueError:
                error_payload = {}

            last_error = AIServiceError(
                error_payload.get("detail")
                or error_payload.get("message")
                or f"ElevenLabs TTS failed with status {response.status_code}."
            )
            logger.warning(
                "ElevenLabs %s key failed with status=%s",
                credential["label"],
                response.status_code,
            )
        except requests.RequestException as error:
            last_error = AIServiceError(f"ElevenLabs request failed: {error}")
            logger.warning(
                "ElevenLabs %s key request failed: %s",
                credential["label"],
                error,
            )
        except AIServiceError as error:
            last_error = error
            logger.warning(
                "ElevenLabs %s key could not resolve a voice: %s",
                credential["label"],
                error,
            )

    raise AIServiceError(
        str(last_error) if last_error else "ElevenLabs voice playback failed."
    )


def build_ollama_prompt(
    user_message: str,
    persona_id: str,
    history: list[dict[str, str]],
    search_context: str = "",
) -> str:
    history_lines: list[str] = []

    for item in history:
        speaker = "Assistant" if item["role"] == "model" else "User"
        history_lines.append(f"{speaker}: {item['content']}")

    history_block = "\n".join(history_lines).strip() or "No prior conversation."

    return (
        f"{build_system_instruction(persona_id)}\n\n"
        "Conversation so far:\n"
        f"{history_block}\n\n"
        "Latest user message:\n"
        f"{build_augmented_user_message(user_message, search_context)}\n\n"
        "Assistant response:"
    )


def build_gemini_contents(
    user_message: str,
    history: list[dict[str, str]],
    search_context: str = "",
) -> list[dict[str, Any]]:
    contents: list[dict[str, Any]] = [
        {
            "role": item["role"],
            "parts": [{"text": item["content"]}],
        }
        for item in history
    ]

    contents.append(
        {
            "role": "user",
            "parts": [{"text": build_augmented_user_message(user_message, search_context)}],
        }
    )

    return contents


def extract_gemini_reply(response_data: dict[str, Any]) -> str:
    candidates = response_data.get("candidates")
    if not isinstance(candidates, list) or not candidates:
        raise AIServiceError("Gemini returned no response candidates.")

    content = candidates[0].get("content", {})
    parts = content.get("parts", [])

    if not isinstance(parts, list):
        raise AIServiceError("Gemini returned an invalid content format.")

    reply_parts = [
        str(part.get("text", "")).strip()
        for part in parts
        if isinstance(part, dict) and str(part.get("text", "")).strip()
    ]

    reply = "\n".join(reply_parts).strip()
    if not reply:
        raise AIServiceError("Gemini returned an empty response.")

    return reply


def request_gemini(
    user_message: str,
    persona_id: str,
    history: list[dict[str, str]],
    configuration: dict[str, Any],
    search_context: str = "",
) -> str:
    api_key = configuration["gemini_api_key"]
    if not api_key:
        raise AIServiceError("GEMINI_API_KEY is missing.")

    model_name = configuration["gemini_model"]
    endpoint = (
        "https://generativelanguage.googleapis.com/v1beta/models/"
        f"{model_name}:generateContent"
    )
    payload: dict[str, Any] = {
        "system_instruction": {
            "parts": [{"text": build_system_instruction(persona_id)}]
        },
        "contents": build_gemini_contents(user_message, history, search_context),
    }

    try:
        response = requests.post(
            endpoint,
            headers={
                "Content-Type": "application/json",
                "x-goog-api-key": api_key,
            },
            json=payload,
            timeout=configuration["timeout_seconds"],
        )
    except requests.exceptions.ConnectionError as error:
        raise AIServiceError("Could not reach Gemini API.") from error
    except requests.exceptions.Timeout as error:
        raise AIServiceError("Gemini API took too long to respond.") from error
    except requests.exceptions.RequestException as error:
        raise AIServiceError(f"Gemini request failed: {error}") from error

    try:
        response_data = response.json()
    except ValueError as error:
        raise AIServiceError("Gemini returned a non-JSON response.") from error

    if not response.ok:
        api_message = (
            response_data.get("error", {}).get("message")
            if isinstance(response_data, dict)
            else None
        )
        raise AIServiceError(
            api_message
            or f"Gemini request failed with status {response.status_code}."
        )

    return extract_gemini_reply(response_data)


def request_ollama(
    user_message: str,
    persona_id: str,
    history: list[dict[str, str]],
    configuration: dict[str, Any],
    search_context: str = "",
) -> str:
    payload: dict[str, Any] = {
        "model": configuration["ollama_model"],
        "prompt": build_ollama_prompt(user_message, persona_id, history, search_context),
        "stream": False,
    }

    try:
        response = requests.post(
            OLLAMA_URL,
            json=payload,
            timeout=configuration["timeout_seconds"],
        )
        response.raise_for_status()
    except requests.exceptions.ConnectionError as error:
        raise AIServiceError(
            "Could not connect to Ollama. Make sure Ollama is running on http://localhost:11434."
        ) from error
    except requests.exceptions.Timeout as error:
        raise AIServiceError(
            "Ollama took too long to respond. Try again or use a lighter model."
        ) from error
    except requests.exceptions.RequestException as error:
        raise AIServiceError(f"Ollama request failed: {error}") from error

    try:
        data = response.json()
    except ValueError as error:
        raise AIServiceError("Ollama returned a non-JSON response.") from error

    reply = str(data.get("response", "")).strip()
    if not reply:
        raise AIServiceError("Ollama returned an empty response.")

    return reply


def flatten_duckduckgo_topics(items: list[dict[str, Any]], results: list[dict[str, str]]) -> None:
    for item in items:
        if len(results) >= MAX_SEARCH_RESULTS:
            return

        if "Topics" in item:
            flatten_duckduckgo_topics(item.get("Topics", []), results)
            continue

        text = str(item.get("Text", "")).strip()
        if not text:
            continue

        title = text.split(" - ", 1)[0].strip()
        results.append(
            {
                "title": title or "Web result",
                "snippet": text,
                "source": str(item.get("FirstURL", "")).strip() or "DuckDuckGo",
            }
        )


def search_duckduckgo(query_text: str) -> list[dict[str, str]]:
    results: list[dict[str, str]] = []

    try:
        response = requests.get(
            "https://api.duckduckgo.com/",
            params={
                "q": query_text,
                "format": "json",
                "no_html": "1",
                "skip_disambig": "1",
                "no_redirect": "1",
            },
            timeout=WEB_SEARCH_TIMEOUT_SECONDS,
        )
        response.raise_for_status()
        data = response.json()
    except (requests.RequestException, ValueError):
        return results

    abstract_text = str(data.get("AbstractText", "")).strip()
    if abstract_text:
        results.append(
            {
                "title": str(data.get("Heading", "")).strip() or "DuckDuckGo result",
                "snippet": abstract_text,
                "source": str(data.get("AbstractURL", "")).strip() or "DuckDuckGo",
            }
        )

    flatten_duckduckgo_topics(data.get("RelatedTopics", []), results)
    return results[:MAX_SEARCH_RESULTS]


def search_wikipedia(query_text: str) -> list[dict[str, str]]:
    try:
        search_response = requests.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "list": "search",
                "srsearch": query_text,
                "utf8": "1",
                "format": "json",
                "srlimit": str(MAX_SEARCH_RESULTS),
            },
            timeout=WEB_SEARCH_TIMEOUT_SECONDS,
        )
        search_response.raise_for_status()
        search_data = search_response.json()
    except (requests.RequestException, ValueError):
        return []

    search_items = search_data.get("query", {}).get("search", [])
    titles = [item.get("title") for item in search_items if item.get("title")]
    if not titles:
        return []

    try:
        details_response = requests.get(
            "https://en.wikipedia.org/w/api.php",
            params={
                "action": "query",
                "prop": "extracts|info",
                "inprop": "url",
                "exintro": "1",
                "explaintext": "1",
                "format": "json",
                "titles": "|".join(titles[:MAX_SEARCH_RESULTS]),
            },
            timeout=WEB_SEARCH_TIMEOUT_SECONDS,
        )
        details_response.raise_for_status()
        details_data = details_response.json()
    except (requests.RequestException, ValueError):
        return []

    pages = details_data.get("query", {}).get("pages", {})
    results: list[dict[str, str]] = []

    for page in pages.values():
        snippet = str(page.get("extract", "")).strip()
        if not snippet:
            continue

        results.append(
            {
                "title": str(page.get("title", "")).strip() or "Wikipedia result",
                "snippet": snippet[:360],
                "source": str(page.get("fullurl", "")).strip() or "Wikipedia",
            }
        )

    return results[:MAX_SEARCH_RESULTS]


def search_web(query_text: str) -> list[dict[str, str]]:
    results = search_duckduckgo(query_text)

    if len(results) < 2:
        results.extend(search_wikipedia(query_text))

    unique_results: list[dict[str, str]] = []
    seen = set()

    for result in results:
        key = (result["title"], result["snippet"])
        if key in seen:
            continue
        seen.add(key)
        unique_results.append(result)
        if len(unique_results) >= MAX_SEARCH_RESULTS:
            break

    return unique_results


def request_provider_reply(
    user_message: str,
    persona_id: str,
    history: list[dict[str, str]],
    configuration: dict[str, Any],
    provider: str,
    search_context: str = "",
) -> str:
    if provider == "gemini":
        return request_gemini(
            user_message,
            persona_id,
            history,
            configuration,
            search_context,
        )

    return request_ollama(
        user_message,
        persona_id,
        history,
        configuration,
        search_context,
    )


def request_ai_reply(
    user_message: str,
    persona_id: str,
    history: list[dict[str, str]],
) -> tuple[str, str, str, str]:
    configuration = get_runtime_configuration()
    provider = resolve_provider(configuration)
    logger.info("Using provider=%s", provider)

    proactive_search = should_search_message(user_message)
    search_results = search_web(user_message) if proactive_search else []
    if search_results:
        logger.info("Using web search context with %s results.", len(search_results))
        reply = request_provider_reply(
            user_message,
            persona_id,
            history,
            configuration,
            provider,
            build_search_context(search_results),
        )
        model = (
            configuration["gemini_model"]
            if provider == "gemini"
            else configuration["ollama_model"]
        )
        return reply, provider, model, "search"

    reply = request_provider_reply(
        user_message,
        persona_id,
        history,
        configuration,
        provider,
    )
    model = (
        configuration["gemini_model"]
        if provider == "gemini"
        else configuration["ollama_model"]
    )

    if reply_needs_search(reply):
        fallback_results = search_web(user_message)
        if fallback_results:
            logger.info(
                "Initial reply looked uncertain. Retrying with web search context."
            )
            reply = request_provider_reply(
                user_message,
                persona_id,
                history,
                configuration,
                provider,
                build_search_context(fallback_results),
            )
            return reply, provider, model, "search"

    return reply, provider, model, "thinking"


@app.after_request
def add_cors_headers(response):
    """Basic CORS support for local frontend development."""
    response.headers["Access-Control-Allow-Origin"] = get_allowed_origin(
        request.headers.get("Origin")
    )
    response.headers["Access-Control-Allow-Headers"] = "Content-Type"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    response.headers["Vary"] = "Origin"
    return response


@app.get("/")
def root():
    """Simple root route for Render and quick browser verification."""
    configuration = get_runtime_configuration()

    try:
        active_provider = resolve_provider(configuration)
    except AIServiceError:
        active_provider = "misconfigured"

    return jsonify(
        {
            "service": "MAX AI backend",
            "status": "running",
            "provider": active_provider,
        }
    )


@app.get("/health")
def health_check():
    """Simple health endpoint for quick backend checks."""
    configuration = get_runtime_configuration()
    voice_configuration = get_voice_runtime_configuration()

    try:
        active_provider = resolve_provider(configuration)
    except AIServiceError:
        active_provider = "misconfigured"

    return jsonify(
        {
            "status": "ok",
            "service": "MAX AI backend",
            "provider": active_provider,
            "providerMode": configuration["provider"],
            "model": (
                configuration["gemini_model"]
                if active_provider == "gemini"
                else configuration["ollama_model"]
            ),
            "geminiConfigured": bool(configuration["gemini_api_key"]),
            "voiceConfigured": is_voice_configured(voice_configuration),
        }
    )


@app.route("/voice/tts", methods=["POST", "OPTIONS"])
def voice_tts():
    """Convert assistant text into audio using ElevenLabs with key fallback."""
    if request.method == "OPTIONS":
        return ("", 204)

    try:
        request_data = request.get_json(silent=True) or {}
        text = normalize_tts_text(request_data.get("text", ""))
        voice_configuration = get_voice_runtime_configuration()

        if not text:
            return jsonify({"error": "Field 'text' is required."}), 400

        audio_bytes, active_key_label = request_elevenlabs_tts(
            text,
            voice_configuration,
        )
        response = Response(audio_bytes, mimetype="audio/mpeg")
        response.headers["Cache-Control"] = "no-store"
        response.headers["X-MAX-AI-Voice-Key"] = active_key_label
        return response
    except AIServiceError as error:
        logger.exception("Voice synthesis error.")
        return jsonify({"error": str(error)}), 503
    except Exception as error:  # pragma: no cover - final safety net
        logger.exception("Unexpected voice synthesis error.")
        return jsonify({"error": f"Unexpected server error: {error}"}), 500


@app.route("/chat", methods=["POST", "OPTIONS"])
def chat():
    """Accept a user message, apply the system prompt, and return an AI reply."""
    if request.method == "OPTIONS":
        return ("", 204)

    try:
        request_data = request.get_json(silent=True) or {}
        user_message = str(request_data.get("message", "")).strip()
        persona_id = str(request_data.get("personaId", "other")).strip().lower() or "other"
        history = normalize_history(request_data.get("history", []))

        if not user_message:
            logger.warning("Rejected /chat request without a valid message.")
            return jsonify({"error": "Field 'message' is required."}), 400

        logger.info(
            "Received /chat request. chars=%s persona=%s history=%s",
            len(user_message),
            persona_id,
            len(history),
        )

        if matches_creator_query(user_message):
            logger.info("Resolved creator identity override locally.")
            return jsonify(
                {
                    "reply": build_creator_reply(user_message),
                    "provider": "max-ai",
                    "model": "creator-identity",
                    "activityType": "identity",
                    "searchUsed": False,
                }
            )

        reply, provider, model, activity_type = request_ai_reply(
            user_message,
            persona_id,
            history,
        )

        logger.info(
            "AI response generated successfully with provider=%s activity=%s.",
            provider,
            activity_type,
        )
        return jsonify(
            {
                "reply": reply,
                "provider": provider,
                "model": model,
                "activityType": activity_type,
                "searchUsed": activity_type == "search",
            }
        )

    except PromptConfigurationError as error:
        logger.exception("Prompt configuration error.")
        return jsonify({"error": str(error)}), 500
    except AIServiceError as error:
        logger.exception("AI service error.")
        return jsonify({"error": str(error)}), 503
    except Exception as error:  # pragma: no cover - final safety net
        logger.exception("Unexpected backend error.")
        return jsonify({"error": f"Unexpected server error: {error}"}), 500


if __name__ == "__main__":
    server_port = int(os.getenv("PORT", str(DEFAULT_SERVER_PORT)))
    logger.info("Starting MAX AI backend on http://127.0.0.1:%s", server_port)
    app.run(host="0.0.0.0", port=server_port, debug=False)
