import React from 'react'
import { Link } from 'react-router-dom'
import './HotProductButton.css'
import '../../../i18n.js';
import {useTranslation} from "react-i18next";

const HotProductButton = () => {
  const { t, i18n } = useTranslation();
  return (
    <Link to='/product' className='hot-product-btn'>
        {t('all_products')}
    </Link>
  )
}

export default HotProductButton