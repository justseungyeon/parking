useEffect(() => {
  const script = document.createElement("script");
  script.src = `https://oapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${NAVER_CLIENT_ID}`;
  script.async = true;
  script.onload = () => {
    if (!window.naver || !window.naver.maps) return;

    // 기본 좌표는 한양대지만, GPS로 덮어쓰기
    let mapOptions = {
      center: new window.naver.maps.LatLng(37.2984, 126.8365),
      zoom: 16,
    };

    const newMap = new window.naver.maps.Map(mapElement.current, mapOptions);
    setMap(newMap);

    // 📌 현 위치 받아서 지도 중심 이동
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const lat = position.coords.latitude;
          const lng = position.coords.longitude;
          const userLocation = new window.naver.maps.LatLng(lat, lng);

          // 지도 중심을 내 위치로 이동
          newMap.setCenter(userLocation);

          // 내 위치 마커 찍기
          new window.naver.maps.Marker({
            position: userLocation,
            map: newMap,
            title: "현재 위치",
          });
        },
        (error) => {
          console.error("현위치 찾기 실패", error);
        }
      );
    }
  };
  document.head.appendChild(script);
}, [NAVER_CLIENT_ID]);
