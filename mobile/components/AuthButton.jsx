import { Text, TouchableOpacity, ActivityIndicator } from "react-native";
import React from "react";
import { COLORS } from "../constants/colors";
import { styles } from "../assets/styles/auth.styles";

const AuthButton = ({ btnAction, title, loadingStatus }) => {
  return (
    <TouchableOpacity onPress={btnAction} style={styles.button}>
      {loadingStatus ? (
        <ActivityIndicator size="small" color={COLORS.white} />
      ) : (
        <Text style={styles.buttonText}>{title}</Text>
      )}
    </TouchableOpacity>
  );
};

export default AuthButton;
