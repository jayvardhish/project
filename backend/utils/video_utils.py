import os
import cv2
import yt_dlp
from moviepy import VideoFileClip
import speech_recognition as sr
from ai_client import client

def download_youtube_audio(video_url, output_path_base):
    """
    Downloads raw audio from a YouTube video. 
    Returns the actual path of the downloaded file.
    """
    try:
        ydl_opts = {
            'format': 'bestaudio/best',
            'outtmpl': output_path_base + '.%(ext)s', # Let yt-dlp append the extension
            'quiet': True,
            'no_warnings': True,
            'nopostprocess': True,
        }

        with yt_dlp.YoutubeDL(ydl_opts) as ydl:
            info = ydl.extract_info(video_url, download=True)
            ext = info.get('ext', 'm4a')
            actual_path = f"{output_path_base}.{ext}"
            return actual_path
    except Exception as e:
        print(f"YouTube Audio Download Error: {e}")
        return None

def transcribe_audio_with_deepseek(audio_path):
    """
    Transcribe audio using local speech recognition + DeepSeek for cleanup.
    This is a free alternative to OpenAI Whisper.
    """
    try:
        # Use SpeechRecognition with Google's free API for initial transcription
        recognizer = sr.Recognizer()
        
        # Convert to WAV if needed (SpeechRecognition works best with WAV)
        wav_path = audio_path.replace('.m4a', '.wav').replace('.mp3', '.wav')
        
        if not wav_path.endswith('.wav'):
            from pydub import AudioSegment
            audio = AudioSegment.from_file(audio_path)
            audio.export(wav_path, format='wav')
        
        # Transcribe using Google Speech Recognition (free)
        with sr.AudioFile(wav_path) as source:
            audio_data = recognizer.record(source)
            raw_text = recognizer.recognize_google(audio_data)
        
        # If we got this far, we have a basic transcription
        # Now use DeepSeek to clean it up and add punctuation
        if client:
            response = client.chat.completions.create(
                model="deepseek/deepseek-chat",
                messages=[
                    {"role": "system", "content": "You are a professional transcription editor. Clean up the following transcription by adding proper punctuation, capitalization, and formatting. Keep the exact words but make it readable."},
                    {"role": "user", "content": raw_text}
                ],
                max_tokens=client.default_max_tokens
            )
            cleaned_text = response.choices[0].message.content.strip()
            
            # Cleanup temp WAV file
            if wav_path != audio_path and os.path.exists(wav_path):
                os.remove(wav_path)
                
            return cleaned_text
        else:
            return raw_text
            
    except Exception as e:
        print(f"DeepSeek Transcription Error: {e}")
        return None

def extract_audio(video_path, output_audio_path):
    """
    Extracts audio from a video file and saves it to output_audio_path.
    """
    try:
        if not os.path.exists(video_path):
            print(f"Video file not found: {video_path}")
            return False
            
        video = VideoFileClip(video_path)
        if video.audio is not None:
            video.audio.write_audiofile(output_audio_path, logger=None)
            video.close()
            return True
        video.close()
        print(f"No audio track found in {video_path}")
        return False
    except Exception as e:
        print(f"Error extracting audio: {e}")
        return False

def extract_frames(video_path, output_folder, interval=10):
    """
    Extracts frames from a video file at a given interval (in seconds).
    Returns a list of paths to the extracted frames.
    """
    if not os.path.exists(output_folder):
        os.makedirs(output_folder)
    
    frame_paths = []
    try:
        cap = cv2.VideoCapture(video_path)
        fps = cap.get(cv2.CAP_PROP_FPS)
        if fps <= 0:
            fps = 30 # Fallback
            
        frame_interval = int(fps * interval)
        count = 0
        success, image = cap.read()
        
        while success:
            if count % frame_interval == 0:
                frame_name = f"frame_{count//frame_interval}.jpg"
                frame_path = os.path.join(output_folder, frame_name)
                cv2.imwrite(frame_path, image)
                frame_paths.append(frame_path)
            
            success, image = cap.read()
            count += 1
            
        cap.release()
    except Exception as e:
        print(f"Error extracting frames: {e}")
        
    return frame_paths
