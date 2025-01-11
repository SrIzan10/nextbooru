import UploadPage from "@/components/app/UploadPage/UploadPage";

export default function Page() {
  if (process.env.DISABLE_UPLOADS === 'true') {
    return <h2>Uploads are disabled in this instance.</h2>;
  }
  return <UploadPage />;
}
