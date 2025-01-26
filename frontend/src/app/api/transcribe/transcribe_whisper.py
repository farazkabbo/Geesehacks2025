import sys
import whisper

def transcribe_audio(file_path):
    model = whisper.load_model("base")  # Choose model size: tiny, base, small, medium, large
    result = model.transcribe(file_path)
    return result["text"]

if __name__ == "__main__":
    file_path = sys.argv[1]
    transcription = transcribe_audio(file_path)
    print(transcription)
