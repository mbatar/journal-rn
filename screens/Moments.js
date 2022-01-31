import MapView, {Marker, PROVIDER_GOOGLE, Polyline} from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import Geolocation from '@react-native-community/geolocation';
import firestore from '@react-native-firebase/firestore';
import {getStatusBarHeight} from 'react-native-status-bar-height';
import Icon from 'react-native-vector-icons/Ionicons';

import * as React from 'react';
import {Platform, StyleSheet, View} from 'react-native';
import {Box, Button, Image} from 'native-base';
import {useNavigation} from '@react-navigation/native';
const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

const Moments = () => {
  const [currentLocation, setCurrentLocation] = React.useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0,
    longitudeDelta: 0,
  });
  const [locations, setLocations] = React.useState([]);
  const [draws, setDraws] = React.useState([]);
  const navigation = useNavigation();
  React.useEffect(() => {
    Geolocation.getCurrentPosition(
      position => {
        setCurrentLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          latitudeDelta: 0.0922,
          longitudeDelta: 0.0421,
        });
      },
      error => console.log('Error', JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 50000, maximumAge: 1000},
    );
    const getLocations = async () => {
      try {
        const fetchedLocations = await firestore()
          .collection('locations')
          .get();
        const locationData = fetchedLocations.docs.map(doc => doc.data());
        setLocations(locationData);
      } catch (error) {
        console.log('ERRRRR', error);
      }
    };
    const getDraws = async () => {
      try {
        const fetchedDraws = await firestore().collection('draws').get();
        const drawsData = fetchedDraws.docs.map(doc => doc.data());
        var editedDraws = drawsData.map((draw, index) => {
          return draw.locations.map(loc => {
            return loc.locations;
          });
        });
        setDraws(editedDraws);
        console.log('EDITEDDRAWSSSS!!!!', editedDraws);
        console.log('DRAWSSSS!!!!', draws);
      } catch (error) {
        console.log('ERRRRR', error);
      }
    };
    getDraws();
    getLocations();
  }, []);

  return (
    <View style={styles.container}>
      {Platform.OS == 'ios' && (
        <Button
          zIndex={1}
          position="absolute"
          bottom="5%"
          left="5%"
          onPress={() => {
            navigation.navigate('Home');
          }}>
          <Icon name="arrow-back-outline" size={26} color="#FFFFFF" />
        </Button>
      )}
      <GooglePlacesAutocomplete
        fetchDetails={true}
        GooglePlacesDetailsQuery={{fields: 'geometry'}}
        placeholder="Search"
        enablePoweredByContainer={false}
        textInputProps={{
          placeholderTextColor:'lightgray',
          clearButtonMode:'while-editing',
        }}
        
        onPress={(data, details = null) => {
          let loc = details.geometry.location;
          setCurrentLocation({
            latitude: loc.lat,
            longitude: loc.lng,
            latitudeDelta: 0.0922,
            longitudeDelta: 0.0421,
          });
        }}
        query={{
          key: 'AIzaSyAy4oXfhJeB9y-C5VM_vtEAj5v3MvMbHD8',
          language: 'en',
        }}
        styles={{
          container: {
            zIndex: 1,
          },
          textInputContainer: {
            backgroundColor: 'transparent',
            zIndex: 1,
            width: '100%',
            paddingHorizontal: 5,
            marginTop: getStatusBarHeight(),
          },
          textInput: {
            height: 38,
            color: '#000000',
            fontSize: 16,
            width: '100%',
          },
          listView: {
            zIndex: 1,
            paddingHorizontal: 5,
          },
        }}
        onFail={error => console.error(error)}
      />
      <MapView
        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
        style={styles.map}
        region={currentLocation}
        showsUserLocation={true}
        onLongPress={() => console.log('aaa')}>
        {locations.length > 0 &&
          locations.map((location, index) => {
            return location.locations.map(loc => (
              <Marker
                key={Math.floor(Math.random() * 10000)}
                coordinate={{
                  latitude: loc.locations.latitude,
                  longitude: loc.locations.longitude,
                }}
                title={loc.title}
                description={loc.description}>
                <Image
                  width={60}
                  height={90}
                  borderRadius="6"
                  resizeMode={'cover'}
                  alt="img"
                  source={{uri: loc.image}}
                />
              </Marker>
            ));
          })}

        {draws.length > 0 &&
          draws.map((draw, index) => (
            <Polyline
              key={index}
              coordinates={draw}
              strokeColor="#CAB2D6" // fallback for when `strokeColors` is not supported by the map-provider
              strokeColors={[
                '#7F0000',
                '#00000000', // no color, creates a "long" gradient between the previous and next coordinate
                '#B24112',
                '#E5845C',
                '#238C23',
                '#7F0000',
              ]}
              strokeWidth={10}
            />
          ))}
      </MapView>
    </View>
  );
};
export default Moments;
