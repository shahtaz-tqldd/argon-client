import React from "react";
import { Link } from "react-router-dom";

const AppLogo = () => {
  return (
    <Link className="flx gap-2" to={"/"}>
      <img src="/logo.webp" className="size-10" />
      <div>
        <h2 className="text-xl font-bold text-primary">
          <span className="text-black/80 dark:text-white/90">Argon</span>{" "}
          Chatbot
        </h2>
      </div>
    </Link>
  );
};

export default AppLogo;
