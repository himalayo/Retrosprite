# Building the Retrosprite Installer

This guide explains how to build the Windows installer for Retrosprite with proper file association for `.rspr` files.

## Prerequisites

1. **NSIS (Nullsoft Scriptable Install System)**
   - Download from: https://nsis.sourceforge.io/Download
   - Install NSIS to the default location (usually `C:\Program Files (x86)\NSIS`)
   - Add NSIS to your PATH environment variable

2. **Go and Wails**
   - Ensure you have Go installed
   - Ensure you have Wails CLI installed: `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

## Building the Installer

### Step 1: Build the Application

First, build the Retrosprite application:

```bash
wails build
```

This will create `Retrosprite.exe` in the `build/bin` directory.

### Step 2: Build the NSIS Installer

Navigate to the `build/windows` directory and run NSIS:

```bash
cd build\windows
makensis installer.nsi
```

This will create `Retrosprite-Installer.exe` in the root project directory.

## What the Installer Does

The installer sets up the following:

1. **Application Installation**
   - Installs Retrosprite to `C:\Program Files\Retrosprite`
   - Creates desktop shortcut
   - Creates Start Menu shortcuts

2. **File Association for .rspr Files**
   - Associates `.rspr` extension with Retrosprite
   - Sets the app icon as the icon for `.rspr` files
   - Enables double-clicking `.rspr` files to open them in Retrosprite
   - Adds "Open with Retrosprite" to the context menu

3. **Windows Registry**
   - Registers the application in Windows Add/Remove Programs
   - Creates proper uninstaller

## Using the Installer

1. Run `Retrosprite-Installer.exe`
2. Follow the installation wizard
3. After installation, `.rspr` files will:
   - Show the Retrosprite icon in File Explorer
   - Open in Retrosprite when double-clicked
   - Have "Open with Retrosprite" in the right-click context menu

## Uninstalling

The installer creates a proper uninstaller that:
- Removes all installed files
- Removes shortcuts
- Removes file associations
- Cleans up registry entries

You can uninstall via:
- Windows Settings > Apps > Retrosprite
- Start Menu > Retrosprite > Uninstall
- Running `Uninstall.exe` from the installation directory

## Customizing the Installer

The installer script is located at `build/windows/installer.nsi`. You can customize:

- Version numbers (lines 7-9)
- URLs for help/updates/about (lines 10-12)
- Installation directory
- Shortcuts created
- File associations

## Troubleshooting

### NSIS not found
Ensure NSIS is installed and added to your PATH. You can also specify the full path to `makensis.exe`:

```bash
"C:\Program Files (x86)\NSIS\makensis.exe" installer.nsi
```

### Icon not showing for .rspr files
After installation, you may need to:
1. Refresh File Explorer (F5)
2. Restart File Explorer
3. Log out and log back in

### File association not working
Make sure you ran the installer with administrator privileges.

## Alternative: Quick Registry Script for Development

For quick testing during development, you can use the provided registry scripts:

### Quick Setup (Development Only)

1. Build the application: `wails build`
2. Edit `register-rspr-files.reg` and update the paths to match your actual project location
3. Double-click `register-rspr-files.reg` to register the file association
4. Test by double-clicking a `.rspr` file

### Removing the Association

Double-click `unregister-rspr-files.reg` to remove the file association.

**Note:** The registry scripts use hardcoded paths and are only recommended for development/testing. For distribution to end users, always use the NSIS installer.
