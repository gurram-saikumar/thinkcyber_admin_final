'use client';

import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/lib/toast';
import { Save, Upload, Loader2, Plus, Edit, Trash2, RefreshCw, X } from 'lucide-react';
import { useState, useRef, useEffect } from 'react';
import { apiService } from '@/lib/api-service';
import { API_ENDPOINTS } from '@/constants/api-endpoints';
import { 
  HomepageContentResponse, 
  HomepageContentRequest, 
  FAQRequest, 
  FAQResponse,
  UpdateFAQRequest,
  GetHomepageResponse,
  CreateHomepageResponse,
  CreateFAQResponse,
  UpdateFAQResponse,
  DeleteFAQResponse
} from '@/types/homepage-api';

interface FAQ {
  id: string;
  question: string;
  answer: string;
  order?: number;
  isActive?: boolean;
}

interface HomepageContent {
  hero: {
    title: string;
    subtitle: string;
    backgroundImage?: string;
    ctaText?: string;
    ctaLink?: string;
  };
  about: {
    title: string;
    content: string;
    image?: string;
    features?: string[];
  };
  contact: {
    email: string;
    phone: string;
    address: string;
    hours: string;
    description: string;
    supportEmail: string;
    salesEmail: string;
    socialLinks?: {
      facebook?: string;
      twitter?: string;
      linkedin?: string;
      instagram?: string;
    };
  };
  faqs: FAQ[];
}

export default function HomePageMaster() {
  const [isSaving, setIsSaving] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [hasChanges, setHasChanges] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // Initialize with empty structure - data will be loaded from API
  const initialData: HomepageContent = {
    hero: {
      title: '',
      subtitle: '',
      backgroundImage: '',
      ctaText: '',
      ctaLink: '',
    },
    about: {
      title: '',
      content: '',
      image: '',
      features: [],
    },
    contact: {
      email: '',
      phone: '',
      address: '',
      hours: '',
      description: '',
      supportEmail: '',
      salesEmail: '',
      socialLinks: {
        facebook: '',
        twitter: '',
        linkedin: '',
        instagram: '',
      },
    },
    faqs: [],
  };

  // Store original data to track changes - no static data
  const originalDataRef = useRef<HomepageContent>(initialData);
  
  // State for managing content (will be populated from API)
  const [contentData, setContentData] = useState<HomepageContent>(initialData);
  
  // FAQ editing states
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [editingFaqData, setEditingFaqData] = useState<{question: string, answer: string}>({question: '', answer: ''});
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [newFaq, setNewFaq] = useState<FAQ>({ id: '', question: '', answer: '' });

  // File upload refs
  const aboutImageInputRef = useRef<HTMLInputElement>(null);
  const heroImageInputRef = useRef<HTMLInputElement>(null);

  // Load data from API on component mount
  useEffect(() => {
    loadHomepageData();
  }, []);

  const loadHomepageData = async () => {
    setIsLoading(true);
    setError(null);
    
    try {
      // Fetch homepage content via external API
      const result = await apiService.get(API_ENDPOINTS.HOMEPAGE.BY_LANGUAGE('en'));
      
      if (result.success && result.data) {
        const homepageData = result.data;
        
        console.log('API Response - About Image:', homepageData.about?.image);
        console.log('Full API Response:', homepageData);
        
        // Transform API response to component state format
        const transformedData: HomepageContent = {
          hero: {
            title: homepageData.hero.title || '',
            subtitle: homepageData.hero.subtitle || '',
            backgroundImage: homepageData.hero.backgroundImage || '',
            ctaText: homepageData.hero.ctaText || '',
            ctaLink: homepageData.hero.ctaLink || '',
          },
          about: {
            title: homepageData.about.title || '',
            content: homepageData.about.content || '',
            image: homepageData.about.image || '',
            features: homepageData.about.features || [],
          },
          contact: {
            email: homepageData.contact.email || '',
            phone: homepageData.contact.phone || '',
            address: homepageData.contact.address || '',
            hours: homepageData.contact.hours || '',
            description: homepageData.contact.description || '',
            supportEmail: homepageData.contact.supportEmail || '',
            salesEmail: homepageData.contact.salesEmail || '',
            socialLinks: homepageData.contact.socialLinks || {},
          },
          faqs: homepageData.faqs.map((faq: any) => ({
            id: faq.id || '',
            question: faq.question || '',
            answer: faq.answer || '',
            order: faq.order || 0,
            isActive: faq.isActive ?? true,
          })),
        };
        
        console.log('Transformed Data - About Image:', transformedData.about.image);
        
        // Clean up any blob URLs from database (they're invalid after page reload)
        if (transformedData.about.image && transformedData.about.image.startsWith('blob:')) {
          console.warn('Found blob URL in database, clearing it:', transformedData.about.image);
          transformedData.about.image = '';
        }
        if (transformedData.hero.backgroundImage && transformedData.hero.backgroundImage.startsWith('blob:')) {
          console.warn('Found blob URL in database, clearing it:', transformedData.hero.backgroundImage);
          transformedData.hero.backgroundImage = '';
        }
        
        // Update both current and original data
        setContentData(transformedData);
        originalDataRef.current = JSON.parse(JSON.stringify(transformedData));
        setHasChanges(false);
        toast.success('Homepage data loaded successfully!');
      } else {
        setError('Failed to load homepage data');
        toast.error('Failed to load homepage data');
        console.error('API Error:', result.error);
      }
    } catch (error) {
      console.error('Error loading homepage data:', error);
      const errorMessage = 'Failed to load homepage data. Please try again.';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  // Update content for specific field
  const updateContent = (section: string, field: string, value: string) => {
    setContentData(prev => {
      const updated = {
        ...prev,
        [section]: {
          ...prev[section as keyof typeof prev],
          [field]: value
        }
      };
      
      // Check if data has changed
      const originalData = JSON.stringify(originalDataRef.current);
      const currentData = JSON.stringify(updated);
      setHasChanges(originalData !== currentData);
      
      return updated;
    });
  };

  // Handle file uploads
  const handleFileUpload = async (section: string, field: string, file: File) => {
    if (!file) return;

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      toast.error('Please select a valid image file (JPEG, PNG, or WebP)');
      return;
    }

    // Validate file size (max 5MB)
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      toast.error('File size must be less than 5MB');
      return;
    }

    try {
      // Show loading toast
      toast.info('Uploading image...');
      
      // Create FormData for file upload
      const formData = new FormData();
      formData.append('file', file);
      formData.append('section', section);
      formData.append('field', field);
      
      // Upload file to server using apiService
      const uploadResult = await apiService.post(API_ENDPOINTS.UPLOAD.BASE, formData);
      
      if (uploadResult.success && uploadResult.data?.url) {
        // Update content with the permanent URL
        updateContent(section, field, uploadResult.data.url);
        toast.success(`${file.name} uploaded successfully!`);
      } else {
        // Fallback to blob URL for preview (temporary)
        const fileUrl = URL.createObjectURL(file);
        updateContent(section, field, fileUrl);
        toast.warning(`${file.name} selected for preview. Note: Upload API not available, using temporary preview.`);
      }
    } catch (error) {
      console.error('Upload error:', error);
      // Fallback to blob URL for preview
      const fileUrl = URL.createObjectURL(file);
      updateContent(section, field, fileUrl);
      toast.warning(`${file.name} selected for preview. Upload failed, using temporary preview.`);
    }
  };

  const triggerFileUpload = (inputRef: React.RefObject<HTMLInputElement | null>) => {
    inputRef.current?.click();
  };

  // FAQ management functions
  const addFaq = async () => {
    if (!newFaq.question || !newFaq.answer) {
      toast.warning('Please fill in both question and answer fields');
      return;
    }
    
    try {
      const faqRequest: FAQRequest = {
        question: newFaq.question,
        answer: newFaq.answer,
        order: contentData.faqs.length + 1,
        isActive: true,
        language: 'en', // Default language
      };

      const result = await apiService.post(API_ENDPOINTS.HOMEPAGE.FAQS, faqRequest);

      if (result.success && result.data) {
        const faqData = result.data;
        // Add the new FAQ to the local state
        setContentData(prev => ({
          ...prev,
          faqs: [...prev.faqs, {
            id: faqData.id,
            question: faqData.question,
            answer: faqData.answer,
            order: faqData.order,
            isActive: faqData.isActive,
          }]
        }));
        
        setNewFaq({ id: '', question: '', answer: '' });
        setIsAddingFaq(false);
        setHasChanges(true);
        toast.success('FAQ added successfully!');
      } else {
        toast.error(result.error || 'Failed to add FAQ');
      }
    } catch (error) {
      console.error('Error adding FAQ:', error);
      toast.error('Failed to add FAQ. Please try again.');
      setError('Failed to add FAQ. Please try again.');
    }
  };

  // Start editing FAQ - populate local edit state
  const startEditingFaq = (faq: FAQ) => {
    setEditingFaqId(faq.id);
    setEditingFaqData({
      question: faq.question,
      answer: faq.answer
    });
  };

  // Save FAQ edits - make API call and update local state
  const saveEditingFaq = async () => {
    if (!editingFaqId) return;

    try {
      const cleanId = editingFaqId.replace(/^faq_/, '');
      
      // Update question if changed
      const originalFaq = contentData.faqs.find(f => f.id === editingFaqId);
      if (originalFaq?.question !== editingFaqData.question) {
        const result = await apiService.put(API_ENDPOINTS.HOMEPAGE.FAQ_BY_ID(cleanId), {
          question: editingFaqData.question
        });
        if (!result.success) {
          toast.error(result.error || 'Failed to update FAQ question');
          return;
        }
      }

      // Update answer if changed
      if (originalFaq?.answer !== editingFaqData.answer) {
        const result = await apiService.put(API_ENDPOINTS.HOMEPAGE.FAQ_BY_ID(cleanId), {
          answer: editingFaqData.answer
        });
        if (!result.success) {
          toast.error(result.error || 'Failed to update FAQ answer');
          return;
        }
      }

      // Update local state
      setContentData(prev => ({
        ...prev,
        faqs: prev.faqs.map(f => 
          f.id === editingFaqId ? { 
            ...f, 
            question: editingFaqData.question, 
            answer: editingFaqData.answer 
          } : f
        )
      }));
      
      setHasChanges(true);
      setEditingFaqId(null);
      setEditingFaqData({question: '', answer: ''});
      toast.success('FAQ updated successfully!');
    } catch (error) {
      console.error('Error updating FAQ:', error);
      toast.error('Failed to update FAQ. Please try again.');
    }
  };

  // Cancel editing FAQ
  const cancelEditingFaq = () => {
    setEditingFaqId(null);
    setEditingFaqData({question: '', answer: ''});
  };

  const deleteFaq = async (faqId: string) => {
    try {
      // Extract numeric ID by removing the "faq_" prefix if it exists
      const cleanId = faqId.replace(/^faq_/, '');
      const result = await apiService.delete(API_ENDPOINTS.HOMEPAGE.FAQ_BY_ID(cleanId));

      if (result.success) {
        // Remove from local state
        setContentData(prev => ({
          ...prev,
          faqs: prev.faqs.filter(faq => faq.id !== faqId)
        }));
        setHasChanges(true);
        toast.success('FAQ deleted successfully!');
      } else {
        toast.error(result.error || 'Failed to delete FAQ');
      }
    } catch (error) {
      console.error('Error deleting FAQ:', error);
      toast.error('Failed to delete FAQ. Please try again.');
      setError('Failed to delete FAQ. Please try again.');
    }
  };

  // Save function with proper API integration
  const handleSaveAllChanges = async () => {
    setIsSaving(true);
    setError(null);
    
    try {
      if (!hasChanges) {
        toast.info('No changes to save');
        console.log('No changes detected');
        return;
      }

      console.log('Saving changes...');
      
      // Prepare the request data according to API types
      const requestData: HomepageContentRequest = {
        language: 'en',
        hero: {
          title: contentData.hero.title,
          subtitle: contentData.hero.subtitle,
          backgroundImage: contentData.hero.backgroundImage,
          ctaText: contentData.hero.ctaText,
          ctaLink: contentData.hero.ctaLink,
        },
        about: {
          title: contentData.about.title,
          content: contentData.about.content,
          image: contentData.about.image,
          features: contentData.about.features,
        },
        contact: {
          email: contentData.contact.email,
          phone: contentData.contact.phone,
          address: contentData.contact.address,
          hours: contentData.contact.hours,
          description: contentData.contact.description,
          supportEmail: contentData.contact.supportEmail,
          salesEmail: contentData.contact.salesEmail,
          socialLinks: contentData.contact.socialLinks,
        },
        faqs: contentData.faqs.map(faq => ({
          id: faq.id,
          question: faq.question,
          answer: faq.answer,
          order: faq.order,
          isActive: faq.isActive,
        })),
      };
      
      // Send update request to API using the CONTENT endpoint for PUT method
      const result = await apiService.post(API_ENDPOINTS.HOMEPAGE.CONTENT, requestData);
      
      if (result.success) {
        console.log('Successfully saved data:', result.data);
        
        // Update original data reference to reflect saved state
        originalDataRef.current = JSON.parse(JSON.stringify(contentData));
        setHasChanges(false);
        
        // Show success toast message
        toast.success('Homepage content saved successfully!');
      } else {
        toast.error(result.error || 'Failed to save homepage content');
        throw new Error(result.error || 'Failed to save data');
      }
      
    } catch (error) {
      console.error('Error saving changes:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to save changes';
      toast.error(errorMessage);
      setError(errorMessage);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <PageContainer>
      <div className='space-y-4'>
        <Breadcrumbs />
        
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold tracking-tight'>Home Page Management</h1>
            <p className='text-muted-foreground'>
              Configure the main homepage content and layout
              {hasChanges && (
                <span className="ml-2 text-orange-600 font-medium">
                  (Modified)
                </span>
              )}
              {error && (
                <span className="ml-2 text-red-600 font-medium">
                  ⚠️ {error}
                </span>
              )}
            </p>
          </div>
          <div className='flex space-x-2'>
            <Button 
              onClick={loadHomepageData}
              disabled={isLoading}
              variant="outline"
            >
              {isLoading ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Loading...
                </>
              ) : (
                <>
                  <RefreshCw className='mr-2 h-4 w-4' />
                  Refresh
                </>
              )}
            </Button>
            <Button 
              onClick={handleSaveAllChanges}
              disabled={!hasChanges || isSaving || isLoading}
              className={hasChanges ? 'bg-orange-600 hover:bg-orange-700' : ''}
            >
              {isSaving ? (
                <>
                  <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                  Saving...
                </>
              ) : (
                <>
                  <Save className='mr-2 h-4 w-4' />
                  {hasChanges ? 'Save Changes' : 'No Changes'}
                </>
              )}
            </Button>
          </div>
        </div>

        <div className="space-y-6">
          {isLoading ? (
            // Loading skeleton
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              {[...Array(4)].map((_, index) => (
                <Card key={index}>
                  <CardHeader>
                    <div className="h-4 bg-gray-200 rounded animate-pulse mb-2"></div>
                    <div className="h-3 bg-gray-100 rounded animate-pulse w-2/3"></div>
                  </CardHeader>
                  <CardContent className='space-y-4'>
                    <div className="space-y-3">
                      <div className="h-3 bg-gray-100 rounded animate-pulse"></div>
                      <div className="h-20 bg-gray-100 rounded animate-pulse"></div>
                      <div className="h-3 bg-gray-100 rounded animate-pulse w-1/2"></div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : (
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            {/* Hero Section */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Hero Section</CardTitle>
                  <CardDescription>Main banner and call-to-action area</CardDescription>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor="hero-title">Hero Title</Label>
                  <Input 
                    id="hero-title" 
                    value={contentData.hero.title}
                    onChange={(e) => updateContent('hero', 'title', e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor="hero-subtitle">Hero Subtitle</Label>
                  <Textarea 
                    id="hero-subtitle"  
                    value={contentData.hero.subtitle}
                    onChange={(e) => updateContent('hero', 'subtitle', e.target.value)}
                    className='min-h-[120px]'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor="hero-bg-image">Background Image</Label>
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                    <input
                      type="file"
                      ref={heroImageInputRef}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await handleFileUpload('hero', 'backgroundImage', file);
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    {contentData.hero.backgroundImage ? (
                      <div className="space-y-2">
                        <img 
                          src={contentData.hero.backgroundImage} 
                          alt="Hero background preview" 
                          className="mx-auto h-24 w-24 object-cover rounded"
                        />
                        <p className='text-sm text-green-600'>Image selected</p>
                      </div>
                    ) : (
                      <>
                        <Upload className='mx-auto h-12 w-12 text-gray-400' />
                        <p className='mt-2 text-sm text-gray-600'>Upload hero background image</p>
                      </>
                    )}
                    <Button 
                      variant='outline' 
                      className='mt-2'
                      onClick={() => triggerFileUpload(heroImageInputRef)}
                      type="button"
                    >
                      Choose File
                    </Button>
                  </div>
                </div> 
              </CardContent>
            </Card>

            {/* About Section */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>About Section</CardTitle>
                  <CardDescription>Brief introduction about the platform</CardDescription>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='space-y-2'>
                  <Label htmlFor="about-title">About Title</Label>
                  <Input 
                    id="about-title" 
                    value={contentData.about.title}
                    onChange={(e) => updateContent('about', 'title', e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor="about-content">About Content</Label>
                  <Textarea 
                    id="about-content" 
                    value={contentData.about.content}
                    onChange={(e) => updateContent('about', 'content', e.target.value)}
                    className='min-h-[120px]'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor="about-image">About Image</Label>
                  <div className='border-2 border-dashed border-gray-300 rounded-lg p-6 text-center'>
                    <input
                      type="file"
                      ref={aboutImageInputRef}
                      onChange={async (e) => {
                        const file = e.target.files?.[0];
                        if (file) {
                          await handleFileUpload('about', 'image', file);
                        }
                      }}
                      accept="image/*"
                      className="hidden"
                    />
                    {contentData.about.image ? (
                      <div className="space-y-2">
                        <img 
                          src={contentData.about.image} 
                          alt="About section preview" 
                          className="mx-auto h-24 w-24 object-cover rounded"
                          onError={(e) => {
                            console.error('Image failed to load:', contentData.about.image);
                            // Hide the broken image and show placeholder
                            e.currentTarget.style.display = 'none';
                            const parent = e.currentTarget.parentElement;
                            if (parent) {
                              const errorMsg = parent.querySelector('.error-placeholder');
                              if (!errorMsg) {
                                const placeholder = document.createElement('div');
                                placeholder.className = 'error-placeholder flex items-center justify-center h-24 w-24 mx-auto bg-gray-100 border-2 border-dashed border-gray-300 rounded';
                                placeholder.innerHTML = '<span class="text-xs text-red-500">Image not found</span>';
                                parent.insertBefore(placeholder, e.currentTarget);
                              }
                            }
                          }}
                          onLoad={() => {
                            console.log('Image loaded successfully:', contentData.about.image);
                          }}
                        />
                        <p className='text-sm text-green-600'>
                          {contentData.about.image.startsWith('blob:') ? 'New image selected (temporary)' : 'Image loaded from server'}
                        </p>
                        <p className='text-xs text-gray-500 break-all'>
                          {contentData.about.image.startsWith('blob:') 
                            ? 'Save changes to upload permanently' 
                            : `URL: ${contentData.about.image.substring(0, 50)}${contentData.about.image.length > 50 ? '...' : ''}`
                          }
                        </p>
                        {contentData.about.image.startsWith('blob:') && (
                          <p className='text-xs text-orange-600'>
                            ⚠️ This is a temporary preview. Click "Save Changes" to upload permanently.
                          </p>
                        )}
                      </div>
                    ) : (
                      <>
                        <Upload className='mx-auto h-12 w-12 text-gray-400' />
                        <p className='mt-2 text-sm text-gray-600'>Upload about section image</p>
                      </>
                    )}
                    <Button 
                      variant='outline' 
                      className='mt-2'
                      onClick={() => triggerFileUpload(aboutImageInputRef)}
                      type="button"
                    >
                      Choose File
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Contact Us Section */}
            <Card>
              <CardHeader>
                <div>
                  <CardTitle>Contact Us Section</CardTitle>
                  <CardDescription>Manage contact information and details</CardDescription>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                  <div className='space-y-2'>
                    <Label htmlFor="contact-email">Email</Label>
                    <Input 
                      id="contact-email" 
                      type="email"
                      value={contentData.contact.email}
                      onChange={(e) => updateContent('contact', 'email', e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor="contact-phone">Phone</Label>
                    <Input 
                      id="contact-phone" 
                      value={contentData.contact.phone}
                      onChange={(e) => updateContent('contact', 'phone', e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor="contact-support-email">Support Email</Label>
                    <Input 
                      id="contact-support-email" 
                      type="email"
                      value={contentData.contact.supportEmail}
                      onChange={(e) => updateContent('contact', 'supportEmail', e.target.value)}
                    />
                  </div>
                  <div className='space-y-2'>
                    <Label htmlFor="contact-sales-email">Sales Email</Label>
                    <Input 
                      id="contact-sales-email" 
                      type="email"
                      value={contentData.contact.salesEmail}
                      onChange={(e) => updateContent('contact', 'salesEmail', e.target.value)}
                    />
                  </div>
                </div>
                <div className='space-y-2'>
                  <Label htmlFor="contact-address">Address</Label>
                  <Input 
                    id="contact-address" 
                    value={contentData.contact.address}
                    onChange={(e) => updateContent('contact', 'address', e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor="contact-hours">Business Hours</Label>
                  <Input 
                    id="contact-hours" 
                    value={contentData.contact.hours}
                    onChange={(e) => updateContent('contact', 'hours', e.target.value)}
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor="contact-description">Description</Label>
                  <Textarea 
                    id="contact-description" 
                    value={contentData.contact.description}
                    onChange={(e) => updateContent('contact', 'description', e.target.value)}
                    className='min-h-[100px]'
                  />
                </div>
              </CardContent>
            </Card>

            {/* FAQ Section */}
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>FAQ Section</CardTitle>
                    <CardDescription>Manage frequently asked questions</CardDescription>
                  </div>
                  <Button
                    onClick={() => setIsAddingFaq(true)}
                    size="sm"
                    disabled={isAddingFaq}
                  >
                    <Plus className="mr-2 h-4 w-4" />
                    Add FAQ
                  </Button>
                </div>
              </CardHeader>
              <CardContent className='space-y-4'>
                {/* Add New FAQ Form */}
                {isAddingFaq && (
                  <div className="border rounded-lg p-4 bg-gray-50">
                    <div className="space-y-4">
                      <div>
                        <Label htmlFor="new-faq-question">Question</Label>
                        <Input
                          id="new-faq-question"
                          value={newFaq.question}
                          onChange={(e) => setNewFaq(prev => ({ ...prev, question: e.target.value }))}
                          placeholder="Enter FAQ question"
                        />
                      </div>
                      <div>
                        <Label htmlFor="new-faq-answer">Answer</Label>
                        <Textarea
                          id="new-faq-answer"
                          value={newFaq.answer}
                          onChange={(e) => setNewFaq(prev => ({ ...prev, answer: e.target.value }))}
                          placeholder="Enter FAQ answer"
                          className="min-h-[80px]"
                        />
                      </div>
                      <div className="flex gap-2">
                        <Button onClick={addFaq} size="sm">
                          <Save className="mr-2 h-4 w-4" />
                          Save FAQ
                        </Button>
                        <Button 
                          onClick={() => {
                            setIsAddingFaq(false);
                            setNewFaq({ id: '', question: '', answer: '' });
                          }} 
                          variant="outline" 
                          size="sm"
                        >
                          Cancel
                        </Button>
                      </div>
                    </div>
                  </div>
                )}

                {/* FAQ List */}
                <div className="space-y-2">
                  <Label>Current FAQs</Label>
                  <div className="space-y-3">
                    {contentData.faqs.map((faq: FAQ, index: number) => (
                      <div key={faq.id} className="border rounded-lg">
                        {/* FAQ Header with Actions */}
                        <div className="flex items-center justify-between p-4 border-b">
                          <div className="flex-1">
                            {editingFaqId === faq.id ? (
                              <Input
                                value={editingFaqData.question}
                                onChange={(e) => setEditingFaqData(prev => ({...prev, question: e.target.value}))}
                                className="font-medium"
                                placeholder="Enter FAQ question"
                              />
                            ) : (
                              <h4 className="font-medium text-left">{faq.question}</h4>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {editingFaqId === faq.id ? (
                              <>
                                <Button
                                  onClick={saveEditingFaq}
                                  size="sm"
                                  variant="outline"
                                >
                                  <Save className="h-4 w-4" />
                                </Button>
                                <Button
                                  onClick={cancelEditingFaq}
                                  size="sm"
                                  variant="outline"
                                >
                                  <X className="h-4 w-4" />
                                </Button>
                              </>
                            ) : (
                              <Button
                                onClick={() => startEditingFaq(faq)}
                                size="sm"
                                variant="outline"
                              >
                                <Edit className="h-4 w-4" />
                              </Button>
                            )}
                            <Button
                              onClick={() => deleteFaq(faq.id)}
                              size="sm"
                              variant="outline"
                              className="text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>
                        
                        {/* FAQ Content */}
                        <div className="p-4">
                          {editingFaqId === faq.id ? (
                            <Textarea
                              value={editingFaqData.answer}
                              onChange={(e) => setEditingFaqData(prev => ({...prev, answer: e.target.value}))}
                              className="min-h-[80px]"
                              placeholder="Enter FAQ answer"
                            />
                          ) : (
                            <p className="text-gray-700">{faq.answer}</p>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {contentData.faqs.length === 0 && (
                  <div className="text-center py-8 text-gray-500">
                    <p>No FAQs added yet. Click "Add FAQ" to get started.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
          )}
        </div>
      </div>
    </PageContainer>
  );
}
