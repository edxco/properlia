export const PropertyCardSkeleton = () => (
  <div
    className="flex flex-col bg-white rounded-2xl overflow-hidden h-full animate-pulse"
    style={{
      border: "1px solid #EAEAE3",
      boxShadow: "0 1px 2px rgba(20,30,50,.06), 0 14px 30px -22px rgba(20,30,50,.38)",
    }}
  >
    <div style={{ height: 200, background: "#EAEAE3" }} />

    <div className="flex flex-col flex-1" style={{ padding: "18px 18px 16px" }}>
      <div className="h-6 w-2/3 rounded" style={{ background: "#EAEAE3" }} />

      <div className="flex items-start gap-2 mt-4">
        <div className="h-[17px] w-[17px] rounded-full shrink-0" style={{ background: "#EAEAE3" }} />
        <div className="flex flex-col gap-2 flex-1">
          <div className="h-3.5 w-1/2 rounded" style={{ background: "#EAEAE3" }} />
          <div className="h-3 w-1/3 rounded" style={{ background: "#EAEAE3" }} />
        </div>
      </div>
    </div>
  </div>
);
