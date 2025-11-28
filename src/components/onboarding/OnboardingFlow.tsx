'use client';

import { useState } from 'react';
import { useSession, signOut } from 'next-auth/react';
import { RoleSelection } from './RoleSelection';
import { BuyerProfile } from './BuyerProfile';
import { SellerProfile } from './SellerProfile';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { CheckCircle, ArrowRight, User, Briefcase } from 'lucide-react';

type UserRole = 'BUYER' | 'SELLER' | 'BOTH';
type OnboardingStep = 'role' | 'buyer-profile' | 'seller-profile' | 'complete';

interface OnboardingFlowProps {
  onComplete?: () => void;
}

interface BuyerProfileData {
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  interests?: string[];
}

interface SellerProfileData {
  bio?: string;
  location?: string;
  website?: string;
  phone?: string;
  skills?: string[];
  hourlyRate?: string;
  experience?: string;
  portfolio?: string;
  availability?: string;
}

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { data: session, update } = useSession();
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('role');
  const [selectedRole, setSelectedRole] = useState<UserRole | null>(null);
  const [buyerData, setBuyerData] = useState<BuyerProfileData | null>(null);
  const [sellerData, setSellerData] = useState<SellerProfileData | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const getStepProgress = () => {
    const steps = ['role'];
    if (selectedRole === 'BUYER' || selectedRole === 'BOTH') steps.push('buyer-profile');
    if (selectedRole === 'SELLER' || selectedRole === 'BOTH') steps.push('seller-profile');
    steps.push('complete');
    
    const currentIndex = steps.indexOf(currentStep);
    return ((currentIndex + 1) / steps.length) * 100;
  };

  const handleRoleSelection = (role: UserRole) => {
    setSelectedRole(role);
    if (role === 'BUYER') {
      setCurrentStep('buyer-profile');
    } else if (role === 'SELLER') {
      setCurrentStep('seller-profile');
    } else {
      // For 'BOTH', start with buyer profile
      setCurrentStep('buyer-profile');
    }
  };

  const handleBuyerProfileComplete = (data: BuyerProfileData) => {
    setBuyerData(data);
    if (selectedRole === 'BOTH') {
      setCurrentStep('seller-profile');
    } else {
      setCurrentStep('complete');
    }
  };

  const handleSellerProfileComplete = (data: SellerProfileData) => {
    setSellerData(data);
    setCurrentStep('complete');
  };

  const handleBuyerProfileSkip = () => {
    if (selectedRole === 'BOTH') {
      setCurrentStep('seller-profile');
    } else {
      setCurrentStep('complete');
    }
  };

  const handleSellerProfileSkip = () => {
    setCurrentStep('complete');
  };

  const submitOnboardingData = async () => {
    setIsSubmitting(true);
    try {
      console.log('🚀 Submitting onboarding data:', {
        role: selectedRole,
        buyerProfile: buyerData,
        sellerProfile: sellerData,
      });

      const response = await fetch('/api/auth/onboarding', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          role: selectedRole,
          buyerProfile: buyerData,
          sellerProfile: sellerData,
        }),
      });

      const responseData = await response.json();
      console.log('📝 API Response:', responseData);

      if (response.ok) {
        console.log('✅ Onboarding data saved successfully');
        await update();
        
        if (onComplete) {
          onComplete();
        } else {
          window.location.href = '/profile';
        }
      } else {
        console.error('❌ Failed to save onboarding data:', responseData);
        alert(`Failed to save onboarding data: ${responseData.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('💥 Error saving onboarding data:', error);
      alert(`Error saving onboarding data: ${error}`);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (currentStep === 'role') {
    return <RoleSelection onRoleSelect={handleRoleSelection} />;
  }

  if (currentStep === 'buyer-profile') {
    return (
      <BuyerProfile 
        onComplete={handleBuyerProfileComplete}
        onSkip={handleBuyerProfileSkip}
      />
    );
  }

  if (currentStep === 'seller-profile') {
    return (
      <SellerProfile 
        onComplete={handleSellerProfileComplete}
        onSkip={handleSellerProfileSkip}
      />
    );
  }

  if (currentStep === 'complete') {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center p-4">
        <Card className="w-full max-w-2xl border-zinc-800 bg-zinc-900">
          <CardHeader className="text-center">
            <div className="mx-auto h-20 w-20 rounded-full bg-emerald-600 flex items-center justify-center mb-6">
              <CheckCircle className="h-10 w-10 text-white" />
            </div>
            <CardTitle className="text-3xl text-white mb-4">
              Welcome to NearHire!
            </CardTitle>
            <p className="text-zinc-400 text-lg">
              Your profile setup is complete. Let's get you started!
            </p>
            
            <div className="mt-6">
              <Progress value={100} className="h-3" />
              <p className="text-sm text-emerald-400 mt-2 font-medium">Setup Complete! 🎉</p>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-zinc-800 p-6 rounded-lg">
              <h3 className="text-white font-semibold mb-4">Your Profile Summary:</h3>
              <div className="space-y-3">
                <div className="flex items-center gap-3">
                  {selectedRole === 'BUYER' ? (
                    <User className="h-5 w-5 text-blue-500" />
                  ) : selectedRole === 'SELLER' ? (
                    <Briefcase className="h-5 w-5 text-emerald-500" />
                  ) : (
                    <div className="flex gap-1">
                      <User className="h-4 w-4 text-blue-500" />
                      <Briefcase className="h-4 w-4 text-emerald-500" />
                    </div>
                  )}
                  <span className="text-zinc-300">
                    Role: <span className="text-white font-medium">
                      {selectedRole === 'BOTH' ? 'Buyer & Seller' : selectedRole?.toLowerCase()}
                    </span>
                  </span>
                </div>
                
                {buyerData?.interests && buyerData.interests.length > 0 && (
                  <div className="text-zinc-300">
                    Interests: <span className="text-emerald-400">{buyerData.interests.length} selected</span>
                  </div>
                )}
                
                {sellerData?.skills && sellerData.skills.length > 0 && (
                  <div className="text-zinc-300">
                    Skills: <span className="text-emerald-400">{sellerData.skills.length} listed</span>
                  </div>
                )}
                
                {sellerData?.hourlyRate && (
                  <div className="text-zinc-300">
                    Rate: <span className="text-emerald-400">${sellerData.hourlyRate}/hour</span>
                  </div>
                )}
              </div>
            </div>

            <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 p-6 rounded-lg border border-emerald-500/30">
              <h4 className="text-white font-semibold mb-3">What's Next?</h4>
              <div className="space-y-2 text-zinc-300">
                {selectedRole === 'BUYER' || selectedRole === 'BOTH' ? (
                  <p>• Browse talented freelancers and post your first project</p>
                ) : null}
                {selectedRole === 'SELLER' || selectedRole === 'BOTH' ? (
                  <p>• Start applying to projects that match your skills</p>
                ) : null}
                <p>• Complete your profile with additional details anytime</p>
                <p>• Explore the marketplace and connect with {selectedRole === 'BUYER' ? 'sellers' : selectedRole === 'SELLER' ? 'clients' : 'the community'}</p>
              </div>
            </div>

            <div className="flex gap-4">
              <Button
                variant="outline"
                onClick={() => signOut()}
                className="border-zinc-700 text-zinc-300 hover:bg-zinc-800"
              >
                Sign Out
              </Button>
              <Button
                onClick={submitOnboardingData}
                disabled={isSubmitting}
                className="flex-1 bg-emerald-600 hover:bg-emerald-700 text-white"
              >
                {isSubmitting ? 'Setting up...' : 'Enter NearHire'}
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  return null;
}