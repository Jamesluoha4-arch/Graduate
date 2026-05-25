export default function AvatarInfoPanel({ avatar, onClose, onSave }) {
  return (
    <div className="info-backdrop" onMouseDown={onClose}>
      <aside className="info-panel glass-panel" onMouseDown={(event) => event.stopPropagation()}>
        <div className="info-avatar">
          <img src={avatar.avatarUrl} alt={`${avatar.displayName} avatar`} />
        </div>
        <div className="info-content">
          <p className="eyebrow">New Graduate</p>
          <h2>{avatar.displayName}</h2>
          <p className="avatar-message">"{avatar.message}"</p>
          {avatar.usedFallback && (
            <p className="fallback-note">
              Fallback preview shown because the avatar API was not available.
            </p>
          )}
          <div className="info-actions">
            <button type="button" className="button secondary" onClick={onClose}>
              Close
            </button>
            <button type="button" className="button primary" onClick={onSave}>
              Save
            </button>
          </div>
        </div>
      </aside>
    </div>
  );
}
