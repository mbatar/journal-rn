import * as React from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  Avatar,
  Box,
  HStack,
  Pressable,
  Spacer,
  Text,
  VStack,
} from 'native-base';
const MomentsListItem = ({item, index}) => {
  const navigation = useNavigation();
  return (
    <Box>
      <Pressable
        onPress={() => navigation.navigate('MomentDetails', {moment: item})}
        bg="black">
        <Box pl="4" pr="5" py="2">
          <HStack alignItems="center" space={3}>
            <Avatar
              size="48px"
              source={{
                uri: item.image,
              }}
            />
            <VStack>
              <Text
                _dark={{color:"red.100"}}
                bold>
                {item.name}
              </Text>
              <Text
              _dark={{
                color: "red.400"
              }}
               >
                {item.note}
              </Text>
            </VStack>
            <Spacer />
            <Text
              fontSize="xs"
              color="coolGray.800"
              _dark={{
                color: 'warmGray.50',
              }}
              alignSelf="flex-start">
              {new Date(item.date).toDateString()}
            </Text>
          </HStack>
        </Box>
      </Pressable>
    </Box>
  );
};

export default MomentsListItem;
