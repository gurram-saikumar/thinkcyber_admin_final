'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { VideoUpload } from '@/components/video-upload';
import { VideoUploadModal } from '@/components/video-upload-modal';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion';
import { 
  Save, 
  ArrowLeft, 
  Plus, 
  X, 
  Eye, 
  FileText, 
  Upload, 
  ChevronRight, 
  ChevronLeft, 
  Shield, 
  Users, 
  Target, 
  DollarSign, 
  Settings, 
  BookOpen,
  Video,
  PlayCircle,
  FileUp,
  Trash2,
  ChevronDown,
  ChevronUp,
  RefreshCw,
  Loader2
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { TopicFormData as ImportedTopicFormData, CreateTopicRequest, Video as ImportedVideo, Module as ImportedModule } from '@/types/topics';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

// Type for category data from API
interface CategoryData {
  id: number | string;
  name: string;
  description?: string;
  status?: string;
  emoji?: string;
}

// API functions - now using the external API service
const fetchCategories = async () => {
  console.log('🔍 Fetching categories...');
  try {
    const result = await apiService.get(API_ENDPOINTS.CATEGORIES.BASE, {
      params: { fetchAll: 'true' }
    });
    console.log('📊 Categories API result:', result);
    
    if (result.success && result.data) {
      const categories = result.data.filter((cat: any) => cat.status === 'Active');
      console.log('✅ Active categories loaded:', categories);
      return categories;
    } else {
      console.error('❌ Failed to fetch categories:', result.error);
      toast.error('Failed to load categories');
      return [];
    }
  } catch (error) {
    console.error('💥 Error fetching categories:', error);
    toast.error('Error loading categories');
    return [];
  }
};

const fetchSubcategories = async (categoryId: string) => {
  console.log('🔍 Fetching subcategories for category ID:', categoryId);
  try {
    const result = await apiService.get(API_ENDPOINTS.SUBCATEGORIES.BASE, {
      params: { categoryId, fetchAll: 'true' }
    });
    console.log('📊 Subcategories API result:', result);
    
    if (result.success && result.data) {
      const subcategories = result.data.filter((sub: any) => sub.status === 'Active');
      console.log('✅ Active subcategories loaded:', subcategories);
      return subcategories;
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
  id: string;
  title: string;
  description: string;
  duration: string;
  videoFile: File | null;
  videoUrl: string;
  uploadedUrl?: string;
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
  durationMinutes?: number;
  isActive?: boolean;
  videos: LocalVideo[];
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

const initialFormData: LocalTopicFormData = {
  title: '',
  slug: '',
  emoji: '🔐',
  category: '',
  subcategory: '',
  // language: 'english', // Removed
  difficulty: '',
  duration: '',
  description: '',
  learningObjectives: '',
  modules: [],
  isFree: true,
  price: '0',
  tags: [],
  status: 'draft',
  targetAudience: [],
  prerequisites: '',
  thumbnail: '',
  metaTitle: '',
  metaDescription: '',
  featured: false
};

const STEPS = [
  { id: 1, title: 'Basic Info', icon: BookOpen, description: 'Topic details and information' },
  { id: 2, title: 'Modules & Videos', icon: Video, description: 'Add modules with video content' },
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

export default function NewTopicPage() {
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState<LocalTopicFormData>(initialFormData);
  const [newTag, setNewTag] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [autoSaveEnabled, setAutoSaveEnabled] = useState(true);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  
  // Category and subcategory state
  const [categories, setCategories] = useState<CategoryData[]>([]);
  const [availableSubcategories, setAvailableSubcategories] = useState<any[]>([]);
  const [expandedModules, setExpandedModules] = useState<(string | number)[]>([]);
  const [loadingCategories, setLoadingCategories] = useState(false);
  const [loadingSubcategories, setLoadingSubcategories] = useState(false);

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
    if (!formData.category) {
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

  // Auto-save functionality
  const autoSave = async () => {
    if (!autoSaveEnabled || !formData.title) return;
    
    try {
      // Convert local form data to API format
      const apiModules: ImportedModule[] = formData.modules.map(module => ({
        ...module,
        id: String(module.id), // Convert to string for API compatibility
        videos: module.videos.map(video => ({
          ...video,
          videoFile: undefined, // Remove File object for API
        }))
      }));

      const draftData: CreateTopicRequest = { 
        ...formData, 
        status: 'draft',
        difficulty: formData.difficulty as 'beginner' | 'intermediate' | 'advanced' | 'expert' || 'beginner',
        modules: apiModules
      };
      
      // Only auto-save if we have a title
      if (draftData.title) {
        const result = await apiService.post(API_ENDPOINTS.TOPICS.CREATE, draftData);
        
        if (result.success) {
          setLastSaved(new Date());
          toast.success('Draft auto-saved', { duration: 1000 });
        }
      }
    } catch (error) {
      console.error('Auto-save failed:', error);
    }
  };

  // Auto-save every 2 minutes
  React.useEffect(() => {
    if (!autoSaveEnabled) return;
    
    const interval = setInterval(autoSave, 120000); // 2 minutes
    return () => clearInterval(interval);
  }, [formData, autoSaveEnabled]);

  // Load categories on component mount (ready for API integration)
  React.useEffect(() => {
    const loadCategories = async () => {
      console.log('🚀 Loading categories on component mount...');
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
  React.useEffect(() => {
    const loadSubcategories = async () => {
      if (formData.category) {
        try {
          const subcategoriesData = await fetchSubcategories(formData.category);
          setAvailableSubcategories(subcategoriesData);
          
          // Reset subcategory if current one doesn't exist in new category
          const currentSubcategoryExists = subcategoriesData.some(
            (sub: any) => String(sub.id) === String(formData.subcategory)
          );
          if (!currentSubcategoryExists) {
            setFormData((prev: LocalTopicFormData) => ({ ...prev, subcategory: '' }));
          }
        } catch (error) {
          console.error('Failed to load subcategories:', error);
          setAvailableSubcategories([]);
        }
      } else {
        setAvailableSubcategories([]);
        setFormData((prev: LocalTopicFormData) => ({ ...prev, subcategory: '' }));
      }
    };

    loadSubcategories();
  }, [formData.category]);

  // Auto-generate slug from title
  const generateSlug = (title: string) => {
    return title
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/(^-|-$)/g, '');
  };

  const handleTitleChange = (title: string) => {
    setFormData((prev: LocalTopicFormData) => ({
      ...prev,
      title,
      slug: generateSlug(title),
      metaTitle: title
    }));
  };

  // Module Management
  const addModule = () => {
    const newModule: LocalModule = {
      id: Date.now().toString(),
      title: '',
      description: '',
      order: formData.modules.length + 1,
      videos: []
    };
    setFormData((prev: LocalTopicFormData) => ({
      ...prev,
      modules: [...prev.modules, newModule]
    }));
    // Auto-expand the new module
    setExpandedModules(prev => [...prev, newModule.id]);
  };

  const toggleModuleExpansion = (moduleId: string | number) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  const updateModule = (moduleIndex: number, field: keyof LocalModule, value: any) => {
    setFormData((prev: LocalTopicFormData) => ({
      ...prev,
      modules: prev.modules.map((module: LocalModule, index: number) => 
        index === moduleIndex ? { ...module, [field]: value } : module
      )
    }));
  };

  const removeModule = (moduleIndex: number) => {
    setFormData((prev: LocalTopicFormData) => ({
      ...prev,
      modules: prev.modules.filter((_: LocalModule, index: number) => index !== moduleIndex)
    }));
  };

  // Video Management
  const addVideo = (moduleIndex: number) => {
    const newVideo: LocalVideo = {
      id: Date.now().toString(),
      title: '',
      description: '',
      duration: '',
      videoFile: null,
      videoUrl: '',
      thumbnail: '',
      order: formData.modules[moduleIndex].videos.length + 1
    };
    
    setFormData((prev: LocalTopicFormData) => ({
      ...prev,
      modules: prev.modules.map((module: LocalModule, index: number) => 
        index === moduleIndex 
          ? { ...module, videos: [...module.videos, newVideo] }
          : module
      )
    }));
  };

  const updateVideo = (moduleIndex: number, videoIndex: number, field: keyof LocalVideo, value: any) => {
    setFormData((prev: LocalTopicFormData) => ({
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
    }));
  };

  const removeVideo = (moduleIndex: number, videoIndex: number) => {
    setFormData((prev: LocalTopicFormData) => ({
      ...prev,
      modules: prev.modules.map((module: LocalModule, mIndex: number) => 
        mIndex === moduleIndex
          ? { ...module, videos: module.videos.filter((_: LocalVideo, vIndex: number) => vIndex !== videoIndex) }
          : module
      )
    }));
  };

  // Bulk Video Management
  const addMultipleVideos = (moduleIndex: number, count: number) => {
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
    
    setFormData((prev: LocalTopicFormData) => ({
      ...prev,
      modules: prev.modules.map((module: LocalModule, index: number) => 
        index === moduleIndex 
          ? { ...module, videos: [...module.videos, ...newVideos] }
          : module
      )
    }));
  };

  // Bulk File Upload
  const handleBulkVideoUpload = async (moduleIndex: number, files: FileList) => {
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
    
    setFormData((prev: LocalTopicFormData) => ({
      ...prev,
      modules: prev.modules.map((module: LocalModule, index: number) => 
        index === moduleIndex 
          ? { ...module, videos: [...module.videos, ...newVideos] }
          : module
      )
    }));

    toast.success(`Added ${videoFiles.length} video(s) successfully! Save the topic to upload them.`);
  };

  // Quick Video Upload from Modal
  const handleQuickVideoUpload = (videos: any[]) => {
    // Convert VideoFile interface to LocalVideo interface
    const convertedVideos = videos.map((video, index) => ({
      id: video.id || `quick-${Date.now()}-${index}`,
      title: video.name || `Video ${index + 1}`,
      description: '',
      duration: '',
      videoFile: video.file || null,
      videoUrl: video.url || (video.file ? URL.createObjectURL(video.file) : ''),
      thumbnail: video.thumbnail || '',
      order: index + 1
    }));

    // If no modules exist, create a first module
    if (formData.modules.length === 0) {
      const newModule: LocalModule = {
        id: `new-${Date.now()}`,
        title: 'Module 1',
        description: 'Auto-created module for uploaded videos',
        order: 1,
        videos: []
      };
      
      setFormData((prev: LocalTopicFormData) => ({
        ...prev,
        modules: [newModule]
      }));
    }

    // Add videos to the first module (or user can move them later)
    const targetModuleIndex = 0;
    const currentVideoCount = formData.modules[targetModuleIndex]?.videos.length || 0;

    const newVideos: LocalVideo[] = convertedVideos.map((video, index) => ({
      ...video,
      order: currentVideoCount + index + 1
    }));

    setFormData((prev: LocalTopicFormData) => {
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
    if (videos.length === 0) {
      toast.error('No videos to add');
      return;
    }

    if (!formData.modules[moduleIndex]) {
      toast.error('Module not found');
      return;
    }

    try {
      const currentVideoCount = formData.modules[moduleIndex]?.videos.length || 0;

      // Convert VideoFile interface to LocalVideo interface
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

      setFormData((prev: LocalTopicFormData) => {
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

  const handleVideoFileUpload = async (moduleIndex: number, videoIndex: number, file: File) => {
    try {
      // Update local state immediately for UI feedback
      updateVideo(moduleIndex, videoIndex, 'videoFile', file);
      updateVideo(moduleIndex, videoIndex, 'title', file.name.replace(/\.[^/.]+$/, ""));
      
      // Create preview URL for immediate feedback
      const previewUrl = URL.createObjectURL(file);
      updateVideo(moduleIndex, videoIndex, 'videoUrl', previewUrl);
      
      toast.info('Video file ready for upload. Save the topic to finalize.');
      
    } catch (error) {
      console.error('Error handling video file:', error);
      toast.error('Failed to process video file');
    }
  };

  // Tag Management
  const addTag = () => {
    if (newTag.trim() && !formData.tags.includes(newTag.trim())) {
      setFormData((prev: LocalTopicFormData) => ({ ...prev, tags: [...prev.tags, newTag.trim()] }));
      setNewTag('');
    }
  };

  const removeTag = (tagToRemove: string) => {
    setFormData((prev: LocalTopicFormData) => ({ 
      ...prev, 
      tags: prev.tags.filter((tag: string) => tag !== tagToRemove) 
    }));
  };

  const toggleAudience = (audience: string) => {
    setFormData((prev: LocalTopicFormData) => ({
      ...prev,
      targetAudience: prev.targetAudience.includes(audience)
        ? prev.targetAudience.filter((aud: string) => aud !== audience)
        : [...prev.targetAudience, audience]
    }));
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

  const handleSave = async (status: 'draft' | 'published') => {
    setIsLoading(true);
    console.log('💾 Starting topic creation process...');
    console.log('📋 Create status:', status);
    console.log('📋 Current form data before create:', JSON.stringify(formData, null, 2));
    
    try {
      // Validate difficulty is set
      if (!formData.difficulty) {
        console.error('❌ Difficulty validation failed');
        toast.error('Please select a difficulty level');
        setIsLoading(false);
        return;
      }

      // Validation
      if (!formData.title || !formData.category || !formData.difficulty) {
        console.error('❌ Validation failed:', {
          title: formData.title,
          category: formData.category,
          difficulty: formData.difficulty
        });
        toast.error('Please fill in all required fields');
        setIsLoading(false);
        return;
      }

      // Additional validation for published topics
      if (status === 'published') {
        if (!formData.description || !formData.learningObjectives) {
          console.error('❌ Published topic validation failed');
          toast.error('Description and learning objectives are required for published topics');
          setIsLoading(false);
          return;
        }
        
        // Modules are optional, but if they exist, they should have proper structure
        if (formData.modules.length > 0) {
          // Check if modules have titles
          const modulesWithoutTitles = formData.modules.filter(module => !module.title?.trim());
          if (modulesWithoutTitles.length > 0) {
            console.error('❌ Module validation failed - modules without titles:', modulesWithoutTitles);
            toast.error('All modules must have titles');
            setIsLoading(false);
            return;
          }
        }
      }

      console.log('✅ All validations passed, processing videos...');

      // Process videos before creating topic
      console.log('🎬 Processing video content...');
      console.log('� Modules to process:', formData.modules.map(m => ({
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

      // STEP 1: First create the topic with modules (but without videos that need file uploads)
      const initialModules = formData.modules.map(module => {
        if (module.videos.length === 0) {
          return {
            ...module,
            id: String(module.id),
            videos: []
          };
        }

        // Only include URL-based videos in initial creation
        const urlBasedVideos = module.videos.filter(video => 
          !video.videoFile && 
          video.videoUrl && 
          !video.videoUrl.startsWith('blob:') && 
          !video.uploadedUrl &&
          (video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be') || video.videoUrl.startsWith('http'))
        );

        const apiReadyVideos = urlBasedVideos.map(video => ({
          id: video.id,
          title: video.title,
          description: video.description || '',
          duration: video.duration || '0',
          videoUrl: video.videoUrl,
          thumbnail: video.thumbnail,
          order: video.order,
          orderIndex: video.orderIndex,
          videoType: video.videoUrl.includes('youtube') ? 'youtube' : 'external',
          durationSeconds: video.durationSeconds,
          isPreview: video.isPreview || false,
          transcript: video.transcript || ''
        }));

        return {
          ...module,
          id: String(module.id),
          videos: apiReadyVideos
        };
      });

      // Convert local form data to API format for initial creation
      const initialData: CreateTopicRequest = { 
        ...formData, 
        status,
        difficulty: formData.difficulty as 'beginner' | 'intermediate' | 'advanced' | 'expert',
        modules: initialModules
      };
      
      console.log('📤 Initial data being sent to API for creation:');
      console.log('📤 Topic title:', initialData.title);
      console.log('📤 Modules being created:', initialData.modules.map(m => ({
        localId: m.id,
        title: m.title,
        order: m.order,
        videosCount: m.videos.length
      })));
      console.log('📤 Full payload preview:', {
        title: initialData.title,
        modulesCount: initialData.modules.length,
        modulesSummary: initialData.modules.map(m => `"${m.title}" (order: ${m.order})`)
      });

      // Call API to create topic
      console.log('🌐 Making POST request to:', API_ENDPOINTS.TOPICS.CREATE);
      const result = await apiService.post(API_ENDPOINTS.TOPICS.CREATE, initialData);
      console.log('📥 API Response received');
      console.log('📥 Response success:', result.success);
      console.log('📥 Response data keys:', result.data ? Object.keys(result.data) : 'No data');
      console.log('📥 Created topic ID:', result.data?.id);
      console.log('📥 Created modules:', result.data?.modules?.map((m: any) => ({
        id: m.id,
        title: m.title,
        order: m.order,
        orderIndex: m.orderIndex
      })) || 'No modules in response');
      
      if (!result.success) {
        console.error('❌ API returned error:', result);
        toast.error(result.error || 'Failed to create topic. Please try again.');
        setIsLoading(false);
        return;
      }

      const createdTopicId = result.data.id;
      console.log('✅ Topic created successfully with ID:', createdTopicId);

      // STEP 2: Now handle video uploads for modules that have file-based videos
      console.log('🎬 Starting video upload process...');
      
      const modulesWithVideoUploads = formData.modules.filter(module => 
        module.videos.some(video => video.videoFile && !video.uploadedUrl)
      );

      if (modulesWithVideoUploads.length > 0) {
        console.log(`📤 Processing ${modulesWithVideoUploads.length} modules with video uploads`);
        console.log(`📤 Modules needing uploads:`, modulesWithVideoUploads.map(m => ({
          localId: m.id,
          title: m.title,
          order: m.order,
          videosToUpload: m.videos.filter(v => v.videoFile && !v.uploadedUrl).length
        })));

        // Find the created modules from the response to get their server IDs
        const createdModules = result.data.modules || [];
        console.log('📊 Created modules from API:');
        console.log('📊 Total created modules:', createdModules.length);
        console.log('📊 Created modules details:', createdModules.map((m: any) => ({
          serverId: m.id,
          title: m.title,
          order: m.order,
          orderIndex: m.orderIndex || 'undefined'
        })));

        for (const module of modulesWithVideoUploads) {
          console.log(`🔍 Looking for created module:`, {
            localModule: {
              id: module.id,
              title: module.title,
              order: module.order
            },
            availableCreatedModules: createdModules.map((cm: any) => ({
              id: cm.id,
              title: cm.title,
              order: cm.order,
              orderIndex: cm.orderIndex
            }))
          });

          // Find the corresponding created module - try multiple matching strategies
          let createdModule = createdModules.find((cm: any) => 
            cm.title === module.title && cm.order === module.order
          );

          // Fallback 1: Try matching by title only if order match fails
          if (!createdModule) {
            createdModule = createdModules.find((cm: any) => cm.title === module.title);
            console.log(`🔄 Fallback 1: Matching by title only for "${module.title}":`, createdModule ? 'Found' : 'Not found');
          }

          // Fallback 2: Try matching by order only if title match fails
          if (!createdModule) {
            createdModule = createdModules.find((cm: any) => cm.order === module.order);
            console.log(`🔄 Fallback 2: Matching by order only for order ${module.order}:`, createdModule ? 'Found' : 'Not found');
          }

          // Fallback 3: Try matching by index if we have the same number of modules
          if (!createdModule && createdModules.length === formData.modules.length) {
            const moduleIndex = formData.modules.findIndex(m => m.id === module.id);
            if (moduleIndex >= 0 && moduleIndex < createdModules.length) {
              createdModule = createdModules[moduleIndex];
              console.log(`🔄 Fallback 3: Matching by index ${moduleIndex} for "${module.title}":`, createdModule ? 'Found' : 'Not found');
            }
          }
          
          if (!createdModule) {
            console.error(`❌ Could not find created module for: ${module.title}`);
            console.error(`❌ Available modules on server:`, createdModules.map((cm: any) => `"${cm.title}" (order: ${cm.order})`));
            console.error(`❌ Looking for local module:`, `"${module.title}" (order: ${module.order})`);
            toast.error(`Could not find server module for: ${module.title}. Videos will not be uploaded for this module.`);
            continue;
          }

          const moduleId = createdModule.id;
          console.log(`📤 Processing video uploads for module: ${module.title} (ID: ${moduleId})`);

          // Get videos that need uploading
          const videosToUpload = module.videos.filter(video => video.videoFile && !video.uploadedUrl);
          const urlBasedVideos = module.videos.filter(video => 
            !video.videoFile && 
            video.videoUrl && 
            !video.videoUrl.startsWith('blob:') && 
            !video.uploadedUrl &&
            (video.videoUrl.includes('youtube.com') || video.videoUrl.includes('youtu.be') || video.videoUrl.startsWith('http'))
          );

          // Upload file-based videos
          if (videosToUpload.length > 0) {
            console.log(`📤 Uploading ${videosToUpload.length} file-based videos for module: ${module.title}`);
            
            try {
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
                continue;
              }

              const formDataPayload = new FormData();
              
              videosToUpload.forEach((video, index) => {
                if (video.videoFile) {
                  formDataPayload.append('videos', video.videoFile);
                  formDataPayload.append('titles[]', video.title);
                  formDataPayload.append('descriptions[]', video.description || '');
                  formDataPayload.append('durations[]', video.duration || '0');
                  formDataPayload.append('orders[]', video.order.toString());
                }
              });

              const uploadEndpoint = API_ENDPOINTS.TOPICS.VIDEOS.UPLOAD_MULTIPLE(createdTopicId, moduleId);
              console.log('📤 Uploading to endpoint:', uploadEndpoint);
              console.log('📤 FormData details:', {
                videosCount: videosToUpload.length,
                titles: videosToUpload.map(v => v.title),
                fileSizes: videosToUpload.map(v => v.videoFile ? `${(v.videoFile.size / 1024 / 1024).toFixed(2)}MB` : 'Unknown')
              });
              
              // Show upload start notification
              toast.info(`Uploading ${videosToUpload.length} video(s) for ${module.title}...`);

              const uploadResult = await apiService.post<any>(
                API_ENDPOINTS.TOPICS.VIDEOS.UPLOAD_MULTIPLE(createdTopicId, moduleId),
                formDataPayload,
                {
                  headers: {
                    'Content-Type': 'multipart/form-data',
                  },
                }
              );

              if (uploadResult.success) {
                console.log(`✅ Successfully uploaded ${videosToUpload.length} videos for module: ${module.title}`);
                toast.success(`Uploaded ${videosToUpload.length} video(s) for ${module.title}`);
              } else {
                console.error(`❌ Failed to upload videos for module: ${module.title}`, uploadResult);
                toast.error(`Failed to upload videos for module: ${module.title}`);
              }
            } catch (uploadError) {
              console.error(`� Error uploading videos for module: ${module.title}`, uploadError);
              toast.error(`Error uploading videos for module: ${module.title}`);
            }
          }

          // Create URL-based videos
          if (urlBasedVideos.length > 0) {
            console.log(`� Creating ${urlBasedVideos.length} URL-based videos for module: ${module.title}`);
            
            for (const urlVideo of urlBasedVideos) {
              try {
                const videoPayload = {
                  title: urlVideo.title,
                  description: urlVideo.description || '',
                  duration: urlVideo.duration || '0',
                  videoUrl: urlVideo.videoUrl,
                  thumbnail: urlVideo.thumbnail || '',
                  order: urlVideo.order,
                  videoType: urlVideo.videoUrl.includes('youtube') ? 'youtube' : 'external',
                  isPreview: urlVideo.isPreview || false
                };

                const createResult = await apiService.post(
                  API_ENDPOINTS.TOPICS.VIDEOS.CREATE(createdTopicId, moduleId),
                  videoPayload
                );

                if (createResult.success) {
                  console.log(`✅ Created URL-based video: ${urlVideo.title}`);
                  toast.success(`Added video: ${urlVideo.title}`);
                } else {
                  console.error(`❌ Failed to create URL-based video: ${urlVideo.title}`, createResult);
                  toast.error(`Failed to add video: ${urlVideo.title}`);
                }
              } catch (urlError) {
                console.error(`💥 Error creating URL-based video: ${urlVideo.title}`, urlError);
                toast.error(`Error adding video: ${urlVideo.title}`);
              }
            }
          }
        }
      }

      console.log('✅ Topic creation and video upload process completed!');
      toast.success(`Topic ${status === 'published' ? 'published' : 'created'} successfully with all videos!`);
      router.push('/dashboard/topics');
    } catch (error) {
      console.error('💥 Error creating topic:', error);
      console.error('💥 Error stack:', error instanceof Error ? error.stack : 'No stack trace');
      toast.error('Failed to create topic. Please try again.');
    } finally {
      console.log('🏁 Topic creation process completed');
      setIsLoading(false);
    }
  };

  const renderStepContent = () => {
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
                      onChange={(e) => setFormData(prev => ({ ...prev, emoji: e.target.value }))}
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
                        <p className="text-sm text-red-500">Title is required</p>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Category Row - Compact */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <div className="flex items-center justify-between">
                      <Label htmlFor='category'>Category *</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={refreshCategories}
                        disabled={loadingCategories}
                        className="h-6 px-2 text-xs"
                      >
                        {loadingCategories ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        <span className="ml-1">Refresh</span>
                      </Button>
                    </div>
                    <Select 
                      value={formData.category} 
                      onValueChange={(value) => {
                        console.log('🏷️ Category selected:', value);
                        console.log('🏷️ Selected category details:', categories.find(cat => String(cat.id) === value));
                        setFormData(prev => ({ ...prev, category: value }))
                      }}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder='Select category' />
                      </SelectTrigger>
                      <SelectContent>
                        {categories.length === 0 ? (
                          <SelectItem value="loading" disabled>
                            {loadingCategories ? 'Loading categories...' : 'No categories available'}
                          </SelectItem>
                        ) : (
                          categories.map((category) => (
                            <SelectItem key={category.id} value={String(category.id)}>
                              {category.emoji || '📁'} {category.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                    {!formData.category && (
                      <p className="text-sm text-red-500">Category is required</p>
                    )}
                  </div>

                  <div className='space-y-2'>
                    <div className="flex items-center justify-between">
                      <Label htmlFor='subcategory'>Sub-Category</Label>
                      <Button
                        type="button"
                        variant="ghost"
                        size="sm"
                        onClick={refreshSubcategories}
                        disabled={loadingSubcategories || !formData.category}
                        className="h-6 px-2 text-xs"
                      >
                        {loadingSubcategories ? (
                          <Loader2 className="h-3 w-3 animate-spin" />
                        ) : (
                          <RefreshCw className="h-3 w-3" />
                        )}
                        <span className="ml-1">Refresh</span>
                      </Button>
                    </div>
                    <Select 
                      value={formData.subcategory} 
                      onValueChange={(value) => {
                        console.log('🏷️ Subcategory selected:', value);
                        console.log('🏷️ Selected subcategory details:', availableSubcategories.find(sub => String(sub.id) === value));
                        setFormData(prev => ({ ...prev, subcategory: value }))
                      }}
                      disabled={!formData.category || availableSubcategories.length === 0}
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder={
                          !formData.category 
                            ? 'Select category first' 
                            : availableSubcategories.length === 0 
                            ? 'No subcategories available'
                            : 'Select sub-category'
                        } />
                      </SelectTrigger>
                      <SelectContent>
                        {availableSubcategories.length === 0 ? (
                          <SelectItem value="empty" disabled>
                            {!formData.category 
                              ? 'Select category first' 
                              : loadingSubcategories 
                              ? 'Loading subcategories...'
                              : 'No subcategories available'}
                          </SelectItem>
                        ) : (
                          availableSubcategories.map((subcategory) => (
                            <SelectItem key={subcategory.id} value={String(subcategory.id)}>
                              {subcategory.emoji || '📂'} {subcategory.name}
                            </SelectItem>
                          ))
                        )}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {/* Difficulty & Duration Row - Compact */}
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor='difficulty'>Difficulty Level *</Label>
                    <Select 
                      value={formData.difficulty} 
                      onValueChange={(value: 'beginner' | 'intermediate' | 'advanced' | 'expert') => 
                        setFormData(prev => ({ ...prev, difficulty: value }))
                      }
                    >
                      <SelectTrigger className="h-9 w-full">
                        <SelectValue placeholder='Select difficulty' />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value='beginner'>🟢 Beginner</SelectItem>
                        <SelectItem value='intermediate'>🟡 Intermediate</SelectItem>
                        <SelectItem value='advanced'>🟠 Advanced</SelectItem>
                        <SelectItem value='expert'>🔴 Expert</SelectItem>
                      </SelectContent>
                    </Select>
                    {!formData.difficulty && (
                      <p className="text-sm text-red-500">Difficulty is required</p>
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
                      onChange={(e) => setFormData(prev => ({ ...prev, duration: e.target.value }))}
                      className="h-9"
                    />
                  </div>
                </div>

                {/* Description - Always visible */}
                <div className='space-y-2'>
                  <Label htmlFor='description'>Description</Label>
                  <RichTextEditor
                    value={formData.description}
                    onChange={(value) => setFormData(prev => ({ ...prev, description: value }))}
                    placeholder="Provide a comprehensive description of what students will learn in this topic. You can use **bold**, *italic*, and bullet points:
• Key learning point 1
• Key learning point 2
• Key learning point 3"
                    className="min-h-[100px]"
                  />
                </div>

                {/* Accordion for Advanced Fields */}
                <Accordion type="multiple" className="w-full">
                  <AccordionItem value="learning-objectives">
                    <AccordionTrigger>Learning Objectives</AccordionTrigger>
                    <AccordionContent>
                      <div className='space-y-2'>
                        <RichTextEditor
                          value={formData.learningObjectives}
                          onChange={(value) => setFormData(prev => ({ ...prev, learningObjectives: value }))}
                          placeholder="Define clear learning objectives using formatting:
• **Understand** basic cybersecurity principles
• **Learn** password best practices
• **Identify** common security threats
• **Implement** security measures"
                        />
                      </div>
                    </AccordionContent>
                  </AccordionItem>

                  <AccordionItem value="prerequisites">
                    <AccordionTrigger>Prerequisites</AccordionTrigger>
                    <AccordionContent>
                      <div className='space-y-2'>
                        <RichTextEditor
                          value={formData.prerequisites}
                          onChange={(value) => setFormData(prev => ({ ...prev, prerequisites: value }))}
                          placeholder="List any prerequisites for this topic:
• Basic computer literacy
• Understanding of internet concepts
• **No prior experience required** for beginners"
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
                    Modules & Videos ({formData.modules.length})
                  </div>
                  <div className="flex items-center gap-2">
                    <VideoUploadModal 
                      onVideoUpload={handleQuickVideoUpload}
                      trigger={
                        <Button variant="outline" size="sm">
                          <Upload className="h-4 w-4 mr-2" />
                          Quick Upload
                        </Button>
                      }
                    />
                    <Button onClick={addModule} size="sm">
                      <Plus className="h-4 w-4 mr-2" />
                      Add Module
                    </Button>
                  </div>
                </CardTitle>
              </CardHeader>
              <CardContent className='space-y-4'>
                {formData.modules.length === 0 ? (
                  <div className="text-center py-12">
                    <Video className="h-16 w-16 mx-auto text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No modules yet</h3>
                    <p className="text-gray-500 mb-4">Get started by adding your first module with rich content</p>
                    <div className="flex justify-center gap-3">
                      <Button onClick={addModule}>
                        <Plus className="h-4 w-4 mr-2" />
                        Add First Module
                      </Button>
                      <VideoUploadModal 
                        onVideoUpload={handleQuickVideoUpload}
                        trigger={
                          <Button variant="outline">
                            <Upload className="h-4 w-4 mr-2" />
                            Upload Videos
                          </Button>
                        }
                      />
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {formData.modules.map((module, moduleIndex) => (
                      <Collapsible
                        key={module.id}
                        open={expandedModules.includes(module.id)}
                        onOpenChange={() => toggleModuleExpansion(module.id)}
                      >
                        <Card className="border-2 transition-all py-1 border-gray-200 hover:border-gray-300">
                          <CollapsibleTrigger asChild>
                            <CardHeader className="cursor-pointer hover:bg-gray-50/50 transition-colors py-2 px-3 h-[50px] min-h-[50px]">
                              <div className="flex items-center justify-between h-full">
                                <div className="flex items-center gap-2">
                                  <div className="w-6 h-6 rounded flex items-center justify-center text-xs font-semibold bg-gray-100 text-gray-600">
                                    {module.order}
                                  </div>
                                  <div className="text-left">
                                    <h4 className="font-medium text-xs text-gray-900 leading-tight">
                                      {module.title || `Module ${module.order}`}
                                    </h4>
                                    <div className="flex items-center gap-2">
                                      <p className="text-xs text-gray-500">
                                        {module.videos.length} video{module.videos.length !== 1 ? 's' : ''}
                                      </p>
                                      {module.videos.length > 0 && (
                                        <div className="flex items-center gap-1">
                                          <div className="w-1.5 h-1.5 rounded-full bg-blue-500"></div>
                                          <span className="text-xs text-gray-500">
                                            {module.videos.length} ready
                                          </span>
                                        </div>
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
                                  {expandedModules.includes(module.id) ? (
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
                                      <h4 className="text-sm font-medium">Videos ({module.videos.length})</h4>
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
                                      onVideoUpload={(videos: any[]) => handleModuleVideoUpload(moduleIndex, videos)}
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
                                      {/* Thumbnail grid display - matching edit page */}
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
                                            
                                            {/* Video title */}
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
                    ))}
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
                      onCheckedChange={(checked) => setFormData(prev => ({ 
                        ...prev, 
                        isFree: checked,
                        price: checked ? '0' : prev.price
                      }))
                      }
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
                        onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))
                        }
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
                      onCheckedChange={(checked) => setFormData(prev => ({ ...prev, featured: checked }))
                      }
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
                      onChange={(e) => setFormData(prev => ({ ...prev, thumbnail: e.target.value }))
                      }
                    />
                  </div>
                  
                  <div className='space-y-2'>
                    <Label htmlFor='metaTitle'>Meta Title</Label>
                    <Input 
                      id='metaTitle'
                      placeholder='SEO title (auto-filled from topic title)'
                      value={formData.metaTitle}
                      onChange={(e) => setFormData(prev => ({ ...prev, metaTitle: e.target.value }))
                      }
                    />
                    <p className='text-xs text-muted-foreground'>
                      {formData.metaTitle.length}/60 characters
                    </p>
                  </div>
                  
                  <div className='space-y-2'>
                    <Label htmlFor='metaDescription'>Meta Description</Label>
                    <RichTextEditor
                      value={formData.metaDescription}
                      onChange={(value) => setFormData(prev => ({ ...prev, metaDescription: value }))}
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
            <span>Saving topic...</span>
          </div>
        </div>
      )}
      <div className='space-y-6'>
        <Breadcrumbs />
        
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Create New Topic</h1>
            <div className="flex items-center gap-4">
              <p className='text-muted-foreground'>
                Build comprehensive educational content with modules and videos
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
            <Link href='/dashboard/topics'>
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
                      onClick={() => handleSave('draft')}
                      disabled={isLoading}
                      className="min-w-[120px]"
                    >
                      <FileText className="mr-2 h-4 w-4" />
                      {isLoading ? 'Saving...' : 'Save Draft'}
                    </Button>
                    <Button
                      onClick={() => handleSave('published')}
                      disabled={isLoading || !formData.title || !formData.category}
                      className="min-w-[120px]"
                    >
                      <Save className="mr-2 h-4 w-4" />
                      {isLoading ? 'Publishing...' : 'Publish'}
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
