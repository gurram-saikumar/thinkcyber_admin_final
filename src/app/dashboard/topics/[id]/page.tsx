'use client';

import React, { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  ArrowLeft, 
  Edit, 
  Trash2, 
  Star, 
  Users, 
  Clock, 
  BookOpen,
  Video,
  Loader2,
  Eye,
  DollarSign,
  Calendar,
  PlayCircle,
  ChevronDown,
  ChevronUp
} from 'lucide-react';
import Link from 'next/link';
import { toast } from 'sonner';
import { Topic } from '@/types/topics';
import { formatDate } from '@/lib/format';
import { RichTextDisplay } from '@/components/ui/rich-text-display';
import { VideoModal } from '@/components/modal/video-modal';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

export default function TopicDetailsPage() {
  const router = useRouter();
  const params = useParams();
  const topicId = params.id as string;
  
  const [topic, setTopic] = useState<Topic | null>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedModules, setExpandedModules] = useState<(string | number)[]>([]);
  const [selectedVideo, setSelectedVideo] = useState<{
    id: number | string;
    title: string;
    description?: string | null;
    videoUrl: string;
    duration?: string | number;
    videoType?: string;
    thumbnailUrl?: string | null;
    thumbnail?: string | null;
    transcript?: string | null;
  } | null>(null);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState(false);

  // Toggle module expansion
  const toggleModuleExpansion = (moduleId: string | number) => {
    setExpandedModules(prev => 
      prev.includes(moduleId) 
        ? prev.filter(id => id !== moduleId)
        : [...prev, moduleId]
    );
  };

  // Handle video click
  const handleVideoClick = (video: {
    id: number | string;
    title: string;
    description?: string | null;
    videoUrl: string;
    duration?: string | number;
    videoType?: string;
    thumbnailUrl?: string | null;
    thumbnail?: string | null;
    transcript?: string | null;
  }) => {
    setSelectedVideo(video);
    setIsVideoModalOpen(true);
  };

  // Close video modal
  const closeVideoModal = () => {
    setIsVideoModalOpen(false);
    setSelectedVideo(null);
  };

  // Fetch topic data
  useEffect(() => {
    const fetchTopic = async () => {
      try {
        setLoading(true);
        const result = await apiService.get(API_ENDPOINTS.TOPICS.BY_ID(topicId));
        
        console.log('🔍 Topic API Response:', result);
        console.log('📊 Topic Data:', result.data);
        
        if (result.success && result.data) {
          setTopic(result.data);
        } else {
          setError('Failed to load topic data');
          toast.error('Failed to load topic data');
        }
      } catch (error) {
        console.error('Error fetching topic:', error);
        setError('Failed to load topic data');
        toast.error('Failed to load topic data');
      } finally {
        setLoading(false);
      }
    };

    if (topicId) {
      fetchTopic();
    }
  }, [topicId]);

  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
      return;
    }

    try {
      setActionLoading(true);
      const result = await apiService.delete(API_ENDPOINTS.TOPICS.BY_ID(topicId));
      
      if (result.success) {
        toast.success('Topic deleted successfully');
        router.push('/dashboard/topics');
      } else {
        toast.error(result.error || 'Failed to delete topic');
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast.error('Failed to delete topic');
    } finally {
      setActionLoading(false);
    }
  };

  const handleToggleFeatured = async () => {
    if (!topic) return;
    
    try {
      setActionLoading(true);
      const result = await apiService.put(API_ENDPOINTS.TOPICS.BY_ID(topicId), {
        ...topic,
        featured: !topic.featured,
      });
      
      if (result.success) {
        setTopic({ ...topic, featured: !topic.featured });
        toast.success('Topic updated successfully');
      } else {
        toast.error(result.error || 'Failed to update topic');
      }
    } catch (error) {
      console.error('Error updating topic:', error);
      toast.error('Failed to update topic');
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'published':
        return 'bg-green-100 text-green-800';
      case 'draft':
        return 'bg-yellow-100 text-yellow-800';
      case 'archived':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case 'beginner':
        return 'bg-blue-100 text-blue-800';
      case 'intermediate':
        return 'bg-orange-100 text-orange-800';
      case 'advanced':
        return 'bg-purple-100 text-purple-800';
      case 'expert':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  if (loading) {
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

  if (error || !topic) {
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

  return (
    <PageContainer>
      <div className='space-y-6'>
        <Breadcrumbs />
        
        <div className='flex items-center justify-between'>
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-blue-100 rounded-lg">
              <span className="text-3xl">{topic.emoji || '📚'}</span>
            </div>
            <div>
              <h1 className='text-3xl font-bold tracking-tight'>{topic.title}</h1>
              <p className='text-muted-foreground'>
                {topic.categoryName || topic.category || 'Uncategorized'}
                {topic.subcategoryName && ` • ${topic.subcategoryName}`}
                {topic.duration && ` • ${topic.duration}h duration`}
              </p>
            </div>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={handleToggleFeatured}
              disabled={actionLoading}
            >
              <Star className={`mr-2 h-4 w-4 ${topic.featured ? 'fill-current text-yellow-500' : ''}`} />
              {topic.featured ? 'Remove Featured' : 'Mark Featured'}
            </Button>
            <Link href={`/dashboard/topics/${topicId}/edit`}>
              <Button variant="outline">
                <Edit className="mr-2 h-4 w-4" />
                Edit
              </Button>
            </Link>
            <Button 
              variant="destructive" 
              onClick={handleDelete}
              disabled={actionLoading}
            >
              <Trash2 className="mr-2 h-4 w-4" />
              Delete
            </Button>
            <Link href="/dashboard/topics">
              <Button variant="outline">
                <ArrowLeft className="mr-2 h-4 w-4" />
                Back
              </Button>
            </Link>
          </div>
        </div>

        {/* Status and Badges */}
        <div className="flex flex-wrap gap-2">
          <Badge className={getStatusColor(topic.status)}>
            {topic.status}
          </Badge>
          <Badge className={getDifficultyColor(topic.difficulty)}>
            {topic.difficulty}
          </Badge>
          {topic.featured && (
            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
              <Star className="w-3 h-3 mr-1 fill-current" />
              Featured
            </Badge>
          )}
          {topic.isFree ? (
            <Badge variant="outline" className="text-green-600 border-green-300">
              Free
            </Badge>
          ) : (
            <Badge variant="outline" className="text-blue-600 border-blue-300">
              <DollarSign className="w-3 h-3 mr-1" />
              ${topic.price}
            </Badge>
          )}
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Enrollments</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{topic.enrollmentCount?.toLocaleString() || 0}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Rating</CardTitle>
              <Star className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {topic.rating ? topic.rating.toFixed(1) : 'N/A'}
              </div>
              <p className='text-xs text-muted-foreground'>
                {topic.reviewCount || 0} reviews
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Modules</CardTitle>
              <BookOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{topic.modules?.length || 0}</div>
              <p className='text-xs text-muted-foreground'>
                {topic.modules?.reduce((sum, module) => sum + (module.videos?.length || 0), 0) || 0} videos
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Duration</CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{topic.duration || 0}h</div>
              <p className='text-xs text-muted-foreground'>
                Total content
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Basic Information - Full Width */}
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <h4 className="font-medium mb-3">Description</h4>
              {topic.description ? (
                <RichTextDisplay 
                  content={topic.description} 
                  className="text-sm text-muted-foreground"
                />
              ) : (
                <p className="text-sm text-muted-foreground">No description provided</p>
              )}
            </div>
            
            <Separator />
            
            <div>
              <h4 className="font-medium mb-3">Learning Objectives</h4>
              {topic.learningObjectives ? (
                <RichTextDisplay 
                  content={topic.learningObjectives} 
                  className="text-sm text-muted-foreground"
                />
              ) : (
                <p className="text-sm text-muted-foreground">No learning objectives provided</p>
              )}
            </div>
            
            {topic.prerequisites && (
              <>
                <Separator />
                <div>
                  <h4 className="font-medium mb-3">Prerequisites</h4>
                  <RichTextDisplay 
                    content={topic.prerequisites} 
                    className="text-sm text-muted-foreground"
                  />
                </div>
              </>
            )}
          </CardContent>
        </Card>

        {/* Metadata - Compact Layout */}
        <Card>
          <CardHeader>
            <CardTitle>Topic Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Category & Subcategory */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm uppercase tracking-wide text-muted-foreground">Category</h4>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="bg-blue-50 text-blue-700 border-blue-200">
                      {topic.categoryName || 'Not set'}
                    </Badge>
                  </div>
                </div>
                {topic.subcategoryName && (
                  <div>
                    <h4 className="font-medium mb-2 text-sm uppercase tracking-wide text-muted-foreground">Subcategory</h4>
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="bg-purple-50 text-purple-700 border-purple-200">
                        {topic.subcategoryName}
                      </Badge>
                    </div>
                  </div>
                )}
              </div>

              {/* Target Audience */}
              <div>
                <h4 className="font-medium mb-2 text-sm uppercase tracking-wide text-muted-foreground">Target Audience</h4>
                <div className="flex flex-wrap gap-1">
                  {topic.targetAudience && topic.targetAudience.length > 0 ? (
                    topic.targetAudience.map((audience, index) => (
                      <Badge key={index} variant="outline" className="text-xs bg-green-50 text-green-700 border-green-200">
                        {audience}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">Not specified</span>
                  )}
                </div>
              </div>
              
              {/* Tags */}
              <div>
                <h4 className="font-medium mb-2 text-sm uppercase tracking-wide text-muted-foreground">Tags</h4>
                <div className="flex flex-wrap gap-1">
                  {topic.tags && topic.tags.length > 0 ? (
                    topic.tags.map((tag, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {tag}
                      </Badge>
                    ))
                  ) : (
                    <span className="text-sm text-muted-foreground">No tags</span>
                  )}
                </div>
              </div>
              
              {/* Dates */}
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2 text-sm uppercase tracking-wide text-muted-foreground">Created</h4>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    {topic.createdAt ? formatDate(topic.createdAt, { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    }) : 'Unknown'}
                  </p>
                </div>
                <div>
                  <h4 className="font-medium mb-2 text-sm uppercase tracking-wide text-muted-foreground">Updated</h4>
                  <p className="text-sm text-muted-foreground flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    {topic.updatedAt ? formatDate(topic.updatedAt, { 
                      month: 'short', 
                      day: 'numeric', 
                      year: 'numeric' 
                    }) : 'Unknown'}
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Course Modules with Accordion */}
        {topic.modules && topic.modules.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BookOpen className="h-5 w-5" />
                Course Modules ({topic.modules.length})
              </CardTitle>
              <CardDescription>
                Click on modules to view content and videos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {topic.modules.map((module, index) => (
                  <Collapsible
                    key={module.id}
                    open={expandedModules.includes(module.id)}
                    onOpenChange={() => toggleModuleExpansion(module.id)}
                  >
                    <Card className="border-2">
                      <CollapsibleTrigger asChild>
                        <CardHeader className="cursor-pointer hover:bg-gray-50 transition-colors">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <Badge variant="outline" className="text-sm">
                                Module {module.order || index + 1}
                              </Badge>
                              <div className="text-left">
                                <h4 className="font-medium">
                                  {module.title || 'Untitled Module'}
                                </h4>
                                <p className="text-sm text-muted-foreground">
                                  {module.videos?.length || 0} video{(module.videos?.length || 0) !== 1 ? 's' : ''}
                                  {(module.videos?.length || 0) > 0 && (
                                    <span className="ml-2">
                                      • {module.videos?.reduce((sum, video) => sum + (parseInt(video.duration?.toString() || '0') || 0), 0) || 0} min total
                                    </span>
                                  )}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {expandedModules.includes(module.id) ? (
                                <ChevronUp className="h-4 w-4" />
                              ) : (
                                <ChevronDown className="h-4 w-4" />
                              )}
                            </div>
                          </div>
                        </CardHeader>
                      </CollapsibleTrigger>
                      
                      <CollapsibleContent>
                        <CardContent className="pt-0">
                          <div className="space-y-4">
                            {/* Module Description */}
                            {module.description && (
                              <div>
                                <h5 className="font-medium mb-2">Description</h5>
                                <RichTextDisplay 
                                  content={module.description} 
                                  className="text-sm text-muted-foreground mb-4"
                                />
                              </div>
                            )}

                            {/* Module Videos */}
                            {(module.videos?.length || 0) > 0 ? (
                              <div>
                                <h5 className="font-medium mb-3 flex items-center gap-2">
                                  <PlayCircle className="h-4 w-4" />
                                  Videos ({module.videos?.length || 0})
                                </h5>
                                <div className="space-y-2">
                                  {(module.videos || []).map((video, videoIndex) => (
                                    <div 
                                      key={video.id} 
                                      className="flex items-center justify-between bg-white p-3 rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all cursor-pointer"
                                      onClick={() => handleVideoClick(video)}
                                    >
                                      <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-sm font-medium text-blue-600 flex-shrink-0">
                                          <PlayCircle className="w-5 h-5" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                          <h6 className="font-medium text-sm truncate">
                                            {video.title}
                                          </h6>
                                          {video.description && (
                                            <p className="text-xs text-muted-foreground mt-1 line-clamp-2">
                                              {video.description}
                                            </p>
                                          )}
                                        </div>
                                      </div>
                                      <div className="flex items-center gap-2 text-muted-foreground flex-shrink-0">
                                        <Clock className="w-3 h-3" />
                                        <span className="text-sm">{video.duration?.toString() || '0'} min</span>
                                      </div>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ) : (
                              <div className="text-center py-6 bg-gray-50 rounded-lg border-2 border-dashed">
                                <PlayCircle className="h-8 w-8 mx-auto text-gray-400 mb-2" />
                                <p className="text-gray-500 text-sm">No videos in this module</p>
                              </div>
                            )}
                          </div>
                        </CardContent>
                      </CollapsibleContent>
                    </Card>
                  </Collapsible>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Video Modal */}
        {selectedVideo && (
          <VideoModal
            isOpen={isVideoModalOpen}
            onClose={closeVideoModal}
            video={selectedVideo}
          />
        )}
      </div>
    </PageContainer>
  );
}
