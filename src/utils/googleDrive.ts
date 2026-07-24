// Google Drive API Integration Utility for Neneh Funkuba Enterprise ERP
import firebaseConfigJson from '../../firebase-applet-config.json';
import { signInWithGoogle } from '../services/auth';

declare global {
  interface Window {
    google?: any;
    gapi?: any;
  }
}

export interface DriveUploadResult {
  success: boolean;
  fileId?: string;
  fileName?: string;
  webViewLink?: string;
  error?: string;
}

let cachedAccessToken: string | null = null;

export const setGoogleAccessToken = (token: string | null) => {
  cachedAccessToken = token;
};

/**
 * Request OAuth Access Token from Google Accounts for Google Drive scope.
 */
export const getGoogleAccessToken = async (): Promise<string> => {
  if (cachedAccessToken) {
    return cachedAccessToken;
  }

  // Attempt to obtain token using Firebase Google Auth popup if available
  try {
    const { accessToken } = await signInWithGoogle();
    if (accessToken) {
      cachedAccessToken = accessToken;
      return accessToken;
    }
  } catch (err) {
    console.warn('Firebase Google Auth popup skipped/failed, using GIS token client:', err);
  }

  return new Promise((resolve, reject) => {
    const clientId = firebaseConfigJson.oAuthClientId || '';

    const executeTokenRequest = () => {
      try {
        const client = window.google.accounts.oauth2.initTokenClient({
          client_id: clientId,
          scope: 'https://www.googleapis.com/auth/drive.file',
          callback: (response: any) => {
            if (response.error) {
              reject(response);
            } else if (response.access_token) {
              cachedAccessToken = response.access_token;
              resolve(response.access_token);
            } else {
              reject(new Error('No access token returned from Google OAuth.'));
            }
          },
        });
        client.requestAccessToken({ prompt: '' });
      } catch (err) {
        reject(err);
      }
    };

    if (!window.google?.accounts?.oauth2) {
      const script = document.createElement('script');
      script.src = 'https://accounts.google.com/gsi/client';
      script.async = true;
      script.defer = true;
      script.onload = () => executeTokenRequest();
      script.onerror = () => reject(new Error('Failed to load Google OAuth library.'));
      document.head.appendChild(script);
    } else {
      executeTokenRequest();
    }
  });
};

/**
 * Upload a file (Text, CSV, JSON) to Google Drive using Google Drive REST v3 API
 */
export const uploadFileToGoogleDrive = async (
  fileName: string,
  content: string,
  mimeType: string = 'text/plain'
): Promise<DriveUploadResult> => {
  try {
    const token = await getGoogleAccessToken();

    const metadata = {
      name: fileName,
      mimeType: mimeType,
      description: 'Neneh Funkuba Enterprise ERP System Cloud Backup / Export Document'
    };

    const form = new FormData();
    form.append(
      'metadata',
      new Blob([JSON.stringify(metadata)], { type: 'application/json' })
    );
    form.append(
      'file',
      new Blob([content], { type: mimeType })
    );

    const response = await fetch(
      'https://www.googleapis.com/upload/drive/v3/files?uploadType=multipart&fields=id,name,webViewLink',
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${token}`
        },
        body: form
      }
    );

    if (!response.ok) {
      const errData = await response.json();
      throw new Error(errData?.error?.message || 'Failed to upload file to Google Drive');
    }

    const data = await response.json();
    return {
      success: true,
      fileId: data.id,
      fileName: data.name,
      webViewLink: data.webViewLink || `https://drive.google.com/file/d/${data.id}/view`
    };
  } catch (error: any) {
    console.error('Google Drive Upload Error:', error);
    return {
      success: false,
      error: error?.message || 'An error occurred while uploading to Google Drive.'
    };
  }
};
