import 'react-native-gesture-handler';
import { NavigationContainer, StackActions } from '@react-navigation/native';
import { createDrawerNavigator, DrawerContentScrollView } from '@react-navigation/drawer';
import {Calendar, CalendarList, Agenda} from 'react-native-calendars';
import { createStackNavigator, HeaderBackButton } from '@react-navigation/stack';
import BleManager, { read, setName } from 'react-native-ble-manager';
import React, { useCallback } from 'react';
import { Table, TableWrapper, Row, Rows, Col, Cols, Cell } from 'react-native-table-component';
import auth from '@react-native-firebase/auth';
import moment from 'moment';
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
  Modal,
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
import { acc } from 'react-native-reanimated';

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
var lastUsageAddress;
var usageArray = [];
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





const App = () => {

    //Start Bluetooth Manager
    React.useEffect(()=>{BleManager.start();});
    console.log("boobs");
    const MainStack = ({route,navigation}) => (

    
        <Drawer.Navigator initialRouteName='HOME' screenOptions={{drawerActiveTintColor:'white',drawerInactiveTintColor:'white',  drawerStyle:{drawerActiveTintColor:'yellow',  backgroundColor: avidPurpleHex}}}>
        
        <Drawer.Screen name="HOME" component={MainScreen} initialParams={{calendarInfo:route.params.calendarInfo,serialNumber:route.params.serialNumber}}/>
        <Drawer.Screen name="USAGE SUBSTACK" component={UsageHistoryStack} options={{drawerItemStyle:{display:"none"},unmountOnBlur:true,headerShown:false}}/>
        
        <Drawer.Screen name="LOGOUT" component={LoginScreen} options={{headerShown:false}} initialParams={{from:"logout"}}/>
        
  
      </Drawer.Navigator>
    
       );


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
          <Stack.Screen name="Sign Up" component={SignupScreen} options={{headerStyle:{backgroundColor:avidPurpleHex},headerTintColor:'white'}}/>
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

        <TouchableOpacity buttonKey={index} onPress={()=>{var boolVal;if(index%2==0){boolVal=false;}else{boolVal=true;}navigation.navigate("Usage Data Detail",{dataObject:usageData[index],isUsage:boolVal});}}>
        <Row textStyle={{fontSize:16,fontWeight:'bold',color:'#555555',textAlign:'center'}} key={index} data={rowData} style={[styles.dayUsageRow,{height:questionHeight},index%2 && {height:usageHeight,backgroundColor:'#d9fae9'}]} />
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
  console.log("aches");
  var nextLoginScreen = "";
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
            Alert.alert("Input Error","Username & Password are blank");
          else
            Alert.alert("Input Error","Username is blank");
          
        }
        else if(password == "")
        {
          setLoginProcessStatus(""); 
          setIsLoading(false);
          Alert.alert("Input Error","Password is blank");
        }
        else
          processLogin(usernameInput,passwordInput).then((response)=>{

            if(response == "success")
            {
              setLoginProcessStatus(""); 
                      
              var theNextLoginScreen = (route.params != null && route.params.from == "logout") ? "HOME":"Main";
              setLoginProcessStatus("Loading Usage Data"); 
              getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear()).then((result)=>{

                //console.log(result);
                setIsLoading(false);
                navigation.navigate(theNextLoginScreen,{calendarInfo:result,serialNumber:currentUserData.serialnumber});

              });
            }
            else
            {
              setLoginProcessStatus(""); 
              if(response == "wrong_password")
              {
                setIsLoading(false);
                Alert.alert("Login Error","Password Incorrect");
              }
            }

          });
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
            switch(responseJson.code)
            {
                //Login Success
                case 200:
                    console.log("hello world");
                    currentUserData = responseJson.data;
                    fetch("https://avid.vqconnect.io/nodejs/deviceList?action=findUsageData&SerialNumber="+currentUserData.serialnumber+"&token="+currentUserData.token).then((response)=>response.json()).then((responseJson)=>{


                          userDeviceInfo = responseJson.data;  
                    


                    });
                    console.log(currentUserData.serialnumber);
                    userAccountPtr.doc(usernameInput).get().then((document)=>
                    {
                       
                      if(document.exists)
                        {
                            auth().signInWithEmailAndPassword(document.data().eMail,passwordInput).then(()=>{

                                
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
                            auth().createUserWithEmailAndPassword(responseJson.data.email,passwordInput).then(()=>{

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


          });*/
          console.log("bats");

          



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

      
      <TouchableOpacity onPress={()=>{checkFieldInputs(username,password);}} style={{ marginTop:30,marginBottom:20, backgroundColor: '#722053', width:"80%" }}><Text style={{ fontFamily: "Proxima Nova",fontWeight:'bold',color: '#fff', textAlign: 'center', fontSize: 25, margin:10, }}>Login</Text></TouchableOpacity>
      <TouchableOpacity onPress={()=>{navigation.navigate("Sign Up") }}><Text style={[styles.purpleButton,{marginTop:'6%'}]}>Sign Up</Text></TouchableOpacity>
      <Text>&nbsp;&nbsp;&nbsp;</Text>
      <ActivityIndicator animating={isLoading}/>
      <Text style={{color:'grey',fontSize:10}}>{loginProcessStaus}</Text>
      </View>);
} //End Login Screen




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
                      auth().signInWithEmailAndPassword(document.data().eMail,password).then(()=>{
                      resolve("success");  
                      /*setLoginProcessStatus(""); 
                      
                      var theNextLoginScreen = (route.params != null && route.params.from == "logout") ? "HOME":"Main";
                      setLoginProcessStatus("Loading Usage Data"); 
                      getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear()).then((result)=>{

                        //console.log(result);
                        setIsLoading(false);
                        navigation.navigate(theNextLoginScreen,{calendarInfo:result,serialNumber:currentUserData.serialnumber});

                      });*/
                      /*
                      if(route.params != null && route.params.from == "logout")
                      {
                        console.log("happy meal -a ");
                                  nextLoginScreen = "HOME";
                                  //getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear());
                                  setLoginProcessStatus("Loading Usage Data"); 
                                  getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear()).then((result)=>{

                                    console.log(result);
                                    setIsLoading(false);
                                    navigation.navigate(theNextLoginScreen,{calendarInfo:result,serialNumber:currentUserData.serialnumber});
  
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
                                    navigation.navigate("Main",{calendarInfo:result,serialNumber:currentUserData.serialnumber});
  
                                  });
                                  //navigation.navigate("Main",{calendarInfo:getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear())});
                                  //navigation.navigate("Main");
                                }*/
                                    


                            }).catch(error=>{

                              resolve("wrong_password");
                              /*setLoginProcessStatus(""); 
                                if(error.code == "auth/wrong-password")
                                {
                                  setIsLoading(false);
                                  Alert.alert("Login Error","Password Incorrect");
                                  return;
                                }*/
          
                              });
                        }
                        else
                        {
                            auth().createUserWithEmailAndPassword(responseJson.data.email,password).then(()=>{

                                setLoginProcessStatus("Logging In"); 
                                userAccountPtr.doc(username).set({eMail:responseJson.data.email});
                                setIsLoading(false);
                                //nextLoginScreen = "HOME";
                                //getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear());
                                setLoginProcessStatus("Loading Usage Data"); 
                                getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear()).then((result)=>{

                                  //console.log(result);
                                  navigation.navigate("HOME",{calendarInfo:result,serialNumber:currentUserData.serialnumber});

                                });
                                
                                //navigation.navigate("HOME",{calendarInfo:getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear())});
                
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
})}// <----





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
  console.log("https://avid.vqconnect.io/nodejs/userList?action=findUserUsageDataByMonth&startTime="+year+"-"+month+"-01&endTime="+year+"-"+month+"-"+monthDays[month-1]+"&uid="+currentUserData.uid+"&token="+currentUserData.token);
  fetch("https://avid.vqconnect.io/nodejs/userList?action=findUserUsageDataByMonth&startTime="+year+"-"+month+"-01&endTime="+year+"-"+month+"-"+monthDays[month-1]+"&uid="+currentUserData.uid+"&token="+currentUserData.token,{method:'GET'}).then((responseData)=>responseData.json()).then((responseJson)=>{

  console.log(responseJson.data.length);
  if(responseJson.data.length == 0)
  {
    console.log("No DAta");
    resolve({});
    //resolve("none");
    //navigation.navigate(nextLoginScreen,{calendarInfo:"none"});
  }

  for(var i=0;i<responseJson.data.length;i++)
  {
    if(responseJson.data[i].MinOfUseTotal > 0)
    {
      var currentDot = responseJson.data[i].MinOfUseTotal >= 20 ? usageOver20:usageUnder20;
      dataObject[responseJson.data[i]._id]={dots:[currentDot]};
      fetch("https://avid.vqconnect.io/nodejs/userList?action=findUserUsageDataByDay&dayTime="+responseJson.data[i]._id+"&uid="+currentUserData.uid+"&token="+currentUserData.token).then((responseaa)=>responseaa.json()).then((responseJsonaa)=>{

            var skipped = false;
      
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

            resolve(dataObject);
            //navigation.navigate(nextLoginScreen,{calendarInfo:dataObject});
            //{month:new Date().getMonth()+1,day:new Date().getDate(),year:new Date().getFullYear()}
      });
    }

  }

  //console.log(dataObject);

  

  }); //End Fetch

  


});};


const DeviceSelection = ({route,navigation}) => {

  
  console.log(JSON.stringify(route.params.newUserInfo));
  var [deviceList,setDeviceList] = React.useState([]);
  var [foundDevices,setFoundDevices] = React.useState([]); 
  var [isScanning,setIsScanning] = React.useState(false);
  var [isRegistering,setIsRegistering] = React.useState(false);

  function createNewUser(deviceID)
  {
   
    route.params.newUserInfo.serial_number = deviceID;
    
    
    const dataRequestOptions = {
  
      method:'POST',
      headers: {'x-access-token':currentUserData.token},
      body: 'action=appsignuo&dataJson='+JSON.stringify(route.params.newUserInfo)+'&appversion='+appVersion
      //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
  
  
    };


    fetch("https://avid.vqconnect.io/nodejs/login",dataRequestOptions).then((response)=>response.json()).then((responseJson)=>{


    if(responseJson.code == 200)
    {
      auth().createUserWithEmailAndPassword(route.params.newUserInfo.email,route.params.newUserInfo.password).then(()=>{

        userAccountPtr.doc(username).set({eMail:responseJson.data.email});
        getMonthUsageData(new Date().getMonth()+1,new Date().getFullYear()).then((result)=>{

          //console.log(result);
          setIsLoading(false);
          navigation.navigate("Main",{calendarInfo:result,serialNumber:currentUserData.serialnumber});

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

    Alert.alert("Confirm Device","Are you sure you want to register Device "+name+"?",[

      {text:'Yes',onPress:()=>{createNewUser(name);}},{text:'No'}

    ]);

  }
    if(peripheral.name != null && peripheral.name.substring(0,4) == "Avid" && !foundDevices.includes(peripheral.advertising.localName.substring(5)))
    {
      setDeviceList(deviceList => [...deviceList,<Pressable style={{marginTop:'3%',marginBottom:'3%',alignSelf:'center',width:'80%',borderWidth:2,backgroundColor:avidPurpleHex,borderColor:avidPurpleHex}} deviceId={peripheral.advertising.localName.substring(5)} onPress={e=>onChanged(e,peripheral.advertising.localName.substring(5))} ><Text style={{padding:'4%',fontFamily: "Verdana-Bold",color: '#fff', textAlign: 'center', fontSize: 15}}>{peripheral.advertising.localName.substring(5)}</Text></Pressable>])
      setFoundDevices(foundDevices =>[...foundDevices,peripheral.advertising.localName.substring(5)]);
    }

  }

  bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
  bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',handleSelectFoundDevice);
  bleManagerEmitter.addListener('BleManagerStopScan',(args)=>{

    setIsScanning(false);
    
    //console.log("Scan Stopped "+args.status);

  });



  return(
<View>
  <Modal animationType='none' visible={isRegistering} transparent={true}  >
    <View style={styles.centeredView}>
      <View style={styles.modalView}>
    <Text style={{textAlign:'center'}}>Submitting Your Information</Text>
    </View>
    </View>
    <ActivityIndicator animating={true}/>
  </Modal>
  <TouchableOpacity onPress={()=>{BleManager.scan([],20,false);}} style={{alignSelf:'center',width:'80%',borderWidth:2,backgroundColor:"#D8D8D8",borderColor:avidPurpleHex}}><Text style={{padding:'4%',alignSelf:'center', fontSize:20,fontWeight:'bold',color:avidPurpleHex}}>Scan For Nearby Devices</Text></TouchableOpacity>
<View>
  {deviceList}
  </View>
</View>
  );



}





const MainScreen = ({route,navigation}) => {

  console.log(currentUserData);
  console.log("Last Upload Was "+userDeviceInfo.lastdatatime);
  const [uploadStatus,setUploadStatus] = React.useState("");
  const initialMarkedDates = {}
  const [datesUpdated,setDatesUpdated] = React.useState(false);
  //const [currentSerialNumber,updateSerialNumber] = React.useState(route.props.serialNumber);
  const [markedDates,updateMarkedDates] = React.useState(route.params.calendarInfo);
  const [currentMonth,setCurrentMonth] = React.useState([new Date().getMonth()+1,new Date().getFullYear()]);
  const [isUpdating,setIsUpdating] = React.useState(false);
  const [scanButtonColor,setScanButtonColor] = React.useState("#fff");
  const [scanButtonOpacity,setScanButtonOpacity] = React.useState(1.0);
  const [foundDevice,setFoundDevice] = React.useState(false);
  const [isScanning,setIsScanning] = React.useState(false);
  const [scanStatus,setScanStatus] = React.useState("");
  navigation.setOptions({headerStyle:{backgroundColor:avidPurpleHex},headerTintColor:'white',headerTitle:"Welcome, "+currentUserData.name,headerRight:()=>(<ActivityIndicator alignSelf='center' color="white" animating={isUpdating}/>)});
  const Circle = (color,size) => {return <View style={{alignSelf:'center',width:size,height:size,borderRadius:size/2,backgroundColor:color}}></View>};

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
                      lastUsageAddress = (256*readData[5]+readData[4])-16;
                      console.log("Config Array "+configArray);
                      console.log("Last Usage Data "+lastUsageAddress+" "+[readData[5],readData[4]]);
                      //Start Reading Preset Data
                      if(readData[4] == 0)
                        newGetDeviceData(peripheral,[readData[5]-1,0]);
                      else
                        newGetDeviceData(peripheral,[readData[5],readData[4]-16]);
                      //newGetDeviceData(peripheral,[readData[5],readData[4]]);
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
                          if(userDeviceInfo.lastdatatime < convertDateStringForCompare(readData[1],readData[2],readData[3],readData[4],readData[5]))
                          {
                            if(readData[0]==93)
                            {
                                console.log("Usage "+["U",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),readData[6]-128, calculation(readData[8],readData[9]),calculation(readData[10],readData[11]),readData[12],readData[13],readData[14],readData[15],256*address[0]+address[1]]);
                                usageArray.push(["U",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),readData[6]-128, calculation(readData[8],readData[9]),calculation(readData[10],readData[11]),readData[12],readData[13],readData[14],readData[15],256*address[0]+address[1]]);
                            }
                            if(readData[0]==173)
                            {
                              console.log("Answer "+["A",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),answers[readData[6]],answers[readData[7]],answers[readData[8]],answers[readData[9]],answers[readData[10]],256*address[0]+address[1]]);  
                              usageArray.push(["A",generateDateTimeString(readData[1],readData[2],readData[3],readData[4],readData[5]),answers[readData[6]],answers[readData[7]],answers[readData[8]],answers[readData[9]],answers[readData[10]],256*address[0]+address[1]]);
                            }
                          }
                         
                          
                          
                          //console.log(256*address[1]+address[0]+" "+lastUsageAddress);
                          /*if(256*address[0]+address[1] < lastUsageAddress - 16)
                          {
                              if(address[1] == 240)
                              {
                                  newGetDeviceData(peripheral,[address[0]+1,0]);
                              }
                              else
                              {
                                  newGetDeviceData(peripheral,[address[0],address[1]+16]);
                              }
                          }*/
                          if(256*address[0]+address[1]>896)
                          {
                            if(address[1] == 0)
                              {
                                  newGetDeviceData(peripheral,[address[0]-1,240]);
                              }
                              else
                              {
                                  newGetDeviceData(peripheral,[address[0],address[1]-16]);
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



function uploadDeviceData(usageData)
{
  
  setScanStatus("Uploading Data To Server!");
  console.log("Here we do");
  var jsonData = "{";
jsonData += '"SerialNumber":"'+currentUserData.serialnumber+'","UserInfo":{"PatientName":"'+currentUserData.name+'","PatientEmail":"'+currentUserData.email+'","DoctorEmail":"'+currentUserData.doctorEmail+'","DeviceName":"Avid IF2"},';
jsonData += '"Usage":[';
for(var i = 0; i < usageData.length;i++)
{
  if(usageData[i][0] == "U")
  {
    console.log("Date Is "+usageData[i][1][0]);
    jsonData += '["'+usageData[i][0]+'",["'+usageData[i][1][0]+'","'+usageData[i][1][1]+'"],'+usageData[i][2]+','+usageData[i][4]+','+usageData[i][3]+','+usageData[i][5]+','+usageData[i][6]+','+usageData[i][7]+','+usageData[i][8]+','+usageData[i][9]+']';
  }
    
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

  setScanStatus("Upload Complete");

  setIsUpdating(false);
  setUploadStatus(uploadStatus+"\nUpload Complete!");
  console.log("Response Is "+responseJson.code+" "+responseJson.msg);

  }).catch((error,data)=>{console.log("The Error "+error+" "+data)});
  
} 

  const handleDiscoverDevice = (peripheral) => {

    if(peripheral.name != null && peripheral.name.substring(0,4) == "Avid")
    {
      BleManager.stopScan().then(()=>{

        setScanStatus("Reading Data from Device");
        newGetDeviceData(peripheral,[0,0]);


      });
    }

  }

  bleManagerEmitter.removeAllListeners('BleManagerDiscoverPeripheral');
  bleManagerEmitter.addListener('BleManagerDiscoverPeripheral',handleDiscoverDevice);
  bleManagerEmitter.addListener('BleManagerStopScan',(args)=>{

    setScanStatus("");
    if(args.status==10)
      Alert.alert("Device Not Found","Please ensure that your AVID device is nearby, turned on, and set to Bluetooth mode");
    
    //console.log("Scan Stopped "+args.status);

  });


  function updateCalendar(dayInfo)
  {
    setIsUpdating(true);
    getMonthUsageData(dayInfo[0],dayInfo[1]).then((result)=>{

      console.log(result);
      updateMarkedDates(result);
      setIsUpdating(false);

    });
  }

  const startDeviceScanButton = () => {

    setIsUpdating(true);
    setIsScanning(true);
    setScanButtonColor("#bbb");
    setScanButtonOpacity(0.3);
    setScanStatus("Scanning for Device");
    
    BleManager.scan([],20,false);

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
<Text style={[styles.grayButton,{alignSelf:'center',fontSize:23}]}>{currentUserData.serialnumber}</Text>
<TouchableOpacity   disabled={isScanning} alignSelf='center' onPress={()=>{startDeviceScanButton();}} style={{opacity:scanButtonOpacity, alignSelf:'center', marginTop:30,marginBottom:5, backgroundColor: "#722053", width:"80%" }}><Text style={{ fontFamily: "Proxima Nova",fontWeight:'bold',color:scanButtonColor, textAlign: 'center', fontSize: 25, margin:10, }}>Sync Device Data</Text></TouchableOpacity>
<Text style={{fontSize:17,color:'grey',alignSelf:'center'}}>{scanStatus}</Text>
<Text style={[styles.grayButton,{alignSelf:'center',fontSize:23,marginTop:'8%'}]}>Last Upload Time:</Text>
<Text style={[styles.grayButton,{alignSelf:'center',fontSize:18}]}>{moment(userDeviceInfo.lastdatatime,'YYYY-MM-DD').format('MMM DD, YYYY')}</Text>
</View>

);

}

const SignupScreen = ({navigation}) => {

  
  const [formValid,setFormValid] = React.useState(true);
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
    const statusMsg = type == "user"?"Username already taken":"E-mail already in use";
    setFormValid(true);
    console.log("Validate");
    setTimeout(()=>{

      var requestOptions;
      var insertString = type == "user" ? "checkUsername&username="+value:"checkEmail&email="+value;
      
        
        
        requestOptions = {
      
          method:'POST',
          headers: new Headers({
            'Content-Type': 'application/x-www-form-urlencoded', // <-- Specifying the Content-Type
          }),
          body: 'action='+insertString+'&appversion='+appVersion
          //        data:'action=signIn'+'&whereJson='+JSON.stringify({'username':username,'password':password})+'&appversion='+global.appVersion
    
    
        };

      fetch('https://avid.vqconnect.io/nodejs/login',requestOptions).then((res)=>res.json()).then((resjson)=>{

        
      if(resjson.code == "202")
        setFormValid(false);
      
      if(type=="user")
          resjson.code == "202"?setUsernameStatus(statusMsg):setUsernameStatus("");  
        else
          resjson.code == "202"?setemailstatus(statusMsg):setemailstatus("");  
      
      });
     


    },100);
    
  }
  
  
  function validateForm()
  {
    
    setFormValid(true);
    var color="";
    const fields = [username,eMail,nameEntry,password];
    const labels = [setUserLabelColor,setEmailLabelColor,setNameLabelColor,setPasswordLabelColor];

    //Checking for Blank Fields
    for(var i = 0;i<fields.length;i++)
    {
      
      if(fields[i]=="")
      {
        setFormValid(false);
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

    if(confirmPassword != "" && password != confirmPassword)
    {
      setFormValid(false);
    }
    
    
  
  }

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
    <TextInput style={styles.textFields} onChangeText={(text)=>{setNameEntry(text);validateForm();}} value={nameEntry}></TextInput>
    <Text style={styles.signUpLabels}>Account Number</Text>
    <TextInput style={styles.textFields}></TextInput>
    <Text style={[styles.signUpLabels,{color:passwordLabelColor}]}>Password*</Text>
    <TextInput style={styles.textFields} onChangeText={(text)=>{setPassword(text);validateForm();}} value={password}></TextInput>
    <Text style={[styles.signUpLabels,{color:confirmPasswordLabelColor}]}>Confirm Password*</Text>
    <TextInput style={styles.textFields} onChangeText={(text)=>{setConfirmPassword(text);validateForm();}} value={confirmPassword}></TextInput>
    <Text style={{color:'red',fontSize:10}}>{confirmPasswordStatus}</Text>
    <TouchableOpacity onPress={()=>{validateForm();if(formValid){navigation.navigate("Select Device",{newUserInfo:buildUserObject()});}else{console.log("Not Valid");}}} style={{ marginTop:30,marginBottom:20, backgroundColor: '#722053', width:"80%" }}><Text style={{ fontFamily: "Verdana-Bold",color: '#fff', textAlign: 'center', fontSize: 25, margin:10, }}>Signup</Text></TouchableOpacity>
  
    </ScrollView>
    </View>
  );


}

export default App;