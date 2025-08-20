'use client';

import { EarningsGraph } from './earnings-graph';

export function AreaGraph() {
  return (
    <div className='grid grid-cols-1 gap-4'>
      <EarningsGraph />
    </div>
  );
}
