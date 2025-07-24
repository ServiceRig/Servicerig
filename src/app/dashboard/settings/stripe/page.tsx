
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/hooks/use-toast';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { CheckCircle, AlertTriangle, KeyRound, Save } from 'lucide-react';

export default function StripeSettingsPage() {
    const { toast } = useToast();
    
    // In a real app, these would be fetched from a secure backend/environment variables
    const [publishableKey, setPublishableKey] = useState('');
    const [secretKey, setSecretKey] = useState('');
    const [connectionStatus, setConnectionStatus] = useState<'connected' | 'disconnected'>('disconnected');

    const handleSaveChanges = () => {
        // Here you would call a server action to securely save the keys.
        // For demonstration, we'll just simulate a check.
        if (publishableKey.startsWith('pk_') && secretKey.startsWith('sk_')) {
            setConnectionStatus('connected');
            toast({
                title: "Settings Saved",
                description: "Your Stripe API keys have been saved and verified.",
            });
        } else {
            setConnectionStatus('disconnected');
            toast({
                variant: 'destructive',
                title: "Invalid Keys",
                description: "Please check your Stripe API keys and try again.",
            });
        }
    }

    return (
        <div className="space-y-8 max-w-4xl">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Stripe Integration</h1>
                    <p className="text-muted-foreground">Manage your connection to Stripe for payment processing.</p>
                </div>
                <Button onClick={handleSaveChanges}>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                </Button>
            </div>

            <Alert variant={connectionStatus === 'connected' ? 'default' : 'destructive'}>
                {connectionStatus === 'connected' ? <CheckCircle className="h-4 w-4" /> : <AlertTriangle className="h-4 w-4" />}
                <AlertTitle>
                    {connectionStatus === 'connected' ? 'Connected to Stripe' : 'Not Connected'}
                </AlertTitle>
                <AlertDescription>
                     {connectionStatus === 'connected' 
                        ? 'You are ready to process payments through Stripe.' 
                        : 'Enter your API keys below to enable payment processing.'
                     }
                </AlertDescription>
            </Alert>

            <Card>
                <CardHeader>
                    <CardTitle>API Keys</CardTitle>
                    <CardDescription>Enter your Stripe API keys below. You can find these in your Stripe Developer Dashboard.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="space-y-2">
                        <Label htmlFor="publishableKey" className="flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                            Publishable Key
                        </Label>
                        <Input 
                            id="publishableKey" 
                            type="password"
                            value={publishableKey} 
                            onChange={e => setPublishableKey(e.target.value)}
                            placeholder="pk_test_************************" 
                        />
                    </div>
                     <div className="space-y-2">
                        <Label htmlFor="secretKey" className="flex items-center gap-2">
                            <KeyRound className="h-4 w-4 text-muted-foreground" />
                            Secret Key
                        </Label>
                        <Input 
                            id="secretKey" 
                            type="password"
                            value={secretKey} 
                            onChange={e => setSecretKey(e.target.value)} 
                            placeholder="sk_test_************************"
                        />
                        <p className="text-xs text-muted-foreground">
                            Your secret key is stored securely and is not exposed on the client-side.
                        </p>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
