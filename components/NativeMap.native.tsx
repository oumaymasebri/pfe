import MapView, { Marker } from "react-native-maps";
import { StyleSheet } from "react-native";

export default function NativeMap({ stations, showMarkers }: any) {
  return (
    <MapView
      style={styles.map}
      initialRegion={{
        latitude: 36.8065,
        longitude: 10.1815,
        latitudeDelta: 0.0922,
        longitudeDelta: 0.0421,
      }}
    >
      {showMarkers && stations.map((s: any) => (
        <Marker
          key={s.id}
          coordinate={{ latitude: s.lat || 36.8065, longitude: s.lng || 10.1815 }}
          title={s.nom}
        />
      ))}
    </MapView>
  );
}

const styles = StyleSheet.create({
  map: { width: "100%", height: 200, borderRadius: 15, marginTop: 10 },
});