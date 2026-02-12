"use client";

import { VideoBlockSettings } from '@/types/customizer';
import React from 'react';

interface VideoBlockProps {
  settings: VideoBlockSettings;
  styles?: any;
}

const VideoBlock: React.FC<VideoBlockProps> = ({ settings, styles }) => {
  const { videoUrl, headline, autoplay, loop, muted, controls, fullWidth, aspectRatio = '16/9' } = settings;

  const getEmbedUrl = (url: string) => {
    if (!url) return null;

    // YouTube
    const youtubeRegex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const youtubeMatch = url.match(youtubeRegex);
    if (youtubeMatch) {
      let embedUrl = `https://www.youtube.com/embed/${youtubeMatch[1]}`;
      const params = [];
      if (autoplay) params.push('autoplay=1');
      if (loop) params.push(`loop=1&playlist=${youtubeMatch[1]}`);
      if (muted) params.push('mute=1');
      if (!controls) params.push('controls=0');

      if (params.length > 0) {
        embedUrl += `?${params.join('&')}`;
      }
      return embedUrl;
    }

    // Vimeo
    const vimeoRegex = /(?:vimeo\.com\/|player\.vimeo\.com\/video\/)(\d+)/;
    const vimeoMatch = url.match(vimeoRegex);
    if (vimeoMatch) {
      let embedUrl = `https://player.vimeo.com/video/${vimeoMatch[1]}`;
      const params = [];
      if (autoplay) params.push('autoplay=1');
      if (loop) params.push('loop=1');
      if (muted) params.push('muted=1');
      if (!controls) params.push('controls=0');

      if (params.length > 0) {
        embedUrl += `?${params.join('&')}`;
      }
      return embedUrl;
    }

    return null;
  };

  const embedUrl = getEmbedUrl(videoUrl || '');
  const isDirectVideo = videoUrl && (videoUrl.endsWith('.mp4') || videoUrl.endsWith('.webm') || videoUrl.endsWith('.ogg'));

  const aspectClass = {
    '16/9': 'aspect-video',
    '4/3': 'aspect-[4/3]',
    '1/1': 'aspect-square',
  }[aspectRatio] || 'aspect-video';

  return (
    <div style={styles} className="w-full">
      <div className={fullWidth ? 'w-full' : 'max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'}>
        {headline && (
          <h2
            className="text-2xl md:text-3xl font-bold mb-6"
            style={{
              color: styles?.headlineColor,
              textAlign: styles?.textAlign as any || 'center'
            }}
          >
            {headline}
          </h2>
        )}

        <div className={`relative w-full overflow-hidden shadow-xl bg-slate-100 dark:bg-slate-800 ${aspectClass} ${fullWidth ? '' : 'rounded-2xl'}`}>
          {embedUrl ? (
            <iframe
              src={embedUrl}
              className="absolute inset-0 w-full h-full border-0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : isDirectVideo ? (
            <video
              src={videoUrl}
              className="absolute inset-0 w-full h-full object-cover"
              autoPlay={autoplay}
              loop={loop}
              muted={muted}
              controls={controls}
            />
          ) : (
            <div className="absolute inset-0 flex items-center justify-center text-slate-400">
              {videoUrl ? (
                <p className="text-sm">Unsupported video format or URL</p>
              ) : (
                <div className="flex flex-col items-center gap-2">
                  <div className="w-12 h-12 rounded-full bg-slate-200 dark:bg-slate-700 flex items-center justify-center">
                    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <p className="text-xs font-medium uppercase tracking-wider">Video Placeholder</p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default VideoBlock;
