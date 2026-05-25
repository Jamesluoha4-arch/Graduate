import { useEffect, useMemo, useState } from "react";
import quadCenterUrl from "./assets/quad-center.png";
import quadFrontUrl from "./assets/quad-front.png";
import quadLeftUrl from "./assets/quad-left.png";
import quadRightUrl from "./assets/quad-right.jpg";
import secondSelfLogoUrl from "./assets/second-self-logo.png";
import AddAvatarModal from "./components/AddAvatarModal.jsx";
import AvatarInfoPanel from "./components/AvatarInfoPanel.jsx";
import AvatarWall from "./components/AvatarWall.jsx";
import LoadingOverlay from "./components/LoadingOverlay.jsx";
import { resolveSlot } from "./data/placementSlots.js";
import { generateGraduationAvatar } from "./lib/avatarApi.js";

const loadingDelay = 760;

const scenes = {
  front: {
    background: quadFrontUrl,
    label: "Front lawn",
    controls: [{ direction: "forward", label: "Go forward", target: "center" }],
  },
  center: {
    background: quadCenterUrl,
    label: "Main quad path",
    controls: [
      { direction: "back", label: "Back to front lawn", target: "front" },
      { direction: "left", label: "Turn left", target: "left" },
      { direction: "right", label: "Turn right", target: "right" },
    ],
  },
  left: {
    background: quadLeftUrl,
    label: "Left courtyard",
    controls: [{ direction: "right", label: "Back to main path", target: "center" }],
  },
  right: {
    background: quadRightUrl,
    label: "Right courtyard",
    controls: [{ direction: "left", label: "Back to main path", target: "center" }],
  },
};

function fileToDataUrl(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error("Could not read the uploaded image."));
    reader.readAsDataURL(file);
  });
}

function wait(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

export default function App() {
  const [avatars, setAvatars] = useState([]);
  const [pendingAvatar, setPendingAvatar] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [selectedAvatar, setSelectedAvatar] = useState(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [loadingStep, setLoadingStep] = useState(0);
  const [error, setError] = useState("");
  const [sceneId, setSceneId] = useState("front");

  const sceneAvatars = useMemo(
    () => avatars.filter((avatar) => avatar.sceneId === sceneId),
    [avatars, sceneId],
  );
  const nextSlot = useMemo(() => resolveSlot(sceneAvatars.length), [sceneAvatars.length]);
  const scene = scenes[sceneId];

  useEffect(() => {
    setSelectedAvatar((avatar) => (avatar?.sceneId === sceneId ? avatar : null));
  }, [sceneId]);

  const createAvatar = async ({ photo, displayName, message }) => {
    setError("");
    setIsGenerating(true);
    setLoadingStep(0);

    try {
      const photoDataUrl = await fileToDataUrl(photo);
      await wait(loadingDelay);
      setLoadingStep(1);

      const generation = await generateGraduationAvatar(photoDataUrl);
      await wait(loadingDelay);
      setLoadingStep(2);
      await wait(loadingDelay);

      const nextAvatar = {
        id: crypto.randomUUID?.() || String(Date.now()),
        avatarUrl: generation.avatarUrl,
        displayName,
        message,
        slot: {
          ...nextSlot,
          x: 50,
          y: 82,
          scale: 0.85,
        },
        createdAt: new Date().toISOString(),
        usedFallback: generation.usedFallback,
      };

      setPendingAvatar(nextAvatar);
      setModalOpen(false);
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Avatar generation failed. Please try again.",
      );
    } finally {
      setIsGenerating(false);
      setLoadingStep(0);
    }
  };

  const moveAvatar = (id, position) => {
    setAvatars((items) =>
      items.map((avatar) =>
        avatar.id === id
          ? {
              ...avatar,
              slot: {
                ...avatar.slot,
                x: position.x,
                y: position.y,
              },
            }
          : avatar,
      ),
    );
    setSelectedAvatar((avatar) =>
      avatar?.id === id
        ? {
            ...avatar,
            slot: {
              ...avatar.slot,
              x: position.x,
              y: position.y,
            },
          }
        : avatar,
    );
  };

  const placePendingAvatar = () => {
    if (!pendingAvatar) return;
    const avatarForScene = {
      ...pendingAvatar,
      sceneId,
      slot: {
        ...pendingAvatar.slot,
        zIndex: pendingAvatar.slot.zIndex ?? nextSlot.zIndex,
      },
    };
    setAvatars((items) => [...items, avatarForScene]);
    setPendingAvatar(null);
    setSelectedAvatar(avatarForScene);
  };

  const pickUpAvatar = (avatar) => {
    setAvatars((items) => items.filter((item) => item.id !== avatar.id));
    setSelectedAvatar((selected) => (selected?.id === avatar.id ? null : selected));
    setPendingAvatar(avatar);
  };

  const saveSelectedAvatar = () => {
    setSelectedAvatar(null);
  };

  return (
    <main className="graduation-wall">
      <img className="background-photo" src={scene.background} alt={`University of Sydney ${scene.label}`} />
      <div className="photo-overlay" />

      <nav className="scene-controls" aria-label="Courtyard navigation">
        {scene.controls.map((control) => (
          <button
            key={control.direction}
            type="button"
            className={`scene-arrow scene-arrow-${control.direction}`}
            onClick={() => setSceneId(control.target)}
            aria-label={control.label}
          >
            <span aria-hidden="true" />
          </button>
        ))}
      </nav>

      <header className="top-bar">
        <div className="brand-card glass-panel">
          <img className="brand-logo" src={secondSelfLogoUrl} alt="Second Self" />
          <div>
            <p className="eyebrow">USYD graduation wall</p>
            <h1>Second Self</h1>
            <p>Create your Q-version graduation companion at USYD.</p>
          </div>
        </div>
        <button className="button primary add-button" type="button" onClick={() => setModalOpen(true)}>
          Add My Avatar
        </button>
      </header>

      <AvatarWall
        avatars={sceneAvatars}
        onMoveAvatar={moveAvatar}
        onSelect={setSelectedAvatar}
        onPickUpAvatar={pickUpAvatar}
      />

      {pendingAvatar && (
        <section className="pending-avatar-stage glass-panel" aria-label="Generated avatar ready to place">
          <div className="pending-avatar-glow">
            <img src={pendingAvatar.avatarUrl} alt={`${pendingAvatar.displayName} generated avatar`} />
          </div>
          <div className="pending-avatar-copy">
            <strong>{pendingAvatar.displayName}</strong>
            <span>Generated avatar ready</span>
          </div>
          <button className="button primary place-button" type="button" onClick={placePendingAvatar}>
            Place
          </button>
        </section>
      )}

      {!pendingAvatar && (
        <section className="scene-note glass-panel">
          <p>Only stylised avatars are shown in the scene. Real face photos are not displayed.</p>
        </section>
      )}

      {!pendingAvatar && (
        <footer className="bottom-hint glass-panel">Click any avatar to read their message.</footer>
      )}

      {modalOpen && (
        <AddAvatarModal
          error={error}
          onCancel={() => {
            setError("");
            setModalOpen(false);
          }}
          onGenerate={createAvatar}
        />
      )}

      {isGenerating && <LoadingOverlay activeStep={loadingStep} />}

      {selectedAvatar && (
        <AvatarInfoPanel
          avatar={selectedAvatar}
          onClose={() => pickUpAvatar(selectedAvatar)}
          onSave={saveSelectedAvatar}
        />
      )}
    </main>
  );
}
