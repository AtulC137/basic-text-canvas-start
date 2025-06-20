import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Upload, File as FileIcon, X, Check } from "lucide-react";
import { useState, useRef } from "react";
import { toast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { uploadFileToGoogleDrive } from "@/utils/googleDriveFileUpload";
import imageCompression from "browser-image-compression";
import { FFmpeg } from "@ffmpeg/ffmpeg";
import { fetchFile, toBlobURL } from "@ffmpeg/util";
import { driveEventBus } from "@/utils/driveEventBus";
import { compressImage } from "@/utils/imageCompression";

interface UploadedFile {
  id: string;
  name: string;
  size: string;
  originalSize: number;
  compressedSize?: number;
  status: 'pending' | 'compressing' | 'uploading' | 'completed' | 'error';
  fileObject?: File;
  driveLink?: string;
  errorMessage?: string;
}

const UploadCompress = () => {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isDragging, setIsDragging] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [ffmpeg, setFFmpeg] = useState<FFmpeg | null>(null);
  const [ffmpegLoaded, setFFmpegLoaded] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { session } = useAuth();

  const loadFFmpeg = async () => {
    if (ffmpegLoaded) return ffmpeg;
    
    try {
      const ffmpegInstance = new FFmpeg();
      
      // Use jsDelivr CDN which is more reliable
      const baseURL = 'https://cdn.jsdelivr.net/npm/@ffmpeg/core@0.12.6/dist/esm';
      
      await ffmpegInstance.load({
        coreURL: await toBlobURL(`${baseURL}/ffmpeg-core.js`, 'text/javascript'),
        wasmURL: await toBlobURL(`${baseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        workerURL: await toBlobURL(`${baseURL}/ffmpeg-core.worker.js`, 'text/javascript'),
      });
      
      setFFmpeg(ffmpegInstance);
      setFFmpegLoaded(true);
      console.log('✅ FFmpeg loaded successfully');
      return ffmpegInstance;
    } catch (error) {
      console.error('❌ Failed to load FFmpeg:', error);
      
      // Try alternative CDN as fallback
      try {
        const ffmpegInstance = new FFmpeg();
        const altBaseURL = 'https://unpkg.com/@ffmpeg/core-st@0.12.6/dist/esm';
        
        await ffmpegInstance.load({
          coreURL: await toBlobURL(`${altBaseURL}/ffmpeg-core.js`, 'text/javascript'),
          wasmURL: await toBlobURL(`${altBaseURL}/ffmpeg-core.wasm`, 'application/wasm'),
        });
        
        setFFmpeg(ffmpegInstance);
        setFFmpegLoaded(true);
        console.log('✅ FFmpeg loaded successfully via fallback CDN');
        return ffmpegInstance;
      } catch (fallbackError) {
        console.error('❌ Failed to load FFmpeg via fallback:', fallbackError);
        throw new Error('Failed to load FFmpeg from both primary and fallback CDNs');
      }
    }
  };

  const compressVideo = async (file: File): Promise<File> => {
    console.log(`🎥 Starting video compression for: ${file.name}`);
    
    const ffmpegInstance = await loadFFmpeg();
    if (!ffmpegInstance) {
      throw new Error('FFmpeg not loaded');
    }

    try {
      // Write input file
      const inputName = 'input.mp4';
      const outputName = 'output.mp4';
      
      await ffmpegInstance.writeFile(inputName, await fetchFile(file));
      
      // Compress video with reasonable settings
      // CRF 28 = good quality/size balance, preset fast = reasonable speed
      await ffmpegInstance.exec([
        '-i', inputName,
        '-vcodec', 'libx264',
        '-crf', '28',
        '-preset', 'fast',
        '-movflags', '+faststart',
        '-y', // Overwrite output file
        outputName
      ]);
      
      // Read compressed file
      const data = await ffmpegInstance.readFile(outputName);
      const compressedBlob = new Blob([data], { type: 'video/mp4' });
      
      // Clean up
      await ffmpegInstance.deleteFile(inputName);
      await ffmpegInstance.deleteFile(outputName);
      
      // Convert back to File object
      const compressedFile = new File(
        [compressedBlob], 
        `compressed_${file.name}`, 
        { type: 'video/mp4' }
      );
      
      console.log(`✅ Video compression complete: ${formatFileSize(file.size)} → ${formatFileSize(compressedFile.size)}`);
      return compressedFile;
      
    } catch (error) {
      console.error('❌ Video compression failed:', error);
      throw error;
    }
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  };

  const handleFiles = (files: File[]) => {
    const newFiles: UploadedFile[] = files.map(file => ({
      id: Math.random().toString(36).substr(2, 9),
      name: file.name,
      size: formatFileSize(file.size),
      originalSize: file.size,
      status: 'pending' as const,
      fileObject: file,
    }));
    
    setUploadedFiles(prev => [...prev, ...newFiles]);
  };

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const removeFile = (id: string) => {
    setUploadedFiles(prev => prev.filter(file => file.id !== id));
  };

  const compressAndUploadToDrive = async () => {
    if (uploadedFiles.length === 0) {
      toast({
        title: "No files to process",
        description: "Please upload files first",
        variant: "destructive",
      });
      return;
    }

    if (!session?.provider_token) {
      toast({
        title: "Not authenticated",
        description: "Connect to Google Drive before uploading.",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    const pendingFiles = uploadedFiles.filter(file => file.status === 'pending');
    
    let completedCount = 0;
    let totalSaved = 0;

    for (const file of pendingFiles) {
      try {
        const isImage = file.fileObject && /image\/(jpeg|png|webp)/i.test(file.fileObject.type);
        const isVideo = file.fileObject && /video\/(mp4|mov|avi|webm|mkv)/i.test(file.fileObject.type);
        
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === file.id ? { 
              ...f, 
              status: 'compressing' as const 
            } : f
          )
        );

        let fileToUpload: File;
        let compressedSize: number;

        if (file.fileObject) {
          if (isImage) {
            // Compress images using the dedicated utility
            if (file.originalSize < 50 * 1024) {
              console.log(`Skipping compression for small image: ${file.name}`);
              fileToUpload = file.fileObject;
              compressedSize = file.originalSize;
            } else {
              try {
                console.log(`🖼️ Starting image compression for: ${file.name}`);
                const compressedFile = await compressImage(file.fileObject);
                
                if (compressedFile.size < file.originalSize) {
                  fileToUpload = new File(
                    [await compressedFile.arrayBuffer()],
                    "compressed_" + file.fileObject.name,
                    { type: compressedFile.type }
                  );
                  compressedSize = compressedFile.size;
                  console.log(`✅ Image compression successful: ${formatFileSize(file.originalSize)} → ${formatFileSize(compressedSize)}`);
                } else {
                  console.log(`⚠️ Image compression made file larger, using original`);
                  fileToUpload = file.fileObject;
                  compressedSize = file.originalSize;
                }
              } catch (err) {
                console.error('❌ Image compression failed:', err);
                toast({
                  title: "Image compression failed",
                  description: `Could not compress ${file.name}. Uploading original file.`,
                  variant: "destructive",
                });
                fileToUpload = file.fileObject;
                compressedSize = file.originalSize;
              }
            }
          } else if (isVideo) {
            // Compress videos using FFmpeg
            try {
              // Load FFmpeg first
              await loadFFmpeg();
              const compressedFile = await compressVideo(file.fileObject);
              
              if (compressedFile.size < file.originalSize) {
                fileToUpload = compressedFile;
                compressedSize = compressedFile.size;
                console.log(`✅ Video compression successful: ${formatFileSize(file.originalSize)} → ${formatFileSize(compressedSize)}`);
              } else {
                console.log(`⚠️ Video compression made file larger, using original`);
                fileToUpload = file.fileObject;
                compressedSize = file.originalSize;
              }
            } catch (err) {
              console.error('Video compression failed:', err);
              toast({
                title: "Video compression failed",
                description: `Could not compress ${file.name}. This might be due to FFmpeg loading issues. Uploading original file.`,
                variant: "destructive",
              });
              fileToUpload = file.fileObject;
              compressedSize = file.originalSize;
            }
          } else {
            // Documents and other files: no compression
            console.log(`Skipping compression for document: ${file.name}`);
            fileToUpload = file.fileObject;
            compressedSize = file.originalSize;
          }

          // Update status to uploading
          setUploadedFiles(prev =>
            prev.map(f =>
              f.id === file.id
                ? {
                    ...f,
                    status: 'uploading' as const,
                    compressedSize,
                    fileObject: fileToUpload,
                  }
                : f
            )
          );

          // Upload to Google Drive
          const uploadResult = await uploadFileToGoogleDrive({
            accessToken: session.provider_token,
            file: fileToUpload,
            fileName: fileToUpload.name,
            mimeType: fileToUpload.type || "application/octet-stream",
          });

          if ("success" in uploadResult && uploadResult.success) {
            setUploadedFiles(prev =>
              prev.map(f =>
                f.id === file.id
                  ? {
                      ...f,
                      status: 'completed' as const,
                      driveLink: uploadResult.webViewLink,
                    }
                  : f
              )
            );
            completedCount++;
            if (compressedSize < file.originalSize) {
              totalSaved += (file.originalSize - compressedSize);
            }
          } else {
            setUploadedFiles(prev =>
              prev.map(f =>
                f.id === file.id
                  ? {
                      ...f,
                      status: 'error' as const,
                      errorMessage: "error" in uploadResult ? uploadResult.error : "Unknown error",
                    }
                  : f
              )
            );
          }
        }
      } catch (error: any) {
        setUploadedFiles(prev =>
          prev.map(f =>
            f.id === file.id
              ? {
                  ...f,
                  status: 'error' as const,
                  errorMessage: error.message || "Unknown error occurred",
                }
              : f
          )
        );
      }
    }

    setIsProcessing(false);
    driveEventBus.emit("refresh");

    if (completedCount > 0) {
      const toastDescription = totalSaved > 0 
        ? `${completedCount} files uploaded successfully. ${formatFileSize(totalSaved)} saved through compression!`
        : `${completedCount} files uploaded successfully.`;
      
      toast({
        title: "Process Complete!",
        description: toastDescription,
      });
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="flex items-center mb-6">
              <SidebarTrigger className="mr-4" />
              <div>
                <h1 className="text-3xl font-bold text-gray-900">Upload & Compress</h1>
                <p className="text-gray-600">Upload new files and compress images & videos for your Drive</p>
              </div>
            </div>

            {/* Upload Area */}
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Upload Files</CardTitle>
                <CardDescription>Drag and drop files here or click to browse</CardDescription>
              </CardHeader>
              <CardContent>
                <div
                  className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                    isDragging 
                      ? 'border-google-blue bg-blue-50' 
                      : 'border-gray-300 hover:border-gray-400'
                  }`}
                  onDragOver={handleDragOver}
                  onDragLeave={handleDragLeave}
                  onDrop={handleDrop}
                >
                  <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-google-blue' : 'text-gray-400'}`} />
                  <h3 className="text-lg font-medium mb-2">Drop your files here</h3>
                  <p className="text-gray-600 mb-4">or</p>
                  <Button onClick={() => fileInputRef.current?.click()}>
                    Browse Files
                  </Button>
                  <input
                    ref={fileInputRef}
                    type="file"
                    multiple
                    className="hidden"
                    onChange={handleFileSelect}
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx"
                  />
                  <p className="text-xs text-gray-500 mt-4">
                    Supports images, videos, documents, and more. Images and videos will be compressed.
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Uploaded Files */}
            {uploadedFiles.length > 0 && (
              <Card>
                <CardHeader className="flex flex-row items-center justify-between">
                  <div>
                    <CardTitle>Files Ready for Processing</CardTitle>
                    <CardDescription>{uploadedFiles.length} files selected</CardDescription>
                  </div>
                  <Button 
                    onClick={compressAndUploadToDrive}
                    className="bg-google-blue hover:bg-blue-600"
                    disabled={isProcessing || !uploadedFiles.some(f => f.status === 'pending')}
                  >
                    {isProcessing ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2"></div>
                        Processing...
                      </>
                    ) : (
                      'Compress & Upload to Drive'
                    )}
                  </Button>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {uploadedFiles.map((file) => (
                      <div key={file.id} className="flex items-center space-x-4 p-3 bg-gray-50 rounded-lg">
                        <FileIcon className="w-5 h-5 text-gray-400 flex-shrink-0" />
                        <div className="flex-1 min-w-0">
                          <p className="font-medium truncate">{file.name}</p>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <span>{file.size}</span>
                            {file.compressedSize && file.compressedSize < file.originalSize && (
                              <>
                                <span>→</span>
                                <span className="text-google-green font-medium">
                                  {formatFileSize(file.compressedSize)}
                                </span>
                                <span className="text-google-green">
                                  ({Math.round(((file.originalSize - file.compressedSize) / file.originalSize) * 100)}% saved)
                                </span>
                              </>
                            )}
                          </div>
                          {file.errorMessage && (
                            <p className="text-red-500 text-sm mt-1">{file.errorMessage}</p>
                          )}
                        </div>
                        <div className="flex items-center space-x-2">
                          {file.status === 'pending' && (
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => removeFile(file.id)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          )}
                          {(file.status === 'compressing' || file.status === 'uploading') && (
                            <div className="flex items-center space-x-2">
                              <div className="w-4 h-4 border-2 border-google-blue border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-sm text-google-blue">
                                {file.status === 'compressing' ? 'Compressing...' : 'Uploading...'}
                              </span>
                            </div>
                          )}
                          {file.status === 'completed' && (
                            <div className="flex items-center space-x-2">
                              <Check className="w-4 h-4 text-google-green" />
                              {file.driveLink && (
                                <a
                                  href={file.driveLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center text-google-blue underline text-sm"
                                  title="Open in Drive"
                                >
                                  <FileIcon className="w-4 h-4 mr-1" />
                                  Open in Drive
                                </a>
                              )}
                            </div>
                          )}
                          {file.status === 'error' && (
                            <div className="text-red-500 text-sm">Failed</div>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default UploadCompress;
