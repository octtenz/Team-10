import React from 'react';
import { View, Text, TouchableWithoutFeedback, StyleSheet, Modal } from 'react-native';

/**
 * Email Popup displays the instructions related to email
 * @param {*} param0 Object containing modal visibility and close modal function
 * @returns React element representing the modal window for email instructions
 */
const EmailPopup = ({ modalVisible, handleCloseModal }) => {
  return (
    // Modal for displaying email instructions
    <Modal
      animationType="slide"
      transparent={true}
      visible={modalVisible}
      onRequestClose={handleCloseModal}
    >
      <View style={styles.centeredView}>
        <View style={styles.modalView}>
          {/* Instructions for email address format */}
          <Text style={styles.modalText}>
            Address to be in ___@___.com format.
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

// Styles for the email popup modal
const styles = StyleSheet.create({
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

export default EmailPopup;
