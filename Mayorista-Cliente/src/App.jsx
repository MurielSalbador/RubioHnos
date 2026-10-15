import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React, { useEffect, lazy as reactLazy, Suspense } from "react";

// Si se publica una versión nueva mientras alguien tiene la página abierta,
// los archivos viejos ya no existen: recargamos una vez en vez de quedar en blanco.
const lazy = (factory) =>
  reactLazy(() =>
    factory().catch((error) => {
      const key = "chunk-reload";
      if (!sessionStorage.getItem(key)) {
        sessionStorage.setItem(key, "1");
        window.location.reload();
        return new Promise(() => {});
      }
      throw error;
    })
  );
import { checkTokenExpiration } from "./utils/auth";

//pagina principal
import Home from "./components/pages/Home/Home.jsx";

//login
const Login = lazy(() => import("./components/pages/income/login/Login.jsx"));

//register
const Register = lazy(() => import("./components/pages/income/register/Register.jsx"));

//tienda de productos
const Shop = lazy(() => import("./components/pages/shop/Shop.jsx"));

//carrito con localstorage para que se guarde lo elegido
const CartHeader = lazy(() => import("./components/pages/cart/cartHeader/CartHeader.jsx"));

//para mandar un email
const ContactForm = lazy(() => import("./components/pages/contact/ContactForm.jsx"));

//esto es para mandar el mensaje
const FinishCart = lazy(() => import("./components/pages/cart/finishCart/FinishCart.jsx"));

//crud
const ProductList = lazy(() => import("./components/pages/addProducts/addProductsList.jsx"));

//protected ProductList
import ProtectedRoute from "./components/protectedRoute/ProtectedRoute.jsx";

//ordenes guardadas
const MyOrders = lazy(() => import("./components/pages/orders/myOrders/MyOrders.jsx"));

//mostras pedidos
const Orders = lazy(() => import("./components/pages/orders/OrdersClients/Orders.jsx"));

// nueva página de detalle de producto
const ProductDetail = lazy(() => import("./components/pages/shop/onlyPage/ProductDetail.jsx"));

//user management
const UserManagement = lazy(() => import("./components/pages/userManagement/UserManagement.jsx"));

//not found
const NotFound = lazy(() => import("./components/pages/notFound/NotFound.jsx"));

//passwordReset
const PwReset = lazy(() => import("./components/pages/income/login/resetPassword/PasswordReset.jsx"));

//forgotPassword
const ForgotPassword = lazy(() => import("./components/pages/income/login/forgotPassword/ForgotPassword.jsx"));

//marca page
const MarcaPage = lazy(() => import("./components/pages/Home/MarcaPage/MarcaPage.jsx"));

//categories carousel
const CategoriesCarousel = lazy(() => import("./components/pages/Home/categoriesCarousel/CategoriesCarousel.jsx"));

//gastos
const ExpenseManagement = lazy(() => import("./components/pages/ExpenseManagement/ExpenseManagement.jsx"));

//favorites
const FavoritesPage = lazy(() => import("./components/pages/favorites/FavoritesPage.jsx"));

// barra de navegación inferior (celulares)
import BottomNav from "./components/BottomNav/BottomNav.jsx";

//css
import "./App.css";

//aos
import AOS from "aos";
import "aos/dist/aos.css";

//tostify
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

// lenis
import Lenis from 'lenis'
import 'lenis/dist/lenis.css'

function App() {
  useEffect(() => {
    const lenis = new Lenis({
      duration: 1.2,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
      orientation: 'vertical',
      gestureOrientation: 'vertical',
      smoothWheel: true,
      wheelMultiplier: 1,
      smoothTouch: false,
      touchMultiplier: 2,
      infinite: false,
    })

    function raf(time) {
      lenis.raf(time)
      requestAnimationFrame(raf)
    }

    requestAnimationFrame(raf)

    return () => {
      lenis.destroy()
    }
  }, []);

  useEffect(() => {
    AOS.init({
      duration: 800,
      once: true,
    });
  }, []);

  useEffect(() => {
    sessionStorage.removeItem("chunk-reload");
    checkTokenExpiration();
  }, []);

  return (
    <Router>
      <div className="App">
        <Suspense fallback={<div className="route-loader"><span /></div>}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/product/:id" element={<ProductDetail />} />
          <Route path="/contact" element={<ContactForm />} />
          <Route path="/cart" element={<CartHeader />} />
          <Route path="/finish" element={<FinishCart />} />
          <Route path="/allOrders" element={<Orders />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          <Route path="/reset-password/:token" element={<PwReset />} />
          <Route
            path="/expenses"
            element={
              <ProtectedRoute requiredAdmin={true}>
                <ExpenseManagement />
              </ProtectedRoute>
            }
          />
          <Route
            path="/addProducts"
            element={
              <ProtectedRoute requiredAdmin={true}>
                <ProductList />
              </ProtectedRoute>
            }
          />
          <Route path="/myOrders" element={<MyOrders />} />
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          <Route path="/httpClients" element={<UserManagement />} />
          <Route path="/categoriesCarousel" element={<CategoriesCarousel />} />
          <Route path="/marca/:slug" element={<MarcaPage />} />
          <Route path="/favorites" element={<FavoritesPage />} />
          {/* Ruta 404: si no se encuentra ninguna coincidencia */}
          <Route path="*" element={<NotFound />} />
        </Routes>
        </Suspense>

        <BottomNav />
        <ToastContainer position="top-center" autoClose={2000} newestOnTop limit={3} />
      </div>
    </Router>
  );
}

export default App;
