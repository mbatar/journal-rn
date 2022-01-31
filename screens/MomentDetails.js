import React from 'react';
import {useNavigation, useRoute} from '@react-navigation/native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import {Dimensions} from 'react-native';
import ImageView from 'react-native-image-viewing';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Geolocation from '@react-native-community/geolocation';
import {
  Box,
  Button,
  Image,
  Pressable,
  Text,
  FlatList,
  ScrollView,
} from 'native-base';
import Icon from 'react-native-vector-icons/Ionicons';

const windowWidth = Dimensions.get('window').width;
const windowHeight = Dimensions.get('window').height;

function MomentDetails() {
  const navigation = useNavigation();
  const route = useRoute();
  const [viewerIsOpen, setViewerIsOpen] = React.useState(false);
  const [currentPhoto, setCurrentPhoto] = React.useState(0);
  const [images, setImages] = React.useState([]);
  const [locations, setLocations] = React.useState([]);
  const [currentLocation, setCurrentLocation] = React.useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0,
    longitudeDelta: 0,
  });

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
      error => Alert.alert('Error', JSON.stringify(error)),
      {enableHighAccuracy: true, timeout: 20000, maximumAge: 1000},
    );
  }, []);
  React.useEffect(() => {
    const getImages = async () => {
      try {
        var storageRef = storage().ref(route.params.moment.id);
        let result = await storageRef.listAll();

        let urlPromises = result.items.map((item, index) => {
          return item
            .getDownloadURL()
            .then(res => {
              var obj = {
                id: index,
                uri: res,
                fileName: item.name.split('localId')[1],
                path: `content://media/external/images/media/${
                  item.name.split('localId')[0]
                }`,
              };
              return obj;
            })
            .catch(error => console.log(error));
        });

        const imageRes = await Promise.all(urlPromises);
        setImages(imageRes);
      } catch (error) {
        console.log(error);
      }
    };

    const getLocations = async () => {
      try {
        const fetchedLocations = await firestore()
          .collection('locations')
          .doc(route.params.moment.id)
          .get();
        setLocations(fetchedLocations.data().locations);
      } catch (error) {
        console.log('ERRRRR', error);
      }
    };
    getLocations();
    getImages();
  }, []);
  navigation.setOptions({
    headerRight: () => (
      <Button
        variant="ghost"
        onPress={() =>
          {
            console.log('IMAGES',images)
            navigation.navigate('EditMoment', {momentProp: route.params.moment,momentImages:images,momentLocations:locations})
          }
        }>
        <Icon name="create-outline" size={28} color="#FFFFFF" />
      </Button>
    ),
  });
  const showViewer = (type, imgIndex) => {
    setCurrentPhoto(imgIndex);
    setViewerIsOpen(type);
  };
  const renderItem = ({item, index}) => {
    // console.log('ITEM',item)
    return (
      <Box key={item.uri}>
        <Pressable onPress={() => showViewer(true, item.id)}>
          <Image
            size={windowWidth / 3}
            resizeMode={'cover'}
            alt="img"
            source={{
              uri: item.uri,
            }}
          />
        </Pressable>
      </Box>
    );
  };
  return (
    <Box flex={1} mx={2}>
      <Box style={{height: 220}}>
        <ImageView
          images={images.map(res => ({uri: res.uri}))}
          imageIndex={currentPhoto}
          visible={viewerIsOpen}
          onRequestClose={() => setViewerIsOpen(false, 0)}
        />
        <FlatList
          data={images}
          numColumns={3}
          renderItem={renderItem}
          style={{maxHeight: 220}}
        />
      </Box>
      <MapView
        provider={PROVIDER_GOOGLE} // remove if not using Google Maps
        style={{height: 380, width: windowWidth}}
        region={
          locations.length > 0
            ? {
                latitude: locations[0].locations.latitude,
                longitude: locations[0].locations.longitude,
                latitudeDelta: 0.0922,
                longitudeDelta: 0.0421,
              }
            : currentLocation
        }
        showsUserLocation={true}>
        {locations.length > 0 &&
          locations.map((location, index) => (
            <Marker
              key={index}
              coordinate={{
                latitude: location.locations.latitude,
                longitude: location.locations.longitude,
              }}
              title={location.title}
              description={location.description}>
              <Image
                width={60}
                height={90}
                borderRadius="6"
                resizeMode={'cover'}
                alt="img"
                source={{uri: location.image}}
              />
            </Marker>
          ))}
      </MapView>
      <Box my={2} bg="#161b22">
        <Text padding={2} color="light.100">
          {route.params.moment.name}
        </Text>
      </Box>
      <ScrollView bg="#161b22">
        <Text padding={2} color="light.100">
          {route.params.moment.note}
        </Text>
      </ScrollView>
    </Box>
  );
}

export default MomentDetails;
