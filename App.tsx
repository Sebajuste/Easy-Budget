
import ErrorBundary from './src/components/error-bundary';
import Router from './src/router';
import { LanguageProvider } from './src/services/i18n/language-provider';

export default function App() {

  return (
    <ErrorBundary>
      <LanguageProvider>
        <Router />
      </LanguageProvider>
    </ErrorBundary>
  );

}
