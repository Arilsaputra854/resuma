import type { Resume, ResumeSections } from "@/types";

export function emptySections(): ResumeSections {
  return {
    contact: {
      fullName: "",
      email: "",
      phone: "",
      location: "",
      website: "",
      linkedin: "",
    },
    summary: "",
    experience: [],
    education: [],
    skills: [],
    projects: [],
    certifications: [],
  };
}

export function newResume(uid: string, id: string): Resume {
  const now = Date.now();
  return {
    id,
    uid,
    title: "CV Tanpa Judul",
    template: "minimal",
    sections: emptySections(),
    createdAt: now,
    updatedAt: now,
  };
}

export function uid(): string {
  return Math.random().toString(36).slice(2, 10);
}
