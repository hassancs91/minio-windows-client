const { app, BrowserWindow, ipcMain } = require('electron');
const path = require('path');
const { exec } = require('child_process');
const os = require('os');
const fs = require('fs');

let mainWindow;
let mcPath;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1000,
    height: 700,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false
    },
    autoHideMenuBar: true
  });

  mainWindow.loadFile('index.html');
}

app.whenReady().then(() => {
  // Set mc.exe path - in production it will be in resources folder
  if (app.isPackaged) {
    mcPath = path.join(process.resourcesPath, 'mc.exe');
  } else {
    // For development, assume mc.exe is in the project root
    mcPath = path.join(__dirname, 'mc.exe');
  }

  createWindow();
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// IPC handlers for mc commands
ipcMain.handle('set-alias', async (event, { alias, url, accessKey, secretKey }) => {
  return new Promise((resolve, reject) => {
    const cmd = `"${mcPath}" alias set ${alias} ${url} ${accessKey} ${secretKey}`;
    
    exec(cmd, { 
      env: { ...process.env, MC_HOST_CONFIG: path.join(os.homedir(), '.mc') }
    }, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }
      resolve(stdout);
    });
  });
});

ipcMain.handle('test-connection', async (event, alias) => {
  return new Promise((resolve, reject) => {
    const cmd = `"${mcPath}" ls ${alias}`;
    
    exec(cmd, { 
      env: { ...process.env, MC_HOST_CONFIG: path.join(os.homedir(), '.mc') }
    }, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }
      resolve(stdout || 'Connection successful!');
    });
  });
});

ipcMain.handle('create-bucket', async (event, { alias, bucketName }) => {
  return new Promise((resolve, reject) => {
    const cmd = `"${mcPath}" mb ${alias}/${bucketName}`;
    
    exec(cmd, { 
      env: { ...process.env, MC_HOST_CONFIG: path.join(os.homedir(), '.mc') }
    }, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }
      if (stderr) {
        reject(stderr);
        return;
      }
      resolve(stdout);
    });
  });
});

ipcMain.handle('list-buckets', async (event, alias) => {
  return new Promise((resolve, reject) => {
    const cmd = `"${mcPath}" ls ${alias}`;
    
    exec(cmd, { 
      env: { ...process.env, MC_HOST_CONFIG: path.join(os.homedir(), '.mc') }
    }, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }
      resolve(stdout);
    });
  });
});

// User management handlers
ipcMain.handle('list-users', async (event, alias) => {
  return new Promise((resolve, reject) => {
    const cmd = `"${mcPath}" admin user list ${alias}`;
    
    exec(cmd, { 
      env: { ...process.env, MC_HOST_CONFIG: path.join(os.homedir(), '.mc') }
    }, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }
      resolve(stdout);
    });
  });
});

ipcMain.handle('create-user', async (event, { alias, username, password }) => {
  return new Promise((resolve, reject) => {
    const cmd = `"${mcPath}" admin user add ${alias} ${username} ${password}`;
    
    exec(cmd, { 
      env: { ...process.env, MC_HOST_CONFIG: path.join(os.homedir(), '.mc') }
    }, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }
      resolve(stdout);
    });
  });
});

ipcMain.handle('attach-policy', async (event, { alias, username, policy }) => {
  return new Promise((resolve, reject) => {
    const cmd = `"${mcPath}" admin policy attach ${alias} ${policy} --user ${username}`;
    
    exec(cmd, { 
      env: { ...process.env, MC_HOST_CONFIG: path.join(os.homedir(), '.mc') }
    }, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }
      resolve(stdout || 'Policy attached successfully');
    });
  });
});

// Public bucket handlers
ipcMain.handle('make-bucket-public', async (event, { alias, bucketName, policyJson, serverUrl }) => {
  return new Promise(async (resolve, reject) => {
    try {
      // Create temp policy file
      const tempDir = app.getPath('temp');
      const policyFile = path.join(tempDir, `policy-${Date.now()}.json`);
      fs.writeFileSync(policyFile, policyJson);

      // Create policy
      const createPolicyCmd = `"${mcPath}" admin policy create ${alias} public-${bucketName} "${policyFile}"`;
      
      await new Promise((res, rej) => {
        exec(createPolicyCmd, { 
          env: { ...process.env, MC_HOST_CONFIG: path.join(os.homedir(), '.mc') }
        }, (error, stdout, stderr) => {
          if (error && !error.message.includes('already exists')) {
            rej(error.message);
            return;
          }
          res(stdout);
        });
      });

      // Apply anonymous access
      const setAnonymousCmd = `"${mcPath}" anonymous set download ${alias}/${bucketName}`;
      
      await new Promise((res, rej) => {
        exec(setAnonymousCmd, { 
          env: { ...process.env, MC_HOST_CONFIG: path.join(os.homedir(), '.mc') }
        }, (error, stdout, stderr) => {
          if (error) {
            rej(error.message);
            return;
          }
          res(stdout);
        });
      });

      // Clean up temp file
      fs.unlinkSync(policyFile);

      // Return the public URL
      const publicUrl = `${serverUrl}/${bucketName}/`;
      resolve({
        message: 'Bucket is now public',
        publicUrl: publicUrl
      });

    } catch (error) {
      reject(error);
    }
  });
});

ipcMain.handle('remove-bucket-public', async (event, { alias, bucketName }) => {
  return new Promise((resolve, reject) => {
    const cmd = `"${mcPath}" anonymous set none ${alias}/${bucketName}`;
    
    exec(cmd, { 
      env: { ...process.env, MC_HOST_CONFIG: path.join(os.homedir(), '.mc') }
    }, (error, stdout, stderr) => {
      if (error) {
        reject(error.message);
        return;
      }
      resolve(stdout || 'Public access removed');
    });
  });
});

ipcMain.handle('check-bucket-policy', async (event, { alias, bucketName }) => {
  return new Promise((resolve, reject) => {
    const cmd = `"${mcPath}" anonymous get ${alias}/${bucketName}`;
    
    exec(cmd, { 
      env: { ...process.env, MC_HOST_CONFIG: path.join(os.homedir(), '.mc') }
    }, (error, stdout, stderr) => {
      if (error) {
        resolve('none'); // No public access
        return;
      }
      resolve(stdout.trim());
    });
  });
});