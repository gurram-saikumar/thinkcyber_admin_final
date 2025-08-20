'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Trash2, Eye, EyeOff } from 'lucide-react';

export function DebugStorage() {
  const [topics, setTopics] = useState<any[]>([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    loadTopics();
  }, []);

  const loadTopics = () => {
    try {
      const storedTopics = JSON.parse(localStorage.getItem('topics') || '[]');
      setTopics(storedTopics);
      console.log('🗃️ Loaded topics from localStorage:', storedTopics);
    } catch (error) {
      console.error('Failed to load topics from localStorage:', error);
      setTopics([]);
    }
  };

  const clearStorage = () => {
    localStorage.removeItem('topics');
    setTopics([]);
    console.log('🗑️ Cleared topics from localStorage');
  };

  if (!isVisible) {
    return (
      <Button
        variant="outline"
        size="sm"
        onClick={() => setIsVisible(true)}
        className="fixed bottom-4 right-4 z-50"
      >
        <Eye className="h-4 w-4 mr-2" />
        Debug Storage
      </Button>
    );
  }

  return (
    <Card className="fixed bottom-4 right-4 w-96 max-h-96 overflow-y-auto z-50 bg-white shadow-lg">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm">Debug: Stored Topics ({topics.length})</CardTitle>
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={loadTopics}>
              Refresh
            </Button>
            <Button variant="outline" size="sm" onClick={clearStorage}>
              <Trash2 className="h-3 w-3" />
            </Button>
            <Button variant="outline" size="sm" onClick={() => setIsVisible(false)}>
              <EyeOff className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        {topics.length === 0 ? (
          <p className="text-sm text-gray-500">No topics stored yet</p>
        ) : (
          topics.map((topic, index) => (
            <div key={topic.id || index} className="p-2 border rounded text-xs space-y-1">
              <div className="font-medium">{topic.title}</div>
              <div className="flex gap-2 flex-wrap">
                <Badge variant="outline" className="text-xs">
                  Cat: {topic.category}
                </Badge>
                {topic.subcategory && (
                  <Badge variant="outline" className="text-xs">
                    Sub: {topic.subcategory}
                  </Badge>
                )}
                <Badge variant="outline" className="text-xs">
                  {topic.status}
                </Badge>
              </div>
              <div className="text-gray-500">
                Created: {new Date(topic.createdAt).toLocaleString()}
              </div>
            </div>
          ))
        )}
      </CardContent>
    </Card>
  );
}
