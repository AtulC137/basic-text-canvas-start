import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Download, Upload, Trash2, Eye, Video, ArrowLeft, ArrowRight } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { compressImage } from "@/utils/imageCompression";
import { uploadFileToGoogleDrive } from "@/utils/googleDriveFileUpload";

interface FilePreviewModalProps {
  file: any;
  isOpen: boolean;
  onClose: () => void;
  onCompressReplace: (fileId: string) => void;
  onCompressUpload: (fileId: string) => void;
  onDelete: (fileId: string, fileName: string) => void;
  onPrevious?: () => void;
  onNext?: () => void;
  canGoPrevious?: boolean;
  canGoNext?: boolean;
  currentIndex?: number;
  totalFiles?: number;
}

export const FilePreviewModal = ({ 
  file, 
  isOpen, 
  onClose, 
  onCompressReplace, 
  onCompressUpload, 
  onDelete,
  onPrevious,
  onNext,
  canGoPrevious = false,
  canGoNext = false,
  currentIndex,
  totalFiles
}: FilePreviewModalProps) => {
  const { session } = useAuth();
  const [mediaUrl, setMediaUrl] = useState<string>('');
  const [mediaLoading, setMediaLoading] = useState(false);

  useEffect(() => {
    if (file && (file.mimeType?.startsWith('image/') || file.mimeType?.startsWith('video/'))) {
      loadHighQualityMedia();
    }
  }, [file, session?.provider_token]);

  const loadHighQualityMedia = async () => {
    if (!file || !session?.provider_token) return;

    setMediaLoading(true);
    console.log('Loading high-quality media for:', file.name);

    try {
      // Step 1: Try Drive API with alt=media (Full resolution)
      const apiUrl = `https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`;
      console.log('Attempting Drive API with alt=media:', apiUrl);

      const response = await fetch(apiUrl, {
        headers: {
          Authorization: `Bearer ${session.provider_token}`,
        },
      });

      if (response.ok) {
        const blob = await response.blob();
        const fullResUrl = URL.createObjectURL(blob);
        setMediaUrl(fullResUrl);
        console.log(`✅ Successfully loaded full-resolution ${file.mimeType?.startsWith('video/') ? 'video' : 'image'} via Drive API`);
        setMediaLoading(false);
        return;
      }

      console.log('Drive API failed, trying webContentLink fallback...');
      
      // Step 2: Try webContentLink (Full resolution, requires sharing)
      if (file.webContentLink) {
        console.log('Using webContentLink:', file.webContentLink);
        setMediaUrl(file.webContentLink);
        setMediaLoading(false);
        return;
      }

      console.log('webContentLink not available, falling back to thumbnailLink...');
      
      // Step 3: Fallback to thumbnailLink (Low resolution, only for images)
      if (file.thumbnailLink && file.mimeType?.startsWith('image/')) {
        console.log('Using thumbnailLink as fallback:', file.thumbnailLink);
        setMediaUrl(file.thumbnailLink);
        setMediaLoading(false);
        return;
      }

      // Step 4: Final fallback to placeholder
      console.log('All media sources failed, using placeholder');
      setMediaUrl('/placeholder.svg');
      setMediaLoading(false);

    } catch (error) {
      console.error('Error loading media:', error);
      // Fallback to thumbnailLink or placeholder
      if (file.thumbnailLink && file.mimeType?.startsWith('image/')) {
        setMediaUrl(file.thumbnailLink);
      } else {
        setMediaUrl('/placeholder.svg');
      }
      setMediaLoading(false);
    }
  };

  // Clean up blob URLs when component unmounts or file changes
  useEffect(() => {
    return () => {
      if (mediaUrl && mediaUrl.startsWith('blob:')) {
        URL.revokeObjectURL(mediaUrl);
      }
    };
  }, [mediaUrl]);

  if (!isOpen || !file) return null;

  const renderFilePreview = () => {
    if (file.mimeType?.startsWith('image/')) {
      return (
        <div className="w-full h-full flex justify-center items-center bg-gray-50 rounded-lg">
          {mediaLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading high-quality image...</p>
            </div>
          ) : (
            <img 
              src={mediaUrl}
              alt={file.name}
              className="max-h-full w-auto object-contain mx-auto rounded shadow-lg"
              onLoad={() => {
                console.log("✅ Image rendered successfully");
              }}
              onError={(e) => {
                console.log("❌ Image failed to render, trying next fallback...");
                const target = e.target as HTMLImageElement;
                
                // Try thumbnailLink if not already used
                if (!target.src.includes('thumbnailLink') && file.thumbnailLink) {
                  console.log("Trying thumbnailLink as fallback...");
                  setMediaUrl(file.thumbnailLink);
                } else if (!target.src.includes('placeholder.svg')) {
                  console.log("Using placeholder as final fallback...");
                  setMediaUrl('/placeholder.svg');
                }
              }}
            />
          )}
        </div>
      );
    } else if (file.mimeType?.startsWith('video/')) {
      return (
        <div className="w-full h-full flex justify-center items-center bg-gray-50 rounded-lg">
          {mediaLoading ? (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
              <p className="text-gray-600">Loading video...</p>
            </div>
          ) : mediaUrl && !mediaUrl.includes('placeholder.svg') ? (
            <video 
              src={mediaUrl}
              controls
              className="max-h-full w-auto rounded shadow-lg"
              onLoadedData={() => {
                console.log("✅ Video loaded successfully");
              }}
              onError={(e) => {
                console.log("❌ Video failed to load");
                toast({
                  title: "Video playback failed",
                  description: "Unable to load video. Try opening in Google Drive.",
                  variant: "destructive"
                });
              }}
            >
              Your browser does not support the video tag.
            </video>
          ) : (
            <div className="text-center p-8">
              <Video className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">Video preview not available</p>
              <p className="text-sm text-gray-500">Click "Open in Drive" to view the video</p>
            </div>
          )}
        </div>
      );
    }
    return null;
  };

  const handleCompressReplace = async () => {
    try {
      await onCompressReplace(file.id);
    } catch (error) {
      console.error('Compress and replace failed:', error);
    }
    onClose();
  };

  const handleCompressUpload = async () => {
    try {
      await onCompressUpload(file.id);
    } catch (error) {
      console.error('Compress and upload failed:', error);
    }
    onClose();
  };

  const handleDelete = () => {
    onDelete(file.id, file.name);
    onClose();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <Card className="w-full max-w-7xl h-[95vh] flex flex-col">
        <CardHeader className="flex-shrink-0">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div>
                <CardTitle className="text-lg">{file.name}</CardTitle>
                <CardDescription>
                  {file.mimeType} • {file.size ? `${Math.round(parseInt(file.size) / 1024)} KB` : 'Unknown size'}
                </CardDescription>
              </div>
              {currentIndex !== undefined && totalFiles !== undefined && (
                <div className="text-sm text-gray-500">
                  {currentIndex + 1} of {totalFiles}
                </div>
              )}
            </div>
            <div className="flex items-center space-x-2">
              {/* Navigation Arrows */}
              {onPrevious && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onPrevious}
                  disabled={!canGoPrevious}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowLeft className="w-4 h-4" />
                </Button>
              )}
              {onNext && (
                <Button 
                  variant="ghost" 
                  size="icon"
                  onClick={onNext}
                  disabled={!canGoNext}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <ArrowRight className="w-4 h-4" />
                </Button>
              )}
              <Button 
                variant="ghost" 
                onClick={onClose}
                className="text-gray-500 hover:text-gray-700"
              >
                ✕
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="flex-1 flex flex-col space-y-4 min-h-0 overflow-hidden">
          <div className="flex-1 overflow-hidden">
            {renderFilePreview()}
          </div>
          
          <div className="flex flex-wrap gap-3 justify-center flex-shrink-0">
            <Button 
              onClick={() => {
                onCompressReplace(file.id);
                onClose();
              }}
              className="bg-google-blue hover:bg-blue-600 text-white"
            >
              <Download className="w-4 h-4 mr-2" />
              Compress & Replace
            </Button>
            <Button 
              onClick={() => {
                onCompressUpload(file.id);
                onClose();
              }}
              variant="outline"
              className="border-google-blue text-google-blue hover:bg-blue-50"
            >
              <Upload className="w-4 h-4 mr-2" />
              Compress & Upload
            </Button>
            <Button 
              onClick={() => {
                onDelete(file.id, file.name);
                onClose();
              }}
              variant="destructive"
            >
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
            {file.webViewLink && (
              <Button 
                onClick={() => window.open(file.webViewLink, '_blank')}
                variant="outline"
              >
                <Eye className="w-4 h-4 mr-2" />
                Open in Drive
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
