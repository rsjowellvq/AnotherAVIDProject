/**
 * @format
 */

import {AppRegistry, AppState, Platform} from 'react-native';
import App from './App';
import {name as appName} from './app.json';
import messaging from '@react-native-firebase/messaging';
import notifee from '@notifee/react-native';





messaging().setBackgroundMessageHandler(async remoteMessage =>{
    console.log("There was a message "+remoteMessage);
    notifee.displayNotification({
        title:"Notice",
        body:"The data is "+remoteMessage
    });
});




function HeadlessCheck()
{   
    notifee.displayNotification({
        title:"Notice",
        body:"The data is "+AppState.currentState
    });
    
   
    
    if(Platform.OS == 'ios' && AppState.currentState === 'background')
        return null;
    return <App />;
    
    
}
//console.log("HeadlessCheck");
AppRegistry.registerComponent(appName, () => HeadlessCheck);
