
interface DriveFile {
  id: string;
  name: string;
  size?: string;
  mimeType: string;
  createdTime: string;
  modifiedTime: string;
  webViewLink?: string;
  webContentLink?: string;
  thumbnailLink?: string;
}

interface DriveQuota {
  limit: string;
  usage: string;
  usageInDrive: string;
  usageInDriveTrash: string;
}

interface DriveData {
  files: DriveFile[];
  quota: DriveQuota;
  user: {
    displayName: string;
    emailAddress: string;
    photoLink?: string;
  };
}

export const fetchGoogleDriveData = async (accessToken: string, folderId: string = 'root'): Promise<DriveData> => {
  try {
    console.log('Fetching Google Drive data for folder:', folderId);
    
    // Fetch user info
    const userResponse = await fetch('https://www.googleapis.com/drive/v3/about?fields=user', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!userResponse.ok) {
      throw new Error(`Failed to fetch user info: ${userResponse.statusText}`);
    }

    const userData = await userResponse.json();

    // Fetch storage quota
    const quotaResponse = await fetch('https://www.googleapis.com/drive/v3/about?fields=storageQuota', {
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
    });

    if (!quotaResponse.ok) {
      throw new Error(`Failed to fetch quota: ${quotaResponse.statusText}`);
    }

    const quotaData = await quotaResponse.json();

    // Build query for files in specific folder
    const query = folderId === 'root' ? "'root' in parents" : `'${folderId}' in parents`;
    
    // Fetch files from specific folder - Include webContentLink for high-quality images
    const filesResponse = await fetch(
      'https://www.googleapis.com/drive/v3/files?' +
      new URLSearchParams({
        pageSize: '100',
        orderBy: 'folder,modifiedTime desc',
        q: `${query} and trashed=false`,
        fields: 'files(id,name,size,mimeType,createdTime,modifiedTime,webViewLink,webContentLink,thumbnailLink)'
      }),
      {
        headers: {
          'Authorization': `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
      }
    );

    if (!filesResponse.ok) {
      throw new Error(`Failed to fetch files: ${filesResponse.statusText}`);
    }

    const filesData = await filesResponse.json();

    return {
      files: filesData.files || [],
      quota: quotaData.storageQuota || {},
      user: userData.user || {}
    };
  } catch (error) {
    console.error('Error fetching Google Drive data:', error);
    throw error;
  }
};

export const calculateFileStats = (files: DriveFile[]) => {
  const stats = {
    totalFiles: files.length,
    totalSize: 0,
    documents: 0,
    images: 0,
    videos: 0,
    others: 0,
    documentsSize: 0,
    imagesSize: 0,
    videosSize: 0,
    othersSize: 0
  };

  files.forEach(file => {
    const size = file.size ? parseInt(file.size) : 0;
    stats.totalSize += size;

    if (file.mimeType.includes('document') || file.mimeType.includes('text') || file.mimeType.includes('pdf')) {
      stats.documents++;
      stats.documentsSize += size;
    } else if (file.mimeType.includes('image')) {
      stats.images++;
      stats.imagesSize += size;
    } else if (file.mimeType.includes('video')) {
      stats.videos++;
      stats.videosSize += size;
    } else {
      stats.others++;
      stats.othersSize += size;
    }
  });

  return stats;
};

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + ' ' + sizes[i];
};
