import * as React from 'react';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import CreateMoment from '../screens/CreateMoment';
import EditMoment from '../screens/EditMoment';
import Home from '../screens/Home';
import Moments from '../screens/Moments';
import {useNavigation} from '@react-navigation/native';
import MomentDetails from '../screens/MomentDetails';
import {AppContext} from '../context';
import {Button, CheckIcon, AddIcon} from 'native-base';
import Icon from 'react-native-vector-icons/Ionicons';

const Stack = createNativeStackNavigator();

function StackNavigation() {
  const {lastPosition, setLastPosition} = React.useState(null);
  const appContext = React.useContext(AppContext);

  const navigation = useNavigation();
  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: appContext.trackingIsActive ? '#CAB2D6' : '#000000',
        },
      }}>
      <Stack.Screen
        name="Home"
        component={Home}
        options={{
          title: 'Yağmurun Defteri 🌻',
          headerTitleAlign: 'center',
          headerRight: () => (
            <>
              <Button
              bg="black"
                onPress={() => navigation.navigate('CreateMoment')}
                variant="ghost">
                <Icon name="add-outline" size={30} color="#FFFFFF" />
              </Button>
            </>
          ),
          headerLeft: () => (
            <>
              <Button bg="black"  onPress={appContext.toggleTracking} variant="ghost">
                🤸🏿‍♀️
              </Button>
            </>
          ),
        }}
      />
      <Stack.Screen
        name="Moments"
        component={Moments}
        options={{headerShown: false}}
      />
      <Stack.Screen
        name="CreateMoment"
        component={CreateMoment}
        options={{
          title: 'Anı Oluştur',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="EditMoment"
        component={EditMoment}
        options={{
          title: 'Anı Düzenle',
          headerTitleAlign: 'center',
        }}
      />
      <Stack.Screen
        name="MomentDetails"
        component={MomentDetails}
        options={{
          title: 'Anı',
          headerTitleAlign: 'center',
        }}
      />
    </Stack.Navigator>
  );
}

export default StackNavigation;
