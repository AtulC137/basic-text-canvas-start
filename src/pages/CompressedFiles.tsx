
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Grid2X2, List, ExternalLink, Download, RotateCcw, FileText, Image, Video } from "lucide-react";
import { useState } from "react";

const CompressedFiles = () => {
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  // Mock compressed files data
  const compressedFiles = [
    { 
      id: '1', 
      name: 'Vacation Photos (Compressed)', 
      type: 'image', 
      originalSize: '45.2 MB', 
      compressedSize: '28.1 MB',
      compressionRatio: '38%',
      dateCompressed: '2 days ago',
      thumbnail: '/placeholder.svg' 
    },
    { 
      id: '2', 
      name: 'Project Video (Compressed)', 
      type: 'video', 
      originalSize: '234.7 MB', 
      compressedSize: '156.3 MB',
      compressionRatio: '33%',
      dateCompressed: '1 week ago',
      thumbnail: '/placeholder.svg' 
    },
    { 
      id: '3', 
      name: 'Documents Bundle (Compressed)', 
      type: 'document', 
      originalSize: '23.4 MB', 
      compressedSize: '14.8 MB',
      compressionRatio: '37%',
      dateCompressed: '3 days ago',
      thumbnail: '/placeholder.svg' 
    },
    { 
      id: '4', 
      name: 'Design Assets (Compressed)', 
      type: 'image', 
      originalSize: '67.8 MB', 
      compressedSize: '41.2 MB',
      compressionRatio: '39%',
      dateCompressed: '5 days ago',
      thumbnail: '/placeholder.svg' 
    },
  ];

  const getFileIcon = (type: string) => {
    switch (type) {
      case 'image': return Image;
      case 'video': return Video;
      case 'document': return FileText;
      default: return FileText;
    }
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'image': return 'bg-green-100 text-green-800';
      case 'video': return 'bg-red-100 text-red-800';
      case 'document': return 'bg-blue-100 text-blue-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <SidebarProvider>
      <div className="min-h-screen flex w-full bg-gray-50">
        <AppSidebar />
        <main className="flex-1">
          <div className="p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center">
                <SidebarTrigger className="mr-4" />
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">Compressed Files</h1>
                  <p className="text-gray-600">{compressedFiles.length} compressed files • 125.4 MB total saved</p>
                </div>
              </div>
              <div className="flex items-center space-x-2">
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('grid')}
                >
                  <Grid2X2 className="w-4 h-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setViewMode('list')}
                >
                  <List className="w-4 h-4" />
                </Button>
              </div>
            </div>

            {/* Files Grid/List */}
            {viewMode === 'grid' ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                {compressedFiles.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                    <Card key={file.id} className="hover:shadow-md transition-shadow">
                      <CardContent className="p-4">
                        <div className="w-full h-24 bg-gray-100 rounded-lg mb-3 flex items-center justify-center">
                          <FileIcon className="w-8 h-8 text-gray-400" />
                        </div>
                        <h3 className="font-medium text-sm truncate mb-2">{file.name}</h3>
                        <div className="space-y-2 mb-3">
                          <Badge className={`text-xs ${getTypeColor(file.type)}`}>
                            {file.type}
                          </Badge>
                          <div className="text-xs text-gray-500">
                            <div>{file.originalSize} → {file.compressedSize}</div>
                            <div className="text-google-green font-medium">{file.compressionRatio} saved</div>
                            <div>{file.dateCompressed}</div>
                          </div>
                        </div>
                        <div className="flex space-x-1">
                          <Button size="sm" variant="outline" className="flex-1">
                            <ExternalLink className="w-3 h-3 mr-1" />
                            Open
                          </Button>
                          <Button size="sm" variant="outline">
                            <RotateCcw className="w-3 h-3" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            ) : (
              <div className="bg-white rounded-lg shadow-sm">
                {compressedFiles.map((file) => {
                  const FileIcon = getFileIcon(file.type);
                  return (
                    <div key={file.id} className="flex items-center space-x-4 p-4 border-b border-gray-100 last:border-b-0 hover:bg-gray-50">
                      <div className="w-8 h-8 flex items-center justify-center">
                        <FileIcon className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center space-x-2 mb-1">
                          <h3 className="font-medium truncate">{file.name}</h3>
                          <Badge className={`text-xs ${getTypeColor(file.type)}`}>
                            {file.type}
                          </Badge>
                        </div>
                        <div className="text-sm text-gray-500">
                          {file.originalSize} → {file.compressedSize} • {file.compressionRatio} saved • {file.dateCompressed}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button size="sm" variant="outline">
                          <ExternalLink className="w-3 h-3 mr-1" />
                          Open in Drive
                        </Button>
                        <Button size="sm" variant="outline">
                          <RotateCcw className="w-3 h-3 mr-1" />
                          Uncompress
                        </Button>
                        <Button size="sm" variant="outline">
                          <Download className="w-3 h-3 mr-1" />
                          Download
                        </Button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </main>
      </div>
    </SidebarProvider>
  );
};

export default CompressedFiles;
