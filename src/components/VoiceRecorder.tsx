import { useState, useRef } from "react";

export function VoiceRecorder({ onRecordingComplete }: { onRecordingComplete: (blob: Blob) => void }) {
    const [isRecording, setIsRecording] = useState(false);
    const mediaRecorder = useRef<MediaRecorder | null>(null);
    const audioChunks = useRef<Blob[]>([]);

    const startRecording = async () => {
        try {
            const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
            mediaRecorder.current = new MediaRecorder(stream);
            audioChunks.current = [];

            mediaRecorder.current.ondataavailable = (event) => {
                audioChunks.current.push(event.data);
            };

            mediaRecorder.current.onstop = () => {
                const audioBlob = new Blob(audioChunks.current, { type: "audio/webm" });
                onRecordingComplete(audioBlob);
                stream.getTracks().forEach(track => track.stop());
            };

            mediaRecorder.current.start();
            setIsRecording(true);
        } catch (err) {
            console.error("Error accessing microphone:", err);
            alert("Could not access microphone.");
        }
    };

    const stopRecording = () => {
        if (mediaRecorder.current && isRecording) {
            mediaRecorder.current.stop();
            setIsRecording(false);
        }
    };

    return (
        <button 
            type="button"
            onMouseDown={startRecording}
            onMouseUp={stopRecording}
            onMouseLeave={stopRecording}
            onTouchStart={startRecording}
            onTouchEnd={stopRecording}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${
                isRecording ? 'bg-red-500 scale-110 shadow-[0_0_15px_rgba(239,68,68,0.5)]' : 'bg-slate-800 hover:bg-slate-700 text-slate-400'
            }`}
        >
            {isRecording ? <span className="animate-pulse">⏺</span> : <span>🎤</span>}
        </button>
    );
}
