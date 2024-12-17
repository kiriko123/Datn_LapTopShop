import React from "react";
import '../../i18n.js';
import {useTranslation} from "react-i18next";
import ENFlag from '../../assets/images/EN.png';
import VNFlag from '../../assets/images/VN.png';
const Head = () => {
    const { t, i18n } = useTranslation();

    const changeLanguage = (lng) => {
        i18n.changeLanguage(lng);
    };

    return (
        <section className="bg-[#0f3460] py-2 text-white text-sm">
            <div className="container mx-auto px-4 flex flex-wrap justify-between items-center max-w-screen-xl">
                <div className="flex flex-wrap items-center space-x-4">
                    <i className="fa fa-phone"></i>
                    <label>+84 8813 598</label>
                    <i className="fa fa-envelope"></i>
                    <label>laptopshop2024@gmail.com</label>
                </div>
                <div className="flex flex-wrap items-center space-x-4 mt-2 md:mt-0">
                    <label>{t('faqs')}</label>
                    <label>{t('need_help')}</label>
                    <label onClick={() => changeLanguage('en')} className="cursor-pointer hover:text-[#11998e] flex items-center space-x-1">
                        <img
                            src={ENFlag}
                            alt="UK flag"
                            className="inline-block w-5 h-3"
                        /> EN
                    </label>
                    <label onClick={() => changeLanguage('vi')} className="cursor-pointer hover:text-[#11998e] flex items-center space-x-1">
                        <img
                            src={VNFlag}
                            alt="Vietnam flag"
                            className="inline-block w-5 h-3"
                        /> VI
                    </label>
                </div>
            </div>
        </section>
    );
}

export default Head;
