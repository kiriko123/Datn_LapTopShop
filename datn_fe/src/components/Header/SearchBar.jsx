import { useState } from "react";
import { callFetchProduct } from "../../services/api.js";
import { Input } from 'antd';

export const SearchBar = ({ searchTerm, setSearchTerm, handleSearch, setResults }) => {
    const fetchData = async (value) => {
        if (value) {
            try {
                const response = await callFetchProduct(`filter=name~'${value}'`);
                if (response && response.data) {
                    const results = response.data.result;
                    setResults(results);
                }
            } catch (error) {
                console.error("Error fetching data:", error);
            }
        } else {
            setResults([]); // Xóa Result khi input để trống
        }
    };

    const handleChange = (e) => {
        const value = e.target.value;
        setSearchTerm(value);
        fetchData(value);
    };

    return (
        <div className="input-wrapper">
            <Input.Search
                placeholder="Search "
                enterButton
                value={searchTerm}
                onChange={handleChange}
                onSearch={handleSearch}
            />
        </div>
    );
};