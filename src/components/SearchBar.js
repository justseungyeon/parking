import React, { useState } from "react";

const SearchBar = ({ onSearch }) => {
  const [searchKeyword, setSearchKeyword] = useState("");

  // 검색 버튼 클릭 시 실행
  const handleSearch = () => {
    if (!searchKeyword.trim()) {
      alert("검색어를 입력하세요!");
      return;
    }
    onSearch(searchKeyword);  // 검색어를 부모(NaverMap)로 전달
  };

  return (
    <div style={{ position: "absolute", top: "10px", left: "50%", transform: "translateX(-50%)", zIndex: 1000 }}>
      <input
        type="text"
        value={searchKeyword}
        onChange={(e) => setSearchKeyword(e.target.value)}
        placeholder="목적지를 입력하세요"
        style={{ padding: "8px", borderRadius: "5px", width: "300px", border: "1px solid #ddd" }}
      />
      <button
        onClick={handleSearch}
        style={{ padding: "8px 16px", marginLeft: "8px", cursor: "pointer" }}
      >
        검색
      </button>
    </div>
  );
};

export default SearchBar;
