import { useEffect, useState } from "react";
import axios from "axios";
import { Select, Input } from "antd";

const { Option } = Select;

const LocationSelect = ({ onAddressChange }) => {
    const [provinces, setProvinces] = useState([]);
    const [districts, setDistricts] = useState([]);
    const [wards, setWards] = useState([]);
    const [street, setStreet] = useState("");

    const [selectedProvince, setSelectedProvince] = useState(null); // Use null for initial value
    const [selectedDistrict, setSelectedDistrict] = useState(null); // Use null for initial value
    const [selectedWard, setSelectedWard] = useState(null); // Use null for initial value

    useEffect(() => {
        axios.get("https://vapi.vnappmob.com/api/v2/province/")
            .then((response) => {
                setProvinces(response.data.results);
            });
    }, []);

    useEffect(() => {
        if (selectedProvince) {
            axios.get(`https://vapi.vnappmob.com/api/v2/province/district/${selectedProvince.province_id}`)
                .then((response) => {
                    setDistricts(response.data.results);
                    setSelectedDistrict(null); // Reset district when province changes
                    setSelectedWard(null); // Reset ward when province changes
                    setWards([]);
                });
        } else {
            setDistricts([]);
            setWards([]);
        }
    }, [selectedProvince]);

    useEffect(() => {
        if (selectedDistrict) {
            axios.get(`https://vapi.vnappmob.com/api/v2/province/ward/${selectedDistrict.district_id}`)
                .then((response) => {
                    setWards(response.data.results);
                    setSelectedWard(null); // Reset ward when district changes
                });
        } else {
            setWards([]);
        }
    }, [selectedDistrict]);

    const handleProvinceChange = (provinceId) => {
        const province = provinces.find(p => p.province_id === provinceId);
        setSelectedProvince(province);
        onAddressChange(province?.province_name, null, null, street);
    };

    const handleDistrictChange = (districtId) => {
        const district = districts.find(d => d.district_id === districtId);
        setSelectedDistrict(district);
        onAddressChange(selectedProvince?.province_name, district?.district_name, null, street);
    };

    const handleWardChange = (wardId) => {
        const ward = wards.find(w => w.ward_id === wardId);
        setSelectedWard(ward);
        onAddressChange(selectedProvince?.province_name, selectedDistrict?.district_name, ward?.ward_name, street);
    };

    const handleStreetChange = (e) => {
        setStreet(e.target.value);
        onAddressChange(selectedProvince?.province_name, selectedDistrict?.district_name, selectedWard?.ward_name, e.target.value);
    };

    return (
        <div style={{ marginBottom: "10px" }}>
            <Select
                placeholder="Chọn Tỉnh"
                value={selectedProvince?.province_id} // Use the ID for the Select value
                onChange={handleProvinceChange}
                style={{ width: '100%', marginBottom: '10px' }}
            >
                {provinces.map((province) => (
                    <Option key={province.province_id} value={province.province_id}>
                        {province.province_name}
                    </Option>
                ))}
            </Select>

            <Select
                placeholder="Chọn Huyện"
                value={selectedDistrict?.district_id} // Use the ID for the Select value
                onChange={handleDistrictChange}
                disabled={!selectedProvince}
                style={{ width: '100%', marginBottom: '10px' }}
            >
                {districts.map((district) => (
                    <Option key={district.district_id} value={district.district_id}>
                        {district.district_name}
                    </Option>
                ))}
            </Select>

            <Select
                placeholder="Chọn Xã"
                value={selectedWard?.ward_id} // Use the ID for the Select value
                onChange={handleWardChange}
                disabled={!selectedDistrict}
                style={{ width: '100%', marginBottom: '10px' }}
            >
                {wards.map((ward) => (
                    <Option key={ward.ward_id} value={ward.ward_id}>
                        {ward.ward_name}
                    </Option>
                ))}
            </Select>

            <Input
                placeholder="Nhập số nhà, tên đường"
                value={street}
                onChange={handleStreetChange}
                style={{ width: '100%' }}
            />
        </div>
    );
};

export default LocationSelect;