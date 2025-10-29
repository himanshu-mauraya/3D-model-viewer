# 3D Model Viewer Frontend

A modern 3D model viewer built with React, Three.js, and React Three Fiber.

## Features

- Upload and view 3D models (GLB, GLTF, OBJ)
- Interactive 3D view with orbit controls
- Scene management
- Responsive design

## Getting Started

### Prerequisites

- Node.js (v16 or later)
- npm or yarn

### Installation

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install dependencies:
   ```bash
   npm install
   # or
   yarn install
   ```

### Running the App

To start the development server:

```bash
npm run dev
# or
yarn dev
```

Open [http://localhost:5173](http://localhost:5173) to view it in your browser.

### Building for Production

To create a production build:

```bash
npm run build
# or
yarn build
```

## Project Structure

- `/src` - Source files
  - `/components` - Reusable React components
  - `/context` - React context providers
  - `/hooks` - Custom React hooks
  - `/services` - API services and utilities
  - `/pages` - Page components
  - `App.jsx` - Main application component
  - `main.jsx` - Application entry point

## Dependencies

- React 18
- React Three Fiber
- Three.js
- @react-three/drei
- Vite (build tool)

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Create a new Pull Request

## License

This project is licensed under the MIT License.
