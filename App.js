/**
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
import { NavigationContainer } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import BleManager, { read } from 'react-native-ble-manager';
import React from 'react';
import auth from '@react-native-firebase/auth';
import firestore from '@react-native-firebase/firestore';
//import { createUserWithEmailAndPassword, getAuth, signInWithEmailAndPassword, updatePassword } from 'firebase/auth';
import Buffer from 'buffer';
import {
  Alert,
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
} from 'react-native';
import { config, send } from 'process';
import { add } from 'react-native-reanimated';



const Drawer = createDrawerNavigator();
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



  

  return(


    <NavigationContainer>
      
    <Drawer.Navigator initialRouteName="Login"  screenOptions={{drawerActiveTintColor:'white',drawerInactiveTintColor:'white',  drawerStyle:{drawerActiveTintColor:'yellow',  backgroundColor: '#722080'}}}>
      <Drawer.Screen name="USAGE DATA HISTORY" component={UsageHistoryScreen}/>
      <Drawer.Screen name="Login" component={LoginScreen} options={{headerShown:false}}  />
      <Drawer.Screen name="CONNECTION" component={ConnectionScreen}/>
      <Drawer.Screen name="SIGNUP" component={SignupScreen}/>
      <Drawer.Screen name="REGISTER DEVICE" component={Register_Device}/>
      <Drawer.Screen name="ABOUT" component={About}/>
      <Drawer.Screen name="LOGOUT" component={About}/>
      
      <Drawer.Screen name="SELECT_DEVICE" component={SelectDeviceScreen}/>
    </Drawer.Navigator>
    
    
  </NavigationContainer>
  )

}


function loginSignupScreen()
{
  
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

  BleManager.scan([],5,false).then(()=>{
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

  
  
  
  return(
    <View style={{width: '80%',justifyContent:'center',alignSelf:'center'  ,marginTop: '10%'}}>
    <Text style={[styles.signUpLabels,{color:userLabelColor}]}>Username*</Text>
    <TextInput style={styles.textFields} onChangeText={(text)=>{setUsername(text);validateForm();}} value={username}></TextInput>
    <Text style={[styles.signUpLabels,{color:emaillabelColor}]}>E-Mail*</Text>
    <TextInput style={styles.textFields} onChangeText={(text)=>{setEmail(text);validateForm();}} value={eMail}></TextInput>
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

  const ConnectionScreen = ({navigation}) => {

    
    
    
    
    
    
    
    
    return(
      <View style={{flex:1}}>
        <Text style={styles.loginLabels}>Paired</Text>
        <TextInput></TextInput>
        <Text style={styles.loginLabels}>Available</Text>
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
  
  


  
  const UsageHistoryScreen = ({navigation}) =>{

    
    const [currentRecordIndex,setCurrentRecordIndex] = React.useState(0);
    const [showDisplay,setShowDisplay] = React.useState(false);
    const [showUsageRecord,setShowUsageRecord] = React.useState(false);
    const [showQuestionRecord,setShowQuestionRecord] = React.useState(false);
    const [uploadStatus,setUploadStatus] = React.useState("");
    
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

      
      
      
      
      
      console.log("Peripheral Discovered");
    

  
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
        <View>
          <Text>Welcome, {currentUserData.name}</Text>
          <Text>Device Number: {currentUserData.serialnumber}</Text>
        </View>
        <View style={{flexDirection:'column',marginTop:'10%',justifyContent:'space-evenly'}}  >
        {/*  <Button style={{marginTop:'10%'}} title="Previous" onPress={()=>{if(currentRecordIndex != 0){setCurrentRecordIndex(currentRecordIndex-1);console.log(currentRecordIndex);}  }}/>*/}
          <Pressable  title="Click Here to Read and Upload Your AVID Data" onPress={()=>{BleManager.scan([],5,false).then(()=>{setUploadStatus(uploadStatus+"Scanning");console.log("Scan Started");});}}>
            <Text style={{textAlign:'center',fontSize:30}}>Click Here To Read and Upload Your AVID Data</Text>
          </Pressable>
          <Text>{uploadStatus}</Text>
          {/*<Button style={{marginTop:'10%'}} title="Next" onPress={()=>{console.log(currentRecordIndex); if(currentRecordIndex != usageRecords.length-1)
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
            
            }}/> */}
        </View>
        
          {/*showDisplay && (<View>

        
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



        

    
          </View>)*/}




      </View>

    )



  }

  

  const LoginScreen = ({navigation}) => {

    const [avidSerialNumber,getSerialNumber] = React.useState("No Devices Found!");
    
    const [username,setUsername]= React.useState("");
    const [password,setPassword]= React.useState("");
    const [loginStatus,setLoginStatus] = React.useState("");
    
    
    
    function processLogin(usernameInput,passwordInput)
    {
    
      
      if(username == "")
      {
        
        if(password == "")
          Alert.alert("Input Error","Username & Password are blank");
        else
          Alert.alert("Input Error","Username is blank");
        
        
        
      }
      else if(password == "")
      {
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
                      navigation.navigate("USAGE DATA HISTORY");

                    }).catch(error=>{

                      console.log("Sign In Error "+error);
                      
                      if(error.code == "auth/wrong-password")
                      {
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
                  
                    setLoginStatus("User Created In Firebase");
                    console.log("Cheese Boobs");
                    navigation.navigate("USAGE DATA HISTORY");
    
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
              Alert.alert("Login Error","Username of Password Incorrect");
              setLoginStatus("Username or Password Error Please Try Again (old system)");
              return;
            }
          
          
          
          }).catch(error=>{console.log("Fetching Error "+error)});
          
      
      
      
     
      
      
    

    //}).catch((error)=>{console.log("Retrieve Error "+error);})  ;
  }
    
   

    

  
    return(
      <View style={styles.loginScreen}>
      
        <Image style={styles.loginScreenImage} source={require("./images/AVID.jpg")} />
      
      <View style={{width: '80%'}}>
      <Text style={styles.loginLabels}>Username</Text>
      <TextInput InputProps={{disableUnderline: false}} style={styles.textFields} onChangeText={(text)=>setUsername(text)} value={username} name='usernameField'></TextInput>
      <Text style={styles.loginLabels}>Password</Text>
      <View style={{width:'100%',flexDirection:'row'}}>
      <TextInput style={[styles.textFields,{flex:10}]} onChangeText={(text)=>setPassword(text)} value={password} name='passwordField'></TextInput>
      <Image style={{flex:0}} source={require("./images/eyesclose.jpg")}/>
      </View>
      <View style={{flexDirection: "row",marginTop: 10, width:'100%',justifyContent:'space-between'}}>
      <TouchableOpacity><Text style={styles.grayButton}>Forgot Username?</Text></TouchableOpacity>
      <TouchableOpacity><Text style={styles.grayButton}>Forgot Password?</Text></TouchableOpacity>
      
      </View>
      </View>

      
      <TouchableOpacity onPress={()=>{processLogin(username,password);}} style={{ marginTop:30,marginBottom:20, backgroundColor: '#722053', width:"80%" }}><Text style={{ fontFamily: "Proxima Nova",fontWeight:'bold',color: '#fff', textAlign: 'center', fontSize: 25, margin:10, }}>Login</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>{navigation.navigate("SIGNUP") }}><Text style={[styles.purpleButton,{marginTop:'6%'}]}>Sign Up</Text></TouchableOpacity>

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
    fontSize:17,
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
