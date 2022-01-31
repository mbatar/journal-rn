import React, {createContext, useEffect, useState, useRef} from 'react';
import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';

export const AppContext = createContext();

const AppContextProvider = props => {
  const [trackingIsActive, setTrackingIsActive] = useState(false);
  const [draws, setDraws] = useState([]);
  const watchId = useRef(null);

  useEffect(() => {
    if (trackingIsActive == true) {
      watchId.current = Geolocation.watchPosition(
        position => {
          const draw = {
            locations: {
              latitude: position.coords.latitude,
              longitude: position.coords.longitude,
            },
            timestamp: position.timestamp,
          };
          setDraws(v => [...v, draw]);
          console.log('DRAW', draw);
        },
        error => {
          console.log(error);
        },
        {
          enableHighAccuracy: true,
          distanceFilter: 0,
          interval: 5000,
          fastestInterval: 2000,
        },
      );

    } else {
      Geolocation.clearWatch(watchId);
      if(draws.length){
        createDraws();
      }
    }
    console.log('TRACKINGGGG', trackingIsActive);
  }, [trackingIsActive]);
  // React.useEffect(() => {
  //   const _watchId = Geolocation.watchPosition(
  //     position => {
  //       const {latitude, longitude} = position.coords;
  //       console.log({...position.coords,timestamp:position.timestamp});
  //     },
  //     error => {
  //       console.log(error);
  //     },
  //     {
  //       enableHighAccuracy: true,
  //       distanceFilter: 0,
  //       interval: 5000,
  //       fastestInterval: 2000,
  //     },
  //   );

  //   return () => {
  //     if (_watchId) {
  //       Geolocation.clearWatch(_watchId);
  //     }
  //   };
  // }, []);
  React.useEffect(() => {
    console.log(draws);
  }, [draws]);
  const toggleTracking = () => {
    setTrackingIsActive(v => !v);
  };
  const createDraws = async () => {
    try {
      const createdDraws = await firestore().collection('draws').add({locations:draws});

    } catch (error) {
      console.log(error);
    }
  };
  return (
    <AppContext.Provider
      value={{
        trackingIsActive,
        toggleTracking,
      }}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
