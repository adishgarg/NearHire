'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Upload, X, ImageIcon } from 'lucide-react';
import Image from 'next/image';

interface UploadedFile {
  url: string;
  publicId: string;
  width?: number;
  height?: number;
}

interface FileUploadProps {
  onUpload: (files: UploadedFile[]) => void;
  maxFiles?: number;
  acceptedTypes?: string[];
  folder?: string;
  existingFiles?: UploadedFile[];
}

export function FileUpload({
  onUpload,
  maxFiles = 5,
  acceptedTypes = ['image/jpeg', 'image/png', 'image/webp'],
  folder = 'gigs',
  existingFiles = []
}: FileUploadProps) {
  const [files, setFiles] = useState<UploadedFile[]>(existingFiles);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [dragActive, setDragActive] = useState(false);

  const uploadFile = async (file: File): Promise<UploadedFile> => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('folder', folder);

    const response = await fetch('/api/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({ error: 'Unknown error' }));
      console.error('Upload failed:', response.status, errorData);
      throw new Error(errorData.error || `Upload failed with status ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  };

  const handleFiles = async (selectedFiles: FileList) => {
    if (files.length + selectedFiles.length > maxFiles) {
      alert(`Maximum ${maxFiles} files allowed`);
      return;
    }

    setUploading(true);
    setProgress(0);

    try {
      const fileArray = Array.from(selectedFiles);
      const totalFiles = fileArray.length;
      const uploadedFiles: UploadedFile[] = [];

      for (let i = 0; i < fileArray.length; i++) {
        const file = fileArray[i];
        
        if (!acceptedTypes.includes(file.type)) {
          alert(`File type ${file.type} not supported`);
          continue;
        }

        const uploadedFile = await uploadFile(file);
        uploadedFiles.push(uploadedFile);
        setProgress((i + 1) / totalFiles * 100);
      }

      const newFiles = [...files, ...uploadedFiles];
      setFiles(newFiles);
      onUpload(newFiles);
    } catch (error) {
      console.error('Upload error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Upload failed. Please try again.';
      alert(`Upload failed: ${errorMessage}`);
    } finally {
      setUploading(false);
      setProgress(0);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    setFiles(newFiles);
    onUpload(newFiles);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
  };

  return (
    <div className="space-y-4">
      {/* Upload Area */}
      <Card
        className={`border-2 border-dashed p-8 text-center transition-colors ${
          dragActive
            ? 'border-emerald-500 bg-emerald-50 dark:bg-emerald-950'
            : 'border-zinc-300 dark:border-zinc-700'
        }`}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
      >
        <div className="mx-auto flex max-w-sm flex-col items-center justify-center">
          <Upload className="mb-4 h-10 w-10 text-zinc-500" />
          <div className="mb-4">
            <p className="text-lg font-medium text-zinc-900 dark:text-zinc-100">
              Drop files here or click to upload
            </p>
            <p className="text-sm text-zinc-500">
              Support for JPG, PNG, WEBP up to 10MB
            </p>
            <p className="text-xs text-zinc-400">
              {files.length}/{maxFiles} files uploaded
            </p>
          </div>
          
          <Button
            type="button"
            variant="outline"
            disabled={uploading || files.length >= maxFiles}
            onClick={() => {
              const input = document.createElement('input');
              input.type = 'file';
              input.multiple = true;
              input.accept = acceptedTypes.join(',');
              input.onchange = (e) => {
                const target = e.target as HTMLInputElement;
                if (target.files) {
                  handleFiles(target.files);
                }
              };
              input.click();
            }}
          >
            <ImageIcon className="mr-2 h-4 w-4" />
            Choose Files
          </Button>
        </div>
      </Card>

      {/* Upload Progress */}
      {uploading && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span>Uploading...</span>
            <span>{Math.round(progress)}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      )}

      {/* Uploaded Files Preview */}
      {files.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {files.map((file, index) => (
            <div key={file.publicId} className="group relative">
              <div className="aspect-square overflow-hidden rounded-lg border border-zinc-200 dark:border-zinc-700">
                <Image
                  src={file.url}
                  alt={`Upload ${index + 1}`}
                  width={200}
                  height={200}
                  className="h-full w-full object-cover"
                />
              </div>
              <Button
                variant="destructive"
                size="sm"
                className="absolute -top-2 -right-2 h-6 w-6 rounded-full p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                onClick={() => removeFile(index)}
              >
                <X className="h-3 w-3" />
              </Button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}