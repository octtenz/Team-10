import React, { useState } from 'react';
import { StyleSheet, Text, View, Button, Image, TextInput, ActivityIndicator, Alert } from 'react-native';
import { FIREBASE_AUTH } from './firebase-config';
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, sendPasswordResetEmail, getAuth } from 'firebase/auth';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import EmailPopup from './emailPopup.js';
import PasswordPopup from './passwordPopup.js';



import { FIREBASE_DB } from './firebase-config';



const LoginScreen = ({ navigation }) => {
    
    const todoRef = FIREBASE_DB.collection('Task (a@gmail.com)');
    todoRef.get().then((querySnapshot) => {
        const tempDoc = querySnapshot.docs.map((doc) => {
            return { id: doc.id, ...doc.data() }
        })
        console.log(tempDoc)
    })

    //output:
    // [{"dueDate": null, "expectedTime": "", "id": "I6lFTd1bJJ2mJub4BYUE", "note": "", "parentTask": "", "selectedTags": [], "startDate": null, "title": "task1"}, {"dueDate": null, "expectedTime": "", "id": "TfFvBGVoWWm2N01c2T5B", "note": "", "parentTask": "", "selectedTags": [], "startDate": null, "title": "task2"}]
    



    
    
    
    
    
    
    
    const [invalidMessageVisible, setInvalidMessageVisible] = useState(false);
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [emailModalVisible, setEmailModalVisible] = useState(false); 
    const [passwordModalVisible, setPasswordModalVisible] = useState(false); 
    const auth = FIREBASE_AUTH;

    const handleSignUp = async () => {
        setLoading(true);
        setInvalidMessageVisible(false);
        
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
                setInvalidMessageVisible(true);
            } else {
                Alert.alert('Sign Up failed', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const handleSignIn = async () => {
        setLoading(true);
        setInvalidMessageVisible(false);
        
        try {
            if (isPasswordValid(password)) {
                const response = await signInWithEmailAndPassword(auth, email, password);
                navigation.navigate('Home', { email: email, password: password });
            } else {
                setInvalidMessageVisible(true);
            }
        } catch (error) {
            console.log(error);
            if (error.code === 'auth/invalid-email' || error.code === 'auth/wrong-password') {
                setInvalidMessageVisible(true);
            } else if (error.code === 'auth/invalid-credential') {
                Alert.alert('Sign In failed', 'Invalid user name or password');
            } else if (error.code === 'auth/too-many-requests') {
                Alert.alert('Sign In failed', 'Too many attempts, try again later');
            } else {
                Alert.alert('Sign In failed', error.message);
            }
        } finally {
            setLoading(false);
        }
    };

    const isPasswordValid = (password) => {
        return password.length >= 8 && /\d/.test(password) && /[A-Z]/.test(password) && /[a-z]/.test(password) && /[^A-Za-z0-9]/.test(password);
    };
    
    const handleShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const emailHintPopUp = () => {
        setEmailModalVisible(!emailModalVisible);
    };

    const passwordHintPopUp = () => {
        setPasswordModalVisible(!passwordModalVisible); 
    }

    return (
        <View style={styles.container}>
            <Image
                source={require('./logo.png')}
                style={styles.logoImage}
            />

            <View style={styles.col}>
                <View style={styles.row}>
                    <MaterialCommunityIcons
                        name={'information-outline'}
                        size={24}
                        onPress={emailHintPopUp}
                    />
                    <EmailPopup modalVisible={emailModalVisible} handleCloseModal={emailHintPopUp} />
                    <Text style={styles.label}>Enter Your Email:</Text>
                </View>

                <View style={[styles.inputView, styles.row]}>
                    <TextInput
                        style={styles.inputText}
                        value={email}
                        placeholder='Email'
                        autoCorrect={false}
                        spellCheck={false}
                        onChangeText={(text) => setEmail(text.replace(' ', ''))}
                    />

                    <Image style={styles.showPasswordButton} />
                </View>

                <View style={styles.row}>
                    <MaterialCommunityIcons
                        name={'information-outline'}
                        size={24}
                        onPress={passwordHintPopUp}
                    />
                    <PasswordPopup modalVisible={passwordModalVisible} handleCloseModal={passwordHintPopUp} /> 
                    <Text style={styles.label}>Enter Your Password:</Text>
                </View>

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

                <View style={styles.forgetPasswordButton}>
                    <Button
                        onPress={() => { navigation.navigate('Reset Password', { email: email, password: password }) }}
                        title='Reset Password'
                    />
                </View>
            </View>

            <Text style={[styles.messageText, { opacity: invalidMessageVisible ? 1 : 0 }, { color: 'red' }]}>
                Sorry, your email address or password is in invalid format! Please click for hint.
                <MaterialCommunityIcons
                    name={'information-outline'}
                    size={24}
                    onPress={emailHintPopUp}
                />
                <EmailPopup modalVisible={emailModalVisible} handleCloseModal={emailHintPopUp} />
            </Text>

            <Text style={styles.messageText}>By clicking Sign up, you are agreeing to allowing us to store and analyze your data.</Text>

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

const ResetPasswordScreen = ({ navigation, route }) => {
    const [sentEmailMessageVisible, setSentEmailMessageVisible] = useState(false);
    const [email, setEmail] = useState(route.params.email);
    const [loading, setLoading] = useState(false);
    const [emailModalVisible, setEmailModalVisible] = useState(false); 
    const auth = FIREBASE_AUTH;

    const handleSentEmail = async () => {
        setLoading(true);
        setSentEmailMessageVisible(false);

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

    const emailHintPopUp = () => {
        setEmailModalVisible(!emailModalVisible);
    };

    return (
        <View style={styles.container}>
            <Image
                source={require('./logo.png')}
                style={styles.logoImage}
            />

            <View style={styles.col}>
                <View style={styles.row}>
                    <MaterialCommunityIcons
                        name={'information-outline'}
                        size={24}
                        onPress={emailHintPopUp}
                    />
                    <EmailPopup modalVisible={emailModalVisible} handleCloseModal={emailHintPopUp} />

                    <Text style={styles.label}>Enter Your Email:</Text>
                </View>

                <View style={[styles.inputView, styles.row]}>
                    <TextInput
                        style={styles.inputText}
                        value={email}
                        placeholder='Email'
                        autoCorrect={false}
                        spellCheck={false}
                        onChangeText={(text) => setEmail(text.replace(' ', ''))}
                    />

                    <Image style={styles.showPasswordButton} />
                </View>
            </View>

            <Text style={[styles.messageText, { opacity: sentEmailMessageVisible ? 1 : 0 }, { color: 'red' }]}>
                The password reset link was sent successfully to your email. Please check the spam folder or click reset if not found.
            </Text>

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

const styles = StyleSheet.create({
    container: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    logoImage: {
        height: 180,
        resizeMode: 'contain',
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

export { LoginScreen, ResetPasswordScreen };
