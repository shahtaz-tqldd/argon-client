import React from "react";
import { Link } from "react-router-dom";

const AppLogo = () => {
  return (
    <Link className="flx gap-2" to={"/"}>
      <img src="/logo.webp" className="size-12" />
      <div>
        <h2 className="text-xl font-black text-primary">Argon </h2>
        <p className="text-xs font-medium text-slate-500 dark:text-white/75">
          AI Chatbot
        </p>
      </div>
    </Link>
  );
};

export default AppLogo;
