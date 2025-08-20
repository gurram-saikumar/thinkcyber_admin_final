'use client';

import React, { useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { 
  Video, 
  Edit, 
  Trash2, 
  Play, 
  Eye, 
  ExternalLink,
  Save,
  X,
  Clock,
  FileVideo
} from 'lucide-react';
import { toast } from '@/lib/toast';

interface VideoItem {
  id: string;
  title?: string;
  videoUrl?: string;
  thumbnail?: string;
  duration?: number;
  order?: number;
  videoFile?: File | null;
  type?: 'file' | 'url';
}

interface VideoThumbnailGalleryProps {
  videos: VideoItem[];
  onEditVideo?: (videoId: string, updates: Partial<VideoItem>) => void;
  onDeleteVideo?: (videoId: string) => void;
  onReorderVideos?: (videos: VideoItem[]) => void;
  moduleTitle?: string;
  isEditable?: boolean;
}

export function VideoThumbnailGallery({ 
  videos, 
  onEditVideo, 
  onDeleteVideo, 
  onReorderVideos,
  moduleTitle,
  isEditable = true 
}: VideoThumbnailGalleryProps) {
  const [editingVideoId, setEditingVideoId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState('');

  const startEdit = (video: VideoItem) => {
    setEditingVideoId(video.id);
    setEditTitle(video.title || '');
  };

  const saveEdit = () => {
    if (editingVideoId && onEditVideo) {
      onEditVideo(editingVideoId, { title: editTitle });
      setEditingVideoId(null);
      setEditTitle('');
      toast.success('Video title updated');
    }
  };

  const cancelEdit = () => {
    setEditingVideoId(null);
    setEditTitle('');
  };

  const handleDelete = (videoId: string) => {
    if (onDeleteVideo) {
      onDeleteVideo(videoId);
      toast.success('Video removed');
    }
  };

  const formatDuration = (seconds?: number) => {
    if (!seconds) return '00:00';
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const getVideoPreview = (video: VideoItem) => {
    if (video.thumbnail) return video.thumbnail;
    if (video.videoFile && video.videoUrl) return video.videoUrl;
    return null;
  };

  const isVideoFile = (video: VideoItem) => {
    return video.videoFile || video.type === 'file';
  };

  const isVideoUrl = (video: VideoItem) => {
    return video.videoUrl && !video.videoFile;
  };

  if (videos.length === 0) {
    return (
      <div className="text-center py-8 bg-gray-50 rounded-lg border border-dashed border-gray-300">
        <Video className="h-12 w-12 mx-auto text-gray-400 mb-3" />
        <h3 className="text-lg font-medium text-gray-900 mb-2">No videos yet</h3>
        <p className="text-gray-500">
          {moduleTitle ? `Add videos to ${moduleTitle}` : 'Upload videos or add video links to get started'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {moduleTitle && (
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-semibold flex items-center gap-2">
            <Video className="h-5 w-5" />
            {moduleTitle} ({videos.length} videos)
          </h3>
          <Badge variant="secondary">{videos.length} videos</Badge>
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {videos.map((video, index) => {
          const isEditing = editingVideoId === video.id;
          const previewUrl = getVideoPreview(video);
          
          return (
            <Card key={video.id} className="overflow-hidden group hover:shadow-md transition-shadow">
              <div className="relative">
                {/* Video Thumbnail/Preview */}
                <div className="aspect-video bg-gray-100 flex items-center justify-center relative overflow-hidden">
                  {previewUrl ? (
                    <>
                      {isVideoFile(video) ? (
                        <video 
                          src={previewUrl} 
                          className="w-full h-full object-cover"
                          muted
                          preload="metadata"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-100 to-purple-100 flex items-center justify-center">
                          <ExternalLink className="h-8 w-8 text-blue-500" />
                        </div>
                      )}
                    </>
                  ) : (
                    <div className="w-full h-full bg-gray-100 flex items-center justify-center">
                      <FileVideo className="h-8 w-8 text-gray-400" />
                    </div>
                  )}

                  {/* Play Overlay */}
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                    <Button
                      size="sm"
                      variant="secondary"
                      className="bg-white/90 hover:bg-white"
                      onClick={() => {
                        if (video.videoUrl) {
                          window.open(video.videoUrl, '_blank');
                        } else if (previewUrl) {
                          window.open(previewUrl, '_blank');
                        }
                      }}
                    >
                      <Play className="h-4 w-4" />
                    </Button>
                  </div>

                  {/* Video Type Badge */}
                  <div className="absolute top-2 left-2">
                    <Badge 
                      variant={isVideoFile(video) ? 'default' : 'secondary'}
                      className="text-xs"
                    >
                      {isVideoFile(video) ? 'File' : 'URL'}
                    </Badge>
                  </div>

                  {/* Duration Badge */}
                  {video.duration && (
                    <div className="absolute bottom-2 right-2">
                      <Badge variant="outline" className="bg-black/50 text-white border-0 text-xs">
                        <Clock className="h-3 w-3 mr-1" />
                        {formatDuration(video.duration)}
                      </Badge>
                    </div>
                  )}

                  {/* Order Badge */}
                  <div className="absolute top-2 right-2">
                    <Badge variant="outline" className="bg-white/90 text-gray-700 border-0 text-xs font-semibold">
                      #{video.order || index + 1}
                    </Badge>
                  </div>
                </div>

                {/* Video Info */}
                <CardContent className="p-3">
                  {isEditing ? (
                    <div className="space-y-2">
                      <Input
                        value={editTitle}
                        onChange={(e) => setEditTitle(e.target.value)}
                        placeholder="Video title"
                        className="text-sm"
                        autoFocus
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') saveEdit();
                          if (e.key === 'Escape') cancelEdit();
                        }}
                      />
                      <div className="flex gap-1">
                        <Button size="sm" onClick={saveEdit} className="h-6 px-2">
                          <Save className="h-3 w-3" />
                        </Button>
                        <Button size="sm" variant="outline" onClick={cancelEdit} className="h-6 px-2">
                          <X className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ) : (
                    <div className="space-y-2">
                      <h4 className="font-medium text-sm line-clamp-2 min-h-[2.5rem]">
                        {video.title || `Video ${index + 1}`}
                      </h4>
                      
                      {isEditable && (
                        <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => startEdit(video)}
                            className="h-6 px-2 text-xs"
                          >
                            <Edit className="h-3 w-3 mr-1" />
                            Edit
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => {
                              if (video.videoUrl) {
                                window.open(video.videoUrl, '_blank');
                              } else if (previewUrl) {
                                window.open(previewUrl, '_blank');
                              }
                            }}
                            className="h-6 px-2 text-xs"
                          >
                            <Eye className="h-3 w-3" />
                          </Button>
                          
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDelete(video.id)}
                            className="h-6 px-2 text-xs"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      )}
                      
                      {/* Video Stats */}
                      <div className="text-xs text-gray-500 space-y-1">
                        {isVideoUrl(video) && (
                          <div className="flex items-center gap-1">
                            <ExternalLink className="h-3 w-3" />
                            <span className="truncate">External link</span>
                          </div>
                        )}
                        {video.videoFile && (
                          <div className="flex items-center gap-1">
                            <FileVideo className="h-3 w-3" />
                            <span className="truncate">
                              {(video.videoFile.size / (1024 * 1024)).toFixed(1)} MB
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </div>
            </Card>
          );
        })}
      </div>

      {/* Quick Stats */}
      <div className="flex items-center justify-between text-sm text-gray-500 pt-2 border-t">
        <span>
          {videos.length} video{videos.length !== 1 ? 's' : ''} total
        </span>
        <div className="flex gap-4">
          <span>{videos.filter(v => isVideoFile(v)).length} files</span>
          <span>{videos.filter(v => isVideoUrl(v)).length} links</span>
        </div>
      </div>
    </div>
  );
}
