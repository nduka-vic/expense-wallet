import React from "react";
import { useState } from "react";
import { Text, TextInput, TouchableOpacity, View } from "react-native";
import { useSignUp } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import { styles } from "../../assets/styles/auth.styles";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import { Image } from "expo-image";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import AuthButton from "../../components/AuthButton";

export default function SignUpScreen() {
  const { isLoaded, signUp, setActive } = useSignUp();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [pendingVerification, setPendingVerification] = useState(false);
  const [code, setCode] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle submission of sign-up form
  const onSignUpPress = async () => {
    if (!isLoaded) return;

    // Start sign-up process using email and password provided
    try {
      setLoading(true);
      await signUp.create({
        emailAddress,
        password,
      }); // 1. send credential to endpoint

      // Send user an email with verification code
      await signUp.prepareEmailAddressVerification({ strategy: "email_code" }); // 2. send email verification to user

      // Set 'pendingVerification' to true to display second form
      // and capture OTP code
      setPendingVerification(true); // 3. show verification form
    } catch (err) {
      switch (err.errors?.[0]?.code) {
        case "form_identifier_exists":
          setError("That email address is already in use. Please try another.");
          break;
        case "form_password_length_too_short":
          setError("Passwords must be 8 characters or more.");
          break;
        case "form_param_format_invalid":
          setError("Email address must be a valid email address.");
          break;
        case "form_password_pwned":
          setError("Please use a different password");
          break;
        default:
          setError("An error occurred. Please try again");
      }
      console.log(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  // Handle submission of verification form
  const onVerifyPress = async () => {
    if (!isLoaded) return;

    try {
      setLoading(true);
      // Use the code the user provided to attempt verification
      const signUpAttempt = await signUp.attemptEmailAddressVerification({
        code,
      }); // 1. send otp to endpoint

      // If verification was completed, set the session to active
      // and redirect the user
      if (signUpAttempt.status === "complete") {
        await setActive({ session: signUpAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status is not complete, check why. User may need to
        // complete further steps.
        console.error(JSON.stringify(signUpAttempt, null, 2));
      } // 2. set user session
    } catch (err) {
      // See https://clerk.com/docs/custom-flows/error-handling
      // for more info on error handling
      console.error(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    }
  };

  if (pendingVerification) {
    return (
      <View style={styles.verificationContainer}>
        <Text style={styles.verificationTitle}>Verify your email</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.verificationInput, error && styles.errorInput]}
          value={code}
          placeholder="Enter your verification code"
          placeholderTextColor="#9A8478"
          onChangeText={(code) => setCode(code)}
        />
        <AuthButton
          btnAction={onVerifyPress}
          title="Verify"
          loadingStatus={loading}
        />
      </View>
    );
  }

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={100}
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/revenue-i2.png")}
          style={styles.illustration}
        />
        <Text style={styles.title}>Create Account</Text>

        {error ? (
          <View style={styles.errorBox}>
            <Ionicons name="alert-circle" size={20} color={COLORS.expense} />
            <Text style={styles.errorText}>{error}</Text>
            <TouchableOpacity onPress={() => setError("")}>
              <Ionicons name="close" size={20} color={COLORS.textLight} />
            </TouchableOpacity>
          </View>
        ) : null}

        <TextInput
          style={[styles.input, error && styles.errorText]}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#9A8478"
          onChangeText={(email) => setEmailAddress(email)}
        />
        <View
          style={[
            styles.customInput,
            { flexDirection: "row", alignItems: "center" },
          ]}
        >
          <TextInput
            style={[{ width: "90%" }, error && styles.errorText]}
            value={password}
            placeholder="Enter password"
            placeholderTextColor="#9A8478"
            secureTextEntry={hidePassword}
            onChangeText={(password) => setPassword(password)}
          />
          <TouchableOpacity
            onPress={() => {
              setHidePassword(!hidePassword);
            }}
          >
            <Ionicons
              name={hidePassword ? "eye" : "eye-off"}
              size={24}
              color={COLORS.textLight}
            />
          </TouchableOpacity>
        </View>
        <AuthButton
          btnAction={onSignUpPress}
          title="Sign Up"
          loadingStatus={loading}
        />

        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Already have an account?</Text>
          <TouchableOpacity onPress={() => router.back()}>
            <Text style={styles.linkText}>Sign in</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
