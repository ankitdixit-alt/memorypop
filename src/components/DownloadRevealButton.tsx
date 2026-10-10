"use client";

import { useState, useEffect, useCallback } from 'react';

interface DownloadRevealButtonProps {
  shareCode: string;
  className?: string;
  onStatusChange?: (status: ExportStatus, errorMessage?: string) => void;
}

export type ExportStatus = 'idle' | 'creating' | 'processing' | 'ready' | 'downloading' | 'failed';

interface ExportJob {
  jobId: string;
  status: 'pending' | 'processing' | 'completed' | 'failed';
  videoPath?: string;
  errorMessage?: string;
}

export function DownloadRevealButton({ shareCode, className = '', onStatusChange }: DownloadRevealButtonProps) {
  const [status, setStatus] = useState<ExportStatus>('idle');
  const [job, setJob] = useState<ExportJob | null>(null);
  const [errorMessage, setErrorMessage] = useState<string>('');
  const [pollInterval, setPollInterval] = useState<NodeJS.Timeout | null>(null);

  // Notify parent of status changes (if callback provided)
  useEffect(() => {
    onStatusChange?.(status, errorMessage);
  }, [status, errorMessage, onStatusChange]);

  // Clear poll interval on unmount
  useEffect(() => {
    return () => {
      if (pollInterval) {
        clearInterval(pollInterval);
      }
    };
  }, [pollInterval]);

  // Poll for job status
  const pollStatus = useCallback(async (jobId: string) => {
    try {
      const response = await fetch(`/api/export/status?jobId=${jobId}`);

      if (!response.ok) {
        throw new Error('Failed to check status');
      }

      const data = await response.json();

      if (data.status === 'completed') {
        setStatus('ready');
        setJob(data);
        if (pollInterval) {
          clearInterval(pollInterval);
          setPollInterval(null);
        }
      } else if (data.status === 'failed') {
        setStatus('failed');
        setErrorMessage(data.errorMessage || 'Video creation failed');
        if (pollInterval) {
          clearInterval(pollInterval);
          setPollInterval(null);
        }
      } else {
        // Still pending or processing
        setStatus('processing');
        setJob(data);
      }
    } catch (error) {
      console.error('Status poll error:', error);
    }
  }, [pollInterval]);

  // Request export
  const requestExport = async () => {
    setStatus('creating');
    setErrorMessage('');

    try {
      const response = await fetch('/api/export/request', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ shareCode }),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Export request failed');
      }

      const data = await response.json();
      setJob(data);

      if (data.status === 'completed') {
        // Already completed, ready to download
        setStatus('ready');
      } else {
        // Start polling for status
        setStatus('processing');
        const interval = setInterval(() => {
          pollStatus(data.jobId);
        }, 3000); // Poll every 3 seconds
        setPollInterval(interval);

        // Initial poll
        pollStatus(data.jobId);
      }
    } catch (error: any) {
      setStatus('failed');
      setErrorMessage(error.message || 'Failed to create video');
    }
  };

  // Download video
  const downloadVideo = () => {
    if (!job || !job.jobId) return;

    setStatus('downloading');

    // Trigger download via link with authorization
    const link = document.createElement('a');
    link.href = `/api/export/download?jobId=${job.jobId}&shareCode=${encodeURIComponent(shareCode)}`;
    link.download = 'reveal.mp4';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    // Reset to ready after download starts
    setTimeout(() => {
      setStatus('ready');
    }, 1000);
  };

  // Retry after failure
  const retry = () => {
    setStatus('idle');
    setErrorMessage('');
    setJob(null);
  };

  // Render button
  const renderButton = () => {
    switch (status) {
      case 'idle':
        return (
          <button onClick={requestExport} className={className}>
            Create video
          </button>
        );

      case 'creating':
        return (
          <button disabled className={className} style={{ opacity: 0.6, cursor: 'wait' }}>
            Creating your video…
          </button>
        );

      case 'processing':
        return (
          <button disabled className={className} style={{ opacity: 0.6, cursor: 'wait' }}>
            Creating your video…
          </button>
        );

      case 'ready':
        return (
          <button onClick={downloadVideo} className={className}>
            Download video
          </button>
        );

      case 'downloading':
        return (
          <button disabled className={className} style={{ opacity: 0.6, cursor: 'wait' }}>
            Downloading...
          </button>
        );

      case 'failed':
        return (
          <button onClick={retry} className={className}>
            Try again
          </button>
        );

      default:
        return null;
    }
  };

  const button = renderButton();

  // If onStatusChange callback provided, return only button (parent manages layout)
  if (onStatusChange) {
    return button;
  }

  // Otherwise, render helper text below button for backward compatibility (dashboard usage)
  const helperText = getDownloadHelperText(status, errorMessage);

  if (!helperText) {
    return button;
  }

  return (
    <div style={{
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      gap: '0.5rem'
    }}>
      {button}
      <p style={{
        fontSize: '0.85rem',
        color: status === 'failed' ? '#d32f2f' : '#6B5B52',
        textAlign: 'center',
        maxWidth: '300px',
        margin: 0
      }}>
        {helperText}
      </p>
    </div>
  );
}

// Helper text component to render status messages
export function getDownloadHelperText(status: ExportStatus, errorMessage?: string): string | null {
  switch (status) {
    case 'idle':
      return "Save the full reveal as a video to keep or share.";
    case 'processing':
      return "You can keep browsing. Return here to download when it's ready.";
    case 'failed':
      return errorMessage || "We couldn't create your video. Please try again.";
    default:
      return null;
  }
}
