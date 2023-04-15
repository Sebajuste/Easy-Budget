
import ErrorBundary from './src/components/error-bundary';
import Router from './src/router';
import DatabaseProvider from './src/services/db-provider';
import { LanguageProvider } from './src/services/i18n/language-provider';

export default function App() {

  return (
    <ErrorBundary>
      <DatabaseProvider>
        <LanguageProvider>
          <Router />
        </LanguageProvider>
      </DatabaseProvider>
    </ErrorBundary>
  );

}
