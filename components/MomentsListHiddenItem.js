import { HStack, Icon, Pressable, Text, VStack } from 'native-base';
import React from 'react';
const MomentsListHiddenItem = (data, rowMap) => (
  <HStack flex="1" >
    <Pressable
      w="100"
      ml="auto"
      cursor="pointer"
      bg="red.500"
      justifyContent="center"
      onPress={() => console.log('add')}
      _pressed={{
        opacity: 0.5,
      }}>
      <VStack alignItems="center" space={2}>
        <Icon name="delete" color="white" size="xs" />
        <Text color="white" fontSize="xs" fontWeight="medium">
          Delete
        </Text>
      </VStack>
    </Pressable>
  </HStack>
);

export default MomentsListHiddenItem
