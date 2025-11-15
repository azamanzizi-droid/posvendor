import React, { useState, useRef, useEffect } from 'react';
import Modal from './Modal';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCapture: (imageDataUrl: string) => void;
}

const CameraModal: React.FC<CameraModalProps> = ({ isOpen, onClose, onCapture }) => {
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen) {
      startCamera();
    } else {
      stopCamera();
    }
    
    return () => {
      stopCamera();
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isOpen]);

  const startCamera = async () => {
    try {
      setError(null);
      const mediaStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(mediaStream);
      if (videoRef.current) {
        videoRef.current.srcObject = mediaStream;
      }
    } catch (err) {
      console.error("Error accessing camera:", err);
      setError("Tidak dapat mengakses kamera. Sila pastikan anda telah memberi kebenaran.");
    }
  };

  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach(track => track.stop());
      setStream(null);
    }
  };

  const handleCapture = () => {
    if (videoRef.current && canvasRef.current) {
      const video = videoRef.current;
      const canvas = canvasRef.current;
      
      canvas.width = video.videoWidth;
      canvas.height = video.videoHeight;
      
      const context = canvas.getContext('2d');
      if (context) {
        context.drawImage(video, 0, 0, canvas.width, canvas.height);
        const imageDataUrl = canvas.toDataURL('image/jpeg');
        onCapture(imageDataUrl);
      }
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Ambil Gambar">
      <div className="space-y-4">
        {error ? (
          <p className="text-red-500 text-center">{error}</p>
        ) : (
          <div className="relative bg-black rounded-lg overflow-hidden">
            <video ref={videoRef} autoPlay playsInline className="w-full h-auto" />
            <canvas ref={canvasRef} className="hidden" />
          </div>
        )}
        <div className="flex justify-center items-center gap-4">
          <button 
            onClick={handleCapture}
            disabled={!!error || !stream}
            className="w-16 h-16 bg-white rounded-full border-4 border-slate-400 disabled:opacity-50 ring-2 ring-offset-2 ring-offset-slate-800 ring-transparent focus:outline-none focus\:theme-ring-primary transition"
            aria-label="Ambil gambar"
          />
        </div>
        <div className="flex justify-end">
            <button type="button" onClick={onClose} className="px-4 py-2 bg-slate-200 text-slate-800 rounded-md hover:bg-slate-300 dark:bg-slate-600 dark:text-slate-200 dark:hover:bg-slate-500 transition-colors duration-150">Batal</button>
        </div>
      </div>
    </Modal>
  );
};

export default CameraModal;