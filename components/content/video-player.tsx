"use client";

export function VideoPlayer({ src }: { src: string }) {
  return (
    <div className="overflow-hidden rounded-lg border bg-black">
      <video
        src={src}
        controls
        className="aspect-video w-full"
        controlsList="nodownload"
      >
        Your browser does not support video playback.
      </video>
    </div>
  );
}
