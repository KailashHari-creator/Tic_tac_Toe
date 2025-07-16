const ResultBanner = ({ result, yourID }) => {
  if (!result) return null;

  let message = '';
  if (result === 'draw') message = "It's a Draw!";
  else if (result === yourID) message = "🎉 You Won!";
  else message = "😞 You Lost!";

  return (
    <div className="result-banner">
      <h2>{message}</h2>
    </div>
  );
};

export default ResultBanner;
