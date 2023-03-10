/**
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * 
 * Sample React Native App
 * https://github.com/facebook/react-native
 *
 * @format
 * @flow strict-local
 * 
 * 
 * 
 * FIREBASE: https://rnfirebase.io/auth/usage
 * 
 */
import 'react-native-gesture-handler';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import { createStackNavigator, HeaderBackButton } from '@react-navigation/stack';
import BleManager, { read } from 'react-native-ble-manager';
import React, { useCallback } from 'react';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
//import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import Buffer from 'buffer';
import {
  Alert,
  ActivityIndicator,
  SafeAreaView,
  ScrollView,
  StatusBar,
  StyleSheet,
  Text,
  Pressable,
  TextInput,
  Button,
  TouchableOpacity,
  NativeModules,
  NativeEventEmitter,
  Image,
  useColorScheme,
  View,
  requireNativeComponent,
  TouchableHighlight,
} from 'react-native';
import { config, send } from 'process';
import { add } from 'react-native-reanimated';
import { BleATTErrorCode } from 'react-native-ble-plx';



const Drawer = createDrawerNavigator();
const Stack = createStackNavigator();
//const bleManagerModule = NativeModules.BleManager;
const userAccountPtr = firestore().collection("User Accounts");
//var token = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyTmFtZSI6ImFkbWluIiwiaGFzaCI6ImUxMGFkYzM5NDliYTU5YWJiZTU2ZTA1N2YyMGY4ODNlIiwiUGVybWlzc2lvbiI6MSwiaWF0IjoxNTQyOTY0MzAzLCJleHAiOjE1NDU4NDQzMDN9.5pEJJAOY8cVLZiBgo8Qszq8EZPHDFyyvqsriBxGXLTo'
var appVersion = '1.1.0';
var usageRecords = [];
var qeustionRecords = [];
var currentUserData;
const languages = ['English','Spanish','French','German'];
const lastMemoryAddress = [3,128];
var currentConnectedDeviceID;
const months = ["Jan.","Feb.","Mar.","Apr.","May.","Jun.","Jul.","Aug.","Sept.","Oct.","Nov.","Dec."];
const avidPurpleHex = '#722053';


var configArray;
var lastUsageAddress;
var usageArray = [];
//var months = ["Jan.","Feb.","Mar.","Apr.","May.","Jun.","Jul.","Aug.","Sep.","Oct.","Nov.","Dec."];
var answers = [0,1,2,3,4,5,6,7,8,9,10,'N','Y','NA','S','default'];



//console.log("Cheeseburger1 "+bleManagerModule);
const bleManagerEmitter = new NativeEventEmitter(NativeModules.BleManager);
//var auth;


//import type {Node} from 'react';

/* $FlowFixMe[missing-local-annot] The type annotation(s) required by Flow's
 * LTI update could not be added via codemod */


class UsageSessionObject
{
  constructor(year,month,day,hour,minute,preset,minutesOfUse,minutesOfPause,ch1max,ch1avg,ch2max,ch2avg)
  {
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
    this.preset = preset;
    this.minutesOfUse = minutesOfUse;
    //this.minutesOfUse = secondsOfUse;
    this.minutesOfPause = minutesOfPause;
    //this.secondsOfPause = secondsOfPause;
    this.ch1max = ch1max;
    this.ch1avg = ch1avg;
    this.ch2max = ch2max;
    this.ch2avg = ch2avg;

  }

}

class QuestionObject
{
  constructor(year,month,day,hour, minute,q1,q2,q3,q4,q5)
  {
    this.year = year;
    this.month = month;
    this.day = day;
    this.hour = hour;
    this.minute = minute;
    this.q1=q1;
    this.q2=q2;
    this.q3=q3;
    this.q4=q4;
    this.q5=q5;
  }
}



const App = () =>
{
    
    
   
  React.useEffect(()=>{

      BleManager.start();


      
      //bleManagerEmitter.addListener('BleManagerStopScan', handleStopScan);



    });

    
    


    
    

    /*

    token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyTmFtZSI6InJ1c3NlbGxfam93ZWxsIiwiaGFzaCI6Ijk5NDVhOGM3MzQwYzNlZWY1YmZjNmIwYzQ5NTQ5YmIzIiwiUGVybWlzc2lvbiI6NSwiaWF0IjoxNjc0NTAxNzk4LCJleHAiOjE2NzczODE3OTh9.69wZGgeSBXvaPmxXu7URgXhYu_-ZfZjUis1oxu32EYg
action=insertData
dataJson={"SerialNumber":"F001451","Usage":[["U",["Oct. 12 2022","06:15 PM"],0,0,0,0,0,0,0,0],["A",["Oct. 12 2022","06:20 PM"],0,0,0,0,0,0]],"Preset":[[0,0,0,0,0,0,0,0,0]],"Config":[2,2,2,2,2],"UserInfo":{"PatientName":"Russell Jowell","PatientEmail":"russ.jowell@gmail.com","DoctorEmail":"russdoctor@medical.com","DeviceName":"Avid IF2"}}


    */


    /*
    const dataRequestOptions = {
      
      method:'POST',
      headers: {'x-access-token':'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyTmFtZSI6InJ1c3NlbGxfam93ZWxsIiwiaGFzaCI6Ijk5NDVhOGM3MzQwYzNlZWY1YmZjNmIwYzQ5NTQ5YmIzIiwiUGVybWlzc2lvbiI6NSwiaWF0IjoxNjc0NTAxNzk4LCJleHAiOjE2NzczODE3OTh9.69wZGgeSBXvaPmxXu7URgXhYu_-ZfZjUis1oxu32EYg'},
      body: 'action=insertData&dataJson='+JSON.stringify({'SerialNumber':'F001451'})+'&appversion='+appVersion
      //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion


    };
    console.log(JSON.stringify({"SerialNumber":"F001451"}));
    fetch('https://avid.vqconnect.io/nodejs/deviceList',dataRequestOptions).then((response)=>response.json()).then((responseJson)=>{

      console.log("Response Is "+responseJson.data);

    }).catch((error,data)=>{console.log("The Error "+error+" "+data)});
    */

    console.log("Pissy Person");
    //console.log(JSON.stringify({"SerialNumber":"F001451"}));

    //bleManagerEmitter.addListener('BleManagerDidWrite', handleDidWrite );

   
      
        /*
        <Drawer.Navigator screenOptions={{drawerActiveTintColor:'white',drawerInactiveTintColor:'white',  drawerStyle:{drawerActiveTintColor:'yellow',  backgroundColor: '#722080'}}}>
          <Drawer.Screen name="USAGE DATA HISTORY" component={UsageHistoryScreen}/>
          
          <Drawer.Screen name="CONNECTION" component={ConnectionScreen}/>
          <Drawer.Screen name="SIGNUP" component={SignupScreen}/>
          <Drawer.Screen name="REGISTER DEVICE" component={Register_Device}/>
          <Drawer.Screen name="ABOUT" component={About}/>
          <Drawer.Screen name="LOGOUT" component={About}/>
          
          <Drawer.Screen name="SELECT_DEVICE" component={SelectDeviceScreen}/>
        </Drawer.Navigator>
        
        */

       
        
   const MainStack = ({route,navigation}) => (

    
    <Drawer.Navigator initialRouteName='CONNECTION' screenOptions={{drawerActiveTintColor:'white',drawerInactiveTintColor:'white',  drawerStyle:{drawerActiveTintColor:'yellow',  backgroundColor: avidPurpleHex}}}>
    
    <Drawer.Screen name="CONNECTION" component={ConnectionScreen} options={{headerStyle:{backgroundColor:avidPurpleHex},headerTintColor:'white'}}/>
    
    <Drawer.Screen name="USAGE HISTORY" initialParams={{month:new Date().getMonth()+1,day:new Date().getDate(),year:new Date().getFullYear()}} component={UsageHistoryScreen} options={{headerStyle:{backgroundColor:avidPurpleHex},headerTintColor:'white'}}/>
    <Drawer.Screen name="USAGE SUBSTACK" component={UsageHistoryStack} options={{drawerItemStyle:{display:"none"},unmountOnBlur:true,headerShown:false}}/>
    
   
    <Drawer.Screen name="REGISTER DEVICE" component={Register_Device}/>
    <Drawer.Screen name="ABOUT" component={About}/>
    <Drawer.Screen name="LOGOUT" component={Logout}/>
    
    {/*<Drawer.Screen name="SELECT_DEVICE" component={SelectDeviceScreen}/>*/}
  </Drawer.Navigator>

   );


   const UsageHistoryStack = ({route,navigation}) => {

    
    
    function convertDateString(input)
    {
      const months = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"];
      return months[parseInt(input.substring(6,7))-1]+" "+input.substring(8,10)+", "+input.substring(0,4);
    }
    
    
    
    return(<Stack.Navigator initialRouteName='Day Use Screen' >
    
    
    <Stack.Screen name="Day Use Screen" options={{headerStyle:{backgroundColor:avidPurpleHex},headerTintColor:'white',title: convertDateString(route.params.currentDate), headerShown:true, headerLeft: ()=>(<TouchableOpacity onPress={()=>{navigation.navigate("USAGE HISTORY");}}><Text style={{fontWeight:'bold',fontSize:17,color:'white'}}>&nbsp;&lt; Back</Text></TouchableOpacity>    ),}}  initialParams={{currentDate:route.params.currentDate,from:route.params.from}} component={DayUsageScreen}/>
    <Stack.Screen name="Usage Data Detail" component={UsageDetailScreen} options={{headerStyle:{backgroundColor:avidPurpleHex},headerTintColor:'white',drawerItemStyle:{display:'none'}}}/>
    
    </Stack.Navigator>);
  
   };
  

  return(


    
      <NavigationContainer>
    <Stack.Navigator initialRouteName="Login">
      <Stack.Screen name="Login" component={LoginScreen} options={{headerShown:false}}/>
      <Stack.Screen name="Sign Up" component={SignupScreen} options={{headerStyle:{backgroundColor:avidPurpleHex},headerTintColor:'white'}}/>
      <Stack.Screen name="Main" component={MainStack} options={{headerShown:false}}/>
    </Stack.Navigator>
    </NavigationContainer>
    
    
    
    
   
    
    
  
  )

}





function Logout({navigation})
{
  currentUserData = null;
  navigation.navigate("Login");
}

const SelectDeviceScreen = ({navigation}) => {

 //const [deviceList,setDeviceList] = React.useState<Element>();
 var devices = [];
 var buttons = [];

 function renderButton(deviceName)
 {
  console.log("Button Name is "+deviceName);
  return(
    <Button title={deviceName}></Button>
  );
 }


 const renderButtons = buttons =>{

  return buttons.map(devName=>{

    return(renderButton(devName));

  });

 }

var [deviceList,setDeviceList] = React.useState([]);
var [foundDevices,setFoundDevices] = React.useState([]);
var [currentDevice,setCurrentDevice] = React.useState("");



const handleFoundDevice = (peripheral) => {


  
  
  console.log("We Found One "+peripheral.id);
  
  

  if(peripheral.name != null && peripheral.name.substring(0,4) == "Avid" && !foundDevices.includes(peripheral.advertising.localName.substring(5)))
  {
    
    setDeviceList(deviceList => [...deviceList,<Pressable onPress={()=>{console.log(props.id)}} id={peripheral.advertising.localName.substring(5)} style={{ marginTop:20,marginBottom:10, backgroundColor: '#722053', width:"80%" }}><Text style={{ fontFamily: "Verdana-Bold",color: '#fff', textAlign: 'center', fontSize: 15, margin:3, }}>{peripheral.advertising.localName.substring(5)}</Text></Pressable>])
    //setDeviceList(deviceList => [...deviceList,<Button title={peripheral.advertising.localName.substring(5)}></Button>]);
    setFoundDevices(foundDevices =>[...foundDevices,peripheral.advertising.localName.substring(5)]);
    /*
    devices.push(peripheral.advertising.localName.substring(5));
    setDeviceList(devices);
    console.log("Devices are "+deviceList);
    */
    
    //console.log(peripheral.advertising.localName.substring(5));
  }
  

}


 bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
 bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',handleFoundDevice);



setTimeout(()=>{

  BleManager.scan([],700,false).then(()=>{
    console.log("NEw Scan Started");
  
   })


},500);



 
return(
  
  <View>
    <Text>Nearby Devices:</Text>
    {deviceList}
  </View>
);




}




const SignupScreen = ({navigation}) => {
  //<TextInput style={styles.textFields} onChangeText={(text)=>setUsername(text)} value={username} name='usernameField'></TextInput>
  
  //TODO: Finish Form Validation
  
  /*

     let newUser = {
                    "username": this.username.replace(/^\s+|\s+$/g, ""),
                    "email":this.email.replace(/^\s+|\s+$/g, ""),
                    "doctorEmail":this.doctorEmail.replace(/^\s+|\s+$/g, ""),
                    "additionalEmail":this.additionalEmail.replace(/^\s+|\s+$/g, ""),
                    "additionalEmail2":this.additionalEmail2.replace(/^\s+|\s+$/g, ""),
                    "additionalEmail3":this.additionalEmail3.replace(/^\s+|\s+$/g, ""),
                    "name":this.name.replace(/^\s+|\s+$/g, ""),
                    "accountNumber":this.accountNumber.replace(/^\s+|\s+$/g, ""),
                    "password":this.confirmPassword.replace(/^\s+|\s+$/g, ""),
                    "serialNumber":serialNumber,
                };


  */
  
  function validateForm()
  {
    
    if(username == "")
    {
      setUserLabelColor("red");
      //setFormValid(false);
      formIsValid = false;
    }
    else
    {
      setUserLabelColor('gray');
      formIsValid = true;
    }

    if(eMail == "")
    {
      setEmailLabelColor("red");
      //setFormValid(false);
      formIsValid = false;
    }
    else
    {
      setEmailLabelColor("gray");
      //setFormValid(false);
      formIsValid = true;
    }

    if(name == "")
    {
      setNameLabelColor("red");
      //setFormValid(false);
      formIsValid = false;
    }
    else
    {
      setNameLabelColor("gray");
      //setFormValid(false);
      formIsValid = true;
    }

    if(password == "")
    {
      setPasswordLabelColor("red");
      //setFormValid(false);
      formIsValid = false;
    }
    else
    {
      setPasswordLabelColor("gray");
      //setFormValid(false);
      formIsValid = true;
    }
    
    //setFormValid(username != "" && eMail != "" && name != "" && password != "" && confirmPassword != "" && password == confirmPassword);
  }

  function buildUserObject()
  {
    var newUser ={

      "username":username,
      "email":eMail,
      "doctorEmail":"doctor@email.com",
      "additionalEmail":"additional@email",
      "additionalEmail2":"additional2@email",
      "additionalEmail3":"additional3@email",
      "name":name,
      "accountNumber":"00000",
      "password":password



    };
    return newUser;
  }
  
  var formIsValid = true;
  const [formValid,setFormValid] = React.useState(true);
  
  const [username,setUsername] = React.useState("");
  const [eMail,setEmail] = React.useState("");
  const [name,setName] = React.useState("");
  const [password,setPassword] = React.useState("");
  const [confirmPassword,setConfirmPassword] = React.useState("");
  const [userLabelColor,setUserLabelColor] = React.useState('grey');
  const [emaillabelColor,setEmailLabelColor] = React.useState('grey');
  const [nameLabelColor,setNameLabelColor] = React.useState('grey');
  const [passwordLabelColor,setPasswordLabelColor] = React.useState('grey');
  const [usernameStatus,setUsernameStatus]=React.useState("");
  const [emailStatus,setemailstatus] = React.useState("");

  
  function checkInput(type,value)
  {
    
    
    const statusMsg = type == "user"?"Username already taken":"E-mail already in use";
    
    
    setTimeout(()=>{

      var requestOptions;
      if(type=="user")
      {
        requestOptions = {
      
          method:'POST',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
          }),
          body: 'action=checkUsername&username='+value+'&appversion='+appVersion
          //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
    
    
        };
      }
      else
      {
        requestOptions = {
      
          method:'POST',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
          }),
          body: 'action=checkEmail&email='+value+'&appversion='+appVersion
          //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
    
    
        };
      }

      fetch('https://avid.vqconnect.io/nodejs/login',requestOptions).then((res)=>res.json()).then((resjson)=>{

      if(type=="user")
        resjson.code == "202"?setUsernameStatus(statusMsg):setUsernameStatus("");  
      else
        resjson.code == "202"?setemailstatus(statusMsg):setemailstatus("");  
      
      
      
      
      console.log("Status Is "+resjson.code);


      }).catch((error)=>{
        console.log(error);

      });


      /*

      fetch('https://avid.vqconnect.io/nodejs/deviceList',dataRequestOptions).then((response)=>response.json()).then((responseJson)=>{

      setUploadStatus(uploadStatus+"\nUpload Complete!");
      console.log("Response Is "+responseJson.code+" "+responseJson.msg);

      }).catch((error,data)=>{console.log("The Error "+error+" "+data)});

      */
      
      
      //const userRequestOptions = 


    },100);

    
    console.log("Username Is "+value);
  }


// <TextInput InputProps={{disableUnderline: false}} style={styles.textFields} onChangeText={(text)=>setUsername(text)} value={username} name='usernameField'></TextInput>
  
  return(
    <View style={{backgroundColor:'white',alignItems:'center'}}>
    <ScrollView style={{marginTop:'5%',width:'85%'}}>
    <Text style={[styles.signUpLabels,{color:userLabelColor}]}>Username*</Text>
    <TextInput style={[styles.textFields,{marginBottom:'1%'}]} onChangeText={(text)=>{setUsername(text);checkInput("user",text);}} value={username}></TextInput>
    <Text style={{color:'red',fontSize:10,marginBottom:'7%'}}>{usernameStatus}</Text>
    <Text style={[styles.signUpLabels,{color:emaillabelColor}]}>E-Mail*</Text>
    <TextInput style={[styles.textFields,{marginBottom:'1%'}]} onChangeText={(text)=>{setEmail(text);checkInput("email",text);}} value={eMail}></TextInput>
    <Text style={{color:'red',fontSize:10,marginBottom:'7%'}}>{emailStatus}</Text>
    <Text style={styles.signUpLabels}>Doctor E-mail</Text>
    <TextInput style={styles.textFields}></TextInput>
    <Text style={styles.signUpLabels}>Additional E-Mail 1</Text>
    <TextInput style={styles.textFields}></TextInput>
    <Text style={styles.signUpLabels}>Additional E-mail 2</Text>
    <TextInput style={styles.textFields}></TextInput>
    <Text style={styles.signUpLabels}>Additional E-mail 3</Text>
    <TextInput style={styles.textFields}></TextInput>
    <Text style={[styles.signUpLabels,{color:nameLabelColor}]}>Name*</Text>
    <TextInput style={styles.textFields} onChangeText={(text)=>{setName(text);validateForm();}} value={name}></TextInput>
    <Text style={styles.signUpLabels}>Account Number</Text>
    <TextInput style={styles.textFields}></TextInput>
    <Text style={[styles.signUpLabels,{color:passwordLabelColor}]}>Password*</Text>
    <TextInput style={styles.textFields} onChangeText={(text)=>{setPassword(text);validateForm();}} value={password}></TextInput>
    <Text style={styles.signUpLabels}>Confirm Password*</Text>
    <TextInput style={styles.textFields} onChangeText={(text)=>{setConfirmPassword(text);validateForm();}} value={confirmPassword}></TextInput>
    <TouchableOpacity onPress={()=>{validateForm();if(formIsValid){navigation.navigate("SELECT_DEVICE");}}} style={{ marginTop:30,marginBottom:20, backgroundColor: '#722053', width:"80%" }}><Text style={{ fontFamily: "Verdana-Bold",color: '#fff', textAlign: 'center', fontSize: 25, margin:10, }}>Signup</Text></TouchableOpacity>
  
    </ScrollView>
    </View>
  );
  
  
  }


  var initialAddress = 160;


  

  const Register_Device = ({navigation}) => {

    return(
      <View style={{justifyContent: 'center',alignItems: 'center'}}>
      <Text style={{color:'grey',fontSize:20,fontWeight:'bold'}}>Please scan the device barcode for registering</Text>
      
      <TouchableOpacity style={{marginTop:30,marginBottom:20, borderColor: '#722053',borderWidth:2, width:"80%" }}><Text style={{ fontFamily: "Verdana-Bold",color: '#aaa', textAlign: 'center', fontSize: 20, margin:5, }}>Scan</Text></TouchableOpacity>
      <TouchableOpacity style={{marginTop:30,marginBottom:20, backgroundColor: '#722053'}}><Text style={{ fontFamily: "Verdana-Bold",color: '#fff', textAlign: 'center', fontSize: 18, marginHorizontal: 10, marginVertical:5 }}>Registering Device</Text></TouchableOpacity>
      
  
      </View>
      
  
  
    );
  
  
  }


  const DeviceDisplayObject = (deviceName,deviceID,lastUploadDate) =>
  {
    return(
      <View style={{flexDirection:"row"}}>
        <Image source={require("./images/phone.jpg")}/>
        <View>
          <Text>Name: {deviceName}</Text>
          <Text>Id: {deviceID}</Text>
          <Text>Last Updated: {lastUploadDate}</Text>
        </View>
      </View>
    );
  };


  const ConnectionScreen = ({navigation}) => {

    
    
    
    
    
    
    
    
    return(
      <View style={{flex:1}}>
        <View style={{width:'90%',paddingTop:'10%',alignSelf:'center'}}>
        <Text style={styles.grayButton}>Paired</Text>
        <TextInput></TextInput>
        <Text style={styles.grayButton}>Available</Text>
        </View>
        <View style={{justifyContent: 'flex-end',flex:1,marginBottom: 30}}>
        <View style={{justifyContent: 'space-evenly',  flexDirection: "row",marginTop: 10, width:'100%'}}>
        <TouchableOpacity style={{ marginTop:30,marginBottom:20, backgroundColor: '#722053' }}><Text style={{ fontFamily: "Verdana-Bold",color: '#fff', textAlign: 'center', fontSize: 15, margin:10 }}>New</Text></TouchableOpacity>
  
        <TouchableOpacity style={{ marginTop:30,marginBottom:20, backgroundColor: '#722053' }}><Text style={{ fontFamily: "Verdana-Bold",color: '#fff', textAlign: 'center', fontSize: 15, margin:10 }}>Continue</Text></TouchableOpacity>
  
        <TouchableOpacity style={{ marginTop:30,marginBottom:20, backgroundColor: '#722053' }}><Text style={{ fontFamily: "Verdana-Bold",color: '#fff', textAlign: 'center', fontSize: 15, margin:10 }}>Edit</Text></TouchableOpacity>
  
      </View>
      </View>
      </View>
  
  
    );
  
  };

 
  const makeButton = (size,style,title,onPressFunction)=>{

    
    //      <TouchableOpacity onPress={()=>{processLogin(username,password);}} style={{ marginTop:30,marginBottom:20, backgroundColor: '#722053', width:"80%" }}><Text style={{ fontFamily: "Proxima Nova",fontWeight:'bold',color: '#fff', textAlign: 'center', fontSize: 25, margin:10, }}>Login</Text></TouchableOpacity>

    
    if(size == "small")
    {
      return <TouchableOpacity onPress={()=>{onPressFunction}} style={{ marginTop:30,marginBottom:20, backgroundColor: '#722053', width:"20%" }}><Text>{title}</Text></TouchableOpacity>; 
    }

    if(size == "large")
    {
      return <TouchableOpacity onPress={()=>{onPressFunction}} style={{ marginTop:30,marginBottom:20, backgroundColor: '#722053', width:"80%" }}><Text style={{ fontFamily: "Proxima Nova",fontWeight:'bold',color: '#fff', textAlign: 'center', fontSize: 25, margin:10, }}>{title}</Text></TouchableOpacity>; 
    }


  }
  
  const UsageDetailScreen = ({route,navigation}) => {

    const currentData = route.params.dataObject;
    console.log("Info Is "+route.params.isUsage);


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
 
  
  const DayUsageScreen = ({route,navigation}) => {

    console.log("Chicken Nuggets");
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
    console.log("From is "+route.params.currentDate+" "+route.params.from);
    
    var usageData=null;
    var tableInfo=[];
    console.log("https://avid.vqconnect.io/nodejs/userList?action=findUserUsageDataByDay&dayTime="+route.params.currentDate+"&token="+currentUserData.token);
    
    
    
    
    
    fetch("https://avid.vqconnect.io/nodejs/userList?action=findUserUsageDataByDay&dayTime="+route.params.currentDate+"&uid="+currentUserData.uid+"&token="+currentUserData.token).then((response)=>response.json()).then((responseJson)=>{
      
    usageData = responseJson.data;
    console.log(usageData);
    for(var x = 0;x < responseJson.data.length;x++)
      {
        console.log(responseJson.data[x]);
        var currentObj = [];
        //var currentColor = responseJson.data[x].Type == "U"?"blue":"green";
        //currentElement.style={color:currentColor};
        //currentObj.push(currentColor);
        //const currentData = [responseJson.data[x].DateOfTreatment,responseJson.data[x].TimeOfTreatment];
        currentObj.push(responseJson.data[x].DateOfTreatment.substring(0,8));
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
    
    /*

     return request({
        url:global.url +"nodejs/userList?" +"action=findUserUsageDataByDay" +
        "&uid=" +uid +"&dayTime=" +dayTime +"&token=" +global.token+'&appversion='+global.appVersion,
        method:'get',
    })

    */

   
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
    
    
    //const currentDate = route.params.date;
    return<View>
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

          <TouchableOpacity buttonKey={index} onPress={()=>{var boolVal;if(index%2==0){boolVal=false;}else{boolVal=true;}navigation.navigate("Usage Data Detail",{dataObject:usageData[index],isUsage:boolVal});}}>
          <Row textStyle={{fontSize:16,fontWeight:'bold',color:'#555555',textAlign:'center'}} key={index} data={rowData} style={[styles.dayUsageRow,{height:questionHeight},index%2 && {height:usageHeight,backgroundColor:'#d9fae9'}]} />
          </TouchableOpacity>

        ))
      }</ScrollView>


        
      </Table>
     
    </View>;

  }
  

 

  const UsageHistoryScreen = ({route,navigation}) =>{

    
    console.log(route.params.year+"-"+route.params.month+"-"+route.params.day);


    const [currentRecordIndex,setCurrentRecordIndex] = React.useState(0);
    const [showDisplay,setShowDisplay] = React.useState(false);
    const [showUsageRecord,setShowUsageRecord] = React.useState(false);
    const [showQuestionRecord,setShowQuestionRecord] = React.useState(false);
    const [uploadStatus,setUploadStatus] = React.useState("");
    const initialMarkedDates = {}
    const [datesUpdated,setDatesUpdated] = React.useState(false);
    const [markedDates,updateMarkedDates] = React.useState({});
    const [currentMonth,setCurrentMonth] = React.useState([route.params.month,route.params.year]);
    //const [currentYear,setCurrentYear] = React.useState(route.params.year);
    console.log(currentMonth);
    const Circle = (color,size) => {
      return <View style={{alignSelf:'center',width:size,height:size,borderRadius:size/2,backgroundColor:color}}></View>


    };


    var markedDateObj={};

    const usageOver20 = {key:'over20',color:'green'};
    const usageUnder20 = {key:'under20',color:'purple'};
    const allQuestionsAnswered = {key:'allAnswered',color:'red'};
    const skippedQuestions = {key:'skippedQuestions',color:'pink'};

    //https://avid.vqconnect.io/nodejs/userList?startTime=2022-12-01&endTime=2023-02-26&action=findUserUsageDataByMonth&uid=63cac64fe428e916acab5c6d&token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyTmFtZSI6InJ1c3NlbGxfam93ZWxsIiwiaGFzaCI6Ijk5NDVhOGM3MzQwYzNlZWY1YmZjNmIwYzQ5NTQ5YmIzIiwiUGVybWlzc2lvbiI6NSwiaWF0IjoxNjc3NTE5OTgyLCJleHAiOjE2ODAzOTk5ODJ9.9TNOad5q4MP1pSW_6SQXxdJj268W6H0oWXxMWThlLio


    const getMonthUsageData = (month,year) =>
  {
    
    var dataObject = {};
    
    
    const monthDays= ["31","28","31","30","31","30","31","31","30","31","30","31"];
    if(year%4 == 0)
      monthDays[1]="29";
  
    month < 10 ? month = "0"+month:month=month;
  
    console.log("URL IS "+"https://avid.vqconnect.io/nodejs/userList?action=findUserUsageDataByMonth&startTime="+year+"-"+month+"-01&endTime="+year+"-"+month+"-"+monthDays[month-1]+"&uid="+currentUserData.uid+"&token="+currentUserData.token);
    
    if(datesUpdated == false)
      fetch("https://avid.vqconnect.io/nodejs/userList?action=findUserUsageDataByMonth&startTime="+year+"-"+month+"-01&endTime="+year+"-"+month+"-"+monthDays[month-1]+"&uid="+currentUserData.uid+"&token="+currentUserData.token,{method:'GET'}).then((responseData)=>responseData.json()).then((responseJson)=>{
  
    for(var i=0;i<responseJson.data.length;i++)
    {
      if(responseJson.data[i].MinOfUseTotal > 0)
      {
        //dataObject={};
        
        var currentDot = responseJson.data[i].MinOfUseTotal >= 20 ? usageOver20:usageUnder20;
        
        dataObject[responseJson.data[i]._id]={dots:[currentDot]};

        if(Object.values(responseJson.data[i]._id).includes("UA"))
        {
          dataObject[responseJson.data[i]._id].dots.push(skippedQuestions);
        }
        else
        {
          dataObject[responseJson.data[i]._id].dots.push(allQuestionsAnswered);
        }
        
        
        
        
      }
      
        //console.log(dataObject);
    }  
    
    //setMarkedDates(dataObject);
    //console.log(dataObject);
    updateMarkedDates(dataObject);
    setDatesUpdated(true);
    //return;
    
  
    });//.then((data)=>{setMarkedDates(markedDates=>({...markedDates,...dataObject}));console.log(markedDates);});
  
    //setMarkedDates(markedDates=>({...markedDates,...dataObject}));
    //console.log(markedDates);
    
  
  };






if(datesUpdated == false)
  getMonthUsageData(currentMonth[0],currentMonth[1]);
else
{
  console.log("Final Data Is");
  console.log(markedDates);
}

//setMarkedDates(dataObject);
//console.log("Done");
//console.log(markedDates);
//setMarkedDates(markedDateObj);
    
    /*

     UsageDataArr.push({
                        uid : mongoose.Types.ObjectId(userid),
                        uploadTime : moment().tz("America/Los_Angeles").format("YYYY-MM-DD HH:mm:ss"),
                        Type : reqData.Usage[i][0],
                        SerialNumber : reqData.SerialNumber,
                        Remark :medical_remak,
                        DateOfTreatment : reqData.Usage[i][1][0],
                        TimeOfTreatment : reqData.Usage[i][1][1],
                        StandardTimeOfTreatment : comm.dtFromat(reqData.Usage[i][1][0]) +' ' +comm.changeTimeFromat(reqData.Usage[i][1][1]),
                        Address : reqData.Usage[i][7],
                        PainBefore: reqData.Usage[i][2],
                        PainAfter: reqData.Usage[i][6],
                        DecrMeds: reqData.Usage[i][3],
                        HelpWork: reqData.Usage[i][4],
                        HelpHome: reqData.Usage[i][5],
                        ConfigData : ConfigData,
                    })



                      if(reqData.Usage[i][0] === 'U') {
                    var PresetData = PresetDataArr[Number(reqData.Usage[i][2])-1];
                    UsageDataArr.push ({
                        uid : mongoose.Types.ObjectId(userid),
                        uploadTime : moment().tz("America/Los_Angeles").format("YYYY-MM-DD HH:mm:ss"),
                        Type : reqData.Usage[i][0],
                        SerialNumber : reqData.SerialNumber,
                        Remark :medical_remak,
                        DateOfTreatment : reqData.Usage[i][1][0],
                        TimeOfTreatment : reqData.Usage[i][1][1],
                        Address : reqData.Usage[i][9],
                        StandardTimeOfTreatment : comm.dtFromat(reqData.Usage[i][1][0]) +' ' +comm.changeTimeFromat(reqData.Usage[i][1][1]),
                        MinOfUse : reqData.Usage[i][4],
                        MinOfPause : reqData.Usage[i][3],
                        Channel1MaxAmpUsed :reqData.Usage[i][5]/2,
                        Channel1AverageAmpUsed : reqData.Usage[i][6]/2,
                        Channel2MaxAmpUsed : reqData.Usage[i][7]/2,
                        Channel2AverageAmpUsed :reqData.Usage[i][8]/2,        
                        PresetNumber : reqData.Usage[i][2],
                        PresetData :PresetData,
                        ConfigData : ConfigData,
                    })

    */
    
    


    
    function uploadDeviceData(usageData)
    {
      
      setUploadStatus(uploadStatus+"\nUploading Data To Server!");
      console.log("Here we do");
      var jsonData = "{";
    jsonData += '"SerialNumber":"'+currentUserData.serialnumber+'","UserInfo":{"PatientName":"'+currentUserData.name+'","PatientEmail":"'+currentUserData.email+'","DoctorEmail":"'+currentUserData.doctorEmail+'","DeviceName":"Avid IF2"},';
    jsonData += '"Usage":[';
    for(var i = 0; i < usageData.length;i++)
    {
      if(usageData[i][0] == "U")
        jsonData += '["'+usageData[i][0]+'",["'+usageData[i][1][0]+'","'+usageData[i][1][1]+'"],'+usageData[i][2]+','+usageData[i][4]+','+usageData[i][3]+','+usageData[i][5]+','+usageData[i][6]+','+usageData[i][7]+','+usageData[i][8]+','+usageData[i][9]+']';
      else
      {
        jsonData += '["'+usageData[i][0]+'",["'+usageData[i][1][0]+'","'+usageData[i][1][1]+'"],';
        
        for(var j = 2;j<8;j++)
        {
          if(isNaN(usageData[i][j]))
            jsonData += '"'+usageData[i][j]+'"';
          else
            jsonData += usageData[i][j];
          if(j != 7)
            jsonData+= ",";
          else
            jsonData+= "]";

        }
        
        //+usageData[i][2]+','+usageData[i][3]+','+usageData[i][4]+','+usageData[i][5]+','+usageData[i][6]+','+usageData[i][7]+']';
      }
        
      if(i != usageData.length - 1)
        jsonData += ",";

    }
    jsonData += '],';
    jsonData+= '"Config":["'+configArray[0]+'","'+configArray[1]+'","'+configArray[2]+'","'+configArray[3]+'","'+configArray[4]+'"]';
    jsonData += ',"Preset":[[0,0,0,0,0,0,0,0,0]]';
    jsonData += "}";
    console.log(jsonData);

      /*
      token=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJVc2VyTmFtZSI6InJ1c3NlbGxfam93ZWxsIiwiaGFzaCI6Ijk5NDVhOGM3MzQwYzNlZWY1YmZjNmIwYzQ5NTQ5YmIzIiwiUGVybWlzc2lvbiI6NSwiaWF0IjoxNjc0NTAxNzk4LCJleHAiOjE2NzczODE3OTh9.69wZGgeSBXvaPmxXu7URgXhYu_-ZfZjUis1oxu32EYg
        action=insertData
        dataJson={"SerialNumber":"F001451","Usage":[["U",["Oct. 12 2022","06:15 PM"],0,0,0,0,0,0,0,0],["A",["Oct. 12 2022","06:20 PM"],0,0,0,0,0,0]],"Preset":[[0,0,0,0,0,0,0,0,0]],"Config":[2,2,2,2,2],"UserInfo":{"PatientName":"Russell Jowell","PatientEmail":"russ.jowell@gmail.com","DoctorEmail":"russdoctor@medical.com","DeviceName":"Avid IF2"}}

      */
      
      
        console.log("Token Is "+currentUserData.token);
      
      
      const dataRequestOptions = {
      
        method:'POST',
        headers: {'x-access-token':currentUserData.token},
        body: 'action=insertData&dataJson='+jsonData+'&appversion='+appVersion
        //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
  
  
      };
      
      console.log(dataRequestOptions.body);
      
      fetch('https://avid.vqconnect.io/nodejs/deviceList',dataRequestOptions).then((response)=>response.json()).then((responseJson)=>{

      setUploadStatus(uploadStatus+"\nUpload Complete!");
      console.log("Response Is "+responseJson.code+" "+responseJson.msg);

      }).catch((error,data)=>{console.log("The Error "+error+" "+data)});
      
    } 
    
    
    
    
    function newGetDeviceData(peripheral,address)
    {

      console.log("Address is "+address+" ");
    BleManager.connect(peripheral.id).then(()=>{
      setUploadStatus(uploadStatus+'\n'+"Connected to AVID Device. Retrieving Services");
        BleManager.retrieveServices(peripheral.id,["F0001130-0451-4000-B000-000000000000"]).then((peripheralInfo)=>{
          setUploadStatus(uploadStatus+'\n'+"\nReading Data. Please Wait.");
            BleManager.write(peripheral.id,"F0001130-0451-4000-B000-000000000000","F0001131-0451-4000-B000-000000000000",address).then(()=>{console.log("Wrote Address "+address)});

            setTimeout(()=>{

                BleManager.read(peripheral.id,"F0001130-0451-4000-B000-000000000000","F0001132-0451-4000-B000-000000000000").then((readData)=>{

                    //Get Config Data
                    
                    if(address[0] == 0 && address[1]==0)
                    {
                        let complianceTime = parseInt(changeNumBase(readData[3])+changeNumBase(readData[2])+changeNumBase(readData[1])+changeNumBase(readData[0]),16);
                        var complianceHours;
                        if(complianceTime/60 < 1)
                          complianceHours = 0;
                        else
                          complianceHours = 1;
                        let comTime = `${complianceHours} hrs ${complianceTime%60} min`;
                        configArray = [comTime,languages[readData[12]],readData[14],Boolean(readData[15]),Boolean(readData[16])];
                        lastUsageAddress = 256*readData[5]+readData[4];
                        console.log("Config Array "+configArray);
                        console.log("Last Usage Data "+lastUsageAddress+" "+[readData[5],readData[4]]);
                        //Start Reading Preset Data
                        newGetDeviceData(peripheral,[1,0]);
                    }
                    
                    //Get Preset Data
                    else if(256*address[0]+address[1] < 896)
                    {
                        console.log("Preset Is "+readData)
                        console.log("Next Preset Address "+[address[0],address[1]+32]);
                        if(address[1] == 240)
                          newGetDeviceData(peripheral,[address[0]+1,0]);
                        else
                          newGetDeviceData(peripheral,[address[0],address[1]+32]);
                    }
                    else
                    {
                        
                            if(readData[0]==93)
                            {
                                console.log("Usage "+["U",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),readData[6]-128, calculation(readData[8],readData[9]),calculation(readData[10],readData[11]),readData[12],readData[13],readData[14],readData[15],256*address[0]+address[1]]);
                                usageArray.push(["U",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),readData[6]-128, calculation(readData[8],readData[9]),calculation(readData[10],readData[11]),readData[12],readData[13],readData[14],readData[15],256*address[0]+address[1]]);
                            }
                            if(readData[0]==173)
                            {
                              console.log("Usage "+["A",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),answers[readData[6]],answers[readData[7]],answers[readData[8]],answers[readData[9]],answers[readData[10]],256*address[0]+address[1]]);  
                              usageArray.push(["A",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),answers[readData[6]],answers[readData[7]],answers[readData[8]],answers[readData[9]],answers[readData[10]],256*address[0]+address[1]]);
                            }
                            console.log(256*address[1]+address[0]+" "+lastUsageAddress);
                            if(256*address[0]+address[1] < lastUsageAddress - 16)
                            {
                                if(address[1] == 240)
                                {
                                    newGetDeviceData(peripheral,[address[0]+1,0]);
                                }
                                else
                                {
                                    newGetDeviceData(peripheral,[address[0],address[1]+16]);
                                }
                            }
                            else
                            {
                                uploadDeviceData(usageArray);
                            }
                            
                        
                        
                    }


                });

            },500);

        });

    });//End Connect
}


   /* 
      
          PresetDataArr.push({
          PresetNumber: i+1,
          ElectrodeSize: reqData.Preset[i][2],
          StimulationType: 'IF',
          ModeSettings: reqData.Preset[i][4],
          TreatmentTime: reqData.Preset[i][6],
          NumberOfCycles: reqData.Preset[i][7],
          NextPresetToUse: reqData.Preset[i][8],
          BeatFrequency: reqData.Preset[i][5]
        })


      
    }*/





   
   
    function calculation(add_0,add_1)
    {
      return parseInt( (changeNumBase(add_1)+ changeNumBase(add_0)) ,16);
    } 
  
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
  
   


    const handleDiscoverDevice = (peripheral) => {

      
      
      
      
      
      console.log("Peripheral Discovered "+peripheral);
    

  
      if(peripheral.name != null)
      {
        console.log("Cheeseboard");
        console.log("Name is "+peripheral.name.substring(0,4));
      }
      //console.log(peripheral.name.substring(0,3) == "Avid");
      if(peripheral.name != null && peripheral.name.substring(0,4) == "Avid")
      {
        console.log("Milkshake");
        
        //currentDevice = peripheral;
    
      
    
        BleManager.stopScan().then(()=>{
    
          console.log("Device Is "+peripheral.name);
          setUploadStatus(uploadStatus+'\n'+"Found Device "+peripheral.name);
           newGetDeviceData(peripheral,[0,0]);
        
        
    
    
    
        });
        
      }
    
    }

    bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
    bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',handleDiscoverDevice);


    



    return(
      <View>
        <View style={{marginTop:'5%',marginHorizontal:'5%',marginBottom:'5%'}}>
      <View style={{flexDirection:'row'}}>{Circle("green",10)}<Text style={styles.grayButton}>&nbsp;&nbsp;Usage total time &gt;= 20</Text></View>
      <View style={{flexDirection:'row'}}>{Circle("purple",10)}<Text style={styles.grayButton}>&nbsp;&nbsp;Usage total time &lt; 20</Text></View>
      <View style={{flexDirection:'row'}}>{Circle("red",10)}<Text style={styles.grayButton}>&nbsp;&nbsp;All questions are answered</Text></View>
      <View style={{flexDirection:'row'}}>{Circle("pink",10)}<Text style={styles.grayButton}>&nbsp;&nbsp;Some Questions Skipped</Text></View>
      </View>
      <Calendar markedDates={markedDates}  onDayPress={day=>{console.log("The Day Is "+day.dateString);if(day.dateString in markedDates){navigation.navigate("USAGE SUBSTACK",{currentDate:day.dateString,from:"calendar"});}  }} onMonthChange={month => {console.log(month);setCurrentMonth([month.month,month.year]);setDatesUpdated(false);}} markingType={'multi-dot'}></Calendar>
{/*}
        <View>
          <Text>Welcome, {currentUserData.name}</Text>
          <Text>Device Number: {currentUserData.serialnumber}</Text>
        </View>
        <View style={{flexDirection:'column',marginTop:'10%',justifyContent:'space-evenly'}}  >
          <Button style={{marginTop:'10%'}} title="Previous" onPress={()=>{if(currentRecordIndex != 0){setCurrentRecordIndex(currentRecordIndex-1);console.log(currentRecordIndex);}  }}/>
          <Pressable  title="Click Here to Read and Upload Your AVID Data" onPress={()=>{BleManager.scan([],5,false).then(()=>{setUploadStatus(uploadStatus+"Scanning");console.log("Scan Started");});}}>
            <Text style={{textAlign:'center',fontSize:30}}>Click Here To Read and Upload Your AVID Data</Text>
          </Pressable>
          <Text>{uploadStatus}</Text>
          <Button style={{marginTop:'10%'}} title="Next" onPress={()=>{console.log(currentRecordIndex); if(currentRecordIndex != usageRecords.length-1)
            { 
              setCurrentRecordIndex(currentRecordIndex+1);
              if(usageRecords[currentRecordIndex].length == 10)
              {
                setShowUsageRecord(false);
                setShowQuestionRecord(true);
              }
              else
              {
                setShowUsageRecord(true);
                setShowQuestionRecord(false);
              }
            
            }
            
            }}/> 
        </View>
        
          showDisplay && (<View>

        
        <Text style={{display:showUsageRecord?'flex':'none'}}>Date: {months[usageRecords[currentRecordIndex].month-1]+" "+usageRecords[currentRecordIndex].day+" "+"20"+usageRecords[currentRecordIndex].year}</Text>
        <Text>Preset:{usageRecords[currentRecordIndex].preset}</Text>

       
        <Text>Minutes of Usage:{usageRecords[currentRecordIndex].minutesOfUse}</Text>
        <Text>Minutes of Pause:{usageRecords[currentRecordIndex].minutesOfPause}</Text>
        <Text>Ch1 Max:{usageRecords[currentRecordIndex].ch1max}</Text>
        <Text>Ch1 Avg:{usageRecords[currentRecordIndex].ch1avg}</Text>
        <Text>Ch2 Max:{usageRecords[currentRecordIndex].ch2max}</Text>
        <Text>Ch2 Avg:{usageRecords[currentRecordIndex].ch2avg}</Text>
          
          <Text>Q1:{usageRecords[currentRecordIndex].q1}</Text>
          <Text>Q2:{usageRecords[currentRecordIndex].q2}</Text>
          <Text>Q3:{usageRecords[currentRecordIndex].q3}</Text>
          <Text>Q4:{usageRecords[currentRecordIndex].q4}</Text>
          <Text>Q5:{usageRecords[currentRecordIndex].q5}</Text>



        

    
          </View>)

*/}


      </View>

    )



  }

  

  const LoginScreen = ({navigation}) => {

    
    const eyeCloseIcon = "./images/eyesclose.jpg";
    const eyeOpenIcon = "./images/eyesopen.jpg";
    
    const [avidSerialNumber,getSerialNumber] = React.useState("No Devices Found!");
    const [username,setUsername]= React.useState("");
    const [password,setPassword]= React.useState("");
    const [loginStatus,setLoginStatus] = React.useState("");
    const [eyeIcon,setEyeIcon] = React.useState(require(eyeCloseIcon));
    const [secureTextOn,setSecureTextOn] = React.useState(true);
    const [isLoading,setIsLoading] = React.useState(false);


   
    
    function processLogin(usernameInput,passwordInput)
    {
    
      //navigation.navigate("Main");
      //return;
      setIsLoading(true);

      
      if(username == "")
      {
        setIsLoading(false);
        if(password == "")
          Alert.alert("Input Error","Username & Password are blank");
        else
          Alert.alert("Input Error","Username is blank");
        
        
        
      }
      else if(password == "")
      {
        setIsLoading(false);
        Alert.alert("Input Error","Password is blank");
      }
      
      
      console.log("This is the song");
      //userAccountPtr.doc(usernameInput).get().then((document)=>{
        console.log("TaaDaa");

          console.log("Cheesy Poofs");
          const requestOptions = {
      
            method:'POST',
            headers: new Headers({
              'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
            }),
            body: 'action=signIn&whereJson='+JSON.stringify({"username":usernameInput,"password":passwordInput})+'&appversion='+appVersion
            //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
      
      
          };
          console.log("Poopy Doops");
          console.log(requestOptions.body);
          fetch('https://avid.vqconnect.io/nodejs/login',requestOptions).then((response)=>response.json()).then((responseJson)=>{
            
            console.log("Status Is" +responseJson.msg);

            if(responseJson.code == "200")
            {
              currentUserData = responseJson.data;
              console.log(responseJson.data);
              console.log("Burgers and Fries");

              userAccountPtr.doc(usernameInput).get().then((document)=>
              {

                if(document.exists)
                {
                    auth().signInWithEmailAndPassword(document.data().eMail,passwordInput).then(()=>{
                      setLoginStatus("Login Successful via Firebase");
                      console.log("Login Successful! Woohoo!");
                      navigation.navigate("Main");

                    }).catch(error=>{

                      console.log("Sign In Error "+error);
                      
                      if(error.code == "auth/wrong-password")
                      {
                        setIsLoading(false);
                        Alert.alert("Login Error","Password Incorrect");
                        setLoginStatus("Login Failed - Wrong Password (Firebase)");
                        return;
                      }

                    });
         
                }
                else
                {
                  auth().createUserWithEmailAndPassword(responseJson.data.email,passwordInput).then(()=>{

                    userAccountPtr.doc(usernameInput).set({eMail:responseJson.data.email});
                    setIsLoading(false);
                    setLoginStatus("User Created In Firebase");
                    console.log("Cheese Boobs");
                    navigation.navigate("Main");
    
                  });
                  
                }
              }).catch((error)=>{console.log("Retrieve Error "+error);});


           

              

             
            }
            if(responseJson.code == "202")
            {
              console.log("E-mail Confirm Error");
            }
            if(responseJson.code == "203")
            {
              Alert.alert("Login Error","Username or Password Incorrect");
              setLoginStatus("Username or Password Error Please Try Again (old system)");
              return;
            }
          
          
          
          }).catch(error=>{console.log("Fetching Error "+error)});
          
      
      
      
     
      
      
    

    //}).catch((error)=>{console.log("Retrieve Error "+error);})  ;
  }
    
   

    

  
    return(
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
      <TouchableOpacity><Text style={styles.grayButton}>Forgot Username?</Text></TouchableOpacity>
      <TouchableOpacity><Text style={styles.grayButton}>Forgot Password?</Text></TouchableOpacity>
      
      </View>
      </View>

      
      <TouchableOpacity onPress={()=>{processLogin(username,password);}} style={{ marginTop:30,marginBottom:20, backgroundColor: '#722053', width:"80%" }}><Text style={{ fontFamily: "Proxima Nova",fontWeight:'bold',color: '#fff', textAlign: 'center', fontSize: 25, margin:10, }}>Login</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>{navigation.navigate("Sign Up") }}><Text style={[styles.purpleButton,{marginTop:'6%'}]}>Sign Up</Text></TouchableOpacity>
      <Text>&nbsp;&nbsp;&nbsp;</Text>
      <ActivityIndicator animating={isLoading}/>
      {/*
      <TouchableOpacity onPress={()=>{processLogin(username,password);}} style={{ marginTop:30,marginBottom:20, backgroundColor: '#722053', width:"80%" }}><Text style={{ fontFamily: "Proxima Nova",fontWeight:'bold',color: '#fff', textAlign: 'center', fontSize: 25, margin:10, }}>Login</Text></TouchableOpacity>
      
      
    */}
      {/*<Text>Login Status:</Text>
      <Text>{loginStatus}</Text>
      <Text>Your Device ID Is:</Text>
    <Text>{avidSerialNumber}</Text>*/}
      </View>
  
  
  
    );
  
  
  
  }
  
  

  const About = ({navigation}) => {

    return(
      <View style={{alignItems: 'center',marginTop:'10%'}}>
        <Image style={{width: '70%', resizeMode:'contain'}} source={require("./images/AVID.jpg")} />
        <Text>Version 1.0.0</Text>
        <Text>Username: TestUser</Text>
        <Text>User Permission: Permission</Text>
        <Text>Contact Information:</Text>
        <Text>VQ OrthoCare</Text>
        <Text>18011 Mitchell St.</Text>
        <Text>Phone: 1-800-266-6969</Text>
        <Text>E-Mail: AvidIF2@vqorthocare.com</Text>
      </View>
      
  
  
    );
  
  
  }

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
      marginBottom: '8%'
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
      color:'gray'
      
    },
  
    forgotLabels:
    {
      color: 'lightgray'
    }
  
  
 




});

export default App;
