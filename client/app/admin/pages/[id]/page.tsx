import CustomizerPage from "@/features/pages/components/CustomizerPage";

export default function page({ params }: { params: Promise<{ id: string }> }) {
  return <CustomizerPage params={params} />
}