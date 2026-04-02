import { useState } from "react";

interface VideoModalProps {
  videoId?: string;
}

export default function VideoModal({ videoId = "L61p2uyiMSo" }: VideoModalProps) {
  const [isOpen, setIsOpen] = useState(false);

  // Helper to extract ID if a full URL was passed
  const getCleanId = (id: string) => {
    if (id.includes("youtube.com/watch?v=")) {
      return id.split("v=")[1]?.split("&")[0];
    }
    if (id.includes("youtu.be/")) {
      return id.split("youtu.be/")[1]?.split("?")[0];
    }
    return id;
  };

  const finalId = getCleanId(videoId);

  return (
    <div>
      {/* Trigger Button */}
      <button onClick={() => setIsOpen(true)} className="play-btn">
        <i className="icon-23"></i>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="video-play-box fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50 p-4">
          <div className="relative w-full max-w-4xl aspect-video bg-black rounded-xl overflow-hidden shadow-2xl border border-white/10 transition-all scale-in">
            {/* YouTube Iframe */}
            <iframe
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${finalId}?autoplay=1`}
              title="YouTube video"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute -top-12 -right-0 text-white hover:text-red-500 transition-all flex items-center gap-2 group p-2"
            >
              <span className="text-xs font-black uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-all">Close [ESC]</span>
              <span className="text-3xl font-light">✕</span>
            </button>
          </div>
        </div>
      )}
      <style>{`
        .scale-in { animation: scaleIn 0.3s ease-out forwards; }
        @keyframes scaleIn { from { opacity: 0; transform: scale(0.9); } to { opacity: 1; transform: scale(1); } }
      `}</style>
    </div>
  );
}
