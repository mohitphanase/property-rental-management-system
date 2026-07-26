import React, { useContext } from "react"
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Alert,
} from "react-native"
import Icon from "react-native-vector-icons/MaterialIcons"
import COLORS from "../../theme/colors"
import { AuthContext } from "../../provider/AuthProvider"
import LinearGradient from "react-native-linear-gradient"

export default function ProfileScreen({ navigation }) {
  const { user, logout } = useContext(AuthContext)

  return (
    <View style={styles.container}>
      <Image
        source={require("../../../assets/profile.png")}
        style={styles.profileImage}
      />

      <Text style={styles.name}>
        {user?.fullName || user?.name || "Tenant"}
      </Text>

      <Text style={styles.role}>{user?.role || "TENANT"}</Text>

      <View style={styles.card}>
        <View style={styles.row}>
          <Icon name="email" size={22} color={COLORS.primary} />
          <View>
            <Text style={styles.label}>Email</Text>
            <Text style={styles.value}>{user?.email}</Text>
          </View>
        </View>

        <View style={styles.row}>
          <Icon name="badge" size={22} color={COLORS.primary} />
          <View>
            <Text style={styles.label}>Role</Text>
            <Text style={styles.value}>{user?.role}</Text>
          </View>
        </View>
      </View>

      <TouchableOpacity
        style={styles.changePasswordButton}
        onPress={() => navigation.navigate("ChangePassword")}
      >
        <Text style={styles.changePasswordText}>🔒 Change Password</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
    alignItems: "center",
    padding: 20,
  },

  profileImage: {
    width: 120,
    height: 120,
    borderRadius: 60,
    marginTop: 25,
    marginBottom: 15,
  },

  name: {
    fontSize: 24,
    fontWeight: "bold",
    color: COLORS.text,
  },

  role: {
    fontSize: 16,
    color: COLORS.primary,
    marginBottom: 25,
  },

  card: {
    width: "100%",
    backgroundColor: COLORS.card,
    borderRadius: 15,
    padding: 20,
    marginBottom: 25,

    elevation: 4,

    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },

  row: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 18,
  },

  label: {
    fontSize: 13,
    color: COLORS.subText,
    marginLeft: 15,
  },

  value: {
    fontSize: 16,
    color: COLORS.text,
    fontWeight: "600",
    marginLeft: 15,
  },

  button: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    width: "100%",
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: 12,
    marginBottom: 15,
  },

  logoutButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",

    width: "100%",
    backgroundColor: COLORS.error,
    paddingVertical: 14,
    borderRadius: 12,
  },

  buttonText: {
    color: COLORS.white,
    fontSize: 16,
    fontWeight: "bold",
  },

  changePasswordButton: {
    marginTop: 25,
    backgroundColor: COLORS.buttonPrimary,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: "center",
    justifyContent: "center",

    elevation: 5,
    shadowColor: COLORS.shadow,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.25,
    shadowRadius: 6,
  },

  changePasswordText: {
    color: COLORS.white,
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.5,
  },
})
