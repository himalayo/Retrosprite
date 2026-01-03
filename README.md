# Retrosprite

**Retrosprite** is a modern, high-performance asset editor and converter for Habbo Hotel retro servers, built for the **Nitro** client ecosystem. It allows users to view, edit, and convert SWF assets into Nitro-compatible JSON formats with a sleek, dark-themed UI.

![License](https://img.shields.io/badge/license-MIT-blue.svg)
![Platform](https://img.shields.io/badge/platform-Windows%20%7C%20macOS%20%7C%20Linux-lightgrey.svg)

## Features

### Asset Conversion & Editing
-   **Nitro Asset Converter**: Seamless conversion of SWF/Image assets into Nitro-compatible JSON structures
-   **Visual Asset Editor**: Fine-tune furniture offsets, directions, and visualizations
    -   Drag-and-drop position editor with grid alignment
    -   Real-time preview of animations and layer properties
    -   Zoom, pan, and camera controls for precise editing
-   **Smart Rename**: Automatically update internal asset references and filenames when renaming projects

### Developer Tools
-   **Integrated Code Editor**: CodeMirror-based editor for direct JSON manipulation
-   **File Explorer**: Navigate and manage project assets efficiently
-   **Recent Projects**: Quick access to previously opened projects

### User Experience
-   **Modern UI**: Material UI (MUI) design with custom dark theme
-   **Cross-Platform**: Built with Wails for native performance on Windows, macOS, and Linux
-   **File Association**: Register `.rspr` project files for seamless workflow

## Tech Stack

-   **Frontend**: React (TypeScript), Vite, Material UI (MUI)
-   **Backend**: [Wails v2](https://wails.io/) (Go)
-   **Editor**: CodeMirror
-   **Build System**: Vite, Go modules

## Getting Started

### Prerequisites

-   **Go**: 1.18 or higher
-   **Node.js**: 16 or higher
-   **Wails CLI**: Install with `go install github.com/wailsapp/wails/v2/cmd/wails@latest`

### Development Setup

1. Clone the repository:
   ```bash
   git clone https://github.com/Bopified/Retrosprite.git
   cd Retrosprite
   ```

2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   cd ..
   ```

3. Run the development server:
   ```bash
   wails dev
   ```

The application will start with hot-reload enabled for both frontend and backend changes.

### Building for Production

#### Quick Build
```bash
wails build
```

The compiled binary will be available in `build/bin/`.

#### Windows Installer
For Windows users, you can create an installer with file association support:

1. Build the application:
   ```bash
   wails build
   ```

2. Build the NSIS installer:
   ```bash
   cd build/windows
   makensis installer.nsi
   ```

See [BUILD_INSTALLER.md](BUILD_INSTALLER.md) for detailed instructions.

## Project Structure

```
Retrosprite/
├── app.go                 # Main application logic
├── convert.go             # Asset conversion utilities
├── mapper.go              # Asset mapping functions
├── json_structs.go        # JSON data structures
├── xml_structs.go         # XML parsing structures
├── nitro.go               # Nitro format handlers
├── frontend/              # React frontend application
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── assets/        # Static assets
│   │   └── App.tsx        # Main app component
│   └── package.json
├── build/
│   └── windows/          # Windows build resources
│       ├── installer.nsi # NSIS installer script
│       └── icon.ico      # Application icon
└── wails.json            # Wails configuration
```

## Usage

### Opening Projects
-   **File > Open Project**: Browse and open existing `.rspr` project files
-   **Recent Projects**: Click on recently opened projects from the sidebar
-   **Drag & Drop**: Drop `.rspr` files onto the application window

### Converting Assets
1. Open or create a project
2. Import SWF or image assets
3. Configure conversion settings
4. Export to Nitro-compatible JSON format

### Editing Assets
1. Open a project with furniture assets
2. Use the visual editor to adjust positions and offsets
3. Preview animations in real-time
4. Save changes to the project

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Guidelines
-   Follow existing code style and conventions
-   Write clear commit messages
-   Test your changes thoroughly
-   Update documentation as needed

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

-   Built with [Wails](https://wails.io/) - Go + Web framework
-   UI components from [Material-UI](https://mui.com/)
-   Code editor powered by [CodeMirror](https://codemirror.net/)

## Contact

**Author**: Bopified
**Email**: Bopified@proton.me

---

Made with ❤️ for the Habbo retro community
