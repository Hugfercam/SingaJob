import {
  Document,
  Image,
  Page,
  StyleSheet,
  Text,
  View,
} from "@react-pdf/renderer";

/**
 * Albarán en PDF.
 *
 * Se compone con React PDF (sin navegador ni Chrome): así funciona igual en
 * local que en un despliegue serverless pequeño.
 */
const styles = StyleSheet.create({
  page: {
    paddingTop: 36,
    // Deja sitio al pie fijo: sin esto, el texto podía quedar debajo.
    paddingBottom: 52,
    paddingHorizontal: 32,
    fontSize: 9,
    fontFamily: "Helvetica",
    color: "#1a1a1a",
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    borderBottomWidth: 2,
    borderBottomColor: "#14532d",
    paddingBottom: 10,
    marginBottom: 14,
  },
  company: { fontSize: 14, fontFamily: "Helvetica-Bold", color: "#14532d" },
  companySmall: { fontSize: 8, color: "#555555", marginTop: 2 },
  docTitle: { fontSize: 12, fontFamily: "Helvetica-Bold", textAlign: "right" },
  docMeta: { fontSize: 8, color: "#555555", textAlign: "right", marginTop: 2 },
  section: { marginBottom: 12 },
  sectionTitle: {
    fontSize: 8,
    letterSpacing: 1,
    color: "#666666",
    marginBottom: 4,
    textTransform: "uppercase",
  },
  row: { flexDirection: "row", marginBottom: 2 },
  label: { width: 90, color: "#666666" },
  value: { flex: 1 },
  fieldRow: {
    flexDirection: "row",
    borderBottomWidth: 0.5,
    borderBottomColor: "#dddddd",
    paddingVertical: 3,
  },
  fieldLabel: { width: 150, fontFamily: "Helvetica-Bold" },
  fieldValue: { flex: 1 },
  photos: { flexDirection: "row", flexWrap: "wrap", gap: 6 },
  photo: {
    width: 165,
    height: 124,
    objectFit: "cover",
    borderWidth: 0.5,
    borderColor: "#cccccc",
  },
  signatures: { flexDirection: "row", gap: 16, marginTop: 4 },
  signatureBox: { flex: 1 },
  signatureImage: {
    width: 200,
    height: 70,
    objectFit: "contain",
    borderBottomWidth: 0.5,
    borderBottomColor: "#999999",
  },
  signatureName: { fontSize: 8, fontFamily: "Helvetica-Bold", marginTop: 3 },
  signatureLabel: { fontSize: 7, color: "#666666", marginTop: 1 },
  footer: {
    position: "absolute",
    bottom: 20,
    left: 32,
    right: 32,
    fontSize: 7,
    color: "#888888",
    textAlign: "center",
  },
});

export type AlbaranData = {
  companyName: string;
  companyCif: string | null;
  companyAddress: string | null;
  companyPhone: string | null;
  title: string;
  documentDate: Date;
  clientName: string;
  clientAddress: string | null;
  clientPhone: string | null;
  projectName: string | null;
  technicianName: string | null;
  createdAt: Date;
  completedAt: Date | null;
  startedAt: Date | null;
  coordinates: { label: string; value: string }[];
  fields: { label: string; value: string }[];
  photos: { id: string; bytes: Buffer }[];
  signatures: {
    id: string;
    label: string;
    name: string;
    date: string;
    bytes: Buffer;
  }[];
  generatedAt: Date;
};

const DATE_TIME = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  hour: "2-digit",
  minute: "2-digit",
});

const DATE = new Intl.DateTimeFormat("es-ES", {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
});

function dateTime(value: Date | null): string {
  return value ? DATE_TIME.format(value) : "—";
}

export function AlbaranDocument({ data }: { data: AlbaranData }) {
  return (
    <Document
      title={`Albarán ${data.title}`}
      author={data.companyName}
      subject="Albarán de trabajo"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <View>
            <Text style={styles.company}>{data.companyName}</Text>
            {data.companyCif ? (
              <Text style={styles.companySmall}>CIF {data.companyCif}</Text>
            ) : null}
            {data.companyAddress ? (
              <Text style={styles.companySmall}>{data.companyAddress}</Text>
            ) : null}
            {data.companyPhone ? (
              <Text style={styles.companySmall}>Tel. {data.companyPhone}</Text>
            ) : null}
          </View>
          <View>
            <Text style={styles.docTitle}>ALBARÁN DE TRABAJO</Text>
            <Text style={styles.docMeta}>{data.title}</Text>
            <Text style={styles.docMeta}>
              Fecha: {DATE.format(data.documentDate)}
            </Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Cliente</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Nombre</Text>
            <Text style={styles.value}>{data.clientName}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Dirección</Text>
            <Text style={styles.value}>{data.clientAddress ?? "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Teléfono</Text>
            <Text style={styles.value}>{data.clientPhone ?? "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Obra</Text>
            <Text style={styles.value}>{data.projectName ?? "—"}</Text>
          </View>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Trabajo</Text>
          <View style={styles.row}>
            <Text style={styles.label}>Técnico</Text>
            <Text style={styles.value}>{data.technicianName ?? "—"}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Inicio</Text>
            <Text style={styles.value}>{dateTime(data.startedAt)}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Fin</Text>
            <Text style={styles.value}>{dateTime(data.completedAt)}</Text>
          </View>
          {data.coordinates.map((coordinate) => (
            <View key={coordinate.label} style={styles.row}>
              <Text style={styles.label}>{coordinate.label}</Text>
              <Text style={styles.value}>{coordinate.value}</Text>
            </View>
          ))}
        </View>

        {data.fields.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Parte de trabajo</Text>
            {data.fields.map((field) => (
              <View key={field.label} style={styles.fieldRow}>
                <Text style={styles.fieldLabel}>{field.label}</Text>
                <Text style={styles.fieldValue}>{field.value || "—"}</Text>
              </View>
            ))}
          </View>
        ) : null}

        {data.photos.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Fotos ({data.photos.length})
            </Text>
            <View style={styles.photos}>
              {data.photos.map((photo) => (
                // eslint-disable-next-line jsx-a11y/alt-text
                <Image key={photo.id} style={styles.photo} src={photo.bytes} />
              ))}
            </View>
          </View>
        ) : null}

        {data.signatures.length > 0 ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Conformidad</Text>
            <View style={styles.signatures}>
              {data.signatures.map((signature) => (
                <View key={signature.id} style={styles.signatureBox}>
                  {/* eslint-disable-next-line jsx-a11y/alt-text */}
                  <Image style={styles.signatureImage} src={signature.bytes} />
                  <Text style={styles.signatureName}>{signature.name}</Text>
                  <Text style={styles.signatureLabel}>
                    {signature.label} · {signature.date}
                  </Text>
                </View>
              ))}
            </View>
          </View>
        ) : null}

        <Text style={styles.footer} fixed>
          Documento generado por SignaJob el {dateTime(data.generatedAt)}. La
          firma acredita la conformidad con el trabajo realizado.
        </Text>
      </Page>
    </Document>
  );
}
