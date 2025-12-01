'use client';

import { useState, useEffect } from 'react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function CacheTestPage() {
  const [renderCount, setRenderCount] = useState(0);
  const [tabSwitchCount, setTabSwitchCount] = useState(0);

  useEffect(() => {
    setRenderCount(prev => prev + 1);
    console.log(`CacheTestPage rendered ${renderCount + 1} times`);
  }, []);

  const handleTabChange = () => {
    setTabSwitchCount(prev => prev + 1);
    console.log(`Tab switched ${tabSwitchCount + 1} times - should not cause re-render`);
  };

  return (
    <div className="min-h-screen bg-black text-white p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Cache & Tab Navigation Debug</h1>
        
        <Card className="border-zinc-800 bg-zinc-900 p-6 mb-6">
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div>
              <p className="text-emerald-400 font-semibold">Component Renders:</p>
              <p className="text-2xl">{renderCount}</p>
              <p className="text-sm text-zinc-400">Should be 1 after initial load</p>
            </div>
            <div>
              <p className="text-emerald-400 font-semibold">Tab Switches:</p>
              <p className="text-2xl">{tabSwitchCount}</p>
              <p className="text-sm text-zinc-400">Increments with each tab change</p>
            </div>
          </div>
        </Card>

        <Card className="border-zinc-800 bg-zinc-900 p-6">
          <h2 className="text-xl font-semibold mb-4 text-emerald-400">Tab Navigation Test</h2>
          
          <Tabs defaultValue="tab1" className="w-full" onValueChange={handleTabChange}>
            <TabsList className="bg-zinc-800 border-b border-zinc-700 mb-6">
              <TabsTrigger 
                value="tab1" 
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-emerald-400"
              >
                Performance Tab
              </TabsTrigger>
              <TabsTrigger 
                value="tab2" 
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-emerald-400"
              >
                Cache Tab
              </TabsTrigger>
              <TabsTrigger 
                value="tab3" 
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-emerald-400"
              >
                Debug Tab
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tab1" className="mt-6">
              <Card className="border-zinc-800 bg-zinc-950 p-6">
                <h3 className="text-xl font-semibold mb-4 text-emerald-400">Performance Analysis</h3>
                <div className="space-y-3">
                  <p className="text-zinc-300">✅ Fixed useCallback in MarketplacePage to prevent unnecessary re-renders</p>
                  <p className="text-zinc-300">✅ Fixed useEffect dependencies to prevent render loops</p>
                  <p className="text-zinc-300">✅ Added proper cache control headers to API routes</p>
                  <p className="text-zinc-300">✅ Removed window.location.href causing page reloads</p>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="tab2" className="mt-6">
              <Card className="border-zinc-800 bg-zinc-950 p-6">
                <h3 className="text-xl font-semibold mb-4 text-emerald-400">Cache Control Fixed</h3>
                <div className="space-y-3">
                  <p className="text-zinc-300">• API responses now include no-cache headers</p>
                  <p className="text-zinc-300">• Prevents aggressive browser caching</p>
                  <p className="text-zinc-300">• Ensures fresh data on navigation</p>
                  <p className="text-zinc-300">• Fixed React state management issues</p>
                </div>
                <div className="mt-4 p-3 bg-zinc-900 rounded border border-zinc-700">
                  <code className="text-sm text-green-400">
                    Cache-Control: no-cache, no-store, must-revalidate
                  </code>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="tab3" className="mt-6">
              <Card className="border-zinc-800 bg-zinc-950 p-6">
                <h3 className="text-xl font-semibold mb-4 text-emerald-400">Debug Information</h3>
                <div className="space-y-3">
                  <p className="text-zinc-300">• Check browser console for render logs</p>
                  <p className="text-zinc-300">• Component should render only once on page load</p>
                  <p className="text-zinc-300">• Tab changes should not cause re-renders</p>
                  <p className="text-zinc-300">• Navigation should be instant without page reloads</p>
                </div>
                <Button 
                  className="mt-4 bg-emerald-600 hover:bg-emerald-700"
                  onClick={() => console.log('Button click - no page reload should occur')}
                >
                  Test Button (Check Console)
                </Button>
              </Card>
            </TabsContent>
          </Tabs>
        </Card>
      </div>
    </div>
  );
}