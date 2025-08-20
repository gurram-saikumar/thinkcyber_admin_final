'use client';
import { useSession } from 'next-auth/react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

export default function ProfileViewPage() {
  const { data: session } = useSession();

  if (!session) {
    return <div>Please sign in to view your profile.</div>;
  }

  return (
    <div className='flex w-full flex-col p-4 max-w-2xl mx-auto'>
      <Card>
        <CardHeader>
          <CardTitle>User Profile</CardTitle>
        </CardHeader>
        <CardContent className='space-y-6'>
          <div className='flex items-center space-x-4'>
            <Avatar className='h-20 w-20'>
              <AvatarImage src={session.user?.image || ''} alt={session.user?.name || ''} />
              <AvatarFallback>
                {session.user?.name?.charAt(0) || session.user?.email?.charAt(0) || 'U'}
              </AvatarFallback>
            </Avatar>
            <div>
              <h2 className='text-2xl font-bold'>{session.user?.name || 'User'}</h2>
              <p className='text-muted-foreground'>{session.user?.email}</p>
            </div>
          </div>
          
          <div className='grid gap-4'>
            <div>
              <label className='text-sm font-medium text-gray-700'>Name</label>
              <p className='mt-1 text-sm text-gray-900'>{session.user?.name || 'Not provided'}</p>
            </div>
            <div>
              <label className='text-sm font-medium text-gray-700'>Email</label>
              <p className='mt-1 text-sm text-gray-900'>{session.user?.email}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
