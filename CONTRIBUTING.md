# Contributing to FlexConvert

Thank you for your interest in contributing to FlexConvert! This document provides guidelines and information for contributors.

## 🚀 Getting Started

### Prerequisites

- Node.js 18 or higher
- npm or yarn
- Git
- Basic knowledge of TypeScript, React, and Encore.ts

### Development Setup

1. **Fork and Clone**
   ```bash
   git clone https://github.com/yourusername/flexconvert.git
   cd flexconvert
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Run Tests** (if available)
   ```bash
   npm test
   ```

## 🏗️ Project Structure

```
flexconvert/
├── backend/                 # Encore.ts backend
│   ├── sharing/            # File sharing service
│   └── ...
├── frontend/               # React frontend
│   ├── components/         # UI components
│   │   ├── pdf/           # PDF-related components
│   │   ├── image/         # Image-related components
│   │   ├── convert/       # Conversion components
│   │   ├── tools/         # Advanced tools
│   │   ├── shared/        # Shared/common components
│   │   └── sharing/       # File sharing components
│   ├── utils/             # Processing utilities
│   ├── hooks/             # React hooks
│   ├── context/           # React contexts
│   └── theme/             # Theme configuration
├── docs/                   # Documentation
└── public/                # Static assets
```

## 🎯 How to Contribute

### Types of Contributions

1. **Bug Fixes** - Fix existing issues
2. **New Features** - Add new processing tools or UI improvements
3. **Documentation** - Improve docs, comments, or examples
4. **Performance** - Optimize processing algorithms or UI performance
5. **Testing** - Add tests for existing functionality
6. **UI/UX** - Improve user interface and experience

### Before You Start

1. **Check existing issues** to avoid duplicating work
2. **Create an issue** for new features to discuss the approach
3. **Fork the repository** and create a feature branch
4. **Follow the coding standards** outlined below

## 📝 Coding Standards

### TypeScript

- Use TypeScript for all new code
- Define proper interfaces and types
- Avoid `any` types when possible
- Use meaningful variable and function names

### React Components

- Use functional components with hooks
- Extract reusable logic into custom hooks
- Keep components small and focused
- Use proper TypeScript prop interfaces

```typescript
interface MyComponentProps {
  title: string;
  onSave: (data: string) => void;
  isLoading?: boolean;
}

export default function MyComponent({ title, onSave, isLoading = false }: MyComponentProps) {
  // Component implementation
}
```

### File Processing

- All processing should happen client-side
- Use Web APIs and WebAssembly when possible
- Provide progress feedback for long operations
- Handle errors gracefully with user-friendly messages

### Styling

- Use Tailwind CSS for styling
- Follow existing design patterns
- Ensure responsive design for all screen sizes
- Test in multiple browsers

### Error Handling

- Use try-catch blocks for async operations
- Provide meaningful error messages to users
- Log errors to console in development
- Use the toast system for user notifications

## 🔧 Adding New Tools

### PDF Tools

1. Create processing function in `frontend/utils/pdfProcessor.ts`
2. Add UI component in `frontend/components/pdf/`
3. Register in `PDFTools.tsx`
4. Add to type definitions

### Image Tools

1. Create processing function in `frontend/utils/imageProcessor.ts`
2. Add UI component in `frontend/components/image/`
3. Register in `ImageTools.tsx`
4. Support common image formats

### Conversion Tools

1. Create converter in `frontend/utils/fileConverters.ts`
2. Add UI in `frontend/components/convert/`
3. Register in `ConvertTools.tsx`
4. Handle multiple file types

### Advanced Tools

1. Create tool component in `frontend/components/tools/`
2. Add to `ToolsView.tsx`
3. Follow existing patterns for consistency

## 🧪 Testing

### Manual Testing

- Test with various file sizes and formats
- Verify responsive design on different screen sizes
- Test keyboard navigation and accessibility
- Check error handling with invalid files

### Browser Testing

Test in supported browsers:
- Chrome 90+
- Firefox 88+
- Safari 14+
- Edge 90+

### Performance Testing

- Test with large files (within reasonable limits)
- Monitor memory usage during processing
- Ensure smooth animations and interactions

## 📋 Pull Request Process

### Before Submitting

1. **Test thoroughly** in multiple browsers
2. **Update documentation** if needed
3. **Follow commit message format** (see below)
4. **Ensure no console errors** in production build

### Commit Message Format

```
type(scope): description

[optional body]

[optional footer]
```

Types:
- `feat`: New feature
- `fix`: Bug fix
- `docs`: Documentation changes
- `style`: Code style changes
- `refactor`: Code refactoring
- `test`: Adding tests
- `chore`: Maintenance tasks

Examples:
- `feat(pdf): add page extraction tool`
- `fix(image): resolve crop area validation`
- `docs: update installation instructions`

### Pull Request Template

```markdown
## Description
Brief description of changes

## Type of Change
- [ ] Bug fix
- [ ] New feature
- [ ] Documentation update
- [ ] Performance improvement

## Testing
- [ ] Tested in Chrome
- [ ] Tested in Firefox
- [ ] Tested with large files
- [ ] Tested responsive design

## Screenshots (if applicable)
Add screenshots for UI changes
```

## 🐛 Reporting Issues

### Bug Reports

Include:
- **Browser and version**
- **Operating system**
- **Steps to reproduce**
- **Expected vs actual behavior**
- **File types/sizes that cause issues**
- **Console errors** (if any)

### Feature Requests

Include:
- **Problem description**
- **Proposed solution**
- **Use cases**
- **Alternative solutions considered**

## 📖 Documentation

### Code Documentation

- Add JSDoc comments for complex functions
- Include usage examples for utility functions
- Document component props and interfaces
- Explain complex algorithms or processing steps

### User Documentation

- Update README for new features
- Add usage examples
- Include screenshots for UI changes
- Update troubleshooting section

## 🎨 Design Guidelines

### UI Components

- Follow existing design patterns
- Use shadcn/ui components when possible
- Maintain consistent spacing and typography
- Ensure accessibility (ARIA labels, keyboard navigation)

### User Experience

- Provide clear feedback for all actions
- Show progress for long operations
- Use loading states appropriately
- Handle edge cases gracefully

### Responsive Design

- Test on mobile, tablet, and desktop
- Use responsive Tailwind classes
- Ensure touch-friendly interface on mobile
- Maintain usability at all screen sizes

## 🔒 Security Considerations

### Client-Side Processing

- Never send files to external servers
- Validate file types and sizes
- Handle malicious files gracefully
- Use secure processing libraries

### Data Privacy

- No telemetry or tracking
- No personal data collection
- Local storage for preferences only
- Optional sharing features clearly marked

## 📞 Getting Help

### Community

- **GitHub Discussions**: Ask questions and share ideas
- **Issues**: Report bugs and request features
- **Discord/Slack**: Real-time chat (if available)

### Maintainers

- Review PRs within 48-72 hours
- Provide constructive feedback
- Help with technical questions
- Guide new contributors

## 🏆 Recognition

Contributors will be:
- Listed in the README
- Credited in release notes
- Invited to contributor events
- Given maintainer status for significant contributions

## 📋 Code of Conduct

### Our Standards

- Be respectful and inclusive
- Welcome newcomers
- Give constructive feedback
- Focus on the best interest of the project
- Show empathy towards other contributors

### Enforcement

- Report issues to maintainers
- All reports will be investigated
- Consequences may include temporary or permanent bans
- Appeals process available

## 🎉 Thank You!

Your contributions make FlexConvert better for everyone. Whether it's code, documentation, bug reports, or feature suggestions, every contribution is valued and appreciated.

Happy coding! 🚀
