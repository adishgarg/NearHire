'use client';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default function TestTabsPage() {
  console.log('TestTabsPage component rendered - this should only log once per navigation');

  return (
    <div className="min-h-screen bg-[#f5ecdf] text-gray-900 p-8">
      <div className="container mx-auto">
        <h1 className="text-3xl font-bold mb-8">Tab Navigation Test</h1>
        
        <Card className="border-zinc-800 bg-zinc-900 p-6">
          <p className="mb-6 text-zinc-400">
            This page tests tab navigation. If the page reloads when switching tabs, 
            you'll see the console log above appear again. Tabs should switch instantly 
            without any reload.
          </p>

          <Tabs defaultValue="tab1" className="w-full">
            <TabsList className="bg-zinc-800 border-b border-zinc-700 mb-6">
              <TabsTrigger 
                value="tab1" 
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-emerald-400"
              >
                Tab 1
              </TabsTrigger>
              <TabsTrigger 
                value="tab2" 
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-emerald-400"
              >
                Tab 2
              </TabsTrigger>
              <TabsTrigger 
                value="tab3" 
                className="data-[state=active]:bg-zinc-700 data-[state=active]:text-emerald-400"
              >
                Tab 3
              </TabsTrigger>
            </TabsList>

            <TabsContent value="tab1" className="mt-6">
              <Card className="border-zinc-800 bg-zinc-950 p-6">
                <h3 className="text-xl font-semibold mb-4 text-emerald-400">Tab 1 Content</h3>
                <p className="text-zinc-300 mb-4">
                  This is the content for tab 1. Switching to other tabs should be instant
                  and not reload the page.
                </p>
                <Button className="bg-emerald-600 hover:bg-emerald-700">
                  Sample Button in Tab 1
                </Button>
              </Card>
            </TabsContent>

            <TabsContent value="tab2" className="mt-6">
              <Card className="border-zinc-800 bg-zinc-950 p-6">
                <h3 className="text-xl font-semibold mb-4 text-emerald-400">Tab 2 Content</h3>
                <p className="text-zinc-300 mb-4">
                  This is the content for tab 2. Notice how the content changes instantly
                  without any page reload or flickering.
                </p>
                <div className="space-y-2">
                  <Button variant="outline" className="border-zinc-700 mr-2">
                    Sample Button 1
                  </Button>
                  <Button variant="outline" className="border-zinc-700">
                    Sample Button 2
                  </Button>
                </div>
              </Card>
            </TabsContent>

            <TabsContent value="tab3" className="mt-6">
              <Card className="border-zinc-800 bg-zinc-950 p-6">
                <h3 className="text-xl font-semibold mb-4 text-emerald-400">Tab 3 Content</h3>
                <p className="text-zinc-300 mb-4">
                  This is the content for tab 3. Each tab maintains its own state
                  and switching between them is handled by React state, not navigation.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Card className="border-zinc-700 bg-zinc-900 p-4">
                    <p className="text-sm text-zinc-400">Sample content block 1</p>
                  </Card>
                  <Card className="border-zinc-700 bg-zinc-900 p-4">
                    <p className="text-sm text-zinc-400">Sample content block 2</p>
                  </Card>
                </div>
              </Card>
            </TabsContent>
          </Tabs>

          <div className="mt-8 p-4 border border-zinc-700 rounded-lg">
            <h4 className="text-lg font-semibold mb-2 text-emerald-400">Debug Info:</h4>
            <p className="text-sm text-zinc-400 mb-2">
              • Open browser dev tools and watch the Console tab
            </p>
            <p className="text-sm text-zinc-400 mb-2">
              • The component render log should only appear once when you first load this page
            </p>
            <p className="text-sm text-zinc-400">
              • If you see the log again when switching tabs, there's a page reload issue
            </p>
          </div>
        </Card>
      </div>
    </div>
  );
}