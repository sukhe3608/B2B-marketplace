/* ============================================================
   TradeLink — ImageUploader Component
   Drag-drop & file picker with mock upload previews and reordering.
   ============================================================ */
import { useState, useRef } from 'react';
import { UploadCloud, X, Image as ImageIcon, ChevronLeft, ChevronRight } from 'lucide-react';
import './inventory.css';

export default function ImageUploader({ images = [], onChange }) {
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFiles = (files) => {
    const validFiles = Array.from(files).filter((f) => f.type.startsWith('image/'));
    if (!validFiles.length) return;

    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        const url = e.target.result;
        onChange([...images, url]);
      };
      reader.readAsDataURL(file);
    });
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleRemove = (index) => {
    const updated = images.filter((_, i) => i !== index);
    onChange(updated);
  };

  const handleMove = (index, direction) => {
    const newIndex = index + direction;
    if (newIndex < 0 || newIndex >= images.length) return;
    const updated = [...images];
    const temp = updated[index];
    updated[index] = updated[newIndex];
    updated[newIndex] = temp;
    onChange(updated);
  };

  // Quick helper to add demo placeholder image if needed
  const handleAddSample = () => {
    const samples = [
      'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1581092335397-9583fe92d232?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=500&auto=format&fit=crop&q=60',
    ];
    const randomSample = samples[images.length % samples.length];
    onChange([...images, randomSample]);
  };

  return (
    <div className="image-uploader-container">
      <div
        className={`drop-zone ${isDragging ? 'drop-zone-active' : ''}`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onClick={() => fileInputRef.current?.click()}
        tabIndex="0"
        role="button"
        aria-label="Upload product images"
        onKeyDown={(e) => e.key === 'Enter' && fileInputRef.current?.click()}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          className="sr-only"
          onChange={(e) => handleFiles(e.target.files)}
        />
        <div className="drop-zone-content">
          <UploadCloud size={32} className="upload-icon" />
          <p className="upload-primary-text">Drag & drop product images, or browse</p>
          <p className="upload-secondary-text">PNG, JPG, WebP up to 5MB (First image is primary thumbnail)</p>
          <button
            type="button"
            className="btn btn-sm btn-secondary mt-2"
            onClick={(e) => {
              e.stopPropagation();
              handleAddSample();
            }}
          >
            <ImageIcon size={14} />
            <span>Use Sample Image</span>
          </button>
        </div>
      </div>

      {images.length > 0 && (
        <div className="image-preview-grid">
          {images.map((imgUrl, idx) => (
            <div key={idx} className="image-preview-card">
              <img src={imgUrl} alt={`Product upload preview ${idx + 1}`} className="preview-img" />
              {idx === 0 && <span className="primary-badge">Cover</span>}
              <div className="image-controls">
                <button
                  type="button"
                  className="img-ctrl-btn"
                  disabled={idx === 0}
                  onClick={() => handleMove(idx, -1)}
                  aria-label="Move image left"
                >
                  <ChevronLeft size={14} />
                </button>
                <button
                  type="button"
                  className="img-ctrl-btn"
                  disabled={idx === images.length - 1}
                  onClick={() => handleMove(idx, 1)}
                  aria-label="Move image right"
                >
                  <ChevronRight size={14} />
                </button>
                <button
                  type="button"
                  className="img-ctrl-btn remove-btn"
                  onClick={() => handleRemove(idx)}
                  aria-label="Delete image"
                >
                  <X size={14} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

