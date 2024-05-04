import React, { useState } from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet, Modal } from 'react-native';

/**
 * Password Popup displays the instructions related to password
 * @param {*} param0 Object containing modal visibility and close modal function
 * @returns React element representing the modal window for password instructions
 */
const PasswordPopup = ({ modalVisible, handleCloseModal }) => {
  return (
    // Modal for displaying password instructions
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleCloseModal}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Instructions for password format */}
          <Text style={styles.modalText}>
            Password must:
            {'\n'}{'\u2022'} be at least 8 characters long
            {'\n'}{'\u2022'} contain at least 1 upper case letter
            {'\n'}{'\u2022'} contain at least 1 lower case letter
            {'\n'}{'\u2022'} contain at least 1 number
            {'\n'}{'\u2022'} contain at least 1 special character
          </Text>
          {/* Button to close the modal */}
          <TouchableWithoutFeedback onPress={handleCloseModal}>
            <Text style={styles.closeButton}>Close</Text>
          </TouchableWithoutFeedback>
        </View>
      </View>
    </Modal>
  );
};

// Styles for the password popup modal
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  centeredView: {
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    flex: 1,
    justifyContent: 'center',
  },
  modalView: {
    alignItems: 'center',
    backgroundColor: 'white',
    borderRadius: 20,
    padding: 35,
    width: '80%',
  },
  modalText: {
    marginBottom: 15,
    textAlign: 'center',
  },
  closeButton: {
    color: 'blue',
    marginTop: 10,
  },
});

export default PasswordPopup;
