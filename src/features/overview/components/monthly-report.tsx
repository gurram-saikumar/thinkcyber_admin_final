'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ChevronDown, ArrowRight } from 'lucide-react';

const reportData = [
  { label: 'Total', value: '2.8K', color: 'bg-red-500' },
  { label: 'Topics', value: '5K', color: 'bg-blue-500' },
  { label: 'Subscribed', value: '2K', color: 'bg-purple-500' },
  { label: 'Enrolled', value: '1.2K', color: 'bg-green-500' }
];

const segments = ['Earnings', 'Topics', 'Subscribed', 'Enrolled'];

export function MonthlyReport() {
  const [activeSegment, setActiveSegment] = React.useState('Earnings');

  return (
    <Card className='w-full'>
      <CardHeader className='pb-3'>
        <div className='flex items-center justify-between'>
          <CardTitle className='text-lg font-semibold'>
            Calculate monthly report based on each segment
          </CardTitle>
          <Button variant='ghost' size='sm' className='text-sm text-muted-foreground'>
            Jan, 2025
            <ChevronDown className='ml-1 h-4 w-4' />
          </Button>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        {/* Segment Tabs */}
        <div className='flex space-x-1 p-1 bg-gray-100 rounded-lg'>
          {segments.map((segment) => (
            <button
              key={segment}
              onClick={() => setActiveSegment(segment)}
              className={`flex-1 px-3 py-2 text-sm rounded-md transition-colors ${
                activeSegment === segment
                  ? 'bg-white text-red-600 shadow-sm'
                  : 'text-gray-600 hover:text-gray-900'
              }`}
            >
              {segment}
            </button>
          ))}
        </div>

        {/* Statistics */}
        <div className='grid grid-cols-2 gap-4'>
          {reportData.map((item, index) => (
            <div key={index} className='text-center'>
              <div className='flex items-center justify-center mb-2'>
                <div className={`w-3 h-3 ${item.color} rounded-full mr-2`}></div>
                <span className='text-2xl font-bold'>{item.value}</span>
              </div>
              <div className='text-sm text-muted-foreground'>{item.label}</div>
              {index === 0 && (
                <div className='text-xs text-muted-foreground mt-1'>
                  Payment Transactions
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Generate Report Button */}
        <Button className='w-full bg-purple-600 hover:bg-purple-700 text-white'>
          Generate Report
          <ArrowRight className='ml-2 h-4 w-4' />
        </Button>
      </CardContent>
    </Card>
  );
}
