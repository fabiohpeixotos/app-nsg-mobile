import React from 'react';
import { Text, TextInput, View } from 'react-native';
import styles from '../../Style';

export const TextField = ({ label, ...inputProps }) => {
  return (
    <View style={styles.container}>
      <Text style={styles.label}>{label}</Text>
      <TextInput
        style={styles.input}
        {...inputProps}
      />
    </View>
  )
}

export default TextField;