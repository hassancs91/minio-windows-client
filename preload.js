const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
  setAlias: (config) => ipcRenderer.invoke('set-alias', config),
  testConnection: (alias) => ipcRenderer.invoke('test-connection', alias),
  createBucket: (config) => ipcRenderer.invoke('create-bucket', config),
  listBuckets: (alias) => ipcRenderer.invoke('list-buckets', alias),
  // User management
  listUsers: (alias) => ipcRenderer.invoke('list-users', alias),
  createUser: (config) => ipcRenderer.invoke('create-user', config),
  attachPolicy: (config) => ipcRenderer.invoke('attach-policy', config),
  // Public bucket management
  makeBucketPublic: (config) => ipcRenderer.invoke('make-bucket-public', config),
  removeBucketPublic: (config) => ipcRenderer.invoke('remove-bucket-public', config),
  checkBucketPolicy: (config) => ipcRenderer.invoke('check-bucket-policy', config)
});