# Infogram

A modern web application built with React that provides instagram data scraping (for investigation or educational purpose) capabilities with a sleek user interface.

## Features

- Clean and modern UI with dark theme
- Real-time server logging display
- WebSocket integration for live updates
- Secure credential handling
- PDF generation and download functionality
- Progress tracking for scraping operations

## Tech Stack

- React
- Axios for API calls
- WebSocket for real-time communication
- Tailwind CSS for styling

## Getting Started

1. Clone the repository:
```bash
git clone https://github.com/yourusername/Infogram.git
```
2. Install dependencies:
```bash
cd Infogram
npm install
```
3. Start the development server:
```bash
npm run dev
```

## Usage
- Navigate to the application in your browser
- Enter your credentials in the login form
- Click "Scrape" to initiate the scraping process
- Monitor real-time progress through the server log
- Download the generated PDF once scraping is complete

## Project Structure
- src/App.jsx - Main application component
- public/ - Static assets including logo and background
- Server-side code handles the scraping logic and WebSocket communication
- Environment Setup
- Make sure you have the following environment variables set up:
   - Server running on port 5173
   - WebSocket connection enabled
   - Proper CORS configuration

## License
This project is licensed under the MIT License - see the LICENSE file for details

## Acknowledgments
- Built with React + Vite
- Uses Tailwind CSS for styling
- WebSocket implementation for real-time updates
  
Made with ❤️ by Piyush Kumar
