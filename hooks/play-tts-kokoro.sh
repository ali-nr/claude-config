#!/usr/bin/env bash
#
# AgentVibes Kokoro TTS Provider
# Uses Kokoro-82M for fast, natural-sounding speech
# ~2-3x real-time generation
#

TEXT="$1"
VOICE_ARG="$2"

# Read voice from config file if not provided as argument
if [[ -z "$VOICE_ARG" ]]; then
  VOICE_FILE="$HOME/.claude/tts-voice.txt"
  if [[ -f "$VOICE_FILE" ]]; then
    VOICE=$(cat "$VOICE_FILE" | tr -d '[:space:]')
  fi
fi
VOICE="${VOICE:-${VOICE_ARG:-af_heart}}"  # Default to af_heart

if [[ -z "$TEXT" ]]; then
  echo "Error: No text provided" >&2
  exit 1
fi

# Output directory
AUDIO_DIR="$HOME/.claude/audio"
mkdir -p "$AUDIO_DIR"

OUTPUT_FILE="$AUDIO_DIR/kokoro-$(date +%s).wav"

# Model paths
MODEL_PATH="$HOME/.cache/kokoro/kokoro-v1.0.onnx"
VOICES_PATH="$HOME/.cache/kokoro/voices-v1.0.bin"

# Run Kokoro TTS using venv Python
"$HOME/.claude/venv/bin/python3" << EOF
from kokoro_onnx import Kokoro
import soundfile as sf
import sys

model_path = "$MODEL_PATH"
voices_path = "$VOICES_PATH"

kokoro = Kokoro(model_path, voices_path)

text = """$TEXT"""
voice = "$VOICE"

# Generate audio
samples, sample_rate = kokoro.create(text, voice=voice)

# Save
output_path = "$OUTPUT_FILE"
sf.write(output_path, samples, sample_rate)
print(f"🎵 Saved to: {output_path}", file=sys.stderr)
print(f"🎤 Voice used: {voice} (Kokoro)", file=sys.stderr)
EOF

# Play the audio
if [[ -f "$OUTPUT_FILE" ]]; then
  afplay "$OUTPUT_FILE"
fi
