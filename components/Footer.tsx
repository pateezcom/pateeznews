
import React from 'react';
import { useLanguage } from '../context/LanguageContext';

const Footer: React.FC = () => {
  const { t } = useLanguage();
  return (
    <div className="px-3 mt-4">
      <p className="text-[11px] text-gray-400">
        {t('footer.rights')}
      </p>
    </div>
  );
};

export default Footer;
