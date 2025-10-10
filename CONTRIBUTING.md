# Contributing to CraftLab Career Development Platform

Thank you for your interest in contributing to CraftLab! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites
- Node.js 18 or higher
- npm or yarn package manager
- Git for version control
- Code editor (VS Code recommended)

### Development Setup
1. **Fork the repository**
   ```bash
   git clone https://github.com/your-username/craftlab-frontend.git
   cd craftlab-frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment**
   ```bash
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start development server**
   ```bash
   npm run dev
   ```

## 📋 Development Guidelines

### Code Style
- **TypeScript**: Use strict typing, avoid `any`
- **Components**: Functional components with hooks
- **Naming**: PascalCase for components, camelCase for functions
- **Files**: Use descriptive names with proper extensions (.tsx, .ts)

### Component Structure
```typescript
import React from 'react';
import { SomeIcon } from 'lucide-react';

interface ComponentProps {
  title: string;
  optional?: boolean;
}

const Component: React.FC<ComponentProps> = ({ title, optional = false }) => {
  return (
    <div className="component-container">
      <h1>{title}</h1>
      {optional && <p>Optional content</p>}
    </div>
  );
};

export default Component;
```

### Styling Guidelines
- **Tailwind CSS**: Use utility classes
- **Custom Classes**: Only when necessary, define in index.css
- **Responsive**: Mobile-first approach
- **Animations**: Use provided animation classes

```css
/* Good */
<div className="flex items-center justify-between p-4 bg-white rounded-lg shadow-md hover:shadow-lg transition-all">

/* Avoid */
<div style={{display: 'flex', padding: '16px'}}>
```

### State Management
- **Local State**: useState for component-specific state
- **Global State**: Context API for shared state
- **Server State**: Custom hooks for API data

```typescript
// Custom hook example
export const useProfile = () => {
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  
  const fetchProfile = async () => {
    setLoading(true);
    try {
      const data = await profileAPI.getProfile();
      setProfile(data);
    } catch (error) {
      console.error('Failed to fetch profile:', error);
    } finally {
      setLoading(false);
    }
  };
  
  return { profile, loading, fetchProfile };
};
```

## 🔧 Project Structure

### Directory Organization
```
src/
├── components/          # Reusable UI components
│   ├── common/         # Generic components (Button, Modal, etc.)
│   ├── forms/          # Form-specific components
│   └── layout/         # Layout components (Header, Footer)
├── contexts/           # React contexts
├── hooks/              # Custom hooks
├── pages/              # Page components
├── services/           # API services
├── types/              # TypeScript type definitions
├── utils/              # Utility functions
└── styles/             # Global styles
```

### File Naming Conventions
- **Components**: PascalCase (e.g., `UserProfile.tsx`)
- **Hooks**: camelCase with 'use' prefix (e.g., `useAuth.ts`)
- **Utils**: camelCase (e.g., `formatDate.ts`)
- **Types**: PascalCase (e.g., `User.types.ts`)

## 🧪 Testing

### Testing Strategy
- **Unit Tests**: Individual components and functions
- **Integration Tests**: Component interactions
- **E2E Tests**: Full user workflows

### Writing Tests
```typescript
import { render, screen, fireEvent } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import Button from './Button';

describe('Button Component', () => {
  it('renders with correct text', () => {
    render(<Button>Click me</Button>);
    expect(screen.getByText('Click me')).toBeInTheDocument();
  });

  it('calls onClick when clicked', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);
    
    fireEvent.click(screen.getByText('Click me'));
    expect(handleClick).toHaveBeenCalledTimes(1);
  });
});
```

### Running Tests
```bash
npm run test          # Run all tests
npm run test:watch    # Run tests in watch mode
npm run test:coverage # Run tests with coverage
```

## 🔄 Git Workflow

### Branch Naming
- **Feature**: `feature/user-authentication`
- **Bug Fix**: `fix/login-error-handling`
- **Documentation**: `docs/api-documentation`
- **Refactor**: `refactor/dashboard-components`

### Commit Messages
Follow the conventional commits specification:

```
type(scope): description

feat(auth): add user registration functionality
fix(dashboard): resolve profile loading issue
docs(readme): update installation instructions
style(components): improve button hover effects
refactor(hooks): simplify useAuth implementation
test(auth): add login component tests
```

### Pull Request Process
1. **Create Feature Branch**
   ```bash
   git checkout -b feature/your-feature-name
   ```

2. **Make Changes**
   - Write code following guidelines
   - Add tests for new functionality
   - Update documentation if needed

3. **Commit Changes**
   ```bash
   git add .
   git commit -m "feat(scope): description"
   ```

4. **Push and Create PR**
   ```bash
   git push origin feature/your-feature-name
   ```

5. **PR Requirements**
   - Clear description of changes
   - Link to related issues
   - Screenshots for UI changes
   - Tests passing
   - Code review approval

## 🐛 Bug Reports

### Before Reporting
- Check existing issues
- Reproduce the bug
- Test in different browsers
- Check console for errors

### Bug Report Template
```markdown
## Bug Description
Brief description of the issue

## Steps to Reproduce
1. Go to '...'
2. Click on '...'
3. Scroll down to '...'
4. See error

## Expected Behavior
What should happen

## Actual Behavior
What actually happens

## Environment
- OS: [e.g. macOS, Windows, Linux]
- Browser: [e.g. Chrome, Firefox, Safari]
- Version: [e.g. 22]
- Device: [e.g. Desktop, Mobile]

## Screenshots
If applicable, add screenshots

## Additional Context
Any other context about the problem
```

## 💡 Feature Requests

### Feature Request Template
```markdown
## Feature Description
Clear description of the feature

## Problem Statement
What problem does this solve?

## Proposed Solution
How should this feature work?

## Alternatives Considered
Other solutions you've considered

## Additional Context
Screenshots, mockups, or examples
```

## 📚 Documentation

### Code Documentation
- **JSDoc**: Document complex functions
- **README**: Keep project README updated
- **Comments**: Explain complex logic, not obvious code

```typescript
/**
 * Calculates the match score between a user profile and opportunity
 * @param profile - User profile data
 * @param opportunity - Job opportunity data
 * @returns Match score between 0-100
 */
const calculateMatchScore = (profile: UserProfile, opportunity: Opportunity): number => {
  // Complex matching algorithm implementation
  return score;
};
```

### API Documentation
- Document all endpoints
- Include request/response examples
- Specify error codes and messages

## 🔒 Security

### Security Guidelines
- **Authentication**: Never store passwords in plain text
- **API Keys**: Use environment variables
- **Input Validation**: Validate all user inputs
- **XSS Prevention**: Sanitize user content

### Reporting Security Issues
- **Email**: security@craftlab.com
- **Private**: Don't create public issues for security vulnerabilities
- **Details**: Provide clear reproduction steps

## 🎯 Performance

### Performance Guidelines
- **Bundle Size**: Keep bundle size minimal
- **Lazy Loading**: Use React.lazy for route components
- **Images**: Optimize images and use appropriate formats
- **Caching**: Implement proper caching strategies

### Performance Monitoring
```typescript
// Use React.memo for expensive components
const ExpensiveComponent = React.memo(({ data }) => {
  return <div>{/* Complex rendering */}</div>;
});

// Use useMemo for expensive calculations
const expensiveValue = useMemo(() => {
  return calculateExpensiveValue(data);
}, [data]);
```

## 🌐 Accessibility

### Accessibility Requirements
- **Semantic HTML**: Use proper HTML elements
- **ARIA Labels**: Add ARIA attributes where needed
- **Keyboard Navigation**: Ensure keyboard accessibility
- **Color Contrast**: Meet WCAG guidelines

```typescript
// Good accessibility example
<button
  aria-label="Close dialog"
  onClick={handleClose}
  className="focus:ring-2 focus:ring-blue-500"
>
  <X className="h-4 w-4" />
</button>
```

## 📱 Responsive Design

### Breakpoint Guidelines
- **Mobile First**: Design for mobile, enhance for desktop
- **Breakpoints**: Use Tailwind's responsive prefixes
- **Touch Targets**: Minimum 44px for touch elements

```css
/* Mobile first approach */
<div className="p-4 md:p-6 lg:p-8">
  <h1 className="text-xl md:text-2xl lg:text-3xl">
    Responsive Title
  </h1>
</div>
```

## 🚀 Deployment

### Pre-deployment Checklist
- [ ] All tests passing
- [ ] No console errors
- [ ] Performance optimized
- [ ] Accessibility tested
- [ ] Cross-browser tested
- [ ] Mobile responsive
- [ ] Environment variables configured

### Deployment Process
1. **Build Application**
   ```bash
   npm run build
   ```

2. **Test Build**
   ```bash
   npm run preview
   ```

3. **Deploy to Staging**
4. **Test on Staging**
5. **Deploy to Production**

## 📞 Getting Help

### Resources
- **Documentation**: Project README and wiki
- **Issues**: GitHub issues for bugs and features
- **Discussions**: GitHub discussions for questions
- **Code Review**: Request reviews from maintainers

### Communication
- **Be Respectful**: Follow code of conduct
- **Be Clear**: Provide context and details
- **Be Patient**: Maintainers are volunteers

## 🏆 Recognition

### Contributors
We recognize contributors through:
- **GitHub Contributors**: Automatic recognition
- **Release Notes**: Major contributors mentioned
- **Hall of Fame**: Top contributors featured

### Contribution Types
- **Code**: Bug fixes, features, refactoring
- **Documentation**: README, guides, comments
- **Testing**: Writing tests, reporting bugs
- **Design**: UI/UX improvements, mockups
- **Community**: Helping others, discussions

---

Thank you for contributing to CraftLab! Your efforts help make career development more accessible and effective for everyone.