# Release Management Guide

This guide explains how to create new releases and properly manage versioning for Retrosprite.

## Table of Contents
- [Quick Release Guide](#quick-release-guide)
- [Detailed Release Process](#detailed-release-process)
- [Version Numbering](#version-numbering)
- [What GitHub Actions Does](#what-github-actions-does)
- [Testing the Update Mechanism](#testing-the-update-mechanism)
- [Troubleshooting](#troubleshooting)

---

## Quick Release Guide

For experienced users, here's the TL;DR:

```bash
# 1. Update version in wails.json
# Edit wails.json and change "version" and "productVersion" to your new version (e.g., "1.0.1")

# 2. Commit your changes
git add .
git commit -m "feat: Testing version update"

# 3. Create and push the version tag
git tag v1.0.1
git push origin main
git push origin v1.0.1
```

GitHub Actions will automatically:
- Build Windows installer (NSIS .exe)
- Build macOS DMG (Universal binary)
- Create a GitHub release with auto-generated release notes
- Attach all installers to the release

---

## Detailed Release Process

### Step 1: Update Version Numbers

Version is managed in one primary location with automatic synchronization:

**Primary Source: `wails.json`**
```json
{
  "version": "1.0.1",
  "productVersion": "1.0.1"
}
```

Update both fields to your new version number.

**Note:** The version in `version.go` and `installer.nsi` is automatically updated by GitHub Actions during the build process.

### Step 2: Commit Your Changes

```bash
# Stage all your changes
git add .

# Create a descriptive commit message
# Use conventional commits format: type(scope): description
git commit -m "feat: add new furniture editor features

- Add drag-and-drop support for sprites
- Improve animation timeline UI
- Fix offset calculation bugs"
```

**Conventional Commit Types:**
- `feat:` - New feature
- `fix:` - Bug fix
- `docs:` - Documentation changes
- `style:` - Code style changes (formatting, etc.)
- `refactor:` - Code refactoring
- `perf:` - Performance improvements
- `test:` - Adding or updating tests
- `chore:` - Maintenance tasks

### Step 3: Create a Version Tag

Tags must follow the format `v{MAJOR}.{MINOR}.{PATCH}`:

```bash
# Create the tag locally
git tag v1.1.0

# Or create with an annotated message
git tag -a v1.1.0 -m "Release version 1.1.0

New features:
- Drag-and-drop sprite editor
- Improved animation timeline
- Bug fixes and performance improvements"
```

### Step 4: Push to GitHub

```bash
# Push your commits
git push origin main

# Push the tag (this triggers GitHub Actions)
git push origin v1.1.0
```

**⚠️ Important:** Pushing the tag triggers the build workflow. Make sure all your changes are committed first!

### Step 5: Monitor the Build

1. Go to **https://github.com/Bopified/Retrosprite/actions**
2. Watch the "Build and Release" workflow
3. Build times:
   - Windows: ~5 minutes
   - macOS: ~7 minutes
   - Total: ~10-15 minutes

### Step 6: Verify the Release

1. Go to **https://github.com/Bopified/Retrosprite/releases**
2. Verify the new release is created
3. Check that both installers are attached:
   - `Retrosprite-Installer.exe` (Windows)
   - `Retrosprite-{version}-macOS.dmg` (macOS)
4. Review the auto-generated release notes

---

## Version Numbering

We use [Semantic Versioning](https://semver.org/):

### Format: `MAJOR.MINOR.PATCH`

**MAJOR** (1.x.x) - Increment when:
- Making incompatible API changes
- Breaking changes to file formats (.rspr, .nitro)
- Major UI/UX overhauls

**MINOR** (x.1.x) - Increment when:
- Adding new features (backward compatible)
- Adding new export formats
- Significant improvements to existing features

**PATCH** (x.x.1) - Increment when:
- Bug fixes
- Performance improvements
- Small tweaks and polish

### Examples

| Version | Change Type | Description |
|---------|-------------|-------------|
| 1.0.0 → 1.0.1 | Patch | Fixed offset calculation bug |
| 1.0.1 → 1.1.0 | Minor | Added new sprite sheet generator |
| 1.1.0 → 2.0.0 | Major | Changed .rspr file format (breaking) |

---

## What GitHub Actions Does

When you push a tag, the workflow automatically:

### 1. Version Synchronization
```yaml
# Extracts version from tag (v1.1.0 → 1.1.0)
VERSION=${GITHUB_REF#refs/tags/v}

# Updates wails.json
"version": "1.1.0"

# Updates installer.nsi
VERSIONMAJOR 1
VERSIONMINOR 1
VERSIONBUILD 0

# Injects into Go binary at build time
-ldflags "-X main.Version=1.1.0"
```

### 2. Multi-Platform Builds

**Windows (windows-latest runner):**
- Installs Go, Node.js, Wails
- Builds frontend (Vite + TypeScript)
- Compiles Go backend
- Creates NSIS installer with:
  - File associations (.rspr, .nitro)
  - Desktop shortcut
  - Start menu entries
  - Uninstaller

**macOS (macos-latest runner):**
- Builds universal binary (Intel + Apple Silicon)
- Creates DMG with:
  - App bundle
  - Drag-to-Applications link
  - Custom icon
  - Volume settings

### 3. Release Creation

- Creates GitHub release with:
  - Tag name as title
  - Auto-generated release notes from commits
  - All installer files attached
  - Download counts tracking

---

## Testing the Update Mechanism

### Test Scenario 1: Fresh Install
1. Download the installer from the latest release
2. Install the application
3. Launch and check the About dialog
4. Version should match the release

### Test Scenario 2: Update Available
1. Have version 1.0.0 installed
2. Create and release version 1.0.1
3. Launch the 1.0.0 app
4. After 2 seconds, update dialog should appear
5. Click "Download Update" to open releases page

### Test Scenario 3: Manual Check
1. Open the app
2. Click three-dot menu → "About Retrosprite"
3. Click "Check for Updates"
4. Should show:
   - "Update Available" dialog (if newer exists)
   - "You are using the latest version!" (if up to date)

### Test Scenario 4: Offline Mode
1. Disconnect from internet
2. Check for updates
3. Should show: "Failed to connect to update server"
4. App should still function normally

---

## Troubleshooting

### Problem: GitHub Actions Fails

**Check the Actions tab:**
```
https://github.com/Bopified/Retrosprite/actions
```

**Common issues:**

1. **Frontend compilation fails**
   - Check TypeScript errors in the logs
   - Ensure `wailsjs` bindings are committed
   - Verify `npm install` succeeded

2. **NSIS installer fails**
   - Check NSIS is in PATH
   - Verify `installer.nsi` syntax
   - Ensure all icon files exist

3. **macOS build fails**
   - Check Xcode version compatibility
   - Verify universal binary support
   - Check DMG creation logs

### Problem: Update Check Returns 404

**Cause:** No releases exist on GitHub yet

**Solution:**
```bash
# Create your first release
git tag v1.0.0
git push origin v1.0.0
```

After the workflow completes, the 404 will disappear.

### Problem: Wrong Version Displayed in App

**Check these files are in sync:**
1. `wails.json` - "version" field
2. `version.go` - Version constant (or overridden by build)
3. About dialog - Uses `GetCurrentVersion()` from backend

**Fix:**
```bash
# Ensure you're building with the correct flags
wails build -ldflags "-X main.Version=1.0.0"
```

### Problem: Tag Already Exists

**If you need to update a tag:**
```bash
# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0

# Create new tag
git tag v1.0.0

# Force push
git push origin v1.0.0 --force
```

**⚠️ Warning:** Only force-push tags if the release hasn't been distributed to users yet!

---

## Advanced: Pre-release Versions

For beta/alpha releases:

```bash
# Create a pre-release tag
git tag v1.1.0-beta.1
git push origin v1.1.0-beta.1
```

**Note:** The update checker automatically skips pre-releases. Users on stable versions won't see beta updates.

To create a draft release for testing:
1. Edit the workflow file
2. Change `draft: false` to `draft: true`
3. Release will be created but not published

---

## Checklist for Releases

Before creating a release, verify:

- [ ] All tests pass locally (`wails dev` works)
- [ ] Version updated in `wails.json`
- [ ] CHANGELOG.md updated (if you maintain one)
- [ ] Breaking changes documented
- [ ] New features tested
- [ ] README.md reflects new features
- [ ] Commit messages are clear and descriptive
- [ ] Tag follows semantic versioning
- [ ] You're on the correct branch (usually `main`)

---

## Quick Reference

```bash
# Check current version
cat wails.json | grep version

# List all tags
git tag -l

# View tag details
git show v1.0.0

# Delete local tag
git tag -d v1.0.0

# Delete remote tag
git push origin :refs/tags/v1.0.0

# View GitHub Actions status
gh run list --limit 5

# Download release assets
gh release download v1.0.0
```

---

## Additional Resources

- [Semantic Versioning](https://semver.org/)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [GitHub Actions Documentation](https://docs.github.com/en/actions)
- [Wails Documentation](https://wails.io/docs/introduction)

---

**Last Updated:** January 2026
