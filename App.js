import 'react-native-gesture-handler';
import { NavigationContainer, StackActions, CommonActions } from '@react-navigation/native';

import { createDrawerNavigator, DrawerContentScrollView, DrawerItem } from '@react-navigation/drawer';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import { createStackNavigator, HeaderBackButton } from '@react-navigation/stack';
import BleManager, { read, setName,checkState } from 'react-native-ble-manager';
import React, { useCallback,useEffect,useRef } from 'react';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import BackgroundFetch from "react-native-background-fetch";
import BackgroundTimer from 'react-native-background-timer';
import notifee from '@notifee/react-native';
//import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import {Buffer} from 'buffer';
import {
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Pressable,
  Modal,
  TextInput,
  Button,
  TouchableOpacity,
  KeyboardAvoidingView,
  Keyboard,
  NativeModules,
  NativeEventEmitter,
  TouchableWithoutFeedback,
  Image,
  useColorScheme,
  View,
  requireNativeComponent,
  TouchableHighlight,
} from 'react-native';
import { acc, add } from 'react-native-reanimated';
import { emit } from 'process';
import { stat } from 'fs';

const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
const userAccountPtr = firestore().collection("User Accounts");
var appVersion = '1.1.0';
var usageRecords = [];
var qeustionRecords = [];
var currentUserData;
var userDeviceInfo;
const languages = ['English','Spanish','French','German'];
const lastMemoryAddress = [3,128];
var currentConnectedDeviceID;
const months = ["Jan.","Feb.","Mar.","Apr.","May.","Jun.","Jul.","Aug.","Sept.","Oct.","Nov.","Dec."];
const avidPurpleHex = '#722053';
const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);

var configArray;
//var lastUsageAddress;
var lastBackgroundUploadTime;
var usageArray = [];
var masterPresetArray = [];
//var backgroundInitiated = false;
//var isBackgroundScan = false;
var answers = [0,1,2,3,4,5,6,7,8,9,10,'N','Y','NA','S','default'];


const styles = StyleSheet.create({
  
    loginScreen:{
      justifyContent: 'center',
      alignItems: 'center',
      height:'100%',
      backgroundColor:'white',
      
  
    },
    headerBarStyle:
    {
      
    },
    centeredView: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: 22,
    },
    modalView: {
      margin: 20,
      backgroundColor: 'white',
      borderRadius: 20,
      padding: 35,
      alignItems: 'center',
      shadowColor: '#000',
      shadowOffset: {
        width: 0,
        height: 2,
      },
      shadowOpacity: 0.25,
      shadowRadius: 4,
      elevation: 5,
    },
    
    
    sectionContainer: {
      marginTop: 32,
      paddingHorizontal: 24,
    },
    sectionTitle: {
      fontSize: 24,
      fontWeight: '600',
    },
    sectionDescription: {
      marginTop: 8,
      fontSize: 18,
      fontWeight: '400',
    },
  
    highlight: {
      fontWeight: '700',
    },
  
    loginScreenImage:
    {
      width: '60%',
      resizeMode:'contain',
      marginBottom:'10%'
    },
  
    grayButton:
    {
      fontFamily:'Proxima Nova',
      fontSize:15,
      fontWeight:'bold',
      color:'gray'
    },
    purpleButton:
    {
      fontFamily:'Proxima Nova',
      fontSize:17,
      fontWeight:'bold',
      color:'#722053'
    },
    dayUsageRow:
    {
      backgroundColor:'#e0ecff',
      fontSize:20
     
  
    },
  
    
  
      textFields:{
        borderBottomWidth: 1,
        borderColor: 'lightgray',
        height: 30,
        color: 'gray',
     
        fontFamily:'Verdana-bold',
        marginBottom: '6%'
      },
    
      loginLabels:
      {
        fontSize: 20,
        fontFamily: 'Proxima Nova',
        fontWeight:'400',
        color: 'black'
      },
      usageDetailLabels:
      {
        fontSize:16,
        color: '#555555',
        fontWeight:'bold',
        flex:2,
        alignSelf:'flex-start'
      },
      usageDetailData:
      {
        fontSize:16,
        color: '#969696',
        flex:1,
        fontWeight:'bold',
        alignSelf:'flex-end',
        textAlign:'right'
      },
      usageDataDetailCell:
      {
        padding:'3%',
        flexDirection:'row',
        alignContent:'stretch'
      },
      signUpLabels:
      {
        fontSize: 15,
        fontFamily: "Verdana-Bold",
        color:'gray',
        marginBottom:'3%'
        
      },
    
      forgotLabels:
      {
        color: 'lightgray'
      }

  });
  function changeNumBase(number)
  {
    let hexStr = number.toString(16);
    if(hexStr.length ==1){
        hexStr = '0'+hexStr;
    }
    return hexStr;
  }

  function generateDateTimeString(year,month,day,hour,minute)
{
  var dateString = months[month-1]+" "+day+" 20"+year;
  var timeString= "";
  if(hour == 0 || hour == 12)
  {
    timeString+="12";
  }
  else if(hour > 12)
  {
    if(hour % 12 < 10)
      timeString += "0"+(hour%12).toString();
    else
      timeString += (hour%12).toString();
  }
  else
  {
    timeString += hour.toString();
  }
  if(minute < 10)
    minute = "0"+minute;
  timeString += ":"+minute+" ";
  if(hour < 12)
    timeString += "AM";
  else
    timeString += "PM";

  return [dateString,timeString];
//return months[month]+" "+day+" 20"+year+" "+(hour%13).toString()
}
function calculation(add_0,add_1)
{
  return parseInt( (changeNumBase(add_1)+ changeNumBase(add_0)) ,16);
} 

  function convertDateStringForCompare(year,month,day,hour,minute)
  {
    var returnString = "";
    returnString += "20"+year+"-";
    if(month < 10)
      returnString += "0"+month+"-";
    else
      returnString += month+"-";
    
    if(day < 10)
      returnString += "0"+day+" ";
    else
      returnString += day+" ";
  
    if(hour<10)
      returnString += "0"+hour+":";
    else
      returnString += hour+":";
  
    if(minute<10)
      returnString += "0"+minute;
    else
      returnString += minute;
  
    return returnString;
  
  }


var usageCount = 0;
var questionCount = 0;
var lastUsageAddress;
  


  function showNotifiction(titleInput,bodyInput)
  {
    notifee.requestPermission().then(()=>{

      notifee.displayNotification({
        title:titleInput,
        body:bodyInput
  
      });

    });
    
  }
  
  var foundDevice = false;
  function discoveredDevice(peripheral)
  {
    if(peripheral.name != null && peripheral.advertising.localName == "Avid F001451")
    {
      console.log("We found "+peripheral.advertising.localName);
      foundDevice = true;


      BleManager.stopScan().then(()=>{

        console.log("Pigs In A Blanket");
        getDeviceData(peripheral,[0,0]).then(()=>{
          showNotifiction("Upload Complete!","We uploaded "+usageCount.toString()+" usage records and "+questionCount.toString()+" records to your account!");
          const now = new Date();
          AsyncStorage.setItem("Last Upload Time",now.toString());
        }).catch((error)=>{
          showNotifiction("Upload Error","There was a problem with your upload. We'll try again later!");
        });
        
        
        

      });
      //showNotifiction("Success","We Found Device "+peripheral.name);


      //getDeviceData(peripheral,[0,0]);
      



      
      
    }
  }




 
  

  
 

/*
function processForegrouondApp()
{
  console.log("PRocess HEre!");
}
*/

 const App = () => {

  
  
  //Start Bluetooth Manager
    React.useEffect(()=>{BleManager.start();});
    
    console.log("Hello");

  
   
  
    //initBackgroundFetch();  
  
   
/*
var isScanning = false;

function discoveredDevice(peripheral)
{
  if(peripheral.name != null && peripheral.name.substring(0,4) == "Avid")
    console.log("We found "+peripheral.name);
    BleManager.stopScan();
}

function lookForDevice()
{
  while(new Date().getMinutes() % 10 !=0)
  {

  }
}
   
function searchForDevices(){
    
      if(isScanning || new Date().getMinutes() % 10 !=0)
      {
        console.log("The Time Is "+new Date().getMinutes());
        return;
      }
        
      
      console.log("Time Is "+new Date().getMinutes());
      isScanning = true;
  
      console.log("Scan Has Begun");
      bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
      bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',discoveredDevice);

      BleManager.scan([],4200,false);

}
    



BackgroundTimer.runBackgroundTimer(searchForDevices,5000);
*/


React.useEffect(()=>{
  showNotifiction("Hello","We're Here");
  return ()=>{
    console.log("It was closed");
    showNotifiction("Notice","AVID App was closed. BG download cancelled");
  }

},[]);






    console.log("boobs");


    const MainStack = ({route,navigation}) => (

    
        <Drawer.Navigator initialRouteName='HOME' screenOptions={{drawerActiveTintColor:'white',drawerInactiveTintColor:'white',  drawerStyle:{drawerActiveTintColor:'yellow',  backgroundColor: avidPurpleHex}}}>
        
        <Drawer.Screen name="HOME" component={MainScreen} initialParams={{calendarInfo:route.params.calendarInfo,serialNumber:route.params.serialNumber,from:route.params.from}}/>
        <Drawer.Screen name="USAGE SUBSTACK" component={UsageHistoryStack} options={{drawerItemStyle:{display:"none"},unmountOnBlur:true,headerShown:false}}/>
        
       {/*} <Drawer.Screen name="LOGOUT" component={LoginScreen} options={{headerShown:false}} initialParams={{from:"logout",nextScreen:"HOME"}}/>*/}
        <Drawer.Screen name ="LOGOUT" component={LogoutStack}/>
        
  
      </Drawer.Navigator>
    
       );

      const LogoutStack = ({route,navigation}) => {

        
        navigation.dispatch(

          CommonActions.reset({
            index:0,
            routes:[{name:"Login"}]
          })
    
        );
        //nextLoginScreen = "HOME";
        console.log("Logout PRocess");
        const logoutRequestOptions = {
          
          method:'POST',
          headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
          body: 'action=signOut&+uid='+currentUserData.uid+"&appversion="+appVersion
          //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
    
    
        };
        console.log("step 1");
        fetch("https://avid.vqconnect.io/nodejs/login",logoutRequestOptions).then((response)=>response.json())
        .then((responseJson)=>{
          currentUserData = null;
          console.log("step 122");
          BleManager.getConnectedPeripherals([]).then((peripheralArray)=>{
            if(peripheralArray.length != 0)
              BleManager.disconnect();
          }).catch(error=>{console.log(error)});
          console.log("step 33");
          //route.params=null;
          if(auth().currentUser)
            auth().signOut();
          console.log("Step 444 ");
          //setNextNavScreen("HOME");
          //route.params.nextScreen = "HOME";
          
          
          
        }).catch((error)=>{console.log(error)});
        
        //return(<DrawerItem label="LoGoUt" onPress={()=>{console.log("Button Was Pressed!!")}} />);

      }

       const UsageHistoryStack = ({route,navigation}) => {

    
    
        function convertDateString(input)
        {
          const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
          return months[parseInt(input.substring(6,7))-1]+" "+input.substring(8,10)+", "+input.substring(0,4);
        }
        
        
        
        return(<Stack.Navigator initialRouteName='Day Use Screen' >
        
        
        <Stack.Screen name="Day Use Screen" options={{headerStyle:{backgroundColor:avidPurpleHex},headerTintColor:'white',title: convertDateString(route.params.currentDate), headerShown:true, headerLeft: ()=>(<TouchableOpacity onPress={()=>{navigation.navigate("HOME");}}><Text style={{fontWeight:'bold',fontSize:17,color:'white'}}>&nbsp;&lt; Back</Text></TouchableOpacity>    ),}}  initialParams={{currentDate:route.params.currentDate,from:route.params.from}} component={DayUsageScreen}/>
        <Stack.Screen name="Usage Data Detail" component={UsageDetailScreen} options={{headerStyle:{backgroundColor:avidPurpleHex},headerTintColor:'white',drawerItemStyle:{display:'none'}}}/>
       
        </Stack.Navigator>);
      
       };
      
    console.log("burgers");
      return(
          <NavigationContainer>
        <Stack.Navigator initialRouteName="Login">
          <Stack.Screen name="Login" component={LoginScreen} options={{unmountOnBlur:true,headerShown:false}}/>
          <Stack.Screen name="Forgot Username" component={ForgotUsernameScreen} options={{headerStyle:{backgroundColor:avidPurpleHex},headerTintColor:'white',backgroundColor:'white'}}/>
          <Stack.Screen name="Forgot Password" component={ForgotPasswordScreen} options={{headerStyle:{backgroundColor:avidPurpleHex},headerTintColor:'white',backgroundColor:'white'}}/>
          <Stack.Screen name="Sign Up" component={SignupScreen} options={{headerStyle:{backgroundColor:avidPurpleHex},headerTintColor:'white',backgroundColor:'white'}}/>
          <Stack.Screen name="Main" component={MainStack} options={{headerShown:false}}/>
          <Stack.Screen name="Select Device" component={DeviceSelection} options={{headerStyle:{backgroundColor:avidPurpleHex},headerTintColor:'white'}}/>
        </Stack.Navigator>
        </NavigationContainer>
      )

}


const DayUsageScreen = ({route,navigation}) => {

  
    const [tableData,setTableData] = React.useState([[]]);
    const [dataLoaded,setDataLoaded] =React.useState(false);
    const [date,setDate] = React.useState("");
    const [questionHeight,setQuestionHeight] = React.useState(40);
    const [usageHeight,setUsageHeight] = React.useState(40);

    const [usageBtnTxtClr,setUsageBtnTxtClr] = React.useState('#555555');
    const [usageBtnBkgrndClr,setUsageBtnBkgrndClr] = React.useState('white');
    const [questionBtnBkgrndClr,setQuestionBtnBkgrndClr] = React.useState('white');
    const [questionBtnTxtClr,setQuestionBtnTxtClr] = React.useState('#555555');
    const [allBtnBkgrndClr,setAllBtnBkgrndClr] = React.useState(avidPurpleHex);
    const [allBtnTxtClr,setAllBtnTxtClr] = React.useState('white');
    
    
    var usageData=null;
    var tableInfo=[];
    

    fetch("https://avid.vqconnect.io/nodejs/userList?action=findUserUsageDataByDay&dayTime="+route.params.currentDate+"&uid="+currentUserData.uid+"&token="+currentUserData.token).then((response)=>response.json()).then((responseJson)=>{

    usageData = responseJson.data;
    console.log(usageData);
    for(var x = 0;x < responseJson.data.length;x++)
      {
        console.log(responseJson.data[x]);
        var currentObj = [];
        currentObj.push(responseJson.data[x].DateOfTreatment.substring(0,11));
        currentObj.push(responseJson.data[x].TimeOfTreatment);
        if(responseJson.data[x].Type == "U")
        {
          currentObj.push(responseJson.data[x].PresetNumber);
          currentObj.push(responseJson.data[x].MinOfUse);
        }
        else
        {
          currentObj.push("");
          currentObj.push("");
        }
        currentObj.push(">");
        //var currentElement = <Row data={["A","B"]} style={{backgroundColor:currentColor}}></Row>
        tableInfo.push(currentObj);
      }
      if(dataLoaded == false)
      {
        setDataLoaded(true);
        setTableData(tableInfo);
      }


    });

    function setButtons(sender)
    {
      if(sender == "Usage")
      {
        setAllBtnBkgrndClr("white");
        setAllBtnTxtClr("#555555");
        setQuestionBtnBkgrndClr("white");
        setQuestionBtnTxtClr("#555555");
        setUsageBtnBkgrndClr(avidPurpleHex);
        setUsageBtnTxtClr("white");
      }
      if(sender == "Question")
      {
        setAllBtnBkgrndClr("white");
        setAllBtnTxtClr("#555555");
        setQuestionBtnBkgrndClr(avidPurpleHex);
        setQuestionBtnTxtClr("white");
        setUsageBtnBkgrndClr("white");
        setUsageBtnTxtClr("#555555");
        
      }
      if(sender == "All")
      {
        setAllBtnBkgrndClr(avidPurpleHex);
        setAllBtnTxtClr("white");
        setQuestionBtnBkgrndClr("white");
        setQuestionBtnTxtClr("#555555");
        setUsageBtnBkgrndClr("white");
        setUsageBtnTxtClr("#555555");
      }
    }
    
    return(<View>
    <View style={{alignSelf:'center',  flexDirection:'row',padding:'5%'}}>
    <TouchableOpacity onPress={()=>{setButtons("Usage");setQuestionHeight(0);setUsageHeight(40);}} style={{flex:1,borderWidth:1,borderColor:avidPurpleHex,backgroundColor:usageBtnBkgrndClr}}><Text style={{padding:'4%',alignSelf:'center', fontSize:16,fontWeight:'bold',color:usageBtnTxtClr}}>Usage</Text></TouchableOpacity>
    <TouchableOpacity onPress={()=>{setButtons("Question");setQuestionHeight(40);setUsageHeight(0);}} style={{flex:1,borderWidth:1,borderColor:avidPurpleHex,backgroundColor:questionBtnBkgrndClr}}><Text style={{padding:'4%',alignSelf:'center',fontSize:16,fontWeight:'bold',color:questionBtnTxtClr}}>Question</Text></TouchableOpacity>
    <TouchableOpacity onPress={()=>{setButtons("All");setQuestionHeight(40);setUsageHeight(40);}} style={{flex:1,borderWidth:1,borderColor:avidPurpleHex,backgroundColor:allBtnBkgrndClr}}><Text style={{padding:'4%',alignSelf:'center',fontSize:16,fontWeight:'bold',color:allBtnTxtClr}}>All</Text></TouchableOpacity>
   
    </View>
    <Table>
      <Row textStyle={{fontSize:16,fontWeight:'bold',color:'#555555',textAlign:'center'}} data={["Date","Time","Preset#","Minutes of Use",""]}></Row>
      <ScrollView>
    {
      tableData.map((rowData,index) => (

        <TouchableOpacity buttonKey={index} onPress={()=>{var boolVal;if(index%2==0){boolVal=true;}else{boolVal=false;}navigation.navigate("Usage Data Detail",{dataObject:usageData[index],isUsage:boolVal});}}>
        <Row textStyle={{fontSize:16,fontWeight:'bold',color:'#555555',textAlign:'center'}} key={index} data={rowData} style={[styles.dayUsageRow,{height:usageHeight,backgroundColor:'#d9fae9'},index%2 && {height:questionHeight,backgroundColor:'#e0ecff'}]} />
        </TouchableOpacity>

      ))
    }</ScrollView>


      
    </Table>
   
  </View>);
    


} //End Day Usage Screen


const UsageDetailScreen = ({route,navigation}) => {

  const currentData = route.params.dataObject;
  //console.log("Info Is "+route.params.isUsage);


  return(
    <View style={{width:'100%'}}>
    <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Date</Text><Text style={styles.usageDetailData}>{currentData.DateOfTreatment}</Text></View>
    <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Time</Text><Text style={styles.usageDetailData}>{currentData.TimeOfTreatment}</Text></View>
    {route.params.isUsage == true &&
    <View>
    <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Preset</Text><Text style={styles.usageDetailData}>{currentData.PresetNumber}</Text></View>
    <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Device Pause Time</Text><Text style={styles.usageDetailData}>{currentData.MinOfPause}</Text></View>
    <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Channel 1 max Amp used</Text><Text style={styles.usageDetailData}>{currentData.Channel1MaxAmpUsed}</Text></View>
    <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Channel 1 average Amp used</Text><Text style={styles.usageDetailData}>{currentData.Channel1AverageAmpUsed}</Text></View>
    <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Channel 2 max Amp used</Text><Text style={styles.usageDetailData}>{currentData.Channel2MaxAmpUsed}</Text></View>
    <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Channel 2 average Amp used</Text><Text style={styles.usageDetailData}>{currentData.Channel2AverageAmpUsed}</Text></View>
    <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Minutes of Use</Text><Text style={styles.usageDetailData}>{currentData.MinOfUse}</Text></View>
</View>}
{route.params.isUsage == false &&
<View>
  <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Q1 Pain Before</Text><Text style={styles.usageDetailData}>{currentData.PainBefore}</Text></View>
  <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Q2 Decr Meds</Text><Text style={styles.usageDetailData}>{currentData.DecrMeds}</Text></View>
  <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Q3 Help Work</Text><Text style={styles.usageDetailData}>{currentData.HelpWork}</Text></View>
  <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Q4 Help Home</Text><Text style={styles.usageDetailData}>{currentData.HelpHome}</Text></View>
  <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Q5 Pain After</Text><Text style={styles.usageDetailData}>{currentData.PainAfter}</Text></View>
</View>


}
    <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Address</Text><Text style={styles.usageDetailData}>{currentData.Address}</Text></View>
    <View style={styles.usageDataDetailCell}><Text style={styles.usageDetailLabels}>Upload Time</Text><Text style={styles.usageDetailData}>{currentData.uploadTime}</Text></View>
    
    </View>

  );


}


const ForgotPasswordScreen = ({route,navigation}) => {


  const [forgotPasswordText,setForgotPasswordText] = React.useState("");
  const [emailInput,setEmailInput] = React.useState("");
  const [buttonPressed,setButtonPressed] = React.useState(false);
  const [submitPressed,setSubmitPressed] = React.useState(false);
  const [passwordStatus,setPasswordStatus] = React.useState("");
  const [passwordEntry,setPasswordEntry] = React.useState("");
  const [confirmEntry,setConfirmEntry] = React.useState("");
  const currentUsername = "";
  const confirmPassRef = useRef();
  
  function resetPassword(eMailInput)
  {

    if(eMailInput == "")
    {
      Alert.alert("E-mail Error","E-mail field is blank");
      return;
    }
    console.log("Testing "+eMailInput);
    auth().signInWithEmailAndPassword(eMailInput,"tespw").then((result)=>{console.log("success!!");}).catch((error)=>{

      console.log(error.code);

      if(error.code == "auth/invalid-email")
      {
        Alert.alert("Error","Invalid E-mail format");
      }


      if(error.code == "auth/wrong-password")
      {
        auth().sendPasswordResetEmail(eMailInput).then((data)=>{

          Alert.alert("Notice","Please check your e-mail to reset your password.",[{text:"OK",onPress:()=>{navigation.navigate("Login");}}]);

        }).catch((error)=>{

          Alert.alert("Error","Firebase Error");

        })
        console.log("User In Firebase");
      }

      if(error.code == "auth/user-not-found")
      {
        const requestOptions = {
      
          method:'POST',
          headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
          body: 'action=findEmail&whereJson='+JSON.stringify({"email":eMailInput})+'&appversion='+appVersion
          //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
      
        };

        fetch('https://avid.vqconnect.io/nodejs/login',requestOptions).then((response)=>response.json()).then((responseJson)=>{

        if(responseJson.code == "200")
          setButtonPressed(true);
        else
          Alert.alert("E-mail Error","E-mail not found");
    }).catch((error)=>{

                if(error.name == "SyntaxError")
                {
        
                  Alert.alert("Network Error","Please Try Again");
                  return;
                }

    });
      }


    });

    

    




    /*
    userAccountPtr.doc(usernameInput).get().then((document)=>
      {
         if(document.exists)
          {
            console.log("part 1");
            setIsFirebase(true);
            console.log("part 2");
            auth().sendPasswordResetEmail(document.data().eMail).then(()=>{
              setForgotPasswordText("Please check your e-mail to reset your password");
              return;
            });
          }
          else
          {
            setIsFirebase(false);
          }

          


      }
    );*/


  
    
    
    //auth().sendPasswordResetEmail
  
}

function processPassword()
{
  console.log("cheesey");
  
  
  if(emailInput == "")
  {
    Alert.alert("Error","E-mail is blank");
    return;
  }
  
  
  
  if(passwordEntry == "" || confirmEntry == "")
  {
    Alert.alert("Error","One field is empty");
    return;
  }
  console.log("Hello");
  if(passwordEntry != confirmEntry)
  {
    Alert.alert("Error","Passwords do not match");
    //setPasswordStatus("Passwords do not match!");
    return;
  }
  console.log("PArt 55");
  const requestOptions = {
      
    method:'POST',
    headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
    body: 'action=changepassword&whereJson='+JSON.stringify({"email":emailInput,"password":passwordEntry})+'&appversion='+appVersion
    //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion


  };

  fetch('https://avid.vqconnect.io/nodejs/login',requestOptions).then((response)=>response.json()).then((responseJson)=>{

    if(responseJson.code == 200)
    {
      Alert.alert("Success","Password Successfully Updated.",[{text:"OK",onPress:()=>{navigation.navigate("Login");}}]);
      //Alert.alert("E-mail Not Verified","Please check your e-mail to verify your account",[{text:'Resend E-mail',onPress:()=>{userCredential.user.sendEmailVerification();}},{text:"OK"}]);
      console.log("Password Success!");
      //setPasswordStatus("Password Successfully Changed");
    }
    else
    {
      Alert.alert("Error","There was an error resetting your password.");
      console.log("Password Fail");
      //setPasswordStatus("User Not Found!");
    }

  });



}

/*

export function req_ChangePassword(email,password){
    return request({
        url:global.url+'nodejs/login',
        method:'post',
        data:'action=changepassword'+'&whereJson='+JSON.stringify({"email":email,"password":password})+'&appversion='+global.appVersion,
    })
}


*/




  return(
  
  
   
    
  
  
  
  
    
  <KeyboardAwareScrollView style={{backgroundColor:'white'}} contentContainerStyle={{backgroundColor:'white'}}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss} style={{height:'50%'}}>
  <View style={styles.loginScreen}>
    <Text style={[styles.loginLabels,{textAlign:'center',marginBottom:'15%',marginTop:'10%'}]}>Please enter your e-mail address{"\n"}to change your password</Text>
    <TextInput returnKeyType='go' onSubmitEditing={()=>{resetPassword(emailInput)}} onChangeText={(text)=>setEmailInput(text)} value={emailInput} style={[styles.textFields,{width:'80%'}]}></TextInput>
    <TouchableOpacity onPress={()=>{resetPassword(emailInput)}} style={{alignSelf:'center', marginTop:30,marginBottom:50, backgroundColor: '#722053', width:"80%" }}><Text style={{ fontFamily: "Proxima Nova",fontWeight:'bold',color: '#fff', textAlign: 'center', fontSize: 25, margin:10, }}>Submit</Text></TouchableOpacity>
    
    {buttonPressed == true && <View style={{width:'100%',alignItems:'center'}}><Text>Please enter your new password</Text>
    <TextInput returnKeyType='next' onSubmitEditing={()=>{confirmPassRef.current.focus();}} onChangeText={(text)=>setPasswordEntry(text)} value={passwordEntry} style={[styles.textFields,{width:'80%'}]}></TextInput>
    <Text>Confirm your new password</Text>
    <TextInput ref={confirmPassRef} onSubmitEditing={()=>{processPassword()}} returnKeyType='done' onChangeText={(text)=>setConfirmEntry(text)} value={confirmEntry} style={[styles.textFields,{width:'80%'}]} autoCorrect={false} spellCheck={false}></TextInput><Text style={{color:'red'}}>{passwordStatus}</Text><TouchableOpacity onPress={()=>{processPassword()}} style={{ marginTop:30,marginBottom:50, backgroundColor: '#722053', width:"80%" }}><Text style={{ fontFamily: "Proxima Nova",fontWeight:'bold',color: '#fff', textAlign: 'center', fontSize: 25, margin:10, }}>Reset Password</Text></TouchableOpacity>
</View>}
    
</View></TouchableWithoutFeedback></KeyboardAwareScrollView>);
  

};




const ForgotUsernameScreen = ({route,navigation}) => {


  const [forgotUsernameText,setForgotUsernameText] = React.useState("");
  const [eMailInput,setEmailInput] = React.useState("");


  function findUsername(eMailInput)
  {

    if(eMailInput == "")
    {
      setForgotUsernameText("E-mail is blank");
      return;
    }
  

  const requestOptions = {
      
    method:'POST',
    headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
    body: 'action=newSendUsername&whereJson='+JSON.stringify({"email":eMailInput})+'&appversion='+appVersion
    //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion


  };

  fetch('https://avid.vqconnect.io/nodejs/login',requestOptions).then((response)=>response.json()).then((responseJson)=>{

    if(responseJson.code==200)
    {
      setForgotUsernameText("Your Username Is: \n"+responseJson.data.username);
    }
    else
    {
      setForgotUsernameText("E-mail not found");
    }

  });
}






  return(<View style={styles.loginScreen}>
    <Text style={[styles.loginLabels,{textAlign:'center',marginBottom:'15%'}]}>Please enter your e-mail address{"\n"}to retrieve your username</Text>
    <TextInput onChangeText={(text)=>setEmailInput(text)} value={eMailInput} style={[styles.textFields,{width:'80%'}]}></TextInput>
    <TouchableOpacity onPress={()=>{findUsername(eMailInput)}} style={{ marginTop:30,marginBottom:50, backgroundColor: '#722053', width:"80%" }}><Text style={{ fontFamily: "Proxima Nova",fontWeight:'bold',color: '#fff', textAlign: 'center', fontSize: 25, margin:10, }}>Submit</Text></TouchableOpacity>

    <Text style={{textAlign:'center',fontSize:15}}>{forgotUsernameText}</Text>
  </View>);

};


const LoginScreen = ({route,navigation}) => {


    const eyeCloseIcon = "./images/eyesclose.jpg";
    const eyeOpenIcon = "./images/eyesopen.jpg";
    
    const [avidSerialNumber,getSerialNumber] = React.useState("No Devices Found!");
    const [username,setUsername]= React.useState("");
    const [password,setPassword]= React.useState("");
    const [loginStatus,setLoginStatus] = React.useState("");
    const [eyeIcon,setEyeIcon] = React.useState(require(eyeCloseIcon));
    const [secureTextOn,setSecureTextOn] = React.useState(true);
    const [isLoading,setIsLoading] = React.useState(false);
    const [userInfo,setUserInfo] = React.useState();
    const [loginProcessStaus,setLoginProcessStatus] = React.useState("");
    const [nextNavScreen,setNextNavScreen] = React.useState("");
  console.log("aches ");

  if(route.params != null)
    console.log(route.params.from);

  var nextLoginScreen = "";
  

  

  /*
  if(route.params != null && route.params.from == "logout" && currentUserData != null)
  {
    navigation.dispatch(

      CommonActions.reset({
        index:0,
        routes:[{name:"Login"}]
      })

    );
    //nextLoginScreen = "HOME";
    console.log("Logout PRocess");
    const logoutRequestOptions = {
      
      method:'POST',
      headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
      body: 'action=signOut&+uid='+currentUserData.uid+"&appversion="+appVersion
      //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion


    };
    console.log("step 1");
    fetch("https://avid.vqconnect.io/nodejs/login",logoutRequestOptions).then((response)=>response.json())
    .then((responseJson)=>{
      currentUserData = null;
      console.log("step 122");
      BleManager.getConnectedPeripherals([]).then((peripheralArray)=>{
        if(peripheralArray.length != 0)
          BleManager.disconnect();
      }).catch(error=>{console.log(error)});
      console.log("step 33");
      //route.params=null;
      if(auth().currentUser)
        auth().signOut();
      console.log("Step 444 "+route.params.nextScreen);
      //setNextNavScreen("HOME");
      //route.params.nextScreen = "HOME";
      
      
      
    }).catch((error)=>{console.log(error)});
    
    
  
  }
  else
    //route.params.nextScreen = "Main";
  */
  console.log("Next SCreen Is "+nextLoginScreen);

    function finishLogin(usernameIn,passwordIn,requestOptions)
    {
      
      
      function retrieveData()
      {
        setLoginProcessStatus("Fetching Usage Data");
        fetch("https://avid.vqconnect.io/nodejs/deviceList?action=findUsageData&SerialNumber="+currentUserData.serialnumber+"&token="+currentUserData.token).then((response)=>response.json())
        .then((responseJson)=>{
          
          userDeviceInfo = responseJson.data.status == 2 ? responseJson.data:"null";
      
          if(userDeviceInfo == "null" || userDeviceInfo.lastuserdata == null)
          {
            console.log("No Device Connected");
            console.log("Still here??123 "+auth().currentUser.emailVerified);
            navigation.navigate("Main",{calendarInfo:{},serialNumber:currentUserData.serialnumber,from:"login"});
          } 
          else
          {
            console.log("Device SN "+currentUserData.serialnumber);
              
          getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear()).then((result)=>{

                              
            console.log(result);
            setIsLoading(false);
            setLoginProcessStatus("");
            console.log("Still here?? "+auth().currentUser.emailVerified);
            navigation.navigate("Main",{calendarInfo:result,serialNumber:currentUserData.serialnumber,from:"login"});
            //navigation.navigate("HOME",{calendarInfo:result,serialNumber:currentUserData.serialnumber});

          }).catch((error)=>{
            console.log("There Was Problem "+error);
            auth().signOut().then(()=>{

              Alert.alert("Network Error","Please Try Again");

            })

          });
          }

          /*
          getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear()).then((result)=>{

                              
            console.log(result);
            setIsLoading(false);
            setLoginProcessStatus("");
            //navigation.navigate(nextLoginScreen,{calendarInfo:result,serialNumber:currentUserData.serialnumber});
            //navigation.navigate("HOME",{calendarInfo:result,serialNumber:currentUserData.serialnumber});

          });*/
        
        })
        .catch((error)=>{  
          if(error.name == "SyntaxError")
          {
            console.log("Georgeio");
            if(auth().currentUser)
              auth().signOut();
            //console.log(auth().currentUser);
            setIsLoading(false);
            setLoginProcessStatus("");
            Alert.alert("Network Error","Please Try Again");
            return;
          }

    
      
      
    });
      }
      
      
      //console.log(requestOptions);
      fetch('https://avid.vqconnect.io/nodejs/login',requestOptions).then((response)=>response.json()).then((responseJson)=>{
      
        switch(responseJson.code)
        {
          case 200:
            currentUserData = responseJson.data;  
            if(!auth().currentUser)
              auth().createUserWithEmailAndPassword(responseJson.data.email.toLowerCase(),passwordIn).then((userCredential)=>{
                userAccountPtr.doc(usernameIn.toLowerCase()).set({eMail:responseJson.data.email.toLowerCase(),md5pass:responseJson.data.PassHash});
                auth().currentUser.sendEmailVerification().then(()=>{console.log("E-mail success");retrieveData();})
                //return;
              }).catch((error)=>{console.log("Erris is "+error)});
            else
              retrieveData();
            break;
          case 201:
              //User Deleted
            setIsLoading(false);
            setLoginProcessStatus("");
            Alert.alert("Username Error","This user has been deleted. Please contact VQ OrthoCare for support");
            break;
            
            
          case 202:

          case 203:
            setIsLoading(false);
            setLoginProcessStatus("");      
            Alert.alert("Login Error","Password Incorrect");
                
                //setLoginStatus("Username or Password Error Please Try Again (old system)");
            break;

          case 205:
            setIsLoading(false);
            setLoginProcessStatus("");    
            Alert.alert("Username Error","Username does not exist");
            break;
        }
      
      
      //console.log(auth().currentUser);
       
      
      console.log(responseJson.data);

        }).catch((error)=>{

          console.log(error);
          if(error.name == "SyntaxError")
          {
            console.log("Georgeio");
            if(auth().currentUser)
              auth().signOut();
            console.log(auth().currentUser);
            setIsLoading(false);
            setLoginProcessStatus("");
            Alert.alert("Network Error","Please Try Again");


          
            
            
          }

        });
    }

    async function processLogin(usernameIn,passwordIn)
    {
      if(auth().currentUser)
      {
        console.log("Chinese Egg Rolls");
        await auth().signOut();
        console.log("Stuff");
        console.log(auth().currentUser);
      }
        
      var requestOptions;
      
      
      userAccountPtr.doc(usernameIn.toLowerCase()).get().then((document)=>
                    {
                      if(document.exists)
                      {
                        console.log("exists");
                        auth().signInWithEmailAndPassword(document.data().eMail,passwordIn).then((userCredential)=>{

                          requestOptions = {
      
                            method:'POST',
                            headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
                            body: 'action=signIn&whereJson='+JSON.stringify({"username":usernameIn,"md5password":document.data().md5pass,"password":"NULL"})+'&appversion='+appVersion
                            //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
                      
                      
                          };
                          finishLogin(usernameIn,passwordIn,requestOptions);

                        }).catch(error=>{
                              console.log(error.code);
                                setLoginProcessStatus(""); 
                                if(error.code == "auth/wrong-password")
                                {
                                  setIsLoading(false);
                                  Alert.alert("Login Error","Password Incorrect");
                                  return;
                                }


                        });
                      }
                      //If user does not exist in Firebase yet.
                      else
                      {
                        console.log("Doesnt exist");
                        requestOptions = {
      
                          method:'POST',
                          headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
                          body: 'action=signIn&whereJson='+JSON.stringify({"username":usernameIn,"password":passwordIn})+'&appversion='+appVersion
                          //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
                    
                    
                        };
                        finishLogin(usernameIn,passwordIn,requestOptions);
                      }
                    


                    });
    }

    function checkFieldInputs(usernameInput,passwordInput)
    {
      
        
        setIsLoading(true);
        setLoginProcessStatus("Logging In");
        console.log("poopyyy");
      
        if(username == "")
        {
          setLoginProcessStatus(""); 
          setIsLoading(false);
          if(password == "")
          {
            Alert.alert("Input Error","Username & Password are blank");
            return;
          }
          else
          {
            Alert.alert("Input Error","Username is blank");
            return;
          }
          
        }
        else if(password == "")
        {
          setLoginProcessStatus(""); 
          setIsLoading(false);
          Alert.alert("Input Error","Password is blank");
        }
        else
        {
        
          processLogin(username,password);
        
          //Begin Process Login
        /*
        const requestOptions = {
      
            method:'POST',
            headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
            body: 'action=signIn&whereJson='+JSON.stringify({"username":usernameInput,"password":passwordInput})+'&appversion='+appVersion
            //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
      
      
          };

          console.log("step 111");
          fetch('https://avid.vqconnect.io/nodejs/login',requestOptions).then((response)=>response.json()).then((responseJson)=>{

          console.log("step 222 "+responseJson.code=="200");
          console.log("Code Is "+responseJson.code+" "+responseJson.msg);
            switch(responseJson.code)
            {
                //Login Success
                case 200:
                    console.log("hello world");
                    currentUserData = responseJson.data;
                    //AsyncStorage.setItem("currentUserData",currentUserData);
                    console.log(currentUserData);
                    
                    fetch("https://avid.vqconnect.io/nodejs/deviceList?action=findUsageData&SerialNumber="+currentUserData.serialnumber+"&token="+currentUserData.token).then((response)=>response.json()).then((responseJson)=>{
                    console.log("Hello Bobby");
                    userDeviceInfo = responseJson.code == 207 ? "null":responseJson.data;
                    console.log("User Device Info Is "+userDeviceInfo.lastdatatime);

                    nextLoginScreen = (route.params != null && route.params.from == "logout")?"HOME":"Main";
                    console.log(nextLoginScreen)
                    setLoginProcessStatus("Loading Usage Data");
                    getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear()).then((result)=>{

                                    
                      console.log(result);
                      setIsLoading(false);
                      setLoginProcessStatus("");
                      navigation.navigate(nextLoginScreen,{calendarInfo:result,serialNumber:currentUserData.serialnumber});
                      //navigation.navigate("HOME",{calendarInfo:result,serialNumber:currentUserData.serialnumber});

                    });
                  
                    


                    }).catch((error)=>{Alert.alert("Network Error","Please Try Again");return;});
                    
                    console.log(currentUserData.serialnumber);
                    userAccountPtr.doc(usernameInput).get().then((document)=>
                    {
                       
                      if(document.exists)
                        {
                            auth().signInWithEmailAndPassword(document.data().eMail,passwordInput).then((userCredential)=>{

                                
                                setLoginProcessStatus(""); 
                                if(route.params != null && route.params.from == "logout")
                                {
                                  console.log("happy meal -a ");
                                  nextLoginScreen = "HOME";
                                  //getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear());
                                  setLoginProcessStatus("Loading Usage Data"); 
                                  getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear()).then((result)=>{

                                    
                                    console.log(result);
                                    setIsLoading(false);
                                    navigation.navigate("HOME",{calendarInfo:result,serialNumber:currentUserData.serialnumber});
  
                                  });
                                  //navigation.navigate("HOME",{calendarInfo:getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear())});
                                  //navigation.navigate("HOME");
                                }
                                else
                                {
                                  
                                  nextLoginScreen = "Main";
                                  //getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear());
                                  setLoginProcessStatus("Loading Usage Data"); 
                                  getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear()).then((result)=>{

                                    console.log("happy mealllla "+currentUserData.serialnumber);
                                    console.log(result);
                                    setIsLoading(false);
                                    if(!userCredential.user.emailVerified)
                                      Alert.alert("E-mail Not Verified","Please check your e-mail to verify your account",[{text:'Resend E-mail',onPress:()=>{userCredential.user.sendEmailVerification();}},{text:"OK"}]);

                                   
                                    navigation.navigate("Main",{calendarInfo:result,serialNumber:currentUserData.serialnumber});
  
                                  });
                                  //navigation.navigate("Main",{calendarInfo:getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear())});
                                  //navigation.navigate("Main");
                                }
                                    


                            }).catch(error=>{

                              setLoginProcessStatus(""); 
                                if(error.code == "auth/wrong-password")
                                {
                                  setIsLoading(false);
                                  Alert.alert("Login Error","Password Incorrect");
                                  return;
                                }
          
                              });
                        }
                        else
                        {
                                

                                auth().createUserWithEmailAndPassword(responseJson.data.email,passwordInput).then((userCredential)=>{

                                  userCredential.user.sendEmailVerification();
                                  setLoginProcessStatus("Logging In"); 
                                userAccountPtr.doc(usernameInput).set({eMail:responseJson.data.email});
                                setIsLoading(false);
                                nextLoginScreen = "HOME";
                                //getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear());
                                setLoginProcessStatus("Loading Usage Data"); 
                                getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear()).then((result)=>{

                                  //console.log(result);
                                  navigation.navigate("HOME",{calendarInfo:result,serialNumber:currentUserData.serialnumber});

                                });
                                
                                //navigation.navigate("HOME",{calendarInfo:getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear())});
                
                              }).catch(error=>{

                                setLoginProcessStatus("");
                                setIsLoading(false);
                                Alert.alert("Login Error","Username Error");
                                return;

                              });
                        }

                    });
                    
                    break;

                
                case 201:
                  //User Deleted
                  Alert.alert("Username Error","This user has been deleted. Please contact VQ OrthoCare for support");
                  setIsLoading(false);
                  setLoginProcessStatus("");
                  break;
                
                
                case 202:

                case 203:
                    Alert.alert("Login Error","Password Incorrect");
                    setIsLoading(false);
                    setLoginProcessStatus("");
                    //setLoginStatus("Username or Password Error Please Try Again (old system)");
                    break;

                case 205:
                  Alert.alert("Username Error","Username does not exist");
                  setIsLoading(false);
                  setLoginProcessStatus("");
                  break;
            }


          }).catch((error)=>{Alert.alert("Network Error","Please Try Again");});*/}
          console.log("bats");

          



    }


    

    return(
      <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <View style={styles.loginScreen}>
      
        <Image style={styles.loginScreenImage} source={require("./images/AVID.jpg")} />
        
      <View style={{width: '85%'}}>
      
      <Text style={styles.loginLabels}>Username</Text>
      <TextInput InputProps={{disableUnderline: false}} style={styles.textFields} onChangeText={(text)=>setUsername(text)} value={username} name='usernameField'></TextInput>
      <Text style={styles.loginLabels}>Password</Text>
      <View style={{width:'100%',flexDirection:'row'}}>
      <TextInput secureTextEntry={secureTextOn} style={[styles.textFields,{flex:10}]} onChangeText={(text)=>setPassword(text)} value={password} name='passwordField'></TextInput>
      
      <TouchableHighlight onPress={()=>{console.log("boobs");setSecureTextOn(!secureTextOn);if(secureTextOn){setEyeIcon(require(eyeOpenIcon));}else{setEyeIcon(require(eyeCloseIcon));}}}><Image style={{flex:0}} source={eyeIcon}/></TouchableHighlight>
      </View>
      <View style={{flexDirection: "row",marginTop: 10, width:'100%',justifyContent:'space-between'}}>
      <TouchableOpacity onPress={()=>{setLoginProcessStatus(""); setIsLoading(false);navigation.navigate("Forgot Username")}}><Text style={styles.grayButton}>Forgot Username?</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>{setLoginProcessStatus(""); setIsLoading(false);navigation.navigate("Forgot Password")}}><Text style={styles.grayButton}>Forgot Password?</Text></TouchableOpacity>
      
      </View>
      </View>
     
      
      <TouchableOpacity onPress={()=>{checkFieldInputs(username,password);}} style={{ marginTop:30,marginBottom:20, backgroundColor: '#722053', width:"80%" }}><Text style={{ fontFamily: "Proxima Nova",fontWeight:'bold',color: '#fff', textAlign: 'center', fontSize: 25, margin:10, }}>Login</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>{navigation.navigate("Sign Up") }}><Text style={[styles.purpleButton,{marginTop:'6%'}]}>Sign Up</Text></TouchableOpacity>
      <Text>&nbsp;&nbsp;&nbsp;</Text>
      <ActivityIndicator animating={isLoading}/>
      <Text style={{color:'grey',fontSize:10}}>{loginProcessStaus}</Text>
      </View></TouchableWithoutFeedback>);
} //End Login Screen



/*
function processLogin(username,password)
{
  return new Promise(function(resolve,reject){
  
  const requestOptions = {
      
    method:'POST',
    headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
    body: 'action=signIn&whereJson='+JSON.stringify({"username":username,"password":password})+'&appversion='+appVersion
    //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion


  };

  fetch('https://avid.vqconnect.io/nodejs/login',requestOptions).then((response)=>response.json()).then((responseJson)=>{

      switch(responseJson.code)
      {
          case 200:
            console.log("hello world");
            currentUserData = responseJson.data;
            //Get Device Info
            fetch("https://avid.vqconnect.io/nodejs/deviceList?action=findUsageData&SerialNumber="+currentUserData.serialnumber+"&token="+currentUserData.token).then((response)=>response.json()).then((responseJson)=>{userDeviceInfo = responseJson.data;});
            console.log(currentUserData.serialnumber);
            userAccountPtr.doc(username).get().then((document)=>
            {
              if(document.exists)
              {
                auth().signInWithEmailAndPassword(document.data().eMail,password).then(()=>{resolve("success");  }).catch(error=>{resolve("wrong_password");});
              }
              else
              {
                auth().createUserWithEmailAndPassword(responseJson.data.email,password).then(()=>{
                  setLoginProcessStatus("Logging In"); 
                  userAccountPtr.doc(username).set({eMail:responseJson.data.email});
                  setIsLoading(false);
                  setLoginProcessStatus("Loading Usage Data"); 
                  getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear()).then((result)=>{navigation.navigate("HOME",{calendarInfo:result,serialNumber:currentUserData.serialnumber});});
                   });
                        }

                    });
                    break;


                case 202:

                case 203:
                    Alert.alert("Login Error","Username or Password Incorrect");
                    setIsLoading(false);
                    setLoginProcessStatus("");
                    setLoginStatus("Username or Password Error Please Try Again (old system)");
                    return;



              }

    }); //End Fetch
})}*/





function getMonthUsageData(month,year){

  console.log(month+"--"+year);
  return new Promise(function(resolve,reject){


  console.log("Cheep Birds");
  const usageOver20 = {key:'over20',color:'green'};
  const usageUnder20 = {key:'under20',color:'purple'};
  const allQuestionsAnswered = {key:'allAnswered',color:'red'};
  const skippedQuestions = {key:'skippedQuestions',color:'pink'};
  
  var dataObject = {};
  const monthDays= ["31","28","31","30","31","30","31","31","30","31","30","31"];
  if(year%4 == 0)
    monthDays[1]="29";

  month < 10 ? month = "0"+month:month=month;
  console.log("Console Info: https://avid.vqconnect.io/nodejs/userList?action=findUserUsageDataByMonth&startTime="+year+"-"+month+"-01&endTime="+year+"-"+month+"-"+monthDays[month-1]+"&uid="+currentUserData.uid+"&token="+currentUserData.token);
  fetch("https://avid.vqconnect.io/nodejs/userList?action=findUserUsageDataByMonth&startTime="+year+"-"+month+"-01&endTime="+year+"-"+month+"-"+monthDays[month-1]+"&uid="+currentUserData.uid+"&token="+currentUserData.token,{method:'GET'}).then((responseData)=>responseData.json()).then((responseJson)=>{

  console.log(responseJson.data.length);
  if(responseJson.data.length == 0)
  {
    console.log("No DAta");
    resolve({});
    return;
    //resolve("none");
    //navigation.navigate(nextLoginScreen,{calendarInfo:"none"});
  }

  for(var i=0;i<=responseJson.data.length;i++)
  {
    console.log("Indian Food");
    if(responseJson.data[i].MinOfUseTotal > 0)
    {
      var currentDot = responseJson.data[i].MinOfUseTotal >= 20 ? usageOver20:usageUnder20;
      dataObject[responseJson.data[i]._id]={dots:[currentDot]};
      console.log("Chinese Food");
      fetch("https://avid.vqconnect.io/nodejs/userList?action=findUserUsageDataByDay&dayTime="+responseJson.data[i]._id+"&uid="+currentUserData.uid+"&token="+currentUserData.token).then((responseaa)=>responseaa.json()).then((responseJsonaa)=>{

            var skipped = false;
            console.log("Chinese Food1 "+responseJsonaa);
            for(var j=0;j<responseJsonaa.data.length;j++)
            {
              if(Object.values(responseJsonaa.data[j]).includes("UA"))
              {
                skipped=true;
                break;
              }
          
            }
            if(skipped==true)
            {
              dataObject[responseJsonaa.data[0].StandardTimeOfTreatment.substring(0,10)].dots.push(skippedQuestions);
            }
            else
            {
              dataObject[responseJsonaa.data[0].StandardTimeOfTreatment.substring(0,10)].dots.push(allQuestionsAnswered);
            }
            console.log("Chinese Food2");
            resolve(dataObject);
            //navigation.navigate(nextLoginScreen,{calendarInfo:dataObject});
            //{month:new Date().getMonth()+1,day:new Date().getDate(),year:new Date().getFullYear()}
      }).catch((error)=>{
        console.log(error.name+" "+error);
        if(error.name == "SyntaxError")
        {
          reject("Network Error");
        }
    
    
      });
    }
    else
      console.log("Armenian Food");

  }

  //console.log(dataObject);

  

  }).catch((error)=>{

    if(error.name == "SyntaxError")
    {
      reject("Network Error");
    }


  }); //End Fetch

  


});};


const DeviceSelection = ({route,navigation}) => {

  
  function checkIfDeviceIsRegistered(serial_number)
  {
    console.log("Hello 33");
    
    return new Promise(function(resolve,reject){
    const dataRequestOptions = {
  
      method:'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
      }),
      body: 'action=checkDevice&serialNumber='+serial_number+'&appversion='+appVersion
      //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
    };

    fetch("https://avid.vqconnect.io/nodejs/login",dataRequestOptions).then((response)=>response.json()).then((responseJson)=>{resolve(responseJson.msg);});});
  }

  console.log(JSON.stringify(route.params.newUserInfo));
  bleManagerEmitter.addListener('BleManagerDidUpdateState',(state)=>{if(state.state != "on")Alert.alert("Bluetooth Error","Please ensure that Bluetooth on your phone is turned on");});
  BleManager.checkState();
  var [deviceList,setDeviceList] = React.useState([]);
  var [foundDevices,setFoundDevices] = React.useState([]); 
  var [isScanning,setIsScanning] = React.useState(false);
  var [alertShown,setAlertShown] = React.useState(false);
  var [isRegistering,setIsRegistering] = React.useState(false);
  const [firstModalShowing,setFirstModalShowing] = React.useState(true);
  const [isScanningA,setIsScanningA] = React.useState(false);
  navigation.setOptions({headerRight:()=>(<ActivityIndicator alignSelf='center' color="white" animating={isScanningA}/>)});
  if(!alertShown)
    Alert.alert("Device Selection","Please ensure that your desired AVID device is nearby, powered on, and that Bluetooth mode is active.",[{text:"OK",onPress:()=>{setAlertShown(true)}}]);
  /*

<Text style={{marginBottom:'5%',fontWeight:'bold',fontSize:20,textAlign:'center'}}>Device Selection</Text>
    <Text style={{textAlign:'center'}}>Please ensure that your desired AVID device is nearby, powered on, and that Bluetooth mode is active.</Text>

  */
  function createNewUser(deviceID)
  {
    setIsRegistering(true);
    route.params.newUserInfo.serialNumber = deviceID;
    console.log("User Info Is "+JSON.stringify(route.params.newUserInfo));
    console.log("Point A");
    const newDataRequestOptions = {
  
      method:'POST',
      headers: new Headers({
        'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
      }),
      body: 'action=appsignup&whereJson='+JSON.stringify(route.params.newUserInfo)+'&appversion='+appVersion
      //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
  
  
    };

    console.log("Point B");
    
    fetch("https://avid.vqconnect.io/nodejs/login",newDataRequestOptions).then((response)=>response.json()).then((responseJson)=>{


    console.log("Point C");

    console.log(responseJson);
    if(responseJson.code == 200)
    {
      console.log("Point D");
      //auth().createUserWithEmailAndPassword(route.params.newUserInfo.email,route.params.newUserInfo.password).then((userCredential)=>{

        //userCredential.user.sendEmailVerification();
        
        //userAccountPtr.doc(route.params.newUserInfo.username).set({eMail:route.params.newUserInfo.email});
        console.log("Point E");

        const loginRequestOptions = {
      
          method:'POST',
          headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded'}),
          body: 'action=signIn&whereJson='+JSON.stringify({"username":route.params.newUserInfo.username,"password":route.params.newUserInfo.password})+'&appversion='+appVersion
          //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
    
    
        };
        console.log("Point F");
        console.log("step 111");
        fetch('https://avid.vqconnect.io/nodejs/login',loginRequestOptions).then((response)=>response.json()).then((responseJson)=>{
          console.log("Point G");
        currentUserData = responseJson.data;  
        getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear()).then((result)=>{

          //console.log(result);
          //setIsLoading(false);
          fetch("https://avid.vqconnect.io/nodejs/deviceList?action=findUsageData&SerialNumber="+currentUserData.serialnumber+"&token="+currentUserData.token).then((response)=>response.json()).then((responseJson)=>{
            console.log("Point H");

          userDeviceInfo = responseJson.data;  
          setIsRegistering(false);
          //auth().sendEmailVerification();
          navigation.navigate("Main",{calendarInfo:result,serialNumber:currentUserData.serialnumber});


          });
          

        });


        });



       



     
    }



    });
    
    
    
    /*
      export function req_SignUp(userDic){
        return request({
        url:global.url+'nodejs/login',
        method:'post',
        data:'action=appsignUp'+'&whereJson='+JSON.stringify(userDic)+'&appversion='+global.appVersion,
    })
}

    */
  }
  const handleSelectFoundDevice = (peripheral) => {
    navigation.setOptions({headerRight:()=>(<ActivityIndicator alignSelf='center' color="white" animating={isScanning}/>)});
  onChanged = (e,name) =>{

    if(name.includes("*"))
      Alert.alert("Device Error","This device is already registered with another user.");
    else if(name.includes("-"))
      Alert.alert("Device Error","This device has not been configured yet. Please contact customer support");
    else
      Alert.alert("Confirm Device","Are you sure you want to register Device "+name+"?",[{text:'Yes',onPress:()=>{createNewUser(name);}},{text:'No'}]);

  }
    if(peripheral.name != null && peripheral.name.substring(0,4) == "Avid" && !foundDevices.includes(peripheral.advertising.localName.substring(5)))
    {
      //console.log("Device Found "+peripheral.advertising.localName.substring(5));
      checkIfDeviceIsRegistered(peripheral.advertising.localName.substring(5)).then((response)=>{

        console.log("Device Status Is "+response);
        var char = "";
        if(response == "DEVICE_ALREADY_REGISTERED")
          char = "*";
        if(response == "DEVICE_DOES_NOT_EXIST")
          char = "-";
         
        setDeviceList(deviceList => [...deviceList,<Pressable style={{marginTop:'3%',marginBottom:'3%',alignSelf:'center',width:'80%',borderWidth:2,backgroundColor:'white',borderColor:avidPurpleHex}} deviceId={peripheral.advertising.localName.substring(5)} onPress={e=>onChanged(e,peripheral.advertising.localName.substring(5))} ><Text style={{padding:'4%',fontFamily: "Verdana-Bold",color: avidPurpleHex, textAlign: 'center', fontSize: 15}}>{peripheral.advertising.localName.substring(5)+" "+char}</Text></Pressable>])
        setFoundDevices(foundDevices =>[...foundDevices,peripheral.advertising.localName.substring(5)]);

      });
      
    }

  }

  bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
  bleManagerEmitter.removeAllListeners('BleManagerStopScan');
  bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',handleSelectFoundDevice);
  bleManagerEmitter.addListener('BleManagerStopScan',(args)=>{
    
    if(args.status == 10)
      Alert.alert("Error","We could not detect any nearby devices. Please try again");
    
    setIsScanningA(false);});
    
    
  



  return(
<View>
  <Modal animationType='none' visible={isRegistering} transparent={true}  >
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
    <Text style={{textAlign:'center'}}>Submitting Your Information</Text>
    </View>
    <ActivityIndicator animating={true}/>
    </View>
    
  </Modal>
  {/*
  <Modal animationType='none' visible={firstModalShowing} transparent={true}  >
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
    <Text style={{marginBottom:'5%',fontWeight:'bold',fontSize:20,textAlign:'center'}}>Device Selection</Text>
    <Text style={{textAlign:'center'}}>Please ensure that your desired AVID device is nearby, powered on, and that Bluetooth mode is active.</Text>
    <Button title="OK" onPress={()=>setFirstModalShowing(false)} />
    </View>
    </View>
    
  </Modal>*/}
  <Text style={{marginTop:'6%',alignSelf:'center'}}>* = Device is already registered with another user</Text>
  <Text style={{alignSelf:'center'}}>- = Device has not been properly configured</Text>
  <TouchableOpacity onPress={()=>{BleManager.scan([],20,false);setIsScanningA(true)}} style={{alignSelf:'center',marginTop:'8%',width:'80%',borderWidth:2,backgroundColor:avidPurpleHex,borderColor:avidPurpleHex}}><Text style={{padding:'4%',alignSelf:'center', fontSize:20,fontWeight:'bold',color:'white'}}>Scan For Nearby Devices</Text></TouchableOpacity>
<View>
  {deviceList}
  </View>
</View>
  );



}





const MainScreen = ({route,navigation}) => {

  console.log(currentUserData);
  const currentSerialNumber = currentUserData.serialnumber == ''?"No Device Paired":currentUserData.serialnumber;
  console.log("Last Upload Was "+userDeviceInfo);
  const [uploadStatus,setUploadStatus] = React.useState("");
  const initialMarkedDates = {}
  const [datesUpdated,setDatesUpdated] = React.useState(false);
  const [currentDeviceString,setCurrentDeviceString] = React.useState(currentUserData.serialnumber == ''?"No Device Paired":currentUserData.serialnumber);
  //const [currentSerialNumber,updateSerialNumber] = React.useState(route.props.serialNumber);
  const [markedDates,updateMarkedDates] = React.useState(route.params.calendarInfo);
  const [currentMonth,setCurrentMonth] = React.useState([new Date().getMonth()+1,new Date().getFullYear()]);
  const [isUpdating,setIsUpdating] = React.useState(false);
  const [verifyShown,setVerifyShown] = React.useState(false);
  const [lastDataAddress,setLastDataAddress] = React.useState(null);
  const [backgroundInitiated,setBackgroundInitiated] = React.useState(false);
  const [isBackground,setIsBackground] = React.useState(true);
  //const [lastUsageAddress,setLastUsageAddress] = React.useState(0);
  //const [usageCount,setUsageCount] = React.useState(0);
  //const [questionCount,setQuestionCount] = React.useState(0);
  const [scanButtonColor,setScanButtonColor] = React.useState(currentUserData.serialnumber == ''?"#bbb":"#fff");
  const [scanButtonOpacity,setScanButtonOpacity] = React.useState(currentUserData.serialnumber == ''?0.3:1.0);
  const [foundDevice,setFoundDevice] = React.useState(false);
  const [isScanning,setIsScanning] = React.useState(currentUserData.serialnumber == '');
  const [scanStatus,setScanStatus] = React.useState("");
  const [lastUploadTime,setLastUploadTime] = React.useState(userDeviceInfo.lastdatatime);
  navigation.setOptions({headerStyle:{backgroundColor:avidPurpleHex},headerTintColor:'white',headerTitle:"Welcome, "+currentUserData.name,headerRight:()=>(<ActivityIndicator alignSelf='center' color="white" animating={isUpdating}/>)});
  const Circle = (color,size) => {return <View style={{alignSelf:'center',width:size,height:size,borderRadius:size/2,backgroundColor:color}}></View>};


 



  bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
  bleManagerEmitter.removeAllListeners('BleManagerStopScan');
  bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',handleDiscoverDevice);
  bleManagerEmitter.addListener('BleManagerStopScan',(args)=>{

    setScanStatus("");
    showNotifiction("Notice","Background Scan Halted.");
    console.log("The Args "+args);
    if(args.status==10)
    {
      if(isBackground)
      {
        showNotifiction("Error","We could not detect your device!");
      }
      else
      {
        Alert.alert("Device Not Found","Please ensure that your AVID device is nearby, turned on, and set to Bluetooth mode",[{text:"Try Again",onPress:()=>{BleManager.scan([],10,false);setScanStatus("Scanning for Device");}},{text:"OK",onPress:()=>{console.log("We Stopped The Scan");setScanStatus("");
        setIsUpdating(false);
        console.log("Is Updating Is "+isUpdating);
        setIsScanning(false);
        console.log("Is Scanning Is "+isScanning);
        setScanButtonColor("white");
        setScanButtonOpacity(1.0);}}]);
      }
      
    }
      
    
    //console.log("Scan Stopped "+args.status);

  });

  
    try
    {
      if(lastUsageAddress == null)
        AsyncStorage.getItem("lastAddress").then((value)=>{lastUsageAddress = value;console.log("Value Is This Yes"+lastUsageAddress);}).catch((error)=>{console.log("Retrieve error");})

      //console.log("French Fries "+lastDataAddress);
      
    }
    catch(error)
    {
      console.log("Error Retrieving Last Address");
    }
  
  /*
  if(currentUserData.serialNumber != "")
  {
    setCurrentDeviceString(currentUserData.serialNumber);
    setIsScanning(true);
    setScanButtonColor("#bbb");
    setScanButtonOpacity(0.3);
  }
  else
  {
    setCurrentDeviceString("No Device Registered");
    setIsScanning(false);
    setScanButtonColor("white");
    setScanButtonOpacity(1.0);
  }*/
    
  console.log("Current User Is "+route.params.from);
  console.log(auth().currentUser);
  if(route.params.from == "login" && !auth().currentUser.emailVerified && !verifyShown)
  {
    Alert.alert("E-mail Not Verified","Please check your e-mail to verify your account",[{text:'Resend E-mail',onPress:()=>{auth().currentUser.sendEmailVerification().then(()=>{

      Alert.alert("Notice","E-mail verification sent",[{text:"OK"}])

    }).catch((error)=>{

      Alert.alert("Notice","There was an error sending the verification e-mail "+error);

    });}},{text:"OK"}]);
    setVerifyShown(true);
  }
    

  
  
    const onEvent = async(taskID) =>{
      
      showNotifiction("Notice","Background Download Started");
      console.log("Hello George!!");
      BleManager.scan([],4200,false);
      showNotifiction("Scan Started");
      /*
      var rightNow = new Date();
      if(rightNow.getHours() > 0 && rightNow.getHours() < 4)

      {
        //isBackgroundScan = true;
        bleManagerEmitter.addListener('BleManagerStopScan',(args)=>{if(args.status == 10)showNotifiction("Error","We could not detect your registered device");return;})

        
      }
      
      
      */
      //BackgroundFetch.finish(taskID);
      
  
    }
  
    const onTimeout = async (taskID) => {
      showNotifiction("Notice","Function Timeout");
      console.warn('[BackgroundFetch] TIMEOUT task: ', taskID);
      BackgroundFetch.finish(taskID);
    }
  
    if(backgroundInitiated == false)
    { 
      setBackgroundInitiated(true);
      setIsBackground(true);
      BackgroundFetch.configure({minimumFetchInterval: 15}, onEvent, onTimeout).then((result)=>{
        showNotifiction("Notice","Background Download Ready. yaay "+result);
        
      }).catch((error)=>{
        setBackgroundInitiated(false);
        showNotifiction("Notice","There was an error setting up the Background Download "+error);
      });

    }
      
    
    //backgroundInitiated = true;
      
  
  
  //initBackgroundFetch();
    
  
    

  //updateMarkedDates(route.params.calendarInfo);
  var tempPreset;
  /*function getDeviceData(peripheral,address)
  {

    //return new Promise((resolve,reject)=>{});

    console.log("Address is "+address+" ");
    BleManager.connect(peripheral.id).then(()=>{
    //setUploadStatus(uploadStatus+'\n'+"Connected to AVID Device. Retrieving Services");
      BleManager.retrieveServices(peripheral.id,["F0001130-0451-4000-B000-000000000000"]).then((peripheralInfo)=>{
        //setUploadStatus(uploadStatus+'\n'+"\nReading Data. Please Wait.");
          BleManager.write(peripheral.id,"F0001130-0451-4000-B000-000000000000","F0001131-0451-4000-B000-000000000000",address).then(()=>{

          setTimeout(()=>{
            
              BleManager.read(peripheral.id,"F0001130-0451-4000-B000-000000000000","F0001132-0451-4000-B000-000000000000").then((readData)=>{

                  //Get Config Data
                  
                  if(address[0] == 0 && address[1]==0)
                  {
                      let complianceTime = parseInt(changeNumBase(readData[3])+changeNumBase(readData[2])+changeNumBase(readData[1])+changeNumBase(readData[0]),16);
                      var complianceHours = complianceTime/60 < 1?0:1;
                      /*if(complianceTime/60 < 1)
                        complianceHours = 0;
                      else
                        complianceHours = 1;
                      let comTime = `${complianceHours} hrs ${complianceTime%60} min`;
                      configArray = [comTime,languages[readData[12]],readData[14],Boolean(readData[15]),Boolean(readData[16])];
                      console.log("The Stuff Is ");
                      console.log((256*readData[5]+readData[4])-16);
                      setLastUsageAddress((256*readData[5]+readData[4])-16);
                      console.log("Last Usage Address Is "+lastUsageAddress);
                      if(lastUsageAddress > 4070 || (lastDataAddress != null && lastDataAddress == lastUsageAddress))
                      {
                        
                        const noticeString = lastUsageAddress > 4070 ? "No New Records. Device was recently reset.":"No New Records";
                        
                        Alert.alert("Notice",noticeString,[{text:'OK',onPress:()=>{
                          
                          setScanStatus("");
                          setIsUpdating(false);
                          setIsScanning(false);
                          setScanButtonColor("white");
                          setScanButtonOpacity(1.0);
                          return;
                        
                        
                        }}
                    
                    
                      ]);
                      }
                      console.log("Config Array "+configArray);
                      console.log("Last Usage Data "+lastUsageAddress+" "+[readData[5],readData[4]]);
                      //Start Reading Preset Data
                      
                      if(readData[4] == 0)
                      {
                        //AsyncStorage.setItem("lastAddress",[readData[5]-1,0]);
                        getDeviceData(peripheral,[readData[5]-1,0]);
                      }
                      else
                      {
                        //AsyncStorage.setItem("lastAddress",[readData[5]-1,0]);
                        getDeviceData(peripheral,[readData[5],readData[4]-16]);
                        //getDeviceData(peripheral,[readData[5],readData[4]]);
                      }
                      return;
                        
                  }
                  
                  //Get Preset Data
                  else if(256*address[0]+address[1] <= 896 && 256*address[0]+address[1] >= 256)
                  {
                      //console.log("Preset Is "+readData)
                      console.log("Next Preset Address "+[address[0],address[1]+16]);
                      if((256*address[0]+address[1])%32 == 0 && 256*address[0]+address[1] != 896)
                      {
                        console.log("Preset Is This: "+readData);
                        var presetArray = [];
                        if(readData[1]>128)
                          presetArray.push("Yes");
                        else
                          presetArray.push("No");

                        presetArray.push("On");
                        presetArray.push("N");
                        if(readData[9]%2==0)
                          presetArray.push("2");
                        else
                          presetArray.push("4");

                          if(readData[9] >= 192)
                            presetArray.push("6/6");
                          else if(readData[9] >= 128)
                            presetArray.push("6|6");
                          else if(readData[9] >= 64)
                            presetArray.push("1|1")
                          else
                            presetArray.push("Continuous");

                          presetArray.push(readData[18]);
                          presetArray.push(readData[10]);
                          presetArray.push(readData[12]);
                          presetArray.push(readData[13]);

                          console.log(presetArray);
                          masterPresetArray.unshift(presetArray);

                      }
                        
                      
                      if(address[1] == 0)
                        getDeviceData(peripheral,[address[0]-1,240]);
                      else
                        getDeviceData(peripheral,[address[0],address[1]-16]);
                  }
                  else if(256*address[0]+address[1]>896)
                  {
                    console.log("Read Data Is "+readData);
                    console.log("LAst Time "+userDeviceInfo.lastdatatime);
                    var newRecords = false;
                    if(userDeviceInfo == "null" || !userDeviceInfo.hasOwnProperty('lastdatatime') || (lastDataAddress != null && 256*address[0]+address[1] >= lastDataAddress) ||userDeviceInfo.lastdatatime < convertDateStringForCompare(readData[1],readData[2],readData[3],readData[4],readData[5]))
                    {
                      if(readData[0] == 93)
                      {
                        usageCount++;
                        newRecords = true;
                        console.log("Usage "+["U",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),readData[6]-128, calculation(readData[8],readData[9]),calculation(readData[10],readData[11]),readData[12],readData[13],readData[14],readData[15],256*address[0]+address[1]]);
                        usageArray.push(["U",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),readData[6]-128, calculation(readData[8],readData[9]),calculation(readData[10],readData[11]),readData[12],readData[13],readData[14],readData[15],256*address[0]+address[1]]);
                        console.log("Array So Far "+usageArray);
                      }
                      if(readData[0] == 173)
                      {
                        questionCount++;
                        newRecords = true;
                        console.log("Answer "+["A",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),answers[readData[6]],answers[readData[7]],answers[readData[8]],answers[readData[9]],answers[readData[10]],256*address[0]+address[1]]);  
                        usageArray.push(["A",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),answers[readData[6]],answers[readData[7]],answers[readData[8]],answers[readData[9]],answers[readData[10]],256*address[0]+address[1]]);
                        console.log("Arrayy Soo Fffar "+usageArray);
                      }

                      
                      
                      
                     
                    }
                    else
                    {
                      console.log("Go To Preset Data");
                      getDeviceData(peripheral,[3,80])
                      return;
                    }

                    


                    if(address[1] == 0)
                    {
                        getDeviceData(peripheral,[address[0]-1,240]);
                    }
                    else
                    {
                        getDeviceData(peripheral,[address[0],address[1]-16]);
                    }
                  }
                  else{
                    
                    //if(!newRecords)
                    //  return;
                 
                         
                            //console.log("Final Data Is");
                            //console.log(usageArray); 
                           
                             console.log("Uploading Data To Server!");
                             console.log("Here we do");
                             var jsonData = "{";
                            jsonData += '"SerialNumber":"'+currentUserData.serialnumber+'","UserInfo":{"PatientName":"'+currentUserData.name+'","PatientEmail":"'+currentUserData.email+'","DoctorEmail":"'+currentUserData.doctorEmail+'","DeviceName":"Avid IF2"},';
                            jsonData += '"Usage":[';
                            for(var i = 0; i < usageArray.length;i++)
                            {
                             if(usageArray[i][0] == "U")
                             {
                               console.log("Date Is "+usageArray[i][1][0]);
                               jsonData += '["'+usageArray[i][0]+'",["'+usageArray[i][1][0]+'","'+usageArray[i][1][1]+'"],'+usageArray[i][2]+','+usageArray[i][4]+','+usageArray[i][3]+','+usageArray[i][5]+','+usageArray[i][6]+','+usageArray[i][7]+','+usageArray[i][8]+','+usageArray[i][9]+']';
                             }
                               
                             else
                             {
                               jsonData += '["'+usageArray[i][0]+'",["'+usageArray[i][1][0]+'","'+usageArray[i][1][1]+'"],';
                               
                               for(var j = 2;j<8;j++)
                               {
                                 if(isNaN(usageArray[i][j]))
                                   jsonData += '"'+usageArray[i][j]+'"';
                                 else
                                   jsonData += usageArray[i][j];
                                 if(j != 7)
                                   jsonData+= ",";
                                 else
                                   jsonData+= "]";
                           
                               }
                               
                               //+usageData[i][2]+','+usageData[i][3]+','+usageData[i][4]+','+usageData[i][5]+','+usageData[i][6]+','+usageData[i][7]+']';
                             }
                               
                             if(i != usageArray.length - 1)
                               jsonData += ",";
                           
                            }
                            jsonData += '],';
                            jsonData+= '"Config":["'+configArray[0]+'","'+configArray[1]+'","'+configArray[2]+'","'+configArray[3]+'","'+configArray[4]+'"]';
                            //jsonData += ',"Preset":[[0,0,0,0,0,0,0,0,0]]';

                            jsonData += ',"Preset":[';
                            
                            for(var i = 0;i<masterPresetArray.length;i++)
                            {
                              jsonData += '["'+masterPresetArray[i][0]+'","'+masterPresetArray[i][1]+'","'+masterPresetArray[i][2]+'","'+masterPresetArray[i][3]+'","'+masterPresetArray[i][4]+'","'+masterPresetArray[i][5]+'","'+masterPresetArray[i][6]+'","'+masterPresetArray[i][7]+'","'+masterPresetArray[i][8]+'"]';
                              
                              if(i != masterPresetArray.length - 1)
                               jsonData += ",";
                            
                            }
                            jsonData+=']';








                            jsonData += "}";
                            console.log(jsonData);
                           
                           
                             /*
                             token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyTmFtZSI6InJ1c3NlbGxfam93ZWxsIiwiaGFzaCI6Ijk5NDVhOGM3MzQwYzNlZWY1YmZjNmIwYzQ5NTQ5YmIzIiwiUGVybWlzc2lvbiI6NSwiaWF0IjoxNjc0NTAxNzk4LCJleHAiOjE2NzczODE3OTh9.69wZGgeSBXvaPmxXu7URgXhYu_-ZfZjUis1oxu32EYg
                               action=insertData
                               dataJson={"SerialNumber":"F001451","Usage":[["U",["Oct. 12 2022","06:15 PM"],0,0,0,0,0,0,0,0],["A",["Oct. 12 2022","06:20 PM"],0,0,0,0,0,0]],"Preset":[[0,0,0,0,0,0,0,0,0]],"Config":[2,2,2,2,2],"UserInfo":{"PatientName":"Russell Jowell","PatientEmail":"russ.jowell@gmail.com","DoctorEmail":"russdoctor@medical.com","DeviceName":"Avid IF2"}}
                           
                             
                             
                             
                               //console.log("Token Is "+currentUserData.token);
                             
                             
                             const dataRequestOptions = {
                             
                               method:'POST',
                               headers: {'x-access-token':currentUserData.token},
                               body: 'action=insertData&dataJson='+jsonData+'&appversion='+appVersion
                               //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
                           
                           
                             };
                             
                             console.log(dataRequestOptions.body);
                             console.log("Cheese Puffs are GREAT!!");
                             //fetch('https://avid.vqconnect.io/nodejs/deviceList',dataRequestOptions).then((response)=>response.json()).then((responseJson)=>{
                              fetch('https://avid.vqconnect.io/nodejs/deviceList',dataRequestOptions).then((response)=>response.json()).then((responseFromJson)=>  { 
                                console.log("Error Is "+responseFromJson.code+"  "+responseFromJson.msg);
                                BleManager.disconnect(peripheral.id);
                              if(isBackgroundScan)
                                showNotifiction("Success","We downloaded "+usageCount.toString()+" usage records and "+questionCount.toString()+" answer records!");
                              else
                                {

                                }
                              //console.log("Upload Complete. Get it!!");
                              //console.log("Step One ");
                              setCurrentMonth([new Date().getMonth(),new Date().getFullYear()]);
                              //console.log("Step Two A");
                              updateCalendar([new Date().getMonth(),new Date().getFullYear()]);
                              //console.log("Step Three");
                              fetch("https://avid.vqconnect.io/nodejs/deviceList?action=findUsageData&SerialNumber="+currentUserData.serialnumber+"&token="+currentUserData.token).then((response)=>response.json()).then((responseJson)=>{
                                  if(responseJson.code == 207)
                                  {
                                      userDeviceInfo = "null";
                                  }      
                                  else
                                    setLastUploadTime(responseJson.data.lastdatatime);
                        //updateMarkedDates(responseJson);  
                              });//End FEtch
                    
                              setIsUpdating(false);
                              setUploadStatus(uploadStatus+"\nUpload Complete!");
                      Alert.alert("Notice","Upload Complete",[{text:'OK',onPress:()=>{
                          
                          setScanStatus("");
                          setIsUpdating(false);
                          setIsScanning(false);
                          setScanButtonColor("white");
                          setScanButtonOpacity(1.0);
                        
                        
                        }}
                    
                    
                      ]);
                    console.log("Upload Complete. Hooray!");}).catch((error)=>{console.log("Upload Error "+error);});
                            return;
                          
                          
                          
                          
                          
                          
                          
                          
                          
                            
                          
                    
                      
                  }


              });

          },500);});

      });

  });//End Connect
//});
 }*/



 //////////

 async function getDeviceData(peripheral,address)
 {
    setScanStatus("Reading Device Data"); 
    return new Promise((resolve,reject)=>{
 
         BleManager.connect(peripheral.id).then(()=>{
             BleManager.retrieveServices(peripheral.id,["F0001130-0451-4000-B000-000000000000"]).then((peripheralInfo)=>{
                 BleManager.write(peripheral.id,"F0001130-0451-4000-B000-000000000000","F0001131-0451-4000-B000-000000000000",address).then(()=>{
                     setTimeout(()=>{
                         BleManager.read(peripheral.id,"F0001130-0451-4000-B000-000000000000","F0001132-0451-4000-B000-000000000000").then((readData)=>{
                             if(address[0] == 0 && address[1]==0)
                             {
                                 let complianceTime = parseInt(changeNumBase(readData[3])+changeNumBase(readData[2])+changeNumBase(readData[1])+changeNumBase(readData[0]),16);
                                 var complianceHours = complianceTime/60 < 1?0:1;
                                 /*
                                 if(complianceTime/60 < 1)
                                     complianceHours = 0;
                                  else
                                     complianceHours = 1;
                                 */
                                 let comTime = `${complianceHours} hrs ${complianceTime%60} min`;
                                 configArray = [comTime,languages[readData[12]],readData[14],Boolean(readData[15]),Boolean(readData[16])];
                                 console.log("The Stuff Is "+readData[5]+" "+readData[4]);
                                 console.log((256*readData[5]+readData[4])-16);
                                 let lastAddressVal = (256*readData[5]+readData[4])-16;
                                 //setLastUsageAddress(lastAddressVal);
                                 console.log("Last Usage Address Isss "+lastAddressVal+" "+lastUsageAddress);



                                

                                  //console.log("Value Is hello "+value);
                                  if(lastAddressVal > 4070 || (lastUsageAddress != null && lastUsageAddress == lastAddressVal.toString()))
                                  {
                                      console.log("It was rejected");
                                      const noticeString = lastUsageAddress > "4070" ? "No New Records. Device was recently reset.":"No New Records";
                                      return reject(noticeString);
                                     
                                  }

                                  console.log("Config Array "+configArray);
                                  console.log("Last Usage Data "+lastUsageAddress+" "+[readData[5],readData[4]]);
                                 //Start Reading Preset Data
                       
                                  return resolve([0,readData[5],readData[4]]);


                             



                                
                                 
                         
                             }
                             else if(256*address[0]+address[1] <= 896 && 256*address[0]+address[1] >= 256)
                             {
                                 //console.log("Preset Is "+readData)
                                 console.log("Next Preset Address "+[address[0],address[1]+16]);
                                  if((256*address[0]+address[1])%32 == 0 && 256*address[0]+address[1] != 896)
                                  {
                                     console.log("Preset Is This: "+readData);
                                     var presetArray = [];
                                     if(readData[1]>128)
                                         presetArray.push("Yes");
                                     else
                                         presetArray.push("No");
 
                                     presetArray.push("On");
                                     presetArray.push("N");
                                     if(readData[9]%2==0)
                                         presetArray.push("2");
                                     else
                                         presetArray.push("4");
 
                                     if(readData[9] >= 192)
                                         presetArray.push("6/6");
                                     else if(readData[9] >= 128)
                                         presetArray.push("6|6");
                                     else if(readData[9] >= 64)
                                         presetArray.push("1|1")
                                     else
                                         presetArray.push("Continuous");
 
                                     presetArray.push(readData[18]);
                                     presetArray.push(readData[10]);
                                     presetArray.push(readData[12]);
                                     presetArray.push(readData[13]);
 
                                     console.log(presetArray);
                                     masterPresetArray.unshift(presetArray);
 
                                  }
                                 return resolve([1,999,999]); 
                             }
                             else if(256*address[0]+address[1]>896)
                             {
                                 console.log("Read Data Is "+readData);
                                 console.log("LAst Time "+userDeviceInfo.lastdatatime);
                                 var newRecords = false;
                                 if(userDeviceInfo == "null" || !userDeviceInfo.hasOwnProperty('lastdatatime') || ((lastUsageAddress != null && (256*address[0]+address[1]).toString() >= lastUsageAddress) && userDeviceInfo.lastdatatime < convertDateStringForCompare(readData[1],readData[2],readData[3],readData[4],readData[5])))
                                 {
                                     if(readData[0] == 93)
                                     {
                                         usageCount++;
                                         console.log("Birds "+usageCount);
                                         //setUsageCount(uCount);
                                         newRecords = true;
                                         console.log("Usage "+["U",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),readData[6]-128, calculation(readData[8],readData[9]),calculation(readData[10],readData[11]),readData[12],readData[13],readData[14],readData[15],256*address[0]+address[1]]);
                                         usageArray.push(["U",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),readData[6]-128, calculation(readData[8],readData[9]),calculation(readData[10],readData[11]),readData[12],readData[13],readData[14],readData[15],256*address[0]+address[1]]);
                                         console.log("Array So Far "+usageArray);
                                     }
                                     if(readData[0] == 173)
                                     {
                                        questionCount++;
                                        console.log("Bees "+questionCount);
                                        //setQuestionCount(qCount);
                                         newRecords = true;
                                         console.log("Answer "+["A",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),answers[readData[6]],answers[readData[7]],answers[readData[8]],answers[readData[9]],answers[readData[10]],256*address[0]+address[1]]);  
                                         usageArray.push(["A",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),answers[readData[6]],answers[readData[7]],answers[readData[8]],answers[readData[9]],answers[readData[10]],256*address[0]+address[1]]);
                                         console.log("Arrayy Soo Fffar "+usageArray);
                                     }
                                     console.log("Usage "+usageCount+" Question "+questionCount);
                                 }
                                 else
                                 {
                                     console.log("Go To Preset Data");
                                     AsyncStorage.setItem("lastAddress",(256*address[0]+address[1]).toString());
                                     return resolve([2,999,999]);
                                 }
                                 return resolve([3,999,999]);
                                 /*
                                 if(address[1] == 0)
                                 {
                                     getDeviceData(peripheral,[address[0]-1,240]);
                                 }
                                 else
                                 {
                                     getDeviceData(peripheral,[address[0],address[1]-16]);
                                 }
                                 */
                             }
                             else
                             {                           
                                
                                console.log("Uploading Data To Server!");
                                console.log("Here we do "+lastUsageAddress);
                                
                                //return;
                                var jsonData = "{";
                                jsonData += '"SerialNumber":"'+currentUserData.serialnumber+'","UserInfo":{"PatientName":"'+currentUserData.name+'","PatientEmail":"'+currentUserData.email+'","DoctorEmail":"'+currentUserData.doctorEmail+'","DeviceName":"Avid IF2"},';
                                jsonData += '"Usage":[';
                                for(var i = 0; i < usageArray.length;i++)
                                {
                                  if(usageArray[i][0] == "U")
                                  {
                                    console.log("Date Is "+usageArray[i][1][0]);
                                    jsonData += '["'+usageArray[i][0]+'",["'+usageArray[i][1][0]+'","'+usageArray[i][1][1]+'"],'+usageArray[i][2]+','+usageArray[i][4]+','+usageArray[i][3]+','+usageArray[i][5]+','+usageArray[i][6]+','+usageArray[i][7]+','+usageArray[i][8]+','+usageArray[i][9]+']';
                                  }
                                  else
                                  {
                                    jsonData += '["'+usageArray[i][0]+'",["'+usageArray[i][1][0]+'","'+usageArray[i][1][1]+'"],';
                               
                                    for(var j = 2;j<8;j++)
                                    {
                                      if(isNaN(usageArray[i][j]))
                                        jsonData += '"'+usageArray[i][j]+'"';
                                      else
                                        jsonData += usageArray[i][j];
                                      if(j != 7)
                                        jsonData+= ",";
                                      else
                                        jsonData+= "]";
                                    }
                                  }
                                  if(i != usageArray.length - 1)
                                    jsonData += ",";
                           
                                }
                                jsonData += '],';
                                jsonData+= '"Config":["'+configArray[0]+'","'+configArray[1]+'","'+configArray[2]+'","'+configArray[3]+'","'+configArray[4]+'"]';
                                jsonData += ',"Preset":[';
                                for(var i = 0;i<masterPresetArray.length;i++)
                                {
                                  jsonData += '["'+masterPresetArray[i][0]+'","'+masterPresetArray[i][1]+'","'+masterPresetArray[i][2]+'","'+masterPresetArray[i][3]+'","'+masterPresetArray[i][4]+'","'+masterPresetArray[i][5]+'","'+masterPresetArray[i][6]+'","'+masterPresetArray[i][7]+'","'+masterPresetArray[i][8]+'"]';
                                  if(i != masterPresetArray.length - 1)
                                    jsonData += ",";
                                }
                                jsonData+=']';
                                jsonData += "}";
                                //console.log(jsonData);
                           
                           
                             /*
                             token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyTmFtZSI6InJ1c3NlbGxfam93ZWxsIiwiaGFzaCI6Ijk5NDVhOGM3MzQwYzNlZWY1YmZjNmIwYzQ5NTQ5YmIzIiwiUGVybWlzc2lvbiI6NSwiaWF0IjoxNjc0NTAxNzk4LCJleHAiOjE2NzczODE3OTh9.69wZGgeSBXvaPmxXu7URgXhYu_-ZfZjUis1oxu32EYg
                               action=insertData
                               dataJson={"SerialNumber":"F001451","Usage":[["U",["Oct. 12 2022","06:15 PM"],0,0,0,0,0,0,0,0],["A",["Oct. 12 2022","06:20 PM"],0,0,0,0,0,0]],"Preset":[[0,0,0,0,0,0,0,0,0]],"Config":[2,2,2,2,2],"UserInfo":{"PatientName":"Russell Jowell","PatientEmail":"russ.jowell@gmail.com","DoctorEmail":"russdoctor@medical.com","DeviceName":"Avid IF2"}}
                           */
                             
                             const dataRequestOptions = {
                             
                               method:'POST',
                               headers: {'x-access-token':currentUserData.token},
                               body: 'action=insertData&dataJson='+jsonData+'&appversion='+appVersion
                               //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
                           
                           
                             };
                             
                             console.log(dataRequestOptions.body);
                             console.log("Cheese Puffs are GREAT!!");
                             //fetch('https://avid.vqconnect.io/nodejs/deviceList',dataRequestOptions).then((response)=>response.json()).then((responseJson)=>{
                              fetch('https://avid.vqconnect.io/nodejs/deviceList',dataRequestOptions).then((response)=>response.json()).then((responseFromJson)=>  { 
                              
                              console.log("Yessssir");
                              AsyncStorage.getItem("lastAddress").then((value)=>{
                                console.log("The last value was this: "+value);
                              });
                              //AsyncStorage.setItem("lastAddress",lastUsageAddress.toString());  
                              return resolve([4,questionCount,usageCount]);
                              /*  
                              console.log("Error Is "+responseFromJson.code+"  "+responseFromJson.msg);
                                BleManager.disconnect(peripheral.id);
                              if(isBackgroundScan)
                                showNotifiction("Success","We downloaded "+usageCount.toString()+" usage records and "+questionCount.toString()+" answer records!");
                              else
                                {

                                }
                              //console.log("Upload Complete. Get it!!");
                              //console.log("Step One ");
                              setCurrentMonth([new Date().getMonth(),new Date().getFullYear()]);
                              //console.log("Step Two A");
                              updateCalendar([new Date().getMonth(),new Date().getFullYear()]);
                              //console.log("Step Three");
                              fetch("https://avid.vqconnect.io/nodejs/deviceList?action=findUsageData&SerialNumber="+currentUserData.serialnumber+"&token="+currentUserData.token).then((response)=>response.json()).then((responseJson)=>{
                                  if(responseJson.code == 207)
                                  {
                                      userDeviceInfo = "null";
                                  }      
                                  else
                                    setLastUploadTime(responseJson.data.lastdatatime);
                        //updateMarkedDates(responseJson);  
                              });//End FEtch
                    
                              setIsUpdating(false);
                              setUploadStatus(uploadStatus+"\nUpload Complete!");
                      Alert.alert("Notice","Upload Complete",[{text:'OK',onPress:()=>{
                          
                          setScanStatus("");
                          setIsUpdating(false);
                          setIsScanning(false);
                          setScanButtonColor("white");
                          setScanButtonOpacity(1.0);
                        
                        
                        }}
                    
                    
                      ]);
                    console.log("Upload Complete. Hooray!");
                  
                      */
                  }).catch((error)=>{console.log("Upload Error "+error);
                
                  return reject("Upload Error. Sorry");
                });
                            return;
                          
                          
                          
                          
                          
                          
                          
                          
                             }
 
                         }).catch((error)=>{showNotifiction("Read Error",error)});
                     },500);
                 }).catch((error)=>{showNotifiction("Write Error",error)});
 
             }).catch((error)=>{showNotifiction("Retrieve Service Error",error)});
         }).catch((error)=>{showNotifiction("Connect Error",error)});
 
     }).then((returnVal)=>{
         switch(returnVal[0])
         {
          //Initial Read
          case 0:
            if(returnVal[2] == 0)
              return getDeviceData(peripheral,[returnVal[1]-1,0]);
            else
              return getDeviceData(peripheral,[returnVal[1],returnVal[2]-16]);
          case 1:
            if(address[1] == 0)
              return getDeviceData(peripheral,[address[0]-1,240]);
            else
              return getDeviceData(peripheral,[address[0],address[1]-16]);
            //break;
          case 2:
            return getDeviceData(peripheral,[3,80]);
          case 3:
            //setUsageCount(returnVal[1]);
            //setQuestionCount(returnVal[2]);
            if(address[1] == 0)
                return getDeviceData(peripheral,[address[0]-1,240]);
            else
                return getDeviceData(peripheral,[address[0],address[1]-16]);
          case 4:

          /*

          var nowTime = new Date();
          console.log(nowTime.getYear()-100+" "+(Number(nowTime.getMonth())+1)+" "+nowTime.getDate()+" "+nowTime.getHours()+" "+nowTime.getMinutes()+" "+nowTime.getSeconds());

          */
          
          var nowTime= new Date();  
          let dateMessage = [128,Number(nowTime.getYear()-100),Number((nowTime.getMonth())+1),Number(nowTime.getDate()),Number(nowTime.getHours()),Number(nowTime.getMinutes()),Number(nowTime.getSeconds())];

            BleManager.connect(peripheral.id).then(()=>{

              BleManager.retrieveServices(peripheral.id,["F0001110-0451-4000-B000-000000000000"]).then((peripheralInfo)=>{

                BleManager.write(peripheral.id,"F0001111-0451-4000-B000-000000000000","F0001131-0451-4000-B000-000000000000",dateMessage).then(()=>{
                  console.log("Write New Time Success");

                });

              });


            });

            return(["Success",returnVal[1],returnVal[2]]);
         }
     }).catch((error)=>{
        if(error == "Upload Error. Sorry")
          return(["Fail","There was an upoload error!"]);
        return(["Fail",error]);
     });//End Main Promise
 }

 /////////




  function updateConnectTime(peripheral)
  {

  }
  
  function handleDiscoverDevice(peripheral){

    //console.log("Device Is "+currentUserData.serialNumber);
    
    if(peripheral.name != null && peripheral.advertising.localName != null && peripheral.advertising.localName.substring(0,4) == "Avid")
    {
      var trueFalse = peripheral.advertising.localName == "Avid "+currentUserData.serialnumber ? "Yes":"No";
      
      showNotifiction("Notice","We found device SN "+peripheral.advertising.localName+" Is this your device? "+trueFalse);
    }
    
    if(peripheral.name != null && peripheral.advertising.localName == "Avid "+currentUserData.serialnumber)
    {
      BleManager.stopScan();

        console.log("Reading Data from Device - Please Wait "+currentUserData.serialnumber);
        //showNotifiction("Reading Data from Device - Please Wait "+currentUserData.serialnumber);
        setScanStatus("Reading Data from Device - Please Wait "+currentUserData.serialnumber);
        getDeviceData(peripheral,[0,0]).then((result)=>{

          
        setScanStatus("");
        setIsUpdating(false);
        console.log("Is Updating Is "+isUpdating);
        setIsScanning(false);
        console.log("Is Scanning Is "+isScanning);
        setScanButtonColor("white");
        setScanButtonOpacity(1.0);
          if(isBackground)
          {
            if(result[0] == "Success")
              showNotifiction("Notice","We uploaded records "+result[1]+" "+result[2]);
            else
              showNotifiction("Notice",result[1]);
          }
          else
          {
            if(result[0] == "Success")
              Alert.alert("Notice","Success");
            else 
              Alert.alert("Notice","Fail "+result[1]);
          }
          console.log("Things were a succes! ");
          console.log(result);

        });
        
       


     
    }
    

  }

  


  function updateCalendar(dayInfo)
  {
    setIsUpdating(true);
    console.log("The Day Is "+dayInfo);
    getMonthUsageData(dayInfo[0],dayInfo[1]).then((result)=>{

      console.log(result);
      updateMarkedDates(result);
      setIsUpdating(false);

    });
  }

  const startDeviceScanButton = (isBackground) => {

    
    
    
    setIsUpdating(true);
    setIsScanning(true);
    setScanButtonColor("#bbb");
    setScanButtonOpacity(0.3);
    setScanStatus("Scanning for Device");
    
    BleManager.scan([],13,false);

  

//#fad7ed

  }


return(

<View style={{width:'100%'}}>
<View style={{marginTop:'5%',marginHorizontal:'5%',marginBottom:'5%'}}>
<View style={{flexDirection:'row'}}>{Circle("green",10)}<Text style={styles.grayButton}>&nbsp;&nbsp;Usage total time &gt;= 20</Text></View>
<View style={{flexDirection:'row'}}>{Circle("purple",10)}<Text style={styles.grayButton}>&nbsp;&nbsp;Usage total time &lt; 20</Text></View>
<View style={{flexDirection:'row'}}>{Circle("red",10)}<Text style={styles.grayButton}>&nbsp;&nbsp;All questions are answered</Text></View>
<View style={{flexDirection:'row'}}>{Circle("pink",10)}<Text style={styles.grayButton}>&nbsp;&nbsp;Some Questions Skipped</Text></View>
</View>
<Calendar markedDates={markedDates}  onDayPress={day=>{console.log("The Day Is "+day.dateString);if(day.dateString in markedDates){navigation.navigate("USAGE SUBSTACK",{currentDate:day.dateString,from:"calendar"});}  }} onMonthChange={month => {console.log(month);setCurrentMonth([month.month,month.year]);updateCalendar([month.month,month.year]);setDatesUpdated(false);}} markingType={'multi-dot'}></Calendar>
<Text style={[styles.grayButton,{alignSelf:'center',fontSize:28,marginTop:'8%'}]}>Your Current Device:</Text>
<Text style={[styles.grayButton,{alignSelf:'center',fontSize:23}]}>{currentDeviceString}</Text>
<TouchableOpacity disabled={isScanning} alignSelf='center' onPress={()=>{Alert.alert("Prepare To Connect","Please ensure your paired AVID device is turned on and Bluetooth mode is activated",[{text:"OK",onPress:()=>{setIsBackground(false);startDeviceScanButton();}}]);}} style={{opacity:scanButtonOpacity, alignSelf:'center', marginTop:30,marginBottom:5, backgroundColor: "#722053", width:"80%" }}><Text style={{ fontFamily: "Proxima Nova",fontWeight:'bold',color:scanButtonColor, textAlign: 'center', fontSize: 25, margin:10, }}>Sync Device Data</Text></TouchableOpacity>
<Text style={{fontSize:17,color:'grey',alignSelf:'center'}}>{scanStatus}</Text>
<Text style={[styles.grayButton,{alignSelf:'center',fontSize:23,marginTop:'8%'}]}>Last Upload Time:</Text>
<Text style={[styles.grayButton,{alignSelf:'center',fontSize:18}]}>{moment(lastUploadTime,'YYYY-MM-DD').format('MMM DD, YYYY')}</Text>
</View>

);

}

const SignupScreen = ({navigation}) => {

  
  const [formValid,setFormValid] = React.useState(false);
  //const [emailStatus,setemailstatus] = [usernameStatus,setUsernameStatus] = [confirmPassword,setConfirmPassword] = [accountNumber,setAccountNumber] = [username,setUsername] = [eMail,setEmail] = [nameEntry,setNameEntry] = [password,setPassword],[doctorEmail,setDoctorEmail],[email1,setemail1],[email2,setemail2],[email3,setemail3] = React.useState("");
  const [username,setUsername] = React.useState("");
  const [eMail,setEmail] = React.useState("");
  const [nameEntry,setNameEntry] = React.useState("");
  const [patientName,setPatientName] = React.useState("");
  const [password,setPassword] = React.useState("");
  const [doctorEmail,setDoctorEmail] = React.useState("");
  const [email1,setemail1] = React.useState("");
  const [email2,setemail2] = React.useState("");
  const [email3,setemail3] = React.useState("");
  const [accountNumber,setAccountNumber] = React.useState("");
  const [confirmPassword,setConfirmPassword] = React.useState("");
  const [userLabelColor,setUserLabelColor] = React.useState('grey');
  const [emaillabelColor,setEmailLabelColor] = React.useState('grey');
  const [nameLabelColor,setNameLabelColor] = React.useState('grey');
  const [passwordLabelColor,setPasswordLabelColor] = React.useState('grey');
  const [confirmPasswordLabelColor,setConfirmPasswordLabelColor] = React.useState('grey');
  const [usernameStatus,setUsernameStatus]=React.useState("");
  const [emailStatus,setemailstatus] = React.useState("");
  const [confirmPasswordStatus,setConfirmPasswordStatus] = React.useState("");

  const usernameRef = useRef();
  const eMailRef = useRef();
  const doctorRef = useRef();
  const email1Ref = useRef();
  const email2Ref = useRef();
  const email3Ref = useRef();
  const nameRef = useRef();
  const acctRef = useRef();
  const passwordRef = useRef();
  const confirmRef = useRef();
  
  function buildUserObject()
  {
    var object = {};
    object.name = nameEntry;
    object.email = eMail;
    object.username = username;
    object.password = password;
    object.doctorEmail = doctorEmail;
    object.additionalEmail2 = email2;
    object.additionalEmail3 = email3;
    object.additionalEmail = email1;
    object.accountNumber = accountNumber;
    return object;
  }


  /*
   var result = await new AdminModel({
                "PatientName"       : whereJson.name,
                "email"             : whereJson.email.toLowerCase(),  // 之前Register的Patientemail
                "doctorEmail"       : whereJson.doctorEmail.toLowerCase(),
                "additionalEmail2"  : whereJson.additionalEmail2.toLowerCase(),
                "additionalEmail3"  : whereJson.additionalEmail3.toLowerCase(),
                //
                "additional_email": whereJson.additionalEmail.toLowerCase(),
                "user_name": whereJson.username,
                "password": newPassword,
                "accountNumber": whereJson.accountNumber,
                "emailstatus":0,
                "permission": 5,
                "serial_number": whereJson.serialNumber,
                "permission_name": "Patient",
                "create_time": dtime().format('YYYY-MM-DD HH:mm:ss'),
                "DeviceExpried":"0",
                "ExpriedTime":"",
                "Group":{GroupID:'',GroupName:'',},
                "Clinic":{GroupID:'',GroupName:'',},
                "fire_id":'',
                "rep_times":0,
                "rep_frequency":0,
                "deleted": 0,
            });
  
  
  */ 
  
  
  function checkInput(type,value)
  {
    setFormValid(true);
    if(value == "")
    {
      type == "user" ? setUsernameStatus(""):setemailstatus("");
      return;
    }
    const statusMsg = type == "user"?"Username already taken":"E-mail already in use";
    
    console.log("Validate");
    setTimeout(()=>{

      //var requestOptions;
      var insertString = type == "user" ? "checkUsername&username="+value:"checkEmail&email="+value;
      
        
        
       var requestOptions = {method:'POST',headers: new Headers({'Content-Type': 'application/x-www-form-urlencoded', /* <-- Specifying the Content-Type*/}),body: 'action='+insertString+'&appversion='+appVersion};
          //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
      fetch('https://avid.vqconnect.io/nodejs/login',requestOptions).then((res)=>res.json()).then((resjson)=>{

        
      if(resjson.code == "202")
        setFormValid(false);
       
        
      
      if(type=="user")
      {
        if(resjson.code == "202")
        {
          setUsernameStatus(statusMsg);
          setUserLabelColor("red");
        }
        else
        {
          setUsernameStatus("");
          setUserLabelColor("grey");
        }
      }
      else
      {
        if(resjson.code == "202")
        {
          setemailstatus(statusMsg);
          setEmailLabelColor("red");
        }
        else
        {
          setemailstatus("");
          setEmailLabelColor("grey");
        }
      }
      
      
      });
     


    },100);
    
  }
  
  
  function validateForm()
  {
    return new Promise(function(resolve,reject){
    var status = true;
    var color="";
    const fields = [username,eMail,nameEntry,password];
    const labels = [setUserLabelColor,setEmailLabelColor,setNameLabelColor,setPasswordLabelColor];
    let reg = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w\w+)+$/;

    //Checking for Blank Fields
    for(var i = 0;i<fields.length;i++)
    {
      
      if(fields[i]=="")
      {
        status=false;
        console.log(fields[i]);
        color="red";
      }
      else
        color="grey";
      
      console.log(fields[i] == "");
      //fields[i] == "" ? ()=>{console.log("birds");setFormValid(false);color="red";}:color="grey";
      console.log(color);
      labels[i](color);
      console.log("Form Valid "+formValid);
    }
    if(password != "" || confirmPassword != "")
    {
      if(password != confirmPassword)
      {
        setPasswordLabelColor("red");
        setConfirmPasswordLabelColor("red");
        setConfirmPasswordStatus("Passwords Don't Match");
        status = false;
      }
      else
      {
        setPasswordLabelColor("grey");
        setConfirmPasswordLabelColor("grey");
        setConfirmPasswordStatus("");
      }}
    if(eMail.indexOf('@') <= -1 || eMail.indexOf(' ') > -1 || eMail.indexOf('.') <=1)
    {
          setemailstatus("E-mail format is not correct");
          setEmailLabelColor("red");
          status=false;
    }
    else
    {
          setemailstatus("");
          setEmailLabelColor("grey");
    }
    
   
    if(status == false)
      Alert.alert("Signup Error","There are errors on your form. Please correct them before continuing");
    resolve(status);
  });
    
  
  }

 

  return(
    <View style={{height:'100%',backgroundColor:'white'}}>
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
    <KeyboardAwareScrollView contentContainerstyle={{width:'65%',marginTop:'5%',backgroundColor:'white',alignItems:'center'}}>
    
     
    {/*<ScrollView style={{marginTop:'5%',width:'85%'}} >*/}
    <View style={{flex:5,alignSelf:'center',height:'50%',width:'85%',marginTop:'5%'}}>
    <View style={{flexDirection:'row',marginBottom:'2%'}}>
    <Text style={[styles.signUpLabels,{color:userLabelColor}]}>Username*</Text>
    <Text style={{color:'red',fontSize:10,marginBottom:'2%'}}>{usernameStatus}</Text>
    </View>
    <TextInput onSubmitEditing={()=>eMailRef.current.focus()} ref={usernameRef} style={styles.textFields} onChangeText={(text)=>{setUsername(text);checkInput("user",text);}} value={username}></TextInput>
    
    <View style={{flexDirection:'row',marginBottom:'2%',marginTop:'3%'}}>
    <Text style={[styles.signUpLabels,{color:emaillabelColor}]}>E-Mail*</Text>
    <Text style={{color:'red',fontSize:10,marginBottom:'2%'}}>{emailStatus}</Text>
    </View>
    <TextInput onSubmitEditing={()=>doctorRef.current.focus()} ref={eMailRef} style={styles.textFields} onChangeText={(text)=>{setEmail(text);checkInput("email",text);}} value={eMail}></TextInput>
    
    
    <Text style={[styles.signUpLabels,{marginBottom:'3%',marginTop:'3%'}]}>Doctor E-mail</Text>
    <TextInput onSubmitEditing={()=>email1Ref.current.focus()} ref={doctorRef} style={styles.textFields} onChangeText={(text)=>{setDoctorEmail(text);}} value={doctorEmail}  ></TextInput>
    
   
    <Text style={[styles.signUpLabels,{marginBottom:'3%',marginTop:'3%'}]}>Additional E-Mail 1</Text>
    <TextInput onSubmitEditing={()=>email2Ref.current.focus()} ref={email1Ref} style={styles.textFields} onChangeText={(text)=>{setemail1(text);}} value={email1}></TextInput>
    
    <Text style={[styles.signUpLabels,{marginBottom:'3%',marginTop:'3%'}]}>Additional E-mail 2</Text>
    <TextInput onSubmitEditing={()=>email3Ref.current.focus()} ref={email2Ref} style={styles.textFields} onChangeText={(text)=>{setemail2(text);}} value={email2}></TextInput>
   
    <Text style={[styles.signUpLabels,{marginBottom:'3%',marginTop:'3%'}]}>Additional E-mail 3</Text>
    <TextInput onSubmitEditing={()=>nameRef.current.focus()} ref={email3Ref} style={styles.textFields} onChangeText={(text)=>{setemail3(text);}} value={email3}></TextInput>
    
    
    <Text style={[styles.signUpLabels,{color:nameLabelColor,marginBottom:'3%',marginTop:'5%'}]}>Name*</Text>
    <TextInput onSubmitEditing={()=>acctRef.current.focus()} ref={nameRef} style={[styles.textFields,{marginTop:'5%'}]} onChangeText={(text)=>{setNameEntry(text);}} value={nameEntry}></TextInput>
    
    <Text style={[styles.signUpLabels]}>Account Number</Text>
    <TextInput onSubmitEditing={()=>passwordRef.current.focus()} ref={acctRef} style={styles.textFields} onChangeText={(text)=>{setAccountNumber(text);}} value={accountNumber}></TextInput>
    
    <Text style={[styles.signUpLabels,{color:passwordLabelColor}]}>Password*</Text>
    <TextInput onSubmitEditing={()=>confirmRef.current.focus()} ref={passwordRef} style={styles.textFields} onChangeText={(text)=>{setPassword(text);}} value={password}></TextInput>
    
   
    <View style={{flexDirection:'row',marginBottom:'3%'}}>
    <Text style={[styles.signUpLabels,{color:confirmPasswordLabelColor}]}>Confirm Password*</Text>
    <Text style={{color:'red',fontSize:10}}>{confirmPasswordStatus}</Text>
    </View>
    <TextInput ref={confirmRef} style={[styles.textFields,{marginBottom:'1%'}]} onChangeText={(text)=>{setConfirmPassword(text);}} value={confirmPassword}></TextInput>
    
    
   
    </View>
    
    
    

    </KeyboardAwareScrollView>
    </TouchableWithoutFeedback>
    
    <TouchableOpacity onPress={()=>{validateForm().then(result=>{if(result==true){navigation.navigate("Select Device",{newUserInfo:buildUserObject()})}else{console.log("FormNotValid");}});}} style={{ alignSelf:'center', marginTop:50,marginBottom:50, backgroundColor: '#722053', width:"80%" }}><Text style={{ fontFamily: "Verdana-Bold",color: '#fff', textAlign: 'center', fontSize: 25, margin:10, }}>Signup</Text></TouchableOpacity>
   
    </View>
    
  );


}

export default App;