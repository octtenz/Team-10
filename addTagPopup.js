import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, Modal } from 'react-native';
import ModalDropdown from 'react-native-modal-dropdown';
import { MaterialCommunityIcons } from '@expo/vector-icons';

/**
 * Add Tags Modal handles the selection of tags for the task
 * @param {*} param0 Object containing parameters
 * @returns React element representing the modal window for adding tags to the task
 */
const AddTagsModal = ({ onTagSelect, tags }) => {
  // State variables
  const [modalVisible, setModalVisible] = useState(false);
  const [newTag, setNewTag] = useState('');
  const [tagOptions, setTagOptions] = useState(['Work', 'School', 'High Priority', 'Low Priority ', 'Personal', ...tags]);

  /**
   * Handles the selection of a tag
   * @param {*} tag The tag to be selected
   */
  const handleTagSelect = (tag) => {
    onTagSelect(tag); 
    setModalVisible(false); 
  };

  // Save the newly created tag
  const saveTag = () => {
    if (newTag.trim() !== '') {
      console.log('Tag saved:', newTag);
      setTagOptions([...tagOptions, newTag]); 
      handleTagSelect(newTag);
      setNewTag('');
    }
    setModalVisible(false);
  };

  return (
    // Container for the button to add tags
    <View style={styles.container}>
      {/* Button to add tags */}
      <TouchableOpacity onPress={() => setModalVisible(true)}>
        <View style={styles.addButtonContainer}>
          <MaterialCommunityIcons
              name={'tag-plus'}
              color={"white"}
              size={20}
          />
        </View>
      </TouchableOpacity>

      {/* Modal for adding tags */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.centeredView}>
          <View style={styles.modalView}>
            <Text style={styles.modalTitle}>Add Tag</Text>
            {/* Container for the tags */}
            <View style={styles.tagInputContainer}>
              {/* Input field for adding a new tag */}
              <TextInput
                style={styles.tagInput}
                placeholder="Enter tag name"
                value={newTag}
                onChangeText={(text) => setNewTag(text)}
              />
              {/* Dropdown menu for selecting tags */}
              <ModalDropdown
                style={styles.dropdown}
                options={tagOptions}
                onSelect={(index, value) => handleTagSelect(value)}
              />
            </View>
            {/* Tip for selecting tags */}
            <Text style={styles.tipText}>Tip: Enter a new tag name or select one from the existing tags.</Text>
            {/* Container for buttons */}
            <View style={styles.buttonContainer}>
              {/* Button to cancel selecting tags */}
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <View style={styles.cancelButton}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </View>
              </TouchableOpacity>
              {/* Button to save selected tags */}
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

// Styles for the add tags modal
const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center', 
  },
  addButtonContainer: {
    backgroundColor: '#007BFF',
    borderRadius: 5,
    padding: 10,
  },
  addButtonText: {
    color: '#FFF',
    fontWeight: 'bold',
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
  modalTitle: {
    color: 'black',
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  tagInputContainer: {
    alignItems: 'center',
    borderColor: '#ccc',
    borderRadius: 5,
    borderWidth: 1,
    flexDirection: 'row',
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
    borderColor: 'black',
    borderRadius: 5,
    borderWidth: 1,
    padding: 10,
  },
  saveButton: {
    backgroundColor: 'white',
    borderColor: 'black',
    borderRadius: 5,
    borderWidth: 1,
    padding: 10,
  },
  buttonText: {
    fontWeight: 'bold',
  },
});

export default AddTagsModal;