import React from "react";
import { useState } from "react";
import { useSignIn } from "@clerk/clerk-expo";
import { Link, useRouter } from "expo-router";
import {
  ActivityIndicator,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { KeyboardAwareScrollView } from "react-native-keyboard-aware-scroll-view";
import { Image } from "expo-image";
import { styles } from "../../assets/styles/auth.styles";
import { Ionicons } from "@expo/vector-icons";
import { COLORS } from "../../constants/colors";
import AuthButton from "../../components/AuthButton";

export default function Page() {
  const { signIn, setActive, isLoaded } = useSignIn();
  const router = useRouter();

  const [emailAddress, setEmailAddress] = useState("");
  const [password, setPassword] = useState("");
  const [hidePassword, setHidePassword] = useState(true);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Handle the submission of the sign-in form
  const onSignInPress = async () => {
    if (!isLoaded) return;

    // Start the sign-in process using the email and password provided
    try {
      setLoading(true);
      const signInAttempt = await signIn.create({
        identifier: emailAddress,
        password,
      }); // 1. Send credential to endpoint

      // If sign-in process is complete, set the created session as active
      // and redirect the user
      if (signInAttempt.status === "complete") {
        await setActive({ session: signInAttempt.createdSessionId });
        router.replace("/");
      } else {
        // If the status isn't complete, check why. User might need to
        // complete further steps.
        console.error(JSON.stringify(signInAttempt, null, 2));
      }
    } catch (err) {
      if (err.errors?.[0]?.code === "form_password_incorrect") {
        setError("Password is incorrect. Please try again");
      } else {
        setError("An error occured, Please try again.");
      }
      console.log(JSON.stringify(err, null, 2));
    } finally {
      setLoading(false);
    } // 2. route to home
  };

  return (
    <KeyboardAwareScrollView
      style={{ flex: 1 }}
      contentContainerStyle={{ flexGrow: 1 }}
      enableOnAndroid={true}
      enableAutomaticScroll={true}
      extraScrollHeight={30}
    >
      <View style={styles.container}>
        <Image
          source={require("../../assets/images/revenue-i4.png")}
          style={styles.illustration}
        />
        <Text style={styles.title}>Welcome Back</Text>

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
          style={styles.input}
          autoCapitalize="none"
          value={emailAddress}
          placeholder="Enter email"
          placeholderTextColor="#9A8478"
          onChangeText={(emailAddress) => setEmailAddress(emailAddress)}
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
          btnAction={onSignInPress}
          title="Sign In"
          loadingStatus={loading}
        />
        {/* <TouchableOpacity onPress={onSignInPress} style={styles.button}>
          {loading ? (
            <ActivityIndicator size="small" color={COLORS.textLight} />
          ) : (
            <Text style={styles.buttonText}>Sign in</Text>
          )}
        </TouchableOpacity> */}
        <View style={styles.footerContainer}>
          <Text style={styles.footerText}>Don&apos;t have an account?</Text>

          <Link href="/sign-up" asChild>
            <TouchableOpacity>
              <Text style={styles.linkText}>Sign up</Text>
            </TouchableOpacity>
          </Link>
        </View>
      </View>
    </KeyboardAwareScrollView>
  );
}
