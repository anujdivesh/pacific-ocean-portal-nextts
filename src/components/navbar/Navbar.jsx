"use client"; // Client-side rendering

// Libraries
import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
// React Bootstrap
import '@/components/css/modal.css'
import Button from "react-bootstrap/Button";
import Navbar from "react-bootstrap/Navbar";
import Modal from "react-bootstrap/Modal";
import Form from "react-bootstrap/Form";
// Components
import SideBar from "../sidebar/sidebar";
// CSS
import "@/components/navbar/navbar.css";
import "@/components/navbar/sidebar.css";
import "@/components/css/app.css";
import "@/components/css/map.css";
// Redux
import { useAppSelector, useAppDispatch } from "@/app/GlobalRedux/hooks";
import { hideoffCanvas } from "@/app/GlobalRedux/Features/offcanvas/offcanvasSlice";
import { logout as logoutAction, login as loginAction,updateCountry,updateToken } from "@/app/GlobalRedux/Features/auth/authSlice"; // Import the logout action
// Server Actions
import { logout } from "@/app/login/action"; // Import the server-side logout action
import { login } from "@/app/login/action"; // Import the login server action

function Navigationbar({ topContent, mainContent }) {
  const pathname = usePathname();
  const isLoggedin = useAppSelector((state) => state.auth.isLoggedin); // Get login state from Redux
  const dispatch = useAppDispatch();
  const [showLoginModal, setShowLoginModal] = useState(false); // State for controlling the login modal
  const [loginState, setLoginState] = useState({ errors: {}, success: false, message: "" }); // State for login form
  const [loading, setLoading] = useState(false); // Add a loading state

  // Fetch session on component mount
  useEffect(() => {
    const fetchSession = async () => {
      try {
        const response = await fetch("/oceanportal/api/session");
        const data = await response.json();
       // console.log(data)
        if (data.isLoggedin) {
          dispatch(loginAction()); // Update Redux store
          dispatch(updateCountry(data.countryId))
          dispatch(updateToken(data.userId))
        } else {
          dispatch(logoutAction()); // Update Redux store
          dispatch(updateCountry(null))
          dispatch(updateToken(null))
        }
      } catch (error) {
        console.error("Failed to fetch session:", error);
        dispatch(logoutAction()); // Fallback to logout state
      }
    };

    fetchSession();
  }, [dispatch]);

  // Handle body class changes based on pathname
  useEffect(() => {
    if (pathname === "/") {
      document.body.classList.remove("no-sidebar", "navt2");
      document.body.classList.add("navt");
      dispatch(hideoffCanvas());
    } else {
      document.body.classList.add("no-sidebar", "navt2");
      document.body.classList.remove("navt");
      dispatch(hideoffCanvas());
    }
  }, [pathname]);

  // Toggle sidebar
  const activateLasers = (e) => {
    e.preventDefault();
    document.body.classList.toggle("sb-sidenav-toggled");
    localStorage.setItem("sb|sidebar-toggle", document.body.classList.contains("sb-sidenav-toggled"));
    e.currentTarget.blur();
  };

  // Handle logout
  const handleLogout = async () => {
    const response = await logout(); // Call the server-side logout action
    if (response.success) {
      dispatch(logoutAction()); // Dispatch the Redux logout action
      dispatch(updateCountry(null))
      dispatch(updateToken(null))
      // window.location.href = "/login"; // Redirect to the login page
    }
  };

  // Handle login form submission
  const handleLoginSubmit = async (e) => {
    e.preventDefault(); // Prevent the form from reloading the page
    setLoading(true); // Set loading to true when the login starts
    
    const formData = new FormData(e.target); // Get form data
    const result = await login(null, formData); // Call the server-side login action
    console.log(result)
    setLoginState(result); // Update login state
    setLoading(false); // Set loading to false once login is done
    if (result.success) {
      dispatch(loginAction()); // Update Redux store
      dispatch(updateCountry(result.countryId))
      dispatch(updateToken(result.token));
      setShowLoginModal(false); // Close the modal
    }
  };

  return (
    <div className="d-flex" id="wrapper">
      <div id="hidden">
        <div id="sidebar-wrapper" style={{ backgroundColor: "#FFF5EE" }}>
          <div
            className="sidebar-heading"
            style={{ paddingBottom: 13, color: "#FFF", backgroundColor: "#3f51b5" }}
          >
            Pacific Ocean Portal
          </div>
          <div className="list-group list-group-flush">
            <div className="col-2-5">
              <SideBar />
            </div>
          </div>
        </div>
      </div>
      <div id="page-content-wrapper">
        <nav className="navbar navbar-expand-lg navbar-dark" style={{ backgroundColor: "#3f51b5" }}>
          <Navbar.Brand id="navtitle" style={{ paddingLeft: 20, fontSize: 19.2 }}>
            Pacific Ocean Portal
          </Navbar.Brand>
          <div className="container-fluid">
            <button
              className="btn btn-primary"
              style={{ backgroundColor: "#3f51b5" }}
              id="sidebarToggle"
              onClick={activateLasers}
            >
              <span className="navbar-toggler-icon"></span>
            </button>
            <button
              className="navbar-toggler"
              type="button"
              data-bs-toggle="collapse"
              data-bs-target="#navbarSupportedContent"
              aria-controls="navbarSupportedContent"
              aria-expanded="false"
              aria-label="Toggle navigation"
            >
              <span className="navbar-toggler-icon"></span>
            </button>

            <div className="collapse navbar-collapse" id="navbarSupportedContent">
              <ul className="navbar-nav ms-auto mt-2 mt-lg-0">
                <li className="nav-item active">
                  <Link className={pathname == "/" ? "active-nav nav-link" : "nav-link"} href="/">
                    Explorer
                  </Link>
                </li>
               
                <li className="nav-item">
                  <Link
                    className={pathname == "/library" ? "active-nav nav-link" : "nav-link"}
                    href="/library"
                  >
                    Library
                  </Link>
                </li>
                <Link
                  className={pathname == "/experts" ? "active-nav nav-link" : "nav-link"}
                  href="/experts"
                >
                  Experts
                </Link>
                <li className="nav-item">
                  <Link
                    className={pathname == "/aboutus" ? "active-nav nav-link" : "nav-link"}
                    href="/aboutus"
                  >
                    About us
                  </Link>
                </li>
               
                {isLoggedin ? (
                  <>
                   <li className="nav-item active">
                   <Link className={pathname == "/dashboard" ? "active-nav nav-link" : "nav-link"} href="/dashboard">
                     Dashboard
                   </Link>
                 </li>
                  <li className="nav-item">
                    <Button variant="success" onClick={handleLogout}>
                      Logout
                    </Button>
                  </li>
                  </>
                ) : (
                  // Login Dropdown
                  <li className="nav-item dropdown">
                    <a
                      className="nav-link dropdown-toggle"
                      id="navbarDropdown"
                      href="#"
                      role="button"
                      data-bs-toggle="dropdown"
                      aria-haspopup="true"
                      aria-expanded="false"
                    >
                      Login
                    </a>
                    <div
                      className="dropdown-menu dropdown-menu-end"
                      aria-labelledby="navbarDropdown"
                      style={{ zIndex: 3000 }}
                    >
                      <Button
                        variant="link"
                        className="dropdown-item"
                        onClick={() => setShowLoginModal(true)}
                      >
                        Login
                      </Button>
                      <Link className="dropdown-item" href="/signup">
                        Signup
                      </Link>
                    </div>
                  </li>
                )}
              </ul>
            </div>
          </div>
        </nav>
        <div className="container-fluid">{mainContent}</div>
      </div>

      {/* Login Modal */}
      <Modal show={showLoginModal} onHide={() => setShowLoginModal(false)} centered className="custom-modal">
        <Modal.Header closeButton>
          <Modal.Title>Login</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={handleLoginSubmit}>
            <Form.Group controlId="username">
              <Form.Label>Username</Form.Label>
              <Form.Control type="text" name="username" required />
              {loginState.errors?.username && (
                <Form.Text className="text-danger">{loginState.errors.username.join(", ")}</Form.Text>
              )}
            </Form.Group>
            <Form.Group controlId="password">
              <Form.Label>Password</Form.Label>
              <Form.Control type="password" name="password" required />
              {loginState.errors?.password && (
                <Form.Text className="text-danger">{loginState.errors.password.join(", ")}</Form.Text>
              )}
            </Form.Group>
            {loginState.message && (
              <Form.Text className={loginState.success ? "text-success" : "text-danger"}>
                {loginState.message}
              </Form.Text>
            )}
            <Button variant="primary" type="submit" className="mt-3" disabled={loading}>
              {loading ? (
               <><span className="ms-2">Logging in...</span>  <span className="spinner-border spinner-border-sm" role="status" aria-hidden="true"></span>
               </>
              ) : (
                "Login"
              )}
            </Button>
          </Form>
        </Modal.Body>
      </Modal>
    </div>
  );
}

export default Navigationbar;
