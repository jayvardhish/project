
import os
import cv2
from moviepy.editor import VideoFileClip

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
