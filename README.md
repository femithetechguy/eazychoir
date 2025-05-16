# EazyChoir - Choir Management Web Application

## Overview

EazyChoir is a modern web application designed for choir management and organization. It helps choir directors, members, and administrators manage schedules, songs, and performances in an easy-to-use interface.

## Features

### Schedule Management

- View upcoming choir events and rehearsals
- Filter and search schedules by date, minister, or other criteria
- Easily share schedule links with others via copy-to-clipboard functionality
- Mobile-responsive design for on-the-go access

### Song Library

- Comprehensive database of choir songs with detailed information
- Song information includes:
  - Lyrics
  - YouTube video links (where available)
  - Authors/composers
  - Musical key
  - Song categories
- Copy lyrics functionality for quick sharing

### Mobile-Optimized Experience

- Responsive design that works across all devices
- Touch-friendly interface with animations and feedback
- Pull-to-refresh and interactive card views for mobile users
- Enhanced sharing capabilities for mobile devices

### User Interface

- Clean, intuitive design
- Dark/light mode switching
- Smooth animations and transitions
- Interactive elements with visual feedback

## Technical Details

### Architecture

- Built with vanilla JavaScript for core functionality
- Modular design with separate components for schedules and songs
- Event delegation pattern for efficient event handling
- Responsive CSS using media queries for all screen sizes

### Key Components

- `ScheduleSection`: Manages the display and interaction for choir schedules
- `songData`: Contains the choir's song library with comprehensive metadata
- Mobile menu system with touch-optimized controls and animations
- Modal system for detailed song viewing

### Clipboard Integration

- Multiple clipboard API implementations for cross-browser compatibility:
  - Modern Clipboard API (`navigator.clipboard`)
  - Web Share API for mobile sharing
  - Legacy clipboard handling as fallback

## Browser Compatibility

- Works on modern browsers (Chrome, Firefox, Safari, Edge)
- Graceful degradation for older browsers
- Special handling for iOS-specific behaviors

## How to Use

### Viewing Schedules

1. Navigate to the Schedule section
2. Use the filters to find specific dates or events
3. Click on song titles to view details
4. Use the share button to copy a direct link to a specific schedule

### Using the Song Library

1. Click on any song title in the schedules
2. View song details, lyrics, and embedded YouTube videos
3. Use the copy button to copy lyrics to your clipboard
4. Use the YouTube link to open the song in YouTube

### Mobile Navigation

1. Use the fixed mobile toggle button at the bottom right
2. Navigate between sections using the slide-in menu
3. Tap on cards to expand for more details
4. Use share buttons to share schedule links

## Installation and Setup

1. Clone the repository
2. No build process required - can be served directly from any web server
3. Optionally update `songData.js` to include your choir's specific songs
4. Update schedule data as needed

## Data Structure

### Schedule Data

Each schedule entry contains:

- Date
- Minister
- Songs (categorized by type: opening, worship, etc.)
- Colors (for choir attire)
- Notes

### Song Data

Each song entry includes:

- Unique ID
- Title
- Category tags
- URL (YouTube link)
- Author information
- Musical key
- Full lyrics

## Song Database

The application includes a growing database of choir songs including:

- **Hymns**: "Count Your Blessings", "How Great Thou Art", "Jesus Keep Me Near The Cross"
- **Contemporary Worship**: "Great Are You Lord", "You Deserve All The Glory", "Hosanna In The Highest"
- **Praise & Thanksgiving**: "Sing For Joy To God Our Strength", "I will Enter His Gate With Thanksgiving"

## Future Enhancements

- User authentication system
- Editable schedules for administrators
- Print functionality for schedules
- Offline support with service workers
- Song rating and feedback system

## Contributing

Contributions to EazyChoir are welcome! Please feel free to submit pull requests or open issues for bugs and feature requests.

## License

MIT License
