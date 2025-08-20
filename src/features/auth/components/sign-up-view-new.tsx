'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { Metadata } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};

export default function SignUpViewPage({ stars }: { stars: number }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    // Basic validation
    if (password !== confirmPassword) {
      alert('Passwords do not match');
      setIsLoading(false);
      return;
    }

    try {
      // Here you would typically make an API call to register the user
      // For now, we'll just redirect to sign-in
      console.log('Sign up attempt:', { name, email, password });
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Redirect to sign-in page
      router.push('/auth/sign-in');
    } catch (error) {
      console.error('Sign up error:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const languages = [
    { code: 'English', name: 'English', script: 'English' },
    { code: 'Telugu', name: 'తెలుగు', script: 'Telugu' },
    { code: 'Hindi', name: 'हिंदी', script: 'Hindi' }
  ];

  return (
    <div className='relative h-screen flex items-center justify-center bg-white'>
      {/* Close button */}
      <button className='absolute top-6 right-6 p-2'>
        <X className='h-6 w-6 text-gray-400' />
      </button>

      {/* Main content */}
      <div className='w-full max-w-md p-8'>
        {/* Logo and Title */}
        <div className='text-center mb-8'>
          <div className='flex items-center justify-center mb-6'>
            <div className='flex items-center text-blue-600'>
              <div className='w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center mr-3'>
                <span className='text-white font-bold text-sm'>TC</span>
              </div>
              <span className='text-xl font-bold'>ThinkCyber</span>
            </div>
          </div>
          
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Create Account</h1>
          <p className='text-gray-600 text-sm'>
            Please fill in the information to create your account.
          </p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
          <div className='space-y-2'>
            <Label htmlFor='name' className='text-sm font-medium text-gray-700'>
              Full Name
            </Label>
            <Input
              id='name'
              type='text'
              value={name}
              onChange={(e) => setName(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email' className='text-sm font-medium text-gray-700'>
              Email Address
            </Label>
            <Input
              id='email'
              type='email'
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password' className='text-sm font-medium text-gray-700'>
              Password
            </Label>
            <Input
              id='password'
              type='password'
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required
            />
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword' className='text-sm font-medium text-gray-700'>
              Confirm Password
            </Label>
            <Input
              id='confirmPassword'
              type='password'
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className='w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent'
              required
            />
          </div>

          <Button
            type='submit'
            disabled={isLoading}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors'
          >
            {isLoading ? 'Creating Account...' : 'Create Account'}
          </Button>
        </form>

        {/* Language Selector */}
        <div className='mt-8'>
          <Label className='text-sm font-medium text-gray-700 mb-3 block'>
            Select Language
          </Label>
          <p className='text-xs text-gray-500 mb-3'>Choose Preferred Language</p>
          
          <div className='grid grid-cols-3 gap-3'>
            {languages.map((lang) => (
              <button
                key={lang.code}
                onClick={() => setSelectedLanguage(lang.code)}
                className={cn(
                  'p-3 border rounded-md text-center transition-all',
                  selectedLanguage === lang.code
                    ? 'border-blue-500 bg-blue-50 text-blue-600'
                    : 'border-gray-200 hover:border-gray-300'
                )}
              >
                <div className='font-medium text-sm'>{lang.name}</div>
                <div className='text-xs text-gray-500 mt-1'>{lang.script}</div>
              </button>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className='mt-8 text-center'>
          <p className='text-sm text-gray-600'>
            Already have an account?{' '}
            <Link
              href='/auth/sign-in'
              className='text-blue-600 hover:text-blue-700 font-medium'
            >
              Sign In
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
