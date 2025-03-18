import React, { useEffect, useRef, useState } from "react";

const NaverMapComponent = () => {
  const mapElement = useRef(null);
  const [map, setMap] = useState(null);
  const [searchKeyword, setSearchKeyword] = useState(""); // 검색어 상태
  const [suggestions, setSuggestions] = useState([]); // 자동완성 목록
  const [currentLocation, setCurrentLocation] = useState(null); // 현재 위치
  const [marker, setMarker] = useState(null); // 검색된 마커 (단 하나만 표시)

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=grfapsjuvx`;
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

      // 📌 현재 위치 가져오기
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const lat = position.coords.latitude;
            const lng = position.coords.longitude;
            setCurrentLocation({ lat, lng });

            const userMarker = new window.naver.maps.Marker({
              position: new window.naver.maps.LatLng(lat, lng),
              map: newMap,
              title: "현재 위치",
            });

            // 지도 중심 이동
            newMap.setCenter(new window.naver.maps.LatLng(lat, lng));
          },
          (error) => {
            console.error("위치 정보를 가져올 수 없습니다.", error);
          }
        );
      }
    };
    document.head.appendChild(script);
  }, []);

  // 📌 자동완성 기능
  const handleInputChange = (e) => {
    const value = e.target.value;
    setSearchKeyword(value);

    if (!value.trim()) {
      setSuggestions([]); // 입력이 없으면 자동완성 목록 비우기
      return;
    }

    if (window.naver && window.naver.maps && window.naver.maps.Service) {
      window.naver.maps.Service.geocode(
        { query: value },
        (status, response) => {
          if (status === window.naver.maps.Service.Status.OK && response.v2.addresses.length > 0) {
            setSuggestions(response.v2.addresses.map((addr) => addr.jibunAddress || addr.roadAddress));
          } else {
            setSuggestions([]);
          }
        }
      );
    }
  };

  const handleSearch = () => {
    if (!map) return;
    if (!searchKeyword.trim()) {
      alert("검색어를 입력하세요.");
      return;
    }
  
    fetch(`https://naveropenapi.apigw.ntruss.com/map-geocode/v2/geocode?query=${searchKeyword}`, {
      method: "GET",
      headers: {
        "X-NCP-APIGW-API-KEY-ID": "grfapsjuvx",
        "X-NCP-APIGW-API-KEY": "v41yd8ZznN0hj3JSi6e6V8mM95rIdE54iOx7NuA1"
      }
    })
      .then(response => response.json())
      .then(data => {
        if (data.addresses && data.addresses.length > 0) {
          const lat = data.addresses[0].y;
          const lng = data.addresses[0].x;
  
          // 지도 중심 이동
          map.setCenter(new window.naver.maps.LatLng(lat, lng));
  
          // 검색한 위치에 마커 추가
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
      {/* 📌 검색창 UI */}
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
        {/* 자동완성 리스트 */}
        {suggestions.length > 0 && (
          <ul
            style={{
              listStyle: "none",
              padding: "0",
              margin: "0",
              background: "white",
              border: "1px solid #ddd",
              borderRadius: "5px",
              maxHeight: "150px",
              overflowY: "auto",
              boxShadow: "0px 4px 6px rgba(0,0,0,0.1)",
            }}
          >
            {suggestions.map((item, index) => (
              <li
                key={index}
                onClick={() => {
                  setSearchKeyword(item);
                  setSuggestions([]); // 자동완성 닫기
                  handleSearch(item); // 검색 실행
                }}
                style={{
                  padding: "8px",
                  cursor: "pointer",
                  borderBottom: "1px solid #ddd",
                }}
              >
                {item}
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* 네이버 지도 */}
      <div ref={mapElement} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default NaverMapComponent;
