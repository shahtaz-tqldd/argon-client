import React from "react";
import { Link } from "react-router-dom";

const AppLogo = () => {
  return (
    <Link className="flx gap-2" to={"/"}>
      <img src="/logo.webp" className="size-10" />
      <h2 className="text-xl font-bold text-primary">Argon Chatbot</h2>
    </Link>
  );
};

export default AppLogo;
