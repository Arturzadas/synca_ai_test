export const VoteBar = ({ votes, total }: { votes: number; total: number }) => {
  const percent = total > 0 ? (votes / total) * 100 : 0;
  return (
    <div className="w-full bg-gray-200 h-4 rounded">
      <div
        className="bg-green-500 h-4 rounded"
        style={{ width: `${percent}%` }}
      />
    </div>
  );
};
