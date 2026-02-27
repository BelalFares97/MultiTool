"""
mujaz.py — Mujaz Audio Meeting Intelligence Service
─────────────────────────────────────────────────────
Requires:
  - assemblyai  (pip install assemblyai)
  - A valid ASSEMBLYAI_API_KEY in your .env file

Configure:
  Copy .env.example → .env and fill in your API key.
"""

import os
import asyncio
import assemblyai as aai
from dotenv import load_dotenv

load_dotenv()

# Set API key from environment — never hardcode secrets
aai.settings.api_key = os.environ.get("ASSEMBLYAI_API_KEY", "")

if not aai.settings.api_key:
    print("[Mujaz] WARNING: ASSEMBLYAI_API_KEY is not set. Transcription will fail.")


class MujazService:
    def __init__(self):
        pass

    async def _transcribe_async(self, audio_source: str):
        """
        Transcribe audio using AssemblyAI with speaker diarization.
        Tune TranscriptionConfig parameters here as needed.
        """
        from assemblyai.types import SpeakerOptions, LanguageDetectionOptions

        config = aai.TranscriptionConfig(
            # Model: universal-2 gives the best coverage for non-English languages
            speech_models=["universal-2"],

            # Speaker diarization
            speaker_labels=True,
            speakers_expected=None,        # Set to an int if speaker count is known
            speaker_options=SpeakerOptions(
                min_speakers_expected=2,
                max_speakers_expected=7,
            ),

            # Language detection with code-switching support (e.g. Arabic + English)
            language_detection=True,
            language_detection_options=LanguageDetectionOptions(
                code_switching=True,
                code_switching_confidence_threshold=0.3,
            ),

            # Formatting
            punctuate=True,
            format_text=True,

            # Vocabulary boost — add domain-specific terms here
            keyterms_prompt=[
                # English terms
                "meeting", "action item", "deliverable",
                # Add Arabic or other terms as needed
            ],

            # Summarization & intelligence features
            summarization=True,
            sentiment_analysis=True,
            entity_detection=True,
        )

        transcriber = aai.Transcriber()
        transcript = await asyncio.to_thread(
            transcriber.transcribe, audio_source, config=config
        )

        if transcript.status == aai.TranscriptStatus.error:
            raise Exception(f"Transcription failed: {transcript.error}")

        return transcript

    def process_audio(self, file_path: str) -> dict:
        """
        Entry point called by the API route.
        Returns a structured analysis dict or an error dict.
        """
        try:
            if not file_path or not os.path.exists(file_path):
                return {"status": "error", "message": f"File not found: {file_path}"}

            print(f"[Mujaz] Processing: {file_path}")
            transcript = asyncio.run(self._transcribe_async(file_path))

            # Build diarization segments
            diarization = []
            if transcript.utterances:
                for u in transcript.utterances:
                    start_sec = int(u.start / 1000)
                    m, s = divmod(start_sec, 60)
                    h, m = divmod(m, 60)
                    timestamp = f"{h:02d}:{m:02d}:{s:02d}" if h > 0 else f"{m:02d}:{s:02d}"
                    diarization.append({
                        "speaker": f"Speaker {u.speaker}",
                        "timestamp": timestamp,
                        "text": u.text,
                    })

            # Parse summary into notes & action items
            notes, action_items = [], []
            if transcript.summary:
                lines = [
                    l.strip()
                    for l in transcript.summary.replace(". ", ".\n").split("\n")
                    if l.strip()
                ]
                for line in lines:
                    clean = line.lstrip("*- ").strip()
                    if not clean:
                        continue
                    if any(kw in clean.lower() for kw in ["action", "todo", "task", "will", "need to", "must"]):
                        action_items.append(clean)
                    else:
                        notes.append(clean)

            return {
                "status": "success",
                "message": "Transcription completed",
                "analysis": {
                    "transcript": transcript.text or "",
                    "notes": notes or ["No summary available."],
                    "actionItems": action_items or ["No explicit action items identified."],
                    "diarization": diarization,
                },
            }

        except Exception as e:
            print(f"[Mujaz] Error: {e}")
            return {"status": "error", "message": str(e)}
