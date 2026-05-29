interface ThumbnailCardProps {
  thumbnail: string | undefined;
  onDownloadThumbnail: () => void;
}

export const ThumbnailCard = ({
  thumbnail,
  onDownloadThumbnail,
}: ThumbnailCardProps) => (
  <div className="thumbnail-card">
    <h4>Generated Thumbnail (useLumina Hook)</h4>
    {thumbnail && <img src={thumbnail} alt="Preview" />}

    <button
      className="toggle-btn"
      onClick={onDownloadThumbnail}
      style={{ margin: '10px auto 0' }}
    >
      Fetch & Download Thumbnail
    </button>
  </div>
);
