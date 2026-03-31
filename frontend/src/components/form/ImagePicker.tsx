import React, { useState, useRef } from "react";
import { FiCamera, FiX, FiUploadCloud } from "react-icons/fi";

interface ImagePickerProps {
  id: string;
  label: string;
  value: File | string | null;
  onChange: (file: File | null) => void;
  previewUrl?: string;
  className?: string;
  disabled?: boolean;
}

const ImagePicker: React.FC<ImagePickerProps> = ({
  id,
  label,
  onChange,
  previewUrl,
  className = "",
  disabled = false,
}) => {
  const [internalPreview, setInternalPreview] = useState<string | null>(previewUrl || null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0] || null;
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setInternalPreview(reader.result as string);
      };
      reader.readAsDataURL(file);
      onChange(file);
    }
  };

  const clearImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setInternalPreview(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <div className={`space-y-2 ${className}`}>
      {label && (
        <label 
          htmlFor={id} 
          className="block text-sm font-bold uppercase tracking-widest text-gray-700 dark:text-gray-300 mb-1"
        >
          {label}
        </label>
      )}
      
      <div 
        onClick={() => !disabled && fileInputRef.current?.click()}
        className={`relative group cursor-pointer overflow-hidden rounded-xl border-2 border-dashed transition-all duration-300 
          ${internalPreview 
            ? "border-blue-500/50 bg-blue-50/5 dark:bg-blue-900/5" 
            : "border-gray-300 dark:border-gray-700 hover:border-blue-500 dark:hover:border-blue-400 bg-gray-50 dark:bg-gray-900/50"
          } 
          ${disabled ? "opacity-50 cursor-not-allowed" : ""}
          aspect-video flex items-center justify-center p-2`}
      >
        <input
          ref={fileInputRef}
          id={id}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleFileChange}
          disabled={disabled}
        />

        {internalPreview ? (
          <div className="relative w-full h-full group">
            <img 
              src={internalPreview} 
              alt="Preview" 
              className="w-full h-full object-contain rounded-lg shadow-sm"
            />
            {!disabled && (
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                <button
                  type="button"
                  className="p-2 bg-blue-600 text-white rounded-full hover:bg-blue-700 transition-transform hover:scale-110"
                  title="Change Image"
                >
                  <FiCamera size={20} />
                </button>
                <button
                  type="button"
                  onClick={clearImage}
                  className="p-2 bg-red-600 text-white rounded-full hover:bg-red-700 transition-transform hover:scale-110"
                  title="Remove Image"
                >
                  <FiX size={20} />
                </button>
              </div>
            )}
          </div>
        ) : (
          <div className="flex flex-col items-center gap-2 text-center p-4">
            <div className="w-12 h-12 rounded-full bg-blue-50 dark:bg-blue-900/30 flex items-center justify-center text-blue-600 dark:text-blue-400 group-hover:scale-110 transition-transform duration-300">
               <FiUploadCloud size={24} />
            </div>
            <div>
              <p className="text-sm font-bold text-gray-700 dark:text-gray-200">
                Click to upload image
              </p>
              <p className="text-[10px] text-gray-400 uppercase tracking-widest font-black mt-1">
                PNG, JPG or WEBP (Max 5MB)
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImagePicker;
