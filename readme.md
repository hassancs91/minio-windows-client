# MinIO MC GUI Wrapper

A simple desktop GUI wrapper for MinIO's `mc` command-line tool.

## Features

- **Connection Management**
  - Connect to MinIO servers
  - Test connections
  - Save connection profiles

- **Bucket Operations**
  - Create new buckets
  - List existing buckets
  - Make buckets public/private
  - Get public URLs for file access

- **User Management**
  - Create new users
  - List existing users
  - Assign policies (readwrite, readonly, writeonly)
  - Users can be used as S3-compatible access keys

- **Public Access Configuration**
  - Make buckets publicly accessible
  - Custom policy JSON editor
  - Pre-configured templates for common scenarios
  - Remove public access
  - Check bucket access status

- **Portable Windows Application** (no installation required)

## Setup Instructions

### Prerequisites

1. Node.js installed on your development machine
2. The MinIO `mc.exe` executable file

### Development Setup

1. **Clone/Create project directory**
   ```bash
   mkdir minio-mc-wrapper
   cd minio-mc-wrapper
   ```

2. **Add all the files provided**:
   - `package.json`
   - `main.js`
   - `preload.js`
   - `index.html`

3. **Download mc.exe**:
   - Download from: https://dl.min.io/client/mc/release/windows-amd64/mc.exe
   - Place `mc.exe` in the project root directory

4. **Install dependencies**:
   ```bash
   npm install
   ```

5. **Run in development**:
   ```bash
   npm start
   ```

### Building Portable App

1. **Build the portable executable**:
   ```bash
   npm run dist
   ```

2. **Find your portable app**:
   - Look in the `dist` folder
   - You'll find `MinIO MC Wrapper 1.0.0.exe` (portable executable)

### Usage

1. Run the portable executable
2. **Connection Tab**: Enter your MinIO server details
   - Alias: A friendly name for your connection
   - Server URL: Your MinIO server URL
   - Access Key: Your MinIO access key
   - Secret Key: Your MinIO secret key
3. **Buckets Tab**: Create and manage buckets
4. **Users Tab**: Create users (these work as S3 access keys)
   - Username becomes the Access Key
   - Password becomes the Secret Key
5. **Public Access Tab**: Make buckets publicly accessible
   - Select a bucket
   - Choose access level (download only or upload+download)
   - Apply the policy
   - Get the public URL for direct file access

### Public URL Access

When you make a bucket public, files can be accessed directly via:
```
https://your-server.com/bucket-name/filename.jpg
```
No authentication required for public buckets!

### Notes

- Configuration is stored in `~/.mc` folder in your user directory
- The app bundles `mc.exe` so no additional installations are required
- Works offline once configured

### License

MIT