'use client';

import { useState, useEffect, useCallback } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { 
  Search, 
  Plus, 
  Edit, 
  Trash2, 
  BookOpen, 
  Users, 
  Clock, 
  Loader2, 
  RefreshCw,
  Eye,
  Copy,
  Archive,
  Star,
  DollarSign,
  Filter,
  MoreHorizontal,
  ExternalLink
} from 'lucide-react';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import Link from 'next/link';
import { toast } from 'sonner';
import { formatDate } from '@/lib/format';
import { TopicListItem, TopicStats, TopicFilters } from '@/types/topics';

// Interface for category data from API
interface CategoryOption {
  id: string | number;
  name: string;
}

export default function TopicsPage() {
  const [topics, setTopics] = useState<TopicListItem[]>([]);
  const [categories, setCategories] = useState<CategoryOption[]>([]);
  const [stats, setStats] = useState<TopicStats>({
    totalTopics: 0,
    publishedTopics: 0,
    draftTopics: 0,
    featuredTopics: 0,
    freeTopics: 0,
    paidTopics: 0,
    totalEnrollments: 0,
    averageRating: 0,
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // Fetch categories from API
  const fetchCategories = useCallback(async () => {
    try { 
      const result = await apiService.get(API_ENDPOINTS.CATEGORIES.BASE, {
        params: { fetchAll: 'true' }
      });
      
      if (result.success && result.data) {
        const activeCategories = result.data
          .filter((cat: any) => cat.status === 'Active')
          .map((cat: any) => ({
            id: String(cat.id),
            name: cat.name
          }));
         setCategories(activeCategories);
      } else {
         setCategories([]);
      }
    } catch (error) {
       setCategories([]);
    }
  }, []);

  // Fetch topics from API
  const fetchTopics = useCallback(async () => {
    try {
      setLoading(true);
      
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (selectedCategory && selectedCategory !== 'all') params.category = selectedCategory;
      if (selectedStatus && selectedStatus !== 'all') params.status = selectedStatus;
      if (selectedDifficulty && selectedDifficulty !== 'all') params.difficulty = selectedDifficulty;
      
      const result = await apiService.get(API_ENDPOINTS.TOPICS.BASE, { params });
      
      if (result.success) {
        const topicsData = result.data || [];
        setTopics(topicsData);
        
        // Calculate stats from API response or compute from data
        const calculatedStats = {
          totalTopics: result.stats?.totalTopics || topicsData.length,
          publishedTopics: result.stats?.publishedTopics || topicsData.filter((topic: TopicListItem) => topic.status === 'published').length,
          draftTopics: result.stats?.draftTopics || topicsData.filter((topic: TopicListItem) => topic.status === 'draft').length,
          featuredTopics: result.stats?.featuredTopics || topicsData.filter((topic: TopicListItem) => topic.featured).length,
          freeTopics: result.stats?.freeTopics || topicsData.filter((topic: TopicListItem) => topic.isFree).length,
          paidTopics: result.stats?.paidTopics || topicsData.filter((topic: TopicListItem) => !topic.isFree).length,
          totalEnrollments: result.stats?.totalEnrollments || topicsData.reduce((sum: number, topic: TopicListItem) => sum + (topic.enrollmentCount || 0), 0),
          averageRating: result.stats?.averageRating || (topicsData.length > 0 
            ? topicsData.reduce((sum: number, topic: TopicListItem) => sum + (topic.rating || 0), 0) / topicsData.length 
            : 0
          ),
        };
        
         setStats(calculatedStats);
      } else {
        toast.error('Failed to fetch topics. Please try again.');
       }
    } catch (error) {
      toast.error('Network error. Please check your connection.');
     } finally {
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, selectedStatus, selectedDifficulty]);

  // Handle topic actions
  const handleDeleteTopic = async (topicId: string) => {
    if (!confirm('Are you sure you want to delete this topic? This action cannot be undone.')) {
      return;
    }

    try {
      const result = await apiService.delete(API_ENDPOINTS.TOPICS.DELETE(topicId));
      
      if (result.success) {
        toast.success('Topic deleted successfully');
        fetchTopics(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to delete topic');
      }
    } catch (error) {
      console.error('Error deleting topic:', error);
      toast.error('Failed to delete topic');
    }
  };

  const handleToggleFeatured = async (topicId: string) => {
    try {
      const topic = topics.find(t => t.id === topicId);
      if (!topic) return;

      const updateData = {
        ...topic,
        featured: !topic.featured,
      };

      const result = await apiService.put(API_ENDPOINTS.TOPICS.UPDATE(topicId), updateData);
      
      if (result.success) {
        toast.success('Topic updated successfully');
        fetchTopics(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to update topic');
      }
    } catch (error) {
      console.error('Error updating topic:', error);
      toast.error('Failed to update topic');
    }
  };

  const handleToggleStatus = async (topicId: string) => {
    try {
      const topic = topics.find(t => t.id === topicId);
      if (!topic) return;

      const newStatus = topic.status === 'published' ? 'draft' : 'published';
      const updateData = {
        ...topic,
        status: newStatus,
      };

      const result = await apiService.put(API_ENDPOINTS.TOPICS.UPDATE(topicId), updateData);
      
      if (result.success) {
        toast.success(`Topic ${newStatus === 'published' ? 'published' : 'unpublished'} successfully`);
        fetchTopics(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to update topic');
      }
    } catch (error) {
      console.error('Error updating topic:', error);
      toast.error('Failed to update topic');
    }
  };

  const handleDuplicateTopic = async (topicId: string) => {
    try {
      const topic = topics.find(t => t.id === topicId);
      if (!topic) return;

      const duplicateData = {
        ...topic,
        id: undefined, // Remove ID so a new one is generated
        title: `${topic.title} (Copy)`,
        status: 'draft',
        featured: false,
      };

      const result = await apiService.post(API_ENDPOINTS.TOPICS.CREATE, duplicateData);
      
      if (result.success) {
        toast.success('Topic duplicated successfully');
        fetchTopics(); // Refresh the list
      } else {
        toast.error(result.error || 'Failed to duplicate topic');
      }
    } catch (error) {
      console.error('Error duplicating topic:', error);
      toast.error('Failed to duplicate topic');
    }
  };

  // Load categories on component mount
  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  // Load topics on component mount and when filters change
  useEffect(() => {
    fetchTopics();
  }, [fetchTopics]);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchTopics();
    }, 300);

    return () => clearTimeout(timer);
  }, [searchTerm]);

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

  const clearFilters = () => {
    setSearchTerm('');
    setSelectedCategory('all');
    setSelectedStatus('all');
    setSelectedDifficulty('all');
  };
  return (
    <PageContainer>
      <div className='space-y-4'>
        <Breadcrumbs />
        
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Topics Management</h1>
            <p className='text-muted-foreground'>
              Manage all your educational topics and content
            </p>
          </div>
          <div className="flex space-x-2">
            <Button
              variant="outline"
              onClick={fetchTopics}
              disabled={loading}
            >
              <RefreshCw className={`mr-2 h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
              Refresh
            </Button>
            <Link href='/dashboard/topics/new'>
              <Button>
                <Plus className='mr-2 h-4 w-4' />
                New Topic
              </Button>
            </Link>
          </div>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-4'>
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Topics</CardTitle>
              <BookOpen className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loading ? '-' : stats.totalTopics}</div>
              <p className='text-xs text-muted-foreground'>
                {loading ? '-' : stats.publishedTopics} published
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Total Enrollments</CardTitle>
              <Users className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loading ? '-' : stats.totalEnrollments.toLocaleString()}</div>
              <p className='text-xs text-muted-foreground'>
                Across all topics
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Featured Topics</CardTitle>
              <Star className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>{loading ? '-' : stats.featuredTopics}</div>
              <p className='text-xs text-muted-foreground'>
                {loading ? '-' : Math.round((stats.featuredTopics / stats.totalTopics) * 100) || 0}% of total
              </p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className='flex flex-row items-center justify-between space-y-0 pb-2'>
              <CardTitle className='text-sm font-medium'>Average Rating</CardTitle>
              <Clock className='h-4 w-4 text-muted-foreground' />
            </CardHeader>
            <CardContent>
              <div className='text-2xl font-bold'>
                {loading ? '-' : (stats.averageRating ? stats.averageRating.toFixed(1) : 'N/A')}
              </div>
              <p className='text-xs text-muted-foreground'>
                {loading ? '-' : `${stats.freeTopics} free, ${stats.paidTopics} paid`}
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Topics List */}
        <Card>
          <CardHeader>
            <CardTitle>All Topics</CardTitle>
            <CardDescription>
              Manage and organize your educational topics
            </CardDescription>
            
            {/* Search and Filters */}
            <div className='flex flex-col space-y-4 sm:flex-row sm:space-y-0 sm:space-x-4'>
              <div className='relative flex-1 max-w-sm'>
                <Search className='absolute left-2 top-2.5 h-4 w-4 text-muted-foreground' />
                <Input 
                  placeholder='Search topics...' 
                  className='pl-8'
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <Button
                variant="outline"
                onClick={() => setShowFilters(!showFilters)}
                className="w-full sm:w-auto"
              >
                <Filter className="mr-2 h-4 w-4" />
                Filters
              </Button>
            </div>

            {/* Filter Controls */}
            {showFilters && (
              <div className='grid gap-4 pt-4 border-t md:grid-cols-3'>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Categories" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Categories</SelectItem>
                    {categories.map((category) => (
                      <SelectItem key={category.id} value={String(category.id)}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                <Select value={selectedStatus} onValueChange={setSelectedStatus}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="published">Published</SelectItem>
                    <SelectItem value="draft">Draft</SelectItem>
                    <SelectItem value="archived">Archived</SelectItem>
                  </SelectContent>
                </Select>

                <Select value={selectedDifficulty} onValueChange={setSelectedDifficulty}>
                  <SelectTrigger>
                    <SelectValue placeholder="All Difficulties" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Difficulties</SelectItem>
                    <SelectItem value="beginner">Beginner</SelectItem>
                    <SelectItem value="intermediate">Intermediate</SelectItem>
                    <SelectItem value="advanced">Advanced</SelectItem>
                    <SelectItem value="expert">Expert</SelectItem>
                  </SelectContent>
                </Select>

                <div className="md:col-span-3">
                  <Button variant="outline" onClick={clearFilters} className="w-full">
                    Clear Filters
                  </Button>
                </div>
              </div>
            )}
          </CardHeader>
          
          <CardContent>
            {loading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
                <span className="ml-2 text-muted-foreground">Loading topics...</span>
              </div>
            ) : topics.length === 0 ? (
              <div className="text-center py-8">
                <BookOpen className="mx-auto h-12 w-12 text-muted-foreground" />
                <p className="mt-2 text-muted-foreground">
                  {searchTerm || selectedCategory || selectedStatus || selectedDifficulty
                    ? 'No topics found matching your criteria.'
                    : 'No topics found. Create your first topic!'
                  }
                </p>
                {!searchTerm && !selectedCategory && !selectedStatus && !selectedDifficulty && (
                  <Link href="/dashboard/topics/new">
                    <Button className="mt-4">
                      <Plus className="mr-2 h-4 w-4" />
                      Create Topic
                    </Button>
                  </Link>
                )}
              </div>
            ) : (
              <div className='space-y-4'>
                {topics.map((topic) => (
                  <div key={topic.id} className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'>
                    <div className='flex items-center space-x-4'>
                      <div className='p-2 bg-blue-100 rounded-lg'>
                        <span className='text-2xl'>{topic.emoji || '📚'}</span>
                      </div>
                      <div className="flex-1">
                        <p className='font-medium'>{topic.title}</p>
                        <p className='text-sm text-muted-foreground line-clamp-2'>
                          {topic.categoryName ? (
                            <>
                              {topic.categoryName}
                              {topic.subcategoryName && ` • ${topic.subcategoryName}`}
                              {topic.duration && ` • ${topic.duration}h duration`}
                            </>
                          ) : (
                            topic.duration ? `${topic.duration}h duration` : ''
                          )}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge className={getStatusColor(topic.status)}>
                            {topic.status}
                          </Badge>
                          <Badge className={getDifficultyColor(topic.difficulty)}>
                            {topic.difficulty}
                          </Badge>
                          {topic.featured && (
                            <Badge variant="outline" className="text-yellow-600 border-yellow-300">
                              <Star className="w-3 h-3 mr-1" />
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
                      </div>
                    </div>
                    
                    <div className='flex items-center space-x-4'>
                      <div className='text-right hidden sm:block'>
                        <p className='text-sm font-medium'>{(topic.enrollmentCount || 0).toLocaleString()} enrolled</p>
                        <p className='text-xs text-muted-foreground'>
                          ⭐ {topic.rating ? topic.rating.toFixed(1) : 'N/A'} ({topic.reviewCount || 0} reviews)
                        </p>
                        <p className='text-xs text-muted-foreground'>
                          Updated: {formatDate(topic.updatedAt, { 
                            month: 'short', 
                            day: 'numeric', 
                            year: 'numeric' 
                          })}
                        </p>
                      </div>
                      
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button variant="ghost" className="h-8 w-8 p-0">
                            <span className="sr-only">Open menu</span>
                            <MoreHorizontal className="h-4 w-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end">
                          <DropdownMenuLabel>Actions</DropdownMenuLabel>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/topics/${topic.id}`}>
                              <Eye className="mr-2 h-4 w-4" />
                              View Details
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuItem asChild>
                            <Link href={`/dashboard/topics/${topic.id}/edit`}>
                              <Edit className="mr-2 h-4 w-4" />
                              Edit Topic
                            </Link>
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleToggleFeatured(topic.id)}>
                            <Star className="mr-2 h-4 w-4" />
                            {topic.featured ? 'Remove from Featured' : 'Mark as Featured'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleToggleStatus(topic.id)}>
                            <Archive className="mr-2 h-4 w-4" />
                            {topic.status === 'published' ? 'Move to Draft' : 'Publish'}
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleDuplicateTopic(topic.id)}>
                            <Copy className="mr-2 h-4 w-4" />
                            Duplicate
                          </DropdownMenuItem>
                          <DropdownMenuSeparator />
                          <DropdownMenuItem onClick={() => handleDeleteTopic(topic.id)} className="text-red-600">
                            <Trash2 className="mr-2 h-4 w-4" />
                            Delete
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
