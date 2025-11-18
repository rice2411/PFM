import Overview from "@/components/overview";
import Table from "@/components/table";
import GmailConnect from "@/components/gmail-connect";

export default function Home() {
  return (
    <>
      <Overview />
      <GmailConnect />
      <Table />
    </>
  );
}
