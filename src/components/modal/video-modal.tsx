'use client';

import React from 'react';
import { Modal } from '@/components/ui/modal';
import { Badge } from '@/components/ui/badge';
import { Clock, ExternalLink } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface VideoModalProps {
  isOpen: boolean;
  onClose: () => void;
  video: {
    id: number | string;
    title: string;
    description?: string | null;
    videoUrl: string;
    duration?: string | number;
    videoType?: string;
    thumbnailUrl?: string | null;
    thumbnail?: string | null;
    transcript?: string | null;
    order?: number;
    orderIndex?: number;
  };
}

export const VideoModal: React.FC<VideoModalProps> = ({
  isOpen,
  onClose,
  video
}) => {
  const isYouTubeVideo = video.videoUrl?.includes('youtube.com') || video.videoUrl?.includes('youtu.be');
  
  // Extract YouTube video ID for embedding
  const getYouTubeEmbedUrl = (url: string) => {
    const regex = /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/)([^&\n?#]+)/;
    const match = url.match(regex);
    return match ? `https://www.youtube.com/embed/${match[1]}` : url;
  };

  return (
    <Modal
      title={video.title}
      description={video.description || 'Watch this video'}
      isOpen={isOpen}
      onClose={onClose}
    >
      <div className="space-y-4">
        {/* Video Player */}
        <div className="aspect-video bg-gray-100 rounded-lg overflow-hidden">
          {isYouTubeVideo ? (
            <iframe
              src={getYouTubeEmbedUrl(video.videoUrl)}
              title={video.title}
              className="w-full h-full"
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
            />
          ) : (
            <video
              src={video.videoUrl}
              controls
              className="w-full h-full object-cover"
              poster={video.thumbnailUrl || video.thumbnail || undefined}
            >
              Your browser does not support the video tag.
            </video>
          )}
        </div>

        {/* Video Info */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              {video.duration && (
                <Badge variant="outline" className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {video.duration} min
                </Badge>
              )}
              {video.videoType && (
                <Badge variant="secondary">
                  {video.videoType.toUpperCase()}
                </Badge>
              )}
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => window.open(video.videoUrl, '_blank')}
            >
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Original
            </Button>
          </div>

          {video.description && (
            <div>
              <h4 className="font-medium mb-2">Description</h4>
              <p className="text-sm text-muted-foreground">
                {video.description}
              </p>
            </div>
          )}

          {video.transcript && (
            <div>
              <h4 className="font-medium mb-2">Transcript</h4>
              <div className="bg-gray-50 p-3 rounded-lg max-h-32 overflow-y-auto text-sm text-muted-foreground">
                {video.transcript}
              </div>
            </div>
          )}
        </div>
      </div>
    </Modal>
  );
};
