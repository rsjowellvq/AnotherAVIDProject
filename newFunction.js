function getDeviceData(peripheral,address)
{
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
                                console.log("The Stuff Is ");
                                console.log((256*readData[5]+readData[4])-16);
                                setLastUsageAddress((256*readData[5]+readData[4])-16);
                                console.log("Last Usage Address Is "+lastUsageAddress);
                                if(lastUsageAddress > 4070 || (lastDataAddress != null && lastDataAddress == lastUsageAddress))
                                {
                                    console.log("It was rejected");
                                    const noticeString = lastUsageAddress > 4070 ? "No New Records. Device was recently reset.":"No New Records";
                                    return reject(noticeString);
                                    /*
                                    const noticeString = lastUsageAddress > 4070 ? "No New Records. Device was recently reset.":"No New Records";
                        
                                    Alert.alert("Notice",noticeString,[{text:'OK',onPress:()=>{
                                        setScanStatus("");
                                        setIsUpdating(false);
                                        setIsScanning(false);
                                        setScanButtonColor("white");
                                        setScanButtonOpacity(1.0);
                                        return;
                                    }}
                                    ]);*/
                                }
                                console.log("Config Array "+configArray);
                                console.log("Last Usage Data "+lastUsageAddress+" "+[readData[5],readData[4]]);
                                //Start Reading Preset Data
                      
                                return resolve(0);
                        
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
                                return resolve(1); 
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
                                    //getDeviceData(peripheral,[3,80])
                                    return resolve(2);
                                }
                                return resolve(3);
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

                        });
                    },500);
                });

            });
        });

    }).then((returnVal)=>{
        return("The Return Val Is "+returnVal);
    }).catch((error)=>{
        return("There was a problem with your stuff "+error);
    });//End Main Promise
}