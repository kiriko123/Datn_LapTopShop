import React from 'react';
import './HotCategoryHeader.css';
import '../../../i18n.js';
import {useTranslation} from "react-i18next";

const HotCategoryHeader = () => {
  const { t, i18n } = useTranslation();
  return (
    <div className="title">
        <div className="spinner"></div> {/* Added spinner before title */}
        <h2>{t('hot_categories')}</h2>
        <div className="underline"></div>
    </div>
  )
}

export default HotCategoryHeader