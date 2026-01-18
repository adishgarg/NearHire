'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ShoppingBag, Store, Users, ArrowRight, Check } from 'lucide-react';

interface RoleSelectionProps {
  onRoleSelect: (role: 'BUYER' | 'SELLER' | 'BOTH') => void;
}

export function RoleSelection({ onRoleSelect }: RoleSelectionProps) {
  const [selectedRole, setSelectedRole] = useState<'BUYER' | 'SELLER' | 'BOTH' | null>(null);

  const roles = [
    {
      id: 'BUYER' as const,
      title: 'I want to hire talent',
      description: 'Find skilled freelancers for your projects',
      icon: ShoppingBag,
      features: [
        'Browse thousands of services',
        'Get quotes from top freelancers',
      ],
      color: 'bg-blue-500',
      badge: 'Buyer'
    },
    {
      id: 'SELLER' as const,
      title: 'I want to offer services',
      description: 'Start earning by offering your skills',
      icon: Store,
      features: [
        'Create professional gigs',
        'Set your own prices',
      ],
      color: 'bg-emerald-500',
      badge: 'Seller'
    }
  ];

  return (
    <div className="min-h-screen bg-[#e6ddcf] flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold font-serif text-gray-900 mb-4">
            Welcome to NearHire! 🎉
          </h1>
          <p className="text-xl text-gray-600">
            Let's get you set up. What would you like to do on our platform?
          </p>
        </div>

        <div className="grid md:grid-cols-2 gap-6 mb-8 max-w-3xl mx-auto">
          {roles.map((role) => {
            const Icon = role.icon;
            const isSelected = selectedRole === role.id;
            
            return (
              <Card
                key={role.id}
                className={`relative cursor-pointer transition-all duration-300 border-2 hover:scale-105 rounded-3xl ${
                  isSelected
                    ? 'border-gray-900 bg-white shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
                onClick={() => setSelectedRole(role.id)}
              >
                {isSelected && (
                  <div className="absolute -top-3 -right-3 bg-gray-900 rounded-full p-2">
                    <Check className="h-4 w-4 text-white" />
                  </div>
                )}
                
                <CardHeader className="text-center">
                  <div className={`mx-auto h-16 w-16 rounded-full ${role.color} flex items-center justify-center mb-4`}>
                    <Icon className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-gray-900 mb-2">{role.title}</CardTitle>
                  <Badge variant="outline" className="mx-auto border-gray-300 text-gray-700 rounded-full">
                    {role.badge}
                  </Badge>
                  <CardDescription className="text-gray-600 mt-2">
                    {role.description}
                  </CardDescription>
                </CardHeader>
                
                <CardContent>
                  <ul className="space-y-2">
                    {role.features.map((feature, index) => (
                      <li key={index} className="flex items-center text-sm text-gray-700">
                        <div className="h-2 w-2 bg-gray-900 rounded-full mr-3" />
                        {feature}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="text-center">
          <Button
            onClick={() => selectedRole && onRoleSelect(selectedRole)}
            disabled={!selectedRole}
            className="bg-gray-900 hover:bg-gray-800 text-white px-8 py-3 text-lg disabled:opacity-50 disabled:cursor-not-allowed rounded-full"
            size="lg"
          >
            Continue
            <ArrowRight className="ml-2 h-5 w-5" />
          </Button>
          
          <p className="text-gray-500 text-sm mt-4">
            Don't worry, you can always change this later in your settings
          </p>
        </div>
      </div>
    </div>
  );
}