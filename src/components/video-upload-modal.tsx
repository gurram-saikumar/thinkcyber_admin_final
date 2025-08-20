'use client';

import React, { useState, useCallback, useRef } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger,
  DialogClose 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Upload, 
  Video, 
  X, 
  File, 
  Link as LinkIcon, 
  Plus,
  Loader2,
  Play,
  Edit,
  Trash2,
  Eye
} from 'lucide-react';
import { toast } from '@/lib/toast';

interface VideoFile {
  id: string;
  file?: File;
  url?: string;
  name: string;
  size?: number;
  type: 'file' | 'url';
  thumbnail?: string;
  duration?: number;
}

interface VideoUploadModalProps {
  trigger: React.ReactNode;
  onVideoUpload: (videos: VideoFile[]) => void;
  moduleId?: string;
}

export function VideoUploadModal({ 
  trigger, 
  onVideoUpload, 
  moduleId
}: VideoUploadModalProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [videos, setVideos] = useState<VideoFile[]>([]);
  const [dragActive, setDragActive] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [videoLinks, setVideoLinks] = useState<string>('');
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Reset state when modal opens
  const handleOpenChange = (open: boolean) => {
    setIsOpen(open);
    if (open) {
      // Reset state when opening
      setVideos([]);
      setVideoLinks('');
      setDragActive(false);
      setUploading(false);
    }
  };

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFiles = (files: File[]) => {
    const videoFiles = files.filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) {
      toast.error('Please select video files only');
      return;
    }

    // Check file sizes (100MB limit)
    const oversizedFiles = videoFiles.filter(file => file.size > 100 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} file(s) exceed the 100MB limit`);
      return;
    }

    const newVideos: VideoFile[] = videoFiles.map((file, index) => ({
      id: `file-${Date.now()}-${index}`,
      file,
      name: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
      size: file.size,
      type: 'file',
      thumbnail: URL.createObjectURL(file) // Temporary preview
    }));

    setVideos(prev => [...prev, ...newVideos]);
    toast.success(`Added ${videoFiles.length} video(s)`);
  };

  const handleFileSelect = () => {
    fileInputRef.current?.click();
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      handleFiles(Array.from(e.target.files));
    }
  };

  const addVideoLinks = () => {
    if (!videoLinks.trim()) return;
    
    const urls = videoLinks
      .split('\n')
      .map(url => url.trim())
      .filter(url => url.length > 0);
    
    const newVideos: VideoFile[] = urls.map((url, index) => {
      let fileName = `Video ${videos.length + index + 1}`;
      
      try {
        // Better name extraction for different video platforms
        if (url.includes('youtube.com') || url.includes('youtu.be')) {
          // Extract YouTube video ID and use it as name
          const videoId = url.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/)?.[1];
          fileName = videoId ? `YouTube Video ${videoId}` : 'YouTube Video';
        } else if (url.includes('vimeo.com')) {
          const videoId = url.match(/vimeo\.com\/(\d+)/)?.[1];
          fileName = videoId ? `Vimeo Video ${videoId}` : 'Vimeo Video';
        } else {
          // For direct video URLs, extract filename
          const urlPath = new URL(url).pathname;
          const extractedName = urlPath.split('/').pop();
          if (extractedName && extractedName !== '') {
            fileName = extractedName.replace(/\.[^/.]+$/, ""); // Remove extension
          }
        }
      } catch (error) {
        // If URL parsing fails, use default name
        console.log('Could not parse URL:', url);
      }
      
      return {
        id: `url-${Date.now()}-${index}`,
        url,
        name: fileName,
        type: 'url'
      };
    });

    setVideos(prev => [...prev, ...newVideos]);
    setVideoLinks('');
    toast.success(`Added ${urls.length} video link(s)`);
  };

  const removeVideo = (videoId: string) => {
    setVideos(prev => prev.filter(v => v.id !== videoId));
  };

  const updateVideoName = (videoId: string, newName: string) => {
    setVideos(prev => prev.map(v => 
      v.id === videoId ? { ...v, name: newName } : v
    ));
  };

  const handleUpload = async () => {
    if (videos.length === 0) {
      toast.error('Please add some videos first');
      return;
    }

    setUploading(true);
    try {
      // Call parent callback with videos
      onVideoUpload(videos);
      toast.success(`${videos.length} video(s) ready for upload`);
      
      // Close modal (this will trigger state reset via handleOpenChange)
      setIsOpen(false);
    } catch (error) {
      console.error('Upload error:', error);
      toast.error('Failed to process videos');
    } finally {
      setUploading(false);
    }
  };

  const getVideoGradient = (videoId: string) => {
    // Generate consistent gradient based on video ID
    const gradients = [
      "from-blue-400 to-blue-600",
      "from-green-400 to-green-600", 
      "from-purple-400 to-purple-600",
      "from-red-400 to-red-600",
      "from-yellow-400 to-yellow-600",
      "from-indigo-400 to-indigo-600",
      "from-pink-400 to-pink-600",
      "from-teal-400 to-teal-600",
      "from-orange-400 to-orange-600",
      "from-cyan-400 to-cyan-600"
    ];
    
    // Use video ID to generate consistent color
    const hash = videoId.split('').reduce((a, b) => {
      a = ((a << 5) - a) + b.charCodeAt(0);
      return a & a;
    }, 0);
    
    return gradients[Math.abs(hash) % gradients.length];
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        {trigger}
      </DialogTrigger>
      
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="h-5 w-5" />
            Upload Videos {moduleId && `to Module`}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="upload" className="flex-1 flex flex-col">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="upload" className="flex items-center gap-2">
              <Upload className="h-4 w-4" />
              Upload Files
            </TabsTrigger>
            <TabsTrigger value="links" className="flex items-center gap-2">
              <LinkIcon className="h-4 w-4" />
              Video Links
            </TabsTrigger>
          </TabsList>

          <div className="flex-1 overflow-hidden flex flex-col">
            <TabsContent value="upload" className="flex-1 flex flex-col space-y-4">
              {/* Drag and Drop Area - Compact */}
              <div
                className={`border-2 border-dashed rounded-lg p-4 text-center transition-colors ${
                  dragActive 
                    ? 'border-primary bg-primary/5' 
                    : 'border-gray-300 hover:border-primary/50'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <div className="flex items-center justify-center gap-4">
                  <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                    <Upload className="h-6 w-6 text-primary" />
                  </div>
                  <div className="text-left">
                    <h3 className="text-base font-semibold">Drag & Drop Videos</h3>
                    <p className="text-gray-500 text-sm">
                      Or click to browse files (Max 100MB per file)
                    </p>
                  </div>
                  <Button onClick={handleFileSelect} variant="outline" size="sm">
                    <File className="h-4 w-4 mr-2" />
                    Choose Files
                  </Button>
                </div>
              </div>

              <input
                ref={fileInputRef}
                type="file"
                multiple
                accept="video/*"
                onChange={handleFileInputChange}
                className="hidden"
              />
            </TabsContent>

            <TabsContent value="links" className="flex-1 flex flex-col space-y-4">
              <div className="space-y-2">
                <Label>Video URLs (one per line)</Label>
                <textarea
                  className="w-full h-32 p-3 border rounded-lg resize-none"
                  placeholder="https://youtube.com/watch?v=dQw4w9WgXcQ&#10;https://vimeo.com/123456789&#10;https://example.com/video.mp4&#10;&#10;One video URL per line"
                  value={videoLinks}
                  onChange={(e) => setVideoLinks(e.target.value)}
                />
                <Button onClick={addVideoLinks} disabled={!videoLinks.trim()}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Links
                </Button>
              </div>
            </TabsContent>

            {/* Video List - Compact Thumbnails */}
            {videos.length > 0 ? (
              <div className="border-t pt-4 flex-1 overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium">Videos ({videos.length})</h4>
                  <Badge variant="secondary" className="px-2 py-1 text-xs">{videos.length} videos ready</Badge>
                </div>
                
                <div className="flex flex-wrap gap-2 max-h-60 overflow-auto">
                  {videos.map((video) => (
                    <div key={video.id} className="relative group bg-white border rounded overflow-hidden shadow-sm hover:shadow-md transition-shadow w-20">
                      {/* Video Thumbnail - Small */}
                      <div className="w-20 h-12 bg-gray-100 flex items-center justify-center relative overflow-hidden">
                        {/* Always use gradient background for consistent colorful appearance */}
                        <div className={`w-full h-full bg-gradient-to-br ${getVideoGradient(video.id)} flex items-center justify-center`}>
                          <Video className="h-4 w-4 text-white/80" />
                        </div>
                        
                        {/* Video Type Badge - Smaller */}
                        <div className={`absolute top-0.5 left-0.5 w-1 h-1 rounded-full ${
                          video.type === 'file' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>

                        {/* Action Buttons - Show on Hover */}
                        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-0.5">
                          {video.type === 'file' && video.thumbnail && (
                            <Button
                              size="sm"
                              variant="secondary"
                              className="h-4 w-4 p-0 bg-white/90 hover:bg-white"
                              onClick={() => {
                                if (video.thumbnail) {
                                  window.open(video.thumbnail, '_blank');
                                }
                              }}
                            >
                              <Eye className="h-2 w-2" />
                            </Button>
                          )}
                          <Button
                            size="sm"
                            variant="destructive"
                            className="h-4 w-4 p-0 bg-red-500/90 hover:bg-red-500"
                            onClick={() => removeVideo(video.id)}
                          >
                            <X className="h-2 w-2" />
                          </Button>
                        </div>
                      </div>

                      {/* Video Info - Minimal */}
                      <div className="p-1">
                        <div className="text-xs text-gray-600 truncate" title={video.name}>
                          {video.name}
                        </div>
                        {video.size && (
                          <div className="text-xs text-gray-400">
                            {formatFileSize(video.size)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              /* Sample Thumbnails Preview */
              <div className="border-t pt-4 flex-1 overflow-auto">
                <div className="flex items-center justify-between mb-3">
                  <h4 className="font-medium text-gray-500">Preview (Upload videos to see them here)</h4>
                  <Badge variant="outline" className="px-2 py-1 text-xs text-gray-500">Sample layout</Badge>
                </div>
                
                <div className="flex flex-wrap gap-2 max-h-60 overflow-auto opacity-50">
                  {/* Sample Video Thumbnails */}
                  {[
                    { name: "Tutorial_Part_1", type: "file", gradient: "from-blue-400 to-blue-600" },
                    { name: "Demo_Video", type: "file", gradient: "from-green-400 to-green-600" },
                    { name: "Introduction", type: "file", gradient: "from-purple-400 to-purple-600" },
                    { name: "YouTube_Link", type: "url", gradient: "from-red-400 to-red-600" },
                    { name: "Webinar_Recording", type: "file", gradient: "from-yellow-400 to-yellow-600" },
                    { name: "Course_Overview", type: "file", gradient: "from-indigo-400 to-indigo-600" },
                  ].map((sample, index) => (
                    <div key={index} className="relative bg-white border rounded overflow-hidden shadow-sm w-20">
                      {/* Sample Thumbnail */}
                      <div className="w-20 h-12 relative overflow-hidden">
                        <div className={`w-full h-full bg-gradient-to-br ${sample.gradient} flex items-center justify-center`}>
                          <Video className="h-4 w-4 text-white/80" />
                        </div>
                        
                        {/* Sample Type Indicator */}
                        <div className={`absolute top-0.5 left-0.5 w-1 h-1 rounded-full ${
                          sample.type === 'file' ? 'bg-green-500' : 'bg-blue-500'
                        }`}></div>
                      </div>

                      {/* Sample Info */}
                      <div className="p-1">
                        <div className="text-xs text-gray-600 truncate" title={sample.name}>
                          {sample.name}
                        </div>
                        <div className="text-xs text-gray-400">
                          {sample.type === 'file' ? '15.2 MB' : 'Link'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
                
                <div className="mt-3 text-center">
                  <p className="text-xs text-gray-500">
                    👆 This is how your uploaded videos will appear
                  </p>
                </div>
              </div>
            )}
          </div>
        </Tabs>

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t">
          <div className="text-sm text-gray-500">
            {videos.length} video(s) selected
          </div>
          <div className="flex gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button 
              onClick={handleUpload} 
              disabled={videos.length === 0 || uploading}
            >
              {uploading ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Processing...
                </>
              ) : (
                <>
                  <Upload className="h-4 w-4 mr-2" />
                  Add Videos ({videos.length})
                </>
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
