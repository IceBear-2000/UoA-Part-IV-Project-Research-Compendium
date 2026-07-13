import { WorksheetGeneratorView } from "./_components/WorksheetGeneratorView";

export default function WorksheetGeneratorPage() {
  return (
    <>
      <div className="mb-7">
        <h1 className="text-[27px] font-bold tracking-tight">AI worksheet generator ✨</h1>
        <p className="mt-1 text-[14.5px] text-muted">
          Generate a worksheet, then review before it goes live
        </p>
      </div>

      <WorksheetGeneratorView />
    </>
  );
}
