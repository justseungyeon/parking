import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSearch = () => {
    if (searchKeyword.trim()) {
      onSearch(searchKeyword);  // 검색어 부모에게 전달
    } else {
      alert("검색어를 입력하세요!");
    }
  };

  return (
    <div style={{
      position: "absolute",
      top: "10px",
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      background: "white",
      padding: "10px",
      borderRadius: "10px",
      boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
      display: "flex"
    }}>
      <input
        type="text"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        placeholder="목적지를 입력하세요..."
        style={{ padding: "8px", borderRadius: "5px", border: "1px solid #ddd", marginRight: "5px" }}
      />
      <button onClick={handleSearch} style={{ padding: "8px", cursor: "pointer" }}>검색</button>
    </div>
  );
};

export default SearchBar;
