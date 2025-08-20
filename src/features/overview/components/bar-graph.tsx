'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Calendar, ChevronDown, MoreHorizontal } from 'lucide-react';

export const description = 'Updates panel with user list';

// Sample user data for Enrolled
const enrolledData = [
  {
    id: 1,
    name: 'Lori',
    status: 'Enrolled',
    location: 'Hyderabad to Mumbai',
    avatar: '/assets/avatar.svg'
  },
  {
    id: 2,
    name: 'Mitchell',
    status: 'Enrolled',
    location: 'Hyderabad to Mumbai',
    avatar: '/assets/avatar.svg'
  },
  {
    id: 3,
    name: 'Pramod',
    status: 'Enrolled',
    location: 'Hyderabad to Mumbai',
    avatar: '/assets/avatar.svg'
  }
];

// Sample data for Subscribed table
const subscribedData = [
  {
    id: 1,
    name: 'Alice Johnson',
    email: 'alice@example.com',
    subscription: 'Premium',
    status: 'Active',
    joinDate: '2024-01-15'
  },
  {
    id: 2,
    name: 'Bob Smith',
    email: 'bob@example.com',
    subscription: 'Basic',
    status: 'Active',
    joinDate: '2024-02-20'
  },
  {
    id: 3,
    name: 'Carol Davis',
    email: 'carol@example.com',
    subscription: 'Premium',
    status: 'Pending',
    joinDate: '2024-03-10'
  },
  {
    id: 4,
    name: 'David Wilson',
    email: 'david@example.com',
    subscription: 'Basic',
    status: 'Inactive',
    joinDate: '2024-01-05'
  }
];

export function BarGraph() {
  const [activeTab, setActiveTab] = React.useState<'enrolled' | 'subscribed'>('enrolled');
  const [dateRange, setDateRange] = React.useState('May, 2025');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return 'bg-green-50 text-green-600';
      case 'pending':
        return 'bg-yellow-50 text-yellow-600';
      case 'inactive':
        return 'bg-red-50 text-red-600';
      default:
        return 'bg-blue-50 text-blue-600';
    }
  };

  return (
    <Card className='w-full h-full flex flex-col'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>Updates</CardTitle>
          <Button variant='ghost' size='sm'>
            <MoreHorizontal className='h-4 w-4' />
          </Button>
        </div>
        
        {/* Tabs */}
        <div className='flex gap-6 mt-4'>
          <button
            onClick={() => setActiveTab('enrolled')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'enrolled'
                ? 'text-red-500 border-red-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Enrolled
          </button>
          <button
            onClick={() => setActiveTab('subscribed')}
            className={`text-sm font-medium pb-2 border-b-2 transition-colors ${
              activeTab === 'subscribed'
                ? 'text-red-500 border-red-500'
                : 'text-gray-500 border-transparent hover:text-gray-700'
            }`}
          >
            Subscribed
          </button>
        </div>

        {/* Date Range Selector */}
        <div className='flex items-center justify-between mt-4 text-sm'>
          <div className='flex items-center gap-4'>
            <div className='flex items-center gap-2'>
              <span className='text-gray-600'>From</span>
              <Button variant='outline' size='sm' className='h-8 px-3'>
                <Calendar className='h-3 w-3 mr-1' />
                28.05.2025
              </Button>
            </div>
            <div className='flex items-center gap-2'>
              <span className='text-gray-600'>To</span>
              <Button variant='outline' size='sm' className='h-8 px-3'>
                <Calendar className='h-3 w-3 mr-1' />
                08.06.2025
              </Button>
            </div>
          </div>
        </div>

        {/* Month Selector */}
        <div className='mt-3'>
          <Button variant='outline' size='sm' className='h-8 px-3'>
            {dateRange}
            <ChevronDown className='h-3 w-3 ml-2' />
          </Button>
        </div>
      </CardHeader>

      <CardContent className='pt-0 flex-1 overflow-auto'>
        {activeTab === 'enrolled' ? (
          // Enrolled Tab - User Cards
          <div className='space-y-4'>
            {enrolledData.map((user) => (
              <div key={user.id} className='flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 transition-colors'>
                <div className='flex items-center gap-3'>
                  <Avatar className='h-10 w-10'>
                    <AvatarImage src={user.avatar} alt={user.name} />
                    <AvatarFallback className='bg-orange-100 text-orange-600'>
                      {user.name.charAt(0)}
                    </AvatarFallback>
                  </Avatar>
                  <div>
                    <div className='font-medium text-sm'>{user.name}</div>
                    <Badge variant='secondary' className='text-xs bg-blue-50 text-blue-600 hover:bg-blue-50'>
                      {user.status}
                    </Badge>
                    <div className='text-xs text-red-500 mt-1 flex items-center gap-1'>
                      <div className='w-1 h-1 bg-red-500 rounded-full'></div>
                      {user.location}
                    </div>
                  </div>
                </div>
                <Button variant='ghost' size='sm'>
                  <MoreHorizontal className='h-4 w-4' />
                </Button>
              </div>
            ))}
          </div>
        ) : (
          // Subscribed Tab - Table
          <div className='space-y-3'>
            <div className='text-sm font-medium text-gray-700 mb-3'>Subscription Details</div>
            <div className='space-y-2'>
              {subscribedData.map((subscriber) => (
                <div key={subscriber.id} className='border rounded-lg p-3 hover:bg-gray-50 transition-colors'>
                  <div className='flex items-center justify-between mb-2'>
                    <div className='font-medium text-sm'>{subscriber.name}</div>
                    <Badge className={`text-xs ${getStatusColor(subscriber.status)}`}>
                      {subscriber.status}
                    </Badge>
                  </div>
                  <div className='text-xs text-gray-600 space-y-1'>
                    <div>Email: {subscriber.email}</div>
                    <div>Plan: {subscriber.subscription}</div>
                    <div>Joined: {subscriber.joinDate}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
