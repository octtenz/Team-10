import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { FIREBASE_AUTH } from './firebase-config.js';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import EmailPopup from './emailPopup.js';
import PasswordPopup from './passwordPopup.js';

/**
 * Login screen allow enter email address and password to navigate to Home screen by sign up or sign in,
 * and button allow navigate to Reset Password screen
 * @param {navigattion} 
 * @returns Login Screen object
 */
const LoginScreen = ({ navigation }) => {
    //Define necessary variables
    const [invalidMessageVisible, setInvalidMessageVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailModalVisible, setEmailModalVisible] = useState(false); 
    const [passwordModalVisible, setPasswordModalVisible] = useState(false); 

    //Firebase authentication instance from firebase-config.js
    const auth = FIREBASE_AUTH;

    /**
     * Handle sign up process, which create Firebase authentication if input are valid, then navigate to Home screen
     */
    const handleSignUp = async () => {
        setLoading(true); //start loading
        setInvalidMessageVisible(false); //hide message for invalid input 
        
        //Show message or pop up alert for invalid input, or Firebase authentication and navigate to Home screen
        try {
            if (isPasswordValid(password)) {
                const response = await createUserWithEmailAndPassword(auth, email, password);
                navigation.navigate('Home', { email: email, password: password });
            } else {
                setInvalidMessageVisible(true);
            }
        } catch (error) {
            console.log(error);
            if (error.code === 'auth/invalid-email') {
                setInvalidMessageVisible(true); //Show invalid input message instead of alert
            } else {
                Alert.alert('Sign Up failed', error.message);
            }
        } finally {
            setLoading(false); //end loading
        }
    };
    
    /**
     *Handle sign in process, which navigate to Home screen if input are valid
     */
    const handleSignIn = async () => {
        setLoading(true); //start loading
        setInvalidMessageVisible(false); //hide message for invalid input 
        
        //Show message or pop-up alert for invalid input, or navigate to Home screen
        try {
            if (isPasswordValid(password)) {
                const response = await signInWithEmailAndPassword(auth, email, password);
                navigation.navigate('Home', { email: email, password: password });
            } else {
                setInvalidMessageVisible(true);
            }
        } catch (error) {
            console.log(error);
            //Customize alert message
            if (error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password') {
                setInvalidMessageVisible(true); //Show invalid input message instead of alert
            } else if (error.code === 'auth/invalid-credential') {
                Alert.alert('Sign In failed', 'Invalid user name or password');
            } else if (error.code === 'auth/too-many-requests') {
                Alert.alert('Sign In failed', 'Too many attempts, try again later');
            } else {
                Alert.alert('Sign In failed', error.message);
            }
        } finally {
            setLoading(false); //end loading
        }
    };

    /**
     * Check is password in correct format, which at least 8 character and contatin both upper and lower case letter, digit, and spcial character 
     * @param {*} password 
     * @returns boolean for is password valid
     */
    const isPasswordValid = (password) => {
        return password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[^A-Za-z0-9]/.test(password);
    };
    
    /**
     * Handle show or hide passowrd
    */
    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    /**
     * Handle show or hide email hint pop up
    */
    const emailHintPopUp = () => {
        setEmailModalVisible(!emailModalVisible);
    };

    /**
     * Handle show or hide email hint pop up
    */
    const passwordHintPopUp = () => {
        setPasswordModalVisible(!passwordModalVisible); 
    }

    return (
        <View style={styles.container}>
            {/* logo */}
            <Image
                source={require('./logo.png')}
                style={styles.logoImage}
            />

            {/* input section */}
            <View style={styles.col}>
                {/* hint and label for email input */}
                <View style={styles.row}>
                    <MaterialCommunityIcons
                        name={'information-outline'}
                        size={24}
                        onPress={emailHintPopUp}
                    />
                    <EmailPopup modalVisible={emailModalVisible} handleCloseModal={emailHintPopUp} />
                    <Text style={styles.label}>Enter Your Email:</Text>
                </View>

                {/* email address input */}
                <View style={[styles.inputView, styles.row]}>
                    <TextInput
                        style={styles.inputText}
                        value={email}
                        placeholder='Email'
                        autoCorrect={false}
                        spellCheck={false}
                        onChangeText={(text) => setEmail(text.replace(' ', '').toLowerCase())}
                    />

                    {/* no image, just to make it align with passowrd input area */}
                    <Image style={styles.showPasswordButton} /> 
                </View>

                {/* hint and label for password input */}
                <View style={styles.row}>
                    <MaterialCommunityIcons
                        name={'information-outline'}
                        size={24}
                        onPress={passwordHintPopUp}
                    />
                    <PasswordPopup modalVisible={passwordModalVisible} handleCloseModal={passwordHintPopUp} /> 
                    <Text style={styles.label}>Enter Your Password:</Text>
                </View>

                {/* passowrd input and show/hide passowrd button */}
                <View style={[styles.inputView, styles.row]}>
                    <TextInput
                        secureTextEntry={!showPassword}
                        style={styles.inputText}
                        value={password}
                        placeholder='Password'
                        autoCorrect={false}
                        spellCheck={false}
                        onChangeText={(text) => setPassword(text)}
                    />

                    <MaterialCommunityIcons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={24}
                        style={styles.showPasswordButton}
                        onPress={handleShowPassword}
                    />
                </View>

                {/* link to reset password screen */}
                <View style={styles.forgetPasswordButton}>
                    <Button
                        onPress={() => { navigation.navigate('Reset Password', { email: email, password: password }) }}
                        title='Reset Password'
                    />
                </View>
            </View>

            {/* invalid message */}
            <Text style={[styles.messageText, { opacity: invalidMessageVisible ? 1 : 0 }, { color: 'red' }]}>
                Sorry, your email address or password is in invalid format! Please click for hint.
                <MaterialCommunityIcons
                    name={'information-outline'}
                    size={24}
                    onPress={emailHintPopUp}
                />
                <EmailPopup modalVisible={emailModalVisible} handleCloseModal={emailHintPopUp} />
            </Text>

            {/* user agreement message */}
            <Text style={styles.messageText}>By clicking Sign up, you are agreeing to allowing us to store and analyze your data.</Text>

            {/* Sign in and sign up button */}
            {loading ?
                <ActivityIndicator
                    size='large'
                    color='#0000ff'
                /> :
                <View style={styles.row}>
                    <View style={styles.buttonView}>
                        <Button
                            onPress={handleSignUp}
                            title='Sign Up'
                            color='#000000'
                        />
                    </View>

                    <View style={styles.buttonView}>
                        <Button
                            onPress={handleSignIn}
                            title='Sign In'
                            color='#000000'
                        />
                    </View>
                </View>
            }
        </View>
    );
};

/**
 * Reset password screen allow enter email address to sent reset password email
 * @param {navigattion} 
 * @param route contain user's email and password
 * @returns Reset password Screen object
 */
const ResetPasswordScreen = ({ navigation, route }) => {
    //Define necessary variables
    const [sentEmailMessageVisible, setSentEmailMessageVisible] = useState(false);
    const [email, setEmail] = useState(route.params.email);
    const [loading, setLoading] = useState(false);
    const [emailModalVisible, setEmailModalVisible] = useState(false); 
    const auth = FIREBASE_AUTH;

    /**
     * Handle sent reset password request email to user's email address
     */
    const handleSentEmail = async () => {
        setLoading(true); //start loading
        setSentEmailMessageVisible(false); //hide message for finshied sending 

        //sent email and catch any error and display as alram
        try {
            await sendPasswordResetEmail(auth, email);
            setSentEmailMessageVisible(true);
        } catch (error) {
            console.log(error);
            Alert.alert('Failed', error.message);
        } finally {
            setLoading(false);
        }
    };

    /**
     * Handle show or hide email hint pop up
    */
    const emailHintPopUp = () => {
        setEmailModalVisible(!emailModalVisible);
    };

    return (
        <View style={styles.container}>
            {/* logo */}
            <Image
                source={require('./logo.png')}
                style={styles.logoImage}
            />

            {/* input section */}
            <View style={styles.col}>
                {/* hint and label for email input */}
                <View style={styles.row}>
                    <MaterialCommunityIcons
                        name={'information-outline'}
                        size={24}
                        onPress={emailHintPopUp}
                    />
                    <EmailPopup modalVisible={emailModalVisible} handleCloseModal={emailHintPopUp} />

                    <Text style={styles.label}>Enter Your Email:</Text>
                </View>

                {/* email address input */}
                <View style={[styles.inputView, styles.row]}>
                    <TextInput
                        style={styles.inputText}
                        value={email}
                        placeholder='Email'
                        autoCorrect={false}
                        spellCheck={false}
                        onChangeText={(text) => setEmail(text.replace(' ', ''))}
                    />

                    {/* no image, just to make it consistent with login screen */}
                    <Image style={styles.showPasswordButton} />
                </View>
            </View>

            {/* message for finshied sending */}
            <Text style={[styles.messageText, { opacity: sentEmailMessageVisible ? 1 : 0 }, { color: 'red' }]}>
                The password reset link was sent successfully to your email. Please check the spam folder or click reset if not found.
            </Text>

            {/* sent or resent email for reset password */}
            {loading ?
                <ActivityIndicator
                    size='large'
                    color='#0000ff'
                /> :
                <View style={styles.buttonView}>
                    <Button
                        onPress={handleSentEmail}
                        title='Sent / resent reset password email'
                        color='#000000'
                    />
                </View>
            }
        </View>
    );
};

/**
 * Setting screen allow seeing the account's email or password, log out, and naverate to reset password or analysis screen,
 * @param {navigattion} 
 * @param route contain user's email and password
 * @returns Setting Screen object
 */
const SettingScreen = ({ navigation, route}) => {
    //Define necessary variables
    const [showPassword, setShowPassword] = useState(false);
    
    /**
     * Handle show or hide passowrd
    */
    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };
    
    /**
     * Handle naverate to reset password screen
     */
    const handleChangePassword = () => {
      navigation.navigate('Reset Password', route.params);
    };
  
    /**
     * Handle naverate to reset analysis screen
     */
    const handleReviewAnalysisReport = () => {
      navigation.navigate('Analysis', route.params);
    };
  
    /**
     * Handle sign out and naverate to login screen
     */
    const handleSignOut = () => {
        navigation.navigate('Login');
      };

    return (
        <View style={styles.container}>
            {/* logo */}
            <MaterialCommunityIcons
                name={'account-circle'}
                size={100}
            />

            {/* account information section */}
            <View style={styles.col}>
                {/* email address */}
                <Text style={styles.label}>Email:</Text>
                <View style={[styles.inputView, styles.row]}>
                    <Text style={styles.inputText}>{route.params.email}</Text>
                    <Image style={styles.showPasswordButton} />
                </View>

                {/* passowrd */}
                <Text style={styles.label}>Password:</Text>
                <View style={[styles.inputView, styles.row]}>
                    <Text style={styles.inputText}>{ showPassword? route.params.password : "*****************"}</Text>

                    <MaterialCommunityIcons
                        name={showPassword ? 'eye-off' : 'eye'}
                        size={24}
                        style={styles.showPasswordButton}
                        onPress={handleShowPassword}
                    />
                </View>
            </View>

            {/* button to reset password screen */}
            <View style={[styles.buttonView, {width:280, marginTop:50}]}>
                <Button
                    onPress={handleChangePassword}
                    title='Change Password'
                    color='#000000'
                />
            </View>

            {/* button to analysis screen */}
            <View style={[styles.buttonView, {width:280, marginTop:20}]}>
                <Button
                    onPress={handleReviewAnalysisReport}
                    title='Review Analysis Report'
                    color='#000000'
                />
            </View>

            {/* button to sign out */}
            <View style={[styles.buttonView, {width:280, marginTop:50}]}>
                 <Button
                     onPress={handleSignOut}
                     title='Sign Out'
                     color='#000000'
                 />
             </View>
        </View>
    );
  };

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'white',
    },
    logoImage: {
        width: 500,
        height: 150,
        marginTop: 10,
        marginBottom: 40,
    },
    row: {
        flexDirection: 'row',
    },
    label: {
        fontSize: 22,
        marginLeft: 10,
        marginBottom: 5,
    },
    inputView: {
        backgroundColor: '#75B9EA',
        borderRadius: 15,
        justifyContent: 'center',
        padding: 20,
        paddingVertical: 10,
        borderWidth: 2,
        marginBottom: 20,
    },
    inputText: {
        fontSize: 22,
        width: 280,
    },
    showPasswordButton: {
        height: 24,
        width: 24,
        marginLeft: 5,
    },
    messageText: {
        maxWidth: '70%',
        marginBottom: 20,
        textAlign: 'center',
    },
    forgetPasswordButton: {
        marginLeft: 'auto',
        marginBottom: 20,
    },
    buttonView: {
        backgroundColor: '#75B9EA',
        borderRadius: 100,
        justifyContent: 'center',
        padding: 20,
        paddingVertical: 10,
        borderWidth: 2,
        marginBottom: 10,
        marginLeft: 10,
        marginRight: 10,
    },
});

// export login, reset password and settign screen
export { LoginScreen, ResetPasswordScreen, SettingScreen };
