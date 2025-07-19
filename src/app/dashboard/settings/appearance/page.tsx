
'use client';

import { useState } from 'react';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Upload, Check } from 'lucide-react';
import { cn } from '@/lib/utils';
import Image from 'next/image';

const templates = [
    {
        name: 'Modern',
        description: 'A clean, modern layout with a prominent logo.',
        image: 'https://placehold.co/400x560.png'
    },
    {
        name: 'Classic',
        description: 'A traditional layout, suitable for formal documents.',
        image: 'https://placehold.co/400x560.png'
    },
    {
        name: 'Compact',
        description: 'A space-saving design for shorter invoices.',
        image: 'https://placehold.co/400x560.png'
    }
]

export default function AppearancePage() {
    const [primaryColor, setPrimaryColor] = useState('#3498DB');
    const [selectedTemplate, setSelectedTemplate] = useState('Modern');
    const [footerText, setFooterText] = useState('Thank you for your business! Please pay within 30 days.');

    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h1 className="text-3xl font-bold">Appearance</h1>
                <p className="text-muted-foreground">Customize your brand, logo, and invoice templates.</p>
            </div>

            <Card>
                <CardHeader>
                    <CardTitle>Branding</CardTitle>
                    <CardDescription>Update your company logo and brand color.</CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
                        <div>
                            <Label>Company Logo</Label>
                             <div className="mt-2 flex items-center gap-4">
                                <Image
                                    src="https://placehold.co/80x80.png"
                                    alt="Company logo placeholder"
                                    data-ai-hint="logo"
                                    width={80}
                                    height={80}
                                    className="rounded-md bg-muted"
                                />
                                <Button variant="outline">
                                    <Upload className="mr-2 h-4 w-4" />
                                    Upload Logo
                                </Button>
                            </div>
                        </div>
                        <div>
                            <Label htmlFor="brand-color">Brand Color</Label>
                            <div className="mt-2 flex items-center gap-2">
                                <div className="relative">
                                    <Input
                                        id="brand-color"
                                        type="color"
                                        value={primaryColor}
                                        onChange={(e) => setPrimaryColor(e.target.value)}
                                        className="h-10 w-14 p-1 cursor-pointer"
                                    />
                                </div>
                                <Input
                                    value={primaryColor}
                                    onChange={(e) => setPrimaryColor(e.target.value)}
                                    className="w-32"
                                />
                            </div>
                        </div>
                    </div>
                     <div>
                        <Label htmlFor="footer-text">Default Invoice & Estimate Footer</Label>
                        <Textarea
                            id="footer-text"
                            value={footerText}
                            onChange={(e) => setFooterText(e.target.value)}
                            placeholder="e.g., Payment Terms: Net 30"
                            className="mt-2"
                        />
                    </div>
                </CardContent>
            </Card>
            
            <Card>
                <CardHeader>
                    <CardTitle>Invoice & Estimate Templates</CardTitle>
                    <CardDescription>Choose a layout for your customer-facing documents.</CardDescription>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                        {templates.map((template) => {
                            const isSelected = selectedTemplate === template.name;
                            return (
                                <div key={template.name} className="relative">
                                    <button
                                        onClick={() => setSelectedTemplate(template.name)}
                                        className={cn(
                                            "block w-full rounded-lg border-2 p-2 transition-all",
                                            isSelected ? "border-primary ring-2 ring-primary" : "border-muted hover:border-primary/50"
                                        )}
                                    >
                                        <Image
                                            src={template.image}
                                            alt={`${template.name} template preview`}
                                            data-ai-hint="invoice document"
                                            width={400}
                                            height={560}
                                            className="rounded-md"
                                        />
                                    </button>
                                     {isSelected && (
                                        <div className="absolute top-4 right-4 h-6 w-6 rounded-full bg-primary flex items-center justify-center text-primary-foreground">
                                            <Check className="h-4 w-4" />
                                        </div>
                                    )}
                                    <div className="mt-2 text-center">
                                        <h3 className="font-semibold">{template.name}</h3>
                                        <p className="text-sm text-muted-foreground">{template.description}</p>
                                    </div>
                                </div>
                            )
                        })}
                    </div>
                </CardContent>
            </Card>

            <div className="flex justify-end">
                <Button>Save Changes</Button>
            </div>
        </div>
    )
}
