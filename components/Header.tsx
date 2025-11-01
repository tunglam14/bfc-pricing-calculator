import React from 'react';
import { useLanguage } from '../i18n/LanguageContext';

interface HeaderProps {
  onToggleDocs: () => void;
  isDocsVisible: boolean;
}

const Header: React.FC<HeaderProps> = ({ onToggleDocs, isDocsVisible }) => {
  const { language, setLanguage, t } = useLanguage();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-10">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center space-x-4 p-1">
            <img src="https://bizflycloud.vn/footer/logo.svg" alt="Bizfly Cloud Logo" className="h-8" />
            <span className="hidden sm:block border-l border-gray-300 h-8"></span>
            <h1 className="text-lg sm:text-xl font-semibold text-gray-700">{isDocsVisible ? t('api_docs.title') : t('header.title')}</h1>
          </div>
          <div className="flex items-center space-x-4">
             <button
                onClick={onToggleDocs}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors flex items-center space-x-2 ${isDocsVisible ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'}`}
                >
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" /></svg>
                <span>API Docs</span>
            </button>
            <div className="flex items-center space-x-2">
                <button
                onClick={() => setLanguage('en')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === 'en' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} cta-bfc-pc-en`}
                >
                EN
                </button>
                <button
                onClick={() => setLanguage('vi')}
                className={`px-3 py-1 text-sm font-semibold rounded-md transition-colors ${language === 'vi' ? 'bg-blue-700 text-white' : 'bg-gray-200 text-gray-700 hover:bg-gray-300'} cta-bfc-pc-vi`}
                >
                VI
                </button>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;