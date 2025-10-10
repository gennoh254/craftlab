# CraftLab Career Development Platform

A modern, AI-powered career development platform that connects talented individuals with meaningful opportunities through intelligent matching, automated portfolios, and verified credentials.

## 🚀 Features

### Core Features
- **AI-Powered Matching** - Intelligent algorithms connect talent with opportunities
- **Professional Portfolio Builder** - Automated CV generation and portfolio creation
- **Credential Verification** - Secure verification system for certificates and achievements
- **Smart Career Guidance** - Personalized insights and recommendations
- **Real-time Dashboard** - Comprehensive user dashboard with analytics
- **Opportunity Management** - Browse and apply to internships, attachments, and volunteer positions

### User Types
- **Students/Attachees** - Industrial attachment seekers
- **Interns** - Internship opportunity seekers
- **Apprentices** - Apprenticeship program participants
- **Volunteers** - Community service participants
- **Organizations** - Companies and institutions offering opportunities

## 🛠 Tech Stack

### Frontend
- **React 18** with TypeScript
- **Vite** for build tooling
- **Tailwind CSS** for styling
- **React Router** for navigation
- **Lucide React** for icons
- **Custom Hooks** for state management

### Backend Integration
- **RESTful API** integration
- **JWT Authentication** 
- **MongoDB** database support
- **File Upload** capabilities
- **AI Services** integration

### Development Tools
- **ESLint** for code linting
- **TypeScript** for type safety
- **PostCSS** with Autoprefixer
- **Hot Module Replacement** for development

## 📦 Installation

### Prerequisites
- Node.js 18+ 
- npm or yarn
- MongoDB (for backend)

### Frontend Setup
```bash
# Clone the repository
git clone <repository-url>
cd craftlab-frontend

# Install dependencies
npm install

# Create environment file
cp .env.example .env

# Start development server
npm run dev
```

### Environment Variables
Create a `.env` file in the root directory:
```env
VITE_API_URL=http://localhost:5000/api
```

### Backend Setup (Optional)
The frontend works with or without a backend connection:
- **With Backend**: Full database integration and real-time data
- **Without Backend**: Uses local storage with mock data for demonstration

## 🏗 Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── Header.tsx      # Navigation header
│   ├── Footer.tsx      # Site footer
│   └── ProtectedRoute.tsx # Route protection
├── contexts/           # React contexts
│   └── AuthContext.tsx # Authentication state management
├── hooks/              # Custom React hooks
│   ├── useAuth.ts      # Authentication hook
│   ├── useProfile.ts   # Profile management
│   ├── useCertificates.ts # Certificate management
│   ├── useOpportunities.ts # Opportunity management
│   └── useAI.ts        # AI services integration
├── pages/              # Page components
│   ├── Home.tsx        # Landing page
│   ├── About.tsx       # About page
│   ├── Contact.tsx     # Contact page
│   ├── Login.tsx       # Login page
│   ├── Register.tsx    # Registration page
│   ├── Dashboard.tsx   # User dashboard
│   └── DemoDashboard.tsx # Demo dashboard
├── services/           # API services
│   └── api.ts          # API client and endpoints
├── utils/              # Utility functions
│   └── aiMatcher.ts    # AI matching algorithms
├── App.tsx             # Main app component
├── main.tsx           # App entry point
└── index.css          # Global styles
```

## 🔐 Authentication System

### Features
- **Hybrid Authentication** - Works online and offline
- **JWT Token Management** - Secure token-based authentication
- **Local Storage Fallback** - Offline capability with local storage
- **Auto-sync** - Syncs with backend when available

### User Registration
```typescript
const { register } = useAuth();
const success = await register(name, email, password, userType);
```

### User Login
```typescript
const { login } = useAuth();
const success = await login(email, password);
```

### Protected Routes
```typescript
<ProtectedRoute>
  <Dashboard />
</ProtectedRoute>
```

## 📊 Dashboard Features

### Overview Tab
- **Statistics Cards** - Profile completion, opportunities, certificates
- **Recent Opportunities** - AI-matched opportunities with scores
- **Quick Actions** - Download CV, view portfolio, upload certificates

### Profile Tab
- **Personal Information** - Name, email, bio, user type
- **Skills Management** - Add/remove skills by category
- **Real-time Updates** - Instant profile updates

### Certificates Tab
- **Upload Certificates** - PDF, JPG, PNG support
- **Verification Status** - Verified, pending, rejected states
- **Institution Integration** - University partnership verification

### AI Insights Tab
- **Profile Analysis** - Completion score and recommendations
- **Strengths Assessment** - AI-identified user strengths
- **Skill Gap Analysis** - Areas for improvement
- **Career Path Guidance** - Step-by-step career recommendations

### Settings Tab
- **Account Preferences** - Notification settings
- **Privacy Controls** - Profile visibility options
- **Security Settings** - Password and 2FA management

## 🤖 AI Integration

### Profile Analysis
```typescript
const { analysis, analyzeProfile } = useAI();
await analyzeProfile(userId);
```

### Opportunity Matching
```typescript
const { generateMatches } = useAI();
const matches = await generateMatches(userId);
```

### Career Insights
```typescript
const { insights, getInsights } = useAI();
await getInsights(userId);
```

## 🎨 Styling System

### Tailwind CSS Classes
- **Glass Morphism** - `glass` utility class
- **Hover Effects** - `hover-lift` animations
- **Gradient Text** - `gradient-text` styling
- **Custom Animations** - Fade in, float, pulse effects

### Animation Classes
```css
.animate-fadeInUp     /* Fade in from bottom */
.animate-fadeInLeft   /* Fade in from left */
.animate-fadeInRight  /* Fade in from right */
.animate-float        /* Floating animation */
.animate-pulse-slow   /* Slow pulse effect */
.hover-lift          /* Hover lift effect */
```

## 📱 Responsive Design

### Breakpoints
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

### Grid System
```css
grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4
```

## 🔌 API Integration

### Endpoints
```typescript
// Authentication
POST /api/auth/register
POST /api/auth/login
GET  /api/auth/me

// Profile Management
GET  /api/profiles/:id
PUT  /api/profiles/:id
POST /api/profiles/:id/picture

// Certificates
GET  /api/certificates
POST /api/certificates/upload
POST /api/certificates/:id/verify

// Opportunities
GET  /api/opportunities
GET  /api/opportunities/matches/:userId
POST /api/opportunities/:id/apply

// AI Services
POST /api/ai/analyze-profile/:userId
POST /api/ai/generate-matches/:userId
GET  /api/ai/insights/:userId
```

### Error Handling
```typescript
try {
  const response = await apiClient.post('/endpoint', data);
  if (response.success) {
    // Handle success
  }
} catch (error) {
  // Fallback to local data
  console.log('API unavailable, using fallback');
}
```

## 🧪 Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run preview  # Preview production build
npm run lint     # Run ESLint
```

### Development Server
- **Port**: 5173 (default)
- **Hot Reload**: Enabled
- **TypeScript**: Full support
- **Source Maps**: Enabled in development

### Code Quality
- **ESLint**: Configured with React and TypeScript rules
- **TypeScript**: Strict mode enabled
- **Prettier**: Code formatting (recommended)

## 🚀 Deployment

### Build Process
```bash
npm run build
```

### Environment Setup
```env
# Production
VITE_API_URL=https://your-api-domain.com/api

# Development
VITE_API_URL=http://localhost:5000/api
```

### Static Hosting
The built application can be deployed to:
- **Vercel** - Recommended for React apps
- **Netlify** - Easy deployment with form handling
- **AWS S3** - With CloudFront for CDN
- **GitHub Pages** - For open source projects

## 🔧 Configuration

### Vite Configuration
```typescript
// vite.config.ts
export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
});
```

### Tailwind Configuration
```javascript
// tailwind.config.js
module.exports = {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      // Custom theme extensions
    },
  },
  plugins: [],
};
```

## 🤝 Contributing

### Development Workflow
1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

### Code Standards
- **TypeScript**: Use strict typing
- **Components**: Functional components with hooks
- **Styling**: Tailwind CSS classes
- **Naming**: PascalCase for components, camelCase for functions

### Commit Messages
```
feat: add new dashboard feature
fix: resolve authentication issue
docs: update API documentation
style: improve responsive design
```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "userType": "attachee"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

### Response Format
```json
{
  "success": true,
  "message": "Operation successful",
  "data": {
    "user": {
      "id": "user_id",
      "name": "John Doe",
      "email": "john@example.com",
      "userType": "attachee"
    },
    "token": "jwt_token_here"
  }
}
```

## 🐛 Troubleshooting

### Common Issues

#### "Failed to fetch" Error
- **Cause**: Backend server not running
- **Solution**: The app works offline with local storage
- **Fix**: Start your backend server on port 5000

#### Export/Import Errors
- **Cause**: Missing default exports
- **Solution**: Ensure all components have `export default`
- **Check**: File extensions (.tsx, .ts)

#### Styling Issues
- **Cause**: Tailwind CSS not loading
- **Solution**: Check `index.css` imports
- **Verify**: PostCSS configuration

#### Authentication Problems
- **Cause**: Token expiration or invalid
- **Solution**: Clear localStorage and re-login
- **Command**: `localStorage.clear()`

### Debug Mode
```typescript
// Enable debug logging
localStorage.setItem('debug', 'true');
```

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🙏 Acknowledgments

- **React Team** - For the amazing framework
- **Tailwind CSS** - For the utility-first CSS framework
- **Lucide** - For the beautiful icon library
- **Vite** - For the fast build tool
- **TypeScript** - For type safety

## 📞 Support

For support and questions:
- **Email**: hello@craftlab.com
- **Documentation**: [Project Wiki]
- **Issues**: [GitHub Issues]
- **Discussions**: [GitHub Discussions]

---

**CraftLab** - Empowering the next generation through AI-driven career development."# craftlab-app" 
"# craftlab" 
