// @react-pdf/renderer document for ATS-clean PDF export. Single column,
// selectable text, no image-text (plan.md §4.4). Server only.
import "server-only";
import React from "react";
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
} from "@react-pdf/renderer";
import type { Resume } from "@/types";

const styles = StyleSheet.create({
  page: { padding: 36, fontSize: 10, fontFamily: "Helvetica", color: "#18181b" },
  name: { fontSize: 20, fontWeight: "bold" },
  contact: { fontSize: 9, color: "#52525b", marginTop: 2 },
  section: { marginTop: 12 },
  heading: {
    fontSize: 11,
    fontWeight: "bold",
    textTransform: "uppercase",
    borderBottom: "1 solid #d4d4d8",
    paddingBottom: 2,
    marginBottom: 4,
  },
  row: { flexDirection: "row", justifyContent: "space-between" },
  bold: { fontWeight: "bold" },
  date: { fontSize: 9, color: "#71717a" },
  bullet: { marginLeft: 10, marginTop: 1 },
  watermark: {
    position: "absolute",
    bottom: 16,
    right: 16,
    fontSize: 8,
    color: "#d4d4d8",
  },
});

export function ResumePdf({
  resume,
  watermark,
}: {
  resume: Resume;
  watermark: boolean;
}) {
  const { contact, summary, experience, education, skills, projects, certifications } =
    resume.sections;

  return (
    <Document title={resume.title} author={contact.fullName}>
      <Page size="A4" style={styles.page}>
        <Text style={styles.name}>{contact.fullName || "Nama"}</Text>
        <Text style={styles.contact}>
          {[contact.email, contact.phone, contact.location].filter(Boolean).join("  |  ")}
        </Text>
        {(contact.website || contact.linkedin) && (
          <Text style={styles.contact}>
            {[contact.website, contact.linkedin].filter(Boolean).join("  |  ")}
          </Text>
        )}

        {summary ? (
          <View style={styles.section}>
            <Text style={styles.heading}>Ringkasan</Text>
            <Text>{summary}</Text>
          </View>
        ) : null}

        {experience.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Pengalaman</Text>
            {experience.map((e) => (
              <View key={e.id} style={{ marginBottom: 6 }}>
                <View style={styles.row}>
                  <Text style={styles.bold}>
                    {e.role}
                    {e.company ? ` - ${e.company}` : ""}
                  </Text>
                  <Text style={styles.date}>
                    {e.startDate} - {e.endDate}
                  </Text>
                </View>
                {e.bullets.filter(Boolean).map((b, i) => (
                  <Text key={i} style={styles.bullet}>
                    • {b}
                  </Text>
                ))}
              </View>
            ))}
          </View>
        )}

        {education.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Pendidikan</Text>
            {education.map((ed) => (
              <View key={ed.id} style={styles.row}>
                <Text>
                  <Text style={styles.bold}>{ed.degree}</Text>
                  {ed.field ? `, ${ed.field}` : ""} - {ed.school}
                </Text>
                <Text style={styles.date}>
                  {ed.startDate} - {ed.endDate}
                </Text>
              </View>
            ))}
          </View>
        )}

        {skills.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Skill</Text>
            <Text>{skills.join(", ")}</Text>
          </View>
        )}

        {projects.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Proyek</Text>
            {projects.map((p) => (
              <Text key={p.id}>
                <Text style={styles.bold}>{p.name}</Text>
                {p.description ? ` - ${p.description}` : ""}
              </Text>
            ))}
          </View>
        )}

        {certifications.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.heading}>Sertifikasi</Text>
            {certifications.map((c) => (
              <Text key={c.id}>
                {c.name} - {c.issuer} ({c.date})
              </Text>
            ))}
          </View>
        )}

        {watermark && <Text style={styles.watermark}>Dibuat dengan Resuma</Text>}
      </Page>
    </Document>
  );
}
