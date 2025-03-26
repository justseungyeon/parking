import React, { useEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";

const NaverMapComponent = () => {
  const mapElement = useRef(null);
  const [map, setMap] = useState(null);
  const [searchResults, setSearchResults] = useState([]);
  const [alertMsg, setAlertMsg] = useState("");
  const [history, setHistory] = useState([]);
  const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID;
  const NAVER_SECRET_KEY = process.env.REACT_APP_NAVER_CLIENT_SECRET;

  useEffect(() => {
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
            const userLocation = new window.naver.maps.LatLng(
              position.coords.latitude,
              position.coords.longitude
            );
            newMap.setCenter(userLocation);
            new window.naver.maps.Marker({
              position: userLocation,
              map: newMap,
              title: "현재 위치",
            });
          },
          (error) => console.error("현 위치 찾기 실패", error)
        );
      }
    };
    document.head.appendChild(script);
  }, [NAVER_CLIENT_ID]);

  // 검색 실행
  const handleSearch = (searchKeyword) => {
    if (!map) return;
    setAlertMsg("");
    setSearchResults([]);

    fetch(`https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${encodeURIComponent(searchKeyword)}`, {
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

          // 검색 기록 저장
          setHistory((prev) => [searchKeyword, ...prev]);

          const lat = data.addresses[0].y;
          const lng = data.addresses[0].x;
          map.setCenter(new window.naver.maps.LatLng(lat, lng));
          new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(lat, lng),
            map: map,
            title: searchKeyword,
          });
        } else {
          setAlertMsg("❌ 검색 결과가 없습니다 ❌");
        }
      })
      .catch(() => setAlertMsg("❌ 검색 도중 오류가 발생했습니다 ❌"));
  };

  // 결과 클릭하면 이동
  const handleResultClick = (result) => {
    if (!map) return;
    const lat = result.y;
    const lng = result.x;
    map.setCenter(new window.naver.maps.LatLng(lat, lng));
    new window.naver.maps.Marker({
      position: new window.naver.maps.LatLng(lat, lng),
      map: map,
      title: result.roadAddress || result.jibunAddress,
    });
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <SearchBar onSearch={handleSearch} />

      {/* 예쁜 알림창 */}
      {alertMsg && (
        <div style={{
          position: "absolute",
          top: "80px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#ffcccc",
          padding: "10px 20px",
          borderRadius: "10px",
          color: "#b00000",
          fontWeight: "bold",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          zIndex: 1000,
        }}>
          {alertMsg}
        </div>
      )}

      {/* 검색 결과 리스트 */}
      {searchResults.length > 0 && (
        <div style={{
          position: "absolute",
          top: "130px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#fff",
          padding: "10px",
          borderRadius: "10px",
          width: "300px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          zIndex: 1000,
          maxHeight: "200px",
          overflowY: "auto"
        }}>
          <h4>📍 검색 결과</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {searchResults.map((item, index) => (
              <li
                key={index}
                onClick={() => handleResultClick(item)}
                style={{
                  padding: "5px 0",
                  borderBottom: "1px solid #ddd",
                  cursor: "pointer",
                  color: "#333"
                }}
              >
                {item.roadAddress || item.jibunAddress}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 검색 기록 보기 */}
      {history.length > 0 && (
        <div style={{
          position: "absolute",
          bottom: "20px",
          left: "50%",
          transform: "translateX(-50%)",
          backgroundColor: "#f0f0f0",
          padding: "10px",
          borderRadius: "10px",
          width: "300px",
          boxShadow: "0 4px 8px rgba(0,0,0,0.2)",
          zIndex: 1000
        }}>
          <h4>📜 검색 기록</h4>
          <ul style={{ listStyle: "none", padding: 0 }}>
            {history.map((keyword, index) => (
              <li key={index} style={{ padding: "5px 0", borderBottom: "1px solid #ccc" }}>
                {keyword}
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* 네이버 지도 */}
      <div ref={mapElement} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default NaverMapComponent;
