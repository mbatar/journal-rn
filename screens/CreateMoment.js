import React from 'react';
import {useNavigation} from '@react-navigation/native';
import MapView, {Marker, PROVIDER_GOOGLE} from 'react-native-maps'; // remove PROVIDER_GOOGLE import if not using Google Maps
import {GooglePlacesAutocomplete} from 'react-native-google-places-autocomplete';
import firestore from '@react-native-firebase/firestore';
import storage from '@react-native-firebase/storage';
import Geolocation from '@react-native-community/geolocation';
import Icon from 'react-native-vector-icons/Ionicons';
import MultipleImagePicker from '@baronha/react-native-multiple-image-picker';
import {Dimensions, Modal, StyleSheet} from 'react-native';
import ImageView from 'react-native-image-viewing';
import DatePicker from 'react-native-date-picker';
import {getStatusBarHeight} from 'react-native-status-bar-height';

import {
  FlatList,
  Button,
  Image,
  Input,
  TextArea,
  Box,
  Pressable,
} from 'native-base';

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  map: {
    ...StyleSheet.absoluteFillObject,
  },
});

function CreateMoment() {
  const [images, setImages] = React.useState([]);
  const [viewerIsOpen, setViewerIsOpen] = React.useState(false);
  const [showMap, setShowMap] = React.useState(false);
  const [date, setDate] = React.useState(new Date());
  const [moment, setMoment] = React.useState({
    type: 'moment',
    image: '',
    images: [],
  });
  const [markers, setMarkers] = React.useState([]);
  const [currentLocation, setCurrentLocation] = React.useState({
    latitude: 0,
    longitude: 0,
    latitudeDelta: 0,
    longitudeDelta: 0,
  });

  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  const navigation = useNavigation();
  const promises = [];

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

  navigation.setOptions({
    headerRight: () => (
      <>
        <Button onPress={openPicker} variant="ghost" bg="black">
          <Icon name="image-outline" size={26} color="#FFFFFF" />
        </Button>
        <Button onPress={() => setShowMap(true)} variant="ghost" bg="black">
          <Icon name="map-outline" size={26} color="#FFFFFF" />
        </Button>
      </>
    ),
  });
  const openPicker = async () => {
    try {
      const response = await MultipleImagePicker.openPicker({
        selectedAssets: images,
        isExportThumbnail: true,
        maxVideo: 1,
        usedCameraButton: true,
        isCrop: false,
        isCropCircle: true,
      });
      console.log('response: ', response);
      setImages(response);
      setMoment(v => {
        setMoment({...moment, images: response});
      });
    } catch (e) {
      console.log(e.code, e.message);
    }
  };

  const selectLocation = e => {
    var coordinat = e.nativeEvent.coordinate;
    setMarkers(v => {
      return [
        ...v,
        {latitude: coordinat.latitude, longitude: coordinat.longitude},
      ];
    });
  };
  const createMoment = async () => {
    try {
      const createdDoc = await firestore().collection('moments').add(moment);

      const promises = images.map(file => {
        const ref = storage()
          .ref()
          .child(
            `${createdDoc.id}/${file.localIdentifier}localId${file.fileName}`,
          );
        return ref.putFile(file.path).then(() => ref.getDownloadURL());
      });

      const fileDownloadUrls = await Promise.all(promises);
      firestore()
        .collection('moments')
        .doc(createdDoc.id)
        .update({image: fileDownloadUrls[0]})
        .then(res => {
          const editedLocations = markers.map(marker => ({
            title: moment.name,
            locations: {latitude: marker.latitude, longitude: marker.longitude},
            description: moment.note,
            image:
              fileDownloadUrls[
                Math.floor(Math.random() * fileDownloadUrls.length)
              ],
          }));
          console.log('EDITEDLOCS', editedLocations);
          firestore()
            .collection('locations')
            .doc(createdDoc.id)
            .set({
              locations: editedLocations,
            })
            .then(res => console.log('LOCRES', res))
            .catch(err => console.log('LOCRESERR', err));
        });

      navigation.navigate('Home');
    } catch (error) {
      console.log(error);
    }
  };

  const onDelete = value => {
    const data = images.filter(
      item =>
        item?.localIdentifier &&
        item?.localIdentifier !== value?.localIdentifier,
    );
    setImages(data);
  };
  const renderItem = ({item, index}) => {
    return (
      <Box key={item.uri}>
        <Pressable onPress={() => setViewerIsOpen(true)}>
          <Image
            size={windowWidth / 3}
            resizeMode={'cover'}
            alt="img"
            source={{
              uri:
                item?.type === 'video'
                  ? item?.thumbnail ?? ''
                  : item?.crop?.cropPath ?? item.path,
            }}
          />
        </Pressable>
      </Box>
    );
  };
  return (
    <Box flex={1} justifyContent="space-around">
      <Modal
        animationType="slide"
        visible={showMap}
        style={{height: 100, backgroundColor: 'black', zIndex: 9999999}}
        onRequestClose={() => {
          setShowMap(false);
        }}>
        <GooglePlacesAutocomplete
          placeholder="Search"
          fetchDetails={true}
          GooglePlacesDetailsQuery={{fields: 'geometry'}}
          enablePoweredByContainer={false}
          textInputProps={{
            placeholderTextColor: 'lightgray',
            clearButtonMode: 'while-editing',
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
        />
        <MapView
          provider={PROVIDER_GOOGLE} // remove if not using Google Maps
          style={styles.map}
          region={currentLocation}
          showsUserLocation={true}
          onLongPress={selectLocation}>
          {markers.length > 0 &&
            markers.map((marker, index) => (
              <Marker
                key={index}
                tappable
                onPress={e => {
                  setMarkers(
                    markers.filter(item => {
                      return (
                        item.longitude != e.nativeEvent.coordinate.longitude &&
                        item.latitude != e.nativeEvent.coordinate.latitude
                      );
                    }),
                  );
                }}
                coordinate={{
                  latitude: marker.latitude,
                  longitude: marker.longitude,
                }}
                title={'Title'}
                description={'Description'}
              />
            ))}
        </MapView>
      </Modal>
      <Box flex={1} mb={5} mx={2}>
        {images.length > 0 && (
          <>
            <ImageView
              images={images.map(item => ({
                uri:
                  item?.type === 'video'
                    ? item?.thumbnail ?? ''
                    : item?.crop?.cropPath ?? item.path,
              }))}
              imageIndex={0}
              visible={viewerIsOpen}
              onRequestClose={() => setViewerIsOpen(false)}
            />
            <FlatList
              data={images}
              numColumns={3}
              renderItem={renderItem}
              keyExtractor={(item, index) =>
                (item?.filename ?? item?.path) + index
              }
              showsVerticalScrollIndicator={false}
            />
          </>
        )}
      </Box>

      <Input
        h={10}
        mx={2}
        mb={5}
        placeholder="Başlık"
        color="light.100"
        onChangeText={val => {
          setMoment({...moment, name: val});
        }}
      />
      <TextArea
        h={20}
        placeholder="Ne kadar mükemmel? 😊"
        mx={2}
        mb={5}
        color="light.100"
        onChangeText={val => {
          setMoment({...moment, note: val});
        }}
      />

      <DatePicker
        fadeToColor="black"
        style={{width: windowWidth}}
        textColor="#ffffff"
        mode="date"
        androidVariant="iosClone"
        date={date}
        onDateChange={val =>
          setMoment({...moment, date: new Date(val).getTime()})
        }
      />

      <Button
        bg="black"
        size="lg"
        mt={5}
        mb={10}
        py={3}
        mx={2}
        onPress={createMoment}>
        Oluştur
      </Button>
    </Box>
  );
}

export default CreateMoment;
