
/**
 * Uploads a file (Blob) to Google Drive using multipart upload.
 * @param accessToken - The Google OAuth2 access token
 * @param file - A File or Blob object to upload
 * @param fileName - The file name to use in Drive
 * @param mimeType - The MIME type of the file
 * @param folderId - (Optional) The Drive folder to upload to ("root" for My Drive)
 * @returns Promise resolving to: 
 *   { success: true, fileId, webViewLink } or { success: false, error }
 */
export async function uploadFileToGoogleDrive({
  accessToken,
  file,
  fileName,
  mimeType,
  folderId = "root",
}: {
  accessToken: string;
  file: Blob;
  fileName: string;
  mimeType: string;
  folderId?: string;
}): Promise<{ success: true; fileId: string; webViewLink?: string } | { success: false; error: string }> {
  try {
    // Step 1: Start multipart upload
    const metadata = {
      name: fileName,
      parents: [folderId],
      mimeType,
    };

    // Compose multipart request
    const boundary = '-------314159265358979323846';
    const delimiter = "--" + boundary + "\r\n";
    const close_delim = "--" + boundary + "--";

    let fileContent: ArrayBuffer | string;
    if (file instanceof Blob) {
      fileContent = await file.arrayBuffer();
    } else {
      fileContent = await (file as File).arrayBuffer();
    }

    const body =
      delimiter +
      "Content-Type: application/json; charset=UTF-8\r\n\r\n" +
      JSON.stringify(metadata) +
      "\r\n" +
      delimiter +
      "Content-Type: " + mimeType + "\r\n\r\n" +
      new Uint8Array(fileContent).reduce((data, byte) => data + String.fromCharCode(byte), "") +
      "\r\n" +
      close_delim;

    const multipartRequestBody = body;

    // Step 2: Make the API call
    const response = await fetch("https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,webViewLink", {
      method: "POST",
      headers: {
        "Authorization": "Bearer " + accessToken,
        "Content-Type": "multipart/related; boundary=" + boundary,
      },
      body: multipartRequestBody,
    });

    const data = await response.json();
    if (response.ok && data.id) {
      return { success: true, fileId: data.id, webViewLink: data.webViewLink };
    } else {
      return { success: false, error: data.error?.message || "Unknown error during upload" };
    }
  } catch (error: any) {
    return { success: false, error: error.message || String(error) };
  }
}

