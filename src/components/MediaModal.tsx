import React from 'react';
import { X, PlayCircle } from 'lucide-react';
import { ComplaintMedia } from '../types';

interface MediaModalProps {
  media: ComplaintMedia | null;
  onClose: () => void;
}

export const MediaModal: React.FC<MediaModalProps> = ({ media, onClose }) => {
  if (!media) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-xs p-4">
      <div className="relative max-w-4xl w-full bg-slate-900 rounded-2xl overflow-hidden shadow-2xl border border-slate-700">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800 bg-slate-900">
          <div className="flex items-center space-x-2">
            <span className="text-xs uppercase tracking-wider font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
              {media.type === 'image' ? '📷 Photo Attachment' : '🎥 Video Clip'}
            </span>
            <span className="text-sm font-medium text-slate-300 truncate max-w-xs sm:max-w-md">
              {media.name}
            </span>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-4 flex items-center justify-center bg-black/60 min-h-[300px] max-h-[75vh] overflow-auto">
          {media.type === 'image' ? (
            <img
              src={media.url}
              alt={media.name}
              className="max-h-[65vh] w-auto object-contain rounded-lg shadow-md"
            />
          ) : (
            <div className="w-full flex flex-col items-center">
              <video
                src={media.url}
                controls
                autoPlay
                className="max-h-[65vh] w-full max-w-3xl rounded-lg shadow-md"
              >
                Your browser does not support the video tag.
              </video>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <PlayCircle className="w-4 h-4 text-emerald-400" />
                Playing attached complaint video proof
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
