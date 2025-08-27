# AI API – Integration Guide

Below are the AI endpoints exposed by the backend, including URLs, request/response formats, environment requirements, and quick examples you can copy into your Flutter app or testing tools.


## Base URL
- **API base**: `https://mfm-1jw6.onrender.com/api`
- **AI routes prefix**: `/api/ai` (mounted in `src/routes/index.js`, and `src/app.js` mounts all routes under `/api`)


## Auth
- **No auth required** for AI endpoints currently (no `protect` middleware on `src/routes/ai.routes.js`).


## Environment Requirements
- **GOOGLE_API_KEY** (required): Google Generative AI API key (used in `src/services/ai.service.js`).
- **AI_SYSTEM_PROMPT** (optional): Overrides the default AI assistant persona and policies.
- **CLIENT_ORIGIN** (optional): CORS allowed origin (e.g., `https://your-flutter-web-app`).


## Endpoints

### 1) Generate (text and optional image)
- **Method**: POST  
- **Path**: `/api/ai/generate`  
- **Handler**: `generate()` in `src/controllers/ai.controller.js` → `generateAIResponse()` in `src/services/ai.service.js`
- **Body (JSON)**:
  - **prompt**: string (optional if `imageUrl` provided)
  - **imageUrl**: string URL (optional; enables image reasoning/vision)
  - **mode**: string (optional) — `summarize` | `vision` | any other value → defaults to concise assistant
  - **model**: string (optional; default `gemini-1.5-flash`)
- **Response (200)**:
  - `{ ok: true, text: string }`
- **Errors (400)**:
  - `{ ok: false, error: string }`
  - Common causes: missing `GOOGLE_API_KEY`, neither `prompt` nor `imageUrl` provided, image fetch failures.

#### cURL Example – Generate
```bash
curl -X POST "https://mfm-1jw6.onrender.com/api/ai/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Summarize Romans 8:28 in simple terms",
    "mode": "summarize"
  }'
```

#### cURL Example – Vision Generate
```bash
curl -X POST "https://mfm-1jw6.onrender.com/api/ai/generate" \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Describe this poster and extract any visible text",
    "imageUrl": "https://example.com/poster.jpg",
    "mode": "vision"
  }'
```

#### Flutter (Dart http) Example – Generate
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<String> aiGenerate(String host) async {
  final url = Uri.parse('$host/api/ai/generate');
  final res = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'prompt': 'Create 3 practice questions on derivatives (with solutions).',
      'mode': 'summarize',
    }),
  );
  final data = jsonDecode(res.body);
  if (res.statusCode == 200 && data['ok'] == true) {
    return data['text'];
  } else {
    throw Exception(data['error'] ?? 'AI error');
  }
}
```

---

### 2) Chat (multi-turn)
- **Method**: POST  
- **Path**: `/api/ai/chat`  
- **Handler**: `chat()` in `src/controllers/ai.controller.js` → `chatAI()` in `src/services/ai.service.js`
- **Body (JSON)**:
  - **messages**: array (required) of objects: `{ role: 'user' | 'assistant', content?: string, imageUrl?: string }`
    - Note: `assistant` is mapped to provider `model` role internally.
  - **model**: string (optional; default `gemini-1.5-flash`)
- **Response (200)**:
  - `{ ok: true, text: string }`
- **Errors (400)**:
  - `{ ok: false, error: string }`
  - Common causes: missing `GOOGLE_API_KEY`, empty/invalid `messages`.

#### cURL Example – Chat
```bash
curl -X POST "https://mfm-1jw6.onrender.com/api/ai/chat" \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      { "role": "user", "content": "Help me plan a study outline for Calculus I." }
    ],
    "model": "gemini-1.5-flash"
  }'
```

#### Flutter (Dart http) Example – Chat
```dart
import 'dart:convert';
import 'package:http/http.dart' as http;

Future<String> aiChat(String host) async {
  final url = Uri.parse('$host/api/ai/chat');
  final res = await http.post(
    url,
    headers: {'Content-Type': 'application/json'},
    body: jsonEncode({
      'messages': [
        { 'role': 'user', 'content': 'Give 3 tips to study effectively.' }
      ],
      'model': 'gemini-1.5-flash',
    }),
  );
  final data = jsonDecode(res.body);
  if (res.statusCode == 200 && data['ok'] == true) {
    return data['text'];
  } else {
    throw Exception(data['error'] ?? 'AI error');
  }
}
```

---

## Implementation References
- **Routes**: `src/routes/ai.routes.js`
- **Controller**: `src/controllers/ai.controller.js`
- **Service**: `src/services/ai.service.js`
- **Mount point**: `src/routes/index.js` under `/ai`; `src/app.js` mounts all routes under `/api`.


## Notes
- Default model is `gemini-1.5-flash`. You can pass another Gemini model if enabled in your Google project.
- For image inputs, backend fetches the image URL and converts to base64; ensure the URL is publicly accessible.
- CORS: if using Flutter Web, set `CLIENT_ORIGIN` in the backend `.env` to your web app’s origin.
