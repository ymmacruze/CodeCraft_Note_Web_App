# CodeCraft Note Web App

<div align="center">
  <img src="https://img.shields.io/badge/React-19.2.0-61DAFB?style=for-the-badge&logo=react&logoColor=white" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.9-3178C6?style=for-the-badge&logo=typescript&logoColor=white" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Vite-7.2.5-646CFF?style=for-the-badge&logo=vite&logoColor=white" alt="Vite" />
  <img src="https://img.shields.io/badge/TailwindCSS-4.1-06B6D4?style=for-the-badge&logo=tailwindcss&logoColor=white" alt="TailwindCSS" />
</div>

<br />

A modern, feature-rich note-taking web application built with React, TypeScript, and Vite. CodeCraft Note provides a beautiful and intuitive interface for creating, organizing, and managing your notes with powerful markdown editing capabilities.

## ✨ Features

### 📝 Note Management
- **Create & Edit Notes** - Rich markdown editor with live preview
- **Multiple View Modes** - Switch between edit, preview, and split-screen modes
- **Auto-Save** - Notes are automatically saved as you type
- **Pin Notes** - Keep important notes at the top of your list
- **Favorite Notes** - Mark notes as favorites for quick access
- **Archive Notes** - Archive notes you want to keep but don't need actively

### 🎨 Rich Markdown Editor
- **Syntax Highlighting** - CodeMirror-powered editor with syntax highlighting
- **Live Preview** - Real-time markdown rendering with `react-markdown`
- **GitHub Flavored Markdown** - Support for tables, task lists, and more via `remark-gfm`
- **Code Highlighting** - Syntax highlighting for code blocks via `rehype-highlight`
- **Editor Toolbar** - Quick formatting buttons for common markdown syntax

### 🏷️ Organization
- **Tags** - Organize notes with custom tags
- **Folders** - Group related notes into folders
- **Search** - Powerful search functionality across all notes
- **Sort Options** - Sort by title, creation date, or last modified date

### 💾 Data & Storage
- **Local Storage** - All data stored locally using IndexedDB (Dexie)
- **No Backend Required** - Works entirely in the browser
- **Import/Export** - Backup and restore your notes (JSON, Markdown)
- **Backup Settings** - Configure automatic backup preferences

### 🎭 User Interface
- **Dark/Light Theme** - Toggle between themes or use system preference
- **Responsive Design** - Works on desktop, tablet, and mobile
- **Smooth Animations** - Beautiful transitions powered by Framer Motion
- **Modern UI Components** - Built with Radix UI primitives

### ⌨️ Keyboard Shortcuts
- Quick navigation and actions via keyboard shortcuts
- Customizable shortcut preferences

---

## 🚀 Getting Started

### Prerequisites

Before you begin, ensure you have the following installed:

- **Node.js** (v18.0.0 or higher) - [Download here](https://nodejs.org/)
- **npm** (v9.0.0 or higher) or **yarn** or **pnpm**
- **Git** - [Download here](https://git-scm.com/)

### Clone the Repository

```bash
# Clone the repository
git clone https://github.com/ymmacruze/CodeCraft_Note_Web_App.git

# Navigate to the project directory
cd CodeCraft_Note_Web_App
```

### Install Dependencies

```bash
# Navigate to the frontend directory
cd Web_App/frontend

# Install dependencies using npm
npm install

# Or using yarn
yarn install

# Or using pnpm
pnpm install
```

### Run the Development Server

```bash
# Start the development server
npm run dev

# Or using yarn
yarn dev

# Or using pnpm
pnpm dev
```

The application will start and be available at **http://localhost:5173** (or another port if 5173 is in use).

---

## 📜 Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start the development server with hot module replacement |
| `npm run build` | Build the application for production |
| `npm run preview` | Preview the production build locally |
| `npm run lint` | Run ESLint to check for code issues |

---

## 🏗️ Project Structure

```
CodeCraft_Note_Web_App/
├── Web_App/
│   ├── backend/                 # Backend (currently empty - frontend-only app)
│   └── frontend/
│       ├── public/              # Static assets
│       ├── src/
│       │   ├── assets/          # Images, fonts, etc.
│       │   ├── components/      # React components
│       │   │   ├── editor/      # Markdown editor components
│       │   │   ├── layout/      # Layout components (Header, Sidebar)
│       │   │   ├── modals/      # Modal dialogs
│       │   │   ├── notes/       # Notes list components
│       │   │   └── ui/          # Reusable UI components
│       │   ├── hooks/           # Custom React hooks
│       │   ├── lib/             # Utility functions
│       │   ├── pages/           # Page components
│       │   ├── router/          # React Router configuration
│       │   ├── services/        # Data services (database, export, import)
│       │   ├── stores/          # Zustand state stores
│       │   └── types/           # TypeScript type definitions
│       ├── index.html           # HTML entry point
│       ├── package.json         # Dependencies and scripts
│       ├── tailwind.config.js   # Tailwind CSS configuration
│       ├── tsconfig.json        # TypeScript configuration
│       └── vite.config.ts       # Vite configuration
└── README.md                    # This file
```

---

## 📄 Pages Overview

| Route | Page | Description |
|-------|------|-------------|
| `/` | Dashboard | Main view displaying all active notes |
| `/note/:id` | Editor | Markdown editor for creating/editing notes |
| `/favorites` | Favorites | View all favorited notes |
| `/archive` | Archive | View all archived notes |
| `/settings` | Settings | Configure app settings, backup, and data management |

---

## 🛠️ Tech Stack

### Core
- **[React 19](https://react.dev/)** - UI library with latest features
- **[TypeScript](https://www.typescriptlang.org/)** - Type-safe JavaScript
- **[Vite](https://vitejs.dev/)** - Next-generation frontend build tool

### Styling
- **[Tailwind CSS](https://tailwindcss.com/)** - Utility-first CSS framework
- **[Framer Motion](https://www.framer.com/motion/)** - Animation library

### State Management
- **[Zustand](https://zustand-demo.pmnd.rs/)** - Lightweight state management
- **[TanStack Query](https://tanstack.com/query)** - Data fetching and caching

### Editor
- **[CodeMirror 6](https://codemirror.net/)** - Extensible code editor
- **[react-markdown](https://github.com/remarkjs/react-markdown)** - Markdown renderer
- **[remark-gfm](https://github.com/remarkjs/remark-gfm)** - GitHub Flavored Markdown support
- **[rehype-highlight](https://github.com/rehypejs/rehype-highlight)** - Syntax highlighting

### Database
- **[Dexie.js](https://dexie.org/)** - IndexedDB wrapper for local storage

### UI Components
- **[Radix UI](https://www.radix-ui.com/)** - Unstyled, accessible UI primitives
- **[Lucide React](https://lucide.dev/)** - Beautiful icon library
- **[class-variance-authority](https://cva.style/)** - Component variant management

### Utilities
- **[date-fns](https://date-fns.org/)** - Date manipulation library
- **[uuid](https://github.com/uuidjs/uuid)** - Unique ID generation
- **[Zod](https://zod.dev/)** - Schema validation

---

## 🎯 Note Types & Features

### Note Properties
- **Title** - Note title
- **Content** - Markdown content
- **Tags** - Array of tag strings
- **Format** - `markdown`, `plaintext`, `html`, or `json`
- **Favorite** - Boolean flag for favorites
- **Archived** - Boolean flag for archived notes
- **Pinned** - Boolean flag for pinned notes
- **Color** - Optional color for visual organization
- **Word Count** - Automatic word count tracking
- **Folder** - Optional folder assignment
- **Timestamps** - Created and updated dates

---

## 💡 Usage Tips

### Creating a Note
1. Click the "+" button on the dashboard
2. Enter a title and start writing in markdown
3. Notes auto-save every 2 seconds

### Organizing Notes
- **Pin** important notes to keep them at the top
- **Favorite** notes you access frequently
- **Archive** notes you want to keep but hide from the main view
- **Tag** notes for easy categorization and search

### Keyboard Shortcuts
- Use the search modal for quick note navigation
- Customize shortcuts in settings

### Backup & Export
- Go to Settings to backup all your notes
- Export individual notes or bulk export
- Import notes from JSON or markdown files

---

## 🔧 Configuration

### Environment Variables

Create a `.env` file in the `frontend` directory if needed:

```env
# Example environment variables (currently not required)
VITE_APP_TITLE=CodeCraft Notes
```

### Tailwind Configuration

The app uses a custom Tailwind configuration with:
- Custom color schemes for dark/light themes
- CSS variables for dynamic theming
- Custom gradient and shadow utilities

---

## 🚢 Building for Production

```bash
# Navigate to the frontend directory
cd Web_App/frontend

# Build the application
npm run build

# The build output will be in the 'dist' folder
```

### Deploy to Static Hosting

The built application can be deployed to any static hosting service:
- **Vercel** - `vercel deploy`
- **Netlify** - Drag & drop the `dist` folder
- **GitHub Pages** - Configure GitHub Actions
- **AWS S3** - Upload to an S3 bucket with static hosting

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

---

## 🙏 Acknowledgments

- React team for the amazing framework
- Vite team for the blazing-fast build tool
- All the open-source library authors

---

<div align="center">
  <p>Made with ❤️ by CodeCraft</p>
  <p>
    <a href="https://github.com/ymmacruze/CodeCraft_Note_Web_App">⭐ Star this repository</a>
  </p>
</div>
