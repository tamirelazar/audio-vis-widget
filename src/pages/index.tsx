import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

const HomeRedirect = () => {
  const navigate = useNavigate();

  useEffect(() => {
    navigate("/audio-vis2");
  }, [navigate]);

  return null; // Or you can place a loading indicator here
};

export default HomeRedirect;
