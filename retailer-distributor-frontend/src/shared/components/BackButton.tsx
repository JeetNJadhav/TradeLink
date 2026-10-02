import { useLocation, useNavigate } from "react-router-dom";

interface BackButtonProps {
  // Where to go when there is no earlier page in this app to return to.
  fallback: string;
}

const BackButton = ({ fallback }: BackButtonProps) => {
  const navigate = useNavigate();
  const location = useLocation();

  // "default" is the key of the first entry: the page was opened directly,
  // so there is nothing in this app to go back to.
  const goBack = () => {
    if (location.key === "default") navigate(fallback);
    else navigate(-1);
  };

  return (
    <button className="back-button" type="button" onClick={goBack}>
      ← Back
    </button>
  );
};

export default BackButton;
