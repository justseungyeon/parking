import React, { useEffect, useRef, useState } from "react";
import SearchBar from "./SearchBar";

const NaverMapComponent = () => {
  const mapElement = useRef(null);
  const [map, setMap] = useState(null);
  const NAVER_CLIENT_ID = process.env.REACT_APP_NAVER_CLIENT_ID;
  const NAVER_SECRET_KEY = process.env.REACT_APP_NAVER_SECRET_KEY;

  useEffect(() => {
    const script = document.createElement("script");
    script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_CLIENT_ID}`;
    script.async = true;
    script.onload = () => {
      const newMap = new window.naver.maps.Map(mapElement.current, {
        center: new window.naver.maps.LatLng(37.2984, 126.8365),
        zoom: 16,
      });
      setMap(newMap);

      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          new window.naver.maps.Marker({
            position: new window.naver.maps.LatLng(lat, lng),
            map: newMap,
            title: "현재 위치",
          });
          newMap.setCenter(new window.naver.maps.LatLng(lat, lng));
        });
      }
    };
    document.head.appendChild(script);
  }, [NAVER_CLIENT_ID]);

  // 📌 검색 기능 (검색창에서 검색어 받음)
  const handleSearch = (searchKeyword) => {
    if (!map) return;
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
      <SearchBar onSearch={handleSearch} />
      <div ref={mapElement} style={{ width: "100%", height: "100%" }} />
    </div>
  );
};

export default NaverMapComponent;
