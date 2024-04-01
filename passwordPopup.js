import React, { useState } from 'react';
import { View, Text, Modal, TouchableWithoutFeedback, StyleSheet } from 'react-native';

const PasswordPopup = ({ modalVisible, handleCloseModal }) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleCloseModal}
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
            <TouchableWithoutFeedback onPress={handleCloseModal}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableWithoutFeedback>
          </View>
        </View>
      </Modal>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalView: {
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    alignItems: 'center',
    width: '80%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    marginTop: 10,
    color: 'blue',
  },
});

export default PasswordPopup;
