import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { HardDrive, Grid, List, Link, File, Image, Video, FileText, Folder, ChevronRight, ArrowLeft, Download, Upload } from "lucide-react";
import { ProtectedRoute } from "@/hooks/ProtectedRoute";
import { useState, useEffect } from "react";
import { toast } from "@/hooks/use-toast";
import { driveEventBus } from "@/utils/driveEventBus";
import { useAuth } from "@/contexts/AuthContext";
import { useGoogleDriveData } from "@/hooks/useGoogleDriveData";
import { FilePreviewModal } from "@/components/FilePreviewModal";
import { compressImage } from "@/utils/imageCompression";
import { uploadFileToGoogleDrive } from "@/utils/googleDriveFileUpload";

console.log('FilePreviewModal import value:', "delayed import to below authInitialized guard");

const DriveView = () => {
  const navigate = useNavigate();
  const { authInitialized, loading, session } = useAuth();
  const [currentFolderId, setCurrentFolderId] = useState('root');
  const [folderPath, setFolderPath] = useState([{ id: 'root', name: 'My Drive' }]);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [selectedFiles, setSelectedFiles] = useState<Set<string>>(new Set());
  const [previewFile, setPreviewFile] = useState<any>(null);

  // Only continue after authInitialized
  if (!authInitialized) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <div className="w-4 h-4 border-2 border-google-blue border-t-transparent rounded-full animate-spin"></div>
          <span>Loading authentication...</span>
        </div>
      </div>
    );
  }

  // Now safe to use hooks/components after authInitialized:
  const { driveData, loading: driveLoading, error, hasValidToken, refetch } = useGoogleDriveData(currentFolderId);

  // ---- Start: Local fileList state for reactive updates ----
  const [fileList, setFileList] = useState<any[]>([]);

  useEffect(() => {
    if (driveData?.files) {
      setFileList(driveData.files);
    }
  }, [driveData?.files]);
  // ---- End: fileList management ----

  // Helper: Check if file can be previewed
  const canPreview = (mimeType: string) => {
    return mimeType?.startsWith('image/') || mimeType?.startsWith('video/');
  };

  // Helper: Toggle file selection - Updated to handle both event types
  const toggleFileSelection = (fileId: string, e?: React.MouseEvent | React.ChangeEvent) => {
    if (e) {
      e.stopPropagation();
    }
    const newSelected = new Set(selectedFiles);
    if (newSelected.has(fileId)) {
      newSelected.delete(fileId);
    } else {
      newSelected.add(fileId);
    }
    setSelectedFiles(newSelected);
  };

  // Helper: Select all files
  const selectAllFiles = () => {
    if (!fileList) return;
    const fileIds = fileList
      .filter(file => !isFolder(file.mimeType || ''))
      .map(file => file.id);
    setSelectedFiles(new Set(fileIds));
  };

  // Helper: Clear selection
  const clearSelection = () => {
    setSelectedFiles(new Set());
  };

  // Helper: Handle compress and replace
  const handleCompressAndReplace = async () => {
    if (selectedFiles.size === 0) {
      toast({ title: "No files selected", description: "Please select files to compress", variant: "destructive" });
      return;
    }

    const filesToProcess = fileList.filter(file => selectedFiles.has(file.id) && canPreview(file.mimeType || ''));
    if (filesToProcess.length === 0) {
      toast({ title: "No compressible files", description: "Selected files cannot be compressed", variant: "destructive" });
      return;
    }

    console.log("Starting compress and replace for files:", filesToProcess.map(f => f.name));
    
    for (const file of filesToProcess) {
      try {
        toast({ 
          title: "Processing...", 
          description: `Compressing ${file.name}...` 
        });

        // Download original file
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
          headers: { Authorization: `Bearer ${session?.provider_token}` }
        });
        
        if (!response.ok) throw new Error(`Failed to download ${file.name}`);
        
        const blob = await response.blob();
        const originalFile = new File([blob], file.name, { type: file.mimeType });

        // Compress the file
        let compressedFile: File;
        if (file.mimeType?.startsWith('image/')) {
          compressedFile = await compressImage(originalFile);
        } else {
          // For videos, we'll skip compression for now
          throw new Error("Video compression not implemented yet");
        }

        // Upload compressed file to replace original
        const uploadResult = await uploadFileToGoogleDrive({
          accessToken: session?.provider_token!,
          file: compressedFile,
          fileName: file.name,
          mimeType: compressedFile.type,
          folderId: currentFolderId
        });
        
        if (!uploadResult.success) {
          throw new Error('error' in uploadResult ? uploadResult.error : 'Upload failed');
        }

        // Update local state
        setFileList(prevFiles => 
          prevFiles.map(f => 
            f.id === file.id 
              ? { ...f, size: compressedFile.size.toString() }
              : f
          )
        );

        toast({ 
          title: "File replaced", 
          description: `${file.name} has been compressed and replaced successfully` 
        });

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        toast({ 
          title: "Compression failed", 
          description: `Failed to compress ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          variant: "destructive" 
        });
      }
    }

    clearSelection();
  };

  // Helper: Handle compress and upload
  const handleCompressAndUpload = async () => {
    if (selectedFiles.size === 0) {
      toast({ title: "No files selected", description: "Please select files to compress", variant: "destructive" });
      return;
    }

    const filesToProcess = fileList.filter(file => selectedFiles.has(file.id) && canPreview(file.mimeType || ''));
    if (filesToProcess.length === 0) {
      toast({ title: "No compressible files", description: "Selected files cannot be compressed", variant: "destructive" });
      return;
    }

    console.log("Starting compress and upload for files:", filesToProcess.map(f => f.name));
    
    for (const file of filesToProcess) {
      try {
        toast({ 
          title: "Processing...", 
          description: `Compressing ${file.name}...` 
        });

        // Download original file
        const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
          headers: { Authorization: `Bearer ${session?.provider_token}` }
        });
        
        if (!response.ok) throw new Error(`Failed to download ${file.name}`);
        
        const blob = await response.blob();
        const originalFile = new File([blob], file.name, { type: file.mimeType });

        // Compress the file
        let compressedFile: File;
        if (file.mimeType?.startsWith('image/')) {
          compressedFile = await compressImage(originalFile);
        } else {
          throw new Error("Video compression not implemented yet");
        }

        // Create new filename with compressed suffix
        const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
        const extension = file.name.substring(file.name.lastIndexOf('.'));
        const newFileName = `${nameWithoutExt}_compressed${extension}`;
        
        const renamedCompressedFile = new File([compressedFile], newFileName, { type: compressedFile.type });

        // Upload compressed file as new file
        const uploadResult = await uploadFileToGoogleDrive({
          accessToken: session?.provider_token!,
          file: renamedCompressedFile,
          fileName: newFileName,
          mimeType: renamedCompressedFile.type,
          folderId: currentFolderId
        });
        
        if (!uploadResult.success) {
          throw new Error('error' in uploadResult ? uploadResult.error : 'Upload failed');
        }

        // Add to local state
        setFileList(prevFiles => [...prevFiles, {
          id: uploadResult.fileId,
          name: newFileName,
          size: compressedFile.size.toString(),
          mimeType: compressedFile.type,
          modifiedTime: new Date().toISOString(),
          thumbnailLink: file.thumbnailLink, // Use original thumbnail for now
          webViewLink: uploadResult.webViewLink || `https://drive.google.com/file/d/${uploadResult.fileId}/view`,
          webContentLink: `https://drive.google.com/uc?id=${uploadResult.fileId}`
        }]);

        toast({ 
          title: "File uploaded", 
          description: `${newFileName} has been created successfully` 
        });

      } catch (error) {
        console.error(`Error processing ${file.name}:`, error);
        toast({ 
          title: "Compression failed", 
          description: `Failed to compress ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`, 
          variant: "destructive" 
        });
      }
    }

    clearSelection();
  };

  // Helper: Delete a file from Google Drive (reactively update fileList)
  const handleDelete = async (fileId: string, fileName?: string) => {
    if (!window.confirm(`Are you sure you want to delete "${fileName || 'this file'}"? This cannot be undone.`)) return;
    
    try {
      console.log('Attempting to delete file:', fileId, fileName);
      
      // Use the session from component-level useAuth hook
      const accessToken = session?.provider_token;
      
      if (!accessToken) {
        throw new Error("No Google Drive access token found. Please re-authenticate.");
      }

      console.log('Making DELETE request to Google Drive API for file:', fileId);
      
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${fileId}`, {
        method: "DELETE",
        headers: { 
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json'
        }
      });

      console.log('Delete response status:', response.status);

      if (response.status === 204) {
        // Success - file deleted
        console.log('File deleted successfully:', fileName);
        toast({ title: "File deleted", description: `"${fileName}" has been deleted successfully.` });
        
        // Update local state immediately
        setFileList(prevFiles => prevFiles.filter(file => file.id !== fileId));
        setSelectedFiles(prevSelected => {
          const newSelected = new Set(prevSelected);
          newSelected.delete(fileId);
          return newSelected;
        });
        
        // Close preview if it's the deleted file
        if (previewFile && previewFile.id === fileId) {
          setPreviewFile(null);
        }
      } else if (response.status === 404) {
        // File not found - might already be deleted
        console.log('File not found (404), removing from local state:', fileName);
        toast({ 
          title: "File not found", 
          description: `"${fileName}" may have already been deleted. Removing from view.`,
          variant: "destructive" 
        });
        
        // Still remove from local state since it doesn't exist
        setFileList(prevFiles => prevFiles.filter(file => file.id !== fileId));
        setSelectedFiles(prevSelected => {
          const newSelected = new Set(prevSelected);
          newSelected.delete(fileId);
          return newSelected;
        });
        
        if (previewFile && previewFile.id === fileId) {
          setPreviewFile(null);
        }
      } else if (response.status === 403) {
        // Permission denied
        const errorText = await response.text();
        console.error('Permission denied deleting file:', errorText);
        throw new Error("You don't have permission to delete this file.");
      } else {
        // Other error
        const errorText = await response.text();
        console.error('Error deleting file:', response.status, errorText);
        throw new Error(`Failed to delete file (${response.status}). ${errorText}`);
      }
    } catch (err) {
      console.error('Delete operation failed:', err);
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      toast({ 
        title: "Delete failed", 
        description: errorMessage, 
        variant: "destructive" 
      });
    }
  };

  // Helper: Navigate into a folder
  const handleFolderClick = (folderId: string, folderName: string) => {
    setCurrentFolderId(folderId);
    setFolderPath([...folderPath, { id: folderId, name: folderName }]);
    setSelectedFiles(new Set()); // Clear selection when navigating
  };

  // Helper: Navigate back to a specific folder in the path
  const handleBreadcrumbClick = (targetIndex: number) => {
    const newPath = folderPath.slice(0, targetIndex + 1);
    setFolderPath(newPath);
    setCurrentFolderId(newPath[newPath.length - 1].id);
    setSelectedFiles(new Set()); // Clear selection when navigating
  };

  // Helper: Go back to parent folder
  const handleBackClick = () => {
    if (folderPath.length > 1) {
      const newPath = folderPath.slice(0, -1);
      setFolderPath(newPath);
      setCurrentFolderId(newPath[newPath.length - 1].id);
      setSelectedFiles(new Set()); // Clear selection when navigating
    }
  };

  // Helper: Handle file click - preview if image/video, navigate if folder
  const handleFileClick = (file: any) => {
    const isFileFolder = isFolder(file.mimeType || '');
    if (isFileFolder) {
      handleFolderClick(file.id, file.name);
    } else if (canPreview(file.mimeType || '')) {
      setPreviewFile(file);
    }
  };

  // Helper: Handle compress and replace from preview
  const handlePreviewCompressReplace = async (fileId: string) => {
    const file = fileList.find(f => f.id === fileId);
    if (!file) return;

    try {
      toast({ 
        title: "Processing...", 
        description: `Compressing ${file.name}...` 
      });

      // Download original file
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: { Authorization: `Bearer ${session?.provider_token}` }
      });
      
      if (!response.ok) throw new Error(`Failed to download ${file.name}`);
      
      const blob = await response.blob();
      const originalFile = new File([blob], file.name, { type: file.mimeType });

      // Compress the file
      let compressedFile: File;
      if (file.mimeType?.startsWith('image/')) {
        compressedFile = await compressImage(originalFile);
      } else {
        throw new Error("Video compression not implemented yet");
      }

      // Upload compressed file to replace original
      const uploadResult = await uploadFileToGoogleDrive({
        accessToken: session?.provider_token!,
        file: compressedFile,
        fileName: file.name,
        mimeType: compressedFile.type,
        folderId: currentFolderId
      });
      
      if (!uploadResult.success) {
        throw new Error('error' in uploadResult ? uploadResult.error : 'Upload failed');
      }

      // Update local state
      setFileList(prevFiles => 
        prevFiles.map(f => 
          f.id === file.id 
            ? { ...f, size: compressedFile.size.toString() }
            : f
        )
      );

      toast({ 
        title: "File replaced", 
        description: `${file.name} has been compressed and replaced successfully` 
      });

    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      toast({ 
        title: "Compression failed", 
        description: `Failed to compress ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        variant: "destructive" 
      });
    }
  };

  // Helper: Handle compress and upload from preview
  const handlePreviewCompressUpload = async (fileId: string) => {
    const file = fileList.find(f => f.id === fileId);
    if (!file) return;

    try {
      toast({ 
        title: "Processing...", 
        description: `Compressing ${file.name}...` 
      });

      // Download original file
      const response = await fetch(`https://www.googleapis.com/drive/v3/files/${file.id}?alt=media`, {
        headers: { Authorization: `Bearer ${session?.provider_token}` }
      });
      
      if (!response.ok) throw new Error(`Failed to download ${file.name}`);
      
      const blob = await response.blob();
      const originalFile = new File([blob], file.name, { type: file.mimeType });

      // Compress the file
      let compressedFile: File;
      if (file.mimeType?.startsWith('image/')) {
        compressedFile = await compressImage(originalFile);
      } else {
        throw new Error("Video compression not implemented yet");
      }

      // Create new filename with compressed suffix
      const nameWithoutExt = file.name.substring(0, file.name.lastIndexOf('.'));
      const extension = file.name.substring(file.name.lastIndexOf('.'));
      const newFileName = `${nameWithoutExt}_compressed${extension}`;
      
      const renamedCompressedFile = new File([compressedFile], newFileName, { type: compressedFile.type });

      // Upload compressed file as new file
      const uploadResult = await uploadFileToGoogleDrive({
        accessToken: session?.provider_token!,
        file: renamedCompressedFile,
        fileName: newFileName,
        mimeType: renamedCompressedFile.type,
        folderId: currentFolderId
      });
      
      if (!uploadResult.success) {
        throw new Error('error' in uploadResult ? uploadResult.error : 'Upload failed');
      }

      // Add to local state
      setFileList(prevFiles => [...prevFiles, {
        id: uploadResult.fileId,
        name: newFileName,
        size: compressedFile.size.toString(),
        mimeType: compressedFile.type,
        modifiedTime: new Date().toISOString(),
        thumbnailLink: file.thumbnailLink,
        webViewLink: uploadResult.webViewLink || `https://drive.google.com/file/d/${uploadResult.fileId}/view`,
        webContentLink: `https://drive.google.com/uc?id=${uploadResult.fileId}`
      }]);

      toast({ 
        title: "File uploaded", 
        description: `${newFileName} has been created successfully` 
      });

    } catch (error) {
      console.error(`Error processing ${file.name}:`, error);
      toast({ 
        title: "Compression failed", 
        description: `Failed to compress ${file.name}: ${error instanceof Error ? error.message : 'Unknown error'}`, 
        variant: "destructive" 
      });
    }
  };

  // Helper: Handle delete from preview (calls main handleDelete)
  const handlePreviewDelete = async (fileId: string, fileName: string) => {
    await handleDelete(fileId, fileName);
  };

  // Helper: Render file thumbnail or icon
  const getFileIcon = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') return Folder;
    if (mimeType.startsWith('image/')) return Image;
    if (mimeType.startsWith('video/')) return Video;
    if (mimeType.includes('document') || mimeType.includes('text')) return FileText;
    return File;
  };

  const getFileTypeColor = (mimeType: string) => {
    if (mimeType === 'application/vnd.google-apps.folder') return 'bg-yellow-100 text-yellow-600';
    if (mimeType.startsWith('image/')) return 'bg-green-100 text-green-600';
    if (mimeType.startsWith('video/')) return 'bg-red-100 text-red-600';
    if (mimeType.includes('document') || mimeType.includes('text')) return 'bg-blue-100 text-blue-600';
    return 'bg-gray-100 text-gray-600';
  };

  const isFolder = (mimeType: string) => mimeType === 'application/vnd.google-apps.folder';

  // Helper: Render file thumbnail or icon
  const renderFileThumbnail = (file: any) => {
    const FileIcon = getFileIcon(file.mimeType || '');
    const fileTypeColor = getFileTypeColor(file.mimeType || '');
    const isFileFolder = isFolder(file.mimeType || '');

    if (isFileFolder) {
      return (
        <div className={`w-full h-20 rounded-lg flex items-center justify-center ${fileTypeColor}`}>
          <FileIcon className="w-8 h-8" />
        </div>
      );
    }
    if (file.thumbnailLink && (file.mimeType?.startsWith('image/') || file.mimeType?.startsWith('video/'))) {
      return (
        <div className="w-full h-20 rounded-lg overflow-hidden bg-gray-100 relative">
          <img 
            src={file.thumbnailLink} 
            alt={file.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `
                <div class="w-full h-full flex items-center justify-center ${fileTypeColor}">
                  <svg class="w-8 h-8" fill="currentColor" viewBox="0 0 24 24">
                    ${file.mimeType?.startsWith('image/') ? 
                      '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>' :
                      '<path d="M10 16h4c.55 0 1-.45 1-1v-5.5l-2.5-2.5H11c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1zm-4-8h3c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1s.45 1 1 1z"/>'
                    }
                  </svg>
                </div>
              `;
            }}
          />
          {file.mimeType?.startsWith('video/') && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
              <div className="w-8 h-8 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-[6px] border-l-gray-800 border-t-[4px] border-t-transparent border-b-[4px] border-b-transparent ml-1"></div>
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className={`w-full h-20 rounded-lg flex items-center justify-center ${fileTypeColor}`}>
        <FileIcon className="w-8 h-8" />
      </div>
    );
  };

  // Helper: Render list thumbnail (smaller version)
  const renderListThumbnail = (file: any) => {
    const FileIcon = getFileIcon(file.mimeType || '');
    const fileTypeColor = getFileTypeColor(file.mimeType || '');
    const isFileFolder = isFolder(file.mimeType || '');

    if (isFileFolder) {
      return (
        <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${fileTypeColor}`}>
          <FileIcon className="w-4 h-4" />
        </div>
      );
    }
    if (file.thumbnailLink && (file.mimeType?.startsWith('image/') || file.mimeType?.startsWith('video/'))) {
      return (
        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 relative">
          <img 
            src={file.thumbnailLink} 
            alt={file.name}
            className="w-full h-full object-cover"
            onError={(e) => {
              const target = e.target as HTMLImageElement;
              target.style.display = 'none';
              target.parentElement!.innerHTML = `
                <div class="w-full h-full flex items-center justify-center ${fileTypeColor}">
                  <svg class="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                    ${file.mimeType?.startsWith('image/') ? 
                      '<path d="M21 19V5c0-1.1-.9-2-2-2H5c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h14c1.1 0 2-.9 2-2zM8.5 13.5l2.5 3.01L14.5 12l4.5 6H5l3.5-4.5z"/>' :
                      '<path d="M10 16h4c.55 0 1-.45 1-1v-5.5l-2.5-2.5H11c-.55 0-1 .45-1 1v7c0 .55.45 1 1 1zm-4-8h3c.55 0 1-.45 1-1s-.45-1-1-1H6c-.55 0-1 .45-1 1s.45 1 1 1z"/>'
                    }
                  </svg>
                </div>
              `;
            }}
          />
          {file.mimeType?.startsWith('video/') && (
            <div className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-30 rounded-lg">
              <div className="w-3 h-3 bg-white bg-opacity-90 rounded-full flex items-center justify-center">
                <div className="w-0 h-0 border-l-[3px] border-l-gray-800 border-t-[2px] border-t-transparent border-b-[2px] border-b-transparent ml-0.5"></div>
              </div>
            </div>
          )}
        </div>
      );
    }
    return (
      <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${fileTypeColor}`}>
        <FileIcon className="w-4 h-4" />
      </div>
    );
  };

  // Helper: Is this truly a valid React Component?
  function isValidReactComponent(c: any) {
    return (
      typeof c === "function" ||
      (typeof c === "object" && c !== null && (typeof c.render === "function" || c.$$typeof))
    );
  }
  const showPreviewModal = isValidReactComponent(FilePreviewModal) && !!previewFile;

  if (!hasValidToken) {
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
                    <h1 className="text-3xl font-bold text-gray-900">Browse Drive</h1>
                    <p className="text-gray-600">View and manage your Google Drive files</p>
                  </div>
                </div>

                <Card className="border-2 border-dashed border-gray-300">
                  <CardContent className="text-center py-16">
                    <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <Link className="w-8 h-8 text-gray-400" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Connect to Google Drive First</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      You need to connect your Google Drive account to browse your files
                    </p>
                    <Button 
                      onClick={() => navigate('/dashboard')}
                      className="bg-google-blue hover:bg-blue-600 text-white"
                    >
                      Go to Dashboard
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </main>
          </div>
        </SidebarProvider>
      </ProtectedRoute>
    );
  }

  // Subscribe to driveEventBus events for auto-refresh after upload
  useEffect(() => {
    const unsubscribe = driveEventBus.on("refresh", () => {
      if (typeof refetch === "function") refetch();
    });
    return () => {
      unsubscribe();
    };
  }, [refetch]);

  return (
    <ProtectedRoute>
      <SidebarProvider>
        <div className="min-h-screen flex w-full bg-gray-50">
          <AppSidebar />
          <main className="flex-1 flex flex-col">
            <div className="flex-shrink-0 p-6 pb-0">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <SidebarTrigger className="mr-4" />
                  <div>
                    <h1 className="text-3xl font-bold text-gray-900">Browse Drive</h1>
                    <p className="text-gray-600">View and manage your Google Drive files</p>
                  </div>
                </div>
                <div className="flex items-center space-x-4">
                  {/* Back button */}
                  {folderPath.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleBackClick}
                      className="flex items-center space-x-2"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back</span>
                    </Button>
                  )}
                  
                  {/* View mode toggle */}
                  <div className="flex border rounded-lg overflow-hidden">
                    <Button
                      variant={viewMode === 'grid' ? 'default' : 'ghost'}
                      size="sm"
                      className="rounded-none border-r"
                      onClick={() => setViewMode('grid')}
                    >
                      <Grid className="w-4 h-4" />
                    </Button>
                    <Button
                      variant={viewMode === 'list' ? 'default' : 'ghost'}
                      size="sm"
                      className="rounded-none"
                      onClick={() => setViewMode('list')}
                    >
                      <List className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* File selection controls */}
              {fileList && fileList.some(file => !isFolder(file.mimeType || '')) && (
                <div className="flex items-center justify-between mb-4 p-3 bg-white rounded-lg border">
                  <div className="flex items-center space-x-4">
                    <span className="text-sm text-gray-600">
                      {selectedFiles.size} of {fileList.filter(file => !isFolder(file.mimeType || '')).length} files selected
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={selectAllFiles}
                      disabled={selectedFiles.size === fileList.filter(file => !isFolder(file.mimeType || '')).length}
                    >
                      Select All
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={clearSelection}
                      disabled={selectedFiles.size === 0}
                    >
                      Clear Selection
                    </Button>
                  </div>
                  {/* Quick action buttons in selection bar */}
                  <div className="flex gap-2">
                    <Button
                      onClick={handleCompressAndReplace}
                      disabled={selectedFiles.size === 0}
                      size="sm"
                      className="bg-google-blue hover:bg-blue-600 text-white flex items-center gap-2"
                    >
                      <Download className="w-4 h-4" />
                      Compress & Replace
                    </Button>
                    <Button
                      onClick={handleCompressAndUpload}
                      disabled={selectedFiles.size === 0}
                      variant="outline"
                      size="sm"
                      className="border-google-blue text-google-blue hover:bg-blue-50 flex items-center gap-2"
                    >
                      <Upload className="w-4 h-4" />
                      Compress & Upload
                    </Button>
                  </div>
                </div>
              )}

              {/* Breadcrumb navigation */}
              <div className="flex items-center space-x-2 mb-4 text-sm text-gray-600">
                {folderPath.map((folder, index) => (
                  <div key={folder.id} className="flex items-center">
                    <button
                      onClick={() => handleBreadcrumbClick(index)}
                      className="hover:text-google-blue transition-colors"
                    >
                      {folder.name}
                    </button>
                    {index < folderPath.length - 1 && (
                      <ChevronRight className="w-4 h-4 mx-2" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Main Content Area - Scrollable */}
            <div className="flex-1 px-6 pb-6 min-h-0">
              {loading ? (
                <div className="h-full flex items-center justify-center">
                  <div className="flex items-center space-x-2">
                    <div className="w-4 h-4 border-2 border-google-blue border-t-transparent rounded-full animate-spin"></div>
                    <p className="text-gray-600">Loading your Drive files...</p>
                  </div>
                </div>
              ) : error ? (
                <Card className="border-red-200 bg-red-50">
                  <CardContent className="py-6 text-center">
                    <p className="text-red-600">Error loading Drive files: {error}</p>
                  </CardContent>
                </Card>
              ) : (
                <div className="h-full flex flex-col">
                  {/* Files Grid/List */}
                  <div className="flex-1 min-h-0 mb-4">
                    {viewMode === 'grid' ? (
                      <div className="h-full overflow-y-auto pr-2">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                          {fileList?.map((file) => {
                            const isFileFolder = isFolder(file.mimeType || '');
                            const isSelected = selectedFiles.has(file.id);
                            const isPreviewable = canPreview(file.mimeType || '');

                            return (
                              <Card 
                                key={file.id} 
                                className={`hover:shadow-lg transition-shadow duration-200 border ${
                                  isSelected ? 'border-google-blue bg-blue-50' : 'border-gray-200 bg-white'
                                } ${(isFileFolder || isPreviewable) ? 'cursor-pointer hover:bg-gray-50' : ''}`}
                                onClick={() => handleFileClick(file)}
                              >
                                <CardContent className="p-4">
                                  <div className="mb-3 relative">
                                    {renderFileThumbnail(file)}
                                    {!isFileFolder && (
                                      <div className="absolute top-2 right-2">
                                        <input
                                          type="checkbox"
                                          checked={isSelected}
                                          onChange={(e) => toggleFileSelection(file.id, e)}
                                          onClick={(e) => e.stopPropagation()}
                                          className="w-4 h-4 text-google-blue border-gray-300 rounded focus:ring-google-blue"
                                        />
                                      </div>
                                    )}
                                  </div>
                                  <div className="min-w-0">
                                    <h3 className="font-medium text-sm truncate mb-1" title={file.name}>{file.name}</h3>
                                    <p className="text-xs text-gray-500 mb-2">
                                      {isFileFolder ? 'Folder' : file.size ? `${Math.round(parseInt(file.size) / 1024)} KB` : 'Unknown size'}
                                    </p>
                                  </div>
                                  <div className="flex items-center justify-between text-xs text-gray-500">
                                    <span className="truncate flex-1">{file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Unknown date'}</span>
                                    {!isFileFolder && (
                                      <div className="flex gap-1 ml-2 flex-shrink-0">
                                        <Button
                                          size="sm"
                                          variant="destructive"
                                          className="text-xs px-2 py-1 h-auto"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            handleDelete(file.id, file.name);
                                          }}
                                        >
                                          Delete
                                        </Button>
                                      </div>
                                    )}
                                  </div>
                                </CardContent>
                              </Card>
                            );
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="h-full overflow-hidden rounded-lg border bg-white">
                        <div className="h-full overflow-y-auto">
                          <div className="divide-y">
                            {fileList?.map((file) => {
                              const isFileFolder = isFolder(file.mimeType || '');
                              const isSelected = selectedFiles.has(file.id);
                              const isPreviewable = canPreview(file.mimeType || '');

                              return (
                                <div
                                  key={file.id}
                                  className={`flex items-center p-3 hover:bg-gray-50 transition-colors duration-150 min-w-0 ${
                                    isSelected ? 'bg-blue-50 border-l-4 border-google-blue' : ''
                                  } ${(isFileFolder || isPreviewable) ? 'cursor-pointer' : ''}`}
                                  onClick={() => handleFileClick(file)}
                                >
                                  {!isFileFolder && (
                                    <div className="mr-3 flex-shrink-0">
                                      <input
                                        type="checkbox"
                                        checked={isSelected}
                                        onChange={(e) => toggleFileSelection(file.id, e)}
                                        onClick={(e) => e.stopPropagation()}
                                        className="w-4 h-4 text-google-blue border-gray-300 rounded focus:ring-google-blue"
                                      />
                                    </div>
                                  )}
                                  <div className="mr-3 flex-shrink-0">
                                    {renderListThumbnail(file)}
                                  </div>
                                  <div className="flex-1 min-w-0 mr-3">
                                    <h3 className="font-medium text-sm truncate" title={file.name}>
                                      {file.name}
                                    </h3>
                                    <p className="text-xs text-gray-500 truncate">
                                      {isFileFolder ? 'Folder' : file.size ? `${Math.round(parseInt(file.size) / 1024)} KB` : 'Unknown size'}
                                    </p>
                                  </div>
                                  <div className="hidden sm:block text-xs text-gray-500 w-24 flex-shrink-0 text-center">
                                    {file.modifiedTime ? new Date(file.modifiedTime).toLocaleDateString() : 'Unknown'}
                                  </div>
                                  {!isFileFolder && (
                                    <div className="flex gap-1 ml-2 flex-shrink-0">
                                      <Button
                                        size="sm"
                                        variant="destructive"
                                        className="text-xs px-2 py-1 h-auto"
                                        onClick={(e) => {
                                          e.stopPropagation();
                                          handleDelete(file.id, file.name);
                                        }}
                                      >
                                        Delete
                                      </Button>
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      </div>
                    )}

                    {fileList && fileList.length === 0 && (
                      <Card className="border-2 border-dashed border-gray-300">
                        <CardContent className="text-center py-16">
                          <div className="w-16 h-16 bg-gray-100 rounded-full mx-auto mb-6 flex items-center justify-center">
                            <HardDrive className="w-8 h-8 text-gray-400" />
                          </div>
                          <h3 className="text-xl font-semibold mb-2">No Files Found</h3>
                          <p className="text-gray-600 mb-6 max-w-md mx-auto">
                            This folder appears to be empty.
                          </p>
                        </CardContent>
                      </Card>
                    )}
                  </div>

                  {/* Fixed Bottom Action Bar - Update message and logic */}
                  {fileList && fileList.length > 0 && selectedFiles.size === 0 && (
                    <div className="flex-shrink-0 bg-white border-t border-gray-200 rounded-lg p-4 shadow-lg">
                      <div className="flex items-center justify-center">
                        <p className="text-sm text-gray-600">
                          Showing {fileList.length} of {fileList.length} items • Select files to compress
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
          </main>
        </div>
      </SidebarProvider>

      {/* File Preview Modal - fix: only render if valid and robustly check */}
      {showPreviewModal ? (
        <FilePreviewModal
          file={previewFile}
          isOpen={!!previewFile}
          onClose={() => setPreviewFile(null)}
          onCompressReplace={handlePreviewCompressReplace}
          onCompressUpload={handlePreviewCompressUpload}
          onDelete={handlePreviewDelete}
        />
      ) : !!previewFile ? (
        <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center">
          <div className="bg-white rounded-xl shadow-xl p-8 max-w-lg mx-auto text-center">
            <h2 className="text-lg font-semibold mb-2">Preview Not Available</h2>
            <p className="text-sm text-gray-600 mb-4">FilePreviewModal could not be rendered.<br />Check your import/export and component code.</p>
            <Button onClick={() => setPreviewFile(null)}>Close</Button>
          </div>
        </div>
      ) : null}
    </ProtectedRoute>
  );
};

export default DriveView;
