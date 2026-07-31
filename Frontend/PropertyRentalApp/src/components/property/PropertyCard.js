
// import React from "react";
// import {
//   View,
//   Text,
//   StyleSheet,
//   Image,
//   TouchableOpacity,
// } from "react-native";

// import Ionicons from "react-native-vector-icons/Ionicons";
// import COLORS from "../../theme/colors";

// export default function PropertyCard({
//   title,
//   location,
//   price,
//   image,
//   onPress,
// }) {

//   console.log("Final Image URL:", image);


//   return (
//     <TouchableOpacity
//       style={styles.card}
//       activeOpacity={0.8}
//       onPress={onPress}
//     >
//       {/* <Image
//         source={
//           image
//             ? { uri: image }
//             : {
//               uri: "https://via.placeholder.com/600x400?text=No+Image",
//             }
//         }
//         style={styles.image}
//         resizeMode="cover"
//       /> */}

//       {/* <Image
//         source={image ? { uri: image } : null}
//         style={styles.image}
//         resizeMode="cover"
//         onLoad={() => console.log("Image Loaded")}
//         onError={(e) => console.log("Image Error:", e.nativeEvent)}
//       /> */}

//       {/* <Image
//         source={{ uri: image }}
//         style={styles.image}
//         resizeMode="cover"
//         fadeDuration={0}
//         onLoad={() => console.log("Loaded:", image)}
//         onError={(e) => console.log("Error:", e.nativeEvent)}
//       /> */}

//       <Image
//         source={{
//           uri: "http://172.18.4.72:8080/uploads/35280fb5-d962-4875-bd9e-8cd842133286_property.jpg",
//         }}
//         style={styles.image}
//       />

//       <View style={styles.content}>
//         <Text style={styles.title}>
//           {title}
//         </Text>

//         <View style={styles.locationRow}>
//           <Ionicons
//             name="location-outline"
//             size={16}
//             color={COLORS.gray}
//           />

//           <Text style={styles.location}>
//             {location}
//           </Text>
//         </View>

//         <Text style={styles.price}>
//           ₹ {price} / month
//         </Text>
//       </View>
//     </TouchableOpacity>
//   );
// }

// const styles = StyleSheet.create({
//   card: {
//     backgroundColor: COLORS.white,
//     marginHorizontal: 18,
//     marginBottom: 16,
//     borderRadius: 16,
//     overflow: "hidden",

//     elevation: 3,

//     shadowColor: "#000",
//     shadowOpacity: 0.08,
//     shadowRadius: 4,
//     shadowOffset: {
//       width: 0,
//       height: 2,
//     },
//   },

//   // image: {
//   //   width: "100%",
//   //   height: 180,
//   //   backgroundColor: "#E5E7EB",
//   // },

//   image: {
//     width: "100%",
//     height: 180,
//   },

//   content: {
//     padding: 14,
//   },

//   title: {
//     fontSize: 18,
//     fontWeight: "700",
//     color: COLORS.text,
//   },

//   locationRow: {
//     flexDirection: "row",
//     alignItems: "center",
//     marginTop: 8,
//   },

//   location: {
//     marginLeft: 5,
//     fontSize: 14,
//     color: COLORS.gray,
//   },

//   price: {
//     marginTop: 12,
//     fontSize: 18,
//     fontWeight: "700",
//     color: COLORS.primary,
//   },
// });



import React from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
} from "react-native";

import Ionicons from "react-native-vector-icons/Ionicons";
import COLORS from "../../theme/colors";

export default function PropertyCard({
  title,
  location,
  price,
  image,
  onPress,
}) {
  console.log("Image =", JSON.stringify(image));

  return (
    <TouchableOpacity
      style={styles.card}
      activeOpacity={0.8}
      onPress={onPress}
    >
      <Image
        source={
          image
            ? { uri: image }
            : require("../../../assets/images/no-image.png")
        }
        style={styles.image}
        resizeMode="cover"
        onLoad={() => console.log("Loaded:", image)}
        onError={(e) => console.log("Image Error:", e.nativeEvent)}
      />

      <View style={styles.content}>
        <Text style={styles.title}>{title}</Text>

        <View style={styles.locationRow}>
          <Ionicons
            name="location-outline"
            size={16}
            color={COLORS.gray}
          />
          <Text style={styles.location}>{location}</Text>
        </View>

        <Text style={styles.price}>
          ₹ {price} / month
        </Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: COLORS.white,
    marginHorizontal: 18,
    marginBottom: 16,
    borderRadius: 16,
    overflow: "hidden",

    elevation: 3,

    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: {
      width: 0,
      height: 2,
    },
  },

  image: {
    width: "100%",
    height: 180,
    backgroundColor: "#E5E7EB",
  },

  content: {
    padding: 14,
  },

  title: {
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.text,
  },

  locationRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
  },

  location: {
    marginLeft: 5,
    fontSize: 14,
    color: COLORS.gray,
  },

  price: {
    marginTop: 12,
    fontSize: 18,
    fontWeight: "700",
    color: COLORS.primary,
  },
});