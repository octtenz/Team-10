import React, { useState } from 'react';
import { View, Text, Modal, StyleSheet, TextInput, TouchableOpacity } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';

const AddTagsModal = () => {
  const [modalVisible, setModalVisible] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tagOptions, setTagOptions] = useState(['Work', 'School', 'High Priority', 'Low Priority ', 'Personal']);

  const saveTag = () => {
    if (newTag.trim() !== '') {
      console.log('Tag saved:', newTag);
      setTagOptions([...tagOptions, newTag]); // Add new tag to tagOptions
      setNewTag('');
    }
    setModalVisible(false);
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <View style={styles.addButtonContainer}>
          <Text style={styles.addButtonText}>Add Tag</Text>
        </View>
      </TouchableOpacity>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add Tag</Text>
            <View style={styles.tagInputContainer}>
              <TextInput
                style={styles.tagInput}
                placeholder="Enter tag name"
                value={newTag}
                onChangeText={(text) => setNewTag(text)}
              />
              <ModalDropdown
                style={styles.dropdown}
                options={tagOptions}
                onSelect={(index, value) => setNewTag(value)}
              />
            </View>
            <Text style={styles.tipText}>Tip: Enter a new tag name or select one from the drop-down list.</Text>
            <View style={styles.buttonContainer}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <View style={styles.cancelButton}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </View>
              </TouchableOpacity>
              <TouchableOpacity onPress={saveTag}>
                <View style={styles.saveButton}>
                  <Text style={styles.buttonText}>Save</Text>
                </View>
              </TouchableOpacity>
            </View>
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
  addButtonContainer: {
    padding: 10,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: 'black',
    backgroundColor: 'white',
  },
  addButtonText: {
    color: 'black',
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
  modalTitle: {
    fontSize: 20,
    marginBottom: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  tagInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 5,
    marginBottom: 20,
  },
  tagInput: {
    flex: 1,
    padding: 10,
  },
  dropdown: {
    paddingHorizontal: 10,
  },
  tipText: {
    color: 'gray',
    fontStyle: 'italic',
    marginBottom: 20,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
  },
  cancelButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 10,
  },
  saveButton: {
    backgroundColor: 'white',
    borderWidth: 1,
    borderColor: 'black',
    borderRadius: 5,
    padding: 10,
  },
  buttonText: {
    fontWeight: 'bold',
  },
});

export default AddTagsModal;
