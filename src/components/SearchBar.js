import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [searchKeyword, setSearchKeyword] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    if (searchKeyword.trim()) {
      onSearch(searchKeyword);
      setSearchKeyword("");
    }
  };

  return (
    <form
      onSubmit={handleSubmit}
      style={{
        position: "absolute",
        top: "10px",
        left: "50%",
        transform: "translateX(-50%)",
        zIndex: 1000,
        background: "white",
        padding: "10px",
        borderRadius: "8px",
        boxShadow: "0 2px 5px rgba(0,0,0,0.3)"
      }}
    >
      <input
        type="text"
        placeholder="목적지를 입력하세요"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        style={{ padding: "8px", width: "250px", borderRadius: "5px" }}
      />
      <button type="submit" style={{ padding: "8px 12px", marginLeft: "5px" }}>
        검색
      </button>
    </form>
  );
};

export default SearchBar;
