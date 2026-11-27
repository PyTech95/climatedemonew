// Things every admin screen uses: who is signed in, and the page header.
import { createContext, useContext } from "react";

export const AuthCtx = createContext(null);
export const useAuth = () => useContext(AuthCtx); // { admin, isSuper }

export function PageHead({ title, children }) {
  return (
    <div className="adm-top">
      <h1>{title}</h1>
      <div className="actions">{children}</div>
    </div>
  );
}
