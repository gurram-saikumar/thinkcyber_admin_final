import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { 
  Upload, 
  Trash2, 
  FileVideo, 
  Eye, 
  CheckCircle,
  AlertCircle,
  Loader2,
  ChevronDown
} from 'lucide-react';
import { toast } from 'sonner';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

interface VideoUploadProps {
  video: {
    id: string;
    title: string;
    description: string;
    duration: string;
    videoFile?: File | null;
    videoUrl: string;
    thumbnail: string;
    order: number;
  };
  topicId?: string;
  moduleId?: string;
  onUpdate: (field: string, value: any) => void;
  onRemove: () => void;
  onFileUpload?: (file: File) => void;
}

export function VideoUpload({ 
  video, 
  topicId, 
  moduleId, 
  onUpdate, 
  onRemove, 
  onFileUpload 
}: VideoUploadProps) {
  const [uploading, setUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [uploadStatus, setUploadStatus] = useState<'idle' | 'uploading' | 'success' | 'error'>('idle');

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('video/')) {
      toast.error('Please select a valid video file');
      return;
    }

    // Validate file size (100MB limit)
    const maxSize = 100 * 1024 * 1024; // 100MB
    if (file.size > maxSize) {
      toast.error('Video file size must be less than 100MB');
      return;
    }

    // Update local state immediately
    onUpdate('videoFile', file);
    onUpdate('title', file.name.replace(/\.[^/.]+$/, "")); // Remove extension
    
    if (onFileUpload) {
      onFileUpload(file);
    } else {
      // Upload to server if topicId and moduleId are provided
      if (topicId && moduleId) {
        await uploadVideoToServer(file);
      }
    }
  };

  const uploadVideoToServer = async (file: File) => {
    try {
      setUploading(true);
      setUploadStatus('uploading');
      setUploadProgress(0);

      const formData = new FormData();
      formData.append('video', file);
      formData.append('title', video.title || file.name.replace(/\.[^/.]+$/, ""));
      formData.append('description', video.description || '');
      formData.append('order', String(video.order));

      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return prev;
          }
          return prev + 10;
        });
      }, 200);

      const result = await apiService.post(
        API_ENDPOINTS.TOPICS.VIDEOS.UPLOAD(topicId!, moduleId!),
        formData,
        {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        }
      );

      clearInterval(progressInterval);
      setUploadProgress(100);

      if (result.success) {
        setUploadStatus('success');
        onUpdate('videoUrl', result.data.videoUrl);
        onUpdate('thumbnail', result.data.thumbnailUrl);
        toast.success('Video uploaded successfully!');
      } else {
        setUploadStatus('error');
        toast.error(result.error || 'Failed to upload video');
      }
    } catch (error) {
      setUploadStatus('error');
      console.error('Video upload error:', error);
      toast.error('Failed to upload video');
    } finally {
      setUploading(false);
      setTimeout(() => {
        setUploadProgress(0);
        setUploadStatus('idle');
      }, 2000);
    }
  };

  const getStatusIcon = () => {
    switch (uploadStatus) {
      case 'uploading':
        return <Loader2 className="h-4 w-4 animate-spin text-blue-500" />;
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="h-4 w-4 text-red-500" />;
      default:
        return <FileVideo className="h-4 w-4 text-gray-500" />;
    }
  };

  return (
    <Card className="border border-gray-200 hover:border-gray-300 transition-colors">
      <CardContent className="p-3 space-y-2">
        {/* Header with Status - More Compact */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {getStatusIcon()}
            <Badge variant="outline" className="text-xs px-2 py-0">
              Video {video.order}
            </Badge>
            {video.videoFile && (
              <Badge variant="secondary" className="text-xs px-2 py-0">
                {(video.videoFile.size / (1024 * 1024)).toFixed(1)}MB
              </Badge>
            )}
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={onRemove}
            className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
          >
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>

        {/* Upload Progress */}
        {uploading && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Uploading...</span>
              <span>{uploadProgress}%</span>
            </div>
            <Progress value={uploadProgress} className="h-1" />
          </div>
        )}

        {/* Video Details - Compact Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
          <div className="md:col-span-2 space-y-1">
            <Label className="text-xs font-medium">Video Title *</Label>
            <Input
              placeholder="e.g., Introduction Video"
              value={video.title}
              onChange={(e) => onUpdate('title', e.target.value)}
              className="h-7 text-xs"
            />
          </div>
          
          <div className="space-y-1">
            <Label className="text-xs font-medium">Duration (min)</Label>
            <Input
              type="number"
              placeholder="15"
              value={video.duration}
              onChange={(e) => onUpdate('duration', e.target.value)}
              className="h-7 text-xs"
            />
          </div>
        </div>

        {/* File Upload - Compact */}
        <div className="space-y-1">
          <Label className="text-xs font-medium">Video File</Label>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                type="file"
                accept="video/*"
                onChange={handleFileSelect}
                disabled={uploading}
                className="hidden"
                id={`video-file-${video.id}`}
              />
              <Label
                htmlFor={`video-file-${video.id}`}
                className="flex items-center justify-center h-7 px-2 text-xs border border-dashed rounded-md cursor-pointer hover:bg-gray-50 transition-colors"
              >
                <Upload className="h-3 w-3 mr-1" />
                {video.videoFile ? (
                  <span className="truncate">{video.videoFile.name}</span>
                ) : (
                  'Choose file'
                )}
              </Label>
            </div>
            
            {video.videoUrl && (
              <Button
                variant="outline"
                size="sm"
                className="h-7 px-2"
                onClick={() => window.open(video.videoUrl, '_blank')}
              >
                <Eye className="h-3 w-3" />
              </Button>
            )}
          </div>
          <p className="text-xs text-gray-500">
            MP4, MOV, AVI. Max 100MB
          </p>
        </div>

        {/* Collapsible Advanced Options */}
        <details className="group">
          <summary className="text-xs font-medium cursor-pointer text-gray-600 hover:text-gray-900 flex items-center gap-1">
            <ChevronDown className="h-3 w-3 transition-transform group-open:rotate-180" />
            Advanced Options
          </summary>
          <div className="mt-2 space-y-2">
            {/* Description */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Description</Label>
              <RichTextEditor
                value={video.description}
                onChange={(value) => onUpdate('description', value)}
                placeholder="Brief description..."
                className="min-h-[60px] text-xs"
              />
            </div>

            {/* Thumbnail URL */}
            <div className="space-y-1">
              <Label className="text-xs font-medium">Thumbnail URL</Label>
              <Input
                placeholder="https://example.com/thumbnail.jpg"
                value={video.thumbnail}
                onChange={(e) => onUpdate('thumbnail', e.target.value)}
                className="h-7 text-xs"
              />
            </div>
          </div>
        </details>
      </CardContent>
    </Card>
  );
}
