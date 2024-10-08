import {
    View,
    Text,
    Image,
    SafeAreaView,
    Alert,
    TouchableOpacity,
    Platform,
} from "react-native";
import Tts from 'react-native-tts';

import {
    useContext,
    useEffect,
    useRef,
    useState
} from "react";

import Colors from "../../constants/colors";
import { styleStartWorkout } from "./Style";
import CustomStatusbar from "../../components/CustomStatusBar";
import { AppIcons } from "../../constants/icons";
import CircularProgress from 'react-native-circular-progress-indicator';
import Fonts from "../../constants/fonts";
import useBackHandler from '../../hooks/useBackHandler';
import { CongratulatesAlert } from '../../components/CongratesAlert';
import { RequestDisableOptimization, BatteryOptEnabled } from "react-native-battery-optimization-check";
import { CustomRoundedButton } from '../../components/CustomRoundedBtn';
import Context from '../../utils/services/context';
import BackgroundService from 'react-native-background-actions';
import KeepAwake from 'react-native-keep-awake';
import moment from "moment";
import Sound from "react-native-sound";
import { CustomBackButton } from "../../components/BackButton";
import { TitleComponent } from "../../components/TitleComponent";
// Ads code
import { BannerAd, BannerAdSize, InterstitialAd, AdEventType } from 'react-native-google-mobile-ads';
import AdIds from "../../utils/AdIds";

const interstitial = InterstitialAd.createForAdRequest(AdIds.interstitialUnitId, {
    keywords: ['fashion', 'clothing'],
});

// let timerInterval;

// Back ground action  sleep awake function
let startTime = undefined;
let timerInterval;

const sleep = time => new Promise(resolve => setTimeout(() => resolve(), time));

// Background timer options....
const options = {
    taskName: 'Workout',
    taskTitle: 'Workout Timer',
    taskDesc: 'Workout Timer Background Task',
    taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
    },
    color: '#23C594',
    linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
    parameters: {
        delay: 10000,
    },
};
// Background timer options....

export function StartWorkout({ navigation, route }) {
    let workoutObj = route?.params?.workoutObj;
    console.log(workoutObj, "workoutObj.........")
    const progressRef = useRef(null);
    const { workoutData, isAddFree, isAddFreeUnlimited } = useContext(Context);
    const [currentExerciseIndexvalue, setCurrentExerciseIndexvalue] = useState(0);
    const [timervalue, setTimervalue] = useState(0);
    const [progressKey, setProgressKey] = useState(0);
    const [currentRound, setCurrentRound] = useState(1);
    const [isWorkoutPause, setIsWorkoutPause] = useState(true);
    const [secondsArray, setSecondsArray] = useState(null);
    const [exRemianingTime, setExRemianingTime] = useState(0);
    const [workoutCompleted, setWorkoutCompleted] = useState(false);
    const [isCongratesAlert, setIsCongratesAlert] = useState(false);
    const [getReadyTime, setGetReadyTime] = useState(workoutData?.getReadyTime);
    const [getReadyTimer, setGetReadyTimer] = useState(0);
    const [isWorkoutPlayed1, setIsWorkoutPlayed1] = useState(0);
    const [interstitialAdShowed, setInterstitialAdShowed] = useState(false);
    const [interstitialAdLoad, setInterstitialAdLoad] = useState(false);
    const [remianingTime, setRemianingTime] = useState(0);

    const [elapsedTime, setElapsedTime] = useState(0);



    // Function for text to speech
    const textToSpeech = (text) => {
        Tts.speak(text)
    }
    // Function for text to speech

    // Function for exercise text to speech
    const exerciseTTS = (text) => {
        if (workoutData?.isExNameAnnounce === true && isWorkoutPause === true) {
            textToSpeech(text?.toString())
        }
    }
    // Function for  exercise text to speech

    // Function for last 3 seconds
    const last3SecondsTTS = (text) => {
        if (workoutData?.isLast3SecondsAnnounce === true) {
            textToSpeech(text?.toString())
        }
    }
    // Function for last 3 seconds

    // Function for exercise text to speech
    const roundTTS = (roundNo) => {
        if (workoutData?.isRoundsAnnounce === true && isWorkoutPause === true) {
            textToSpeech("Round" + roundNo?.toString())
        }
    }
    // Function for  exercise text to speech

    // Play pause workout
    const playPauseWortout = () => {

        // Show interstial ad if even presed once
        let played = isWorkoutPlayed1 + 1
        setIsWorkoutPlayed1(played)
        // Show interstial ad if even presed once

        // Change State of workout play <=> pause
        let workoutState = !isWorkoutPause
        setIsWorkoutPause(workoutState)

        // Pause time calculation
        if (workoutState == false) {
            let now = moment().valueOf();
            let passed = now - startTime;
            onPausePassedTime = passed;
        }
        // Pause time calculation


        // Play workout
        else if (workoutState === true) {
            // Reset start workout after puase workout played
            setTimeout(() => {
                if (onPausePassedTime != 0) {
                    startTime = (moment().valueOf() - onPausePassedTime) + 1000;
                    onPausePassedTime = 0
                }
            }, 1000);
            // Reset start workout after puase workout played

            if (getReadyTime >= 0 && workoutData?.isGetReadyTimer === true) {
                textToSpeech("Get ready");
                if (getReadyTime <= 3) {
                    textToSpeech(getReadyTime.toString())
                }
            }
            else if (parseInt(workoutObj?.exercises[0].duration) === remainingTime && currentRound == 1) {
                if (workoutData?.isRoundsAnnounce === true) {
                    textToSpeech("Round  1")
                }
                if (workoutData?.isExNameAnnounce === true) {
                    textToSpeech(workoutObj?.exercises[0]?.title)
                    if (currentRound == workoutObj?.rounds && workoutObj?.exercises.length == 1) {
                        setTimeout(() => {
                            textToSpeech("last exercise of final round")
                        }, 100);
                    }
                    else if (workoutObj?.exercises.length == 1) {
                        setTimeout(() => {
                            textToSpeech("last exercise")
                        }, 100);
                    }
                }
            }
            else if (workoutObj?.exercises[currentExerciseIndexvalue].duration === remainingTime) {
                roundTTS(currentRound)
                if (workoutData?.isExNameAnnounce === true) {
                    textToSpeech(workoutObj?.exercises[currentExerciseIndexvalue]?.title)
                    if (currentRound == workoutObj?.rounds && workoutObj?.exercises.length == 1) {
                        setTimeout(() => {
                            textToSpeech("last exercise of final round")
                        }, 100);
                    }
                    else if (workoutObj?.exercises.length == 1) {
                        setTimeout(() => {
                            textToSpeech("last exercise")
                        }, 100);
                    }
                }
            }
            else {
                if (workoutData?.isExNameAnnounce === true) {
                    textToSpeech(workoutObj?.exercises[currentExerciseIndexvalue]?.title)
                }
            }
        }
    }
    // Play pause workout

    // Check bettry permission on android
    async function batteryPermissions() {
        if (Platform.OS == "android") {
            await BatteryOptEnabled().then((isEnabled) => {
                if (isEnabled) {
                    // if battery optimization is enabled, request to disable it.
                    Alert.alert(
                        "Stop optimizing battery usage?",
                        "Workout Timer needs battery usage permission to run in the background so it doesn't shut off during your workout.",
                        [
                            {
                                text: "Deny",
                                onPress: () => { },
                                style: "cancel"
                            },
                            {
                                text: "Allow", onPress: () => {
                                    RequestDisableOptimization()
                                },
                                style: "cancel"
                            }
                        ]
                    )
                }
                else {
                    playPauseWortout()
                }

            });
        }
        else {
            playPauseWortout()
        }
    }
    // Check bettry permission on android

    // Function to start background service
    const veryIntensiveTask = async taskDataArguments => {
        // Example of an infinite loop task
        const { delay } = taskDataArguments;
        await new Promise(async resolve => {
            for (let i = 0; BackgroundService.isRunning(); i++) {
                await BackgroundService.updateNotification({
                    taskDesc: 'Workout Timer Background Task',
                });
                await sleep(delay);
            }
        });
    };
    // Function to start background service

    // Function to start background service
    const startWorkoutBg = async () => {
        await BackgroundService.start(veryIntensiveTask, options);
    };

    const stopWorkoutBg = async () => {
        await BackgroundService.stop();
    };
    // Function to start background service

    // Should keep awake the component
    function changeKeepAwake(shouldBeAwake) {
        if (shouldBeAwake) {
            KeepAwake.activate();
        } else {
            KeepAwake.deactivate();
        }
    }
    // Should keep awake the component

    useEffect(() => {

        // Perform any setup or configuration needed for TTS
        Tts.addEventListener('tts-start', (event) => console.log("start", event)); Tts.setIgnoreSilentSwitch("ignore");
        // Calculate the seconds array when the component mounts
        const seconds = workoutObj?.exercises?.map((item) => item?.duration);
        setSecondsArray(seconds);
        // getWorkoutTime()
        // setProgressKey(prevKey => prevKey + 1);
        // setCurrentExerciseIndexvalue(0)
        changeKeepAwake(true)
        startWorkoutBg()
        // Sound initailization
        Sound.setCategory('Playback');
        Sound.setActive(true);
        var whoosh = new Sound('interval_countdown.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error);
                return;
            }
            // loaded successfully
            console.log('duration in seconds: ' + whoosh.getDuration() + 'number of channels: ' + whoosh.getNumberOfChannels());

            // Play the sound with an onEnd callback
            whoosh.play((success) => {
                if (success) {
                    console.log('successfully finished playing');
                } else {
                    console.log('playback failed due to audio decoding errors');
                }
            });
        });


        return () => {
            startTime = undefined;
            onPausePassedTime = 0;
            Tts.stop()
            changeKeepAwake(false)
            stopWorkoutBg()
        }
    }, []);
    // useEffect for setting initial values

    // Play slient sound to live ios in the background
    const playSilent = () => {
        Sound.setCategory('Playback');
        Sound.setActive(true);
        var whoosh1 = new Sound('silent_tune.mp3', Sound.MAIN_BUNDLE, (error) => {
            if (error) {
                console.log('failed to load the sound', error);
                return;
            }
            // loaded successfully
            console.log('duration in seconds: ' + whoosh1.getDuration() + 'number of channels: ' + whoosh1.getNumberOfChannels());
            // Play the sound with an onEnd callback
            whoosh1.play((success) => {
                if (success) {
                    console.log('successfully silent_tune finished playing');
                } else {
                    console.log('playback silent_tune failed due to audio decoding errors');
                }
            });
        });
    }
    // Play slient sound to live ios in the background

    const updateTime = () => {
        let now;
        // Increment elapsedTime by 300 milliseconds
        setElapsedTime(prevElapsedTime => prevElapsedTime + 350);

        if (startTime == undefined || startTime == 0) {
            startTime = moment().valueOf()
            now = moment().valueOf();
        }
        else {
            now = moment().valueOf();
        }

        let _currentExTime = (secondsArray[currentExerciseIndexvalue] * 1000);
        // let now = moment().valueOf();
        let passed = now - startTime;
        let time = moment(_currentExTime - passed).format("mm:ss");
        console.log(passed, "passed time")
        console.log(time, "Time")

        if (timervalue < secondsArray[currentExerciseIndexvalue]) {
            setExRemianingTime(time);
            // Check if 1 second has passed since the last increment
            if (elapsedTime >= 1000) {
                setTimervalue(prevTimervalue => prevTimervalue + 1);
                setElapsedTime(0); // Reset elapsedTim
            }

            //     // Last 3 seconds count down
            //     let last3Seconds=parseInt(moment(_currentExTime - passed).format("ss"))
            //     if (last3Seconds < 4 && last3Seconds > 0) {
            //         last3SecondsTTS(last3Seconds)
            //     }
            //     // Last 3 seconds count down
        }
        else {
            startTime = 0
            setElapsedTime(0)
            clearInterval(timerInterval);
            let nextIndex = currentExerciseIndexvalue + 1;
            if (nextIndex < secondsArray.length) {
                setCurrentExerciseIndexvalue(nextIndex);
                setTimervalue(0);
                setProgressKey(prevKey => prevKey + 1);
                startTime = 0
                if (nextIndex === (workoutObj?.exercises?.length - 1) && workoutObj?.rounds === currentRound) {
                    if (workoutData?.isExNameAnnounce === true) {
                        exerciseTTS(workoutObj?.exercises[nextIndex]?.title)
                        setTimeout(() => {
                            textToSpeech("last exercise of final round")
                        }, 100);
                    }
                }
                else {
                    exerciseTTS(workoutObj?.exercises[nextIndex]?.title)
                    if (workoutData?.isExNameAnnounce === true && nextIndex === (workoutObj?.exercises.length - 1)) {
                        setTimeout(() => {
                            textToSpeech("last exercise")
                        }, 100);
                    }
                }
            }
            else {
                if (currentRound < workoutObj?.rounds) {
                    setCurrentRound(currentRound + 1);
                    setCurrentExerciseIndexvalue(0);
                    setTimervalue(0);
                    setProgressKey(prevKey => prevKey + 1);
                    startTime = 0
                    roundTTS((parseInt(currentRound) + 1))
                    if (workoutData?.isExNameAnnounce === true && workoutObj?.exercises.length == 1 && workoutObj?.rounds === (currentRound + 1)) {
                        exerciseTTS(workoutObj?.exercises[0]?.title)
                        setTimeout(() => {
                            textToSpeech("last exercise of final round")
                        }, 100);
                    }
                    else {
                        if (workoutData?.isExNameAnnounce === true && workoutObj?.exercises.length == 1) {
                            exerciseTTS(workoutObj?.exercises[0]?.title)
                            setTimeout(() => {
                                textToSpeech("last exercise")
                            }, 100);
                        }
                    }

                }
                else {
                    if (!workoutCompleted) {
                        setWorkoutCompleted(true);
                        textToSpeech("Workout Completed")
                        setIsCongratesAlert(true)
                        startTime = 0

                    }
                }

            }
        }

    }


    useEffect(() => {
        if (!isWorkoutPause) {
            timerInterval = setInterval(() => {
                updateTime()
            }, 350);
        }

        return () => {
            if (timerInterval) {
                clearInterval(timerInterval);
            }
        }
    }, [exRemianingTime, isWorkoutPause, timervalue]);



    const backAction = () => {
        // You can perform actions or show alerts when changes are detected
        setIsWorkoutPause(false)
        if (workoutCompleted === false) {
            Alert.alert(
                "Alert",
                "Are you sure you want to exit the workout? If you leave now, your workout will restart when you come back.",
                [
                    { text: "Yes", onPress: () => navigation.goBack() },
                    {
                        text: "No", onPress: () => {
                            setIsWorkoutPause(isWorkoutPause)
                        }
                    }
                ],
            );

        }
        else {
            navigation.goBack()
        }
        return true;
    };

    // Place this outside of your StartWorkout component
    const formatTime = (totalSeconds) => {
        const minutes = Math.floor(totalSeconds / 60);
        const seconds = totalSeconds % 60;
        return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    };
    const remainingTime = !!secondsArray && secondsArray[currentExerciseIndexvalue] - timervalue;
    const formattedRemainingTime = formatTime(remainingTime);
    // Place this outside of your StartWorkout component

    // useBackHandler(backAction)

    return (
        <SafeAreaView style={{ flex: 1, backgroundColor: Colors.screenBgClr }}>

            <CustomStatusbar clr={Colors.primaryClr} />

            {/* <CustomAppBar2
                isTittle={true}
                title={workoutObj?.title}
                backIcon={true}
                onBackBtnPress={() => {
                    setIsWorkoutPause(false)
                    if (workoutCompleted === false) {
                        Alert.alert(
                            "Alert",
                            "Are you sure you want to exit the workout? If you leave now, your workout will restart when you come back.",
                            [
                                { text: "Yes", onPress: () => navigation.goBack() },
                                { text: "No", onPress: () => { setIsWorkoutPause(isWorkoutPause) } }
                            ],
                        );
                    }
                    else {
                        navigation.goBack()
                    }
                }}
                rightIcon={
                    <View style={{ marginRight: 10 }}>

                        <Text
                            style={{
                                color: Colors.primaryClr,
                                fontSize: 14,
                                                        fontFamily: Fonts.medium,
                                marginTop: 25,
                                textAlign: 'center',
                            }}>
                            {timeFormat()}</Text>

                        <Text style={{
                            textAlign: 'center',
                            fontSize: 9,
                            color: Colors.greyText,
                            fontFamily: Fonts.medium,
                        }}>Remaining Time</Text>

                    </View>
                }
            /> */}

            <View style={{ minHeight: 50, flexDirection: 'row' }}>

                <View style={{ flex: 1.2, alignItems: 'center', justifyContent: 'center' }}>

                    <CustomBackButton onPress={() => {

                        // if (isWorkoutPlayed1 > 0 && interstitialAdLoad && interstitialAdShowed == false && !isAddFree && !isAddFreeUnlimited) {
                        //     setInterstitialAdShowed(true)
                        //     interstitial.show();
                        // }

                        setIsWorkoutPause(false)
                        if (workoutCompleted === false) {
                            Alert.alert(
                                "Alert",
                                "Are you sure you want to exit the workout? If you leave now, your workout will restart when you come back.",
                                [
                                    { text: "Yes", onPress: () => navigation.goBack() },
                                    { text: "No", onPress: () => { setIsWorkoutPause(isWorkoutPause) } }
                                ],
                            );
                        }
                        else {
                            navigation.goBack()
                        }
                    }} />
                </View>

                <View style={{ flex: 4, alignItems: 'center', justifyContent: 'center' }}>
                    <TitleComponent title={workoutObj?.title} />
                </View>

            </View>

            <View style={styleStartWorkout.rootContainer} >
                {/* <View style={{ marginTop: 20, width: '85%', flexDirection: 'row', justifyContent: 'space-between', alignSelf: 'center' }}>
                    <RemainingTimeCard
                        text={timeFormat()}
                        des={"Remaining Time"}
                        img={AppIcons.timeWhite}
                    />

                    <RemainingTimeCard
                        text={currentRound + '/' + workoutObj?.rounds}
                        des={"Workout Rounds"}
                        img={AppIcons.roundsWhite}
                    />

                </View> */}

                {(!isAddFree && !isAddFreeUnlimited) &&
                    <View style={{ marginTop: 10 }}>
                        <BannerAd
                            unitId={AdIds.bannerUnitId}
                            size={BannerAdSize.ANCHORED_ADAPTIVE_BANNER}
                        />
                    </View>
                }

                {secondsArray !== null &&
                    <CircularProgress
                        ref={progressRef}
                        key={progressKey}
                        value={Math.max(0, timervalue)}

                        maxValue={secondsArray[currentExerciseIndexvalue]}
                        // value={workoutData?.isGetReadyTimer === true && getReadyTime >= 0 ? getReadyTimer : Math.max(0, timervalue)}
                        // maxValue={workoutData?.isGetReadyTimer === true && getReadyTime >= 0 ? workoutData?.getReadyTime : secondsArray[currentExerciseIndexvalue]}
                        radius={110}

                        showProgressValue={false}
                        title={<Text style={{ verticalAlign: 'middle', fontSize: 40, color: Colors.headingClr, fontFamily: Fonts.bold, includeFontPadding: false, textAlign: 'center' }} >{exRemianingTime}</Text>}
                        // title={<Text style={{ verticalAlign: 'middle', fontSize: 40, color: Colors.headingClr, fontFamily: Fonts.bold,includeFontPadding:false, textAlign: 'center' }} >{workoutData?.isGetReadyTimer === true && getReadyTime >= 0 ? formatTime(Math.abs(getReadyTime)) : formattedRemainingTime}</Text>}
                        subtitle={
                            <Text
                                numberOfLines={2}
                                ellipsizeMode="tail"
                                style={{
                                    flex: 1,
                                    width: '80%',
                                    verticalAlign: 'middle',
                                    fontSize: 18,
                                    color: Colors.greyText,
                                    fontFamily: Fonts.regular,
                                    includeFontPadding: false,
                                    textAlign: 'center'
                                }}
                            >
                                {workoutObj?.exercises[currentExerciseIndexvalue]?.title}

                                {/* {workoutData?.isGetReadyTimer === true && getReadyTime >= 0 ? "Get Ready!" : currentRound === workoutObj?.rounds && currentExerciseIndexvalue > workoutObj?.exercises?.length - 1 ? "Completed" : workoutObj?.exercises[currentExerciseIndexvalue]?.title} */}
                            </Text>
                        }
                        titleColor={Colors.whiteClr}
                        titleStyle={{ fontFamily: Fonts.bold, includeFontPadding: false, fontSize: 18 }}
                        activeStrokeColor={Colors.primaryClr}
                        inActiveStrokeColor={Colors.primaryBgClr}
                        inActiveStrokeOpacity={1}
                        inActiveStrokeWidth={12}
                        activeStrokeWidth={15}
                        circleBackgroundColor={Colors.primaryBgClr}
                    />

                }
                <View style={{ alignItems: 'center' }}>


                    <View style={{ marginBottom: 8, minWidth: 115, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>

                        <Text style={{
                            color: Colors.headingClr,
                            fontFamily: Fonts.regular,
                            includeFontPadding: false,
                            fontSize: 18,
                            marginRight: 10
                        }}>Rounds</Text>

                        <Text
                            style={{
                                color: Colors.primaryClr,
                                fontSize: 18,
                                fontFamily: Fonts.semiBold,
                                includeFontPadding: false,
                            }}>
                            {currentRound + '/' + workoutObj?.rounds}
                        </Text>

                    </View>

                    {
                        currentRound >= workoutObj?.rounds && currentExerciseIndexvalue >= workoutObj?.exercises?.length - 1 ? null :
                            <Text style={styleStartWorkout.instructionText}>Upcoming Exercise</Text>
                    }

                    <Text style={{
                        marginTop: 8,
                        textAlign: 'center',
                        color: Colors.headingClr,
                        fontFamily: Fonts.regular,
                        includeFontPadding: false,
                        fontSize: 18,
                    }} >
                        {timervalue < 0 ? workoutObj?.exercises[0].title : currentExerciseIndexvalue < workoutObj?.exercises?.length - 1 ? workoutObj?.exercises[currentExerciseIndexvalue + 1]?.title : currentRound < workoutObj?.rounds ? workoutObj?.exercises[0]?.title : " Last Exercise "}
                    </Text>

                </View>

                <View style={styleStartWorkout.btnsContainer}>
                    <TouchableOpacity
                        disabled={currentRound === 1 && currentExerciseIndexvalue == 0}
                        activeOpacity={1}
                        onPress={() => {
                            // updateWorkoutTimeBackward
                        }} >
                        <Image
                            source={AppIcons.backward}
                            style={[styleStartWorkout.backworkIcon, { opacity: currentRound === 1 && currentExerciseIndexvalue == 0 ? 0.5 : 1 }]}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        activeOpacity={1}
                        onPress={batteryPermissions}>
                        <Image
                            source={isWorkoutPause ? AppIcons.playWorkout : AppIcons.pauseWorkout}
                            style={styleStartWorkout.playPauseBtn}
                        />
                    </TouchableOpacity>

                    <TouchableOpacity
                        disabled={currentRound >= workoutObj?.rounds && currentExerciseIndexvalue >= workoutObj?.exercises?.length - 1}
                        activeOpacity={1}
                        onPress={() => {
                            // updateWorkoutTimeForward
                        }} >
                        <Image
                            source={AppIcons.forward}
                            style={[styleStartWorkout.backworkIcon, { opacity: currentRound >= workoutObj?.rounds && currentExerciseIndexvalue >= workoutObj?.exercises?.length - 1 ? 0.5 : 1 }]}
                        />
                    </TouchableOpacity>

                </View>

                <CustomRoundedButton
                    btnFun={() => { }}
                    text={"Restart Workout"}
                />

                <CongratulatesAlert
                    visibleView={isCongratesAlert}
                    btnTitle={'OKAY'}
                    btnFunction={async () => {
                        setIsCongratesAlert(false)
                        navigation.goBack()
                    }}
                />

            </View>
        </SafeAreaView>
    )
}
