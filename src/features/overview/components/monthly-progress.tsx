'use client';

import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export function MonthlyProgress() {
  const percentage = 60;
  const circumference = 2 * Math.PI * 40; // radius = 40
  const strokeDasharray = circumference;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <Card className='w-full h-[300px] flex flex-col'>
      <CardHeader className='pb-3'>
        <CardTitle className='text-lg font-semibold'>Monthly increased amount</CardTitle>
      </CardHeader>
      <CardContent className='flex flex-col items-center justify-center pb-6 flex-1'>
        <div className='relative w-32 h-32 mb-4'>
          <svg className='w-32 h-32 transform -rotate-90' viewBox='0 0 100 100'>
            {/* Background circle */}
            <circle
              cx='50'
              cy='50'
              r='40'
              stroke='#e5e7eb'
              strokeWidth='8'
              fill='transparent'
            />
            {/* Progress circle */}
            <circle
              cx='50'
              cy='50'
              r='40'
              stroke='#ef4444'
              strokeWidth='8'
              fill='transparent'
              strokeDasharray={strokeDasharray}
              strokeDashoffset={strokeDashoffset}
              strokeLinecap='round'
              className='transition-all duration-1000 ease-in-out'
            />
          </svg>
          <div className='absolute inset-0 flex items-center justify-center'>
            <div className='text-center'>
              <div className='text-2xl font-bold text-gray-900'>{percentage}%</div>
            </div>
          </div>
        </div>
        <p className='text-sm text-muted-foreground text-center'>
          Calculated with respect to per 100 subscription
        </p>
      </CardContent>
    </Card>
  );
}
