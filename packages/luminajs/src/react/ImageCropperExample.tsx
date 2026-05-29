import React, { useState, useRef } from 'react';
import { ImageCropper } from './index.js';

/**
 * Complete image cropper example demonstrating:
 * - Basic cropping with ImageCropper component
 * - Resizing an existing crop area with selection handles
 * - Custom aspect ratios
 * - Handling the cropped result
 * - Combining ImageAreaSelector with useLumina for custom workflows
 */

export function ImageCropperExample() {
  const [imageSrc, setImageSrc] = useState<string>('');
  const [croppedResult, setCroppedResult] = useState<string | Blob | null>(
    null,
  );
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file && file.type.startsWith('image/')) {
      setImageSrc(URL.createObjectURL(file));
      setCroppedResult(null);
    }
  };

  const handleCropComplete = (croppedBlob: Blob | string) => {
    setCroppedResult(croppedBlob);
    console.log('Crop completed:', croppedBlob);
  };

  const handleError = (error: Error) => {
    console.error('Cropping error:', error.message);
    alert(`Error: ${error.message}`);
  };

  const downloadCroppedImage = () => {
    if (!croppedResult) return;

    const link = document.createElement('a');
    if (croppedResult instanceof Blob) {
      link.href = URL.createObjectURL(croppedResult);
    } else {
      link.href = croppedResult;
    }
    link.download = 'cropped-image.png';
    link.click();
  };

  return (
    <div style={{ padding: '20px', maxWidth: '1200px', margin: '0 auto' }}>
      <h1>Image Cropper Tool</h1>

      {/* File Input */}
      <div style={{ marginBottom: '20px' }}>
        <input
          type="file"
          ref={fileInputRef}
          accept="image/*"
          onChange={handleFileSelect}
          style={{ display: 'none' }}
        />
        <button
          onClick={() => fileInputRef.current?.click()}
          style={{
            padding: '10px 20px',
            backgroundColor: '#0066cc',
            color: '#fff',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '14px',
            fontWeight: '500',
          }}
        >
          {imageSrc ? 'Select Different Image' : 'Select Image'}
        </button>
      </div>

      {/* Cropper Component */}
      {imageSrc && (
        <ImageCropper
          src={imageSrc}
          aspectRatio={16 / 9}
          outputFormat="blob"
          onCropComplete={handleCropComplete}
          onError={handleError}
          maxWidth={700}
          maxHeight={500}
          showPreview={true}
          allowReset={true}
          allowResize={true}
          style={{ marginBottom: '20px' }}
        />
      )}

      {/* Cropped Result */}
      {croppedResult && (
        <div
          style={{
            padding: '20px',
            borderRadius: '8px',
            marginTop: '20px',
          }}
        >
          <h2>Cropped Result</h2>
          <div
            style={{
              display: 'flex',
              gap: '20px',
              alignItems: 'flex-start',
              flexWrap: 'wrap',
            }}
          >
            <img
              src={
                croppedResult instanceof Blob
                  ? URL.createObjectURL(croppedResult)
                  : croppedResult
              }
              alt="Cropped"
              style={{
                maxWidth: '400px',
                maxHeight: '300px',
                borderRadius: '4px',
                border: '1px solid #ddd',
              }}
            />
            <div>
              <p>
                <strong>Format:</strong>{' '}
                {croppedResult instanceof Blob ? 'Blob' : 'Data URL'}
              </p>
              <p>
                <strong>Size:</strong>{' '}
                {croppedResult instanceof Blob
                  ? `${(croppedResult.size / 1024).toFixed(2)} KB`
                  : 'Data URL'}
              </p>
              <button
                onClick={downloadCroppedImage}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#28a745',
                  color: '#fff',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: '500',
                }}
              >
                Download Cropped Image
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default ImageCropperExample;
