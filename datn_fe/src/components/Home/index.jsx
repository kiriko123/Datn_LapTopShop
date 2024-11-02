import Slider from "../Slider/slider.jsx";
import ImageLayout from "../Home/ImageLayout/ImageLayout.jsx";
import HotProducts from "../Home/HotProducts/HotProducts.jsx";
import HotCategories from "../Home/HotCategory/HotCategories.jsx";
import BrandList from "./BrandList.jsx";
import VoucherList from "./VoucherList.jsx"
// import Checkout from "./Checkout.jsx";
// import {PayPalScriptProvider} from "@paypal/react-paypal-js";
// const initialOptions = {
//     "client-id": "AXPtAiVzwdwajXcuJ3K0dM8gqb_6y67vGfuGxnoUGNwryqD8JYGe1J7KpN29iUQy0JbZU5BYajlI8n9k",
//     currency: "USD",
//     intent: "capture",
// };

const Home = () => {
    return (
        <>
            {/*<PayPalScriptProvider options={initialOptions}>*/}
            {/*    <Checkout />*/}
            {/*</PayPalScriptProvider>*/}
            <Slider />
            <BrandList/>
            <HotProducts />
            <ImageLayout />
            <HotCategories />
            <VoucherList/>
        </>
    )
}
export default Home;