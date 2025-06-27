# Akai MPD2 Soundboard

A web-based soundboard application that mimics the appearance and functionality of an Akai MPD2 MIDI pad controller. Built with Node.js, TypeScript, Express.js, and the Web Audio API.

![Soundboard Preview](https://via.placeholder.com/800x400/1a1a1a/ff6b35?text=Akai+MPD2+Soundboard)

## Features

🎵 **Authentic Akai MPD2 Design**
- Faithful recreation of the Akai MPD2 interface
- 4x4 grid of illuminated pads with visual feedback
- Dark theme with professional styling

🎹 **Audio Functionality**
- Supports WAV, MP3, and OGG audio formats
- Simultaneous multi-pad playback
- Low-latency audio using Web Audio API
- Master volume control and mute functionality

⚡ **Dynamic Content Loading**
- Automatic audio file scanning from `/audio` directory
- Real-time file watching for hot-reload functionality
- RESTful API for audio file management

🎮 **Interactive Controls**
- Click/touch pad activation
- Keyboard shortcuts (1-4, Q-R, A-F, Z-V)
- Volume controls and mute functionality

📱 **Responsive Design**
- Mobile-friendly interface
- Accessibility features (keyboard navigation, screen reader support)
- Cross-browser compatibility

## Quick Start

### Prerequisites

- Node.js (v18 or higher)
- npm (v8 or higher)

#### Testing on Chrome Mobile

To test the enhanced Chrome mobile compatibility:

1. **Open Chrome on Android/iOS** and navigate to your soundboard
2. **Tap any pad** - the first tap will unlock audio and you should see "🔓 Audio unlocked for mobile browser" in the console
3. **Subsequent taps** should play audio immediately
4. **Check Developer Tools** (Chrome Android) by connecting to `chrome://inspect` on desktop

**Troubleshooting Chrome Mobile**:
- Ensure you're testing on actual mobile devices, not desktop browser DevTools mobile simulation
- Check that the device volume is up and not muted
- Verify network connectivity for audio file loading
- Look for console errors that might indicate loading issues

## Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd soundboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Build the project**
   ```bash
   npm run build
   ```

4. **Start the server**
   ```bash
   npm start
   ```

5. **Open your browser**
   ```
   http://localhost:3000
   ```

### Development Mode

For development with automatic rebuilding:

```bash
npm run dev
```

This runs TypeScript compilation in watch mode and automatically restarts the server when changes are detected.

## Adding Audio Files

1. **Create audio directory** (if it doesn't exist)
   ```bash
   mkdir audio
   ```

2. **Add your audio files**
   - Supported formats: `.wav`, `.mp3`, `.ogg`
   - Files will be automatically detected when added to the `/audio` directory
   - Maximum file size: 50MB (configurable)

3. **Example audio files structure**
   ```
   audio/
   ├── kick.wav
   ├── snare.mp3
   ├── hihat.ogg
   └── crash.wav
   ```

4. **Refresh the interface**
   - Files are auto-detected if file watching is enabled
   - Or click the "Refresh" button in the interface

## Configuration

Configuration can be customized using environment variables:

### Environment Variables

Create a `.env` file in the root directory:

```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Audio Configuration
AUDIO_DIRECTORY=./audio
MAX_FILE_SIZE=52428800
ENABLE_FILE_WATCHING=true

# CORS Configuration
CORS_ORIGIN=*
```

### Configuration Options

| Variable | Default | Description |
|----------|---------|-------------|
| `PORT` | `3000` | Server port number |
| `AUDIO_DIRECTORY` | `./audio` | Path to audio files directory |
| `MAX_FILE_SIZE` | `52428800` | Maximum file size in bytes (50MB) |
| `ENABLE_FILE_WATCHING` | `true` | Enable automatic file detection |
| `CORS_ORIGIN` | `*` | CORS origin configuration |
| `NODE_ENV` | `development` | Environment mode |

## API Endpoints

The application provides a RESTful API for managing audio files:

### Audio Files

- **GET** `/api/audio-files`
  - Returns list of all available audio files
  - Response: `{ success: boolean, data: AudioFile[], count: number }`

- **GET** `/api/audio-files/:id`
  - Returns specific audio file metadata
  - Response: `{ success: boolean, data: AudioFile }`

- **POST** `/api/audio-files/refresh`
  - Manually refreshes the audio file list
  - Response: `{ success: boolean, data: AudioFile[], count: number }`

- **GET** `/api/audio-files-stats`
  - Returns audio library statistics
  - Response: `{ success: boolean, data: { totalFiles, totalSize, formats, averageSize } }`

### Audio Streaming

- **GET** `/api/audio/:filename`
  - Streams audio file content
  - Supports HTTP range requests for efficient streaming

### Health Check

- **GET** `/api/health`
  - Server health check endpoint
  - Response: `{ success: boolean, message: string, timestamp: Date, uptime: number }`

## Keyboard Shortcuts

- **Space/Enter**: Activate focused pad
- **Tab**: Navigate between pads

## Browser Compatibility

- ✅ Chrome 66+
- ✅ Firefox 60+
- ✅ Safari 11.1+
- ✅ Edge 79+

### Required Features

- Web Audio API
- ES6+ JavaScript support
- CSS Grid and Flexbox
- Fetch API

## Development

### Project Structure

```
soundboard/
├── src/                    # TypeScript source code
│   ├── controllers/        # API route handlers
│   ├── services/          # Business logic
│   ├── models/            # TypeScript interfaces
│   ├── routes/            # Express route definitions
│   ├── utils/             # Helper functions
│   ├── middleware/        # Express middleware
│   └── server.ts          # Main server file
├── public/                # Static files
│   ├── css/              # Stylesheets
│   ├── js/               # Frontend JavaScript
│   ├── assets/           # Static assets
│   └── index.html        # Main HTML template
├── audio/                 # Audio files directory
├── dist/                  # Compiled JavaScript output
└── docs/                  # Documentation
```

### Available Scripts

```bash
# Development
npm run dev              # Start development server with watch mode
npm run dev:server       # Run server only in development
npm run dev:build        # Build TypeScript in watch mode

# Production
npm run build            # Build for production
npm start               # Start production server

# Code Quality
npm run lint            # Run ESLint
npm run lint:fix        # Fix ESLint issues automatically
npm run format          # Format code with Prettier

# Utilities
npm run clean           # Clean build directory
```

### Code Style

This project uses:
- **ESLint** for code linting
- **Prettier** for code formatting
- **TypeScript** strict mode for type safety

### Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit your changes: `git commit -m 'Add amazing feature'`
4. Push to the branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

## Troubleshooting

### Common Issues

**Audio not playing**
- Ensure your browser supports Web Audio API
- Check if audio context is activated (click anywhere on the page)
- Verify audio files are in supported formats

**Files not detected**
- Check file permissions in `/audio` directory
- Ensure file extensions are `.wav`, `.mp3`, or `.ogg`
- Try manually refreshing using the refresh button

**Server won't start**
- Check if port 3000 is available
- Verify Node.js version (v18+ required)
- Check for TypeScript compilation errors

### Debug Mode

Enable debug logging:

```bash
DEBUG=soundboard:* npm start
```

### Performance Optimization

For large audio libraries:
- Consider reducing file sizes
- Use compressed audio formats (MP3, OGG)
- Disable file watching in production if not needed

## Browser Compatibility and Audio

### Mobile Browser Compatibility

**Enhanced Support**: This soundboard now provides excellent compatibility across all major mobile browsers!

#### iOS Safari
- ✅ Plays audio through built-in speakers even in Silent Mode
- ✅ Integrates with iOS media controls
- ✅ Works with volume buttons and Control Center
- ✅ Supports background audio playback

#### Chrome Mobile (Android & iOS)
- ✅ Automatic audio unlocking after first user interaction
- ✅ Optimized loading strategy for mobile connections
- ✅ Enhanced error handling for autoplay restrictions
- ✅ Fallback mechanisms for audio playback

#### Other Mobile Browsers
- ✅ Firefox Mobile, Samsung Internet, Edge Mobile
- ✅ Progressive enhancement for touch interfaces
- ✅ Haptic feedback on supported devices

**Technical Implementation**:
- Uses HTML5 Audio elements for maximum compatibility
- Implements mobile-specific audio unlocking techniques
- Detects and adapts to different mobile browser behaviors
- Provides graceful fallbacks for restricted environments

### Other Considerations

- **First Interaction Required**: All mobile browsers require a user tap/touch before audio can play (handled automatically)
- **Large Audio Files**: May cause slower loading on mobile connections
- **File Limit**: While there's no hard limit, very large numbers of files (500+) may impact performance on mobile devices

## License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## Acknowledgments

- Inspired by the Akai MPD2 MIDI controller
- Built with modern web technologies
- Uses HTML5 Audio for maximum compatibility and iOS support

## Support

For support, feature requests, or bug reports, please open an issue on GitHub.

---

**Made with ❤️ and 🎵**
