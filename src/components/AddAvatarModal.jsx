import { useEffect, useMemo, useRef, useState } from "react";

export default function AddAvatarModal({ onCancel, onGenerate, error }) {
  const [displayName, setDisplayName] = useState("");
  const [message, setMessage] = useState("");
  const [photo, setPhoto] = useState(null);
  const [cameraStatus, setCameraStatus] = useState("idle");
  const [cameraError, setCameraError] = useState("");
  const videoRef = useRef(null);
  const streamRef = useRef(null);

  const previewUrl = useMemo(() => (photo ? URL.createObjectURL(photo) : ""), [photo]);

  const stopCamera = () => {
    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;
    setCameraStatus("idle");
  };

  useEffect(() => {
    return () => stopCamera();
  }, []);

  useEffect(() => {
    if (videoRef.current && streamRef.current) {
      videoRef.current.srcObject = streamRef.current;
      videoRef.current.play().catch(() => undefined);
    }
  }, [cameraStatus]);

  const closeModal = () => {
    stopCamera();
    onCancel();
  };

  const startCamera = async () => {
    setCameraError("");

    if (!navigator.mediaDevices?.getUserMedia) {
      setCameraError("Camera access is not supported in this browser. Please use Chrome or Edge.");
      return;
    }

    try {
      stopCamera();
      setCameraStatus("starting");
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          facingMode: "user",
          width: { ideal: 1280 },
          height: { ideal: 1280 },
        },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setCameraStatus("ready");
    } catch {
      setCameraStatus("idle");
      setCameraError("Camera permission was blocked or the camera is unavailable.");
    }
  };

  const captureFromCamera = async () => {
    const video = videoRef.current;
    if (!video || cameraStatus !== "ready") return;

    const canvas = document.createElement("canvas");
    canvas.width = video.videoWidth || 960;
    canvas.height = video.videoHeight || 960;
    const context = canvas.getContext("2d");
    context.drawImage(video, 0, 0, canvas.width, canvas.height);

    const blob = await new Promise((resolve) => canvas.toBlob(resolve, "image/jpeg", 0.92));
    if (!blob) {
      setCameraError("Could not capture a camera frame. Please try again.");
      return;
    }

    const capturedFile = new File([blob], `camera-capture-${Date.now()}.jpg`, {
      type: "image/jpeg",
    });
    setPhoto(capturedFile);
    stopCamera();
  };

  const submit = (event) => {
    event.preventDefault();
    if (!photo) return;
    onGenerate({
      photo,
      displayName: displayName.trim() || "USYD Graduate",
      message:
        message.trim() ||
        "A new graduate celebrating this moment at the University of Sydney.",
    });
  };

  return (
    <div className="modal-backdrop" onMouseDown={closeModal}>
      <form className="create-modal glass-panel" onSubmit={submit} onMouseDown={(e) => e.stopPropagation()}>
        <div className="modal-heading">
          <div>
            <p className="eyebrow">Graduation avatar</p>
            <h2>Create Your Second Self</h2>
          </div>
          <button className="ghost-icon" type="button" onClick={closeModal} aria-label="Close">
            x
          </button>
        </div>

        <div className="camera-zone">
          {previewUrl ? (
            <img src={previewUrl} alt="Captured face preview" />
          ) : (
            <>
              <video ref={videoRef} playsInline muted />
              {cameraStatus !== "ready" && (
                <div className="camera-empty">
                  <strong>Use your camera to scan your face</strong>
                  <small>The captured frame is sent to your avatar generation backend.</small>
                </div>
              )}
            </>
          )}
          <div className="camera-actions">
            {cameraStatus === "ready" ? (
              <button type="button" className="button primary" onClick={captureFromCamera}>
                Capture Face
              </button>
            ) : (
              <button type="button" className="button primary" onClick={startCamera}>
                {cameraStatus === "starting" ? "Starting..." : "Start Camera"}
              </button>
            )}
            {photo && (
              <button type="button" className="button secondary" onClick={() => setPhoto(null)}>
                Retake
              </button>
            )}
          </div>
        </div>

        <label className="field">
          <span>Display name</span>
          <input
            value={displayName}
            onChange={(event) => setDisplayName(event.target.value)}
            placeholder="e.g. Mia Chen"
          />
        </label>

        <label className="field">
          <span>Personal message</span>
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            placeholder="Write a short graduation note..."
          />
        </label>

        <p className="privacy-copy">
          Your real photo is used only to generate a stylised avatar. The final scene displays only
          the Q-version avatar.
        </p>

        {(error || cameraError) && <div className="error-banner">{error || cameraError}</div>}

        <div className="modal-actions">
          <button type="button" className="button secondary" onClick={closeModal}>
            Cancel
          </button>
          <button type="submit" className="button primary" disabled={!photo}>
            Generate Avatar
          </button>
        </div>
      </form>
    </div>
  );
}
