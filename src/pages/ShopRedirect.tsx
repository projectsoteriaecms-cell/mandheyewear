import { useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";

const ShopRedirect = () => {
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    // Map old paths to new /shop paths
    if (location.pathname === "/eye-care") {
      navigate("/shop?category=services", { replace: true });
    } else {
      // /eyewear with any existing query params
      navigate(`/shop${location.search}`, { replace: true });
    }
  }, [navigate, location]);

  return null;
};

export default ShopRedirect;
