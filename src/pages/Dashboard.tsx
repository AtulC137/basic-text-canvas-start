import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";
import { AppSidebar } from "@/components/AppSidebar";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { useNavigate } from "react-router-dom";
import { HardDrive, Upload, FolderOpen, RotateCcw, Zap, Link, CheckCircle, AlertCircle, RefreshCw, LogOut, Unlink, Download } from "lucide-react";
import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { ProtectedRoute } from "@/hooks/ProtectedRoute";
import { useGoogleDriveData } from "@/hooks/useGoogleDriveData";
import { formatFileSize } from "@/services/googleDriveService";
import { driveEventBus } from "@/utils/driveEventBus"; // <-- Add this import

const Dashboard = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, session, logout } = useAuth();
  // Add refetch to the destructured return from useGoogleDriveData
  const { driveData, fileStats, loading: driveLoading, error: driveError, hasValidToken, refetch } = useGoogleDriveData();
  
  // Storage calculations from real data
  const storageUsed = driveData?.quota ? parseInt(driveData.quota.usage || '0') : 0;
  const storageTotal = driveData?.quota ? parseInt(driveData.quota.limit || '0') : 0;
  const storagePercentage = storageTotal > 0 ? (storageUsed / storageTotal) * 100 : 0;

  const handleDisconnectDrive = async () => {
    try {
      await logout();
      toast({
        title: "Google Drive Disconnected",
        description: "You have been disconnected from Google Drive. Please sign in again to reconnect.",
      });
      navigate('/');
    } catch (error) {
      console.error('Error disconnecting:', error);
      toast({
        title: "Error",
        description: "Failed to disconnect from Google Drive",
        variant: "destructive"
      });
    }
  };

  // Subscribe to driveEventBus to refetch on "refresh"
  useEffect(() => {
    const unsubscribe = driveEventBus.on("refresh", () => {
      if (typeof refetch === "function") refetch();
    });
    return () => unsubscribe();
  }, [refetch]);
  
  // Simplified Quick Actions
  const quickActions = [
    {
      title: "Compress & Upload",
      description: "Upload and compress new files",
      icon: Upload,
      action: () => navigate('/upload'),
      color: "bg-google-blue",
      disabled: !hasValidToken,
    },
    {
      title: "Uncompress & View",
      description: "Restore files to original format",
      icon: RotateCcw,
      action: () => navigate('/uncompress'),
      color: "bg-google-green",
      disabled: !hasValidToken,
    },
    {
      title: "Download",
      description: "Download your Google Drive files",
      icon: Download,
      action: () => navigate('/drive'), // Or a specific download section if you add it later
      color: "bg-google-yellow",
      disabled: !hasValidToken,
    },
  ];

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
                  <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                  <p className="text-gray-600">
                    Welcome back, {driveData?.user?.displayName || user?.user_metadata?.full_name || user?.email}! 
                    Manage your Google Drive storage efficiently.
                  </p>
                  {driveLoading && (
                    <p className="text-sm text-blue-600 mt-1 flex items-center">
                      <RefreshCw className="w-4 h-4 mr-1 animate-spin" />
                      Loading your Drive data...
                    </p>
                  )}
                </div>
              </div>
              {/* Connection Status */}
              { !hasValidToken ? (
                <Card className="mb-8 border-2 border-dashed border-google-blue/30">
                  <CardContent className="text-center py-12">
                    <div className="w-16 h-16 bg-google-blue/10 rounded-full mx-auto mb-6 flex items-center justify-center">
                      <Link className="w-8 h-8 text-google-blue" />
                    </div>
                    <h3 className="text-xl font-semibold mb-2">Connect to Google Drive</h3>
                    <p className="text-gray-600 mb-6 max-w-md mx-auto">
                      Sign in with Google to access and manage your Drive files with compression capabilities
                    </p>
                    <p className="text-sm text-orange-600 mb-4">
                      Drive access not detected. Please sign out and sign in again to grant Drive permissions.
                    </p>
                  </CardContent>
                </Card>
              ) : driveError ? (
                <Card className="mb-8 border-red-200 bg-red-50">
                  <CardContent className="py-6">
                    <div className="flex items-center space-x-3">
                      <AlertCircle className="w-6 h-6 text-red-600" />
                      <div>
                        <h3 className="font-semibold text-red-800">Error Loading Drive Data</h3>
                        <p className="text-sm text-red-600">{driveError}</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ) : (
                // Using a div, not fragment to avoid invalid props
                <div>
                  {/* Connected Status with Real User Info and Disconnect Button */}
                  <Card className="mb-8 border-google-green">
                    <CardContent className="py-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <CheckCircle className="w-6 h-6 text-google-green" />
                          <div className="flex items-center space-x-3">
                            {driveData?.user?.photoLink && (
                              <img 
                                src={driveData.user.photoLink} 
                                alt="Profile" 
                                className="w-10 h-10 rounded-full"
                              />
                            )}
                            <div>
                              <h3 className="font-semibold">Connected to Google Drive</h3>
                              <p className="text-sm text-gray-600">
                                {driveData?.user?.displayName} ({driveData?.user?.emailAddress || user?.email})
                              </p>
                            </div>
                          </div>
                        </div>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDisconnectDrive}
                          className="text-orange-600 hover:text-orange-700 hover:bg-orange-50"
                        >
                          <Unlink className="w-4 h-4 mr-2" />
                          Disconnect Drive
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                  {/* Real Storage Overview */}
                  <div className="grid md:grid-cols-2 gap-6 mb-8">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <HardDrive className="w-5 h-5 text-google-blue" />
                          <span>Storage Usage</span>
                        </CardTitle>
                        <CardDescription>Your Google Drive storage breakdown</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="flex justify-between text-sm">
                            <span>Used: {formatFileSize(storageUsed)}</span>
                            <span>Total: {formatFileSize(storageTotal)}</span>
                          </div>
                          <Progress value={storagePercentage} className="h-3" />
                          {fileStats && (
                            <div className="grid grid-cols-2 gap-4 text-sm">
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                                <span>Documents: {formatFileSize(fileStats.documentsSize)} ({fileStats.documents})</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                                <span>Images: {formatFileSize(fileStats.imagesSize)} ({fileStats.images})</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                                <span>Videos: {formatFileSize(fileStats.videosSize)} ({fileStats.videos})</span>
                              </div>
                              <div className="flex items-center space-x-2">
                                <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                                <span>Others: {formatFileSize(fileStats.othersSize)} ({fileStats.others})</span>
                              </div>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Zap className="w-5 h-5 text-google-green" />
                          <span>Drive Analytics</span>
                        </CardTitle>
                        <CardDescription>Your file management insights</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          <div className="text-center">
                            <div className="text-3xl font-bold text-google-blue">{fileStats?.totalFiles || 0}</div>
                            <div className="text-sm text-gray-600">Total Files</div>
                          </div>
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="font-semibold">{formatFileSize(fileStats?.totalSize || 0)}</div>
                              <div className="text-gray-600">Total Size</div>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-lg">
                              <div className="font-semibold">0</div>
                              <div className="text-gray-600">Compressed</div>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </div>
              )}

              {/* Quick Actions - Enabled based on Drive connection */}
              <Card>
                <CardHeader>
                  <CardTitle>Quick Actions</CardTitle>
                  <CardDescription>
                    {hasValidToken ? "Choose what you'd like to do" : "Connect to Google Drive to enable these features"}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {quickActions.map((action) => (
                      <Button
                        key={action.title}
                        variant="outline"
                        onClick={action.disabled ? undefined : action.action}
                        disabled={action.disabled}
                        className={`h-auto p-6 flex flex-col items-center space-y-3 hover:shadow-md transition-shadow ${
                          action.disabled ? 'opacity-50 cursor-not-allowed' : ''
                        }`}
                      >
                        <div className={`w-12 h-12 ${action.color} rounded-xl flex items-center justify-center ${
                          action.disabled ? 'opacity-60' : ''
                        }`}>
                          <action.icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="text-center">
                          <div className="font-medium">{action.title}</div>
                          <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                        </div>
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </main>
        </div>
      </SidebarProvider>
    </ProtectedRoute>
  );
};

export default Dashboard;
