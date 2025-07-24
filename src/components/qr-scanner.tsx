'use client';

import React, { useEffect, useRef, useState } from 'react';
import { BrowserMultiFormatReader, NotFoundException } from '@zxing/library';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Camera, CameraOff, RotateCcw, Flashlight, FlashlightOff } from 'lucide-react';
import { cn } from '@/lib/utils';

interface QrScannerProps {
  onScan: (result: string) => void;
  onError?: (error: string) => void;
  isActive?: boolean;
  className?: string;
}

export function QrScanner({ onScan, onError, isActive = true, className }: QrScannerProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const codeReader = useRef<BrowserMultiFormatReader | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [devices, setDevices] = useState<MediaDeviceInfo[]>([]);
  const [selectedDeviceId, setSelectedDeviceId] = useState<string>('');
  const [hasFlash, setHasFlash] = useState(false);
  const [flashEnabled, setFlashEnabled] = useState(false);
  const streamRef = useRef<MediaStream | null>(null);

  // Initialize code reader
  useEffect(() => {
    codeReader.current = new BrowserMultiFormatReader();
    return () => {
      if (codeReader.current) {
        codeReader.current.reset();
      }
    };
  }, []);

  // Get available cameras
  useEffect(() => {
    const getDevices = async () => {
      try {
        // Use the standard MediaDevices API to enumerate devices
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter(device => device.kind === 'videoinput');
        setDevices(videoDevices);

        // Select back camera by default (usually better for QR scanning)
        const backCamera = videoDevices.find(device =>
          device.label.toLowerCase().includes('back') ||
          device.label.toLowerCase().includes('rear')
        );
        setSelectedDeviceId(backCamera?.deviceId || videoDevices[0]?.deviceId || '');
      } catch (err) {
        console.error('Error getting video devices:', err);
        setError('Unable to access camera devices');
        onError?.('Unable to access camera devices');
      }
    };

    getDevices();
  }, [onError]);

  // Start scanning
  const startScanning = async () => {
    if (!codeReader.current || !videoRef.current) return;

    try {
      setError(null);
      setIsScanning(true);

      // Request camera permission
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          deviceId: selectedDeviceId ? { exact: selectedDeviceId } : undefined,
          facingMode: selectedDeviceId ? undefined : { ideal: 'environment' },
          width: { ideal: 1280 },
          height: { ideal: 720 },
        }
      });

      streamRef.current = stream;
      videoRef.current.srcObject = stream;
      setHasPermission(true);

      // Check if device supports flash
      const track = stream.getVideoTracks()[0];
      const capabilities = track.getCapabilities();
      setHasFlash('torch' in capabilities);

      // Start decoding
      codeReader.current.decodeFromVideoDevice(
        selectedDeviceId || null,
        videoRef.current,
        (result, error) => {
          if (result) {
            const qrCode = result.getText();
            console.log('QR Code scanned:', qrCode);
            onScan(qrCode);
            // Don't stop scanning automatically - let parent component decide
          }
          
          if (error && !(error instanceof NotFoundException)) {
            console.error('QR Scanner error:', error);
          }
        }
      );
    } catch (err) {
      console.error('Error starting camera:', err);
      const errorMessage = err instanceof Error ? err.message : 'Failed to start camera';
      setError(errorMessage);
      setHasPermission(false);
      setIsScanning(false);
      onError?.(errorMessage);
    }
  };

  // Stop scanning
  const stopScanning = () => {
    if (codeReader.current) {
      codeReader.current.reset();
    }
    
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    
    setIsScanning(false);
    setFlashEnabled(false);
  };

  // Toggle flash
  const toggleFlash = async () => {
    if (!streamRef.current || !hasFlash) return;

    try {
      const track = streamRef.current.getVideoTracks()[0];
      await track.applyConstraints({
        advanced: [{ torch: !flashEnabled } as any]
      });
      setFlashEnabled(!flashEnabled);
    } catch (err) {
      console.error('Error toggling flash:', err);
    }
  };

  // Switch camera
  const switchCamera = () => {
    if (devices.length <= 1) return;
    
    const currentIndex = devices.findIndex(device => device.deviceId === selectedDeviceId);
    const nextIndex = (currentIndex + 1) % devices.length;
    setSelectedDeviceId(devices[nextIndex].deviceId);
    
    if (isScanning) {
      stopScanning();
      // Restart with new device after a short delay
      setTimeout(() => {
        startScanning();
      }, 100);
    }
  };

  // Handle active state changes
  useEffect(() => {
    if (isActive && !isScanning && hasPermission !== false) {
      startScanning();
    } else if (!isActive && isScanning) {
      stopScanning();
    }
  }, [isActive]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      stopScanning();
    };
  }, []);

  if (hasPermission === false) {
    return (
      <Card className={cn("w-full max-w-md mx-auto", className)}>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CameraOff className="h-5 w-5" />
            Camera Access Required
          </CardTitle>
          <CardDescription>
            Please allow camera access to scan QR codes
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button onClick={startScanning} className="w-full">
            <Camera className="h-4 w-4 mr-2" />
            Enable Camera
          </Button>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className={cn("w-full max-w-md mx-auto", className)} data-testid="qr-scanner-container">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Camera className="h-5 w-5" />
            Scan QR Code
          </span>
          <div className="flex gap-2">
            {hasFlash && (
              <Button
                variant="outline"
                size="sm"
                onClick={toggleFlash}
                disabled={!isScanning}
                data-testid="flash-toggle"
              >
                {flashEnabled ? (
                  <FlashlightOff className="h-4 w-4" />
                ) : (
                  <Flashlight className="h-4 w-4" />
                )}
              </Button>
            )}
            {devices.length > 1 && (
              <Button
                variant="outline"
                size="sm"
                onClick={switchCamera}
                disabled={!isScanning}
                data-testid="camera-toggle"
              >
                <RotateCcw className="h-4 w-4" />
              </Button>
            )}
          </div>
        </CardTitle>
        <CardDescription>
          Point your camera at the QR code on your table
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}
        
        <div className="relative aspect-square bg-black rounded-lg overflow-hidden" data-testid="qr-scanner">
          <video
            ref={videoRef}
            className="w-full h-full object-cover"
            playsInline
            muted
            autoPlay
            data-testid="scanner-video"
          />
          
          {/* Scanning overlay */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="relative">
              {/* Corner brackets */}
              <div className="absolute -top-4 -left-4 w-8 h-8 border-l-4 border-t-4 border-white rounded-tl-lg" />
              <div className="absolute -top-4 -right-4 w-8 h-8 border-r-4 border-t-4 border-white rounded-tr-lg" />
              <div className="absolute -bottom-4 -left-4 w-8 h-8 border-l-4 border-b-4 border-white rounded-bl-lg" />
              <div className="absolute -bottom-4 -right-4 w-8 h-8 border-r-4 border-b-4 border-white rounded-br-lg" />
              
              {/* Scanning area */}
              <div className="w-48 h-48 border-2 border-dashed border-white/50 rounded-lg" />
              
              {/* Scanning line animation */}
              {isScanning && (
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-white to-transparent animate-pulse" />
              )}
            </div>
          </div>
          
          {/* Status indicator */}
          <div className="absolute top-4 left-4">
            <div className={cn(
              "flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium",
              isScanning 
                ? "bg-green-500/20 text-green-400 border border-green-500/30" 
                : "bg-red-500/20 text-red-400 border border-red-500/30"
            )}>
              <div className={cn(
                "w-2 h-2 rounded-full",
                isScanning ? "bg-green-400 animate-pulse" : "bg-red-400"
              )} />
              {isScanning ? "Scanning..." : "Camera Off"}
            </div>
          </div>
        </div>

        <div className="flex gap-2">
          {!isScanning ? (
            <Button onClick={startScanning} className="flex-1">
              <Camera className="h-4 w-4 mr-2" />
              Start Scanning
            </Button>
          ) : (
            <Button onClick={stopScanning} variant="outline" className="flex-1">
              <CameraOff className="h-4 w-4 mr-2" />
              Stop Scanning
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
