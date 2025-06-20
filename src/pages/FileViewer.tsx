
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Eye, FileText, Image, Video } from "lucide-react";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";
import { useGoogleDriveData } from "@/hooks/useGoogleDriveData";
import { ProtectedRoute } from "@/hooks/ProtectedRoute";
import { FilePreviewModal } from "@/components/FilePreviewModal";

const FileViewer = () => {
  const { driveData, loading, error, hasValidToken } = useGoogleDriveData();
  const [selectedFileIndex, setSelectedFileIndex] = useState<number | null>(null);

  const getFileIcon = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    return FileText;
  };

  const getTypeColor = (mimeType: string) => {
    if (mimeType.startsWith('image/')) return 'bg-green-100 text-green-800';
    if (mimeType.startsWith('video/')) return 'bg-red-100 text-red-800';
    return 'bg-blue-100 text-blue-800';
  };

  const canPreview = (mimeType: string) => {
    return mimeType.startsWith('image/') || mimeType.startsWith('video/');
  };

  // Filter only image and video files
  const previewableFiles = driveData?.files?.filter(file => canPreview(file.mimeType || '')) || [];

  const handleFileClick = (file: any, index: number) => {
    if (canPreview(file.mimeType)) {
      setSelectedFileIndex(index);
    }
  };

  const handlePrevious = () => {
    if (selectedFileIndex !== null && selectedFileIndex > 0) {
      setSelectedFileIndex(selectedFileIndex - 1);
    }
  };

  const handleNext = () => {
    if (selectedFileIndex !== null && selectedFileIndex < previewableFiles.length - 1) {
      setSelectedFileIndex(selectedFileIndex + 1);
    }
  };

  const selectedFile = selectedFileIndex !== null ? previewableFiles[selectedFileIndex] : null;

  const handleCompressAndReplace = (fileId: string) => {
    console.log("Compressing and replacing file:", fileId);
    toast({ 
      title: "Compression started", 
      description: `Compressing file and replacing original...` 
    });
  };

  const handleCompressAndUpload = (fileId: string) => {
    console.log("Compressing and uploading file:", fileId);
    toast({ 
      title: "Compression started", 
      description: `Compressing file and uploading as new file...` 
    });
  };

  const handleDelete = (fileId: string, fileName: string) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName}"? This cannot be undone.`)) return;
    
    console.log("Deleting file:", fileId);
    toast({ 
      title: "File deleted", 
      description: fileName 
    });
  };

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <main className="flex-1">
            <div className="p-6">
              <div className="flex items-center mb-6">
                <SidebarTrigger className="mr-4" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">View & Open Files</h1>
                  <p className="text-gray-600">Preview and manage your images and videos</p>
                </div>
              </div>

              {loading ? (
                <div className="flex items-center justify-center py-16">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-google-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading your files...</p>
                  </div>
                </div>
              ) : error ? (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="py-6 text-center">
                    <p className="text-red-600">Error loading files: {error}</p>
                  </CardContent>
                </Card>
              ) : (
                <>
                  {/* File Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4 mb-6">
                    {previewableFiles.map((file, index) => {
                      const FileIcon = getFileIcon(file.mimeType || '');
                      return (
                        <Card 
                          key={file.id} 
                          className="hover:shadow-lg transition-shadow duration-200 cursor-pointer"
                          onClick={() => handleFileClick(file, index)}
                        >
                          <CardContent className="p-4">
                            <div className="mb-3">
                              {file.thumbnailLink && file.mimeType.startsWith('image/') ? (
                                <div className="w-full h-32 rounded-lg overflow-hidden bg-gray-100">
                                  <img 
                                    src={file.thumbnailLink} 
                                    alt={file.name}
                                    className="w-full h-full object-cover"
                                  />
                                </div>
                              ) : (
                                <div className={`w-full h-32 rounded-lg flex items-center justify-center ${getTypeColor(file.mimeType || '')}`}>
                                  <FileIcon className="w-12 h-12" />
                                </div>
                              )}
                            </div>
                            <div className="min-w-0">
                              <h3 className="font-medium text-sm truncate mb-1" title={file.name}>{file.name}</h3>
                              <p className="text-xs text-gray-500 mb-2">
                                {file.size ? `${Math.round(parseInt(file.size) / 1024)} KB` : 'Unknown size'}
                              </p>
                              <Badge className={`text-xs ${getTypeColor(file.mimeType || '')}`}>
                                {file.mimeType.split('/')[0]}
                              </Badge>
                            </div>
                          </CardContent>
                        </Card>
                      );
                    })}
                  </div>

                  {previewableFiles.length === 0 && (
                    <Card className="border-2 border-dashed border-gray-300">
                      <CardContent className="text-center py-16">
                        <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                          <Eye className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="text-xl font-semibold mb-2">No Preview Files Found</h3>
                        <p className="text-gray-600 mb-6 max-w-md mx-auto">
                          No images or videos found in your Google Drive. Upload some media files to get started.
                        </p>
                      </CardContent>
                    </Card>
                  )}

                  {/* File Preview Modal with Navigation */}
                  {selectedFile && selectedFileIndex !== null && (
                    <FilePreviewModal
                      file={selectedFile}
                      isOpen={true}
                      onClose={() => setSelectedFileIndex(null)}
                      onCompressReplace={handleCompressAndReplace}
                      onCompressUpload={handleCompressAndUpload}
                      onDelete={handleDelete}
                      onPrevious={handlePrevious}
                      onNext={handleNext}
                      canGoPrevious={selectedFileIndex > 0}
                      canGoNext={selectedFileIndex < previewableFiles.length - 1}
                      currentIndex={selectedFileIndex}
                      totalFiles={previewableFiles.length}
                    />
                  )}
                </>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default FileViewer;
