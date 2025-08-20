'use client';

import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Save, Upload, Loader2, Plus, Edit, Trash2 } from 'lucide-react';
import { useState, useRef } from 'react';

interface FAQ {
  id: string;
  question: string;
  answer: string;
}

export default function HomePageMaster() {
  const [isSaving, setIsSaving] = useState(false);
  const [hasChanges, setHasChanges] = useState(false);
  
  // Store original data to track changes (English only)
  const originalDataRef = useRef({
    hero: {
      title: "Learn with ThinkCyber",
      subtitle: "Master cybersecurity with our comprehensive courses and expert guidance."
    },
    about: {
      title: "Why Choose ThinkCyber?",
      content: "ThinkCyber is a leading cybersecurity education platform..."
    },
    contact: {
      email: "info@thinkcyber.com",
      phone: "+1 (555) 123-4567",
      address: "123 Cyber Street, Tech City",
      hours: "Mon-Fri: 9AM - 6PM",
      description: "Get in touch with our team for any questions about cybersecurity courses, training programs, or partnership opportunities.",
      supportEmail: "support@thinkcyber.com",
      salesEmail: "sales@thinkcyber.com"
    },
    faqs: [
      {
        id: "faq-1",
        question: "What is cybersecurity?",
        answer: "Cybersecurity is the practice of protecting systems, networks, and programs from digital attacks. These cyberattacks are usually aimed at accessing, changing, or destroying sensitive information."
      },
      {
        id: "faq-2",
        question: "How long does it take to complete a course?",
        answer: "Course duration varies depending on the specific program. Most courses range from 4-12 weeks, with flexible scheduling options to accommodate your needs."
      },
      {
        id: "faq-3",
        question: "Do you provide certification?",
        answer: "Yes, we provide industry-recognized certifications upon successful completion of our courses. Our certifications are valued by employers worldwide."
      }
    ]
  });
  
  // State for managing content (English only)
  const [contentData, setContentData] = useState(originalDataRef.current);
  
  // FAQ editing states
  const [editingFaqId, setEditingFaqId] = useState<string | null>(null);
  const [isAddingFaq, setIsAddingFaq] = useState(false);
  const [newFaq, setNewFaq] = useState<FAQ>({ id: '', question: '', answer: '' });

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

  // FAQ management functions
  const addFaq = () => {
    if (!newFaq.question || !newFaq.answer) return;
    
    const faqId = `faq-${Date.now()}`;
    const faqToAdd = { ...newFaq, id: faqId };
    
    setContentData(prev => ({
      ...prev,
      faqs: [...prev.faqs, faqToAdd]
    }));
    
    setNewFaq({ id: '', question: '', answer: '' });
    setIsAddingFaq(false);
    setHasChanges(true);
  };

  const updateFaq = (faqId: string, field: 'question' | 'answer', value: string) => {
    setContentData(prev => ({
      ...prev,
      faqs: prev.faqs.map(faq => 
        faq.id === faqId ? { ...faq, [field]: value } : faq
      )
    }));
    setHasChanges(true);
  };

  const deleteFaq = (faqId: string) => {
    setContentData(prev => ({
      ...prev,
      faqs: prev.faqs.filter(faq => faq.id !== faqId)
    }));
    setHasChanges(true);
  };

  // Save function with API integration
  const handleSaveAllChanges = async () => {
    setIsSaving(true);
    
    try {
      if (!hasChanges) {
        console.log('No changes detected');
        setIsSaving(false);
        return;
      }

      console.log('Saving changes...');
      
      // API call to save homepage data
      const response = await fetch('/api/homepage/en', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          language: 'en',
          data: contentData,
          timestamp: new Date().toISOString()
        }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to save data: ${response.statusText}`);
      }
      
      const result = await response.json();
      console.log('Successfully saved data:', result);
      
      // Update original data reference to reflect saved state
      originalDataRef.current = JSON.parse(JSON.stringify(contentData));
      setHasChanges(false);
      
    } catch (error) {
      console.error('Error saving changes:', error);
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
            </p>
          </div>
          <div className='flex space-x-2'>
            <Button 
              onClick={handleSaveAllChanges}
              disabled={!hasChanges || isSaving}
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
                    <Upload className='mx-auto h-12 w-12 text-gray-400' />
                    <p className='mt-2 text-sm text-gray-600'>Upload about section image</p>
                    <Button variant='outline' className='mt-2'>Choose File</Button>
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
                                value={faq.question}
                                onChange={(e) => updateFaq(faq.id, 'question', e.target.value)}
                                className="font-medium"
                                placeholder="Enter FAQ question"
                              />
                            ) : (
                              <h4 className="font-medium text-left">{faq.question}</h4>
                            )}
                          </div>
                          <div className="flex items-center gap-2 ml-4">
                            {editingFaqId === faq.id ? (
                              <Button
                                onClick={() => setEditingFaqId(null)}
                                size="sm"
                                variant="outline"
                              >
                                <Save className="h-4 w-4" />
                              </Button>
                            ) : (
                              <Button
                                onClick={() => setEditingFaqId(faq.id)}
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
                              value={faq.answer}
                              onChange={(e) => updateFaq(faq.id, 'answer', e.target.value)}
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
        </div>
      </div>
    </PageContainer>
  );
}
