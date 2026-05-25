import { useRef, useState } from "react";

const dragThreshold = 5;

function clamp(value, min, max) {
  return Math.max(min, Math.min(max, value));
}

export default function AvatarWall({ avatars, onMoveAvatar, onSelect, onPickUpAvatar }) {
  const layerRef = useRef(null);
  const dragRef = useRef(null);
  const [draggingId, setDraggingId] = useState(null);

  const positionFromPointer = (event) => {
    const rect = layerRef.current.getBoundingClientRect();
    return {
      x: clamp(((event.clientX - rect.left) / rect.width) * 100, 4, 96),
      y: clamp(((event.clientY - rect.top) / rect.height) * 100, 18, 92),
    };
  };

  const startDrag = (event, avatar) => {
    if (event.button === 2) return;
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      id: avatar.id,
      startX: event.clientX,
      startY: event.clientY,
      moved: false,
    };
    setDraggingId(avatar.id);
  };

  const moveDrag = (event) => {
    const drag = dragRef.current;
    if (!drag) return;

    const movement = Math.hypot(event.clientX - drag.startX, event.clientY - drag.startY);
    if (movement > dragThreshold) drag.moved = true;
    onMoveAvatar(drag.id, positionFromPointer(event));
  };

  const endDrag = (event, avatar) => {
    const drag = dragRef.current;
    if (!drag) return;

    event.currentTarget.releasePointerCapture(event.pointerId);
    dragRef.current = null;
    setDraggingId(null);

    if (!drag.moved) {
      onSelect(avatar);
    }
  };

  return (
    <div ref={layerRef} className="avatar-layer" aria-label="Generated avatar wall">
      {avatars.map((avatar) => (
        <button
          key={avatar.id}
          type="button"
          className={`placed-avatar ${draggingId === avatar.id ? "is-dragging" : ""}`}
          style={{
            left: `${avatar.slot.x}%`,
            top: `${avatar.slot.y}%`,
            "--avatar-scale": avatar.slot.scale,
            zIndex: avatar.slot.zIndex + (draggingId === avatar.id ? 20 : 0),
          }}
          onPointerDown={(event) => startDrag(event, avatar)}
          onPointerMove={moveDrag}
          onPointerUp={(event) => endDrag(event, avatar)}
          onPointerCancel={(event) => endDrag(event, avatar)}
          onContextMenu={(event) => {
            event.preventDefault();
            onPickUpAvatar(avatar);
          }}
          aria-label={`Drag ${avatar.displayName} or tap to open their message`}
        >
          <img draggable="false" src={avatar.avatarUrl} alt="" />
          <span className="avatar-name-label">{avatar.displayName}</span>
          {avatar.usedFallback && <span className="fallback-pill">fallback</span>}
        </button>
      ))}
    </div>
  );
}
