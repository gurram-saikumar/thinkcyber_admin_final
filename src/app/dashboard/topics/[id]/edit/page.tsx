'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { VideoUpload } from '@/components/video-upload';
import Link from 'next/link';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { toast } from '@/lib/toast';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  X, 
  FileText, 
  ChevronRight, 
  ChevronLeft, 
  Users, 
  DollarSign, 
  Settings, 
  BookOpen,
  Video,
  PlayCircle,
  Trash2,
  ChevronDown,
  ChevronUp,
  Loader2,
  RefreshCw,
  Upload,
  Eye
} from 'lucide-react';
import { VideoUploadModal } from '@/components/video-upload-modal';
import { VideoThumbnailGallery } from '@/components/video-thumbnail-gallery';

// Type for category data from API
interface CategoryData {
  id: number | string;
  name: string;
  description?: string;
  status?: string;
  emoji?: string;
}

// API functions
const fetchCategories = async () => {
   try {
    const result = await apiService.get<any>(API_ENDPOINTS.CATEGORIES.BASE, {
      params: { fetchAll: 'true' }
    });
     
    if (result.success) {
       return result.data || [];
    } else {
       return [];
    }
  } catch (error) {
     return [];
  }
};

const fetchSubcategories = async (categoryId: string) => {
   try {
    const result = await apiService.get<any>(API_ENDPOINTS.SUBCATEGORIES.BASE, {
      params: { 
        categoryId: categoryId,
        fetchAll: 'true'
      }
    });
    console.log('📡 Subcategories API response:', result);
    
    if (result.success) {
      console.log('✅ Subcategories fetched successfully:', result.data);
      return result.data || [];
    } else {
      console.error('❌ Failed to fetch subcategories:', result.error);
      return [];
    }
  } catch (error) {
    console.error('💥 Error fetching subcategories:', error);
    return [];
  }
};

interface LocalVideo {
  id: string | number;
  title: string;
  description: string;
  duration: string;
  videoFile: File | null;
  videoUrl: string;
  uploadedUrl?: string; // URL after successful upload
  thumbnail: string;
  thumbnailUrl?: string;
  order: number;
  orderIndex?: number;
  videoType?: string;
  durationSeconds?: number;
  isPreview?: boolean;
  transcript?: string;
}

interface LocalModule {
  id: string | number;
  title: string;
  description: string;
  order: number;
  orderIndex?: number;
  videos: LocalVideo[];
  durationMinutes?: number;
  isActive?: boolean;
}

interface LocalTopicFormData {
  // Basic Info
  title: string;
  slug: string;
  emoji: string;
  category: string;
  subcategory: string;
  difficulty: 'beginner' | 'intermediate' | 'advanced' | 'expert' | '';
  duration: string;
  description: string;
  learningObjectives: string;
  
  // Modules & Videos
  modules: LocalModule[];
  
  // Pricing & Settings
  isFree: boolean;
  price: string;
  tags: string[];
  status: 'draft' | 'published' | 'archived';
  targetAudience: string[];
  prerequisites: string;
  thumbnail: string;
  metaTitle: string;
  metaDescription: string;
  featured: boolean;
}

const STEPS = [
  { id: 1, title: 'Basic Info', icon: BookOpen, description: 'Topic details and information' },
  { id: 2, title: 'Modules & Videos', icon: Video, description: 'Edit modules with video content' },
  { id: 3, title: 'Audience & Tags', icon: Users, description: 'Target audience and tags' },
  { id: 4, title: 'Settings & Publish', icon: Settings, description: 'Pricing and publishing options' },
];

const TARGET_AUDIENCES = [
  '🏢 Business Owners',
  '👨‍👩‍👧‍👦 Parents',
  '🧒 Children',
  '👨‍💻 Developers',
  '🎓 Security Aspirants',
  '👤 General Users',
  '🏫 Students',
  '👨‍🏫 Educators'
];

export default function EditTopicPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.id as string;
  
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<LocalTopicFormData | null>(null);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [initialLoading, setInitialLoading] = useState(true);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Category and subcategory state
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);
  const [expandedModules, setExpandedModules] = useState<(string | number)[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);
  
  // Store category and subcategory names from topic data for immediate display
  const [categoryName, setCategoryName] = useState<string>('');
  const [subcategoryName, setSubcategoryName] = useState<string>('');

  // Refresh categories function
  const refreshCategories = async () => {
    setLoadingCategories(true);
    console.log('🔄 Refreshing categories...');
    try {
      const categoriesData = await fetchCategories();
      console.log('📦 Refreshed categories:', categoriesData);
      setCategories(categoriesData);
      toast.success('Categories refreshed successfully');
    } catch (error) {
      console.error('💥 Failed to refresh categories:', error);
      toast.error('Failed to refresh categories');
    } finally {
      setLoadingCategories(false);
    }
  };

  // Refresh subcategories function
  const refreshSubcategories = async () => {
    if (!formData?.category) {
      toast.error('Please select a category first');
      return;
    }
    
    setLoadingSubcategories(true);
    console.log('🔄 Refreshing subcategories for category:', formData.category);
    try {
      const subcategoriesData = await fetchSubcategories(formData.category);
      console.log('📦 Refreshed subcategories:', subcategoriesData);
      setAvailableSubcategories(subcategoriesData);
      toast.success('Subcategories refreshed successfully');
    } catch (error) {
      console.error('💥 Failed to refresh subcategories:', error);
      toast.error('Failed to refresh subcategories');
    } finally {
      setLoadingSubcategories(false);
    }
  };

  // Convert Topic API response to form data
  const convertTopicToFormData = (topic: any): LocalTopicFormData => {
    console.log('🔄 Converting topic data to form data:', topic);
    console.log('📊 Topic modules:', topic.modules);
    
    if (topic.modules) {
      topic.modules.forEach((module: any, index: number) => {
        console.log(`📋 Module ${index + 1} (ID: ${module.id}):`, module.title);
        console.log(`🎬 Module ${index + 1} videos:`, module.videos);
        if (module.videos && module.videos.length > 0) {
          module.videos.forEach((video: any, vIndex: number) => {
            console.log(`  🎥 Video ${vIndex + 1}:`, {
              id: video.id,
              title: video.title,
              videoUrl: video.videoUrl,
              order: video.order
            });
          });
        }
      });
    }
    
    const convertedData = {
      title: topic.title || '',
      slug: topic.slug || '',
      emoji: topic.emoji || '🔐',
      category: String(topic.category || ''),
      subcategory: String(topic.subcategory || ''),
      difficulty: topic.difficulty || '',
      duration: String(topic.duration || ''),
      description: topic.description || '',
      learningObjectives: topic.learningObjectives || '',
      modules: topic.modules?.map((module: any) => ({
        id: module.id,
        title: module.title || '',
        description: module.description || '',
        order: module.order || module.orderIndex || 1,
        orderIndex: module.orderIndex,
        durationMinutes: module.durationMinutes,
        isActive: module.isActive,
        videos: module.videos?.map((video: any) => {
          console.log(`  🎥 Converting video:`, {
            id: video.id,
            title: video.title,
            videoUrl: video.videoUrl,
            thumbnailUrl: video.thumbnailUrl || video.thumbnail
          });
          return {
            id: video.id,
            title: video.title || '',
            description: video.description || '',
            duration: String(video.duration || video.durationSeconds ? Math.ceil(video.durationSeconds / 60) : ''),
            videoFile: null,
            videoUrl: video.videoUrl || '',
            uploadedUrl: video.videoUrl || '', // Mark as already uploaded
            thumbnail: video.thumbnail || video.thumbnailUrl || '',
            thumbnailUrl: video.thumbnailUrl,
            order: video.order || video.orderIndex || 1,
            orderIndex: video.orderIndex,
            videoType: video.videoType,
            durationSeconds: video.durationSeconds,
            isPreview: video.isPreview,
            transcript: video.transcript
          };
        }) || []
      })) || [],
      isFree: topic.isFree ?? true,
      price: String(topic.price || '0'),
      tags: topic.tags || [],
      status: topic.status || 'draft',
      targetAudience: topic.targetAudience || [],
      prerequisites: topic.prerequisites || '',
      thumbnail: topic.thumbnail || '',
      metaTitle: topic.metaTitle || topic.title || '',
      metaDescription: topic.metaDescription || '',
      featured: topic.featured ?? false
    };

    console.log('✅ Converted form data:', convertedData);
    console.log('📊 Converted modules with videos:', convertedData.modules);
    
    return convertedData;
  };

  // Fetch topic data and populate form
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setInitialLoading(true);
        const result = await apiService.get<any>(API_ENDPOINTS.TOPICS.BY_ID(topicId));
        
        if (result.success && result.data) {
          const convertedData = convertTopicToFormData(result.data);
          setFormData(convertedData);
          
          // Auto-expand modules that have videos for better visibility
          const modulesWithVideos = convertedData.modules
            .filter(module => module.videos.length > 0)
            .map(module => module.id);
          
          if (modulesWithVideos.length > 0) {
            setExpandedModules(modulesWithVideos);
            console.log('📂 Auto-expanding modules with videos:', modulesWithVideos);
          }
          
          // Store category and subcategory names for immediate display
          if (result.data.categoryName) {
            setCategoryName(result.data.categoryName);
          }
          if (result.data.subcategoryName) {
            setSubcategoryName(result.data.subcategoryName);
          }
          
          // Keep all modules collapsed by default
          setExpandedModules([]);
        } else {
          setError('Failed to load topic data');
          toast.error('Failed to load topic data');
        }
      } catch (error) {
        console.error('Error fetching topic:', error);
        setError('Failed to load topic data');
        toast.error('Failed to load topic data');
      } finally {
        setInitialLoading(false);
      }
    };

    if (topicId) {
      fetchTopic();
    }
  }, [topicId]);

  // Load categories on component mount
  useEffect(() => {
    const loadCategories = async () => {
      console.log('🚀 Loading categories on component mount (edit page)...');
      try {
        const categoriesData = await fetchCategories();
        console.log('📦 Setting categories state:', categoriesData);
        setCategories(categoriesData);
      } catch (error) {
        console.error('💥 Failed to load categories:', error);
        toast.error('Failed to load categories');
      }
    };
    
    loadCategories();
  }, []);

  // Load subcategories when category changes
  useEffect(() => {
    const loadSubcategories = async () => {
      if (formData?.category) {
        try {
          const subcategoriesData = await fetchSubcategories(formData.category);
          setAvailableSubcategories(subcategoriesData);
          
          // Reset subcategory if current one doesn't exist in new category
          const currentSubcategoryExists = subcategoriesData.some(
            (sub: any) => String(sub.id) === String(formData.subcategory)
          );
          if (!currentSubcategoryExists && formData.subcategory) {
            setFormData((prev: LocalTopicFormData | null) => 
              prev ? { ...prev, subcategory: '' } : prev
            );
          }
        } catch (error) {
          console.error('Failed to load subcategories:', error);
          setAvailableSubcategories([]);
        }
      } else {
        setAvailableSubcategories([]);
      }
    };

    if (formData) {
      loadSubcategories();
    }
  }, [formData?.category]);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    console.log('🔤 Title change requested:', title);
    setFormData((prev: LocalTopicFormData | null) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        title,
        slug: generateSlug(title),
        metaTitle: title
      };
      console.log('📝 Updated form data after title change:', updated);
      return updated;
    });
  };

  const handleCategoryChange = (categoryId: string) => {
    console.log('🏷️ Category change requested:', categoryId);
    setFormData((prev: LocalTopicFormData | null) => {
      if (!prev) return prev;
      const updated = {
        ...prev,
        category: categoryId,
        subcategory: '' // Reset subcategory when category changes
      };
      console.log('📝 Updated form data after category change:', updated);
      return updated;
    });
  };

  // Module Management
  const addModule = () => {
    if (!formData) return;
    
    const newModule: LocalModule = {
      id: `new-${Date.now()}`,
      title: '',
      description: '',
      order: formData.modules.length + 1,
      videos: []
    };
    
    console.log('➕ Adding new module:', newModule);
    
    setFormData((prev: LocalTopicFormData | null) =>
      prev ? {
        ...prev,
        modules: [...prev.modules, newModule]
      } : prev
    );
    
    // Auto-expand the new module
    setExpandedModules(prev => [...prev, newModule.id]);
    console.log('✅ Module added successfully. Total modules:', formData.modules.length + 1);
  };

  const toggleModuleExpansion = (moduleId: string | number) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const updateModule = (moduleIndex: number, field: keyof LocalModule, value: any) => {
    console.log(`🔄 Updating module ${moduleIndex}, field: ${field}, value:`, value);
    
    setFormData((prev: LocalTopicFormData | null) => {
      if (!prev) return prev;
      
      const updatedModules = prev.modules.map((module: LocalModule, index: number) => 
        index === moduleIndex ? { ...module, [field]: value } : module
      );
      
      console.log('📊 Updated modules array:', updatedModules);
      
      return {
        ...prev,
        modules: updatedModules
      };
    });
  };

  const removeModule = (moduleIndex: number) => {
    console.log('🗑️ Removing module at index:', moduleIndex);
    
    setFormData((prev: LocalTopicFormData | null) => {
      if (!prev) return prev;
      
      const filteredModules = prev.modules.filter((_: LocalModule, index: number) => index !== moduleIndex);
      console.log('📊 Modules after removal:', filteredModules);
      
      return {
        ...prev,
        modules: filteredModules
      };
    });
  };

  // Video Management
  const addVideo = (moduleIndex: number) => {
    if (!formData) return;
    
    const newVideo: LocalVideo = {
      id: `new-${Date.now()}`,
      title: '',
      description: '',
      duration: '',
      videoFile: null,
      videoUrl: '',
      thumbnail: '',
      order: formData.modules[moduleIndex].videos.length + 1
    };
    
    setFormData((prev: LocalTopicFormData | null) =>
      prev ? {
        ...prev,
        modules: prev.modules.map((module: LocalModule, index: number) => 
          index === moduleIndex 
            ? { ...module, videos: [...module.videos, newVideo] }
            : module
        )
      } : prev
    );
  };

  const updateVideo = (moduleIndex: number, videoIndex: number, field: keyof LocalVideo, value: any) => {
    setFormData((prev: LocalTopicFormData | null) =>
      prev ? {
        ...prev,
        modules: prev.modules.map((module: LocalModule, mIndex: number) => 
          mIndex === moduleIndex
            ? {
                ...module,
                videos: module.videos.map((video: LocalVideo, vIndex: number) => 
                  vIndex === videoIndex ? { ...video, [field]: value } : video
                )
              }
            : module
        )
      } : prev
    );
  };

  // Bulk Video Management
  const addMultipleVideos = (moduleIndex: number, count: number) => {
    if (!formData) return;
    
    const newVideos: LocalVideo[] = [];
    const currentVideoCount = formData.modules[moduleIndex].videos.length;
    
    for (let i = 0; i < count; i++) {
      newVideos.push({
        id: `new-${Date.now()}-${i}`,
        title: '',
        description: '',
        duration: '',
        videoFile: null,
        videoUrl: '',
        thumbnail: '',
        order: currentVideoCount + i + 1
      });
    }
    
    setFormData((prev: LocalTopicFormData | null) =>
      prev ? {
        ...prev,
        modules: prev.modules.map((module: LocalModule, index: number) => 
          index === moduleIndex 
            ? { ...module, videos: [...module.videos, ...newVideos] }
            : module
        )
      } : prev
    );
  };

  // Bulk File Upload
  const handleBulkVideoUpload = async (moduleIndex: number, files: FileList) => {
    if (!formData) return;

    const videoFiles = Array.from(files).filter(file => file.type.startsWith('video/'));
    
    if (videoFiles.length === 0) {
      toast.error('Please select valid video files');
      return;
    }

    // Check file sizes
    const oversizedFiles = videoFiles.filter(file => file.size > 100 * 1024 * 1024);
    if (oversizedFiles.length > 0) {
      toast.error(`${oversizedFiles.length} file(s) exceed the 100MB limit`);
      return;
    }

    // Create new video entries for each file
    const newVideos: LocalVideo[] = [];
    const currentVideoCount = formData.modules[moduleIndex].videos.length;
    
    videoFiles.forEach((file, index) => {
      newVideos.push({
        id: `new-${Date.now()}-${index}`,
        title: file.name.replace(/\.[^/.]+$/, ""), // Remove extension
        description: '',
        duration: '',
        videoFile: file,
        videoUrl: URL.createObjectURL(file), // Create preview URL
        thumbnail: '',
        order: currentVideoCount + index + 1
      });
    });
    
    setFormData((prev: LocalTopicFormData | null) =>
      prev ? {
        ...prev,
        modules: prev.modules.map((module: LocalModule, index: number) => 
          index === moduleIndex 
            ? { ...module, videos: [...module.videos, ...newVideos] }
            : module
        )
      } : prev
    );

    toast.success(`Added ${videoFiles.length} video(s) successfully! Save the topic to upload them.`);
  };

  // Quick Video Upload from Modal
  const handleQuickVideoUpload = (videos: any[]) => {
    if (!formData) return;

    // If no modules exist, create a first module
    if (formData.modules.length === 0) {
      const newModule: LocalModule = {
        id: `new-${Date.now()}`,
        title: 'Module 1',
        description: 'Auto-created module for uploaded videos',
        order: 1,
        videos: []
      };
      
      setFormData((prev: LocalTopicFormData | null) =>
        prev ? {
          ...prev,
          modules: [newModule]
        } : prev
      );
    }

    // Add videos to the first module (or user can move them later)
    const targetModuleIndex = 0;
    const currentVideoCount = formData.modules[targetModuleIndex]?.videos.length || 0;

    const newVideos: LocalVideo[] = videos.map((video, index) => ({
      id: video.id || `quick-${Date.now()}-${index}`,
      title: video.name || `Video ${currentVideoCount + index + 1}`,
      description: '',
      duration: '',
      videoFile: video.file || null,
      videoUrl: video.url || (video.file ? URL.createObjectURL(video.file) : ''),
      thumbnail: video.thumbnail || '',
      order: currentVideoCount + index + 1
    }));

    setFormData((prev: LocalTopicFormData | null) => {
      if (!prev) return prev;
      
      const updatedModules = [...prev.modules];
      if (updatedModules[targetModuleIndex]) {
        updatedModules[targetModuleIndex] = {
          ...updatedModules[targetModuleIndex],
          videos: [...updatedModules[targetModuleIndex].videos, ...newVideos]
        };
      }
      
      return {
        ...prev,
        modules: updatedModules
      };
    });

    // Auto-expand the target module to show videos
    if (formData.modules[targetModuleIndex]) {
      setExpandedModules(prev => {
        const moduleId = formData.modules[targetModuleIndex].id;
        return prev.includes(moduleId) ? prev : [...prev, moduleId];
      });
    }

    toast.success(`Added ${videos.length} video(s) to ${formData.modules[targetModuleIndex]?.title || 'Module 1'}`);
  };

  // Handle video upload to specific module
  const handleModuleVideoUpload = (moduleIndex: number, videos: any[]) => {
    if (!formData) {
      toast.error('No topic data available');
      return;
    }

    if (!formData.modules[moduleIndex]) {
      toast.error('Module not found');
      return;
    }

    if (videos.length === 0) {
      toast.error('No videos to add');
      return;
    }

    try {
      const currentVideoCount = formData.modules[moduleIndex]?.videos.length || 0;

      const newVideos: LocalVideo[] = videos.map((video, index) => ({
        id: video.id || `module-${moduleIndex}-${Date.now()}-${index}`,
        title: video.name || `Video ${currentVideoCount + index + 1}`,
        description: '',
        duration: '',
        videoFile: video.file || null,
        videoUrl: video.url || (video.file ? URL.createObjectURL(video.file) : ''),
        thumbnail: video.thumbnail || '',
        order: currentVideoCount + index + 1
      }));

      setFormData((prev: LocalTopicFormData | null) => {
        if (!prev) return prev;
        
        const updatedModules = [...prev.modules];
        if (updatedModules[moduleIndex]) {
          updatedModules[moduleIndex] = {
            ...updatedModules[moduleIndex],
            videos: [...updatedModules[moduleIndex].videos, ...newVideos]
          };
        }
        
        return {
          ...prev,
          modules: updatedModules
        };
      });

      // Auto-expand the module to show videos
      const moduleId = formData.modules[moduleIndex].id;
      setExpandedModules(prev => {
        return prev.includes(moduleId) ? prev : [...prev, moduleId];
      });

      toast.success(`Added ${videos.length} video(s) to ${formData.modules[moduleIndex]?.title || `Module ${moduleIndex + 1}`}`);
    } catch (error) {
      console.error('Error adding videos to module:', error);
      toast.error('Failed to add videos to module');
    }
  };

  const removeVideo = (moduleIndex: number, videoIndex: number) => {
    setFormData((prev: LocalTopicFormData | null) =>
      prev ? {
        ...prev,
        modules: prev.modules.map((module: LocalModule, mIndex: number) => 
          mIndex === moduleIndex
            ? { ...module, videos: module.videos.filter((_: LocalVideo, vIndex: number) => vIndex !== videoIndex) }
            : module
        )
      } : prev
    );
  };

  const handleVideoFileUpload = async (moduleIndex: number, videoIndex: number, file: File) => {
    try {
      // Update local state immediately for UI feedback
      updateVideo(moduleIndex, videoIndex, 'videoFile', file);
      updateVideo(moduleIndex, videoIndex, 'title', file.name.replace(/\.[^/.]+$/, ""));
      
      // Create preview URL for immediate feedback
      const previewUrl = URL.createObjectURL(file);
      updateVideo(moduleIndex, videoIndex, 'videoUrl', previewUrl);
      
      toast.info('Video file ready for upload. Save the topic to finalize.');
      
      // If the module and topic exist on the server, upload immediately
      const module = formData?.modules[moduleIndex];
      if (module && !String(module.id).startsWith('new-') && topicId) {
        toast.info('Uploading video...');
        
        const formDataForUpload = new FormData();
        formDataForUpload.append('video', file);
        formDataForUpload.append('title', file.name.replace(/\.[^/.]+$/, ""));
        formDataForUpload.append('description', '');
        formDataForUpload.append('duration', '0'); // Will be calculated by server
        formDataForUpload.append('order', String(formData.modules[moduleIndex].videos[videoIndex].order));
        
        try {
          const result = await apiService.post(
            API_ENDPOINTS.TOPICS.VIDEOS.UPLOAD(topicId, String(module.id)),
            formDataForUpload,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );
          
          if (result.success) {
            updateVideo(moduleIndex, videoIndex, 'videoUrl', result.data.videoUrl);
            updateVideo(moduleIndex, videoIndex, 'thumbnail', result.data.thumbnailUrl);
            updateVideo(moduleIndex, videoIndex, 'id', result.data.id);
            toast.success('Video uploaded successfully!');
          } else {
            toast.error(result.error || 'Failed to upload video');
          }
        } catch (uploadError) {
          console.error('Video upload error:', uploadError);
          toast.error('Upload failed. Video will be uploaded when you save the topic.');
        }
      }
      
    } catch (error) {
      console.error('Error handling video file:', error);
      toast.error('Failed to process video file');
    }
  };

  // Tag Management
  const addTag = () => {
    if (!formData || !newTag.trim() || formData.tags.includes(newTag.trim())) return;
    
    setFormData((prev: LocalTopicFormData | null) =>
      prev ? { ...prev, tags: [...prev.tags, newTag.trim()] } : prev
    );
    setNewTag('');
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: LocalTopicFormData | null) =>
      prev ? { 
        ...prev, 
        tags: prev.tags.filter((tag: string) => tag !== tagToRemove) 
      } : prev
    );
  };

  const toggleAudience = (audience: string) => {
    setFormData((prev: LocalTopicFormData | null) =>
      prev ? {
        ...prev,
        targetAudience: prev.targetAudience.includes(audience)
          ? prev.targetAudience.filter((aud: string) => aud !== audience)
          : [...prev.targetAudience, audience]
      } : prev
    );
  };

  const nextStep = () => {
    if (currentStep < STEPS.length) {
      setCurrentStep(currentStep + 1);
    }
  };

  const prevStep = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleUpdate = async (status?: 'draft' | 'published') => {
    if (!formData) return;
    
    setIsLoading(true);
    console.log('💾 Starting topic update process...');
    console.log('📋 Topic ID:', topicId);
    console.log('📋 Update status:', status);
    console.log('📋 Current form data before update:', JSON.stringify(formData, null, 2));
    
    try {
      // Validate difficulty is set
      if (!formData.difficulty) {
        console.error('❌ Difficulty validation failed');
        toast.error('Please select a difficulty level');
        setIsLoading(false);
        return;
      }

      // First, upload any video files that haven't been uploaded yet
      console.log('🎬 Uploading video files...');
      console.log('🎬 Modules to process:', formData.modules.map(m => ({
        id: m.id,
        title: m.title,
        videosCount: m.videos.length,
        videosToUpload: m.videos.filter(v => v.videoFile && !v.uploadedUrl).length,
        urlBasedVideos: m.videos.filter(v => !v.videoFile && v.videoUrl && !v.videoUrl.startsWith('blob:')).length,
        allVideos: m.videos.map(v => ({
          id: v.id,
          title: v.title,
          hasFile: !!v.videoFile,
          videoUrl: v.videoUrl,
          uploadedUrl: v.uploadedUrl
        }))
      })));
      
      const updatedModules = await Promise.all(
        formData.modules.map(async (module, moduleIndex) => {
          if (module.videos.length === 0) {
            return module;
          }

          // Separate videos that need upload vs already uploaded vs URL-based videos
          const videosToUpload = module.videos.filter(video => video.videoFile && !video.uploadedUrl);
          const urlBasedVideos = module.videos.filter(video => 
            !video.videoFile && 
            video.videoUrl && 
            !video.videoUrl.startsWith('blob:') && 
            !video.uploadedUrl &&
            (video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be') || video.videoUrl.startsWith('http'))
          );
          const alreadyUploadedVideos = module.videos.filter(video => 
            (!video.videoFile || video.uploadedUrl) && 
            !(video.videoUrl && !video.videoUrl.startsWith('blob:') && !video.uploadedUrl)
          );

          console.log(`🔍 Module "${module.title}" video classification:`, {
            totalVideos: module.videos.length,
            videosToUpload: videosToUpload.length,
            urlBasedVideos: urlBasedVideos.length,
            alreadyUploadedVideos: alreadyUploadedVideos.length,
            videoDetails: module.videos.map(v => ({
              id: v.id,
              title: v.title,
              hasFile: !!v.videoFile,
              videoUrl: v.videoUrl,
              uploadedUrl: v.uploadedUrl,
              isUrlBased: !v.videoFile && v.videoUrl && !v.videoUrl.startsWith('blob:') && !v.uploadedUrl
            }))
          });

          if (videosToUpload.length === 0 && urlBasedVideos.length === 0) {
            // No videos to upload or create, just clean the existing ones
            return {
              ...module,
              videos: module.videos.map(video => ({
                ...video,
                videoFile: undefined, // Remove File object for API
              })),
            };
          }

          // Check file sizes before upload
          const MAX_FILE_SIZE = 500 * 1024 * 1024; // 500MB per file
          const oversizedVideos = videosToUpload.filter(video => 
            video.videoFile && video.videoFile.size > MAX_FILE_SIZE
          );
          
          if (oversizedVideos.length > 0) {
            console.error(`❌ Oversized videos in module ${module.title}:`, oversizedVideos.map(v => ({
              title: v.title,
              size: v.videoFile ? `${(v.videoFile.size / 1024 / 1024).toFixed(2)}MB` : 'Unknown'
            })));
            toast.error(`Some videos in ${module.title} exceed the 500MB limit. Please compress them first.`);
            return {
              ...module,
              videos: module.videos.map(video => ({
                ...video,
                videoFile: undefined, // Remove File object for API
              })),
            };
          }

          // Skip upload for new modules (they need to be created first)
          if (String(module.id).startsWith('new-')) {
            console.log(`⏭️ Skipping video upload for new module: ${module.title} (will be handled after module creation)`);
            return {
              ...module,
              videos: module.videos.map(video => ({
                ...video,
                videoFile: undefined, // Remove File object for API
              })),
            };
          }

          // Validate module ID and topic ID
          if (!module.id || !topicId) {
            console.error(`❌ Invalid IDs - Module ID: ${module.id}, Topic ID: ${topicId}`);
            toast.error(`Cannot upload videos: Invalid module or topic ID`);
            return {
              ...module,
              videos: module.videos.map(video => ({
                ...video,
                videoFile: undefined, // Remove File object for API
              })),
            };
          }

          try {
            let uploadedVideos: LocalVideo[] = [];
            let finalVideos: LocalVideo[] = [];

            // Handle file uploads first (if any)
            if (videosToUpload.length > 0) {
              console.log(`📤 Uploading ${videosToUpload.length} videos for module: ${module.title}`);
              console.log(`📤 Module ID: ${module.id}, Topic ID: ${topicId}`);
              console.log(`📤 Upload endpoint: ${API_ENDPOINTS.TOPICS.VIDEOS.UPLOAD_MULTIPLE(topicId, module.id)}`);
              
              // Use multiple upload endpoint for efficiency
              const formDataPayload = new FormData();
              
              // Add all video files and metadata according to API spec
              videosToUpload.forEach((video, index) => {
                if (video.videoFile) {
                  formDataPayload.append('videos', video.videoFile);
                  formDataPayload.append('titles[]', video.title);
                  formDataPayload.append('descriptions[]', video.description || '');
                  formDataPayload.append('durations[]', video.duration || '0');
                  formDataPayload.append('orders[]', video.order.toString());
                }
              });
              
              console.log('📤 FormData payload for upload:', {
                videosCount: videosToUpload.length,
                titles: videosToUpload.map(v => v.title),
                descriptions: videosToUpload.map(v => v.description || ''),
                durations: videosToUpload.map(v => v.duration || '0'),
                orders: videosToUpload.map(v => v.order.toString()),
                fileSizes: videosToUpload.map(v => v.videoFile ? `${(v.videoFile.size / 1024 / 1024).toFixed(2)}MB` : 'Unknown')
              });
              
              // Show upload start notification
              toast.info(`Starting upload of ${videosToUpload.length} video(s) for ${module.title}...`);
              
              let uploadResult: any = null;
              let retryCount = 0;
              const maxRetries = 2;
              
              while (retryCount <= maxRetries) {
                try {
                  uploadResult = await apiService.post<any>(
                    API_ENDPOINTS.TOPICS.VIDEOS.UPLOAD_MULTIPLE(topicId, module.id),
                    formDataPayload,
                    {
                      headers: {
                        'Content-Type': 'multipart/form-data',
                      },
                    }
                  );
                  break; // Success, exit retry loop
                } catch (uploadError) {
                  retryCount++;
                  console.log(`📤 Upload attempt ${retryCount} failed for module: ${module.title}`, uploadError);
                  
                  if (retryCount <= maxRetries && 
                      uploadError instanceof Error && 
                      (uploadError.message.includes('timeout') || uploadError.message.includes('network'))) {
                    console.log(`🔄 Retrying upload for module: ${module.title} (attempt ${retryCount + 1}/${maxRetries + 1})`);
                    toast.info(`Upload failed, retrying... (${retryCount}/${maxRetries})`);
                    // Wait a bit before retry
                    await new Promise(resolve => setTimeout(resolve, 2000));
                  } else {
                    throw uploadError; // Re-throw if not retryable or max retries reached
                  }
                }
              }
              
              // Check if upload was successful after all retries
              if (!uploadResult) {
                toast.error("Failed to upload videos after multiple attempts. Please try again.");
                setIsLoading(false);
                return;
              }
              
              console.log('📥 Upload API response:', uploadResult);

              if (uploadResult.success && uploadResult.data) {
                console.log(`✅ ${videosToUpload.length} videos uploaded successfully for module: ${module.title}`);
                console.log('📤 Upload result data:', uploadResult.data);
                console.log('📤 Upload result full response:', uploadResult);
                
                // Handle different response formats - be more flexible
                let uploadedVideoData;
                
                if (Array.isArray(uploadResult.data)) {
                  uploadedVideoData = uploadResult.data;
                } else if (uploadResult.data && Array.isArray(uploadResult.data.uploaded)) {
                  uploadedVideoData = uploadResult.data.uploaded;
                } else if (uploadResult.data && Array.isArray(uploadResult.data.videos)) {
                  uploadedVideoData = uploadResult.data.videos;
                } else if (uploadResult.data && typeof uploadResult.data === 'object') {
                  // Single video upload response or other format
                  uploadedVideoData = [uploadResult.data];
                } else {
                  console.warn('⚠️ Unexpected upload response format:', uploadResult.data);
                  uploadedVideoData = [];
                }
                
                console.log('📤 Processed upload data:', uploadedVideoData);
                console.log('📤 Upload data length:', uploadedVideoData.length);
                console.log('📤 Videos to upload length:', videosToUpload.length);
                
                // Map uploaded results back to videos
                uploadedVideos = videosToUpload.map((video, index) => {
                  const uploadedData = uploadedVideoData[index];
                  console.log(`🎬 Mapping uploaded video ${index}:`, {
                    originalVideo: {
                      id: video.id,
                      title: video.title,
                      order: video.order
                    },
                    uploadedData: uploadedData,
                    hasUploadedData: !!uploadedData
                  });
                  
                  if (uploadedData) {
                    return {
                      ...video,
                      id: uploadedData.id || uploadedData.videoId || video.id,
                      videoUrl: uploadedData.videoUrl || uploadedData.url || uploadedData.video_url,
                      uploadedUrl: uploadedData.videoUrl || uploadedData.url || uploadedData.video_url,
                      thumbnail: uploadedData.thumbnailUrl || uploadedData.thumbnail || uploadedData.thumbnail_url || video.thumbnail,
                      thumbnailUrl: uploadedData.thumbnailUrl || uploadedData.thumbnail || uploadedData.thumbnail_url,
                      durationSeconds: uploadedData.durationSeconds || uploadedData.duration_seconds || video.durationSeconds,
                      videoFile: null, // Remove file after upload
                    };
                  } else {
                    console.warn(`⚠️ No upload data for video ${index}, keeping original`);
                    return {
                      ...video,
                      videoFile: null, // Remove file object but keep video
                    };
                  }
                });
              } else {
                console.error(`❌ Failed to upload videos for module: ${module.title}`, uploadResult);
                toast.error(`Failed to upload videos for module: ${module.title}. ${uploadResult.error || 'Unknown error'}`);
                
                // Keep the videos in the form but remove the File objects
                uploadedVideos = videosToUpload.map(video => ({
                  ...video,
                  videoFile: null, // Remove File object for API
                }));
              }
            }

            // Clean already uploaded videos (remove File objects)
            const cleanedAlreadyUploaded = alreadyUploadedVideos.map(video => ({
              ...video,
              videoFile: null
            }));

            // Start with uploaded file videos and already uploaded videos
            finalVideos = [...cleanedAlreadyUploaded, ...uploadedVideos];

            // Handle URL-based videos (like YouTube links) separately
            if (urlBasedVideos.length > 0) {
              console.log(`🔗 Creating ${urlBasedVideos.length} URL-based videos for module: ${module.title}`);
              console.log(`🔗 URL-based videos to create:`, urlBasedVideos.map(v => ({
                id: v.id,
                title: v.title,
                videoUrl: v.videoUrl,
                order: v.order
              })));
              
              for (const urlVideo of urlBasedVideos) {
                try {
                  const videoPayload = {
                    title: urlVideo.title,
                    description: urlVideo.description || '',
                    duration: urlVideo.duration || '0',
                    videoUrl: urlVideo.videoUrl,
                    order: urlVideo.order,
                    videoType: urlVideo.videoUrl.includes('youtube') ? 'youtube' : 'external',
                    isPreview: urlVideo.isPreview || false,
                    transcript: urlVideo.transcript || ''
                  };
                  
                  console.log(`🔗 Creating URL-based video "${urlVideo.title}":`, videoPayload);
                  console.log(`🔗 API endpoint:`, API_ENDPOINTS.TOPICS.VIDEOS.CREATE(topicId, module.id));
                  
                  const createResult = await apiService.post<any>(
                    API_ENDPOINTS.TOPICS.VIDEOS.CREATE(topicId, module.id),
                    videoPayload
                  );
                  
                  console.log(`🔗 Create result for "${urlVideo.title}":`, createResult);
                  
                  if (createResult.success && createResult.data) {
                    console.log(`✅ URL-based video "${urlVideo.title}" created successfully:`, createResult.data);
                    
                    // Add the created video to final videos
                    finalVideos.push({
                      ...urlVideo,
                      id: createResult.data.id || createResult.data.videoId,
                      videoUrl: createResult.data.videoUrl || urlVideo.videoUrl,
                      uploadedUrl: createResult.data.videoUrl || urlVideo.videoUrl,
                      thumbnail: createResult.data.thumbnailUrl || createResult.data.thumbnail,
                      thumbnailUrl: createResult.data.thumbnailUrl || createResult.data.thumbnail,
                      videoFile: null
                    });
                    
                    toast.success(`✅ Added YouTube video: ${urlVideo.title}`);
                  } else {
                    console.error(`❌ Failed to create URL-based video "${urlVideo.title}":`, createResult);
                    toast.error(`Failed to add video: ${urlVideo.title} - ${createResult.error || 'Unknown error'}`);
                    
                    // Keep the video in form but mark as not uploaded
                    finalVideos.push({
                      ...urlVideo,
                      videoFile: null
                    });
                  }
                } catch (urlError) {
                  console.error(`💥 Error creating URL-based video "${urlVideo.title}":`, urlError);
                  toast.error(`Failed to add video: ${urlVideo.title} - ${urlError instanceof Error ? urlError.message : 'Network error'}`);
                  
                  // Keep the video in form but mark as not uploaded
                  finalVideos.push({
                    ...urlVideo,
                    videoFile: null
                  });
                }
              }
            }

            console.log(`📊 Module "${module.title}" final videos:`, finalVideos);
            console.log(`📊 Module "${module.title}" final video count:`, finalVideos.length);
            console.log(`📊 Module "${module.title}" videos with URLs:`, finalVideos.filter(v => v.videoUrl && !v.videoUrl.startsWith('blob:')).length);
            
            return {
              ...module,
              videos: finalVideos,
            };
          } catch (error) {
            console.error(`💥 Error uploading videos for module: ${module.title}`, error);
            
            // Handle specific error types
            let errorMessage = `Error uploading videos for module: ${module.title}`;
            
            if (error instanceof Error) {
              console.error('💥 Error message:', error.message);
              console.error('💥 Error stack:', error.stack);
              
              if (error.message.includes('timed out') || error.message.includes('timeout')) {
                errorMessage = `Upload timed out for module: ${module.title}. Try uploading smaller files or fewer files at once.`;
              } else if (error.message.includes('network') || error.message.includes('fetch')) {
                errorMessage = `Network error uploading videos for module: ${module.title}. Check your connection and try again.`;
              } else {
                errorMessage = `${errorMessage}: ${error.message}`;
              }
            }
            
            // Check if it's an API error response
            if (error && typeof error === 'object' && 'response' in error) {
              console.error('💥 API error response:', (error as any).response);
            }
            
            toast.error(errorMessage);
            return {
              ...module,
              videos: module.videos.map(video => ({
                ...video,
                videoFile: undefined, // Remove File object for API
              })),
            };
          }
        })
      );

      console.log('🎬 Video upload process completed');
      console.log('🎬 Updated modules:', updatedModules.map(m => ({
        id: m.id,
        title: m.title,
        videosCount: m.videos.length,
        videos: m.videos.map(v => ({
          id: v.id,
          title: v.title,
          hasVideoUrl: !!v.videoUrl,
          hasUploadedUrl: !!v.uploadedUrl,
          videoUrl: v.videoUrl
        }))
      })));

      // Prepare update data with uploaded videos
      const updateData = { 
        ...formData, 
        status: status || formData.status,
        difficulty: formData.difficulty as 'beginner' | 'intermediate' | 'advanced' | 'expert',
        modules: updatedModules.map(module => {
          console.log(`🔄 Processing module "${module.title}" for update API:`, {
            id: module.id,
            videosCount: module.videos.length,
            videos: module.videos.map(v => ({
              id: v.id,
              title: v.title,
              videoUrl: v.videoUrl,
              uploadedUrl: v.uploadedUrl,
              isBlob: v.videoUrl?.startsWith('blob:')
            }))
          });
          
          return {
            ...module,
            videos: module.videos.map(video => {
              const finalVideo = {
                id: video.id,
                title: video.title,
                description: video.description || '',
                duration: video.duration,
                videoUrl: video.uploadedUrl || video.videoUrl,
                thumbnail: video.thumbnailUrl || video.thumbnail,
                order: video.order,
                orderIndex: video.orderIndex,
                videoType: video.videoType,
                durationSeconds: video.durationSeconds,
                isPreview: video.isPreview,
                transcript: video.transcript
              };
              
              console.log(`🔄 Final video for API:`, {
                id: finalVideo.id,
                title: finalVideo.title,
                videoUrl: finalVideo.videoUrl,
                uploadedUrl: video.uploadedUrl,
                originalVideoUrl: video.videoUrl,
                isBlob: finalVideo.videoUrl?.startsWith('blob:'),
                hasValidUrl: !!finalVideo.videoUrl && !finalVideo.videoUrl.startsWith('blob:')
              });
              
              // CRITICAL FIX: Don't send videos with blob URLs or no URLs
              if (!finalVideo.videoUrl || finalVideo.videoUrl.startsWith('blob:')) {
                console.warn(`⚠️ Skipping video with invalid URL:`, finalVideo.title);
                return null;
              }
              
              return finalVideo;
            }).filter(video => video !== null) // Remove null videos
          };
        })
      };
      
      console.log('📤 Data being sent to API for update:');
      console.log('📤 Update data keys:', Object.keys(updateData));
      console.log('📤 Title:', updateData.title);
      console.log('📤 Category ID:', updateData.category);
      console.log('📤 Subcategory ID:', updateData.subcategory);
      console.log('📤 Difficulty:', updateData.difficulty);
      console.log('📤 Status:', updateData.status);
      console.log('📤 Modules count:', updateData.modules.length);
      console.log('📤 Modules with videos:', updateData.modules.map(m => ({
        id: m.id,
        title: m.title,
        videosCount: m.videos.length,
        videos: m.videos.map(v => ({
          id: v.id,
          title: v.title,
          videoUrl: v.videoUrl,
          hasVideoUrl: !!v.videoUrl
        }))
      })));
      console.log('📤 Full payload:', JSON.stringify(updateData, null, 2));
      
      // Validation
      if (!updateData.title || !updateData.category || !updateData.difficulty) {
        console.error('❌ Validation failed:', {
          title: updateData.title,
          category: updateData.category,
          difficulty: updateData.difficulty
        });
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Additional validation for published topics
      if (status === 'published') {
        if (!updateData.description || !updateData.learningObjectives) {
          console.error('❌ Published topic validation failed');
          toast.error('Description and learning objectives are required for published topics');
          setIsLoading(false);
          return;
        }
        
        // Modules are optional, but if they exist, they should have proper structure
        if (updateData.modules.length > 0) {
          // Check if modules have titles
          const modulesWithoutTitles = updateData.modules.filter(module => !module.title?.trim());
          if (modulesWithoutTitles.length > 0) {
            console.error('❌ Module validation failed - modules without titles:', modulesWithoutTitles);
            toast.error('All modules must have titles');
            setIsLoading(false);
            return;
          }
        }
      }

      console.log('✅ All validations passed, making API call...');

      // Call API to update topic
      console.log('🌐 Making PUT request to:', API_ENDPOINTS.TOPICS.UPDATE(topicId));
      
      const result = await apiService.put<any>(API_ENDPOINTS.TOPICS.UPDATE(topicId), updateData);
      console.log('📥 API Response:', JSON.stringify(result, null, 2));
      
      if (result.success) {
        console.log('✅ Topic update successful!');
        toast.success(`Topic ${status === 'published' ? 'published' : 'updated'} successfully!`);
        setLastSaved(new Date());
        
        // Refresh topic data to get updated videos from server
        console.log('🔄 Refreshing topic data after save...');
        try {
          const refreshResult = await apiService.get<any>(API_ENDPOINTS.TOPICS.BY_ID(topicId));
          if (refreshResult.success && refreshResult.data) {
            console.log('📥 Fresh topic data from server:', refreshResult.data);
            const refreshedData = convertTopicToFormData(refreshResult.data);
            console.log('📥 Converted refreshed data:', refreshedData);
            setFormData(refreshedData);
            console.log('✅ Topic data refreshed successfully');
          } else {
            console.warn('⚠️ Failed to get fresh topic data:', refreshResult);
          }
        } catch (refreshError) {
          console.warn('⚠️ Failed to refresh topic data:', refreshError);
        }
        
        // Optionally redirect back to topics list
        if (status === 'published') {
          console.log('🔄 Redirecting to topics list...');
        //  router.push('/dashboard/topics');
        }
      } else {
        console.error('❌ API returned error:', result);
        toast.error(result.error || 'Failed to update topic. Please try again.');
      }
    } catch (error) {
      console.error('💥 Error updating topic:', error);
      console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      toast.error('Failed to update topic. Please try again.');
    } finally {
      console.log('🏁 Topic update process completed');
      setIsLoading(false);
    }
  };

  if (initialLoading) {
    return (
      <PageContainer>
        <div className="flex items-center justify-center h-96">
          <div className="flex items-center space-x-2">
            <Loader2 className="h-6 w-6 animate-spin" />
            <span>Loading topic...</span>
          </div>
        </div>
      </PageContainer>
    );
  }

  if (error || !formData) {
    return (
      <PageContainer>
        <div className="text-center py-12">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Topic Not Found</h2>
          <p className="text-gray-600 mb-6">
            The topic you're looking for doesn't exist or couldn't be loaded.
          </p>
          <Link href="/dashboard/topics">
            <Button>
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Topics
            </Button>
          </Link>
        </div>
      </PageContainer>
    );
  }

  const renderStepContent = () => {
    if (!formData) return null;
    
    switch (currentStep) {
      case 1:
        return (
          <div className="max-full">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center gap-2">
                  <BookOpen className="h-5 w-5" />
                  Basic Information
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Title with Emoji - Compact */}
                <div className='space-y-2'>
                  <Label htmlFor='title'>Topic Title *</Label>
                  <div className="flex gap-2">
                    <Input 
                      id='emoji' 
                      className="w-14 text-center text-lg h-9"
                      placeholder='🔐'
                      value={formData.emoji}
                      onChange={(e) => setFormData(prev => prev ? { ...prev, emoji: e.target.value } : prev)}
                    />
                    <div className="flex-1 space-y-1">
                      <Input 
                        id='title' 
                        className={`h-9 ${!formData.title ? 'border-red-300 focus:border-red-500' : ''}`}
                        placeholder='e.g., What is Basic Cybersecurity?'
                        value={formData.title}
                        onChange={(e) => handleTitleChange(e.target.value)}
                      />
                      {!formData.title && (
                        <p className="text-xs text-red-500">Title is required</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Category Row - Compact */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='category'>Category *</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.category}
                        onValueChange={(value) => handleCategoryChange(value)}
                      >
                        <SelectTrigger className={`h-9 ${!formData.category ? 'border-red-300' : ''}`}>
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.emoji && <span className="mr-2">{category.emoji}</span>}
                              {category.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={refreshCategories}
                        disabled={loadingCategories}
                        className="h-9 px-2"
                      >
                        {loadingCategories ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                    {!formData.category && (
                      <p className="text-xs text-red-500">Category is required</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='subcategory'>Subcategory</Label>
                    <div className="flex gap-2">
                      <Select
                        value={formData.subcategory}
                        onValueChange={(value) => setFormData(prev => prev ? { ...prev, subcategory: value } : prev)}
                        disabled={!formData.category}
                      >
                        <SelectTrigger className="h-9">
                          <SelectValue placeholder="Select subcategory" />
                        </SelectTrigger>
                        <SelectContent>
                          {availableSubcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={String(subcategory.id)}>
                              {subcategory.emoji && <span className="mr-2">{subcategory.emoji}</span>}
                              {subcategory.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => formData.category && refreshSubcategories()}
                        disabled={loadingSubcategories || !formData.category}
                        className="h-9 px-2"
                      >
                        {loadingSubcategories ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                      </Button>
                    </div>
                  </div>
                </div>

                {/* Difficulty & Duration Row - Compact */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='difficulty'>Difficulty Level *</Label>
                    <Select
                      value={formData.difficulty}
                      onValueChange={(value) => setFormData(prev => prev ? { ...prev, difficulty: value as any } : prev)}
                    >
                      <SelectTrigger className={`h-9 ${!formData.difficulty ? 'border-red-300' : ''}`}>
                        <SelectValue placeholder="Select difficulty" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="beginner">🌱 Beginner</SelectItem>
                        <SelectItem value="intermediate">🚀 Intermediate</SelectItem>
                        <SelectItem value="advanced">⚡ Advanced</SelectItem>
                        <SelectItem value="expert">🎯 Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    {!formData.difficulty && (
                      <p className="text-xs text-red-500">Difficulty is required</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <Label htmlFor='duration'>Duration (hours)</Label>
                    <Input 
                      id='duration' 
                      type="number"
                      step="0.5"
                      min="0"
                      placeholder='e.g., 2.5'
                      value={formData.duration}
                      onChange={(e) => setFormData(prev => prev ? { ...prev, duration: e.target.value } : prev)}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Description - Always visible */}
                <div className='space-y-2'>
                  <Label htmlFor='description'>Description</Label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData(prev => prev ? { ...prev, description: value } : prev)}
                    placeholder="Brief topic description..."
                    className="min-h-[100px]"
                  />
                </div>

                {/* Accordion for Advanced Fields */}
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="learning-objectives">
                    <AccordionTrigger className="text-sm font-medium">
                      Learning Objectives
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className='space-y-2'>
                        <RichTextEditor
                          value={formData.learningObjectives}
                          onChange={(value) => setFormData(prev => prev ? { ...prev, learningObjectives: value } : prev)}
                          placeholder="Clear learning objectives with bullet points..."
                          className="min-h-[80px]"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="prerequisites">
                    <AccordionTrigger className="text-sm font-medium">
                      Prerequisites
                    </AccordionTrigger>
                    <AccordionContent>
                      <div className='space-y-2'>
                        <RichTextEditor
                          value={formData.prerequisites}
                          onChange={(value) => setFormData(prev => prev ? { ...prev, prerequisites: value } : prev)}
                          placeholder="Optional prerequisites..."
                          className="min-h-[60px]"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                </Accordion>

              </CardContent>
            </Card>
          </div>
        );

      case 2:
        return (
          <div className="max-full">
            <Card>
              <CardHeader className="pb-4">
                <CardTitle className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Video className="h-5 w-5" />
                    Course Modules ({formData.modules.length})
                  </div>
                  <Button 
                    onClick={addModule} 
                    variant="outline" 
                    size="sm"
                    className="border-dashed hover:border-primary hover:bg-primary/5"
                  >
                    <Plus className="h-4 w-4 mr-2" />
                    Add Module
                  </Button>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {formData.modules.length === 0 ? (
                  <div className="text-center py-12 bg-gradient-to-b from-gray-50 to-white rounded-lg border border-dashed border-gray-300">
                    <div className="w-16 h-16 mx-auto mb-4 bg-primary/10 rounded-full flex items-center justify-center">
                      <Video className="h-8 w-8 text-primary" />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Create Your First Module</h3>
                    <p className="text-gray-500 mb-6 max-w-md mx-auto">
                      Organize your content into modules. Each module can contain multiple videos, documents, and other learning materials.
                    </p>
                    <Button onClick={addModule} className="shadow-sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Create First Module
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {formData.modules.map((module, moduleIndex) => {
                      const isCompleteModule = module.title && module.description;
                      const isExpanded = expandedModules.includes(module.id);
                      const totalVideos = module.videos.length;
                      const completedVideos = module.videos.filter(v => v.title && (v.videoFile || v.videoUrl || v.uploadedUrl)).length;
                      
                      return (
                        <Collapsible
                          key={module.id}
                          open={isExpanded}
                          onOpenChange={() => toggleModuleExpansion(module.id)}
                        >
                          <Card className={`border-2 transition-all py-1 ${
                            isCompleteModule 
                              ? 'border-green-200 bg-green-50/30' 
                              : 'border-gray-200 hover:border-gray-300'
                          }`}>
                            <CollapsibleTrigger asChild>
                              <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors py-2 px-3 h-[50px] min-h-[50px]">
                                <div className="flex items-center justify-between h-full">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-6 h-6 rounded flex items-center justify-center text-xs font-semibold ${
                                      isCompleteModule 
                                        ? 'bg-green-100 text-green-700' 
                                        : 'bg-gray-100 text-gray-600'
                                    }`}>
                                      {module.order}
                                    </div>
                                    <div className="text-left">
                                      <h4 className="font-medium text-xs text-gray-900 leading-tight">
                                        {module.title || `Module ${module.order}`}
                                      </h4>
                                      <div className="flex items-center gap-2">
                                        <p className="text-xs text-gray-500">
                                          {totalVideos} video{totalVideos !== 1 ? 's' : ''}
                                        </p>
                                        {totalVideos > 0 && (
                                          <div className="flex items-center gap-1">
                                            <div className={`w-1.5 h-1.5 rounded-full ${
                                              completedVideos === totalVideos ? 'bg-green-500' : 'bg-yellow-500'
                                            }`}></div>
                                            <span className="text-xs text-gray-500">
                                              {completedVideos}/{totalVideos} ready
                                            </span>
                                          </div>
                                        )}
                                        {isCompleteModule && (
                                          <Badge variant="secondary" className="bg-green-100 text-green-700 text-xs px-1 py-0 h-4">
                                            Complete
                                          </Badge>
                                        )}
                                      </div>
                                    </div>
                                  </div>
                                  <div className="flex items-center gap-1">
                                    <Button 
                                      variant="ghost" 
                                      size="sm"
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        removeModule(moduleIndex);
                                      }}
                                      className="h-5 w-5 p-0 text-red-500 hover:text-red-700 hover:bg-red-50"
                                    >
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                    {isExpanded ? (
                                      <ChevronUp className="h-3 w-3 text-gray-400" />
                                    ) : (
                                      <ChevronDown className="h-3 w-3 text-gray-400" />
                                    )}
                                  </div>
                                </div>
                              </CardHeader>
                            </CollapsibleTrigger>
                            
                            <CollapsibleContent>
                              <CardContent className="pt-0 px-3 pb-3">
                                <div className="space-y-3">
                                  {/* Module Details - More Compact */}
                                  <div className="grid grid-cols-1 lg:grid-cols-5 gap-3">
                                    <div className="lg:col-span-4 space-y-1">
                                      <Label className="text-xs font-medium">Module Title *</Label>
                                      <Input 
                                        placeholder="e.g., Introduction to Cybersecurity Fundamentals"
                                        value={module.title}
                                        onChange={(e) => updateModule(moduleIndex, 'title', e.target.value)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                    
                                    <div className="space-y-1">
                                      <Label className="text-xs font-medium">Order</Label>
                                      <Input 
                                        type="number"
                                        min="1"
                                        value={module.order}
                                        onChange={(e) => updateModule(moduleIndex, 'order', parseInt(e.target.value) || 1)}
                                        className="h-8 text-sm"
                                      />
                                    </div>
                                  </div>

                                  <div className="space-y-1">
                                    <Label className="text-xs font-medium">Module Description</Label>
                                    <RichTextEditor
                                      value={module.description}
                                      onChange={(value) => updateModule(moduleIndex, 'description', value)}
                                      placeholder="Describe what students will learn in this module..."
                                      className="min-h-[60px] text-sm"
                                    />
                                  </div>

                                  {/* Videos Section - Simplified */}
                                  <div className="space-y-3 pt-2 border-t">
                                    <div className="flex items-center justify-between">
                                      <div className="flex items-center gap-2">
                                        <PlayCircle className="h-4 w-4 text-primary" />
                                        <h5 className="text-sm font-medium">Videos ({module.videos.length})</h5>
                                      </div>
                                      
                                      {/* Single Add Videos Button */}
                                      <VideoUploadModal
                                        trigger={
                                          <Button 
                                            variant="outline" 
                                            size="sm"
                                            className="h-7 px-3 text-xs bg-primary/5 hover:bg-primary/10 border-primary/20"
                                          >
                                            <Upload className="h-3 w-3 mr-1" />
                                            Add Videos
                                          </Button>
                                        }
                                        onVideoUpload={(videos) => handleModuleVideoUpload(moduleIndex, videos)}
                                        moduleId={String(module.id)}
                                      />
                                    </div>

                                    {module.videos.length === 0 ? (
                                      <div className="text-center py-2 bg-gray-50 rounded-lg border border-dashed border-gray-300">
                                        <PlayCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                        <h6 className="text-sm font-medium text-gray-900 mb-1">No videos yet</h6>
                                        <p className="text-gray-500 text-xs mb-3">Upload videos or add video links</p>
                                      </div>
                                    ) : (
                                      <div className="space-y-2">
                                        {/* Smaller video grid display */}
                                        <div className="grid grid-cols-3 sm:grid-cols-4 lg:grid-cols-6 xl:grid-cols-8 gap-2">
                                          {module.videos.map((video, videoIndex) => (
                                            <div key={video.id} className="group relative">
                                              <div className="aspect-video bg-gray-100 rounded border flex items-center justify-center relative overflow-hidden">
                                                {video.videoUrl ? (
                                                  <video 
                                                    src={video.videoUrl} 
                                                    className="w-full h-full object-cover"
                                                    muted
                                                    preload="metadata"
                                                  />
                                                ) : video.thumbnail ? (
                                                  <img 
                                                    src={video.thumbnail} 
                                                    alt={video.title}
                                                    className="w-full h-full object-cover"
                                                  />
                                                ) : (
                                                  <Video className="h-4 w-4 text-gray-400" />
                                                )}
                                                
                                                {/* Hover actions */}
                                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                                  <div className="flex gap-1">
                                                    <Button
                                                      size="sm"
                                                      variant="secondary"
                                                      className="h-5 w-5 p-0"
                                                      onClick={() => {
                                                        if (video.videoUrl) {
                                                          window.open(video.videoUrl, '_blank');
                                                        }
                                                      }}
                                                    >
                                                      <Eye className="h-2 w-2" />
                                                    </Button>
                                                    <Button
                                                      size="sm"
                                                      variant="destructive"
                                                      className="h-5 w-5 p-0"
                                                      onClick={() => removeVideo(moduleIndex, videoIndex)}
                                                    >
                                                      <X className="h-2 w-2" />
                                                    </Button>
                                                  </div>
                                                </div>
                                                
                                                {/* Video order */}
                                                <div className="absolute top-1 right-1 bg-black/70 text-white text-xs px-1 rounded">
                                                  {video.order || videoIndex + 1}
                                                </div>
                                              </div>
                                              
                                              {/* Video title - smaller */}
                                              <p className="text-xs text-gray-600 mt-1 truncate text-center">
                                                {video.title || `Video ${videoIndex + 1}`}
                                              </p>
                                            </div>
                                          ))}
                                        </div>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </CollapsibleContent>
                          </Card>
                        </Collapsible>
                      );
                    })}

                    {/* Add Module Button at Bottom */}
                    <div className="pt-4">
                      <Button 
                        onClick={addModule} 
                        variant="outline" 
                        className="w-full py-4 border-2 border-dashed hover:border-primary hover:bg-primary/5 transition-all"
                      >
                        <Plus className="h-5 w-5 mr-2" />
                        Add Another Module
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        );

      case 3:
        return (
          <div className="max-full">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5" />
                  Target Audience & Tags
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-6'>
                <div className='space-y-4'>
                  <Label>Target Audience</Label>
                  <div className='grid grid-cols-2 lg:grid-cols-4 gap-3'>
                    {TARGET_AUDIENCES.map((audience) => (
                      <div key={audience} className='flex items-center space-x-2 p-3 border rounded-lg'>
                        <input
                          type="checkbox"
                          id={audience}
                          checked={formData.targetAudience.includes(audience)}
                          onChange={() => toggleAudience(audience)}
                          className="rounded"
                        />
                        <Label htmlFor={audience} className='text-sm cursor-pointer flex-1'>{audience}</Label>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className='space-y-4'>
                  <Label>Tags</Label>
                  <div className='flex gap-2'>
                    <Input 
                      placeholder='Add tag (e.g., cybersecurity, passwords, 2FA)'
                      value={newTag}
                      onChange={(e) => setNewTag(e.target.value)}
                      onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
                      className="flex-1"
                    />
                    <Button type='button' onClick={addTag}>
                      <Plus className='h-4 w-4' />
                    </Button>
                  </div>
                  <div className='flex flex-wrap gap-2 mt-3'>
                    {formData.tags.map((tag, index) => (
                      <Badge key={index} variant='secondary' className='px-3 py-1'>
                        {tag}
                        <X 
                          className='ml-2 h-3 w-3 cursor-pointer hover:text-red-500' 
                          onClick={() => removeTag(tag)}
                        />
                      </Badge>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        );

      case 4:
        return (
          <div className="max-full">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Pricing
                  </CardTitle>
                </CardHeader>
                <CardContent className='space-y-4'>
                  <div className='flex items-center justify-between p-4 border rounded-lg'>
                    <div className="space-y-1">
                      <Label htmlFor='isFree' className='flex items-center gap-2 font-medium'>
                        🆓 Free Topic
                      </Label>
                      <p className="text-sm text-gray-500">Make this topic free for all users</p>
                    </div>
                    <Switch
                      id='isFree'
                      checked={formData.isFree}
                      onCheckedChange={(checked) => setFormData(prev => prev ? { 
                        ...prev, 
                        isFree: checked,
                        price: checked ? '0' : prev.price
                      } : prev)}
                    />
                  </div>
                  
                  {!formData.isFree && (
                    <div className='space-y-2'>
                      <Label htmlFor='price'>Price ($)</Label>
                      <Input 
                        id='price' 
                        type='number' 
                        step='0.01'
                        placeholder='29.99'
                        value={formData.price}
                        onChange={(e) => setFormData(prev => prev ? { ...prev, price: e.target.value } : prev)}
                      />
                    </div>
                  )}
                  
                  <div className='flex items-center justify-between p-4 border rounded-lg'>
                    <div className="space-y-1">
                      <Label htmlFor='featured' className="font-medium">⭐ Featured Topic</Label>
                      <p className="text-sm text-gray-500">Show on homepage</p>
                    </div>
                    <Switch
                      id='featured'
                      checked={formData.featured}
                      onCheckedChange={(checked) => setFormData(prev => prev ? { ...prev, featured: checked } : prev)}
                    />
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>SEO & Media</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className='space-y-2'>
                    <Label htmlFor='thumbnail'>Thumbnail Image URL</Label>
                    <Input 
                      id='thumbnail'
                      placeholder='https://example.com/thumbnail.jpg'
                      value={formData.thumbnail}
                      onChange={(e) => setFormData(prev => prev ? { ...prev, thumbnail: e.target.value } : prev)}
                    />
                  </div>
                  
                  <div className='space-y-2'>
                    <Label htmlFor='metaTitle'>Meta Title</Label>
                    <Input 
                      id='metaTitle'
                      placeholder='SEO title (auto-filled from topic title)'
                      value={formData.metaTitle}
                      onChange={(e) => setFormData(prev => prev ? { ...prev, metaTitle: e.target.value } : prev)}
                    />
                    <p className='text-xs text-muted-foreground'>
                      {formData.metaTitle.length}/60 characters
                    </p>
                  </div>
                  
                  <div className='space-y-2'>
                    <Label htmlFor='metaDescription'>Meta Description</Label>
                    <RichTextEditor
                      value={formData.metaDescription}
                      onChange={(value) => setFormData(prev => prev ? { ...prev, metaDescription: value } : prev)}
                      placeholder='Brief description for search engines with formatting:
• **Key benefits** of the topic
• *Important concepts* covered
• Target audience information'
                    />
                    <p className='text-xs text-muted-foreground'>
                      {formData.metaDescription.length}/160 characters
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <PageContainer>
      {isLoading && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center">
          <div className="bg-white rounded-lg p-6 flex items-center gap-4">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Updating topic...</span>
          </div>
        </div>
      )}
      <div className='space-y-6'>
        <Breadcrumbs />
        
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Edit Topic</h1>
            <div className="flex items-center gap-4">
              <p className='text-muted-foreground'>
                {formData?.title || 'Loading topic...'}
              </p>
              {lastSaved && (
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <div className="h-2 w-2 bg-green-500 rounded-full"></div>
                  <span>Last saved: {lastSaved.toLocaleTimeString()}</span>
                </div>
              )}
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <Switch
                id="auto-save"
                checked={autoSaveEnabled}
                onCheckedChange={setAutoSaveEnabled}
              />
              <Label htmlFor="auto-save" className="text-sm">Auto-save</Label>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                console.log('🐛 DEBUG: Current form data:', formData);
                console.log('🐛 DEBUG: Form data modules:', formData?.modules);
                if (formData?.modules) {
                  formData.modules.forEach((module, index) => {
                    console.log(`🐛 DEBUG: Module ${index} (${module.title}):`, {
                      id: module.id,
                      videosCount: module.videos.length,
                      videos: module.videos.map(v => ({
                        id: v.id,
                        title: v.title,
                        hasVideoUrl: !!v.videoUrl,
                        hasUploadedUrl: !!v.uploadedUrl,
                        videoUrl: v.videoUrl,
                        uploadedUrl: v.uploadedUrl
                      }))
                    });
                  });
                }
                toast.info(`Debug: ${formData?.modules?.length || 0} modules, Title: ${formData?.title || 'N/A'}`);
              }}
            >
              Debug State
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={async () => {
                if (!formData || !topicId) {
                  toast.error('No form data or topic ID');
                  return;
                }

                // Find first module with videos that have files
                const moduleWithVideos = formData.modules.find(m => 
                  m.videos.some(v => v.videoFile && !v.uploadedUrl)
                );

                if (!moduleWithVideos) {
                  toast.info('No modules with videos to upload found');
                  return;
                }

                if (String(moduleWithVideos.id).startsWith('new-')) {
                  toast.error('Cannot test upload on new module - save the topic first');
                  return;
                }

                console.log('🧪 Testing video upload for module:', moduleWithVideos.title);
                console.log('🧪 Module ID:', moduleWithVideos.id);
                console.log('🧪 Topic ID:', topicId);
                
                const videosToTest = moduleWithVideos.videos.filter(v => v.videoFile && !v.uploadedUrl);
                console.log('🧪 Videos to upload:', videosToTest.length);

                if (videosToTest.length === 0) {
                  toast.info('No videos with files to upload in this module');
                  return;
                }

                try {
                  const formDataPayload = new FormData();
                  
                  videosToTest.forEach((video, index) => {
                    if (video.videoFile) {
                      formDataPayload.append('videos', video.videoFile);
                      formDataPayload.append('titles[]', video.title);
                      formDataPayload.append('descriptions[]', video.description || '');
                      formDataPayload.append('durations[]', video.duration || '0');
                      formDataPayload.append('orders[]', video.order.toString());
                    }
                  });

                  console.log('🧪 Test upload endpoint:', API_ENDPOINTS.TOPICS.VIDEOS.UPLOAD_MULTIPLE(topicId, moduleWithVideos.id));
                  
                  const result = await apiService.post<any>(
                    API_ENDPOINTS.TOPICS.VIDEOS.UPLOAD_MULTIPLE(topicId, moduleWithVideos.id),
                    formDataPayload,
                    {
                      headers: {
                        'Content-Type': 'multipart/form-data',
                      },
                    }
                  );

                  console.log('🧪 Test upload result:', result);
                  
                  if (result.success) {
                    toast.success('Test upload successful! Check console for details.');
                  } else {
                    toast.error(`Test upload failed: ${result.error}`);
                  }
                } catch (error) {
                  console.error('🧪 Test upload error:', error);
                  toast.error('Test upload failed - check console');
                }
              }}
            >
              Test Upload
            </Button>
            <Link href="/dashboard/topics">
              <Button variant='outline'>
                <ArrowLeft className='mr-2 h-4 w-4' />
                Back to Topics
              </Button>
            </Link>
          </div>
        </div>

        {/* Progress Section */}
        <Card>
          <CardContent className="pt-0">
            <div className="space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Step {currentStep} of {STEPS.length}</span>
              </div> 
              {/* Step Indicators */}
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 overflow-x-auto">
                  {STEPS.map((step) => {
                    const Icon = step.icon;
                    return (
                      <div
                        key={step.id}
                        className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm cursor-pointer transition-colors whitespace-nowrap ${
                          currentStep === step.id
                            ? 'bg-primary text-primary-foreground'
                            : currentStep > step.id
                            ? 'bg-green-100 text-green-700'
                            : 'bg-gray-100 text-gray-500'
                        }`}
                        onClick={() => setCurrentStep(step.id)}
                      >
                        <Icon className="h-4 w-4" />
                        <span>{step.title}</span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Step Content */}
        {renderStepContent()}

        {/* Navigation & Action Buttons */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <Button
                variant="outline"
                onClick={prevStep}
                disabled={currentStep === 1}
                className="min-w-[120px]"
              >
                <ChevronLeft className="mr-2 h-4 w-4" />
                Previous
              </Button>
              
              <div className="text-center">
                <p className="text-sm text-muted-foreground">
                  {STEPS[currentStep - 1]?.description}
                </p>
              </div>
              
              <div className="flex gap-3">
                {currentStep === STEPS.length ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={() => handleUpdate('draft')}
                      disabled={isLoading}
                      className="min-w-[120px]"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {isLoading ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button
                      onClick={() => handleUpdate('published')}
                      disabled={isLoading || !formData?.title || !formData?.category}
                      className="min-w-[120px]"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? 'Publishing...' : 'Update & Publish'}
                    </Button>
                  </>
                ) : (
                  <Button
                    onClick={nextStep}
                    disabled={currentStep === STEPS.length}
                    className="min-w-[120px]"
                  >
                    Next
                    <ChevronRight className="ml-2 h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
