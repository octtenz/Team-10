import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, Modal, StyleSheet } from 'react-native';

const ResetPasswordScreen = () => {
  const [modalVisible, setModalVisible] = useState(false);

  return (
    <View style={styles.container}>
      <TouchableWithoutFeedback onPress={() => setModalVisible(true)}>
        <View style={styles.infoIcon}>
          <Text style={styles.infoIconText}>i</Text>
        </View>
      </TouchableWithoutFeedback>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => {
          setModalVisible(false);
        }}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalText}>
              Password must:
              {'\n'}{'\u2022'} be at least 8 characters long
              {'\n'}{'\u2022'} contain at least 1 upper case letter
              {'\n'}{'\u2022'} contain at least 1 lower case letter
              {'\n'}{'\u2022'} contain at least 1 number
              {'\n'}{'\u2022'} contain at least 1 special character
            </Text>
            <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </TouchableWithoutFeedback>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  infoIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'white', // Change the color to white
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'black',
  },
  infoIconText: {
    fontSize: 20,
    color: 'black', // Change the color to black
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)', // light beige box
  },
  modalView: {
    backgroundColor: 'beige', // light beige box
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'left',
  },
  closeButton: {
    marginTop: 10,
    color: 'blue',
  },
});

export default ResetPasswordScreen;
