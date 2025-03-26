import React, { useEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";

const NaverMapComponent = () => {
  const mapElement = useRef(null);
  const [map, setMap] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [alertMsg, setAlertMsg] = useState("");

  const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID;
  const NAVER_SECRET_KEY = process.env.REACT_APP_NAVER_CLIENT_SECRET;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_CLIENT_ID}`;
    script.async = true;
    script.onload = () => {
      if (!window.naver || !window.naver.maps) return;

      const defaultCenter = new window.naver.maps.LatLng(37.2984, 126.8365);
      const newMap = new window.naver.maps.Map(mapElement.current, {
        center: defaultCenter,
        zoom: 16,
      });
      setMap(newMap);

      // 현재 위치 마커
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const userLoc = new window.naver.maps.LatLng(
              position.coords.latitude,
              position.coords.longitude
            );
            new window.naver.maps.Marker({
              position: userLoc,
              map: newMap,
              title: "현재 위치",
            });
            newMap.setCenter(userLoc);
          },
          () => console.error("현위치 찾기 실패")
        );
      }
    };
    document.head.appendChild(script);
  }, [NAVER_CLIENT_ID]);

  // 검색 수행
  const handleSearch = (searchKeyword) => {
    if (!searchKeyword) return;
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
          setAlertMsg("");
        } else {
          setSearchResults([]);
          setAlertMsg("검색 결과가 없습니다.");
        }
      })
      .catch(() => setAlertMsg("검색 중 오류 발생"));
  };

  // 결과 클릭 시 이동
  const handleResultClick = (lat, lng) => {
    if (map) {
      map.setCenter(new window.naver.maps.LatLng(lat, lng));
      new window.naver.maps.Marker({
        position: new window.naver.maps.LatLng(lat, lng),
        map,
        title: "검색 위치",
      });
    }
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <SearchBar onSearch={handleSearch} />

      {alertMsg && (
        <div style={{
          position: "absolute", top: "60px", left: "50%", transform: "translateX(-50%)",
          backgroundColor: "#ffe6e6", padding: "10px 20px", borderRadius: "8px",
          color: "#b00020", fontWeight: "bold", zIndex: 1000
        }}>
          {alertMsg}
        </div>
      )}

      {/* 검색 결과 목록 */}
      {searchResults.length > 0 && (
        <div style={{
          position: "absolute", top: "100px", left: "50%", transform: "translateX(-50%)",
          backgroundColor: "#fff", padding: "10px", borderRadius: "8px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)", zIndex: 1000, maxHeight: "200px", overflowY: "auto"
        }}>
          {searchResults.slice(0, 5).map((item, idx) => (
            <div key={idx}
              style={{ padding: "8px", cursor: "pointer", borderBottom: "1px solid #eee" }}
              onClick={() => handleResultClick(item.y, item.x)}
            >
              {item.roadAddress || item.jibunAddress}
            </div>
          ))}
        </div>
      )}

      <div ref={mapElement} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default NaverMapComponent;
