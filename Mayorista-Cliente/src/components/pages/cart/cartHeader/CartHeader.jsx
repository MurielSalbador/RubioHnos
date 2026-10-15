import { Link } from "react-router-dom";
import { FaArrowLeft } from "react-icons/fa";
import Cart from "../Cart/Cart.jsx";
import "../Cart/ProductCard.css";
import "../Cart/ProductList.css";
import styles from "./CartHeader.module.css";

const CartHeader = () => {
  return (
    <main className={`page-shell ${styles.main}`}>
      <div className={styles.container}>
        <Link to="/shop" className={styles.back}>
          <FaArrowLeft /> Seguir comprando
        </Link>
        <h1 className={styles.pageTitle}>Mi carrito</h1>
        <Cart />
      </div>
    </main>
  );
};

export default CartHeader;
