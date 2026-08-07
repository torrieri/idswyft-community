# End-User Verification Component

A production-ready, embeddable verification component that developers can easily integrate into their applications.

## Features

- ✅ **Complete verification flow** - Document upload → OCR processing → Live capture → Results
- ✅ **Clean end-user experience** - No developer tools, API keys, or raw JSON displayed
- ✅ **Automatic redirects** - Configurable success/failure redirects
- ✅ **Theme support** - Light and dark themes
- ✅ **Mobile responsive** - Works perfectly on all devices
- ✅ **TypeScript support** - Full type safety
- ✅ **Customizable** - Props for configuration and callbacks
- ✅ **Localized** - English and Spanish, see [Internationalization](#internationalization)

## Basic Usage

```tsx
import EndUserVerification from './components/verification/EndUserVerification';

function MyApp() {
  return (
    <EndUserVerification
      apiKey="your-api-key"
      userId="user-123"
      redirectUrl="https://yourapp.com/dashboard"
      onComplete={(result) => {
        console.log('Verification completed:', result);
      }}
    />
  );
}
```

## Props

| Prop | Type | Required | Description |
|------|------|----------|-------------|
| `apiKey` | string | ✅ | Your Idswyft API key |
| `userId` | string | ✅ | Unique identifier for the user |
| `onComplete` | function | ❌ | Callback when verification completes |
| `onRedirect` | function | ❌ | Custom redirect handler |
| `redirectUrl` | string | ❌ | URL to redirect to after completion |
| `className` | string | ❌ | Additional CSS classes |
| `theme` | 'light' \| 'dark' | ❌ | Theme (default: 'light') |
| `allowedDocumentTypes` | array | ❌ | Allowed document types |

## Advanced Usage

### With Custom Completion Handler

```tsx
<EndUserVerification
  apiKey="your-api-key"
  userId="user-123"
  onComplete={(result) => {
    if (result.status === 'verified') {
      // Update user status in your database
      updateUserVerificationStatus(result.user_id, 'verified');
      
      // Show success message
      showSuccessNotification();
    } else {
      // Handle failed verification
      handleVerificationFailure(result);
    }
  }}
  onRedirect={(url) => {
    // Custom redirect logic
    window.location.href = url;
  }}
/>
```

### With Dark Theme

```tsx
<EndUserVerification
  apiKey="your-api-key"
  userId="user-123"
  theme="dark"
  className="my-custom-class"
/>
```

### With Document Type Restrictions

```tsx
<EndUserVerification
  apiKey="your-api-key"
  userId="user-123"
  allowedDocumentTypes={['passport', 'drivers_license']}
/>
```

## Verification Result

The `onComplete` callback receives a `VerificationResult` object:

```typescript
interface VerificationResult {
  verification_id: string;
  status: 'verified' | 'failed' | 'manual_review';
  user_id: string;
  confidence_score?: number;
  face_match_score?: number;
  liveness_score?: number;
}
```

## Integration Steps

1. **Install Dependencies** (if not already installed):
   ```bash
   npm install react react-router-dom react-hot-toast
   ```

2. **Copy the Component**:
   - Copy `EndUserVerification.tsx` to your project
   - Ensure you have the API configuration file

3. **Use in Your App**:
   ```tsx
   import EndUserVerification from './path/to/EndUserVerification';
   
   // In your component
   <EndUserVerification
     apiKey={process.env.REACT_APP_IDSWYFT_API_KEY}
     userId={currentUser.id}
     redirectUrl="/dashboard"
   />
   ```

## Styling

The component uses Tailwind CSS classes. You can:

1. **Use as-is** if you have Tailwind CSS in your project
2. **Customize themes** by modifying the `themeClasses` object
3. **Override styles** using the `className` prop
4. **Create custom themes** by extending the theme system

## Internationalization

The whole end-user flow ships in **English (`en`)** and **Spanish (`es`)**. There is no
i18n library — `src/i18n/` is a ~120-line module (about 11 KB gzipped including both
catalogs).

### Choosing the language

Resolved once at first render, highest precedence first:

| # | Source | Notes |
|---|--------|-------|
| 1 | `?lang=es` query param | What you set on the verification URL you hand the user |
| 2 | `localStorage['idswyft_lang']` | The user's own pick from the language switcher |
| 3 | `navigator.languages` | Matched on the primary subtag, so `es-419` → `es` |
| 4 | `en` | Fallback |

```
https://your-domain/user-verification?session=<token>&lang=es
```

`<html lang>` is kept in sync so screen readers pick the right voice.

### Cross-device handoff

`?lang=` is **automatically appended** to the QR-code URL and to the `/verify/mobile`
redirect. The phone is a different device with its own `localStorage`, so without this
someone who picks Spanish on the desktop would land on an English page. If you add a
new navigation between flow surfaces, run the URL through
`appendLocaleParam(url, locale)` from `src/i18n`.

### Adding a key

1. Add it to `src/i18n/locales/en.ts` (the source of truth).
2. `npm run type-check` now fails — `es.ts` is typed as a *complete* catalog, so a
   missing translation is a build error, never a silent English fallback.
3. Add the Spanish string. `npm test` checks that interpolation placeholders
   (`{age}`, `{company}`, …) and deliberate `\n` line breaks survive translation.

### Adding a language

Add the code to `SUPPORTED_LOCALES` in `src/i18n/resolve.ts`, a label in
`LOCALE_LABELS`, a `locales/<code>.ts` typed as `Catalog`, and register it in the
`CATALOGS` map in `src/i18n/index.tsx`. `tsc` then lists every key you still owe.

### What is never translated

Copy authored by the integrating developer always wins over the catalog:
`page_builder_config.headerTitle`, `headerSubtitle`, `steps.*.label`,
`completionTitle`, `completionMessage`, and `branding.company_name`. Those are your
words, not Idswyft's.

**Known gap:** error messages produced by the API are returned as English prose
(`body.message`), and the backend has no stable error codes to map from. Client-side
errors are translated; a server-side failure can still surface in English.

## Flow Control

The component automatically:

1. **Starts verification** when mounted
2. **Handles all API calls** internally
3. **Manages state transitions** between steps
4. **Polls for completion** during processing
5. **Redirects on completion** (if configured)

## Error Handling

- Displays user-friendly error messages
- Automatically retries failed requests
- Provides fallback states for network issues
- Logs errors for debugging (in development)

## Security Notes

- API keys should be stored securely (environment variables)
- User IDs should be properly validated
- Consider implementing rate limiting on your side
- Always validate verification results on your backend

## Support

For questions or issues with the verification component:

1. Check the [API Documentation](../docs/API.md)
2. Review the [Developer Portal](http://localhost:5173/developer)
3. Test with the [Demo Page](http://localhost:5173/verify) first