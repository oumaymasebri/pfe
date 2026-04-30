export default function NativeMap({ stations, showMarkers }: any) {
  const src = `https://www.openstreetmap.org/export/embed.html?bbox=10.0815%2C36.7065%2C10.2815%2C36.9065&layer=mapnik`;

  return (
    <iframe
      src={src}
      style={{
        width: "100%",
        height: 200,
        borderRadius: 15,
        marginTop: 10,
        border: "none",
      }}
      loading="lazy"
    />
  );
}