'use client';

import { useState, useEffect } from 'react';
import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Search, Plus, Edit, Trash2, Eye, FileText, Loader2, RefreshCw, Globe, Calendar } from 'lucide-react';
import { TermsModal } from '@/components/modal/terms-modal';
import { DeleteTermsModal } from '@/components/modal/delete-terms-modal';
import { RichTextDisplay } from '@/components/ui/rich-text-display';
import { toast } from '@/lib/toast';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';

interface TermsAndConditions {
  id: number;
  title: string;
  content: string;
  version: string;
  language: string;
  status: 'Draft' | 'Published' | 'Archived' | 'Active';
  effectiveDate?: string;
  createdAt: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

interface Stats {
  total: number;
  draft: number;
  published: number;
  archived: number;
  languages: number;
  latestVersion: string;
}

export default function TermsPage() {
  const [terms, setTerms] = useState<TermsAndConditions[]>([]);
  const [stats, setStats] = useState<Stats>({
    total: 0,
    draft: 0,
    published: 0,
    archived: 0,
    languages: 0,
    latestVersion: '1.0'
  });
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [languageFilter, setLanguageFilter] = useState('all');
  
  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [selectedTerms, setSelectedTerms] = useState<TermsAndConditions | null>(null);
  const [termsToDelete, setTermsToDelete] = useState<TermsAndConditions | null>(null);

  // Fetch terms from API
  const fetchTerms = async () => {
    try {
      setLoading(true);
      const params: Record<string, string> = {};
      if (searchTerm) params.search = searchTerm;
      if (statusFilter !== 'all') params.status = statusFilter;
      if (languageFilter !== 'all') params.language = languageFilter;
      
      const result = await apiService.get(API_ENDPOINTS.TERMS.BASE, { params });
      
      // Debug logging to check the response structure
      console.log('🔍 Terms API Response:', result);
      console.log('📊 Response data:', result.data);
      console.log('📈 Response stats:', result.stats);
      
      if (result.success) {
        const termsData = Array.isArray(result.data) ? result.data : [];
        setTerms(termsData);
        
        // Use stats from API response if available, otherwise calculate from data
        const statsData = {
          total: result.stats?.total || result.meta?.total || termsData.length,
          draft: result.stats?.draft || termsData.filter((term: TermsAndConditions) => term.status === 'Draft').length,
          published: result.stats?.published || termsData.filter((term: TermsAndConditions) => 
            term.status === 'Published' || term.status === 'Active'
          ).length,
          archived: result.stats?.archived || termsData.filter((term: TermsAndConditions) => term.status === 'Archived').length,
          languages: result.stats?.languages || new Set(termsData.map((term: TermsAndConditions) => term.language)).size,
          latestVersion: result.stats?.latestVersion || (termsData.length > 0 
            ? Math.max(...termsData.map((term: TermsAndConditions) => parseFloat(term.version) || 1.0)).toFixed(1) 
            : '1.0')
        };
        
        setStats(statsData);
      } else {
        toast.error('Failed to fetch terms and conditions. Please try again.');
        console.error('Failed to fetch terms:', result.error);
      }
    } catch (error) {
      toast.error('Network error. Please check your connection.');
      console.error('Error fetching terms:', error);
      // Set empty arrays to prevent errors
      setTerms([]);
      setStats({
        total: 0,
        draft: 0,
        published: 0,
        archived: 0,
        languages: 0,
        latestVersion: '1.0'
      });
    } finally {
      setLoading(false);
    }
  };

  // Create or update terms
  const handleSaveTerms = async (termsData: Omit<TermsAndConditions, 'id' | 'createdAt' | 'updatedAt' | 'createdBy' | 'updatedBy'>) => {
    try {
      if (selectedTerms) {
        // Update existing terms
        const result = await apiService.put(API_ENDPOINTS.TERMS.BY_ID(selectedTerms.id), termsData);
        
        if (result.success) {
          await fetchTerms(); // Refresh the list
          setIsEditModalOpen(false);
          setSelectedTerms(null);
          toast.success('Terms and conditions updated successfully');
        } else {
          toast.error(result.error || 'Failed to update terms and conditions');
          throw new Error(result.error);
        }
      } else {
        // Create new terms
        const result = await apiService.post(API_ENDPOINTS.TERMS.BASE, termsData);
        
        if (result.success) {
          await fetchTerms(); // Refresh the list
          setIsAddModalOpen(false);
          toast.success('Terms and conditions created successfully');
        } else {
          toast.error(result.error || 'Failed to create terms and conditions');
          throw new Error(result.error);
        }
      }
    } catch (error) {
      console.error('Error saving terms:', error);
      throw error; // Re-throw to handle in modal
    }
  };

  // Delete terms
  const handleDeleteTerms = async () => {
    if (!termsToDelete) return;
    
    try {
      const result = await apiService.delete(API_ENDPOINTS.TERMS.BY_ID(termsToDelete.id));
      
      if (result.success) {
        await fetchTerms(); // Refresh the list
        setIsDeleteModalOpen(false);
        setTermsToDelete(null);
        toast.success('Terms and conditions deleted successfully');
      } else {
        toast.error(result.error || 'Failed to delete terms and conditions');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      console.error('Error deleting terms:', error);
    }
  };

  // Publish terms
  const handlePublishTerms = async (termsId: number) => {
    try {
      const result = await apiService.post(API_ENDPOINTS.TERMS.PUBLISH(termsId), {
        effectiveDate: new Date().toISOString().split('T')[0]
      });
      
      if (result.success) {
        await fetchTerms(); // Refresh the list
        toast.success('Terms and conditions published successfully');
      } else {
        toast.error(result.error || 'Failed to publish terms and conditions');
      }
    } catch (error) {
      toast.error('Network error. Please try again.');
      console.error('Error publishing terms:', error);
    }
  };

  // Initialize data
  useEffect(() => {
    fetchTerms();
  }, [searchTerm, statusFilter, languageFilter]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Published': 
      case 'Active': return 'bg-green-100 text-green-800';     
      case 'Draft': return 'bg-yellow-100 text-yellow-800';
      case 'Archived': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <PageContainer>
      <div className='space-y-4'>
        <Breadcrumbs />
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Terms and Conditions</h1>
            <p className='text-muted-foreground'>
              Manage the terms and conditions content for your platform
            </p>
          </div>
          <Button onClick={() => setIsAddModalOpen(true)} className='flex items-center gap-2'>
            <Plus className='h-4 w-4' />
            Add New Terms
          </Button>
        </div>

        {/* Stats Cards */}
        <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-6'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-2'>
                <FileText className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Total</p>
                  <p className='text-2xl font-bold'>{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-2'>
                <div className='h-2 w-2 bg-green-500 rounded-full' />
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Published</p>
                  <p className='text-2xl font-bold'>{stats.published}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-2'>
                <div className='h-2 w-2 bg-yellow-500 rounded-full' />
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Draft</p>
                  <p className='text-2xl font-bold'>{stats.draft}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-2'>
                <div className='h-2 w-2 bg-gray-500 rounded-full' />  
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Archived</p>
                  <p className='text-2xl font-bold'>{stats.archived}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-2'>
                <Globe className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Languages</p>
                  <p className='text-2xl font-bold'>{stats.languages}</p>
                </div>
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center space-x-2'>
                <Calendar className='h-4 w-4 text-muted-foreground' />
                <div>
                  <p className='text-sm font-medium text-muted-foreground'>Latest Version</p>
                  <p className='text-2xl font-bold'>{stats.latestVersion}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Card>
          <CardHeader>
            <div className='flex items-center justify-between'>
              <div>
                <CardTitle>Terms and Conditions Management</CardTitle>
                <CardDescription>Create, edit, and manage your platform's terms and conditions</CardDescription>
              </div>
              <Button
                variant='outline'
                onClick={fetchTerms}
                disabled={loading}
                className='flex items-center gap-2'
              >
                <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
                Refresh
              </Button>
            </div>
            
            {/* Filters */}
            <div className='flex flex-col sm:flex-row gap-4'>
              <div className='flex-1'>
                <div className='relative'>
                  <Search className='absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4' />
                  <Input
                    placeholder='Search terms and conditions...'
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className='pl-10'
                  />
                </div>
              </div>
              <div className='flex gap-2'>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='Filter by status' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Status</SelectItem>
                    <SelectItem value='Published'>Published</SelectItem>
                    <SelectItem value='Active'>Active</SelectItem>
                    <SelectItem value='Draft'>Draft</SelectItem>
                    <SelectItem value='Archived'>Archived</SelectItem>
                  </SelectContent>
                </Select>
                
                <Select value={languageFilter} onValueChange={setLanguageFilter}>
                  <SelectTrigger className='w-[140px]'>
                    <SelectValue placeholder='Filter by language' />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value='all'>All Languages</SelectItem>
                    <SelectItem value='en'>English</SelectItem>
                    <SelectItem value='es'>Spanish</SelectItem>
                    <SelectItem value='fr'>French</SelectItem>
                    <SelectItem value='de'>German</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className='flex items-center justify-center py-10'>
                <Loader2 className='h-6 w-6 animate-spin' />
                <span className='ml-2'>Loading terms and conditions...</span>
              </div>
            ) : terms.length === 0 ? (
              <div className='text-center py-10'>
                <FileText className='h-12 w-12 text-muted-foreground mx-auto mb-4' />
                <p className='text-lg font-medium text-muted-foreground mb-2'>No terms and conditions found</p>
                <p className='text-sm text-muted-foreground'>
                  {searchTerm || statusFilter !== 'all' || languageFilter !== 'all'
                    ? 'No terms and conditions found matching your filters.' 
                    : 'No terms and conditions found. Create your first terms and conditions!'}
                </p>
              </div>
            ) : (
              <div className='space-y-4'>
                {terms && terms.length > 0 && terms.map((termItem) => (
                  <div key={termItem.id} className='flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50'>
                    <div className='flex items-center space-x-4'>
                      <div className='p-2 bg-blue-100 rounded-lg'>
                        <FileText className='h-6 w-6 text-blue-600' />
                      </div>
                      <div>
                        <p className='font-medium'>{termItem.title}</p>
                        <div className='text-sm text-muted-foreground line-clamp-2'>
                          <RichTextDisplay 
                            content={termItem.content.substring(0, 150) + '...'} 
                            className="prose-sm"
                          />
                        </div>
                        <div className='flex items-center gap-2 mt-1'>
                          <p className='text-xs text-muted-foreground'>
                            Version: {termItem.version}
                          </p>
                          <span className='text-xs text-muted-foreground'>•</span>
                          <p className='text-xs text-muted-foreground'>
                            Language: {termItem.language.toUpperCase()}
                          </p>
                          {termItem.effectiveDate && (
                            <>
                              <span className='text-xs text-muted-foreground'>•</span>
                              <p className='text-xs text-muted-foreground'>
                                Effective: {new Date(termItem.effectiveDate).toLocaleDateString()}
                              </p>
                            </>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className='flex items-center space-x-3'>
                      <Badge variant='secondary' className={getStatusColor(termItem.status)}>
                        {termItem.status}
                      </Badge>
                      <div className='flex items-center space-x-2'>
                        {termItem.status === 'Draft' && (
                          <Button
                            variant='outline'
                            size='sm'
                            onClick={() => handlePublishTerms(termItem.id)}
                            className='flex items-center gap-1'
                          >
                            <Eye className='h-3 w-3' />
                            Publish
                          </Button>
                        )}
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setSelectedTerms(termItem);
                            setIsEditModalOpen(true);
                          }}
                        >
                          <Edit className='h-4 w-4' />
                        </Button>
                        <Button
                          variant='outline'
                          size='sm'
                          onClick={() => {
                            setTermsToDelete(termItem);
                            setIsDeleteModalOpen(true);
                          }}
                        >
                          <Trash2 className='h-4 w-4' />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Modals */}
        <TermsModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          onSave={handleSaveTerms}
          terms={null}
        />

        <TermsModal
          isOpen={isEditModalOpen}
          onClose={() => {
            setIsEditModalOpen(false);
            setSelectedTerms(null);
          }}
          onSave={handleSaveTerms}
          terms={selectedTerms}
        />

        <DeleteTermsModal
          isOpen={isDeleteModalOpen}
          onClose={() => {
            setIsDeleteModalOpen(false);
            setTermsToDelete(null);
          }}
          onConfirm={handleDeleteTerms}
          termsTitle={termsToDelete?.title || ''}
        />
      </div>
    </PageContainer>
  );
}
