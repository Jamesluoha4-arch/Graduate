export const graduationAvatarPrompt =
  "Transform the person in the reference photo into a high-quality transparent-background PNG chibi graduation avatar. The character should be a cute Q-version full-body figure, naturally wearing a black university graduation gown with subtle red academic hood accents suitable for the University of Sydney. Keep the person's recognizable hairstyle, face shape, skin tone, and visible accessories from the reference photo, but stylize them into a polished modern chibi collectible character. The figure should stand upright, feet visible, with clean edges and no background, no text, no logos, and no extra objects.";

const defaultAvatarApiUrl = "https://idea9301-avatar.jamesluoha4.workers.dev/";

export function getAvatarApiUrl() {
  const runtimeUrl =
    typeof window !== "undefined" ? window.localStorage.getItem("avatarApiUrl") : "";
  return runtimeUrl || import.meta.env.VITE_AVATAR_API_URL || defaultAvatarApiUrl;
}

export async function generateGraduationAvatar(photoDataUrl) {
  const endpoint = getAvatarApiUrl();
  if (!endpoint) {
    return { avatarUrl: createFallbackAvatarDataUrl(), usedFallback: true };
  }

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      image: photoDataUrl,
      prompt: graduationAvatarPrompt,
    }),
  });

  const data = await response.json().catch(() => ({}));
  if (!response.ok) {
    throw new Error(data.error || `Avatar generation failed: ${response.status}`);
  }

  const avatarUrl = data.image || (data.b64_json ? `data:image/png;base64,${data.b64_json}` : "");
  if (!avatarUrl) {
    throw new Error("Avatar generation response did not include an image.");
  }

  return { avatarUrl, usedFallback: false };
}

export function createFallbackAvatarDataUrl() {
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="420" height="720" viewBox="0 0 420 720">
      <defs>
        <linearGradient id="gown" x1="0" x2="1" y1="0" y2="1">
          <stop offset="0" stop-color="#22253a"/>
          <stop offset="1" stop-color="#050711"/>
        </linearGradient>
        <linearGradient id="hood" x1="0" x2="1">
          <stop offset="0" stop-color="#fb7185"/>
          <stop offset="1" stop-color="#ef4444"/>
        </linearGradient>
        <filter id="shadow" x="-40%" y="-40%" width="180%" height="180%">
          <feDropShadow dx="0" dy="20" stdDeviation="16" flood-color="#111827" flood-opacity=".25"/>
        </filter>
      </defs>
      <g filter="url(#shadow)">
        <ellipse cx="210" cy="672" rx="92" ry="24" fill="#111827" opacity=".18"/>
        <path d="M125 265c-32 72-46 164-54 292h278c-9-128-23-220-55-292-45 27-124 27-169 0z" fill="url(#gown)"/>
        <path d="M132 268c37 45 119 64 156 0l29 70c-61 43-154 37-214-1z" fill="url(#hood)"/>
        <path d="M170 356h80l22 201H148z" fill="#f8fafc"/>
        <path d="M132 270c21 40 45 135 60 287h-81c4-127 10-218 21-287z" fill="#151827"/>
        <path d="M288 270c-21 40-45 135-60 287h81c-4-127-10-218-21-287z" fill="#151827"/>
        <path d="M165 557h40v86h-44zM215 557h40l4 86h-44z" fill="#111827"/>
        <path d="M149 639h67v28h-70zM206 639h67l3 28h-70z" fill="#f8fafc"/>
        <circle cx="210" cy="154" r="92" fill="#f6c7a8"/>
        <path d="M112 153c6-70 52-115 111-115 55 0 91 36 88 97-36-21-101-29-165 0-16 7-27 13-34 18z" fill="#1f2937"/>
        <path d="M126 148c23-38 91-58 164-25 11 50-16 99-80 99-45 0-74-24-84-74z" fill="#f6c7a8"/>
        <circle cx="176" cy="154" r="9" fill="#111827"/>
        <circle cx="244" cy="154" r="9" fill="#111827"/>
        <path d="M188 190c17 15 43 15 61 0" fill="none" stroke="#9f4f45" stroke-width="8" stroke-linecap="round"/>
        <path d="M136 66l73-42 77 42-77 44z" fill="#101322"/>
        <path d="M209 106v46" stroke="#101322" stroke-width="10" stroke-linecap="round"/>
        <circle cx="209" cy="158" r="11" fill="#ef4444"/>
      </g>
    </svg>`;
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}
