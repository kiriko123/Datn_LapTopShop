import React from 'react';
import './HotProductHeader.css';
import '../../../i18n.js';
import {useTranslation} from "react-i18next";


const HotProductHeader = () => {
  const { t, i18n } = useTranslation();

  
  return (
    <div className="title">
        <div className="spinner"></div> {/* Added spinner before title */}
        <h2>{t('hot_products')}</h2>
        <div className="underline"></div>
    </div>
  )
}

export default HotProductHeader