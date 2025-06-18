import { useNavigate } from 'react-router-dom';

const useProductNavigation = () => {
  const navigate = useNavigate();

  const goToProductDetail = (id) => {
    navigate(`/product/${id}`);
  };

  return { goToProductDetail };
};

export default useProductNavigation;
