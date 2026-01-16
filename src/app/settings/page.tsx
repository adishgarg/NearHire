'use client';

import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { PageLayout } from '@/components/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Separator } from '@/components/ui/separator';
import { Github, Mail, Lock, AlertCircle, CheckCircle2, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

interface Account {
  provider: string;
  providerAccountId: string;
}

interface UserSettings {
  hasPassword: boolean;
  accounts: Account[];
}

export default function SettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [loading, setLoading] = useState(true);
  const [unlinkingProvider, setUnlinkingProvider] = useState<string | null>(null);
  
  // Password form state
  const [showPasswordForm, setShowPasswordForm] = useState(false);
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [settingPassword, setSettingPassword] = useState(false);

  useEffect(() => {
    if (status === 'loading') return;
    
    if (!session) {
      router.push('/auth/login');
      return;
    }

    fetchSettings();
  }, [session, status, router]);

  const fetchSettings = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/settings');
      
      if (!response.ok) {
        throw new Error('Failed to fetch settings');
      }

      const data = await response.json();
      setSettings(data);
    } catch (error) {
      console.error('Error fetching settings:', error);
      toast.error('Failed to load settings');
    } finally {
      setLoading(false);
    }
  };

  const handleUnlinkProvider = async (provider: string) => {
    if (!settings) return;

    // Check if this is the only auth method
    if (settings.accounts.length === 1 && !settings.hasPassword) {
      toast.error('Cannot remove the only sign-in method. Please set a password first.');
      return;
    }

    const confirmed = confirm(
      `Are you sure you want to unlink your ${provider === 'google' ? 'Google' : 'GitHub'} account? You will no longer be able to sign in with ${provider === 'google' ? 'Google' : 'GitHub'}.`
    );

    if (!confirmed) return;

    try {
      setUnlinkingProvider(provider);
      const response = await fetch('/api/settings/unlink-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ provider }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to unlink account');
      }

      toast.success(`${provider === 'google' ? 'Google' : 'GitHub'} account unlinked successfully`);
      fetchSettings();
    } catch (error) {
      console.error('Error unlinking account:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to unlink account');
    } finally {
      setUnlinkingProvider(null);
    }
  };

  const handleSetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (newPassword.length < 8) {
      toast.error('Password must be at least 8 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    try {
      setSettingPassword(true);
      const response = await fetch('/api/settings/set-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ password: newPassword }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to set password');
      }

      toast.success('Password set successfully');
      setShowPasswordForm(false);
      setNewPassword('');
      setConfirmPassword('');
      fetchSettings();
    } catch (error) {
      console.error('Error setting password:', error);
      toast.error(error instanceof Error ? error.message : 'Failed to set password');
    } finally {
      setSettingPassword(false);
    }
  };

  if (status === 'loading' || loading) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-[#f5ecdf] flex items-center justify-center">
          <Loader2 className="w-8 h-8 animate-spin text-gray-900" />
        </div>
      </PageLayout>
    );
  }

  if (!settings) {
    return (
      <PageLayout>
        <div className="min-h-screen bg-[#f5ecdf] flex items-center justify-center">
          <Card className="border-gray-200 bg-white p-8">
            <h2 className="text-2xl font-bold text-gray-900">Failed to load settings</h2>
          </Card>
        </div>
      </PageLayout>
    );
  }

  const getProviderIcon = (provider: string) => {
    switch (provider) {
      case 'google':
        return <Mail className="w-5 h-5" />;
      case 'github':
        return <Github className="w-5 h-5" />;
      default:
        return null;
    }
  };

  const getProviderName = (provider: string) => {
    switch (provider) {
      case 'google':
        return 'Google';
      case 'github':
        return 'GitHub';
      default:
        return provider;
    }
  };

  return (
    <PageLayout>
      <div className="min-h-screen bg-[#f5ecdf]">
        <div className="container mx-auto px-4 py-8 max-w-4xl">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account settings and preferences</p>
          </div>

          <Tabs defaultValue="auth" className="space-y-6">
            <TabsList className="bg-white border border-gray-200 rounded-full p-1">
              <TabsTrigger 
                value="auth" 
                className="rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white"
              >
                Authentication
              </TabsTrigger>
              <TabsTrigger 
                value="account" 
                className="rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white"
              >
                Account
              </TabsTrigger>
              <TabsTrigger 
                value="notifications" 
                className="rounded-full data-[state=active]:bg-gray-900 data-[state=active]:text-white"
              >
                Notifications
              </TabsTrigger>
            </TabsList>

            <TabsContent value="auth" className="space-y-6">
              <Card className="border-gray-200 bg-white rounded-3xl">
                <CardHeader>
                  <CardTitle>Connected Accounts</CardTitle>
                  <CardDescription>
                    Manage how you sign in to your account
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settings.accounts.map((account) => (
                    <div
                      key={account.provider}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl"
                    >
                      <div className="flex items-center gap-3">
                        {getProviderIcon(account.provider)}
                        <div>
                          <p className="font-medium text-gray-900">
                            {getProviderName(account.provider)}
                          </p>
                          <p className="text-sm text-gray-600">
                            Connected
                          </p>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleUnlinkProvider(account.provider)}
                        disabled={unlinkingProvider === account.provider}
                        className="border-gray-300 text-red-600 hover:bg-red-50 hover:text-red-700 rounded-full"
                      >
                        {unlinkingProvider === account.provider ? (
                          <>
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            Unlinking...
                          </>
                        ) : (
                          'Unlink'
                        )}
                      </Button>
                    </div>
                  ))}

                  {settings.accounts.length === 0 && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        No OAuth accounts connected
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>

              <Card className="border-gray-200 bg-white rounded-3xl">
                <CardHeader>
                  <CardTitle>Password Authentication</CardTitle>
                  <CardDescription>
                    {settings.hasPassword
                      ? 'You can sign in with your email and password'
                      : 'Set a password to enable email/password sign-in'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  {settings.hasPassword ? (
                    <div className="flex items-center justify-between p-4 border border-gray-200 rounded-2xl bg-green-50">
                      <div className="flex items-center gap-3">
                        <Lock className="w-5 h-5 text-green-600" />
                        <div>
                          <p className="font-medium text-gray-900">
                            Password is set
                          </p>
                          <p className="text-sm text-gray-600">
                            You can sign in with email and password
                          </p>
                        </div>
                      </div>
                      <CheckCircle2 className="w-5 h-5 text-green-600" />
                    </div>
                  ) : (
                    <>
                      {!showPasswordForm ? (
                        <Button
                          onClick={() => setShowPasswordForm(true)}
                          className="w-full bg-gray-900 hover:bg-gray-800 text-white rounded-full"
                        >
                          Set Password
                        </Button>
                      ) : (
                        <form onSubmit={handleSetPassword} className="space-y-4">
                          <div>
                            <Label htmlFor="newPassword">New Password</Label>
                            <Input
                              id="newPassword"
                              type="password"
                              value={newPassword}
                              onChange={(e) => setNewPassword(e.target.value)}
                              placeholder="Enter new password"
                              required
                              minLength={8}
                              className="rounded-full"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                              Must be at least 8 characters long
                            </p>
                          </div>

                          <div>
                            <Label htmlFor="confirmPassword">Confirm Password</Label>
                            <Input
                              id="confirmPassword"
                              type="password"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              placeholder="Confirm new password"
                              required
                              minLength={8}
                              className="rounded-full"
                            />
                          </div>

                          <div className="flex gap-2">
                            <Button
                              type="submit"
                              disabled={settingPassword}
                              className="flex-1 bg-gray-900 hover:bg-gray-800 text-white rounded-full"
                            >
                              {settingPassword ? (
                                <>
                                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                  Setting Password...
                                </>
                              ) : (
                                'Set Password'
                              )}
                            </Button>
                            <Button
                              type="button"
                              variant="outline"
                              onClick={() => {
                                setShowPasswordForm(false);
                                setNewPassword('');
                                setConfirmPassword('');
                              }}
                              className="rounded-full"
                            >
                              Cancel
                            </Button>
                          </div>
                        </form>
                      )}
                    </>
                  )}

                  {settings.accounts.length > 0 && !settings.hasPassword && (
                    <Alert>
                      <AlertCircle className="h-4 w-4" />
                      <AlertDescription>
                        Setting a password provides an alternative way to sign in if you lose access to your OAuth provider.
                      </AlertDescription>
                    </Alert>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="account">
              <Card className="border-gray-200 bg-white rounded-3xl">
                <CardHeader>
                  <CardTitle>Account Settings</CardTitle>
                  <CardDescription>
                    Manage your account preferences
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Account settings coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="notifications">
              <Card className="border-gray-200 bg-white rounded-3xl">
                <CardHeader>
                  <CardTitle>Notification Preferences</CardTitle>
                  <CardDescription>
                    Control how you receive notifications
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <p className="text-gray-600">Notification settings coming soon...</p>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </PageLayout>
  );
}
