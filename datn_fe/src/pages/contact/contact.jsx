import React from "react";
import { useTranslation } from "react-i18next";
import { MdCall } from "react-icons/md";
import { MdMarkEmailUnread } from "react-icons/md";
import { MdLocationOn } from "react-icons/md";
import { MdFacebook } from "react-icons/md";
import { IoLogoInstagram } from "react-icons/io";
import { IoLogoLinkedin } from "react-icons/io";
import { IoLogoTwitter } from "react-icons/io";

const Contact = () => {
    const { t } = useTranslation();
    const backendUrl = import.meta.env.VITE_BACKEND_URL;

    return (
        <div className="antialiased bg-gray-100">
            <div className="flex w-full min-h-screen justify-center items-center">
                <div
                    className="flex flex-col md:flex-row md:space-x-6 space-y-6 md:space-y-0 bg-cyan-700 w-full max-w-4xl p-8 sm:p-12 rounded-xl shadow-lg text-white overflow-hidden">
                    <div className="flex flex-col space-y-8 justify-between">
                        <div>
                            <h1 className="font-bold text-4xl tracking-wide">Liên hệ với chúng tôi</h1>
                            <p className="pt-2 text-cyan-100 text-sm">Chào bạn! Nếu bạn có bất kỳ câu hỏi nào hoặc cần được giải đáp, vui lòng liên hệ với chúng tôi qua các phương thức liên hệ dưới đây.</p>
                        </div>
                        <div className="flex flex-col space-y-6 ">
                            <div className="inline-flex space-x-2 items-center">
                                <MdCall className="text-teal-300 text-xl"/>
                                <span>+(84) 8813 598</span>
                            </div>
                            <div className="inline-flex space-x-2 items-center">
                                <MdMarkEmailUnread className="text-teal-300 text-xl"/>
                                <span>laptopshop2024@gmail.com</span>
                            </div>
                            <div className="inline-flex space-x-2 items-center">
                                <MdLocationOn className="text-teal-300 text-xl"/>
                                <span>12, Tô Ký, TP. Hồ Chí Minh</span>
                            </div>
                        </div>
                        <div className="flex space-x-4 text-lg">
                            <a href="#"><MdFacebook/></a>
                            <a href="#"><IoLogoTwitter/></a>
                            <a href="#"><IoLogoLinkedin/></a>
                            <a href="#"><IoLogoInstagram/></a>
                        </div>
                    </div>
                    <div className="relative">
                        <div className="absolute w-40 h-40 bg-teal-400 rounded-full -right-28 -top-28 "></div>
                        <div className="absolute w-40 h-40 bg-teal-400 rounded-full -left-28 -bottom-16 "></div>
                        <div className="relative z-10 bg-white rounded-xl shadow-lg p-8 text-gray-600 md:w-80">
                            <form action="" className="flex flex-col space-y-4">
                                <div>
                                    <label htmlFor="" className="text-sm">Họ và tên</label>
                                    <input type="text"
                                           placeholder="Nhập họ tên"
                                           className="ring-1 ring-gray-300 w-full rounded-md px-4 py-2 mt-2 outline-none focus:ring-2 focus:ring-teal-300"/>
                                </div>

                                <div>
                                    <label htmlFor="" className="text-sm">Email</label>
                                    <input type="email"
                                           placeholder="Nhập email"
                                           className="ring-1 ring-gray-300 w-full rounded-md px-4 py-2 mt-2 outline-none focus:ring-2 focus:ring-teal-300"/>
                                </div>

                                <div>
                                    <label htmlFor="" className="text-sm">Câu hỏi</label>
                                    <textarea
                                        placeholder="Nhập câu hỏi"
                                        rows="4"
                                        className="ring-1 ring-gray-300 w-full rounded-md px-4 py-2 mt-2 outline-none focus:ring-2 focus:ring-teal-300"></textarea>
                                </div>
                                <button
                                    className="inline-block self-end bg-cyan-700 text-white font-bold rounded-lg px-6 py-2 uppercase text-sm">
                                    Gửi
                                </button>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Contact;
