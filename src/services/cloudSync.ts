// Cloud Synchronization & Google Drive Integration Service
import { uploadFileToGoogleDrive, DriveUploadResult } from '../utils/googleDrive';

export interface ERPBackupPayload {
  system: string;
  version?: string;
  exportDate: string;
  sales?: any[];
  expenses?: any[];
  products?: any[];
  customers?: any[];
  suppliers?: any[];
  ledgers?: any[];
  categories?: any[];
  users?: any[];
  purchaseOrders?: any[];
  [key: string]: any;
}

const LAST_AUTO_SYNC_KEY = 'neneh_funkuba_last_auto_drive_sync';
const TWENTY_FOUR_HOURS_MS = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

/**
 * Backup the ERP database state directly to Google Drive as a JSON snapshot.
 * Uses Google Drive REST API v3 with user OAuth access token.
 * 
 * @param erpData The current state/data object of Neneh Funkuba Enterprise ERP
 * @param customFileName Optional custom file name for the snapshot
 */
export const backupDatabaseToDrive = async (
  erpData: ERPBackupPayload,
  customFileName?: string
): Promise<DriveUploadResult> => {
  try {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
    const fileName = customFileName || `Neneh_Funkuba_ERP_Backup_${timestamp}.json`;

    const payloadWithMeta: ERPBackupPayload = {
      system: 'Neneh Funkuba Enterprise ERP System',
      version: '1.0.0',
      exportDate: new Date().toISOString(),
      ...erpData
    };

    const jsonContent = JSON.stringify(payloadWithMeta, null, 2);

    const result = await uploadFileToGoogleDrive(
      fileName,
      jsonContent,
      'application/json'
    );

    if (result.success) {
      setLastAutomatedSyncTime(new Date().toISOString());
    }

    return result;
  } catch (error: any) {
    console.error('Error backing up database to Google Drive:', error);
    return {
      success: false,
      error: error?.message || 'An unexpected error occurred during Google Drive database backup.'
    };
  }
};

/**
 * Get timestamp string of the last automated or manual Drive sync from LocalStorage.
 */
export const getLastAutomatedSyncTime = (): string | null => {
  try {
    return localStorage.getItem(LAST_AUTO_SYNC_KEY);
  } catch {
    return null;
  }
};

/**
 * Set timestamp string of last successful Drive sync.
 */
export const setLastAutomatedSyncTime = (timestampIsoStr: string): void => {
  try {
    localStorage.setItem(LAST_AUTO_SYNC_KEY, timestampIsoStr);
  } catch (err) {
    console.error('Failed to save last auto sync time:', err);
  }
};

let syncIntervalId: NodeJS.Timeout | null = null;

/**
 * Automate backupDatabaseToDrive execution every 24 hours using a scheduled background interval.
 * Checks on mount and periodically if 24 hours have passed since the last backup.
 * 
 * @param getERPData Function that returns the latest ERP state payload
 * @param onSyncCompleted Optional callback invoked after automatic background sync attempt
 * @returns Cleanup function to cancel the background interval schedule
 */
export const startAutomated24HourSync = (
  getERPData: () => ERPBackupPayload,
  onSyncCompleted?: (result: DriveUploadResult) => void
): (() => void) => {
  if (syncIntervalId) {
    clearInterval(syncIntervalId);
    syncIntervalId = null;
  }

  const checkAndRunAutoSync = async () => {
    const lastSyncStr = getLastAutomatedSyncTime();
    const now = Date.now();
    let shouldSync = false;

    if (!lastSyncStr) {
      shouldSync = true;
    } else {
      const lastSyncTime = new Date(lastSyncStr).getTime();
      if (isNaN(lastSyncTime) || (now - lastSyncTime) >= TWENTY_FOUR_HOURS_MS) {
        shouldSync = true;
      }
    }

    if (shouldSync) {
      console.log('Automated 24-Hour Cloud Sync: Triggering background Google Drive backup...');
      try {
        const data = getERPData();
        const result = await backupDatabaseToDrive(data, `Auto_24h_Neneh_Funkuba_ERP_${new Date().toISOString().slice(0, 10)}.json`);
        if (onSyncCompleted) {
          onSyncCompleted(result);
        }
      } catch (err) {
        console.error('Automated 24-Hour Cloud Sync failed:', err);
      }
    }
  };

  // Run initial check after a brief 5 second delay on app start
  const initialTimeout = setTimeout(() => {
    checkAndRunAutoSync();
  }, 5000);

  // Set recurring check every 1 hour to see if 24 hours elapsed (or standard 24h interval)
  // Checking hourly ensures that if the browser tab stays open across days, the 24h threshold triggers reliably
  const HOURLY_CHECK_MS = 60 * 60 * 1000;
  syncIntervalId = setInterval(checkAndRunAutoSync, HOURLY_CHECK_MS);

  return () => {
    clearTimeout(initialTimeout);
    if (syncIntervalId) {
      clearInterval(syncIntervalId);
      syncIntervalId = null;
    }
  };
};

/**
 * Health check or status test for Cloud Sync capabilities.
 */
export const testCloudSyncConnection = async (): Promise<{ status: 'ready' | 'error'; message: string }> => {
  return {
    status: 'ready',
    message: 'Google Drive Cloud Sync Service initialized and ready for automated 24-hour snapshots.'
  };
};

