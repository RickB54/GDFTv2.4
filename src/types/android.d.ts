
interface AndroidBridge {
  // Enhanced backup/restore with directory selection
  createBackupFile(jsonString: string, filename: string, requestCode: number): Promise<boolean>;
  openRestoreFile(requestCode: number): Promise<void>;
  
  // New methods for Android 13 SAF compliance
  requestStoragePermissions(): Promise<boolean>;
  checkStoragePermissions(): Promise<boolean>;
  selectBackupDirectory(): Promise<string | null>;
  selectRestoreFile(): Promise<string | null>;
  
  // Enhanced file operations with directory support
  createBackupFileInDirectory(jsonString: string, filename: string, directoryUri: string): Promise<boolean>;
  readFileFromUri(fileUri: string): Promise<string>;
  
  // Error handling and status
  getLastError(): Promise<string | null>;
  isStorageAccessFrameworkAvailable(): Promise<boolean>;
  
  // Callbacks
  onFileSelected?: (content: string) => void;
  onDirectorySelected?: (directoryUri: string) => void;
  onPermissionResult?: (granted: boolean) => void;
  onError?: (error: string) => void;
}

declare interface Window {
  Android?: AndroidBridge;
}
