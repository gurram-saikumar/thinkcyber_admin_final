'use client';

import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { cn } from '@/lib/utils';
import { signIn } from 'next-auth/react';
import { Metadata } from 'next';
import Link from 'next/link';
import { useState } from 'react';
import { X } from 'lucide-react';

 export const metadata: Metadata = {
  title: 'Authentication',
  description: 'Authentication forms built using the components.'
};



export default function SignInViewPage({ stars }: { stars: number }) {
  const [email, setEmail] = useState('admin_thinkcyber@gmail.com');
  const [password, setPassword] = useState('admin123');
  const [selectedLanguage, setSelectedLanguage] = useState('English');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    
    try {
      const result = await signIn('credentials', {
        email,
        password,
        redirect: true,
        callbackUrl: '/dashboard/overview'
      });
    } catch (error) {
      console.error('Login error:', error);
    } finally {
      setIsLoading(false);
    }
  }; 
  return (
    <div className='relative h-screen flex-col items-center justify-center md:grid lg:max-w-none lg:grid-cols-2 lg:px-0'> 
      <div className='bg-muted relative hidden h-full flex-col p-10 text-white lg:flex dark:border-r'>
        <div className='absolute inset-0 bg-[#E6F0F9]' /> 
        <div className='relative z-20 mt-auto'>
           <img src='/assets/login-banner.svg' alt='Authentication' className='w-full h-auto' />
        </div>
      </div>
    <div className='flex h-full items-center justify-center p-4 lg:p-8'>
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
              <img src='/assets/logo.svg' alt='Logo' className='w-auto h-auto mr-3' />
            </div>
          </div>
          
          <h1 className='text-2xl font-bold text-gray-900 mb-2'>Admin Login</h1>
         
        </div>

        {/* Login Form */}
        <form onSubmit={handleSubmit} className='space-y-6'>
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

          <Button
            type='submit'
            disabled={isLoading}
            className='w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-md font-medium transition-colors'
          >
            {isLoading ? 'Logging in...' : 'Login'}
          </Button>
        </form> 
      </div>
    </div> 
    </div>
  );
}
