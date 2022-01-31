import React from 'react';
import {useNavigation} from '@react-navigation/native';
import {ScrollView, View,Dimensions} from 'react-native';
import firestore from '@react-native-firebase/firestore';

import {
  Text,
  Button,
  Box,
  HStack,
  VStack,
  Avatar,
  Spacer,
  Pressable,
} from 'native-base';
import {SwipeListView} from 'react-native-swipe-list-view';
import Icon from 'react-native-vector-icons/Ionicons';

function Home() {
  const navigation = useNavigation();
  const [moments, setMoments] = React.useState([]);
  const getMoments = async () => {
    try {
      const fetchedMoments = await firestore().collection('moments').get();

      setMoments(
        fetchedMoments.docs.map(fm => {
          return {
            ...fm.data(),
            id: fm.id,
            key: fm.id,
          };
        }),
      );
    } catch (error) {
      console.log(error);
    }
  };
  const deleteMoment = async id => {
    const res = await firestore().collection('moments').doc(id).delete();
  };
  React.useEffect(() => {
    getMoments();
    firestore()
      .collection('moments')
      .where('type', '==', 'moment')
      .onSnapshot(querySnapshot => {
        querySnapshot.docChanges().forEach(change => {
          if (change.type == 'added') {
          }
          getMoments();
        });
      });
  }, []);
  const windowWidth = Dimensions.get('window').width;
  const windowHeight = Dimensions.get('window').height;
  return (
    <View style={{position: 'relative', flex: 1}}>
      {moments.length ? (
        <ScrollView showsVerticalScrollIndicator={false}>
          <Box flex="1">
            <SwipeListView
              data={moments}
              keyExtractor={item => item.id}
              renderItem={({item, index}) => {
                console.log('ITEM',item)
                return (
                  <Box>
                    <Pressable
                      onPress={() =>
                        navigation.navigate('MomentDetails', {moment: item})
                      }
                      bg="black">
                      <Box pl="4" pr="5" py="2">
                        <HStack alignItems="center" space={3}>
                          <Avatar
                            size="48px"
                            source={{
                              uri: item.image ? item.image : 'https://i.pravatar.cc/300',
                            }}
                          />
                          <VStack>
                            <Text
                              color="light.100"
                              _dark={{
                                color: 'light.100',
                              }}
                              bold>
                              {item.name}
                            </Text>
                            <Text
                              color="light.100"
                              _dark={{
                                color: 'light.100',
                              }}>
                              {item.note}
                            </Text>
                          </VStack>
                          <Spacer />
                          <Text
                            fontSize="xs"
                            color="light.100"
                            _dark={{
                              color: 'light.100',
                            }}
                            alignSelf="flex-start">
                            {new Date(item.date).toDateString()}
                          </Text>
                        </HStack>
                      </Box>
                    </Pressable>
                  </Box>
                );
              }}
              renderHiddenItem={(data, rowMap) => (
                <HStack flex="1">
                  <Pressable
                    w="100"
                    ml="auto"
                    cursor="pointer"
                    bg="red.500"
                    justifyContent="center"
                    onPress={() => deleteMoment(data.item.id)}
                    _pressed={{
                      opacity: 0.5,
                    }}>
                    <VStack alignItems="center" space={2}>
                      <Icon name="trash-outline" size={26} color="#FFFFFF" />
                    </VStack>
                  </Pressable>
                </HStack>
              )}
              rightOpenValue={-130}
              previewRowKey={'0'}
              previewOpenValue={-40}
              previewOpenDelay={3000}
              disableRightSwipe={true}
            />
          </Box>
        </ScrollView>
      ) : (
        <Text>Yok</Text>
      )}
      <Button
        onPress={() => {
          navigation.navigate('Moments');
        }}
        position="absolute"
        bottom="8%"
        right="5%"
        zIndex={9}
        rounded="full"
        width={60}
        height={60}
        bg="#CAB2D6">
        <Icon name="map-outline" size={26} color="#FFFFFF" />
      </Button>
    </View>
  );
}

export default Home;
