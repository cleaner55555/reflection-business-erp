import type { Enrollment } from './types'

export const INITIAL: Enrollment[] = [
  { id: '1', applicantName: 'Luka Petrović', jmbg: '1505998712345', email: 'luka.petrovic@email.com', phone: '+381 63 123 4567', program: 'Elektrotehnika', studyLevel: 'bachelor', status: 'enrolled', applicationDate: '2024-06-01', entranceExamScore: 87, highSchoolGPA: 4.82, previousSchool: 'Treća beogradska gimnazija', city: 'Beograd', documentsComplete: true, interviewDate: '2024-06-15', notes: 'Izvanredan uspeh na matematici' },
  { id: '2', applicantName: 'Ana Stanković', jmbg: '2308996789012', email: 'ana.stankovic@email.com', phone: '+381 64 987 6543', program: 'Medicina', studyLevel: 'bachelor', status: 'under_review', applicationDate: '2024-06-05', entranceExamScore: 91, highSchoolGPA: 5.00, previousSchool: 'Medicinska škola "Draginja Stanković"', city: 'Niš', documentsComplete: true, interviewDate: '2024-06-20', notes: 'Najbolji kandidat — 5.00 iz srednje škole' },
  { id: '3', applicantName: 'Marko Jovanović', jmbg: '1203995123456', email: 'marko.j@email.com', phone: '+381 65 555 1234', program: 'Mašinstvo', studyLevel: 'bachelor', status: 'documents_submitted', applicationDate: '2024-06-08', entranceExamScore: 0, highSchoolGPA: 4.35, previousSchool: 'Tehnička škola "Rade Končar"', city: 'Novi Sad', documentsComplete: true, interviewDate: '', notes: 'Čeka se prijemni ispit' },
  { id: '4', applicantName: 'Jelena Nikolić', jmbg: '0712000890123', email: 'jelena.n@email.com', phone: '+381 62 444 8899', program: 'Ekonomija', studyLevel: 'master', status: 'accepted', applicationDate: '2024-05-28', entranceExamScore: 0, highSchoolGPA: 9.12, previousSchool: 'Fakultet ekonomskih nauka — Beograd', city: 'Beograd', documentsComplete: true, interviewDate: '2024-06-10', notes: 'Prosek ocena na osnovnim studijama 9.12' },
  { id: '5', applicantName: 'Nikola Milić', jmbg: '2511998567890', email: 'nikola.m@email.com', phone: '+381 61 777 3344', program: 'Informatika', studyLevel: 'bachelor', status: 'pending', applicationDate: '2024-06-10', entranceExamScore: 0, highSchoolGPA: 4.15, previousSchool: 'Gimnazija "Svetozar Marković"', city: 'Kragujevac', documentsComplete: false, interviewDate: '', notes: 'Nedostaju prevodi diploma' },
  { id: '6', applicantName: 'Sara Đorđević', jmbg: '1804997456789', email: 'sara.dj@email.com', phone: '+381 60 222 7766', program: 'Arhitektura', studyLevel: 'bachelor', status: 'under_review', applicationDate: '2024-06-03', entranceExamScore: 78, highSchoolGPA: 4.68, previousSchool: 'Škola za dizajn — Beograd', city: 'Beograd', documentsComplete: true, interviewDate: '2024-06-18', notes: 'Portfolio veoma dobar — prednost na intervjuu' },
  { id: '7', applicantName: 'Ivan Savić', jmbg: '0307999345678', email: 'ivan.s@email.com', phone: '+381 66 888 1122', program: 'Pravo', studyLevel: 'bachelor', status: 'rejected', applicationDate: '2024-06-02', entranceExamScore: 42, highSchoolGPA: 3.45, previousSchool: 'Pravna škola "Ivo Andrić"', city: 'Subotica', documentsComplete: true, interviewDate: '2024-06-12', notes: 'Nedovoljan rezultat na prijemnom ispitu (min. 50)' },
  { id: '8', applicantName: 'Maja Stojanović', jmbg: '2210998678901', email: 'maja.s@email.com', phone: '+381 63 111 4455', program: 'Psihologija', studyLevel: 'bachelor', status: 'documents_submitted', applicationDate: '2024-06-09', entranceExamScore: 0, highSchoolGPA: 4.55, previousSchool: 'Gimnazija "Laza Kostić"', city: 'Novi Sad', documentsComplete: true, interviewDate: '', notes: '' },
  { id: '9', applicantName: 'Prof. Dragan Stanković', jmbg: '1508750123456', email: 'dragan.s@university.rs', phone: '+381 64 999 8877', program: 'Kiberneticika', studyLevel: 'phd', status: 'accepted', applicationDate: '2024-05-15', entranceExamScore: 0, highSchoolGPA: 0, previousSchool: 'ETF Beograd — master', city: 'Beograd', documentsComplete: true, interviewDate: '2024-06-01', notes: 'Dosadašnje radove: 12 publikacija, H-index: 5' },
  { id: '10', applicantName: 'Milica Marković', jmbg: '0912999234567', email: 'milica.m@email.com', phone: '+381 62 333 6688', program: 'Farmacija', studyLevel: 'bachelor', status: 'pending', applicationDate: '2024-06-12', entranceExamScore: 0, highSchoolGPA: 4.20, previousSchool: 'Hemijsko-tehnološka škola', city: 'Zrenjanin', documentsComplete: false, interviewDate: '', notes: 'Fali lična karta i svedočanstva' },
]

export const STATUSES: Record<string, { color: string; label: string }> = {
  pending: { color: 'bg-gray-100 text-gray-800', label: 'Na čekanju' },
  documents_submitted: { color: 'bg-blue-100 text-blue-800', label: 'Dokumenta' },
  under_review: { color: 'bg-amber-100 text-amber-800', label: 'U proceduri' },
  accepted: { color: 'bg-emerald-100 text-emerald-800', label: 'Prihvaćen' },
  rejected: { color: 'bg-red-100 text-red-800', label: 'Odbijen' },
  enrolled: { color: 'bg-teal-100 text-teal-800', label: 'Upisan' },
}

export const LEVELS: Record<string, { label: string }> = {
  bachelor: { label: 'Osnovne' },
  master: { label: 'Master' },
  phd: { label: 'Doktorske' },
  specialist: { label: 'Specijalističke' },
}
