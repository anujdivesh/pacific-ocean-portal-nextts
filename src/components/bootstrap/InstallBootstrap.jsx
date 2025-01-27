"use client"; // for client side rendering
import {useEffect} from 'react';
import "bootstrap/dist/css/bootstrap.min.css"; // Import bootstrap CSS

const InstallBootstrap = () => {
    useEffect(() => {
        require("bootstrap/dist/js/bootstrap.bundle.min.js");
      }, []);
    return (
    <></>
    )
}
export default InstallBootstrap