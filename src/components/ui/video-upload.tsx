'use client';

import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { 
  Upload, 
  X, 
  PlayCircle, 
  FileVideo,
  ExternalLink,
  Video
} from 'lucide-react';

interface VideoUploadProps {
  video: {
    id: string;
    title: string;
    description: string;
    duration: string;
    videoFile: File | null;
    videoUrl: string;
    thumbnail: string;
    order: number;
  };
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
  onFileUpload: (file: File) => void;
}

export function VideoUpload({ 
  video, 
  onUpdate, 
  onRemove, 
  onFileUpload 
}: VideoUploadProps) {
  const handleFileSelect = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'video/*';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) onFileUpload(file);
    };
    input.click();
  };

  return (
    <div className="flex items-center gap-2 p-2 bg-blue-50 border border-blue-200 rounded-lg">
      {/* Video Icon & Number */}
      <div className="flex items-center gap-1 text-blue-600">
        <Video className="h-4 w-4" />
        <span className="text-sm font-medium">{video.order}</span>
      </div>

      {/* Video Title */}
      <Input 
        placeholder="Video title"
        value={video.title}
        onChange={(e) => onUpdate('title', e.target.value)}
        className="h-8 text-sm min-w-[120px] flex-1"
      />

      {/* Duration */}
      <Input 
        type="number"
        placeholder="15"
        value={video.duration}
        onChange={(e) => onUpdate('duration', e.target.value)}
        className="h-8 text-sm w-16"
      />
      <span className="text-xs text-gray-500">min</span>

      {/* Upload/URL Section */}
      <div className="flex items-center gap-1">
        {video.videoFile ? (
          <Badge variant="secondary" className="text-xs">
            <FileVideo className="h-3 w-3 mr-1" />
            File
          </Badge>
        ) : video.videoUrl ? (
          <Badge variant="secondary" className="text-xs">
            <ExternalLink className="h-3 w-3 mr-1" />
            URL
          </Badge>
        ) : (
          <>
            <Button 
              type="button"
              variant="outline" 
              size="sm"
              onClick={handleFileSelect}
              className="h-6 px-2 text-xs"
            >
              <Upload className="h-3 w-3" />
            </Button>
            <Input 
              placeholder="Video URL"
              value={video.videoUrl}
              onChange={(e) => onUpdate('videoUrl', e.target.value)}
              className="h-6 text-xs w-24"
            />
          </>
        )}
      </div>

      {/* Remove Button */}
      <Button 
        variant="ghost" 
        size="sm"
        onClick={onRemove}
        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
      >
        <X className="h-3 w-3" />
      </Button>
    </div>
  );
}
