import { useState } from "react";

export default function VideoModal() {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <div>
      {/* Trigger Button */}
      <button onClick={() => setIsOpen(true)} className="play-btn">
        <i className="icon-23"></i>
      </button>

      {/* Modal */}
      {isOpen && (
        <div className="video-play-box fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50">
          <div className="relative w-full max-w-3xl aspect-video bg-black rounded-xl overflow-hidden shadow-xl">
            {/* YouTube Iframe */}
            <iframe
              className="w-full h-full"
              src="https://www.youtube.com/embed/L61p2uyiMSo?autoplay=1"
              title="YouTube video"
              frameBorder="0"
              allow="autoplay; encrypted-media"
              allowFullScreen
            />
            {/* Close Button */}
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-3 right-3 bg-white text-black rounded-full px-3 py-1 shadow-md hover:bg-gray-200 transition"
            >
              ✕
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
