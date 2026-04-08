import { Buffer } from 'node:buffer';
import { extractIframeSrc, type IframeEmbed } from './embed-iframe';

export function prepareVideoLazyEmbed(
  videoThumb: string,
  videoEmbed: IframeEmbed | null,
): {
  videoLazySrc: string | null;
  videoLazyHtmlB64: string | null;
  useVideoPoster: boolean;
} {
  let videoLazySrc: string | null = null;
  let videoLazyHtmlB64: string | null = null;
  if (videoEmbed) {
    if (videoEmbed.kind === 'src') {
      videoLazySrc = videoEmbed.src;
    } else {
      const extracted = extractIframeSrc(videoEmbed.html);
      if (extracted) {
        videoLazySrc = extracted;
      } else {
        videoLazyHtmlB64 = Buffer.from(videoEmbed.html, 'utf8').toString('base64');
      }
    }
  }
  const useVideoPoster = Boolean(
    videoThumb && videoEmbed && (videoLazySrc || videoLazyHtmlB64),
  );
  return { videoLazySrc, videoLazyHtmlB64, useVideoPoster };
}
