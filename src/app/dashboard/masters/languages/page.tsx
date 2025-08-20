import { Breadcrumbs } from '@/components/breadcrumbs';
import PageContainer from '@/components/layout/page-container';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default function LanguagesPage() {
  return (
    <PageContainer>
      <div className='space-y-4'>
        <Breadcrumbs />
        <div>
          <h1 className='text-3xl font-bold tracking-tight'>Languages Management</h1>
          <p className='text-muted-foreground'>Manage supported languages for your platform</p>
        </div>
        <Card>
          <CardHeader>
            <CardTitle>Platform Languages</CardTitle>
            <CardDescription>Configure available languages and localization</CardDescription>
          </CardHeader>
          <CardContent>
            <p className='text-center py-10 text-muted-foreground'>Languages management will be implemented here</p>
          </CardContent>
        </Card>
      </div>
    </PageContainer>
  );
}
