import React, { useEffect, useRef, useState } from "react";

const NaverMapComponent = () => {
  const mapElement = useRef(null);
  const [map, setMap] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [suggestions, setSuggestions] = useState([]);
  const [currentLocation, setCurrentLocation] = useState(null);

  // 📌 .env에서 API 키 읽기
  const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID;
  const NAVER_SECRET_KEY = process.env.REACT_APP_NAVER_SECRET_KEY;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_CLIENT_ID}`;
    script.async = true;
    script.onload = () => {
      if (!window.naver || !window.naver.maps) {
        console.error("네이버 지도 API를 불러오지 못했습니다.");
        return;
      }

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
            setCurrentLocation({ lat, lng });

            new window.naver.maps.Marker({
              position: new window.naver.maps.LatLng(lat, lng),
              map: newMap,
              title: "현재 위치",
            });

            newMap.setCenter(new window.naver.maps.LatLng(lat, lng));
          },
          (error) => {
            console.error("위치 정보를 가져올 수 없습니다.", error);
          }
        );
      }
    };
    document.head.appendChild(script);
  }, [NAVER_CLIENT_ID]);

  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);
    setSuggestions([]); // 지금은 Geocode 자동완성 대신 비움
  };

  const handleSearch = () => {
    if (!map || !searchKeyword.trim()) {
      alert("검색어를 입력하세요.");
      return;
    }

    fetch(`https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${searchKeyword}`, {
      method: "GET",
      headers: {
        "X-NCP-APIGW-API-KEY-ID": NAVER_CLIENT_ID,
        "X-NCP-APIGW-API-KEY": NAVER_SECRET_KEY
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.addresses && data.addresses.length > 0) {
          const lat = data.addresses[0].y;
          const lng = data.addresses[0].x;
          map.setCenter(new window.naver.maps.LatLng(lat, lng));

          new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(lat, lng),
            map: map,
            title: searchKeyword
          });
        } else {
          alert("검색 결과가 없습니다.");
        }
      })
      .catch(error => console.error("Error:", error));
  };

  return (
    <div style={{ width: "100vw", height: "100vh", position: "relative" }}>
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "50%",
          transform: "translateX(-50%)",
          zIndex: 1000,
          background: "white",
          padding: "10px",
          borderRadius: "10px",
          boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
          display: "flex",
          flexDirection: "column",
          width: "300px",
        }}
      >
        <input
          type="text"
          placeholder="목적지를 입력하세요..."
          value={searchKeyword}
          onChange={handleInputChange}
          style={{
            padding: "8px",
            borderRadius: "5px",
            border: "1px solid #ddd",
            marginBottom: "5px",
          }}
        />
        <button onClick={handleSearch} style={{ padding: "8px" }}>
          검색
        </button>
      </div>

      <div ref={mapElement} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default NaverMapComponent;
