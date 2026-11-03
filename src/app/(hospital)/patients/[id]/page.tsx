import PatientDetail from "./PatientDetail";

export const metadata = {
  title: "Patient record | Healix",
};

export default async function PatientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  return <PatientDetail patientId={id} />;
}
