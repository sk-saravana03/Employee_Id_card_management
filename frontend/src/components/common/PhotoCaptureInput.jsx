import React, { useState, useRef, useEffect } from 'react';
import { Camera, Upload, X, Check, Image as ImageIcon, Video, RefreshCw } from 'lucide-react';
import toast from 'react-hot-toast';

export const PhotoCaptureInput = ({ value, onChange, label = 'Profile Photo' }) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const [stream, setStream] = useState(null);
  const videoRef = useRef(null);
  const fileInputRef = useRef(null);

  // Stop camera tracks on unmount
  useEffect(() => {
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  // Handle Local File Upload
  const handleFileChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file');
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error('Image size must be less than 5MB');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      onChange(reader.result);
      toast.success('Photo uploaded successfully');
    };
    reader.readAsDataURL(file);
  };

  // Start Live Webcam Stream
  const startCamera = async () => {
    try {
      const mediaStream = await navigator.mediaDevices.getUserMedia({
        video: { width: { ideal: 400 }, height: { ideal: 400 }, facingMode: 'user' },
        audio: false,
      });

      setStream(mediaStream);
      setIsCameraActive(true);

      // Attach stream to video element when active
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = mediaStream;
        }
      }, 100);
    } catch (err) {
      console.error('[Webcam Error]:', err);
      toast.error('Could not access webcam camera. Check browser permissions.');
    }
  };

  // Stop Live Webcam Stream
  const stopCamera = () => {
    if (stream) {
      stream.getTracks().forEach((track) => track.stop());
      setStream(null);
    }
    setIsCameraActive(false);
  };

  // Capture Snapshot Frame from Video
  const captureSnapshot = () => {
    if (!videoRef.current) return;

    const video = videoRef.current;
    const canvas = document.createElement('canvas');
    canvas.width = video.videoWidth || 300;
    canvas.height = video.videoHeight || 300;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const dataUrl = canvas.toDataURL('image/jpeg', 0.85);
    onChange(dataUrl);
    toast.success('Snapshot captured!');
    stopCamera();
  };

  return (
    <div className="space-y-2">
      <label className="block text-xs font-semibold text-slate-700">{label}</label>

      {/* Main Preview & Action Buttons Container */}
      <div className="flex items-center gap-4 p-3 rounded-xl bg-slate-50 border border-slate-200">
        {/* Photo Thumbnail */}
        <div className="w-16 h-16 rounded-xl bg-white border border-slate-300 overflow-hidden flex items-center justify-center font-bold text-slate-400 shrink-0 shadow-sm relative group">
          {value ? (
            <img src={value} alt="Preview" className="w-full h-full object-cover" />
          ) : (
            <ImageIcon className="w-8 h-8 text-slate-300" />
          )}

          {value && (
            <button
              type="button"
              onClick={() => onChange('')}
              className="absolute inset-0 bg-slate-900/60 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
              title="Remove Photo"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Action Controls */}
        <div className="space-y-2 flex-1">
          <div className="flex items-center gap-2 flex-wrap">
            {/* Native File Upload Trigger */}
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFileChange}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-100 shadow-sm transition-colors"
            >
              <Upload className="w-3.5 h-3.5 text-emerald-600" /> Upload File
            </button>

            {/* Webcam Live Capture Trigger */}
            <button
              type="button"
              onClick={startCamera}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm transition-colors"
            >
              <Camera className="w-3.5 h-3.5" /> Open Camera
            </button>
          </div>

          {/* URL Input Fallback */}
          <input
            type="text"
            placeholder="Or paste image URL link..."
            value={value || ''}
            onChange={(e) => onChange(e.target.value)}
            className="w-full px-2.5 py-1 text-[11px] border border-slate-200 rounded-md bg-white text-slate-800 placeholder-slate-400"
          />
        </div>
      </div>

      {/* Live Webcam Stream Modal Overlay */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fade-in">
          <div className="relative w-full max-w-sm bg-white rounded-2xl p-5 border border-slate-200 shadow-2xl flex flex-col items-center space-y-4">
            <div className="flex items-center justify-between w-full border-b border-slate-100 pb-2">
              <h4 className="text-xs font-bold text-slate-900 flex items-center gap-2">
                <Video className="w-4 h-4 text-emerald-600" /> Web Camera Capture
              </h4>
              <button
                type="button"
                onClick={stopCamera}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-600"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Video Feed */}
            <div className="w-64 h-64 rounded-xl overflow-hidden bg-slate-950 border-2 border-emerald-500 shadow-inner relative flex items-center justify-center">
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="w-full h-full object-cover transform -scale-x-100"
              />
            </div>

            {/* Controls */}
            <div className="flex items-center gap-3 w-full justify-center pt-2">
              <button
                type="button"
                onClick={stopCamera}
                className="px-3 py-1.5 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={captureSnapshot}
                className="inline-flex items-center gap-1.5 px-4 py-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg shadow-sm"
              >
                <Camera className="w-4 h-4" /> Take Snapshot
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PhotoCaptureInput;
