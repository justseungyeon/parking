import React, { useEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";

const NaverMapComponent = () => {
  const mapElement = useRef(null);
  const [map, setMap] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [history, setHistory] = useState([]);
  const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID;
  const NAVER_SECRET_KEY = process.env.REACT_APP_NAVER_CLIENT_SECRET;

  useEffect(() => {
    console.log("네이버 ID 확인:", NAVER_CLIENT_ID);
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_CLIENT_ID}`;
    script.async = true;
    script.onload = () => {
      if (!window.naver || !window.naver.maps) return;

      const newMap = new window.naver.maps.Map(mapElement.current, {
        center: new window.naver.maps.LatLng(37.2984, 126.8365),
        zoom: 16,
      });
      setMap(newMap);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            const userLocation = new window.naver.maps.LatLng(lat, lng);
            newMap.setCenter(userLocation);
            new window.naver.maps.Marker({ position: userLocation, map: newMap, title: "현재 위치" });
          },
          (error) => console.error("현위치 찾기 실패", error)
        );
      }
    };
    document.head.appendChild(script);
  }, [NAVER_CLIENT_ID]);

  // 검색 실행
  const handleSearch = (searchKeyword) => {
    fetch(`https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${searchKeyword}`, {
      method: "GET",
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_SECRET_KEY,
      },
    })
      .then((response) => response.json())
      .then((data) => {
        if (data.addresses && data.addresses.length > 0) {
          setSearchResults(data.addresses);
          setHistory((prev) => [...prev, searchKeyword]);
        } else {
          setSearchResults([]);
          alert("❌ 검색 결과가 없습니다.");
        }
      })
      .catch((error) => console.error("Error:", error));
  };

  // 결과 클릭 → 지도 이동
  const moveToLocation = (lat, lng) => {
    if (map) {
      map.setCenter(new window.naver.maps.LatLng(lat, lng));
      new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lat, lng),
        map: map,
        title: "검색 결과",
      });
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <SearchBar onSearch={handleSearch} />

      {/* 검색 결과 리스트 */}
      {searchResults.length > 0 && (
        <div style={{ position: "absolute", top: "70px", left: "50%", transform: "translateX(-50%)", zIndex: 1000, background: "#fff", padding: "10px", borderRadius: "10px", maxHeight: "200px", overflowY: "auto" }}>
          {searchResults.map((result, index) => (
            <div key={index} onClick={() => moveToLocation(result.y, result.x)} style={{ padding: "8px", borderBottom: "1px solid #eee", cursor: "pointer" }}>
              📍 {result.roadAddress || result.jibunAddress}
            </div>
          ))}
        </div>
      )}

      {/* 검색 기록 */}
      {history.length > 0 && (
        <div style={{ position: "absolute", bottom: "10px", left: "10px", background: "#f0f0f0", padding: "10px", borderRadius: "10px", maxHeight: "200px", overflowY: "auto" }}>
          <strong>🔎 검색 기록</strong>
          <ul>
            {history.map((item, index) => (
              <li key={index} style={{ fontSize: "12px" }}>{item}</li>
            ))}
          </ul>
        </div>
      )}

      <div ref={mapElement} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default NaverMapComponent;
