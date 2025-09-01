import { createFFmpeg, fetchFile, type FFmpeg } from "@ffmpeg/ffmpeg";

let ffmpegInstance: FFmpeg | null = null;
let loading: Promise<FFmpeg> | null = null;

export async function getFFmpeg(): Promise<FFmpeg> {
  if (ffmpegInstance) return ffmpegInstance;
  if (loading) return loading;

  loading = (async () => {
    const ffmpeg = createFFmpeg({
      log: false,
      corePath: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.js",
      wasmPath: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.wasm",
      workerPath: "https://unpkg.com/@ffmpeg/core@0.12.6/dist/ffmpeg-core.worker.js",
    } as any);
    await ffmpeg.load();
    ffmpegInstance = ffmpeg;
    return ffmpeg;
  })();

  return loading;
}

export async function transcodeVideoToWebM(input: File, onProgress?: (p: number) => void): Promise<Blob> {
  const ffmpeg = await getFFmpeg();
  const inputName = "input";
  const inExt = input.name.split(".").pop() || "mp4";
  const inFile = `${inputName}.${inExt}`;
  const outFile = "output.webm";

  ffmpeg.FS("writeFile", inFile, await fetchFile(input));

  // VP9 + Opus for compatibility
  // Note: Performance depends on CPU; keep settings moderate
  ffmpeg.setProgress(({ ratio }) => {
    if (onProgress) onProgress(Math.min(99, Math.round((ratio || 0) * 100)));
  });

  await ffmpeg.run(
    "-i",
    inFile,
    "-c:v",
    "libvpx-vp9",
    "-b:v",
    "1M",
    "-c:a",
    "libopus",
    "-b:a",
    "96k",
    "-deadline",
    "realtime",
    outFile
  );

  const data = ffmpeg.FS("readFile", outFile);
  // cleanup
  try {
    ffmpeg.FS("unlink", inFile);
    ffmpeg.FS("unlink", outFile);
  } catch {}
  return new Blob([data.buffer], { type: "video/webm" });
}

export async function transcodeAudioToPreferred(input: File, onProgress?: (p: number) => void): Promise<{ blob: Blob; ext: "mp3" | "wav" | "ogg" }> {
  const ffmpeg = await getFFmpeg();
  const inExt = input.name.split(".").pop() || "wav";
  const inFile = `in.${inExt}`;
  ffmpeg.FS("writeFile", inFile, await fetchFile(input));

  ffmpeg.setProgress(({ ratio }) => {
    if (onProgress) onProgress(Math.min(99, Math.round((ratio || 0) * 100)));
  });

  // Try MP3 first; if it fails, fall back to WAV; else OGG
  try {
    const outMP3 = "out.mp3";
    await ffmpeg.run("-i", inFile, "-codec:a", "libmp3lame", "-b:a", "160k", outMP3);
    const data = ffmpeg.FS("readFile", outMP3);
    try {
      ffmpeg.FS("unlink", inFile);
      ffmpeg.FS("unlink", outMP3);
    } catch {}
    return { blob: new Blob([data.buffer], { type: "audio/mpeg" }), ext: "mp3" };
  } catch {
    try {
      const outOGG = "out.ogg";
      await ffmpeg.run("-i", inFile, "-codec:a", "libvorbis", "-q:a", "5", outOGG);
      const data = ffmpeg.FS("readFile", outOGG);
      try {
        ffmpeg.FS("unlink", inFile);
        ffmpeg.FS("unlink", outOGG);
      } catch {}
      return { blob: new Blob([data.buffer], { type: "audio/ogg" }), ext: "ogg" };
    } catch {
      const outWAV = "out.wav";
      await ffmpeg.run("-i", inFile, "-codec:a", "pcm_s16le", "-ar", "44100", "-ac", "2", outWAV);
      const data = ffmpeg.FS("readFile", outWAV);
      try {
        ffmpeg.FS("unlink", inFile);
        ffmpeg.FS("unlink", outWAV);
      } catch {}
      return { blob: new Blob([data.buffer], { type: "audio/wav" }), ext: "wav" };
    }
  }
}
