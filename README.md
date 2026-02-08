# 🤖 CORE // Robotics Learning Tracker

A sleek, cyberpunk-themed task management system designed specifically for tracking robotics learning objectives across different phases of development.

**Live Demo:** https://krishnavamsi333.github.io/robotics-tracker/

## ✨ Features

### Core Functionality
- **Phase-Based Organization**: Tasks organized into 4 learning phases
  - Phase I: Foundations (Python, C++, Linux, Git)
  - Phase II: ROS 2 Core (Topics, Services, URDF, Gazebo)
  - Phase III: Hardware (Embedded Systems, Protocols)
  - Phase IV: Advanced (Navigation, Computer Vision, SLAM)

### New Enhancements
- **Priority Levels**: Mark tasks as High, Normal, or Low priority
- **Search & Filter**: Quickly find tasks across all phases
- **Undo Functionality**: Revert recent changes (Ctrl/Cmd + Z)
- **Import/Export**: Backup and restore your progress as JSON
- **Theme Toggle**: Switch between dark and light modes
- **Progress Tracking**: Visual progress bar with animated effects
- **Responsive Design**: Works seamlessly on desktop, tablet, and mobile
- **Keyboard Shortcuts**: Press Enter to quickly add tasks
- **Toast Notifications**: Visual feedback for all actions
- **Smart Sorting**: Tasks auto-sort by priority and completion status
- **Local Storage**: All data persists in your browser

## 🚀 Getting Started

### Option 1: GitHub Pages (Recommended)
Simply visit the live demo link above - no installation needed!

### Option 2: Local Development
1. Clone the repository:
   ```bash
   git clone https://github.com/krishnavamsi333/robotics-tracker.git
   cd robotics-tracker
   ```

2. Open `index.html` in your browser, or use a local server:
   ```bash
   # Python 3
   python -m http.server 8000
   
   # Node.js
   npx serve
   ```

3. Navigate to `http://localhost:8000`

## 📖 Usage Guide

### Adding Tasks
1. Enter task description in the input field
2. Select the appropriate phase
3. Choose priority level (High/Normal/Low)
4. Click "EXECUTE" or press Enter

### Managing Tasks
- **Complete**: Click anywhere on the task to toggle completion
- **Delete**: Click the ✕ icon (requires confirmation)
- **Search**: Use the search bar to filter tasks
- **Undo**: Click the undo button or press Ctrl/Cmd + Z

### Data Management
- **Export**: Click the download icon to save your data as JSON
- **Import**: Click the upload icon to restore from a JSON file
- **Reset**: Use "WIPE SYSTEM DATA" to restore default tasks

### Customization
- **Theme**: Toggle between dark and light modes with the theme button
- **Responsive**: The layout adapts automatically to your screen size

## 🎨 Design Features

- **Cyberpunk Aesthetic**: VS Code-inspired color scheme
- **Smooth Animations**: Subtle transitions and effects
- **Visual Hierarchy**: Color-coded priorities and clear phase separation
- **Accessibility**: Reduced motion support for users who prefer it
- **Professional Typography**: Roboto Mono font for a technical look

## 🛠️ Technical Stack

- **HTML5**: Semantic markup
- **CSS3**: Modern layouts with Grid and Flexbox
- **Vanilla JavaScript**: No dependencies, pure ES6+
- **LocalStorage API**: Client-side data persistence
- **Font Awesome**: Icon library
- **Google Fonts**: Roboto Mono typeface

## 📱 Browser Compatibility

- Chrome/Edge (v90+)
- Firefox (v88+)
- Safari (v14+)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🔒 Privacy

All data is stored locally in your browser using LocalStorage. No data is sent to any server. Your learning progress stays completely private.

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the MIT License.

## 🎯 Roadmap Ideas

Future enhancements could include:
- Task notes/descriptions
- Due dates and reminders
- Time tracking per task
- Learning resources links
- Achievement badges
- Statistics and analytics
- Cloud sync option
- Collaborative features
- Mobile app version

## 💡 Inspiration

Designed for robotics enthusiasts and students who want a structured approach to learning robotics fundamentals through advanced concepts.

---

**Built with ⚡ for robotics learners by robotics learners**

Star ⭐ this repo if you find it useful!