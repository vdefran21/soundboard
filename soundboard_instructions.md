```
# Soundboard Web Application Development Request

## Context

You are tasked with creating a complete Node.js TypeScript web application from scratch that implements a soundboard interface. The application should provide a web-based soundboard that mimics the appearance and functionality of an Akai MPD2 MIDI pad controller, dynamically loading audio files and creating an interactive pad interface.

---

## Core Requirements

1. **Technology Stack**
   - Node.js with TypeScript for the backend server
   - Express.js framework for web server functionality
   - HTML5, CSS3, and vanilla TypeScript/JavaScript for the frontend
   - Web Audio API for audio playback functionality
   - Strong typing throughout the entire codebase using TypeScript interfaces and types

2. **Visual Design Requirements**
   - Interface must visually resemble an Akai MPD2 MIDI pad controller
   - Responsive grid layout with 16 pad buttons (4x4 grid) as the primary interface
   - Dark theme with illuminated pad styling similar to hardware units
   - Pad buttons should have visual feedback (lighting up) when pressed
   - Include realistic styling with gradients, shadows, and proper spacing

3. **Audio Functionality**
   - Dynamically scan the `/audio` directory for audio files (support .wav, .mp3, .ogg formats)
   - Generate pad buttons based on the number of audio files found
   - Each pad button maps to one audio file and plays it when clicked
   - Support simultaneous audio playback (multiple pads can play at once)
   - Implement proper audio loading and error handling

4. **Dynamic Content Loading**
   - Backend API endpoint to serve available audio files list
   - Frontend dynamically requests and builds the interface based on available audio files
   - Graceful handling when no audio files are present
   - File watching capability to detect new audio files without server restart

---

## Technical Implementation Requirements

1. **Project Structure & Organization**
   - Implement a clean, scalable folder hierarchy:
     ```
     /src
       /controllers    (API route handlers)
       /services      (Business logic)
       /models        (TypeScript interfaces/types)
       /routes        (Express route definitions)
       /utils         (Helper functions)
       /middleware    (Express middleware)
     /public
       /css           (Stylesheets)
       /js            (Frontend TypeScript/JavaScript)
       /assets        (Static assets)
     /audio           (Audio files directory)
     ```
   - Use consistent TypeScript naming conventions throughout
   - Implement proper module exports and imports

2. **Backend Architecture**
   - Create a RESTful API with proper TypeScript interfaces
   - Implement service layer pattern for audio file management
   - Use object-oriented design with classes for core functionality
   - Implement proper error handling with typed error responses
   - Include file system watching for dynamic audio file detection
   - Create typed configuration management using environment variables

3. **Frontend Architecture**
   - Build a modular TypeScript frontend with proper class-based components
   - Implement a SoundboardController class to manage pad interactions
   - Create an AudioManager class for Web Audio API interactions
   - Use TypeScript interfaces for all data structures and API responses
   - Implement proper DOM manipulation with type safety

4. **Styling Requirements**
   - CSS Grid or Flexbox for responsive pad layout
   - CSS custom properties (variables) for consistent theming
   - Smooth transitions and animations for pad interactions
   - Media queries for mobile responsiveness
   - SCSS/Sass preprocessing if beneficial for maintainability

---

## Functional Specifications

1. **Audio File Management**
   - Automatic detection of supported audio formats in `/audio` directory
   - RESTful API endpoint: `GET /api/audio-files` returning typed JSON response
   - Proper audio file validation and error handling
   - Support for audio file metadata extraction (filename, duration, etc.)

2. **Pad Interface Behavior**
   - Click/touch interaction to trigger audio playback
   - Visual feedback with CSS transitions (pad "lighting up")
   - Display audio file name on each pad
   - Handle loading states and error states for missing files
   - Keyboard shortcuts for pad triggering (optional enhancement)

3. **Web Audio Implementation**
   - Use Web Audio API for low-latency audio playback
   - Implement audio context management with proper initialization
   - Support for audio file preloading to minimize playback delay
   - Volume control functionality
   - Proper cleanup of audio resources

---

## Code Quality Standards

1. **TypeScript Implementation**
   - Strict TypeScript configuration with no implicit any
   - Comprehensive type definitions for all functions, classes, and data structures
   - Use of TypeScript interfaces for API contracts and data models
   - Proper generic types where applicable
   - Type guards for runtime type checking

2. **Modern JavaScript/TypeScript Features**
   - Use async/await for all asynchronous operations
   - Implement proper Promise handling with typed responses
   - Use ES6+ features (arrow functions, destructuring, template literals)
   - Modular code organization with ES6 imports/exports

3. **Error Handling & Validation**
   - Comprehensive error handling with typed error objects
   - Input validation for API endpoints
   - Graceful degradation for unsupported browsers
   - User-friendly error messages in the interface

---

## Performance & Best Practices

1. **Optimization Requirements**
   - Implement audio file caching strategies
   - Lazy loading for audio files when possible
   - Efficient DOM manipulation practices
   - Minimize bundle size with proper code splitting

2. **Development Best Practices**
   - Include comprehensive JSDoc comments with TypeScript annotations
   - Implement consistent code formatting (Prettier/ESLint configuration)
   - Create reusable, modular components
   - Follow SOLID principles in class design

---

## Deliverables

- Complete, production-ready TypeScript codebase with proper project structure
- Working web application that can be started with `npm start`
- Comprehensive package.json with all necessary dependencies and scripts
- README.md with setup, installation, and usage instructions
- TypeScript configuration files (tsconfig.json)
- Basic HTML template with proper semantic structure
- CSS styling that accurately represents the Akai MPD2 aesthetic
- Example audio files or instructions for adding audio files

---

## Additional Considerations

- Ensure cross-browser compatibility (Chrome, Firefox, Safari, Edge)
- Consider accessibility features (keyboard navigation, screen reader support)
- Plan for future enhancements (recording functionality, MIDI connectivity)
- Document the API endpoints and their TypeScript interfaces
- Include error handling for common scenarios (missing audio directory, unsupported audio formats)

---

Please create a complete, functional soundboard web application that meets all the specified requirements, with emphasis on clean TypeScript implementation, modern web development practices, and an authentic hardware-inspired user interface.

```