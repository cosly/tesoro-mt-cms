# Test Fixtures

This directory contains test data and files used in automated tests.

## Files

- `test-image.png` - Sample image for media upload tests (create a small PNG file)
- `test-document.pdf` - Sample PDF for document upload tests (optional)

## Creating Test Images

You can create a simple test image using ImageMagick or online tools:

```bash
# Using ImageMagick (if installed)
convert -size 100x100 xc:blue tests/fixtures/test-image.png

# Or download any small PNG file and place it here
```

## Usage in Tests

```typescript
import path from 'path'

const testImagePath = path.join(process.cwd(), 'tests/fixtures/test-image.png')
await fileInput.setInputFiles(testImagePath)
```
